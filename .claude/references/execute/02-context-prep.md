# /execute — Step 2: Mandatory Reading + KB Context

## Mandatory reading

Read every file listed in the plan's "Mandatory Reading" section. Ensures codebase context for implementation.

## KB context (if configured per `_shared/kb-detect.md`)

1. Read `<kb-path>/wiki/_index.md` for an overview.
2. Extract keywords from the current task description.
3. Run: `KB_PATH=<kb-path> node cli/kb-search.js search "<task keywords>"`.
4. Read the top 3–5 matching wiki articles in full.
5. If working on a specific issue, also: `KB_PATH=<kb-path> node cli/kb-search.js search "#<issue-number>" --type=feature`.

This supplements the plan's mandatory reading with wiki knowledge the plan author may have missed.

If KB is off → skip this step entirely.
