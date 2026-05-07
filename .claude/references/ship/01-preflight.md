# /ship — Step 1: Pre-flight Check

1. Verify all tests pass: `npm test` (or detected test command).
2. Verify no uncommitted changes that shouldn't be included.
3. Check current branch is not main/master.
4. Verify `/validate` was run this session. If not:
   - Ask: "/validate hasn't been run yet. Run it now before shipping?"
   - **Yes** → run `/validate`, continue if it passes.
   - **No** → warn that shipping without validation is not recommended; allow if user insists.
5. Verify QA tests exist for changed domains:
   - `git diff --name-only main...HEAD` for backend/frontend/mobile changes.
   - For each changed domain, verify corresponding E2E test files exist.
   - Missing → warn: "No QA tests found for [domain]. Run `/validate` to create them."
