# Frontend Rules — Detail

## Design Skill Gate (full)

**Step 0 — branch by deliverable type:**

- **Production app code** (React components, pages, routes, real shipping UI) → ask the 3-way question below
- **Design artifacts** (clickable HTML prototype, slide deck, motion piece, infographic, mockup, pitch one-pager) → use **`huashu-design`** (`npx skills add alchaincyf/huashu-design`). Pre-step: run `/brand-extract` if `.design-system/brand-spec.md` is missing.
- **Hybrid** (artifact → real implementation) → huashu-design first, then handoff bundle feeds `/execute` for the production code path.

**Step 1 — production-code 3-way (only when not using huashu-design):**

1. **`/frontend-design`** — Full page/component creation with bold aesthetics
2. **`/frontend-aesthetics`** — Lightweight guardrails (typography, color, motion)
3. **`/ui-ux-pro-max`** — Design planning and exploration (50 styles, 21 palettes)

`/frontend-aesthetics` combines with either other. Never combine `/frontend-design` + `/ui-ux-pro-max` — they conflict.

## Skill Chain (full)

1. **KB search** (if KB configured) — search for relevant route/component/feature articles
2. **architect-agent RETRIEVE** — understand page/component structure
3. **Design skill** — chosen via gate above
4. **shadcn MCP** — `search_items_in_registries`, `view_items_in_registries`, `get_add_command_for_items`
5. **context7 MCP** — verify framework API (Next.js, React, etc.)
6. **tester-agent VERIFY/FLOW** — verify UI after implementation
7. **KB update** (if KB configured) — update wiki articles for new/changed routes, pages, components

## Conventions (full)

- Functional components with hooks
- Forms: React Hook Form + Zod
- State: prefer server state (React Query/SWR) over client state
- Styling: follow project convention (Tailwind, CSS Modules, etc.)
- Accessibility: semantic HTML, ARIA labels, keyboard navigation

## Checklist (full)

- Design skill gate answered before any UI creation
- tester-agent VERIFY/FLOW run after implementation
- a11y: keyboard nav + ARIA labels + semantic HTML
- Form inputs validated (Zod) with inline error surfaces
- KB wiki articles updated for new/changed routes or components
