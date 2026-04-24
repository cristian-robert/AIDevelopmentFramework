---
title: "Adversarial Review: Multi-Lens Layering"
type: session-learning
tags: [adversarial-review, code-review, quality-gates]
sources:
  - "raw/sessions/2026-04-25-multi-lens-adversarial-review.md"
related:
  - "[[subagent-driven-execution]]"
  - "[[default-on-hooks-opt-in]]"
created: 2026-04-25
updated: 2026-04-25
status: stub
---

## Summary

Per-task spec/code-quality reviewers, post-batch Codex review, and post-batch Opus review caught different defect classes in v0.4 — tactical, integration, and architectural respectively. Stacking three independent lenses is additive: the per-task pass cannot substitute for the batch-level pass because per-task reviewers have no view of cross-task invariants. Track fix-commit ratio (~22% in this batch) as a release health signal.

## Key Takeaways

- Per-task reviewers find tactical defects; batch reviewers find architectural ones — different scopes, both required.
- Use at least two adversarial reviewers with different vendor backbones to avoid shared blind spots.
- Add a `## Post-review hardening` changelog section so review-caught fixes are visible to users.

## Related

- [[subagent-driven-execution]] — cost model that produced the per-task review pattern
- [[default-on-hooks-opt-in]] — three of the architectural issues caught by the Opus pass
