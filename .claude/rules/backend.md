---
description: Backend development rules — auto-loads when editing backend/server files
globs: ["**/backend/**", "**/server/**", "**/api/**", "**/*.controller.*", "**/*.service.*", "**/*.module.*", "**/*.guard.*", "**/*.middleware.*", "**/*.resolver.*"]
---

# Backend Rules

## Skill chain (summary)
KB search → architect-RETRIEVE → context7 verify → implement → architect-RECORD → KB update. Full: `.claude/references/backend-skill-chain.md`.

## Top conventions
- Endpoints validate input (DTO/schema)
- Business logic in services, not controllers
- Auth on every route; authz on every object access
- No hardcoded secrets

## Top 5 security defaults (most-missed)
- Passwords: bcrypt/argon2 ≥12 rounds
- Tokens: httpOnly cookies, never localStorage
- Input validation on every endpoint
- CORS: allowlisted domains, never `*`
- Secrets in env vars only

Full backend security checklist + token rotation, lockouts, rate-limiting, audit, etc.: `.claude/references/backend-detail.md` + `.claude/references/security-checklist.md` (load when touching auth/sessions/public endpoints).

## Critical checklist
- [ ] Auth + authz on every new/modified route
- [ ] All inputs validated
- [ ] No PII/hashes/tokens in API responses
- [ ] Wiki articles updated for structural changes

## References
- `.claude/references/backend-skill-chain.md` — full skill chain + conventions
- `.claude/references/backend-detail.md` — error formats, DI/layering, logging, testing-by-layer
- `.claude/references/security-checklist.md` — auth/API/infra security
- `.claude/references/code-patterns.md` — project patterns
- `<kb-path>/wiki/_index.md` — search feature articles before touching endpoints
