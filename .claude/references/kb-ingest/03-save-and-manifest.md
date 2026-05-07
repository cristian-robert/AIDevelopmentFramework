# /kb-ingest — Phase 3: Save Raw + Update Manifest

## Compute path

- `<date>` = today, `YYYY-MM-DD`
- `<slug>` = slugified title (lowercase, spaces→hyphens, strip special chars, max 60 chars). If no title: derive from URL hostname+path / filename / dir name.
- `<category>` = `articles` | `papers` | `docs` | `repos` | `sessions`
- `<raw-path>` = `<kb-path>/raw/<category>/<date>-<slug>.md`

## Write raw file

```markdown
---
source: <original URL, file path, or "session">
ingested: <YYYY-MM-DD>
type: <category>
title: <extracted or inferred title>
---

<fetched content>
```

## Update manifest

Append one row to `<kb-path>/raw/_manifest.md`:

```
| <source> | <YYYY-MM-DD> | <category> | raw/<category>/<date>-<slug>.md | pending | — |
```

Status starts as `pending`; `/kb-compile` updates to `compiled` and sets `Wiki Article`.
