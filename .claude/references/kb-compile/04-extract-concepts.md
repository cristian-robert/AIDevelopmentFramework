# /kb-compile — Phase 4: Extract New Concepts

## 4a. Frequently mentioned concepts

Scan all article bodies for noun phrases that appear in **3+ articles** but lack their own wiki article. Focus on technical terms, named patterns, tools, frameworks — not generic words.

## 4b. Comparison opportunities

Look for pairs of articles whose titles or tags suggest a natural comparison (two tools in the same category, two approaches to the same problem). Flag as candidates for `type: comparison` articles.

## 4c. Create new stubs (cap: 10 per run)

For each identified concept (max 10 to avoid explosion), create a stub at `<KB_PATH>/wiki/<slugified-name>.md`:

```markdown
---
title: "<Concept Name>"
type: concept
tags: [<inferred tags>]
status: stub
sources: []
related: [<articles that mention it>]
created: <today>
updated: <today>
---

## Overview

_Stub — to be compiled._
```
