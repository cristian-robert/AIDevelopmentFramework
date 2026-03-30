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

Combination rules:
- `/frontend-aesthetics` can combine with either of the other two
- Never combine `/frontend-design` + `/ui-ux-pro-max` — they conflict

## Skill Chain

1. **architect-agent RETRIEVE** — understand page/component structure
2. **Design skill** — chosen via gate above
3. **shadcn MCP** — search and install components: `search_items_in_registries`, `view_items_in_registries`, `get_add_command_for_items`
4. **context7 MCP** — verify framework API (Next.js, React, etc.)
5. **tester-agent VERIFY/FLOW** — verify UI after implementation

## Conventions

- Functional components with hooks
- Form handling: React Hook Form + Zod validation
- State: prefer server state (React Query/SWR) over client state
- Styling: follow project convention (Tailwind, CSS Modules, etc.)
- Accessibility: semantic HTML, ARIA labels, keyboard navigation
