---
title: "Subagent-Driven Execution: Cost Model and Fit"
type: session-learning
tags: [subagent, execution, cost-model, superpowers]
sources:
  - "raw/sessions/2026-04-25-subagent-driven-execution.md"
related:
  - "[[adversarial-review-multi-lens]]"
created: 2026-04-25
updated: 2026-04-25
status: stub
---

## Summary

`superpowers:subagent-driven-development` runs ~3 subagents per task (implementer + spec reviewer + code quality reviewer), scaling to roughly 3-4× naive single-agent cost. Good fit when tasks are genuinely independent, implementation cost dominates review cost, and quality matters more than token spend. Bad fit for trivial tasks, tightly coupled refactors, or exploratory work. Per-task reviewers do not substitute for batch-level architectural review.

## Key Takeaways

- Use subagent-driven for plans with 5+ independent tasks where review depth pays for itself.
- Pass KB search results into each implementer dispatch to keep context fresh.
- Track per-task re-dispatch count — 3+ rounds usually means the plan step was under-specified.

## Related

- [[adversarial-review-multi-lens]] — the post-batch pass that complements per-task subagent reviews
- [[default-on-hooks-opt-in]] — issue class that subagent reviewers cannot catch
