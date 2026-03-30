# /prime — Context Loader

Load the full codebase context into the current session. Run at the start of any session, after a context reset, or when switching tasks.

## Process

Run these in parallel for speed:

### 1. Project Structure
```bash
git ls-files | head -200
```
```bash
tree -L 3 -I 'node_modules|.next|dist|build|.git|__pycache__|.expo' --dirsfirst
```

### 2. Project Documentation
Read these files if they exist:
- `CLAUDE.md` (project root)
- `README.md`
- `docs/plans/PRD.md` (or latest PRD)
- Any plan file matching the current branch name

### 3. Recent History
```bash
git log --oneline -10
```
```bash
git status --short
```
```bash
git branch --show-current
```

### 4. Active Context
- If on a feature branch, extract the issue number from the branch name
- If issue number found: `gh issue view <number>`
- Check for existing plan: look for files in `docs/plans/` or `docs/superpowers/plans/` matching branch name

### 5. Configuration
- Read `.claude/agents/architect-agent/index.md` (knowledge base TOC)
- Read `.claude/agents/tester-agent/test-patterns.md` (page inventory)
- Check `package.json` or equivalent for available scripts/commands

## Output Format

Present a structured summary:

```
=== Project Context ===

Project: [name from package.json/CLAUDE.md]
Branch: [current branch]
Issue: [linked issue if found, or "none"]
Plan: [active plan file if found, or "none"]

Structure: [key directories and their purposes]

Recent Activity:
[last 5 commits, one line each]

Uncommitted Changes:
[summary of staged/unstaged changes]

Available Commands:
[dev, test, build commands from package.json]

Knowledge Base: [N domains documented in architect-agent]

=== Ready. Run /start to begin or specify a command. ===
```
