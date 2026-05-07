# /kb-ask — Phase 3: Backlinks + Indexes

## Add backlinks to source articles

For each source article read in Phase 1, append (or extend an existing) `## Referenced By` section:

```markdown
## Referenced By

- [[<slug>]] — [the question that triggered this reference]
```

Update each source file via Edit.

## Update wiki/_index.md

If the file doesn't exist, create it. Add the new article under its type section:

```markdown
- [[<slug>]] — [title] *(added: YYYY-MM-DD)*
```

## Update wiki/_tags.md

For each tag in the new article, add or update the tag entry:

```markdown
## [tag]

- [[<slug>]] — [title]
```

## Rebuild search indexes

```bash
KB_PATH=<kb-path> node cli/kb-search.js index
```

Rebuilds both TF-IDF and lean indexes atomically.
