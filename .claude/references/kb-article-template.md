# Wiki Article Templates

Used by `/kb ingest`, `/kb compile`, and pipeline commands when creating or updating wiki articles. All wiki articles live in `<kb-path>/wiki/` as flat files.

**Security:** Wiki articles are committed to git. NEVER store actual secret values (API keys, tokens, passwords) in any article. Store only metadata: which env vars are needed, which services are used, who owns credentials. Actual secrets belong in `.env` files, secret managers, or CI/CD variables.

---

## Article Types

| Type | When to Use |
|------|-------------|
| `concept` | Foundational idea, pattern, or mental model (e.g., "PIV+E Loop", "Context Windows") |
| `feature` | A project feature area, linked to GitHub issues and implementation details |
| `decision` | Architecture Decision Record — technology or approach chosen over alternatives |
| `guide` | Step-by-step instructions for a task or workflow |
| `comparison` | Side-by-side analysis of two or more options, tools, or approaches |
| `reference` | Quick-lookup data: API signatures, config options, command flags |
| `session-learning` | Insight captured from a coding session — bugs found, patterns discovered, mistakes to avoid |

---

## Full Article Template

Created by `/kb compile` or manually for rich, well-developed articles.

```markdown
---
title: "[Article Title]"
type: concept | feature | decision | guide | comparison | reference | session-learning
tags: [tag1, tag2, tag3]
sources:
  - "[source description or URL]"
related:
  - "[[Related Article Title]]"
created: YYYY-MM-DD
updated: YYYY-MM-DD
status: draft | active | archived
---

## Summary

[1-2 sentences: what this article covers and why it matters]

## Content

[Main body — use subheadings as needed. For guides: numbered steps. For comparisons: tables. For concepts: definitions + examples.]

## Key Takeaways

- [Most important insight]
- [Second insight]
- [Third insight]

## See Also

- [[Related Article Title]] — [one-line reason to read it]
- [[Another Article]] — [one-line reason to read it]
```

---

## Stub Article Template

Created during `/kb ingest` for new sources before full compilation. Minimal viable article — expand later with `/kb compile`.

```markdown
---
title: "[Article Title]"
type: concept | feature | decision | guide | comparison | reference | session-learning
tags: [tag1, tag2]
sources:
  - "[source description or URL]"
related: []
created: YYYY-MM-DD
updated: YYYY-MM-DD
status: stub
---

## Summary

[One paragraph: what this covers, extracted or synthesized from the source.]

## Key Takeaways

- [Takeaway 1]
- [Takeaway 2]
- [Takeaway 3]
```

---

## Feature Article Template

For project feature areas. Linked to GitHub issues. Updated by `/ship` after implementation.

```markdown
---
title: "Feature: [Name]"
type: feature
tags: [feature, tag1, tag2]
sources: []
related:
  - "[[Related Feature or Decision]]"
created: YYYY-MM-DD
updated: YYYY-MM-DD
status: draft | active | archived
---

## Summary

[1-2 sentences: what this feature does and why it exists]

## GitHub Issues

| Issue | Title | Status |
|-------|-------|--------|
| #N | [Issue title] | open / closed |

## Key Decisions

- [Decision and why — link to decision article if one exists]

## Implementation Notes

[Updated by `/ship` after work is completed — endpoints created, components built, patterns used, gotchas encountered]

## Key Takeaways

- [What to know before working on this feature]
- [Critical constraint or dependency]

## See Also

- [[Related Article]] — [reason]
```

---

## Decision Article Template

ADR format. Create when a technology or approach was chosen over alternatives, a pattern was established, or something was intentionally excluded.

NOT for every small implementation choice — only decisions that future contributors need to understand.

```markdown
---
title: "Decision: [Short Title]"
type: decision
tags: [decision, tag1, tag2]
sources: []
related:
  - "[[Affected Feature or Concept]]"
created: YYYY-MM-DD
updated: YYYY-MM-DD
status: accepted | superseded | deprecated
---

## Summary

[One sentence: what was decided and why it matters]

## Context

[What situation or constraint led to this decision. What problem were we solving?]

## Decision

[What we chose and the core reasoning. Be specific — name the alternative(s) considered.]

## Consequences

[What this means for future work. Include both positive outcomes and accepted tradeoffs.]

## Key Takeaways

- [Most important implication for future contributors]
- [Constraint this decision creates]

## See Also

- [[Related Article]] — [reason]
```

---

## Manifest Entry Format

Each ingested source gets one row in `raw/_manifest.md`. The manifest tracks what has been ingested and whether it has been compiled into a wiki article.

```markdown
| Date | Source | Type | Tags | Article | Status |
|------|--------|------|------|---------|--------|
| YYYY-MM-DD | [source description or URL] | video / blog / doc / session / paper | tag1, tag2 | [[Article Title]] or — | ingested / compiled |
```

Full manifest file structure:

```markdown
# KB Manifest

Tracks all ingested sources and their compilation status.

| Date | Source | Type | Tags | Article | Status |
|------|--------|------|------|---------|--------|
| 2025-01-15 | Karpathy: "Let's build GPT" (YouTube) | video | llm, training, transformers | [[Building GPT From Scratch]] | compiled |
| 2025-01-16 | https://docs.anthropic.com/context-windows | doc | context, claude, limits | — | ingested |
```

---

## Index File Formats

### `wiki/_index.md` — Master Article Index

Grouped by article type. Updated by `/kb ingest` and `/kb compile`.

```markdown
# Wiki Index

_Last updated: YYYY-MM-DD — N articles_

## Concepts

- [[Article Title]] — [one-line summary]
- [[Another Concept]] — [one-line summary]

## Features

- [[Feature: Auth]] — [one-line summary]
- [[Feature: Billing]] — [one-line summary]

## Decisions

- [[Decision: Chose Supabase over PlanetScale]] — [one-line summary]

## Guides

- [[Guide: Setting Up Local Dev]] — [one-line summary]

## Comparisons

- [[Comparison: REST vs GraphQL]] — [one-line summary]

## References

- [[Reference: CLI Commands]] — [one-line summary]

## Session Learnings

- [[Learning: Avoiding N+1 Queries]] — [one-line summary]
```

### `wiki/_tags.md` — Tag Registry

Tag registry with article counts and links. Updated by `/kb ingest` and `/kb compile`.

```markdown
# Tag Registry

_Last updated: YYYY-MM-DD_

| Tag | Count | Articles |
|-----|-------|----------|
| llm | 4 | [[Building GPT From Scratch]], [[Attention Mechanism]], [[Tokenization]], [[Context Windows]] |
| architecture | 3 | [[Decision: Monorepo Structure]], [[System Design Overview]], [[Microservices Tradeoffs]] |
| feature | 5 | [[Feature: Auth]], [[Feature: Billing]], [[Feature: Search]], [[Feature: Notifications]], [[Feature: Export]] |
| session-learning | 2 | [[Learning: Avoiding N+1 Queries]], [[Learning: React Key Prop Gotcha]] |
```
