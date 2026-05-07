# Global Rules

## Git
- Branch: `{type}/{description}` (`feat/`, `fix/`, …)
- Conventional commits: `feat:` / `fix:` / `refactor:` / `docs:` / `chore:` / `test:`
- Always link PRs to GitHub issues
- Never commit to main/master

## Code
- TypeScript strict mode
- Self-documenting; comments only for non-obvious logic
- YAGNI; three similar lines beats a premature abstraction

## KB (only if `## Knowledge Base` in project CLAUDE.md)
- Before work: `KB_PATH=<path> node cli/kb-search.js search "<keywords>"`
- After structural change: rebuild `KB_PATH=<path> node cli/kb-search.js index`
- Skip for: trivial / typo / config / dep-bump

## Pipeline
- Non-trivial: pick Superpowers or Standard before starting
- L/XL: `/plan-feature` first
- `/validate` before claiming done
- `/evolve` after merging

## File-size guardrail
- Context files have line-count budgets. Lint: `node cli/file-size-check.js`. Enforced by `/evolve` Step 2.5.

## References
- `.claude/references/_global-detail.md` — full KB integration + pipeline discipline
- `.claude/references/_shared/git-commit.md` — conventional commit pattern
- `.claude/references/_shared/file-size-guard.md` — line-count budgets per file class
- `.claude/references/_shared/load-conditions.md` — vocabulary for command step tables
