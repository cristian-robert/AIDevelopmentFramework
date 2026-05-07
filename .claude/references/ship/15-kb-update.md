# /ship — Step 1.5: Update Knowledge Base

Per `_shared/kb-detect.md`. If KB is off → skip to Step 1.6.

## Find feature article

Search by current issue: `KB_PATH=<kb-path> node cli/kb-search.js search "#<issue-number>" --type=feature`. No match → search by branch-name keywords.

## Update feature article (or create one)

- `## Implementation Notes` — key files created/modified, endpoints, components, patterns
- `## GitHub Issues` — mark current issue as completed
- `## Key Decisions` — add decisions made during implementation
- `updated:` date in frontmatter
- Add/update backlinks to any new related articles

## Decision articles (only if warranted)

Use the decision template from `.claude/references/kb-article-template.md`. Save to `wiki/adr-NNN-<slugified-title>.md` (type: `decision`). Add backlinks from the feature article.

## Project overview (only if significant)

Search: `KB_PATH=<kb-path> node cli/kb-search.js search "project overview" --type=reference`. Update if scope or stack changed.

## Rebuild

```bash
KB_PATH=<kb-path> node cli/kb-search.js index
```

Stage: `git add <kb-path>/wiki/ <kb-path>/raw/`.
