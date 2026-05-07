# /prime — Steps 1+2: Structure, History, Project Docs

## Step 1: Structure + History (parallel)

```bash
git ls-files | head -200
tree -L 3 -I 'node_modules|.next|dist|build|.git|__pycache__|.expo' --dirsfirst
git log --oneline -10
git status --short
git branch --show-current
```

## Step 2: Project docs (lean)

Read if they exist:
- `CLAUDE.md` (project root) — full
- `README.md` — full

**DO NOT** eagerly load `docs/plans/PRD.md`, feature plans, or any plan file based on the branch name alone. Plans are loaded selectively in Step 3 only when they match the Step 0 task scope, and even then only the lightweight sections.
