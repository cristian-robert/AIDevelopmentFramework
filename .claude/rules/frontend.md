---
description: Frontend development rules — auto-loads when editing frontend/web files
globs: ["**/web/**", "**/frontend/**", "**/app/**", "**/*.tsx", "**/*.jsx", "**/components/**", "**/pages/**"]
---

# Frontend Rules

## Design Skill Gate (mandatory before any UI work)
- Production code → ask 3-way (`/frontend-design` | `/frontend-aesthetics` | `/ui-ux-pro-max`)
- Design artifacts (mockup/prototype/deck/motion/infographic) → `huashu-design`
- Hybrid → huashu-design first, handoff bundle → `/execute` for code phase

Full gate logic + skill-chain steps: `.claude/references/frontend-detail.md`.

## Top conventions (load-bearing)
- Functional components + hooks
- Forms: React Hook Form + Zod
- State: server-first (RQ/SWR)
- a11y: semantic HTML, ARIA, keyboard nav

## Critical checklist
- [ ] Design skill gate answered before UI creation
- [ ] tester-agent VERIFY/FLOW after implementation
- [ ] a11y verified
- [ ] KB wiki updated for new/changed routes or components

## References
- `.claude/references/frontend-detail.md` — full gate, skill chain, conventions
- `.claude/rules/frontend-antislop.md` — co-loads on every UI change
- `.claude/references/code-patterns.md` — project-specific component patterns
- `<kb-path>/wiki/_index.md` — search before building
