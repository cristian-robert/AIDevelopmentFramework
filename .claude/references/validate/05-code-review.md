# /validate — Phase 5: Code Review

Dispatch the code review subagent with **`model: opus`** (Tier 5 per `_shared/model-matrix-summary.md` — never downgrade reviewers).

## Reviewer prompt

The reviewer must:
- Review against the implementation plan (does the code match the plan?)
- Check error handling, edge cases, security
- Verify no debug code (console.log, TODO comments, commented-out code)
- Return findings + verdict (PASS / PASS-WITH-WARNINGS / FAIL) for the Phase 7 report aggregator

## Related subagent dispatches in this command

- Phase 2 visual verification → tester-agent / mobile-tester-agent at **`sonnet`**
- Phase 2.5 5D critique → critique subagent at **`opus`**
- Phase 3 test-placement planning → planner subagent at **`sonnet`**
- Phase 6 auto-evolve → `/evolve` subagent at **`sonnet`**
