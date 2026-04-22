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

1. **Read the lean index first:** `<kb-path>/_search/lean-index.json` — metadata-only view (title, type, tags, 1-line summary per article). This is a fraction the size of the full TF-IDF index and gives a fast "what do we have" scan without loading article bodies. If `lean-index.json` is missing, run `KB_PATH=<kb-path> node cli/lean-index.js` to generate it, or fall back to reading `<kb-path>/wiki/_index.md`.
2. **Search for task-relevant knowledge:** Run `KB_PATH=<kb-path> node cli/kb-search.js search "<task keywords>"` where task keywords come from the current issue title, branch name, or user description
3. **Load top results:** Read the top 3-5 matching wiki articles in full using the Read tool
4. **Check for feature articles:** If working on a specific issue, also search: `KB_PATH=<kb-path> node cli/kb-search.js search "#<issue-number>" --type=feature`

If no knowledge base configured, skip this section entirely.

_Note: a full lean-loading rewrite of this step is planned for a later task; for now the lean index is a preview — use it to decide which articles to load fully via search._

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

Knowledge Base: [N articles in wiki, N stubs pending | "not configured"]

KB Context Loaded: [list of wiki articles loaded for this session, with types]

=== Ready. Run /start to begin or specify a command. ===
```
