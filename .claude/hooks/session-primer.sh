#!/bin/bash
# Hook: Notification (session start)
# Purpose: Shows quick context on session start
# Behavior: INFORM

echo "=== Session Context ==="

BRANCH=$(git branch --show-current 2>/dev/null)
if [ -n "$BRANCH" ]; then
  echo "Branch: $BRANCH"
fi

RECENT=$(git log --oneline -3 2>/dev/null)
if [ -n "$RECENT" ]; then
  echo ""
  echo "Recent commits:"
  echo "$RECENT"
fi

if [ -n "$BRANCH" ] && [ "$BRANCH" != "main" ] && [ "$BRANCH" != "master" ]; then
  PLANS=$(find docs/plans docs/superpowers/plans -name "*.md" -newer .git/HEAD 2>/dev/null | head -3)
  if [ -n "$PLANS" ]; then
    echo ""
    echo "Active plans:"
    echo "$PLANS"
  fi
fi

STATUS=$(git status --short 2>/dev/null | wc -l | tr -d ' ')
if [ "$STATUS" != "0" ]; then
  echo ""
  echo "Uncommitted changes: $STATUS files"
fi

echo "========================"
echo "Run /start to begin or /prime for full context."

exit 0
