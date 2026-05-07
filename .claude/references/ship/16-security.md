# /ship — Step 1.6: Security Pre-flight Check

Run automated security scans from `.claude/references/security-checklist.md`.

## Quick automated scan

```bash
# Hardcoded secrets
grep -rn "password\s*=\s*['\"]" --include="*.ts" --include="*.js" --exclude-dir=node_modules . && echo "FAIL" || echo "PASS"
grep -rn "secret\s*=\s*['\"]" --include="*.ts" --include="*.js" --exclude-dir=node_modules . && echo "FAIL" || echo "PASS"
grep -rn "api[_-]key\s*=\s*['\"]" --include="*.ts" --include="*.js" --exclude-dir=node_modules . && echo "FAIL" || echo "PASS"

# .env in git history
git log --all --full-history -- .env && echo "WARNING" || echo "PASS"

# SQL injection vectors
grep -rn "query.*+.*\"\|query.*\`.*\${" --include="*.ts" --include="*.js" --exclude-dir=node_modules . && echo "FAIL" || echo "PASS"

# Wildcard CORS
grep -rn "origin:\s*['\"]\\*['\"]" --include="*.ts" --include="*.js" --exclude-dir=node_modules . && echo "FAIL" || echo "PASS"

# Tokens in localStorage
grep -rn "localStorage.*token\|localStorage.*jwt\|localStorage.*auth" --include="*.ts" --include="*.js" --include="*.tsx" --include="*.jsx" --exclude-dir=node_modules . && echo "FAIL" || echo "PASS"

# Console.log in production
grep -r "console\.log" --include="*.ts" --include="*.js" --exclude-dir=node_modules --exclude-dir=__tests__ . && echo "WARNING" || echo "PASS"

# npm audit
npm audit --audit-level=critical 2>/dev/null || echo "SKIP"
```

## Verdicts

- **Any FAIL** → blocker. Stop the ship process. Report failures + require fixes before re-running `/ship`.
- **Only WARNINGs** → ask the user: "Proceed with these warnings, or fix first?"
- **All PASS** → continue to Step 1.7.
