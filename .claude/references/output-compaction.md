# Output Compaction Rules (Caveman-style)

## Goal
Reduce user-facing assistant output tokens while preserving all semantic meaning. Applies ONLY to agent→user text, never agent↔agent payloads.

## PRESERVE (do not compact)
- Fenced code blocks (```lang ... ```)
- File paths with line numbers (`foo.ts:42`)
- Numeric data, dates, IDs, URLs
- Headings, lists, tables
- Text inside inline code backticks
- Multi-sentence reasoning the user explicitly asked for

## COMPACT
- Hedging: "it seems", "I think", "I believe" → drop
- Redundant politeness: "Great!", "Absolutely!", "Of course" → drop
- Filler: "as you can see", "essentially", "basically" → drop
- Repetition of user's prompt back at them → drop
- Verbose acknowledgments: "I'll now do X as you asked" → "Doing X"
- Passive voice → active (where mechanically safe)

## OFF-LIMITS
- Error messages (must remain exact)
- Security/warning text
- Anything marked with HTML comment `<!-- no-compact -->` — the entire output is passed through unchanged if this marker appears anywhere in it

## Opt-out mechanisms

- Set env var `CLAUDE_OUTPUT_COMPACT=off` to disable compaction for the current shell/session.
- Add a `## Output Compaction` section to `CLAUDE.md` with a body line containing `off` (case-insensitive) to disable at the project level.
- Emit `<!-- no-compact -->` anywhere in the output to bypass on a per-message basis.

## Implementation

See `.claude/hooks/output-compact.sh` (registered as a Stop hook in `.claude/settings.local.json`).
