#!/usr/bin/env bash
# .claude/hooks/spec-reviewer-enforce.sh
# PostToolUse hook watching TodoWrite / TaskUpdate completions.
#
# Intent: if a task-implementer dispatch just marked a task completed without
# a paired spec-reviewer dispatch following it, warn (or block) so the
# controller doesn't skip the mandatory review step defined in
# .claude/commands/execute.md Step 3b.
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
  # reviewer dispatch markers. If an implementer appears without a later
  # reviewer, we consider the pairing violated.
  tail -n 80 "$transcript" 2>/dev/null | awk '
    /task-implementer/       { impl = NR }
    /spec-reviewer/          { rev  = NR }
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
if [ -r "$MARKER_FILE" ]; then
  marker_state="$(cat "$MARKER_FILE" 2>/dev/null || true)"
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
