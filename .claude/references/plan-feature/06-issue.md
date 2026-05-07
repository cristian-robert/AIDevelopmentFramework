# /plan-feature — Phase 6: GitHub Issue

If no issue exists for this feature:

```bash
gh issue create --title "[type]: description" --body "..." --label "feat,size:M"
```

If issue exists, add a comment linking to the plan:

```bash
gh issue comment <number> --body "Implementation plan: docs/plans/<plan-file>.md"
```
