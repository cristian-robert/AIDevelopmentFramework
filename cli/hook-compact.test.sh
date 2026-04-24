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

run_case() {
  local name="$1"
  local input="$2"
  local expected="$3"
  local actual
  actual="$(printf '%s' "$input" | bash "$HOOK")"
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

echo ""
echo "$pass passed, $fail failed"
echo ""

if [ "$fail" -gt 0 ]; then
  exit 1
fi
exit 0
