# /execute — Plan Executor

Executes an implementation plan task by task with TDD discipline.

## Arguments

- `$ARGUMENTS` — path to plan file (auto-detected from current branch if omitted)

## Prerequisites

- A plan file must exist
- If the plan specifies dependencies to install, install them first
- Read the plan's "Mandatory Reading" section before starting

## Process

### Step 1: Load Plan

1. If path provided, read that file
2. If not, search for plan files:
   - `docs/plans/` and `docs/superpowers/plans/`
   - Match against current branch name
   - If multiple found, ask user which one
3. Parse the plan into tasks and steps

### Step 2: Read Mandatory Files

Read every file listed in the plan's "Mandatory Reading" section. This ensures you have the codebase context needed for implementation.

#### Knowledge Base Context (if configured)

Check CLAUDE.md for a `## Knowledge Base` section with a `Path:` value. If configured:

1. Read `<kb-path>/wiki/_index.md` for an overview of available knowledge
2. Extract keywords from the current task description
3. Run: `KB_PATH=<kb-path> node cli/kb-search.js search "<task keywords>"`
4. Read the top 3-5 matching wiki articles in full
5. If working on a specific issue, also search: `KB_PATH=<kb-path> node cli/kb-search.js search "#<issue-number>" --type=feature`

This supplements the plan's mandatory reading with wiki knowledge the plan author may not have included. The search automatically finds relevant concepts, decisions, and feature context.

If no knowledge base configured, skip this step.

### Step 3: Execute Tasks (implementer → reviewer loop, mandatory)

For each task in the plan, dispatch TWO subagents in sequence:

**3a. Task Implementer**
1. Announce: `Starting Task N: [task name] — [dispatch] role=task-implementer task=N`
2. Write the marker so the enforcement hook can see the dispatch in runtimes without transcript access: run `.claude/hooks/spec-reviewer-marker.sh write implementer`
3. Dispatch via superpowers:subagent-driven-development with role `task-implementer`
4. Implementer reads plan task + mandatory files, writes tests first, implements, verifies
5. On implementer return: capture diff (`git diff`) and task exit status

**3b. Spec Reviewer (MANDATORY — DO NOT SKIP)**
1. Announce: `Task N implementer complete — [dispatch] role=spec-reviewer task=N`
2. Dispatch subagent with role `spec-reviewer`, passing:
   - The plan task spec
   - The implementer's diff
   - `.claude/references/spec-reviewer-protocol.md`
3. Reviewer runs the protocol checklist + adversarial questions:
   - "Is the implementer's approach the simplest viable?"
   - "What could be cut without losing acceptance criteria?"
   - "What edge case is missing?"
   - "Does any choice contradict an existing pattern/reference?"
4. Reviewer returns PASS or REQUEST_CHANGES with specific blockers
5. If REQUEST_CHANGES: return to 3a with reviewer output; do NOT proceed to next task
6. If PASS: mark task checkbox done; write the reviewer marker (`.claude/hooks/spec-reviewer-marker.sh write reviewer`); proceed

**Marker coupling:** The hook pairs on the literal dispatch markers shown in the Announce lines above (`[dispatch] role=task-implementer task=N` and `[dispatch] role=spec-reviewer task=N`) — changing the marker format breaks enforcement. The substring `[dispatch] role=` is what the hook anchors on; incidental mentions of `task-implementer` or `spec-reviewer` elsewhere (e.g. inside TodoWrite items) are intentionally ignored.

**Enforcement:** The PostToolUse hook `.claude/hooks/spec-reviewer-enforce.sh` watches TodoWrite/TaskUpdate completions. If an implementer task is marked completed without a paired reviewer dispatch in the preceding N tool calls, the hook prints a warning to stderr and blocks the next tool call. Override only with explicit user confirmation.

### Step 3.5: Marker File Discipline

To make the enforcement hook reliable across sessions and transcript formats, `/execute` maintains a marker file at `.claude/.last-impl-task`.

**Format:** `<state>:<epoch>` where `<state>` is one of `implementer` or `reviewer`, and `<epoch>` is the current Unix epoch in seconds (`date +%s`).

- After dispatching a task-implementer (Step 3a), write `implementer:$(date +%s)` via `.claude/hooks/spec-reviewer-marker.sh write implementer`.
- After a spec-reviewer returns PASS (Step 3b), write `reviewer:$(date +%s)` via `.claude/hooks/spec-reviewer-marker.sh write reviewer`.
- If the marker's state is `implementer` when the hook fires (Step 3 pairing check), the hook blocks further tool use.
- **Staleness rule:** if the marker's epoch is older than 3600 seconds (1 hour), the hook treats it as stale and does NOT block (exit 0 with an informational warning). This prevents an interrupted `/execute` session from poisoning an unrelated later session.
- The marker file is gitignored; it exists only for the duration of an `/execute` run and is deleted on successful completion (Step 5) via `.claude/hooks/spec-reviewer-marker.sh clear`.

### Step 4: Validation

After all tasks are complete:
1. Run the project's full test suite
2. Run lint/type-check if available
3. Verify the application starts without errors

### Step 5: Completion Report

Before emitting the report, tear down the marker file so it cannot poison a later unrelated session: run `.claude/hooks/spec-reviewer-marker.sh clear` when `/execute` completes successfully (all tasks passed) or when the run is explicitly aborted. The helper is a no-op if the file is absent. (The enforcement hook also treats markers older than 1 hour as stale, so a missed teardown degrades gracefully.)

```
=== Execution Complete ===

Plan: [plan file path]
Tasks completed: N/N
Tests passing: all / N failures
Lint: pass / N issues
Type check: pass / N errors

Next steps:
- Run /validate for full verification
- Run /ship when ready to commit and create PR
```

## Error Handling

- If a task fails and cannot be fixed in 3 attempts: stop, report the issue, ask the user
- If the plan has a bug (wrong file path, missing step): fix the plan and continue
- If a dependency is missing: install it and continue
- Never skip a failing test — either fix the code or report the issue
