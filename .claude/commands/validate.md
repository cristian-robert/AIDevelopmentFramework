# /validate — Verification Orchestrator

Runs comprehensive verification: automated checks, visual testing, and code review.

## Process

### Phase 1: Automated Checks

Run in parallel:

```bash
# Lint (detect from project)
npm run lint 2>/dev/null || npx eslint . 2>/dev/null || echo "No linter configured"

# Type check (detect from project)
npx tsc --noEmit 2>/dev/null || echo "No TypeScript configured"

# Tests (detect from project)
npm test 2>/dev/null || npx jest 2>/dev/null || npx vitest run 2>/dev/null || echo "No test runner configured"
```

If any check fails, report the failure and offer to fix it before continuing.

### Phase 2: Visual Verification (if applicable)

Detect what was changed:
```bash
git diff --name-only main...HEAD
```

**If frontend files changed:**
- Dispatch tester-agent with VERIFY queries for affected pages
- Test at minimum: desktop and mobile viewports
- Check: elements render, navigation works, forms submit

**If mobile files changed:**
- Dispatch mobile-tester-agent with VERIFY queries for affected screens
- Check: elements visible, navigation works, interactions respond

**If API/backend files changed:**
- Run API tests if they exist
- Check: endpoints respond with correct status codes
- If Supabase: run `get_advisors` for schema safety

### Phase 3: Security Verification

Run the automated security checks from `.claude/references/security-checklist.md`:

1. **Scan for common vulnerabilities:**
   ```bash
   # Check for console.log in production code
   grep -r "console\.log" --include="*.ts" --include="*.js" --exclude-dir=node_modules --exclude-dir=__tests__ . || echo "PASS: No console.log found"

   # Check for hardcoded secrets
   grep -rn "password\s*=\s*['\"]" --include="*.ts" --include="*.js" --exclude-dir=node_modules .
   grep -rn "secret\s*=\s*['\"]" --include="*.ts" --include="*.js" --exclude-dir=node_modules .
   grep -rn "api[_-]key\s*=\s*['\"]" --include="*.ts" --include="*.js" --exclude-dir=node_modules .

   # Check .env in git history
   git log --all --full-history -- .env

   # Check for SQL string concatenation
   grep -rn "query.*+.*\"\|query.*\`.*\${" --include="*.ts" --include="*.js" --exclude-dir=node_modules .

   # Check for wildcard CORS
   grep -rn "origin:\s*['\"]\\*['\"]" --include="*.ts" --include="*.js" --exclude-dir=node_modules .

   # Check for tokens in localStorage
   grep -rn "localStorage.*token\|localStorage.*jwt\|localStorage.*auth" --include="*.ts" --include="*.js" --include="*.tsx" --include="*.jsx" --exclude-dir=node_modules .

   # Run npm audit
   npm audit --audit-level=critical 2>/dev/null || echo "SKIP: npm audit not available"
   ```

2. **Review auth/API changes** (if authentication or API files changed):
   - Verify password hashing uses bcrypt/argon2 with minimum 12 rounds
   - Confirm tokens use httpOnly cookies, not localStorage
   - Check JWT secret length (minimum 32 characters, not hardcoded)
   - Verify access token expiration (15–60 minutes)
   - Confirm rate limiting on /login, /register, and public endpoints
   - Verify authorization checks: users can only access their own data
   - Confirm input validation with schema validation (Zod, Joi, etc.)
   - Check that API responses don't expose passwords, hashes, or internal fields
   - Verify error messages don't reveal system internals or file paths
   - Confirm CORS is restricted to specific domains (no wildcard `*`)

3. **Review database changes** (if schema or query files changed):
   - No SQL string concatenation — parameterized queries or ORM only
   - Application uses limited-permission DB user, not root
   - Sensitive fields encrypted at rest

4. **Verdict:**
   - All automated checks pass + manual review clean → **Security: PASSED**
   - Non-critical items flagged → **Security: PASSED WITH WARNINGS** — list items
   - Critical items found (hardcoded secrets, SQL injection, missing auth) → **Security: FAILED** — must fix before shipping

### Phase 4: Code Review

Invoke the code review skill:
- Review against the implementation plan (does the code match the plan?)
- Check for common issues: error handling, edge cases, security
- Verify no debug code left (console.log, TODO comments, commented-out code)

### Phase 5: Report

```
=== Validation Report ===

Automated Checks:
- Lint: PASS / N issues
- Types: PASS / N errors
- Tests: PASS (N/N) / N failures

Visual Verification:
- [Page/Screen]: PASS / FAIL — [description]

Security Verification:
- Hardcoded secrets: PASS / FAIL
- SQL injection vectors: PASS / FAIL
- Console.log in production: PASS / FAIL
- npm audit: PASS / N critical vulnerabilities
- Auth/API review: PASS / FAIL — [details if applicable]
- Overall: PASSED / PASSED WITH WARNINGS / FAILED

Code Review:
- [Finding 1]
- [Finding 2]

Verdict: Ready to ship / Needs fixes

Next: Run /ship when ready, or fix issues and re-run /validate
```
