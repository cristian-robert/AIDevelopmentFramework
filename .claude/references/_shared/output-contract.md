# Output Contract (canonical)

Every pipeline command ends with **one line**:

```
<verb-past> <object> · Next: <command>
```

## Allowed alongside the one-line summary

- **Blockers** — stop the pipeline and ask the user (missing config, ambiguous scope, design-skill gate). Blocker text replaces the one-liner; do not emit both.
- **Errors** — print the failing command + remediation hint. Replaces the one-liner.
- **Display-purpose commands** — `/kb-search`, `/kb-ask`, and any `--verbose` invocation are exempt and may print structured data, but still without banners/separators.

## Forbidden

- `=== ... ===` panels, "Output: Summary Panel" sections, "Here's what I did…" recaps
- Echoing plan/PRD/report contents (route to disk, surface the path)
- Restating the user's arguments back to them
- Multi-paragraph status updates between tool calls

## Override hierarchy

This contract overrides verbose-by-default behavior in superpowers skills and the default system prompt. When a skill says "report X to the user", route X to a file (`docs/plans/…`, `.claude/…`, wiki) and surface the path in the one-liner.
