# /kb-ingest — Phase 4: Create Stub + Update Indexes

## Stub

Read `.claude/references/kb-article-template.md` for canonical format. Fallback structure:

```markdown
---
title: <title>
tags: [<tag1>, <tag2>, ...]
status: stub
source: <raw-path>
created: <YYYY-MM-DD>
---

# <title>

## Summary

<One paragraph summarising the source: what it is, what problem it addresses, and why it matters to this project.>

## Key Takeaways

- <Takeaway 1>
- <Takeaway 2>
- <Takeaway 3>

## Related

- <!-- link to related wiki articles once they exist -->
```

## Generating stub content

- **title:** H1, `<title>` tag, or document heading. Clean for readability.
- **tags:** 2–5 descriptive tags. Reuse existing tags from `wiki/_tags.md` where they fit.
- **summary:** One paragraph (3–5 sentences).
- **key takeaways:** 3–7 concrete, actionable insights.

## Slug collisions

If `wiki/<slug>.md` already exists, append numeric suffix: `wiki/<slug>-2.md`, `-3.md`, etc.

## Index updates

**`wiki/_index.md`** — append: `| <slug> | <title> | <tag1>, <tag2> | stub |`

**`wiki/_tags.md`** — for each tag:
- Existing row: append `<slug>` to Articles column (comma-separated).
- New tag: add row `| <tag> | <slug> |`.

## Search index rebuild

```bash
KB_PATH=<kb-path> node cli/kb-search.js index
```

If the command fails (cli/kb-search.js missing), skip silently — content is still saved, just not yet indexed.
