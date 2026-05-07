# /validate — Verification Orchestrator

Comprehensive verification: automated checks, visual testing, QA, security, code review, auto-evolve.

**Output:** one line per `_shared/output-contract.md`.

## Phases (load on demand)

| # | Phase | Reference | Load condition |
|---|-------|-----------|----------------|
| 1 | Automated checks (lint/types/tests) | `validate/01-automated.md` | always |
| 2 | Visual verification + antislop | `validate/02-visual.md` | UI/mobile/API files in diff |
| 2.5 | 5D Visual Critique | `validate/025-5d-critique.md` | `design/<slug>/` files in diff |
| 3 | QA test verification | `validate/03-qa.md` | always |
| 4 | Security verification | `validate/04-security.md` | always |
| 5 | Code review (opus subagent) | `validate/05-code-review.md` | always |
| 6 | Auto-evolve (sonnet subagent) | `validate/06-auto-evolve.md` | Phases 1–5 not FAIL |
| 7 | Report + one-line output | `validate/07-report.md` | always |

## Invariants

- Reviewers are always opus (Phases 5, 2.5). Never downgrade.
- tester-agent/mobile-tester-agent dispatches are sonnet.
- Phase 6 auto-evolve marker `.claude/.evolve-ran` dedupes against `/ship` Step 1.4 fallback.
- Full report routes to `.claude/validate-report.md`; one-liner surfaces the path.

Model selection details: `_shared/model-matrix-summary.md`.
