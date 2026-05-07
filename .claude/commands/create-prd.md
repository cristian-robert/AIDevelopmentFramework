# /create-prd — Product Requirements Document Generator

Generate a comprehensive PRD from a product idea. Always starts with brainstorming.

**Args:** `$ARGUMENTS` = optional product idea in brief.

**Output:** one line per `_shared/output-contract.md`.

## Phases (load on demand)

| # | Phase | Reference | Load condition |
|---|-------|-----------|----------------|
| 1 | Brainstorm via `superpowers:brainstorming` | `create-prd/01-brainstorm.md` | always |
| 2 | Generate PRD using `.claude/references/prd-template.md` | inline (just read the template) | always |
| 2.5 | Seed knowledge base | `create-prd/025-kb-seed.md` | KB configured |
| 3 | Save + approval blocker | inline | always |
| 4 | Commit + one-line output | inline | always |

## Phase 2 (Generate PRD) — inline

1. Read `.claude/references/prd-template.md` for structure.
2. Fill in every section based on the brainstorming conversation.
3. Be specific — no placeholder text, no "TBD" sections.
4. User stories: concrete and testable.
5. Implementation phases: ordered by dependency and value.

## Phase 3 (Save + approval blocker) — inline

1. Save full PRD to `docs/plans/PRD.md` (do NOT echo it section-by-section — user reads the file).
2. **Blocker:** "PRD ready at `docs/plans/PRD.md`. Approve or request edits?" — wait for response.
3. On edits, update file and re-prompt. On approval, continue.
4. If KB configured → write seeded wiki files silently per Phase 2.5.

## Phase 4 (Commit + output) — inline

```bash
git add docs/plans/PRD.md
# If KB seeded:
git add <kb-path>/wiki/ <kb-path>/raw/_manifest.md
git commit -m "docs: add PRD and seed project knowledge base"
```

## Output (one line)

```
PRD written to docs/plans/PRD.md (KB seeded: N articles | KB off) · Next: /plan-project
```
