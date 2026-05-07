# /validate — Phase 4: Security Verification

Run automated checks from `.claude/references/security-checklist.md`.

## Quick scan

```bash
# Console.log in production
grep -r "console\.log" --include="*.ts" --include="*.js" --exclude-dir=node_modules --exclude-dir=__tests__ . || echo "PASS: No console.log found"

# Hardcoded secrets
grep -rn "password\s*=\s*['\"]" --include="*.ts" --include="*.js" --exclude-dir=node_modules .
grep -rn "secret\s*=\s*['\"]" --include="*.ts" --include="*.js" --exclude-dir=node_modules .
grep -rn "api[_-]key\s*=\s*['\"]" --include="*.ts" --include="*.js" --exclude-dir=node_modules .

# .env in git history
git log --all --full-history -- .env

# SQL string concatenation
grep -rn "query.*+.*\"\|query.*\`.*\${" --include="*.ts" --include="*.js" --exclude-dir=node_modules .

# Wildcard CORS
grep -rn "origin:\s*['\"]\\*['\"]" --include="*.ts" --include="*.js" --exclude-dir=node_modules .

# Tokens in localStorage
grep -rn "localStorage.*token\|localStorage.*jwt\|localStorage.*auth" --include="*.ts" --include="*.js" --include="*.tsx" --include="*.jsx" --exclude-dir=node_modules .

# npm audit
npm audit --audit-level=critical 2>/dev/null || echo "SKIP: npm audit not available"
```

## Auth/API review (if those files changed)

- Password hashing: bcrypt/argon2, ≥12 rounds
- Tokens: httpOnly cookies, never localStorage
- JWT secret: ≥32 chars, not hardcoded
- Access token expiration: 15–60 minutes
- Rate limiting: `/login`, `/register`, public endpoints
- Authorization: users access only their own data
- Input validation: Zod/Joi/etc.
- API responses: no passwords/hashes/internal fields
- Errors: no stack traces, file paths, system internals
- CORS: specific domains, no wildcard `*`

## Database review (if schema/queries changed)

- No SQL string concatenation — parameterized queries or ORM only
- App uses limited-permission DB user, not root
- Sensitive fields encrypted at rest

## Verdict

- All automated PASS + manual review clean → **Security: PASSED**
- Non-critical flagged → **Security: PASSED WITH WARNINGS** — list items
- Critical found (hardcoded secrets, SQL injection, missing auth) → **Security: FAILED** — must fix before shipping
