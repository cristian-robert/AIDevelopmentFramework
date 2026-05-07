# Global Rules — Detail

## Knowledge Base Integration (full)

When the project's CLAUDE.md has a `## Knowledge Base` section with a `Path:` value, the KB is active.

**Before starting work:**
- Search the KB: `KB_PATH=<path> node cli/kb-search.js search "<keywords>"`
- Read top results — they contain architecture decisions, patterns, and feature context that prevent redundant work and inconsistent implementations.

**After structural changes** (new modules, endpoints, routes, screens, DB tables, components):
- Search for existing articles to update: `KB_PATH=<path> node cli/kb-search.js search "<feature or area>"`
- Update existing wiki articles rather than creating duplicates.
- New article → use template from `.claude/references/kb-article-template.md`.
- Rebuild KB indexes: `KB_PATH=<path> node cli/kb-search.js index` — atomically rebuilds `_search/index.json` AND `_search/lean-index.json`.

**Skip KB** for: trivial changes, typo fixes, config tweaks, dependency bumps.

## Pipeline Discipline (full)

- Non-trivial work → choose Superpowers or Standard mode before starting.
- Plans are mandatory for L/XL tasks → run `/plan-feature` first.
- Run `/validate` before claiming work is done.
- Run `/evolve` after merging to keep the system improving.

## Rule File Budget

- Rule files are indexes, not encyclopedias. Target ≤30 lines, soft cap 50.
- Detail lives in `.claude/references/*-detail.md` or the wiki (when KB configured).
- Every rule file ends with a `## References` block listing `path — when to load`.
- `/evolve` enforces this — rules exceeding 50 lines get overflow extracted on the next run.
