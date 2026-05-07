# Context-Reset Gate

Used by `/plan-feature` Phase 7c and `/execute` Step 0. Always ask in interactive mode; skip in autonomous.

## Autonomous mode (skip the gate)

Skip if **any** holds:
- Env var `AIDF_AUTONOMOUS=1`
- File `.claude/.autonomous-mode` exists
- The user's original session prompt explicitly opted out (`autonomous`, `don't ask`, `no questions`, `fire and forget`, `auto-execute`)

`/execute` only: also skip if `.claude/.context-fresh-ack` exists with epoch within last 300s. Delete the marker after reading it regardless of value.

## The question (interactive mode)

> Plan ready: `<plan-file>` (size=<S/M/L/XL>, confidence=<N>/10).
>
> Clear context before `/execute`? (recommended for L/XL or after long sessions)
>
> 1. **Yes, clear** — fresh context for execution
> 2. **No, continue here** — execute in this session

Wait for the answer.

## Branches

**No, continue:**
- `/plan-feature` 7c → write `date +%s > .claude/.context-fresh-ack`, then proceed to one-line output (7d).
- `/execute` Step 0 → proceed to Step 1.

**Yes, clear:** print the resume prompt verbatim and stop. Do not emit any other output.

```
Resume prompt — copy after /clear:
──────────────────────────────────────────────────
/prime then /execute <plan-file>

Plan: <plan-file>
Task scope: <issue #N | "<feature description>" | none>
──────────────────────────────────────────────────
```
