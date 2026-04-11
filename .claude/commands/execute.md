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

### Step 3: Execute Tasks

For each task in the plan:

1. **Announce:** "Starting Task N: [task name]"
2. **Read** all files listed in the task's "Files" section
3. **For each step:**
   - If it's a test step: write the test exactly as specified
   - If it's a verification step: run the exact command, check output matches expected
   - If it's an implementation step: write the code as specified
   - If it's a commit step: stage and commit with the specified message
4. **If a test fails unexpectedly:**
   - Read the error output carefully
   - Fix the implementation (not the test, unless the test has a bug)
   - Re-run the test
   - If stuck after 3 attempts, stop and report the issue
5. **After task completion:** mark the task checkbox as done in the plan file

### Step 4: Validation

After all tasks are complete:
1. Run the project's full test suite
2. Run lint/type-check if available
3. Verify the application starts without errors

### Step 5: Completion Report

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
