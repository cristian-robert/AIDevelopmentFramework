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

### 6. Knowledge Base Context

Check CLAUDE.md for a `## Knowledge Base` section with a `Path:` value (e.g., `.obsidian/`). If configured and the directory exists:

1. **Always read:** `<kb-path>/overview.md`
2. **Find linked feature note:** If working on a specific issue (detected from branch name or user input), grep `<kb-path>/features/*.md` for the issue number. Read the matching feature note.
3. **Scan for related features:** List all files in `<kb-path>/features/`. Read the first 5 lines (`## Summary`) of each. If any feature has a clear dependency or overlap with the current issue (shared entities, referenced in acceptance criteria, same domain area), read the full note.
4. **Check decisions:** List `<kb-path>/decisions/`. Read any whose title references the same feature area.

If no knowledge base configured, skip this section entirely.

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

Project Knowledge: [summary from overview.md if knowledge base exists, or "not configured"]
Related Features: [list of feature notes loaded for this session]

=== Ready. Run /start to begin or specify a command. ===
```
