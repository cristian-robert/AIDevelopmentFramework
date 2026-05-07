---
description: Security rules — auto-loads when editing auth, API security, middleware, or infrastructure files
globs: ["**/auth/**", "**/authentication/**", "**/login*", "**/register*", "**/session*", "**/token*", "**/jwt*", "**/middleware/**", "**/guard*", "**/cors*", "**/ssl*", "**/tls*", "**/encrypt*", "**/hash*", "**/password*", "**/security*"]
---

# Security Rules

## Skill chain
architect-RETRIEVE → context7 verify (passport/bcrypt/helmet/…) → implement per `.claude/references/security-checklist.md` → architect-RECORD. `/validate` Phase 2.5 + `/ship` Step 1.6 enforce the checklist.

## Load-bearing rules (the ones that actually break prod)
- Passwords: bcrypt ≥12 / argon2; never plaintext
- Tokens: httpOnly cookies; never localStorage
- Auth on every route; authz on every object access
- Inputs: schema-validated (Zod/Joi); no SQL string concat
- Secrets: env vars only
- Errors: no stack traces, paths, or internals leaked
- CORS: specific origins, no `*`

## Critical checklist (pre-ship)
- [ ] Full `.claude/references/security-checklist.md` run
- [ ] `npm audit` no criticals
- [ ] No hardcoded credentials in diff
- [ ] `.env` absent from git history
- [ ] Rate limiting on public endpoints

## References
- `.claude/references/security-checklist.md` — authoritative pre-ship checklist
- `.claude/references/backend-detail.md` — auth/authz implementation + logging
- `<kb-path>/wiki/_index.md` — search auth/session/security decision articles
