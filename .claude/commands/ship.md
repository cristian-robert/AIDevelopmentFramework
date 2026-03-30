# /ship — Commit, Push, and Create PR

Handles the full shipping workflow: staging, committing, pushing, and creating a pull request.

## Process

### Step 1: Pre-flight Check

1. Verify all tests pass: `npm test` (or detected test command)
2. Verify no uncommitted changes that shouldn't be included
3. Check current branch is not main/master

### Step 2: Stage and Commit

Use the `/commit` skill (from commit-commands plugin) for proper conventional commit formatting.

If the commit-commands plugin is not available, fall back to:

1. Show `git status` and `git diff --stat`
2. Ask which files to stage (or confirm staging all)
3. Generate conventional commit message from changes:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `refactor:` for code improvements
   - `docs:` for documentation
   - `test:` for test additions/changes
   - `chore:` for maintenance
4. Commit with the generated message

### Step 3: Push

```bash
git push -u origin $(git branch --show-current)
```

### Step 4: Create Pull Request

Detect the linked GitHub issue from:
- Branch name (e.g., `feat/user-auth-42` implies issue #42)
- Recent commit messages
- Active plan file

Create PR:
```bash
gh pr create \
  --title "[type]: brief description" \
  --body "## Summary
- [what changed and why]

## Linked Issue
Closes #[number]

## Test Plan
- [ ] Automated tests pass
- [ ] Manual verification of [key behavior]
- [ ] Tested on [viewports/devices if applicable]
"
```

### Step 5: Report

```
=== Shipped ===

Branch: [branch name]
Commit: [hash] — [message]
PR: [PR URL]
Closes: #[issue number]

Next steps:
- Wait for review
- After merge: run /evolve to update the system
```
