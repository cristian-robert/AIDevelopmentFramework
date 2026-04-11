# Global Rules

## Git Workflow

- Branch naming: `{type}/{description}` (e.g., `feat/user-auth`, `fix/login-redirect`)
- Conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`, `test:`
- Always link PRs to GitHub issues
- Never commit directly to main/master — use feature branches

## Code Standards

- TypeScript strict mode where applicable
- Self-documenting code — comments only for non-obvious logic
- No unnecessary abstractions or over-engineering (YAGNI)
- DRY — but three similar lines beats a premature abstraction

## Knowledge Base Integration

When the project's CLAUDE.md has a `## Knowledge Base` section with a `Path:` value, the KB is active. Follow these rules:

**Before starting work:**
- Search the KB for context relevant to the task: `KB_PATH=<path> node cli/kb-search.js search "<keywords>"`
- Read the top results — they contain architecture decisions, patterns, and feature context that prevent redundant work and inconsistent implementations

**After structural changes** (new modules, endpoints, routes, screens, DB tables, components):
- Search for existing articles to update: `KB_PATH=<path> node cli/kb-search.js search "<feature or area>"`
- Update existing wiki articles rather than creating duplicates
- If creating a new article, use the template from `.claude/references/kb-article-template.md`
- Rebuild the search index: `KB_PATH=<path> node cli/kb-search.js index`

**Skip KB** for: trivial changes, typo fixes, config tweaks, dependency bumps.

## Pipeline Discipline

- For non-trivial work: choose Superpowers or Standard mode before starting
- Plans are mandatory for L/XL tasks — run `/plan-feature` first
- Run `/validate` before claiming work is done
- Run `/evolve` after merging to keep the system improving
