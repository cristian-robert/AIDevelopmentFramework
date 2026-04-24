---
title: "Default-On Hooks Require Explicit Opt-In"
type: session-learning
tags: [hooks, defaults, consent, enforcement, configuration]
sources:
  - "raw/sessions/2026-04-25-default-on-hooks-require-opt-in.md"
related:
  - "[[adversarial-review-multi-lens]]"
  - "[[subagent-driven-execution]]"
created: 2026-04-25
updated: 2026-04-25
status: stub
---

## Summary

Three architectural defects in v0.4 shared a root cause: automation that mutates user-facing state shipped without explicit consent or determinism guarantees. Caveman compaction defaulted to on; the two-index invariant had no joint-rebuild contract; enforcement hooks scanned an intermittent transcript instead of reading a controller-written marker file. Rule: automation that changes what the user sees ships opt-in, split views need one rebuild command, and enforcement hooks read state the controller wrote.

## Key Takeaways

- Hooks that mutate user output ship `State: off` default + visible toggle doc — no exceptions.
- One source of truth = one rebuild command for all derived artifacts; docs never reference artifacts independently.
- Marker-file enforcement (`<state>:<epoch>`) beats transcript scanning for any hook that needs to verify a prior action.

## Related

- [[adversarial-review-multi-lens]] — the review pass that caught all three defects
- [[subagent-driven-execution]] — execution pattern whose per-task reviewers missed these
