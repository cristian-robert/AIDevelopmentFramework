#!/usr/bin/env bash
# cli/hook-compact.test.sh
#
# Regression tests for .claude/hooks/output-compact.sh — specifically the
# inline-backtick preservation fix from the Codex adversarial review.
#
# Each case pipes a known input through the hook and diffs the output against
# the expected string. Exits 0 if all cases pass, 1 otherwise.

set -u

HOOK="$(cd "$(dirname "$0")/.." && pwd)/.claude/hooks/output-compact.sh"

if [ ! -x "$HOOK" ] && [ ! -r "$HOOK" ]; then
  echo "cannot find hook at $HOOK" >&2
  exit 1
fi

pass=0
fail=0

# run_case <name> <input> <expected>
# Forces CLAUDE_OUTPUT_COMPACT=on so the test is deterministic regardless of
# the repo's CLAUDE.md "## Output Compaction" State line. The hook is opt-in
# by default (Finding 1 fix); tests that exercise the compaction filter must
# opt in explicitly.
run_case() {
  local name="$1"
  local input="$2"
  local expected="$3"
  local actual
  actual="$(printf '%s' "$input" | CLAUDE_OUTPUT_COMPACT=on bash "$HOOK")"
  if [ "$actual" = "$expected" ]; then
    echo "  PASS  $name"
    pass=$((pass + 1))
  else
    echo "  FAIL  $name"
    echo "        input:    $(printf '%s' "$input" | od -c | head -2)"
    echo "        expected: $expected"
    echo "        actual:   $actual"
    fail=$((fail + 1))
  fi
}

# run_case_env <name> <input> <expected> <env-var-pairs...>
# Use when the test needs custom env vars or a custom CLAUDE.md context.
run_case_env() {
  local name="$1"; shift
  local input="$1"; shift
  local expected="$1"; shift
  local actual
  actual="$(printf '%s' "$input" | env "$@" bash "$HOOK")"
  if [ "$actual" = "$expected" ]; then
    echo "  PASS  $name"
    pass=$((pass + 1))
  else
    echo "  FAIL  $name"
    echo "        input:    $(printf '%s' "$input" | od -c | head -2)"
    echo "        expected: $expected"
    echo "        actual:   $actual"
    fail=$((fail + 1))
  fi
}

echo ""
echo "output-compact.sh regression tests"
echo ""

# Case 1: single inline backtick literal — "I think" must be preserved.
run_case \
  "inline backtick preserves hedging word" \
  $'Use `I think` as the literal string.\n' \
  'Use `I think` as the literal string.'

# Case 2: multiple inline backticks on one line.
run_case \
  "multiple inline backticks on one line" \
  $'first `I think` middle `Basically` last\n' \
  'first `I think` middle `Basically` last'

# Case 3: inline code plus out-of-backtick hedge — code preserved, hedge stripped.
run_case \
  "inline code preserved while outer hedge is stripped" \
  $'Run `ls -la` to list. I think this works.\n' \
  'Run `ls -la` to list. this works.'

# Case 4: fenced code block preserved (existing behavior).
run_case \
  "fenced code block preserved" \
  $'Intro line.\n```\nI think this is code\n```\nOutro line.\n' \
  $'Intro line.\n```\nI think this is code\n```\nOutro line.'

# Case 5: plain prose still gets stripped.
run_case \
  "plain prose hedge still stripped" \
  $'I think this should be stripped from prose.\n' \
  'this should be stripped from prose.'

# ─── Finding 1: opt-in default (hook is OFF unless explicitly enabled) ──────
#
# These cases run the hook from a temp dir with no CLAUDE.md, or with a
# CLAUDE.md that has "State: off" (or no section at all). In every case the
# hook must pass input through unchanged unless CLAUDE_OUTPUT_COMPACT=on is
# set.

