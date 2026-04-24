---
title: "Multi-Lens Adversarial Review During v0.4 Release"
type: session
tags: [adversarial-review, code-review, quality-gates, session]
sources:
  - "PR #8 (v0.4.0) — branch feat/framework-improvements-v0.4"
  - "Plan: docs/superpowers/plans/2026-04-22-framework-improvements-v0.4.md"
  - "Codex review fix commit: 3319b8b"
  - "Opus 4.7 review fix commit: 3c9ce49"
created: 2026-04-25
updated: 2026-04-25
status: pending-compile
---

## What happened

The v0.4 framework release shipped 13 tasks via `superpowers:subagent-driven-development`. Each task had:
- 1 implementer subagent
- 1 spec reviewer subagent
- 1 code quality reviewer subagent

After all 13 tasks completed, we ran two additional adversarial passes against the entire batch:

1. **Codex (GPT-based) adversarial review** — found 3 implementation defects:
   - `update.js` had broken module-level teardown (resource leak across runs)
   - Inline-backtick handling corrupted certain markdown payloads
   - Enforcement check was failing open (passed when it should have blocked)
   - Fix: commit `3319b8b`

2. **Opus 4.7 adversarial review** — found 6 architectural coherence issues:
   - Default-on hooks mutated user-facing output before user could see opt-out doc
   - Two-index invariant: TF-IDF + lean-index had no joint-rebuild contract
   - Non-deterministic enforcement (transcript scanning vs marker file)
   - Undefined hook ordering (no documented sequence guarantees)
   - `settings.local.json` merge was theater (didn't actually merge)
   - Missing security rubric for the new `/merge-configs` command
   - Fix: commit `3c9ce49`

Final stats: 20 commits on branch, 82 passing tests / 0 failing, ~22% fix-commit ratio (5 of 23 commits were review-driven fixes).

## What was learned

### Three independent lenses catch different failure modes

- **Per-task spec/code review** caught tactical issues during execution: word-boundary regression, missing CLAUDE.md rollback path, HELP_TEXT duplication. Good at "did this task do what its plan-step said?"
- **Post-batch Codex** caught implementation holes the per-task reviewers skipped because they were only looking at one task each: module-level teardown (cross-task), default consent (cross-task), enforcement failing open (cross-task).
- **Post-Codex Opus** caught architectural coherence: invariants between artifacts, determinism guarantees, configuration honesty, security rubric gaps.

The 13 per-task reviews together cannot substitute for a batch-level architectural pass, because they have no view of cross-task invariants.

### Fix-commit ratio is a useful quality signal

22% in this batch (5 of 23 commits). Distribution:
- 4 review-round fixes during /execute
- 1 post-Codex fix (`3319b8b`)
- 0 reverts
- 0 hotfix-after-merge

Too low likely means reviews were shallow. Too high likely means plan quality was poor. This batch's distribution (most fixes were implementation defects, not spec misunderstandings) suggests plan was good, reviewers were finding real issues, and the work wasn't shipped half-baked.

One sample is not enough to set thresholds, but worth tracking across batches.

## Evidence

- Codex review caught 3 issues that 13 per-task reviewers missed despite each having full context for their own task. The defects were all at integration/scope boundaries.
- Opus review caught 6 issues that Codex missed despite running immediately after. Different reviewer biases find different defect classes.
- Cumulative: 9 high-value defects caught between PR-ready state and merge — work that would have shipped broken if either gate had been skipped.

## Patterns to apply

1. **Always run a post-batch adversarial review** when /execute spans more than ~5 independent tasks. The cross-task scope gap is real.
2. **Stack at least two adversarial reviewers with different vendor backbones** (e.g., Codex + Opus, Sonnet + Codex). Single-vendor stacks share blind spots.
3. **Track fix-commit ratio as a release health metric.** Not as a gate — as a signal that helps calibrate review depth and plan granularity.
4. **Add a `## Post-review hardening` section to the changelog** so users can see what review gates actually caught — turns invisible quality work into visible value.
5. **Per-task reviewers should not be expected to catch cross-task issues.** Don't lengthen their checklists to compensate; add a batch-level reviewer instead.
