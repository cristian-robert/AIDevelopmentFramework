---
description: Frontend development rules — auto-loads when editing frontend/web files
globs: ["**/web/**", "**/frontend/**", "**/app/**", "**/*.tsx", "**/*.jsx", "**/components/**", "**/pages/**"]
---

# Frontend Rules

## Design Skill Gate (MANDATORY)

Before creating any UI component or page, ask the user which design approach:

1. **`/frontend-design`** — Full page/component creation with bold aesthetics
2. **`/frontend-aesthetics`** — Lightweight guardrails (typography, color, motion)
3. **`/ui-ux-pro-max`** — Design planning and exploration (50 styles, 21 palettes)

`/frontend-aesthetics` combines with either other. Never combine `/frontend-design` + `/ui-ux-pro-max` — they conflict.

## Skill Chain

1. **KB search** (if KB configured) — search for relevant route/component/feature articles
2. **architect-agent RETRIEVE** — understand page/component structure
3. **Design skill** — chosen via gate above
4. **shadcn MCP** — `search_items_in_registries`, `view_items_in_registries`, `get_add_command_for_items`
5. **context7 MCP** — verify framework API (Next.js, React, etc.)
6. **tester-agent VERIFY/FLOW** — verify UI after implementation
7. **KB update** (if KB configured) — update wiki articles for new/changed routes, pages, components

## Conventions

- Functional components with hooks
- Forms: React Hook Form + Zod validation
- State: prefer server state (React Query/SWR) over client state
- Styling: follow project convention (Tailwind, CSS Modules, etc.)
- Accessibility: semantic HTML, ARIA labels, keyboard navigation

## Checklist

- [ ] Design skill gate answered before any UI creation
- [ ] tester-agent VERIFY/FLOW run after implementation
- [ ] Accessibility: keyboard nav + ARIA labels + semantic HTML
- [ ] Form inputs validated (Zod schema) with inline error surfaces
- [ ] KB wiki articles updated for new/changed routes or components

## References

Load only when the rule triggers:

- `.claude/references/code-patterns.md` — load for project-specific component patterns
- `<kb-path>/wiki/_index.md` — search for existing route/component/feature articles before building
