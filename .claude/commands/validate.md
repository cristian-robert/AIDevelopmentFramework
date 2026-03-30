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

### Phase 3: Code Review

Invoke the code review skill:
- Review against the implementation plan (does the code match the plan?)
- Check for common issues: error handling, edge cases, security
- Verify no debug code left (console.log, TODO comments, commented-out code)

### Phase 4: Report

```
=== Validation Report ===

Automated Checks:
- Lint: PASS / N issues
- Types: PASS / N errors
- Tests: PASS (N/N) / N failures

Visual Verification:
- [Page/Screen]: PASS / FAIL — [description]

Code Review:
- [Finding 1]
- [Finding 2]

Verdict: Ready to ship / Needs fixes

Next: Run /ship when ready, or fix issues and re-run /validate
```
