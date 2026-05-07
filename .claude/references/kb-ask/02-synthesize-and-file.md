# /kb-ask — Phase 2: Synthesize + File the Answer

## Synthesize

Write a comprehensive answer using the loaded articles as source material:
- Directly address the question
- Cite specific details from the source articles
- Be accurate — do not add information not in the sources
- Concise but complete — no padding
- Use markdown formatting (headers, bullets, code blocks) as appropriate

## Choose article type

| Type | Use when |
|------|----------|
| `guide` | "How to" / "How do I" — procedural |
| `comparison` | "Which" / "vs" / "difference between" — compares options |
| `reference` | "What is" / "what are" / "list" — reference material |
| `concept` | "Why" / "what does X mean" — explains a concept |

## Slug + frontmatter

Slug: lowercase question, hyphens for spaces, strip punctuation, ≤60 chars. Examples:
- "How do I set up the KB?" → `how-to-set-up-the-kb`
- "What is the difference between guide and reference?" → `guide-vs-reference-article-types`

Collision: append numeric suffix (`-2`, `-3`, …).

Frontmatter:
```yaml
---
title: "[The question, rephrased as a declarative title]"
type: [guide|comparison|reference|concept]
tags: [tag1, tag2, ...]
status: active
created: YYYY-MM-DD
sources:
  - [relative path to source article 1]
  - [relative path to source article 2]
---
```

## Article structure

```markdown
---
[frontmatter]
---

# [Title]

[Synthesized answer — full formatted content]

## Sources

- [[source-article-1]] — [one-line description of contribution]
- [[source-article-2]] — [one-line description]
```

File at `<kb-path>/wiki/<slug>.md`.
