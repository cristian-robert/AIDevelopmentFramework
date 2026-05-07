# /plan-feature — Phase 7: Save + Context-Reset Gate + Output

## 7a — Save and commit

```bash
git add docs/plans/<plan-file>.md
git commit -m "docs: add implementation plan for <feature>"
```

## 7b — Autonomous-mode check (skip 7c entirely if true)

Per `_shared/context-reset-gate.md` autonomous-mode rules.

## 7c — Context-reset gate (always ask in interactive mode)

Use the question + branches from `_shared/context-reset-gate.md`. On "No" → write `.claude/.context-fresh-ack` (epoch) so `/execute` Step 0 skips re-asking, then go to 7d. On "Yes" → print the resume prompt and stop.

## 7d — Output (one line) — only when continuing in same session

```
Plan written to docs/plans/<plan-file>.md · branch=<production-code|design-artifact|hybrid> · confidence=<N>/10 · Next: /execute docs/plans/<plan-file>.md
```
