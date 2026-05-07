# /validate — Phase 6: Auto-Evolve

If Phases 1–5 returned PASS or PASS-WITH-WARNINGS, dispatch `/evolve` as a subagent **before** the Phase 7 one-line summary. Guarantees session learnings, KB updates, and rule extractions are captured even if the user skips `/evolve` manually.

## Dispatch

- **Model:** `sonnet` (Tier 6).
- **Type:** `Task (general-purpose)`.
- **Prompt body:** "Run `/evolve` for the changes between `git merge-base main HEAD` and `HEAD`. Follow `.claude/commands/evolve.md` exactly. Stop after Step 7 — do not commit; stage only. Return a one-line summary."

## Marker

Write `.claude/.evolve-ran` (containing the current epoch) so `/ship` Step 1.4 fallback knows not to re-run.

## Skip conditions

- Phases 1–5 verdict is FAIL → skip auto-evolve. Evolution off broken code pollutes the wiki with anti-patterns. The user fixes, re-runs `/validate`, and the next pass triggers it.
- Failures inside the evolve subagent are **advisory** — log them in the Phase 7 report; do not block the validate verdict. The user can re-run `/evolve` manually later.
