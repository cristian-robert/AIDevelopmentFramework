# File-Size Guardrail

Context files loaded into every conversation must stay lean. Bloat is silent — once a rule or command grows past its budget the framework spends tokens on detail that should live in a reference loaded on demand.

## Budgets (lines, not bytes)

| File class | Path glob | Soft cap | Hard cap |
|------------|-----------|----------|----------|
| Project root | `CLAUDE.md` | 120 | 150 |
| Rule | `.claude/rules/*.md` | 60 | 80 |
| Command (single-phase) | `.claude/commands/{evolve,execute,validate,setup,ship,prime,kb-*}.md` | 60 | 80 |
| Command (multi-phase ≥5 phases) | `.claude/commands/{start,merge-configs,plan-feature,plan-project,create-prd}.md` | 80 | 100 |
| Reference (per-command step) | `.claude/references/<command>/*.md` | 120 | 200 |
| Reference (shared snippet) | `.claude/references/_shared/*.md` | 80 | 120 |
| Reference (domain detail) | `.claude/references/*.md` | 200 | 300 |

Soft cap = warn. Hard cap = block (treat as a P0 finding that `/evolve` must extract before committing).

## Why these numbers

Current state on the v0.5 compression baseline: largest rule 35 lines, largest command 66 lines, CLAUDE.md 106 lines. Soft caps allow ~2× the current max — room to grow without re-bloating. Hard caps catch true regressions.

## Extraction rules

When a file crosses its soft cap:

1. Identify load-bearing content that already lives ELSEWHERE (a reference file). Replace inline text with a one-line pointer.
2. Identify content that's only relevant in narrow conditions (a specific phase, a specific stack). Extract to `.claude/references/<topic>-detail.md` or a per-command subdirectory; cite from the body with a load condition (see `_shared/load-conditions.md`).
3. Inline mini-steps over 8 lines → move to a per-step reference file under `.claude/references/<command>/`.
4. Never delete content during extraction without an explicit user-requested simplification — extraction relocates, it doesn't drop.

## Enforcement

- `/evolve` Step 2.5 runs `node cli/file-size-check.js` on every invocation. Soft-cap warnings appear in the one-line output as `size-warn=N`. Hard-cap violations block the commit — `/evolve` must extract before it can finish.
- Local checks: `node cli/file-size-check.js` (dry-run, prints table), `node cli/file-size-check.js --json` (machine-readable for hooks).
- CI / hook integration is intentionally out of scope here — this is an LLM-facing guardrail, not a pre-commit gate. The check is fast enough that `/evolve` running it on every pass is sufficient.

## Adjusting the budgets

Open this file and change the table. The numbers are deliberate but not sacred — if a multi-phase command genuinely needs more room, raise the cap and write a one-line justification next to the row. Don't add new file classes without retiring an old one.
