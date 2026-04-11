# /ship — Commit, Push, and Create PR

Handles the full shipping workflow: staging, committing, pushing, and creating a pull request.

## Process

### Step 1: Pre-flight Check

1. Verify all tests pass: `npm test` (or detected test command)
2. Verify no uncommitted changes that shouldn't be included
3. Check current branch is not main/master

### Step 1.5: Update Knowledge Base (if configured)

Check CLAUDE.md for a `## Knowledge Base` section with a `Path:` value. If configured:

1. **Find the feature note:** Detect the current issue number from the branch name. Grep `<kb-path>/features/*.md` for that issue number. If no match, use keyword matching between branch name and feature note filenames.

2. **Update the feature note:**
   - `## Implementation Notes` — append what was built: key files created/modified, endpoints added, components built, patterns used
   - `## GitHub Issues` — update the status of the current issue to reflect completion
   - `## Key Decisions` — add any decisions made during implementation that weren't pre-planned

3. **Create decision records** (only if warranted):
   - A technology or approach was chosen over alternatives during implementation
   - A pattern was established that future features should follow
   - Something was intentionally excluded and the reason matters for future work

4. **Update overview** (only if significant):
   - New integration or service was added to the stack
   - Project scope changed

5. Stage knowledge base changes alongside code changes.

If no knowledge base configured, skip to Step 2.

### Step 1.6: Security Pre-flight Check

Run the automated security scans from `.claude/references/security-checklist.md`:

1. **Quick automated scan:**
   ```bash
   # Hardcoded secrets
   grep -rn "password\s*=\s*['\"]" --include="*.ts" --include="*.js" --exclude-dir=node_modules . && echo "FAIL" || echo "PASS"
   grep -rn "secret\s*=\s*['\"]" --include="*.ts" --include="*.js" --exclude-dir=node_modules . && echo "FAIL" || echo "PASS"
   grep -rn "api[_-]key\s*=\s*['\"]" --include="*.ts" --include="*.js" --exclude-dir=node_modules . && echo "FAIL" || echo "PASS"

   # .env in git history
   git log --all --full-history -- .env && echo "WARNING" || echo "PASS"

   # SQL injection vectors
   grep -rn "query.*+.*\"\|query.*\`.*\${" --include="*.ts" --include="*.js" --exclude-dir=node_modules . && echo "FAIL" || echo "PASS"

   # Wildcard CORS
   grep -rn "origin:\s*['\"]\\*['\"]" --include="*.ts" --include="*.js" --exclude-dir=node_modules . && echo "FAIL" || echo "PASS"

   # Tokens in localStorage
   grep -rn "localStorage.*token\|localStorage.*jwt\|localStorage.*auth" --include="*.ts" --include="*.js" --include="*.tsx" --include="*.jsx" --exclude-dir=node_modules . && echo "FAIL" || echo "PASS"

   # Console.log in production
   grep -r "console\.log" --include="*.ts" --include="*.js" --exclude-dir=node_modules --exclude-dir=__tests__ . && echo "WARNING" || echo "PASS"

   # npm audit
   npm audit --audit-level=critical 2>/dev/null || echo "SKIP"
   ```

2. **If any FAIL:** Stop the ship process. Report failures and require fixes before re-running `/ship`.
3. **If only WARNINGs:** Report warnings to the user. Ask: "Proceed with these warnings, or fix first?"
4. **If all PASS:** Continue to next step.

### Step 1.7: Codex Adversarial Review (optional)

This step requires an OpenAI subscription and the Codex plugin installed. If not available, skip to Step 2.

Check if the Codex companion script exists:
```bash
test -f "$HOME/.claude/plugins/cache/openai-codex/codex/*/scripts/codex-companion.mjs" && echo "codex available" || echo "codex not available"
```

If Codex is available:

1. Ask the user: "Run Codex adversarial review before committing? (requires OpenAI subscription)"
   - If yes: run `/codex:adversarial-review` against the working tree changes
   - If no: skip to Step 2
2. Present the review output to the user
3. If the review surfaces significant concerns, ask: "Address these findings before committing, or proceed?"
   - If address: stop `/ship`, let the user fix issues, then re-run `/ship`
   - If proceed: continue to Step 2

This does NOT replace the superpowers code review in `/validate`. It is an additional, adversarial perspective that questions design choices, tradeoffs, and assumptions — not just implementation defects.

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
