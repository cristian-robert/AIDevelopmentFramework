# /kb-ask — Phase 1: Search + Read Sources

## Detect KB

Per `_shared/kb-detect.md`. If KB is empty (no results) → blocker:

```
No wiki articles found to answer: "<question>"

The wiki is empty or has no content on this topic.
First: /kb-ingest <url-or-file>
Then re-run: /kb-ask <question>
```

## Search

```bash
KB_PATH=<kb-path> node cli/kb-search.js search "<question>"
```

## Read top 5

For each of the top 5 results (by score), Read the full file from `<kb-path>/<file>`.
