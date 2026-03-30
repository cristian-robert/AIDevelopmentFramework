# Test Patterns

Page inventory and common test patterns for the tester-agent.
Populated by /create-rules and updated by /evolve.

## Configuration

- **Base URL:** http://localhost:3000
- **Dev command:** `npm run dev`
- **Auth required:** Yes/No

## Page Inventory

> Populated when /create-rules scans the project's routes/pages.

| Route | Auth Required | Key Elements |
|-------|--------------|-------------|
| `/` | No | Hero section, navigation |
| `/login` | No | Email field, password field, submit button |
| `/dashboard` | Yes | User greeting, sidebar, main content |

## Common UI Elements

> Populated when /create-rules detects component patterns.

- Navigation: [describe nav pattern]
- Forms: [describe form pattern]
- Modals: [describe modal pattern]
- Tables: [describe table pattern]

## Form Patterns

> Populated from codebase analysis.

| Form | Route | Fields | Validation |
|------|-------|--------|------------|
