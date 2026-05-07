# /execute — Plan Executor

TDD execution of an implementation plan via implementer→reviewer loop.

**Args:** `$ARGUMENTS` = plan file path (auto-detected from current branch if omitted).

**Output:** one line per `_shared/output-contract.md`.

## Phases (load on demand)

| # | Phase | Reference | Load condition |
|---|-------|-----------|----------------|
| 0 | Context-reset gate | `_shared/context-reset-gate.md` | always (skip in autonomous mode per snippet) |
| 1 | Load plan | `execute/01-load-plan.md` | always |
| 2 | Mandatory reading + KB context | `execute/02-context-prep.md` | always |
| 2.5 | Design-artifact branch | `execute/025-design-branch.md` | plan frontmatter `branch: design-artifact \| hybrid` |
| 3 | Implementer→reviewer loop | `execute/03-impl-review-loop.md` | always |
| 3.5 | Marker file discipline | `execute/035-marker-discipline.md` | reference for hook integration (load if marker behavior is unclear) |
| 4 | Validation (sanity check) | `execute/04-validation.md` | always |
| 5 | Completion + one-line output | `execute/05-completion.md` | always |

## Invariants

- Implementer model: per task `model:` frontmatter or model-matrix fallback (`_shared/model-matrix-summary.md`). Never silently downgrade.
- Reviewer model: always `opus`.
- Marker file `.claude/.last-impl-task` is the single source of truth for hook enforcement (no transcript scanning).
- 3 failed attempts on a task → blocker.
- Production-code path skips Step 2.5 entirely — don't load it.
