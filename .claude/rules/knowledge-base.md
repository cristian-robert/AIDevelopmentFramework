---
globs: [".obsidian/**/*.md", "**/wiki/**/*.md", "**/raw/**/*.md", "**/knowledge/**/*.md", "**/_search/**"]
description: Auto-loads when editing knowledge base files. Enforces wiki article format, backlinks, and index consistency.
---

# Knowledge Base Rules

## Skill chain
`/kb-search` (avoid duplicates) → create/update with `.claude/references/kb-article-template.md` → bidirectional backlinks → update `wiki/_index.md` + `wiki/_tags.md` → `KB_PATH=<kb-path> node cli/kb-search.js index` (rebuilds TF-IDF + lean atomically).

## Load-bearing rules
- **Never edit `raw/`** — source-of-truth snapshots, read-only
- Wiki articles are LLM-maintained — prefer `/kb` commands
- Complete frontmatter required (title, tags, created, updated, related)
- Wikilinks: `[[filename-without-extension]]` (Obsidian-compatible)
- Tags: lowercase, hyphenated
- Filenames: slugified titles
- Stubs must be expanded in next `/kb-compile` — never leave indefinitely
- `_*` files are auto-generated — do not manually edit

## Critical checklist
- [ ] Frontmatter complete (all required fields)
- [ ] Backlinks bidirectional
- [ ] `_index.md` + `_tags.md` reflect changes
- [ ] No broken `[[wikilinks]]`
- [ ] Both indexes rebuilt (`node cli/kb-search.js index`)

## Karpathy maintenance
- raw → compile loop exercised (raw → stub → full article)
- Health-check lint pass run (see `/kb-compile` Phase 7)
- Both indexes rebuilt after out-of-band edits

## References
- `.claude/references/kb-article-template.md` — canonical wiki article frontmatter
- `.claude/references/_shared/kb-detect.md` — KB detection + index rebuild snippet
