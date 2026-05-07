# /plan-feature — Phase 5: Plan Generation

Read `.claude/references/plan-template.md` and generate a complete plan.

## Requirements (every plan)

- Exact file paths for every file to create or modify
- Complete code in every step (no placeholders)
- Exact terminal commands with expected output for every verification step
- TDD: tests before implementation in every task
- Conventional commit after every task
- GOTCHA warnings for known pitfalls
- Confidence score (1-10) for one-pass success

## Per-task `size:` and `model:` fields

Per `_shared/model-matrix-summary.md`:
- S/M with all files pinned + complete code + no design language → `model: sonnet`
- L/XL OR body says "choose"/"decide"/"design"/"consider trade-offs" / invents new pattern → `model: opus`
- Pure read-only inspection (rare in plans) → `model: haiku`

`/execute` honors the per-task `model:` field; absence triggers matrix-based fallback.
