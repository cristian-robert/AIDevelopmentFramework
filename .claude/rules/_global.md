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

## Pipeline Discipline

- For non-trivial work: choose Superpowers or Standard mode before starting
- Plans are mandatory for L/XL tasks — run `/plan-feature` first
- Run `/validate` before claiming work is done
- Run `/evolve` after merging to keep the system improving
