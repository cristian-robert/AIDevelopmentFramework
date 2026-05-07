# /kb-compile — Phase 6: Rebuild Indexes

## 6a. wiki/_index.md (alphabetical)

```markdown
# Knowledge Base Index

_Last updated: <date>. Total: N articles._

## A
- [[Article Title]] — one-line description from Overview

## B
...
```

## 6b. wiki/_tags.md (tag-grouped)

```markdown
# Articles by Tag

_Last updated: <date>._

## <tag-name> (N)
- [[Article Title]]
- [[Article Title]]
```

Sort tags alphabetically. Sort articles within each tag by title.

## 6c. Search indexes (atomic, both at once)

```bash
KB_PATH=<kb-path> node cli/kb-search.js index
```

This rebuilds both `_search/index.json` (TF-IDF) and `_search/lean-index.json` (metadata-only for `/prime`). Confirm both files exist after.

Lean-only rebuild (rare — only after edits that changed titles/tags/summaries):

```bash
KB_PATH=<kb-path> node cli/lean-index.js
```
