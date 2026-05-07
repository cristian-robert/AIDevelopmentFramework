# /kb-ingest — Knowledge Base Ingestion

Ingest a source (URL, file, directory, or session learnings) into the KB.

**Args:** `$ARGUMENTS` = URL | file path | directory path | literal `session`.

**Output:** one line per `_shared/output-contract.md`.

## Phases (load on demand)

| # | Phase | Reference |
|---|-------|-----------|
| 1 | Detect KB path + init structure | `kb-ingest/01-detect-and-init.md` |
| 2 | Detect source type + fetch | `kb-ingest/02-fetch.md` |
| 3 | Save raw + update manifest | `kb-ingest/03-save-and-manifest.md` |
| 4 | Create stub + update indexes + rebuild search | `kb-ingest/04-stub-and-indexes.md` |

## Output (one line)

Single source:
```
Ingested <category>: <slug> · stub=wiki/<slug>.md · Next: /kb-compile
```

Batch (directory or `session`):
```
Ingested N <category>: <N raw, N stubs> · Next: /kb-compile
```

Step failures (fetch/write/index errors) are blockers — print the failing step + error + manual fix; do not emit the one-liner.
