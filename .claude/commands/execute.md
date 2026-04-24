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

**Marker coupling:** The literal dispatch markers in the Announce lines (`[dispatch] role=task-implementer task=N` and `[dispatch] role=spec-reviewer task=N`) are structural tokens. The output-compaction Stop hook preserves any line containing `[dispatch] role=` so user-visible compaction never rewrites them (see `.claude/references/hook-ordering.md`). Note: enforcement itself does NOT scan these announcements — the marker file is the single source of truth (see Step 3.5).

**Enforcement (marker-only):** The PostToolUse hook `.claude/hooks/spec-reviewer-enforce.sh` reads ONLY the marker file at `.claude/.last-impl-task`. There is no transcript-scanning fallback — the hook's behavior is deterministic across runtimes regardless of whether `CLAUDE_TRANSCRIPT_PATH` is set. Outcomes:
- Marker absent / empty → allow (no active pair)
- Marker `implementer:<epoch>` within 600s → BLOCK (exit 2)
- Marker `implementer:<epoch>` older than 600s → allow with stale warning to stderr
- Marker `reviewer:<epoch>` → allow (pair complete)
- Any malformed marker → BLOCK with a fix-up message

### Step 3.5: Marker File Discipline

To make the enforcement hook deterministic, `/execute` maintains a marker file at `.claude/.last-impl-task`.

**Format:** `<state>:<epoch>` where `<state>` is one of `implementer` or `reviewer`, and `<epoch>` is the current Unix epoch in seconds (`date +%s`).

- After dispatching a task-implementer (Step 3a), write `implementer:$(date +%s)` via `.claude/hooks/spec-reviewer-marker.sh write implementer`.
- After a spec-reviewer returns PASS (Step 3b), write `reviewer:$(date +%s)` via `.claude/hooks/spec-reviewer-marker.sh write reviewer`.
- If the marker's state is `implementer` when the hook fires, the hook blocks further tool use.
- **Staleness window: 600 seconds (10 minutes).** If the marker's epoch is older than 600s, the hook treats it as stale and does NOT block (exit 0 with an informational warning). The window is intentionally short — long-running subagents rarely exceed it. If a legitimate run does exceed 10 minutes, clear the marker manually with `.claude/hooks/spec-reviewer-marker.sh clear` and retry.
- The marker file is gitignored; it exists only for the duration of an `/execute` run and is deleted on successful completion (Step 5) via `.claude/hooks/spec-reviewer-marker.sh clear`.

### Step 4: Validation

After all tasks are complete:
1. Run the project's full test suite
2. Run lint/type-check if available
3. Verify the application starts without errors

### Step 5: Completion Report

Before emitting the report, tear down the marker file so it cannot poison a later unrelated session: run `.claude/hooks/spec-reviewer-marker.sh clear` when `/execute` completes successfully (all tasks passed) or when the run is explicitly aborted. The helper is a no-op if the file is absent. (The enforcement hook also treats markers older than 10 minutes as stale, so a missed teardown degrades gracefully — but staleness should be the exception, not the norm.)

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
