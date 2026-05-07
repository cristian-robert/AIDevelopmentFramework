# /plan-feature — Feature Implementation Planner

Creates a detailed implementation plan. Plan must pass the "no prior knowledge" test — an engineer unfamiliar with the codebase can implement using only the plan.

**Args:** `$ARGUMENTS` = feature description OR GitHub issue number (`#42`).

**Output:** one line per `_shared/output-contract.md`.

## Phases (load on demand)

| # | Phase | Reference | Load condition |
|---|-------|-----------|----------------|
| 1 | Feature understanding | `plan-feature/01-understanding.md` | always |
| 1.5 | Deliverable-type routing | `plan-feature/015-deliverable-routing.md` | always (in-dev project) |
| 2 | Codebase intelligence (3 parallel subagents) | `plan-feature/02-codebase-intel.md` | always |
| 3+4 | External research + strategic thinking | `plan-feature/03-research-and-strategy.md` | always |
| 5 | Plan generation (writes to `docs/plans/<file>.md`) | `plan-feature/05-plan-gen.md` | always |
| 6 | GitHub issue create/comment | `plan-feature/06-issue.md` | always |
| 7 | Save + context-reset gate + one-line output | `plan-feature/07-save-and-gate.md` | always |

## Invariants

- Phase 2 agent models: structure→haiku, dependencies→sonnet, testing→sonnet. Never opus for these (Tier 1/2 reads).
- Plan template (`.claude/references/plan-template.md`) requires per-task `size:` and `model:` fields.
- Phase 1.5 routing decision lives in plan frontmatter so `/execute` Step 2.5 can read it instead of re-classifying.
- Context-reset gate logic is shared with `/execute` Step 0 (`_shared/context-reset-gate.md`).
