# /plan-project — PRD to GitHub Issues Decomposer

Decomposes a PRD into GitHub milestones and issues.

**Args:** `$ARGUMENTS` = optional PRD path (default `docs/plans/PRD.md`).

**Prerequisites:** PRD exists; `gh` authenticated; repo has GitHub remote.

**Output:** one line per `_shared/output-contract.md`.

## Phases (load on demand)

| # | Phase | Reference | Load condition |
|---|-------|-----------|----------------|
| 1–3 | Parse PRD + decompose + order | `plan-project/01-decompose.md` | always |
| 4 | Present for review (writes to `docs/plans/proposed-issues.md`, asks blocker) | inline | always |
| 5 | Create in GitHub + KB integration | `plan-project/05-create-and-link.md` | always (KB step skipped if off) |
| 6 | Roadmap + commit + output | inline | always |

## Phase 4 (Present for review) — inline

Write the full breakdown to `docs/plans/proposed-issues.md` and ask **one** blocker question:

> "Proposed N issues across M milestones in `docs/plans/proposed-issues.md`. Approve, or request changes?"

Do not echo the breakdown to the terminal.

## Phase 6 (Roadmap + commit + output) — inline

Save `docs/plans/roadmap.md` (milestones, issue list, critical path, parallel tracks). Commit:

```bash
git add docs/plans/roadmap.md docs/plans/proposed-issues.md
git commit -m "docs: add project roadmap with GitHub issues"
```

## Output (one line)

```
Created N issues across M milestones · roadmap=docs/plans/roadmap.md · Next: /prime then /plan-feature #<first-issue>
```

## Re-running (PRD updated)

1. Read existing GitHub issues.
2. Diff against updated PRD.
3. Write suggested changes (new/update/close) to `docs/plans/proposed-issues.md`.
4. **Blocker** — ask for approval before executing.
5. Emit one-line summary as above.
