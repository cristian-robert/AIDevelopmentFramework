# /ship — Steps 2–4: Commit + Push + PR

## Step 2: Stage + commit

Use `/commit` skill (commit-commands plugin) for proper conventional commit formatting. Fallback (no skill): see `_shared/git-commit.md`.

## Step 3: Push

```bash
git push -u origin $(git branch --show-current)
```

## Step 4: Create PR

Detect linked issue from:
- Branch name (e.g., `feat/user-auth-42` → issue #42)
- Recent commit messages
- Active plan file

```bash
gh pr create \
  --title "[type]: brief description" \
  --body "$(cat <<'EOF'
## Summary
- [what changed and why]

## Linked Issue
Closes #[number]

## Test Plan
- [ ] Automated tests pass
- [ ] Manual verification of [key behavior]
- [ ] Tested on [viewports/devices if applicable]
EOF
)"
```
