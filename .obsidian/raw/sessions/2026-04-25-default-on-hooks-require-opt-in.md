---
title: "Default-On Hooks Require Explicit Opt-In"
type: session
tags: [hooks, defaults, consent, enforcement, configuration, session]
sources:
  - "PR #8 (v0.4.0) Opus adversarial review fix"
  - "Commit 3c9ce49"
  - "Caveman compaction Stop hook"
  - "cli/kb-search.js (two-index invariant)"
created: 2026-04-25
updated: 2026-04-25
status: pending-compile
---

## What happened

Three architectural defects surfaced during the Opus adversarial review of v0.4. They look unrelated but share a root cause: automation that mutates user-facing state shipped without explicit consent or determinism guarantees.

### 1. Caveman compaction defaulted to on

The "caveman" output compaction feature added a Stop hook that rewrote final assistant messages into compressed form. Initial design defaulted to enabled. Effect: the hook silently transformed user-facing output before users had ever seen the toggle doc explaining what it did.

Fix in `3c9ce49`: defaults to off. To enable, user writes `State: on` in the compaction config — explicit opt-in. The toggle doc is shown when /setup runs.

### 2. Two-index invariant had no rebuild contract

`cli/kb-search.js index` builds two artifacts:
- TF-IDF index (`_search/index.json`) — full search
- Lean index (`_search/lean-index.json`) — token-budget-friendly summary index

Initial design split them across two CLI commands. Nothing enforced joint rebuild — users could update one and stale the other. Docs mentioned them as separate steps.

Fix in `3c9ce49`: `index` rebuilds both atomically. Docs and rules never mention them as separate operations. The invariant ("if you see one, the other is current to the same source") is now enforced by the single command.

### 3. Marker-file enforcement vs transcript scanning

A new enforcement hook needed to verify a prior controller action had run. Initial implementation scanned the transcript via `CLAUDE_TRANSCRIPT_PATH`. That env var is intermittent across tool calls (sometimes set, sometimes not), and transcripts can be truncated.

Effect: the enforcement check was non-deterministic. It would pass on identical state depending on whether the transcript happened to be available.

Fix in `3c9ce49`: the controller writes a marker file `<state>:<epoch>` to a known location. The enforcement hook reads the marker. Deterministic: state is either there or not, regardless of harness internals.

## What was learned

### Default-on automation that mutates user output is a consent failure

The user did not ask for caveman compaction. The doc explaining it lives in the framework. If the hook activates on first run before the user has read the doc, the user sees a transformed output and cannot reason about it. They also can't easily turn it off because they don't know the toggle exists.

The rule: **automation that changes what the user sees ships opt-in, never opt-out.** Defaults belong only on automation that improves the same output the user would have seen anyway (e.g., linting that fixes obvious typos in error messages). Anything that visibly transforms requires `State: on`.

### Split views of a single source need a single rebuild path

Whenever you split one source-of-truth into two artifacts for performance (full index + lean index, raw schema + generated types, source data + materialized view), the write path must reconstruct all artifacts together. Two separate commands invite drift.

The rule: **one source, one rebuild command, all derived artifacts.** Documentation and tooling never reference the artifacts as independent.

### Determinism beats convenience for enforcement

Transcript scanning is convenient — no controller-side work needed, just read what the harness already has. But "convenient" hides "intermittent." Enforcement hooks must be deterministic; otherwise they become flaky gates that users learn to ignore.

The rule: **enforcement hooks read state the controller wrote, not state the harness might have.** A two-line marker file beats a 50-line transcript parser every time.

## Evidence

- The Opus adversarial review caught all three issues in one pass after a 13-task plan plus per-task reviews and a Codex review had passed.
- Before the fix, caveman compaction would have shipped to v0.4 users as silent default-on transformation. Some users would have reported "Claude is summarizing my output and I don't know why."
- Before the fix, the two-index invariant could be broken by following the docs as written — they showed two commands.
- Before the fix, the enforcement hook was tested in isolation (passed) and integrated (passed sometimes), exactly the symptom of a non-deterministic gate.

## Patterns to apply

1. **For any new hook that mutates user-facing output, ship `State: off` default + visible toggle doc.** No exceptions for "obviously useful" automation.
2. **Audit framework hooks for transcript-scan-based logic.** Replace with marker files written by the controller.
3. **Whenever a CLI command produces N artifacts from one source, expose only one rebuild command.** Docs reference the command; never the artifacts individually.
4. **Add a "consent and determinism" check to architectural review.** For each new automation: "Does the user see what changed?" and "Will this gate pass deterministically on the same state?"
5. **Architectural reviews should run after per-task reviews.** Cross-cutting consent and invariant issues do not surface task-by-task.
