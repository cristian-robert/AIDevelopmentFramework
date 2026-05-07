# /kb-ask — Knowledge Base Q&A

Ask a question. The answer is synthesized from existing wiki articles and permanently filed as a new article. Every question improves the KB (Karpathy's "queries add up" principle).

**Args:** `$ARGUMENTS` = the question.

**Output:** display-purpose command — exempt from the one-line rule, but still lean.

## Phases (load on demand)

| # | Phase | Reference |
|---|-------|-----------|
| 1 | Detect KB + search + read top 5 | `kb-ask/01-search-and-read.md` |
| 2 | Synthesize answer + file in wiki | `kb-ask/02-synthesize-and-file.md` |
| 3 | Backlinks + index/tag updates + rebuild search | `kb-ask/03-backlinks-and-indexes.md` |

## Output format

```
[The synthesized answer, fully formatted in markdown]

— sources: <slug-1>, <slug-2>, ... · filed as wiki/<slug>.md
```

No banners, no separators, no "Next:" menu.
