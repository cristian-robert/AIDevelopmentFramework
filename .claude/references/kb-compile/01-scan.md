# /kb-compile — Phase 1: Scan for Work

Identify what needs compilation:

**Pending/updated raw sources** — read `<KB_PATH>/raw/_manifest.md` and collect every row where `Status` is `pending` or `updated`. Manifest columns:

```
| Source | Date | Type | Raw File | Status | Wiki Article |
```

**Stub articles** — scan all `.md` files in `<KB_PATH>/wiki/` (excluding `_index.md`, `_tags.md`). Read each frontmatter; collect those with `status: stub`.

If a scope argument was given (tag name or filename), filter both lists to matches only.

If both counts are 0 and scope is `all`, exit with the one-liner: `Compiled 0 stubs · KB up to date · Next: /start`.
