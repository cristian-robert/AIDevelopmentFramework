# /validate — Phase 2: Visual Verification

Detect what changed:

```bash
git diff --name-only main...HEAD
```

## Visual Pass — Anti-AI-Slop Check

If UI files changed (`.tsx`, `.jsx`, `.vue`, `.css`, `.scss`, `.astro`, `.html`):

1. Load `.claude/rules/frontend-antislop.md` checklist.
2. Dispatch `tester-agent` with `MODE=antislop` (model: `sonnet`).
3. tester-agent screenshots + cross-checks each item against the rule's Conventions.
4. Flag matches against `.claude/references/frontend-antislop-patterns.md`.
5. Findings: blockers (must fix before ship) or notes (non-blocking polish).

## Per-domain checks

**Frontend changed:** dispatch tester-agent with VERIFY queries (model: `sonnet`). Test desktop + mobile viewports. Check: render, navigation, forms.

**Mobile changed:** dispatch mobile-tester-agent with VERIFY queries (model: `sonnet`). Check: visibility, navigation, interactions.

**API/backend changed:** run API tests if they exist. Check status codes. If Supabase: `get_advisors` for schema safety.
