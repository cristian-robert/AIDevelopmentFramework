# /validate — Phase 7: Report

Write the full structured report (lint/types/tests/visual/QA/security/code-review findings + Phase 6 evolve summary) to `.claude/validate-report.md` (overwrite each run).

## One-line output (per `_shared/output-contract.md`)

- **All clean:** `Validate PASS · checks=lint+types+tests+QA+security+review · evolve=ok · Next: /ship`
- **Warnings only:** `Validate PASS w/ N warnings · evolve=ok · report=.claude/validate-report.md · Next: /ship (warnings reviewed) or fix`
- **Failures:** `Validate FAIL · N critical, M findings · evolve=skipped · report=.claude/validate-report.md · Next: fix and re-run /validate`
- **Evolve subagent failed (validate otherwise OK):** `Validate PASS · evolve=FAIL (advisory; re-run /evolve later) · Next: /ship`