TMP_NOMD="$(mktemp -d)"
TMP_OFF="$(mktemp -d)"
TMP_ON="$(mktemp -d)"
trap 'rm -rf "$TMP_NOMD" "$TMP_OFF" "$TMP_ON"' EXIT

cat >"$TMP_OFF/CLAUDE.md" <<'EOF'
# Project

## Output Compaction

State: off
EOF

cat >"$TMP_ON/CLAUDE.md" <<'EOF'
# Project

## Output Compaction

State: on
EOF

# run_case_dir <name> <dir> <input> <expected> [env-pairs...]
# Runs the hook with cwd=<dir>. Increments pass/fail counters in the parent
# shell (no subshell). Avoids the cd-in-subshell trap that would silently
# drop counter updates.
run_case_dir() {
  local name="$1"; shift
  local dir="$1"; shift
  local input="$1"; shift
  local expected="$1"; shift
  local actual
  local prev_pwd
  prev_pwd="$(pwd)"
  cd "$dir" || { echo "  FAIL  $name (cd to $dir failed)"; fail=$((fail+1)); return; }
  if [ $# -gt 0 ]; then
    actual="$(printf '%s' "$input" | env "$@" bash "$HOOK")"
  else
    actual="$(printf '%s' "$input" | bash "$HOOK")"
  fi
  cd "$prev_pwd" || true
  if [ "$actual" = "$expected" ]; then
    echo "  PASS  $name"
    pass=$((pass + 1))
  else
    echo "  FAIL  $name"
    echo "        expected: $expected"
    echo "        actual:   $actual"
    fail=$((fail + 1))
  fi
}

# Project with no CLAUDE.md → input passes through unchanged
run_case_dir \
  "opt-in default: no CLAUDE.md → pass-through" \
  "$TMP_NOMD" \
  $'I think this passes through.\n' \
  'I think this passes through.'

# Project with CLAUDE.md "State: off" → input passes through unchanged
run_case_dir \
  "opt-in default: State: off → pass-through" \
  "$TMP_OFF" \
  $'I think this stays.\n' \
  'I think this stays.'

# Project with CLAUDE.md "State: on" → compaction runs
run_case_dir \
  "opt-in: State: on → compaction runs" \
  "$TMP_ON" \
  $'I think this is stripped.\n' \
  'this is stripped.'

# Env CLAUDE_OUTPUT_COMPACT=on with no CLAUDE.md section → compaction runs
run_case_dir \
  "opt-in: CLAUDE_OUTPUT_COMPACT=on without section → compaction runs" \
  "$TMP_NOMD" \
  $'I think this gets stripped.\n' \
  'this gets stripped.' \
  CLAUDE_OUTPUT_COMPACT=on

# CLAUDE_OUTPUT_COMPACT=off forces OFF even when section says on
run_case_dir \
  "opt-in: env=off overrides State: on" \
  "$TMP_ON" \
  $'I think this stays.\n' \
  'I think this stays.' \
  CLAUDE_OUTPUT_COMPACT=off

# ─── Finding 4: marker-safe lines preserved even with hedge words ───────────
#
# Lines containing dispatch markers or [no-compact] tags must NEVER be
# touched, even if they also contain a hedge word.

run_case \
  "F4: dispatch marker line preserved with hedge word" \
  $'Starting Task 3: I think this should preserve — [dispatch] role=task-implementer task=3\n' \
  'Starting Task 3: I think this should preserve — [dispatch] role=task-implementer task=3'

run_case \
  "F4: [no-compact] inline tag preserves the line" \
  $'Basically I think this stays. [no-compact]\n' \
  'Basically I think this stays. [no-compact]'

run_case \
  "F4: blockquote line preserved with hedge word" \
  $'> I think the user said this verbatim\n' \
  '> I think the user said this verbatim'

echo ""
echo "$pass passed, $fail failed"
echo ""

if [ "$fail" -gt 0 ]; then
  exit 1
fi
exit 0
