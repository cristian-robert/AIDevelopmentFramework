# /kb-compile — Phase 3: Cross-Link Articles

## 3a. Build concept list

Collect every article title + aliases (frontmatter `aliases:` if present). Build a lookup: `concept name → article filename`.

## 3b. Scan for unlinked mentions

For each article body, find plain-text mentions of other article titles not already wrapped in `[[…]]`. Whole-word/phrase matches only.

## 3c. Add wikilinks

Replace the **first** mention of each concept per article with `[[Article Title]]`. One wikilink per concept per article — don't link every occurrence.

## 3d. Update `related:` bidirectionally

When article A links to article B, ensure `related:` in A includes B's filename **and** `related:` in B includes A's filename. Deduplicate after updating.
