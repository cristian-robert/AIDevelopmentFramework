#!/usr/bin/env bash
# .claude/hooks/spec-reviewer-enforce.sh
# PostToolUse hook watching TodoWrite / TaskUpdate completions.
#
# Intent: if a task-implementer dispatch just marked a task completed without
# a paired spec-reviewer dispatch following it, warn (or block) so the
# controller doesn't skip the mandatory review step defined in
# .claude/commands/execute.md Step 3b.
#
# Coupling contract (IMPORTANT):
#   This hook pairs on literal dispatch markers that /execute's controller
#   MUST emit verbatim in its announce text:
#       [dispatch] role=task-implementer task=N
#       [dispatch] role=spec-reviewer task=N
#   The awk patterns below anchor on the exact "[dispatch] role=..." prefix
#   to avoid false negatives from incidental mentions in TodoWrite items
#   (e.g. a todo saying "mark spec-reviewer review in progress" must NOT
#   count as a dispatch). If you change the marker format in execute.md,
#   you MUST update the awk patterns here — otherwise enforcement breaks.
#
# Marker file contract:
#   .claude/.last-impl-task holds "<state>:<epoch>" where state is one of
#   {implementer, reviewer} and epoch is `date +%s` at write time. Markers
#   older than STALE_SECS are treated as stale and are non-blocking.
#
# Robustness:
#   - Handles empty stdin (used by the Step 5 smoke test) without crashing.
#   - Handles missing CLAUDE_TRANSCRIPT_PATH by falling back to the
#     .claude/.last-impl-task marker file, then to a best-effort
#     informational warning (exit 0) so the user at least sees a reminder.
#   - Never crashes the harness on unexpected JSON or missing tools.
set -uo pipefail

PROTOCOL_REF=".claude/references/spec-reviewer-protocol.md"
MARKER_FILE=".claude/.last-impl-task"
STALE_SECS=3600

# Read stdin defensively. `read` would block; `cat` with a guard does not.
input=""
if [ ! -t 0 ]; then
  input="$(cat || true)"
fi

# If stdin is empty (smoke test / no payload), exit cleanly without output.
if [ -z "${input// /}" ]; then
  exit 0
fi

check_transcript() {
  local transcript="$1"
  [ -z "$transcript" ] && return 1
  [ ! -r "$transcript" ] && return 1

  # Scan the tail of the transcript for the most recent implementer and
  # reviewer dispatch markers. We anchor on the canonical literal prefix
  # "[dispatch] role=..." so that stray mentions of "task-implementer" or
  # "spec-reviewer" inside TodoWrite items cannot satisfy the pattern.
  tail -n 80 "$transcript" 2>/dev/null | awk '
    /\[dispatch\] role=task-implementer/ { impl = NR }
    /\[dispatch\] role=spec-reviewer/    { rev  = NR }
    END {
      if (impl && (!rev || rev < impl)) {
        exit 2
      }
      exit 0
    }
  '
}

transcript="${CLAUDE_TRANSCRIPT_PATH:-}"

if [ -n "$transcript" ] && [ -r "$transcript" ]; then
  if ! check_transcript "$transcript"; then
    echo "BLOCK: implementer task completed without spec-reviewer dispatch." >&2
    echo "See $PROTOCOL_REF — every implementer MUST be paired with a spec-reviewer." >&2
    exit 2
  fi
  exit 0
fi

# Fallback 1: marker file written by /execute itself.
# Format: "<state>:<epoch>" where state ∈ {implementer, reviewer}.
# Legacy bare-word form ("implementer" / "reviewer") is still accepted.
if [ -r "$MARKER_FILE" ]; then
  marker_raw="$(cat "$MARKER_FILE" 2>/dev/null || true)"
  marker_state="${marker_raw%%:*}"
  marker_epoch="${marker_raw#*:}"
  # If there was no colon, marker_epoch == marker_raw; treat as no timestamp.
  if [ "$marker_epoch" = "$marker_raw" ]; then
    marker_epoch=""
  fi

  # Staleness check: marker older than STALE_SECS → non-blocking.
  if [ -n "$marker_epoch" ]; then
    now="$(date +%s 2>/dev/null || echo 0)"
    if [ "$now" -gt 0 ] && [ "$marker_epoch" -gt 0 ] 2>/dev/null; then
      age=$(( now - marker_epoch ))
      if [ "$age" -gt "$STALE_SECS" ]; then
        echo "NOTE: $MARKER_FILE is stale (age ${age}s > ${STALE_SECS}s); ignoring." >&2
        exit 0
      fi
    fi
  fi

  case "$marker_state" in
    implementer)
      echo "BLOCK: $MARKER_FILE indicates implementer completed without spec-reviewer dispatch." >&2
      echo "See $PROTOCOL_REF." >&2
      exit 2
      ;;
    reviewer|"")
      exit 0
      ;;
  esac
fi

# Fallback 2: no transcript, no marker — emit an informational reminder
# (non-blocking) so the controller is nudged toward the reviewer step.
echo "NOTE: spec-reviewer-enforce.sh could not locate a session transcript or marker." >&2
echo "      Remember: every task-implementer must be followed by a spec-reviewer." >&2
echo "      Protocol: $PROTOCOL_REF" >&2
exit 0
