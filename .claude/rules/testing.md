---
description: Testing rules — auto-loads when editing test files
globs: ["**/*.test.*", "**/*.spec.*", "**/test/**", "**/tests/**", "**/__tests__/**", "**/e2e/**"]
---

# Testing Rules

## Skill chain
Check existing tests for the area (prefer extending) → spawn test-planning subagent for QA E2E (sonnet, plans only) → implement unit + integration + QA E2E per matrix → run locally before shipping.

## Load-bearing rules
- Name tests by behavior (`it('returns 404 when user not found')`)
- AAA structure with visual separation
- Cover happy / edge / error paths; skip framework internals
- Real DBs for integration; mock only external services
- Never mock the module under test; prefer DI
- QA E2E mandatory after every dev task
- Test creds from env (`TEST_USER_EMAIL` etc.); never hardcoded

## Critical checklist
- [ ] Tests describe behavior, not implementation
- [ ] Happy + edge + error covered for new code
- [ ] No new test file when one exists for the area
- [ ] QA E2E added/updated per domain matrix
- [ ] No hardcoded credentials
- [ ] All tests pass locally before shipping

## References
- `.claude/references/testing-detail.md` — AAA detail, mock policy, QA matrix, placement, test users
- `.claude/references/security-checklist.md` — auth/authz/input-validation test areas
- `<kb-path>/wiki/_index.md` — feature articles for test alignment
