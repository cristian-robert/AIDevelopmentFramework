# /ship — Step 1.4: Auto-Evolve Fallback

`/validate` Phase 6 normally dispatches `/evolve` automatically. If `/validate` was skipped (Step 1 #4 answered "No"), `/evolve` never ran — and the session's learnings would be lost when the user moves on. Run it here as a safety net.

## Detection

- `.claude/.evolve-ran` exists AND its epoch is within the last hour → skip this step (validate just ran it).
- Otherwise dispatch `/evolve` as a subagent now.

## Dispatch

- **Model:** `sonnet` (Tier 6 per `_shared/model-matrix-summary.md`).
- **Type:** `Task (general-purpose)`.
- **Prompt body:** "Run `/evolve` for the changes between `git merge-base main HEAD` and `HEAD`. Follow `.claude/commands/evolve.md` exactly. Stop after Step 7 — do not commit; stage only. Return a one-line summary."
- **On subagent failure:** advisory only. Print one-line warning, continue. The user can re-run `/evolve` manually post-merge.

Delete `.claude/.evolve-ran` after this step regardless of who ran it (the marker exists only to dedupe within a single ship run).
