# /plan-project — Phase 5: Create in GitHub + KB Integration

## Create milestones + issues

```bash
# Milestones
gh api repos/{owner}/{repo}/milestones -f title="Phase 1: [Name]" -f description="[Description]"

# Issues
gh issue create --title "[type]: description" --body "..." --label "feat,priority:high,size:M" --milestone "Phase 1: [Name]"
```

For dependencies → add a "Blocked by #N" line in the issue body.

## KB integration (per `_shared/kb-detect.md`)

If KB configured, after each issue creation:

1. Search for existing feature article: `KB_PATH=<kb-path> node cli/kb-search.js search "<feature name>" --type=feature`.
2. Found → update `## GitHub Issues` section with new issue number + title.
3. Not found → create `wiki/<feature-name>.md` (feature template):
   - Summary from issue description
   - GitHub Issues section listing the new issue
   - Tags relevant to the feature domain
4. Architectural decisions made → create `wiki/adr-NNN-<title>.md` (decision template).
5. Update `wiki/_index.md`, `wiki/_tags.md`.
6. `KB_PATH=<kb-path> node cli/kb-search.js index`.

Stage: `git add <kb-path>/wiki/`.
