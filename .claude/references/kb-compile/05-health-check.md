# /kb-compile — Phase 5: Health Check

Run structural + content checks across the wiki. Write results to `<KB_PATH>/_search/stats.md` (format below).

## Structural checks

- **Orphaned articles** — no incoming wikilinks, no `related:` entries.
- **Broken wikilinks** — `[[Title]]` references that don't match any article title or alias.
- **Old stubs** — `status: stub` and `created` older than 30 days.
- **Incomplete frontmatter** — missing `title`, `type`, `tags`, or `status`.

## Content checks

- **Potential duplicates** — pairs with very similar titles or high tag overlap.
- **Inconsistencies** — articles that contradict each other on key claims (flag for human review).
- **Stale sources** — `_manifest.md` rows with `status: compiled` and `updated` older than 90 days.
- **Missing Key Takeaways** — compiled articles with no `## Key Takeaways` section.

## Suggestions

- **Merge candidates** — orphan articles that could fold into a more popular related article.
- **Missing concepts** — top 5 frequently-mentioned concepts that lack their own article.
- **Stale articles** — compiled articles not updated in 6+ months whose source domain changes frequently.

## stats.md format

```markdown
# Knowledge Base Health Report

_Generated: <ISO timestamp>_

## Stats

| Metric | Count |
|--------|-------|
| Total articles | N |
| Compiled | N |
| Stubs | N |
| Orphaned | N |
| Total sources | N |
| Pending sources | N |

## Structural Issues

### Orphaned Articles
- `filename.md` — no incoming links, no related entries

### Broken Wikilinks
- `source-article.md` → `[[Missing Title]]`

### Old Stubs (>30 days)
- `filename.md` — created YYYY-MM-DD (N days old)

### Incomplete Frontmatter
- `filename.md` — missing: title, tags

## Content Issues

### Potential Duplicates
| Article A | Article B | Shared Tags | Suggestion |
|-----------|-----------|-------------|------------|
| `a.md` | `b.md` | tag1, tag2 | Consider merging |

### Missing Key Takeaways
- `filename.md`

### Stale Sources (>90 days since compile)
- `source.md` — last compiled YYYY-MM-DD

## Suggestions

### Merge Candidates
- `orphan.md` → could be folded into `[[Related Article]]`

### Missing Concepts
1. Concept Name (mentioned in N articles)
2. ...

### Stale Articles
- `filename.md` — last updated YYYY-MM-DD, domain changes frequently
```
