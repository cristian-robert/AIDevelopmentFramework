---
title: "Subagent-Driven Execution Cost and Fit"
type: session
tags: [subagent, execution, cost-model, superpowers, session]
sources:
  - "PR #8 (v0.4.0)"
  - "superpowers:subagent-driven-development skill"
  - "Plan: docs/superpowers/plans/2026-04-22-framework-improvements-v0.4.md"
created: 2026-04-25
updated: 2026-04-25
status: pending-compile
---

## What happened

The 13-task v0.4 plan was executed using `superpowers:subagent-driven-development`. Per-task dispatch pattern:

1. Dispatch implementer subagent with task spec, plan context, KB hits (via `cli/kb-search.js search`)
2. Dispatch spec reviewer subagent — verifies output matches plan step
3. Dispatch code quality reviewer subagent — verifies output meets rules
4. If reviewers reject, re-dispatch implementer with feedback
5. Repeat until both reviewers pass

Total subagent dispatches across the release:
- Base: 13 tasks × 3 subagents = 39
- Re-dispatches when reviewers rejected: ~6-10 additional
- Final adversarial passes: 2 (Codex + Opus, run from main session, not subagents)
- Approximate total: 45-50 subagent calls

## What was learned

### The cost model is roughly 3-4x naive single-agent execution

For each task you pay:
- 1× implementation cost (same as direct implementation)
- 1× spec review (small — only sees task spec + diff)
- 1× code quality review (small — only sees diff + rules)
- 0-2× re-dispatch iterations (variable)

Per-task overhead is ~2-3x the implementation cost. For a 13-task plan this scales linearly — the subagents don't share state, so there's no amortization.

### When the pattern is a good fit

- **Plan has genuinely independent tasks.** Tasks 1-13 in the v0.4 plan touched mostly separate files; one task could complete and review without blocking others. When tasks share a file, the implementer-reviewer loop runs into merge conflicts.
- **Implementation cost dominates review cost.** Each task was 50-300 LOC of real code; review subagents read that and the spec. Worth it because the review found ~12 real issues across the batch.
- **Cost isn't the bottleneck.** This was a release prep cycle where quality gates mattered more than token spend.

### When it's a bad fit

- **Trivial tasks** (typo fix, dependency bump, single-file rename) — the review subagents add cost without finding anything.
- **Tightly coupled work** (refactor that touches 8 files together) — task decomposition becomes artificial; reviewers can't see the full picture.
- **Exploratory work** — when you don't know yet what "done" means, sub-agent reviewers will reject everything.

### Per-task reviewers cannot replace post-batch review

This is a separate finding (see `[[2026-04-25-multi-lens-adversarial-review]]`) but worth restating: the 39+ per-task review dispatches missed the 9 cross-cutting issues that the post-batch adversarial passes caught. Per-task review is a tactical gate, not an architectural one.

## Evidence

- 13 tasks × ~3 minutes per dispatch × 3 subagents = ~117 minutes of subagent compute, vs ~40 minutes for direct execution.
- Reviewers caught ~12 real issues during the batch (estimate from review-round fix commits in branch history).
- Of those 12, none would have been caught by automated tests alone — they required reading code with intent.
- The 9 cross-task issues caught by post-batch review would not have been caught by per-task reviewers regardless of how many iterations.

## Patterns to apply

1. **Use subagent-driven for plans with 5+ independent tasks where quality matters more than speed.** Below 5 tasks the orchestration overhead dominates.
2. **Don't decompose tightly coupled refactors into "tasks" just to use subagent execution.** Run them as one task or use direct execution.
3. **Always pair subagent-driven execution with a post-batch adversarial review.** They cover different scopes.
4. **Pass KB search results into each implementer dispatch.** This was added to the framework's rule set during this release — `KB_PATH=<path> node cli/kb-search.js search "<keywords>"` before each dispatch.
5. **Track re-dispatch count per task.** Tasks that re-dispatch 3+ times are usually under-specified — that's plan quality feedback.
