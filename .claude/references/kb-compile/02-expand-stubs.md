# /kb-compile — Phase 2: Expand Stubs

For each stub (in order of "most related pending sources first"):

## 2a. Gather source material

Read the article's frontmatter `sources:` list. For each source filename, read `<KB_PATH>/raw/<filename>` in full.

## 2b. Find related articles

```bash
KB_PATH=<kb-path> node cli/kb-search.js search "<article title and tags joined>"
```

Read the top 3–5 results (skip the stub itself). These provide cross-article context and prevent duplication.

## 2c. Write comprehensive content

Use the raw source material + related-article context. Follow the wiki article template:

```markdown
## Overview
2–4 sentence summary.

## Content
Comprehensive explanation with subheadings. Cover:
- Core definition and mechanics
- Why it exists / what problem it solves
- How it works in practice
- Key variants or subtypes
- Relationship to related concepts

## Key Takeaways
- 4–8 actionable bullets

## Examples
Concrete examples, code snippets, case studies.

## See Also
- [[Related Article 1]]
- [[Related Article 2]]
```

## 2d. Update frontmatter

`status: stub` → `status: compiled`. Update `updated:` to today.

## 2e. Write file

Write expanded content back to `<KB_PATH>/wiki/<filename>`. Preserve all existing frontmatter fields except `status` and `updated`.
