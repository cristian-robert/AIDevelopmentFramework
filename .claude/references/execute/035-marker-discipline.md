# /execute — Step 3.5: Marker File Discipline

To make the spec-reviewer enforcement hook deterministic, `/execute` maintains a marker file at `.claude/.last-impl-task`.

## Format

`<state>:<epoch>` where:
- `<state>` is `implementer` or `reviewer`
- `<epoch>` is the current Unix epoch in seconds (`date +%s`)

## Lifecycle

- After dispatching task-implementer (Step 3a) → write `implementer:$(date +%s)` via `.claude/hooks/spec-reviewer-marker.sh write implementer`.
- After spec-reviewer returns PASS (Step 3b) → write `reviewer:$(date +%s)` via `.claude/hooks/spec-reviewer-marker.sh write reviewer`.
- If marker state is `implementer` when the hook fires → BLOCK further tool use.
- **Staleness window: 600 seconds (10 minutes).** Older marker → hook treats as stale, does NOT block (exit 0 with informational warning). For legitimate runs >10min, clear manually with `.claude/hooks/spec-reviewer-marker.sh clear` and retry.
- Marker is gitignored; deleted on successful Step 5 completion via `.claude/hooks/spec-reviewer-marker.sh clear`.

## Hook enforcement (marker-only)

`.claude/hooks/spec-reviewer-enforce.sh` reads ONLY `.claude/.last-impl-task`. No transcript-scanning fallback — deterministic across runtimes regardless of `CLAUDE_TRANSCRIPT_PATH`.

Outcomes:
- Marker absent / empty → allow (no active pair)
- `implementer:<epoch>` within 600s → BLOCK (exit 2)
- `implementer:<epoch>` older than 600s → allow with stale warning to stderr
- `reviewer:<epoch>` → allow (pair complete)
- Malformed marker → BLOCK with fix-up message
