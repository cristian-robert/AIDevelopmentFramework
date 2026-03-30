# AIDevelopmentFramework — Full Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create the complete AIDevelopmentFramework — an open-source agentic AI coding framework with PIV+E loop, progressive disclosure, 10 pipeline commands, 4 agent templates, auto-loading rules, hooks, and CLI tool.

**Architecture:** Layered pipeline — Layer 1 (commands) drives the user-facing workflow, Layer 2 (agents + skills) provides specialist intelligence, Layer 3 (rules + references) provides auto-loading knowledge. External plugins/skills are installed by the user for latest versions; the framework owns the orchestration.

**Tech Stack:** Claude Code CLI (commands, agents, skills, rules, hooks), Node.js (CLI tool), Markdown (all config), Bash (hooks)

---

## File Map

### Root
- Create: `CLAUDE.md` — Framework root config (~140 lines)
- Create: `.claude/settings.local.json` — Permission whitelist
- Create: `package.json` — CLI package definition
- Create: `README.md` — Project overview

### Rules (.claude/rules/)
- Create: `.claude/rules/_global.md` — Always-active rules
- Create: `.claude/rules/backend.md` — Backend domain rules
- Create: `.claude/rules/frontend.md` — Frontend domain rules
- Create: `.claude/rules/mobile.md` — Mobile domain rules
- Create: `.claude/rules/database.md` — Database domain rules
- Create: `.claude/rules/testing.md` — Testing domain rules
- Create: `.claude/rules/_template.md` — Custom domain rule scaffold

### References (.claude/references/)
- Create: `.claude/references/prd-template.md` — PRD structure
- Create: `.claude/references/plan-template.md` — Implementation plan structure
- Create: `.claude/references/claude-md-template.md` — CLAUDE.md generation template
- Create: `.claude/references/issue-template.md` — GitHub issue template
- Create: `.claude/references/code-patterns.md` — Placeholder for project-specific patterns

### Hooks (.claude/hooks/)
- Create: `.claude/hooks/branch-guard.sh` — Block commits to main/master
- Create: `.claude/hooks/plan-required.sh` — Warn if no plan for current branch
- Create: `.claude/hooks/architect-sync.sh` — Remind to update knowledge base
- Create: `.claude/hooks/evolve-reminder.sh` — Remind to run /evolve after PR
- Create: `.claude/hooks/session-primer.sh` — Auto context load on session start

### Agents (.claude/agents/)
- Create: `.claude/agents/architect-agent/AGENT.md`
- Create: `.claude/agents/architect-agent/index.md`
- Create: `.claude/agents/architect-agent/modules/.gitkeep`
- Create: `.claude/agents/architect-agent/frontend/.gitkeep`
- Create: `.claude/agents/architect-agent/shared/patterns.md`
- Create: `.claude/agents/architect-agent/decisions/log.md`
- Create: `.claude/agents/tester-agent/AGENT.md`
- Create: `.claude/agents/tester-agent/test-patterns.md`
- Create: `.claude/agents/tester-agent/auth-state.md`
- Create: `.claude/agents/mobile-tester-agent/AGENT.md`
- Create: `.claude/agents/mobile-tester-agent/screen-patterns.md`
- Create: `.claude/agents/ui-ux-analyzer/AGENT.md`
- Create: `.claude/agents/_template/AGENT.md`

### Skills (.claude/skills/)
- Create: `.claude/skills/e2e-test/SKILL.md`
- Create: `.claude/skills/playwright-cli/SKILL.md`

### Commands (.claude/commands/)
- Create: `.claude/commands/start.md`
- Create: `.claude/commands/prime.md`
- Create: `.claude/commands/create-prd.md`
- Create: `.claude/commands/plan-project.md`
- Create: `.claude/commands/plan-feature.md`
- Create: `.claude/commands/execute.md`
- Create: `.claude/commands/validate.md`
- Create: `.claude/commands/ship.md`
- Create: `.claude/commands/evolve.md`
- Create: `.claude/commands/setup.md`

### Documentation (docs/)
- Create: `docs/methodology.md`
- Create: `docs/getting-started.md`
- Create: `docs/command-reference.md`
- Create: `docs/customization.md`
- Create: `docs/plugin-install-guide.md`

### CLI (cli/)
- Create: `cli/index.js`
- Create: `cli/init.js`

---

## Task 1: Root Configuration

**Files:**
- Create: `CLAUDE.md`
- Create: `.claude/settings.local.json`

- [ ] **Step 1: Create CLAUDE.md**

```markdown
# AIDevelopmentFramework

## Overview

Open-source agentic AI coding framework built on the PIV+E loop (Plan, Implement, Validate, Evolve). Claude Code primary, methodology portable to any AI coding tool.

## Tech Stack

- Claude Code CLI (commands, agents, skills, rules, hooks)
- Node.js (CLI tool)
- GitHub (issues, milestones, PRs)

## Core Principles

1. **Context is precious** — manage it deliberately; recommend context resets for complex work
2. **Plans are artifacts** — they survive session boundaries and pass the "no prior knowledge" test
3. **Discipline scales with complexity** — XL features get full ceremony, S tweaks get fast-tracked
4. **The system self-improves** — every AI mistake becomes a rule, pattern, or guardrail
5. **Ship everything, install nothing** — framework works out of the box; external plugins stay fresh from source

## Pipeline Commands (PIV+E)

| Command | Phase | Purpose |
|---------|-------|---------|
| `/start` | Router | Detects scope level, routes to correct pipeline |
| `/prime` | Plan | Loads codebase context into session |
| `/create-prd` | Plan | Generates PRD from idea (includes brainstorming) |
| `/plan-project` | Plan | Decomposes PRD into GitHub milestones + issues |
| `/plan-feature` | Plan | Creates detailed implementation plan for a feature |
| `/execute` | Implement | Executes plan with TDD, domain skills, parallel agents |
| `/validate` | Validate | Runs verification, testing agents, code review |
| `/ship` | Validate | Commits, pushes, creates PR, finishes branch |
| `/evolve` | Evolve | Updates rules and knowledge base from learnings |
| `/setup` | Utility | Checks installed plugins/skills, reports health |

## Scope Levels

- **L0 (Project):** /brainstorm → /create-prd → /plan-project → /create-rules → per-issue L2
- **L1 (Feature):** /brainstorm → /plan-feature → creates issue(s) → per-issue L2
- **L2 (Issue):** gh issue view → /prime → /writing-plans → /execute → /validate → /ship
- **L3 (Bug):** gh issue view → /prime → /systematic-debugging → fix → /validate → /ship

## Mode Selection

For non-trivial tasks, choose your discipline level:

- **Superpowers Mode:** Full PIV+E pipeline — brainstorm → plan → TDD → execute → verify → review → ship → evolve
- **Standard Mode:** Lighter workflow — plan → implement → validate → ship

## Agents

- **architect-agent** — Codebase knowledge base. Call before structural changes (RETRIEVE/IMPACT/RECORD/PATTERN)
- **tester-agent** — Web browser testing via playwright-cli (VERIFY/FLOW)
- **mobile-tester-agent** — Mobile app testing via mobile-mcp (VERIFY/FLOW)
- **ui-ux-analyzer** — Design audit agent with screenshots and reports

## Rules & References

- Domain-specific rules auto-load from `.claude/rules/` based on file paths being edited
- Reference templates in `.claude/references/` are loaded on-demand by commands
- See `docs/customization.md` for adding custom rules and agents

## External Dependencies

Run `/setup` to check what's installed. See `docs/plugin-install-guide.md` for full list.
```

- [ ] **Step 2: Create .claude/settings.local.json**

```json
{
  "permissions": {
    "allow": [
      "Bash(git *)",
      "Bash(gh *)",
      "Bash(ls *)",
      "Bash(tree *)",
      "Bash(cat *)",
      "Bash(mkdir *)",
      "Bash(npx *)",
      "Bash(npm *)",
      "Bash(pnpm *)",
      "Bash(node *)",
      "WebFetch(*)",
      "WebSearch(*)",
      "mcp__plugin_context7_context7__resolve-library-id",
      "mcp__plugin_context7_context7__query-docs",
      "mcp__shadcn__search_items_in_registries",
      "mcp__shadcn__view_items_in_registries",
      "mcp__shadcn__get_item_examples_from_registries",
      "mcp__shadcn__get_add_command_for_items",
      "mcp__shadcn__list_items_in_registries"
    ],
    "deny": []
  },
  "enableAllProjectMcpServers": true
}
```

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md .claude/settings.local.json
git commit -m "feat: add root CLAUDE.md and settings configuration"
```

---

## Task 2: Rules System

**Files:**
- Create: `.claude/rules/_global.md`
- Create: `.claude/rules/backend.md`
- Create: `.claude/rules/frontend.md`
- Create: `.claude/rules/mobile.md`
- Create: `.claude/rules/database.md`
- Create: `.claude/rules/testing.md`
- Create: `.claude/rules/_template.md`

- [ ] **Step 1: Create _global.md**

This rule is always active regardless of file context.

```markdown
# Global Rules

## Git Workflow

- Branch naming: `{type}/{description}` (e.g., `feat/user-auth`, `fix/login-redirect`)
- Conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`, `test:`
- Always link PRs to GitHub issues
- Never commit directly to main/master — use feature branches

## Code Standards

- TypeScript strict mode where applicable
- Self-documenting code — comments only for non-obvious logic
- No unnecessary abstractions or over-engineering (YAGNI)
- DRY — but three similar lines beats a premature abstraction

## Pipeline Discipline

- For non-trivial work: choose Superpowers or Standard mode before starting
- Plans are mandatory for L/XL tasks — run `/plan-feature` first
- Run `/validate` before claiming work is done
- Run `/evolve` after merging to keep the system improving
```

- [ ] **Step 2: Create backend.md**

```markdown
---
description: Backend development rules — auto-loads when editing backend/server files
globs: ["**/backend/**", "**/server/**", "**/api/**", "**/*.controller.*", "**/*.service.*", "**/*.module.*", "**/*.guard.*", "**/*.middleware.*", "**/*.resolver.*"]
---

# Backend Rules

## Skill Chain

When working on backend code, follow this order:
1. **architect-agent RETRIEVE** — understand current module structure before changes
2. **context7 MCP** — verify framework API (NestJS, FastAPI, Express, etc.) before writing
3. **Database MCP** — if schema changes needed, use Supabase MCP or direct SQL
4. **Implement** — follow patterns from `.claude/references/code-patterns.md`
5. **architect-agent RECORD** — update knowledge base after structural changes

## Conventions

- Every endpoint needs input validation (DTOs/schemas)
- Error responses follow consistent format: `{ error: string, statusCode: number }`
- Business logic lives in services, not controllers
- Database queries go through a repository/service layer
- Environment-specific config via env vars, never hardcoded

## Testing

- Service methods: unit test with mocked dependencies
- Controllers: integration test with real service, mocked DB if needed
- E2E: API endpoint tests with real DB for critical paths
```

- [ ] **Step 3: Create frontend.md**

```markdown
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
```

- [ ] **Step 4: Create mobile.md**

```markdown
---
description: Mobile development rules — auto-loads when editing mobile/native files
globs: ["**/mobile/**", "**/native/**", "**/*.native.*", "**/expo/**"]
---

# Mobile Rules

## Expo Skills (use the right one for the task)

| Task | Skill |
|------|-------|
| Building screens, components, navigation | `/expo-app-design:building-native-ui` |
| API calls, caching, offline support | `/expo-app-design:native-data-fetching` |
| Tailwind/NativeWind setup | `/expo-app-design:expo-tailwind-setup` |
| Dev client builds, TestFlight | `/expo-app-design:expo-dev-client` |
| API routes with EAS Hosting | `/expo-app-design:expo-api-routes` |
| Web code in native webview | `/expo-app-design:use-dom` |
| SwiftUI components | `/expo-app-design:expo-ui-swift-ui` |
| Jetpack Compose components | `/expo-app-design:expo-ui-jetpack-compose` |

## Skill Chain

1. **architect-agent RETRIEVE** — understand screen/navigation structure
2. **Expo skill** — appropriate skill from table above
3. **context7 MCP** — verify Expo/React Native API
4. **mobile-tester-agent VERIFY/FLOW** — verify on simulator after implementation

## Conventions

- Follow Expo Router file-based routing
- Use platform-specific extensions (`.ios.tsx`, `.android.tsx`) only when necessary
- Animations via `react-native-reanimated`
- Navigation state managed by Expo Router, not manually
```

- [ ] **Step 5: Create database.md**

```markdown
---
description: Database rules — auto-loads when editing migrations, schemas, SQL files
globs: ["**/migrations/**", "**/*.sql", "**/schema*", "**/prisma/**", "**/drizzle/**", "**/supabase/**"]
---

# Database Rules

## Skill Chain

1. **Supabase MCP** (if using Supabase): `list_tables` → `execute_sql` → `apply_migration` → `get_advisors`
2. **`/supabase-postgres-best-practices`** — for schema design and query optimization
3. **`/mongodb`** or **`/mongodb-development`** — if using MongoDB

## Conventions

- Every migration is reversible (include up AND down)
- Never modify existing migrations — always create new ones
- Add indexes for frequently queried columns
- Use foreign key constraints for referential integrity
- RLS policies on all user-facing tables (Supabase)

## Post-DDL Checklist

After any schema change:
- [ ] Run Supabase advisors (`get_advisors`) or equivalent linter
- [ ] Verify RLS policies still work
- [ ] Update TypeScript types (`generate_typescript_types` or equivalent)
- [ ] Update architect-agent knowledge base
```

- [ ] **Step 6: Create testing.md**

```markdown
---
description: Testing rules — auto-loads when editing test files
globs: ["**/*.test.*", "**/*.spec.*", "**/test/**", "**/tests/**", "**/__tests__/**", "**/e2e/**"]
---

# Testing Rules

## Test Naming

- Describe behavior, not implementation: `it('returns 404 when user not found')` not `it('tests getUserById')`
- Group by feature/module with `describe` blocks

## Test Structure

- **Arrange** — set up test data and dependencies
- **Act** — call the function/endpoint under test
- **Assert** — verify the result

## What to Test

- Happy path (expected inputs → expected outputs)
- Edge cases (empty inputs, boundary values, null/undefined)
- Error cases (invalid inputs, network failures, permission denied)
- Do NOT test framework internals or third-party libraries

## Mock Policy

- Use real databases for integration tests where possible
- Mock external APIs and third-party services
- Never mock the module under test
- Prefer dependency injection over module mocking

## Coverage

- Critical business logic: aim for high coverage
- UI components: test behavior (clicks, form submissions), not rendering details
- Don't chase 100% — test what matters
```

- [ ] **Step 7: Create _template.md**

```markdown
---
description: <Describe when this rule should load>
globs: ["<glob pattern for file paths>"]
---

# [Domain] Rules

## Skill Chain

1. <First skill or agent to use>
2. <Second skill>
3. <Verification step>

## Conventions

- <Convention 1>
- <Convention 2>
- <Convention 3>

## Checklist

- [ ] <Post-implementation check 1>
- [ ] <Post-implementation check 2>
```

- [ ] **Step 8: Commit**

```bash
git add .claude/rules/
git commit -m "feat: add auto-loading domain rules system (global, backend, frontend, mobile, database, testing)"
```

---

## Task 3: Reference Templates

**Files:**
- Create: `.claude/references/prd-template.md`
- Create: `.claude/references/plan-template.md`
- Create: `.claude/references/claude-md-template.md`
- Create: `.claude/references/issue-template.md`
- Create: `.claude/references/code-patterns.md`

- [ ] **Step 1: Create prd-template.md**

```markdown
# PRD Template

Use this structure when generating a PRD via `/create-prd`.

---

# [Project Name] — Product Requirements Document

## 1. Executive Summary

One paragraph: what is this product, who is it for, what problem does it solve.

## 2. Problem Statement

- What pain point exists today?
- Who experiences it?
- What are they currently doing instead?

## 3. Goals & Success Criteria

| Goal | Metric | Target |
|------|--------|--------|
| | | |

## 4. Target Users

| Persona | Description | Key Needs |
|---------|-------------|-----------|
| | | |

## 5. User Stories

### Epic: [Epic Name]

- [ ] As a [user], I want to [action] so that [benefit]
- [ ] As a [user], I want to [action] so that [benefit]

### Epic: [Epic Name]

- [ ] ...

## 6. Scope

### In Scope (MVP)

- [x] Feature 1
- [x] Feature 2

### Out of Scope (Future)

- [ ] Feature 3
- [ ] Feature 4

## 7. Technical Architecture

### Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | | |
| Backend | | |
| Database | | |
| Auth | | |
| Hosting | | |

### System Diagram

Describe the high-level architecture: which services exist, how they communicate, where data lives.

## 8. Data Model

List core entities, their key fields, and relationships.

## 9. API Design

List key endpoints or API surface area.

| Method | Endpoint | Purpose |
|--------|----------|---------|
| | | |

## 10. UI/UX Overview

Describe key screens/pages and user flows. Reference wireframes if available.

## 11. Implementation Phases

### Phase 1: Foundation (MVP)
- ...

### Phase 2: Enhancement
- ...

### Phase 3: Scale
- ...

## 12. Security Considerations

- Authentication method
- Authorization model
- Data protection
- OWASP concerns

## 13. Performance Requirements

- Response time targets
- Concurrent user capacity
- Data volume expectations

## 14. Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|------------|
| | | | |

## 15. Open Questions

- [ ] Question 1
- [ ] Question 2
```

- [ ] **Step 2: Create plan-template.md**

```markdown
# Implementation Plan Template

Use this structure when generating plans via `/plan-feature`.

---

# [Feature Name] Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** [One sentence]

**Architecture:** [2-3 sentences about approach]

**Tech Stack:** [Key technologies]

**Confidence Score:** [1-10] for one-pass implementation success

**Context Reset:** [Recommended / Not needed] between planning and implementation

---

## Mandatory Reading

Before implementing, read these files to understand the codebase context:

| File | Lines | What to Learn |
|------|-------|--------------|
| `path/to/file` | 1-50 | Pattern for X |

## File Map

### New Files
| File | Responsibility |
|------|---------------|
| `path/to/new/file` | Description |

### Modified Files
| File | Changes |
|------|---------|
| `path/to/existing` | What changes and why |

## Dependencies

Install before starting:
```bash
<install commands if any>
```

## Tasks

### Task 1: [Component Name]

**Files:**
- Create: `exact/path/to/file`
- Modify: `exact/path/to/existing:lines`
- Test: `tests/exact/path/to/test`

- [ ] Step 1: Write the failing test
  ```language
  <actual test code>
  ```

- [ ] Step 2: Run test to verify it fails
  Run: `<exact command>`
  Expected: FAIL with "<message>"

- [ ] Step 3: Write minimal implementation
  ```language
  <actual implementation code>
  ```

- [ ] Step 4: Run test to verify it passes
  Run: `<exact command>`
  Expected: PASS

- [ ] Step 5: Commit
  ```bash
  git add <files>
  git commit -m "<conventional commit message>"
  ```

### Task 2: ...

## Acceptance Criteria

- [ ] Criterion 1
- [ ] Criterion 2

## GOTCHA Warnings

- **GOTCHA:** [Specific pitfall and how to avoid it]
```

- [ ] **Step 3: Create claude-md-template.md**

```markdown
# CLAUDE.md Generation Template

Used by `/create-rules` to auto-generate a project CLAUDE.md.
Fill in sections based on codebase analysis.

---

# [Project Name]

## Overview

[Auto-generated: 1-2 sentences about the project, detected from README/package.json]

## Tech Stack

[Auto-detected from package.json, requirements.txt, go.mod, etc.]

| Layer | Technology |
|-------|-----------|
| Language | |
| Framework | |
| Database | |
| ORM | |
| Auth | |
| Styling | |
| Testing | |
| Package Manager | |

## Pipeline Commands (PIV+E)

| Command | Phase | Purpose |
|---------|-------|---------|
| `/start` | Router | Detects scope level, routes to correct pipeline |
| `/prime` | Plan | Loads codebase context |
| `/create-prd` | Plan | Generates PRD (includes brainstorming) |
| `/plan-project` | Plan | PRD → GitHub milestones + issues |
| `/plan-feature` | Plan | Creates implementation plan |
| `/execute` | Implement | Executes plan with TDD |
| `/validate` | Validate | Verification + testing agents |
| `/ship` | Validate | Commit + push + PR |
| `/evolve` | Evolve | Updates rules + knowledge base |
| `/setup` | Utility | Checks plugin/skill health |

## Project Structure

[Auto-generated: tree -L 2 output of key directories]

```
project/
├── src/          # [detected purpose]
├── tests/        # [detected purpose]
└── ...
```

## Development Commands

[Auto-detected from package.json scripts, Makefile, etc.]

```bash
# Start development
<detected dev command>

# Run tests
<detected test command>

# Build
<detected build command>
```

## Code Conventions

[Auto-detected from codebase analysis]

- [Naming convention: camelCase/snake_case/etc.]
- [Import style: absolute/relative]
- [Component pattern: functional/class]
- [Error handling pattern]

## Agents

- **architect-agent** — Call before structural changes (RETRIEVE/IMPACT/RECORD/PATTERN)
- **tester-agent** — Web UI testing after changes (VERIFY/FLOW)
- **mobile-tester-agent** — Mobile testing after changes (VERIFY/FLOW)
- **ui-ux-analyzer** — Design audits on request

## Rules & References

- Domain rules auto-load from `.claude/rules/` based on file paths
- Code patterns in `.claude/references/code-patterns.md`
- See `docs/customization.md` for extending the framework
```

- [ ] **Step 4: Create issue-template.md**

```markdown
# GitHub Issue Template

Used by `/plan-project` and `/plan-feature` to create structured issues.

---

## Issue Structure

### Title Format
`[type]: brief description`

Types: `feat`, `fix`, `refactor`, `docs`, `chore`, `test`

### Body Template

```markdown
## Description

[1-2 sentences: what needs to be built/fixed and why]

## Acceptance Criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Technical Notes

- Key files to modify: `path/to/file`
- Pattern to follow: [reference existing similar implementation]
- Dependencies: [other issues that must be completed first]

## Size Estimate

[S / M / L / XL]

- **S** (< 1 hour): Config change, copy update, simple fix
- **M** (1-4 hours): Single component/endpoint, moderate logic
- **L** (4-16 hours): Multi-file feature, new module
- **XL** (> 16 hours): Consider breaking into smaller issues
```

### Labels

Apply these labels via `gh issue create --label`:

| Label | When |
|-------|------|
| `feat` | New functionality |
| `fix` | Bug fix |
| `refactor` | Code improvement, no behavior change |
| `docs` | Documentation only |
| `priority:high` | Blocks other work or critical path |
| `priority:medium` | Important but not blocking |
| `priority:low` | Nice to have |
| `size:S/M/L/XL` | Estimated effort |
```

- [ ] **Step 5: Create code-patterns.md**

```markdown
# Code Patterns

This file is generated per-project by `/create-rules`. It contains real code patterns detected from your codebase.

Run `/create-rules` to populate this file with patterns from your actual code.

## How This File Works

When `/create-rules` scans your codebase, it extracts:

1. **Controller/Route patterns** — how endpoints are structured
2. **Service/business logic patterns** — how business logic is organized
3. **Data access patterns** — how database queries are written
4. **Component patterns** — how UI components are structured
5. **Form patterns** — how forms and validation work
6. **Error handling patterns** — how errors are caught and reported
7. **Test patterns** — how tests are structured
8. **Common pitfalls** — mistakes specific to your codebase

Each pattern includes a real code example from your project, so the AI follows YOUR conventions, not generic ones.

## Template

When populating, use this format per pattern:

### [Pattern Name]

**File:** `path/to/example.ts`
**When:** [When to use this pattern]

```language
// Actual code from the project
```

**Key points:**
- [What makes this pattern important]
- [Common mistake to avoid]
```

- [ ] **Step 6: Commit**

```bash
git add .claude/references/
git commit -m "feat: add reference templates (PRD, plan, CLAUDE.md, issue, code patterns)"
```

---

## Task 4: Hooks

**Files:**
- Create: `.claude/hooks/branch-guard.sh`
- Create: `.claude/hooks/plan-required.sh`
- Create: `.claude/hooks/architect-sync.sh`
- Create: `.claude/hooks/evolve-reminder.sh`
- Create: `.claude/hooks/session-primer.sh`

- [ ] **Step 1: Create branch-guard.sh**

```bash
#!/bin/bash
# Hook: PreToolUse on Bash
# Purpose: Prevents direct commits and pushes to main/master
# Behavior: BLOCK

COMMAND="$*"

if echo "$COMMAND" | grep -qE 'git (commit|push).*(main|master)'; then
  echo "BLOCKED: Direct commits/pushes to main/master are not allowed."
  echo "Create a feature branch first: git checkout -b feat/your-feature"
  echo "Then use /ship to commit, push, and create a PR."
  exit 1
fi

exit 0
```

- [ ] **Step 2: Create plan-required.sh**

```bash
#!/bin/bash
# Hook: PreToolUse on Edit/Write (implementation files only)
# Purpose: Warns if no plan file exists for the current branch
# Behavior: WARN (does not block)

BRANCH=$(git branch --show-current 2>/dev/null)

if [ -z "$BRANCH" ] || [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
  exit 0
fi

PLAN_EXISTS=$(find docs/plans docs/superpowers/plans -name "*.md" 2>/dev/null | head -1)

if [ -z "$PLAN_EXISTS" ]; then
  echo "NOTE: No implementation plan found for this branch."
  echo "For L/XL tasks, consider running /plan-feature first."
  echo "For small tasks, this is fine — carry on."
fi

exit 0
```

- [ ] **Step 3: Create architect-sync.sh**

```bash
#!/bin/bash
# Hook: PostToolUse on Write/Edit
# Purpose: Reminds to update architect-agent after structural changes
# Behavior: REMIND

FILE="$1"

if echo "$FILE" | grep -qE '\.(module|controller|service|guard|middleware|resolver)\.(ts|js)$'; then
  echo "REMINDER: Structural file changed. After completing this feature,"
  echo "run architect-agent RECORD to update the codebase knowledge base."
fi

if echo "$FILE" | grep -qE '(migration|schema|\.sql)'; then
  echo "REMINDER: Database schema changed. Run architect-agent RECORD"
  echo "and check Supabase advisors (get_advisors) for security/performance."
fi

exit 0
```

- [ ] **Step 4: Create evolve-reminder.sh**

```bash
#!/bin/bash
# Hook: Stop (after PR-related commands)
# Purpose: Reminds to run /evolve after merging
# Behavior: REMIND

echo ""
echo "If you just merged a PR, run /evolve to:"
echo "  - Update CLAUDE.md with learnings from this session"
echo "  - Update architect-agent knowledge base"
echo "  - Improve the system for next time"
echo ""

exit 0
```

- [ ] **Step 5: Create session-primer.sh**

```bash
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
```

- [ ] **Step 6: Make hooks executable and commit**

```bash
chmod +x .claude/hooks/*.sh
git add .claude/hooks/
git commit -m "feat: add pipeline hooks (branch-guard, plan-required, architect-sync, evolve-reminder, session-primer)"
```

---

## Task 5: Architect Agent

**Files:**
- Create: `.claude/agents/architect-agent/AGENT.md`
- Create: `.claude/agents/architect-agent/index.md`
- Create: `.claude/agents/architect-agent/modules/.gitkeep`
- Create: `.claude/agents/architect-agent/frontend/.gitkeep`
- Create: `.claude/agents/architect-agent/shared/patterns.md`
- Create: `.claude/agents/architect-agent/decisions/log.md`

- [ ] **Step 1: Create AGENT.md**

```markdown
# Architect Agent

Project architecture knowledge base. Call before creating/modifying modules, routes, DB tables, or endpoints.

## Query Types

### RETRIEVE domain:<area>
Returns: file map, endpoints, DB tables, integration points, gotchas for the specified domain.
Read `index.md` to find the right domain file, then read that file.

### IMPACT
Analyzes what a planned change will affect.
Read relevant domain files, trace dependencies, report:
- Files that will need changes
- Other modules that integrate with this area
- Database tables affected
- Potential breaking changes
- Patterns to follow (from shared/patterns.md)

### RECORD domain:<area>
Main agent reports that changes were made. Verify the changes exist, then update the relevant domain file and index.md.
- Use Glob and Grep to verify new files/endpoints exist
- Update the domain knowledge file with new information
- Add a decision to decisions/log.md if this was an architectural choice

### PATTERN
Returns established conventions from shared/patterns.md.
Read the patterns file and return relevant conventions.

## Tools

- Read, Glob, Grep — for codebase exploration
- Edit, Write — for updating knowledge base files

## Response Format

- Max ~30 lines per response
- Structured: use tables and bullet lists
- Include file paths with line numbers where relevant
- Flag GOTCHA warnings for known pitfalls

## Knowledge Base Structure

```
architect-agent/
├── index.md          ← TOC: lists all domains with brief descriptions
├── modules/          ← One file per backend module/domain
├── frontend/         ← Frontend-specific knowledge (routes, components)
├── shared/
│   └── patterns.md   ← Cross-cutting conventions and patterns
└── decisions/
    └── log.md        ← Architecture decision records
```

## Initialization

When first set up for a project, the main agent should:
1. Run /prime to understand the codebase
2. Use RECORD to populate initial domain files from codebase exploration
3. The knowledge base grows organically as RECORD queries accumulate
```

- [ ] **Step 2: Create index.md**

```markdown
# Architecture Knowledge Base — Index

This file is the table of contents for the architect-agent knowledge base.
It is populated by RECORD queries as the project evolves.

## How to Use

- **RETRIEVE domain:X** — Look up domain X below, read the linked file
- **IMPACT** — Read relevant domains, trace dependencies
- **RECORD domain:X** — After changes, update the linked file
- **PATTERN** — Read `shared/patterns.md`

## Domains

> This section is populated as the project grows. Run architect-agent RECORD to add domains.

| Domain | File | Description |
|--------|------|-------------|
| _example_ | `modules/example.md` | _Example: authentication module — endpoints, guards, strategies_ |

## Frontend

| Area | File | Description |
|------|------|-------------|
| _example_ | `frontend/routes.md` | _Example: route map and page inventory_ |

## Shared

| Resource | File |
|----------|------|
| Cross-cutting patterns | `shared/patterns.md` |
| Architecture decisions | `decisions/log.md` |
```

- [ ] **Step 3: Create shared/patterns.md**

```markdown
# Cross-Cutting Patterns

Conventions that apply across all domains. Updated by architect-agent RECORD and /evolve.

## Naming Conventions

> Populated by /create-rules when it analyzes the codebase.

## File Organization

> Populated by /create-rules when it analyzes the codebase.

## Error Handling

> Populated by /create-rules when it analyzes the codebase.

## API Design

> Populated by /create-rules when it analyzes the codebase.
```

- [ ] **Step 4: Create decisions/log.md**

```markdown
# Architecture Decision Log

Records of significant architectural choices and their rationale.
Added by architect-agent RECORD when structural decisions are made.

## Format

### ADR-NNN: [Decision Title]

**Date:** YYYY-MM-DD
**Status:** Accepted / Superseded by ADR-XXX
**Context:** Why was this decision needed?
**Decision:** What was decided?
**Consequences:** What are the implications (positive and negative)?

---

> No decisions recorded yet. Decisions are added as the project evolves.
```

- [ ] **Step 5: Create .gitkeep files and commit**

```bash
touch .claude/agents/architect-agent/modules/.gitkeep
touch .claude/agents/architect-agent/frontend/.gitkeep
git add .claude/agents/architect-agent/
git commit -m "feat: add architect-agent with knowledge base structure"
```

---

## Task 6: Tester Agent

**Files:**
- Create: `.claude/agents/tester-agent/AGENT.md`
- Create: `.claude/agents/tester-agent/test-patterns.md`
- Create: `.claude/agents/tester-agent/auth-state.md`

- [ ] **Step 1: Create AGENT.md**

```markdown
# Tester Agent

Browser testing agent. Runs playwright-cli to verify web UI renders correctly and user flows work. Reports concise pass/fail results.

## Query Types

### VERIFY page:<path> Checks: <list>
Spot-checks on a single page. Navigate to the page, verify each check.

Example:
```
VERIFY page:/dashboard Checks: renders heading, shows user name, sidebar has 5 links
```

### FLOW: <scenario> Steps: 1. ... 2. ...
Multi-step user journey. Execute steps in order, verify each one.

Example:
```
FLOW: User login Steps: 1. Navigate to /login 2. Fill email and password 3. Click submit 4. Verify redirected to /dashboard
```

## Tools

- **Bash** — run playwright-cli commands
- **Read** — read test-patterns.md and auth-state.md

## Setup

1. Read `test-patterns.md` to understand the page inventory
2. Read `auth-state.md` for login credentials if testing authenticated pages
3. Launch browser: `npx playwright-cli open <base-url>`

## Configuration

- **Base URL:** Read from test-patterns.md (default: http://localhost:3000)
- **Dev command:** Read from test-patterns.md

## Response Format

- Max ~20 lines per response
- PASS or FAIL per check
- On FAIL: include screenshot and brief description of what went wrong
- On PASS: one-line confirmation, no screenshot
```

- [ ] **Step 2: Create test-patterns.md**

```markdown
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
```

- [ ] **Step 3: Create auth-state.md**

```markdown
# Auth State

Test credentials for the tester-agent. Fill in when setting up the project.

## Test User

- **Email:** test@example.com
- **Password:** testpassword123

## Login Flow

1. Navigate to `/login`
2. Fill email field
3. Fill password field
4. Click submit button
5. Wait for redirect to `/dashboard`

## Session Management

- Auth state is stored in browser cookies/localStorage
- If session expires, re-run the login flow above
- For persistent state, save browser state after login
```

- [ ] **Step 4: Commit**

```bash
git add .claude/agents/tester-agent/
git commit -m "feat: add tester-agent with test patterns and auth state templates"
```

---

## Task 7: Mobile Tester Agent

**Files:**
- Create: `.claude/agents/mobile-tester-agent/AGENT.md`
- Create: `.claude/agents/mobile-tester-agent/screen-patterns.md`

- [ ] **Step 1: Create AGENT.md**

```markdown
# Mobile Tester Agent

Mobile app testing agent. Uses mobile-mcp tools to test Expo/React Native apps on iOS simulator. Reports concise pass/fail results.

## Query Types

### VERIFY screen:<ScreenName> Checks: <list>
Spot-checks on a single screen.

Example:
```
VERIFY screen:HomeScreen Checks: renders header, shows tab bar, lists 3 items
```

### FLOW: <scenario> Steps: 1. ... 2. ...
Multi-step user journey on mobile.

Example:
```
FLOW: Add item Steps: 1. Tap + button 2. Fill title field 3. Tap save 4. Verify item appears in list
```

## Tools

- **mobile-mcp tools:** mobile_list_available_devices, mobile_launch_app, mobile_take_screenshot, mobile_click_on_screen_at_coordinates, mobile_type_keys, mobile_swipe_on_screen, mobile_press_button, mobile_list_elements_on_screen
- **Read** — read screen-patterns.md and auth-state.md

## App Launch Sequence

1. `mobile_list_available_devices` — find booted iOS simulator
2. `mobile_launch_app` or `mobile_open_url` with Expo URL
3. `mobile_take_screenshot` — verify app loaded
4. If login required: read `../tester-agent/auth-state.md` and authenticate

## Response Format

- Max ~20 lines per response
- PASS or FAIL per check
- On FAIL: include screenshot and brief description
- On PASS: one-line confirmation, no screenshot

## Navigation

- **Tab bar:** Tap coordinates from screen-patterns.md
- **Back:** `mobile_swipe_on_screen` from left edge or tap back button
- **Scroll:** `mobile_swipe_on_screen` vertical
```

- [ ] **Step 2: Create screen-patterns.md**

```markdown
# Screen Patterns

Screen inventory and navigation patterns for the mobile-tester-agent.
Populated by /create-rules and updated by /evolve.

## Configuration

- **App URL:** exp://localhost:8081
- **Dev command:** `npx expo start`
- **Platform:** iOS Simulator

## Navigation Structure

> Populated when /create-rules scans the mobile app's routing.

### Tab Bar
| Tab | Screen | Icon Position (approx) |
|-----|--------|----------------------|
| Home | HomeScreen | Bottom-left |
| Search | SearchScreen | Bottom-center-left |
| Profile | ProfileScreen | Bottom-right |

### Stack Screens
| Parent | Screen | Trigger |
|--------|--------|---------|
| Home | DetailScreen | Tap list item |

## Screen Inventory

> Populated when /create-rules scans the mobile app's screens.

| Screen | Auth Required | Key Elements |
|--------|--------------|-------------|
| HomeScreen | No | Header, list, tab bar |
| LoginScreen | No | Email field, password field, submit |
| ProfileScreen | Yes | Avatar, name, settings list |

## Common Patterns

- **Pull to refresh:** Swipe down from top of list
- **Infinite scroll:** Swipe up at bottom of list
- **Modal dismiss:** Swipe down from modal header or tap X
```

- [ ] **Step 3: Commit**

```bash
git add .claude/agents/mobile-tester-agent/
git commit -m "feat: add mobile-tester-agent with screen patterns template"
```

---

## Task 8: UI/UX Analyzer Agent + Agent Template

**Files:**
- Create: `.claude/agents/ui-ux-analyzer/AGENT.md`
- Create: `.claude/agents/_template/AGENT.md`

- [ ] **Step 1: Create ui-ux-analyzer AGENT.md**

```markdown
# UI/UX Analyzer Agent

Professional UI/UX audit agent. Discovers pages, captures full-page screenshots (desktop and mobile viewports), analyzes design quality, and produces a detailed audit report with actionable findings.

## How to Invoke

Provide the base URL and optionally credentials:
```
Audit the UI at http://localhost:3000
Credentials: test@example.com / testpassword123
```

## Process

1. **Discover pages** — Read tester-agent/test-patterns.md for page inventory, or crawl from the base URL
2. **Capture screenshots** — For each page:
   - Desktop viewport (1440px)
   - Tablet viewport (768px)
   - Mobile viewport (375px)
3. **Analyze** each page for:
   - Visual hierarchy and layout
   - Typography consistency
   - Color usage and contrast (WCAG AA)
   - Spacing and alignment
   - Responsive behavior
   - Interactive element sizing (touch targets)
   - Loading states and empty states
   - Error state handling
4. **Generate report** — Write to `.claude/ui-audit/AUDIT_REPORT.md`

## Tools

- **Bash** — run agent-browser commands for navigation and screenshots
- **Read, Glob, Grep** — read project files and patterns
- **Write** — generate audit report

## Report Format

```markdown
# UI/UX Audit Report

**Date:** YYYY-MM-DD
**Base URL:** <url>
**Pages audited:** N

## Summary

[Overall assessment: 1-2 paragraphs]

## Findings

### [Finding Title]
- **Severity:** Critical / Major / Minor / Enhancement
- **Page(s):** /path
- **Description:** What the issue is
- **Screenshot:** [reference]
- **Recommendation:** How to fix it

## Scores

| Category | Score (1-10) |
|----------|-------------|
| Visual Design | |
| Consistency | |
| Accessibility | |
| Responsiveness | |
| Overall | |
```

## After Audit

The main agent should:
1. Read `.claude/ui-audit/AUDIT_REPORT.md`
2. Create GitHub issues for each Critical/Major finding
3. Add Minor/Enhancement findings to a tracking issue
```

- [ ] **Step 2: Create _template/AGENT.md**

```markdown
# [Agent Name]

[One-line description of what this agent does]

## Query Types

### [QUERY_TYPE_1] [parameters]
[Description of what this query does and what it returns]

### [QUERY_TYPE_2] [parameters]
[Description]

## Tools

- [Tool 1] — [what it's used for]
- [Tool 2] — [what it's used for]

## Response Format

- Max ~[20-30] lines per response
- [Format guidelines]

## Knowledge Base

```
agent-name/
├── AGENT.md      ← This file (protocol definition)
└── [other files]  ← Agent-specific knowledge files
```

## Usage Example

```
Agent: [QUERY_TYPE_1] [example parameters]
→ Agent responds with: [example output format]
```
```

- [ ] **Step 3: Commit**

```bash
git add .claude/agents/ui-ux-analyzer/ .claude/agents/_template/
git commit -m "feat: add ui-ux-analyzer agent and agent scaffold template"
```

---

## Task 9: Framework-Specific Skills

**Files:**
- Create: `.claude/skills/e2e-test/SKILL.md`
- Create: `.claude/skills/playwright-cli/SKILL.md`

- [ ] **Step 1: Create e2e-test SKILL.md**

```markdown
---
name: e2e-test
description: End-to-end testing orchestration. Discovers user journeys, runs browser tests, validates database state, auto-fixes bugs found during testing, generates report.
---

# E2E Test Skill

Orchestrates a comprehensive end-to-end testing run across the application.

## When to Use

- After implementing a feature (before /ship)
- As part of /validate
- When verifying existing functionality still works

## Process

### Phase 1: Pre-flight
1. Check that the application is running (curl the base URL)
2. If not running, start it using the dev command from test-patterns.md
3. Verify agent-browser or playwright-cli is available

### Phase 2: Discovery
Launch 2-3 parallel sub-agents to gather intelligence:

**Agent 1 — App Structure:**
- Read tester-agent/test-patterns.md
- Identify all user-facing pages/routes
- Map critical user journeys (signup, login, use feature, logout)

**Agent 2 — Data Flows:**
- Read architect-agent knowledge base
- Identify data-modifying operations (create, update, delete)
- Note expected database state changes

**Agent 3 — Bug Hunting:**
- Read recent git changes (git diff main...HEAD)
- Identify areas most likely to have bugs
- Prioritize testing for changed code paths

### Phase 3: Test Execution

For each discovered user journey:

1. **Navigate** to the starting page
2. **Execute** each step in the journey
3. **Verify** UI state after each step (elements visible, correct content)
4. **Verify** database state after data-modifying steps (query DB directly)
5. **Test** at 3 viewports: desktop (1440px), tablet (768px), mobile (375px)
6. **Screenshot** on failures only

### Phase 4: Fix Loop

When a test fails:
1. Diagnose the root cause
2. Fix the code
3. Re-run the failing step
4. Screenshot the fix
5. Continue testing

### Phase 5: Report

Generate a test report:

```markdown
# E2E Test Report — YYYY-MM-DD

## Summary
- Journeys tested: N
- Steps executed: N
- Passed: N
- Failed: N (M auto-fixed)

## Journeys

### [Journey Name]
- Status: PASS / FAIL
- Steps: N/N passed
- Viewports: desktop, tablet, mobile
- Fixes applied: [list if any]

## Auto-Fixes Applied
- [File: change description]

## Remaining Issues
- [Issue description — create GitHub issue]
```
```

- [ ] **Step 2: Create playwright-cli SKILL.md**

```markdown
---
name: playwright-cli
description: Browser automation command reference for playwright-cli. Navigation, interaction, screenshots, forms, state management, debugging.
---

# Playwright CLI Reference

## Core Commands

### Navigation
```bash
npx playwright-cli open <url>              # Open URL
npx playwright-cli navigate <url>          # Navigate to URL
npx playwright-cli snapshot                # Get DOM snapshot with element refs
```

### Interaction
```bash
npx playwright-cli click <ref>             # Click element by ref from snapshot
npx playwright-cli fill <ref> <value>      # Fill input field
npx playwright-cli select <ref> <value>    # Select dropdown option
npx playwright-cli check <ref>             # Check checkbox
npx playwright-cli uncheck <ref>           # Uncheck checkbox
npx playwright-cli hover <ref>             # Hover over element
npx playwright-cli press <key>             # Press keyboard key
npx playwright-cli type <text>             # Type text (character by character)
```

### Screenshots and Recording
```bash
npx playwright-cli screenshot <path>       # Take screenshot
npx playwright-cli screenshot --full <path> # Full page screenshot
npx playwright-cli video start <path>      # Start recording
npx playwright-cli video stop              # Stop recording
```

### Waiting
```bash
npx playwright-cli wait <ref>              # Wait for element visible
npx playwright-cli wait-hidden <ref>       # Wait for element hidden
npx playwright-cli wait-navigation         # Wait for page navigation
```

### Dialog Handling
```bash
npx playwright-cli dialog accept           # Accept alert/confirm/prompt
npx playwright-cli dialog dismiss          # Dismiss dialog
npx playwright-cli dialog accept <text>    # Accept prompt with text
```

### Session and State
```bash
npx playwright-cli storage save <path>     # Save browser state (cookies, localStorage)
npx playwright-cli storage load <path>     # Load saved state
npx playwright-cli cookies get             # Get all cookies
npx playwright-cli cookies clear           # Clear cookies
```

### Network
```bash
npx playwright-cli network intercept <pattern> <response-file>  # Mock network request
npx playwright-cli network log             # Show network requests
```

### Viewport
```bash
npx playwright-cli viewport <width> <height>  # Set viewport size
```

## Common Patterns

### Login Flow
```bash
npx playwright-cli open http://localhost:3000/login
npx playwright-cli snapshot
npx playwright-cli fill ref:email "test@example.com"
npx playwright-cli fill ref:password "testpassword123"
npx playwright-cli click ref:submit
npx playwright-cli wait-navigation
npx playwright-cli snapshot  # Verify dashboard loaded
npx playwright-cli storage save auth-state.json  # Save for reuse
```

### Responsive Testing
```bash
# Desktop
npx playwright-cli viewport 1440 900
npx playwright-cli screenshot desktop.png

# Tablet
npx playwright-cli viewport 768 1024
npx playwright-cli screenshot tablet.png

# Mobile
npx playwright-cli viewport 375 812
npx playwright-cli screenshot mobile.png
```
```

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/
git commit -m "feat: add e2e-test and playwright-cli skills"
```

---

## Task 10: Command — /start (Smart Router)

**Files:**
- Create: `.claude/commands/start.md`

- [ ] **Step 1: Create start.md**

```markdown
# /start — Smart Pipeline Router

You are the entry point to the AIDevelopmentFramework PIV+E pipeline. Your job is to detect where the user is in their workflow and route them to the right commands.

## Step 1: Gather Context

Run these in parallel:
1. Check if `CLAUDE.md` exists in the project root (not the framework's own CLAUDE.md)
2. Check if any PRD exists: `find docs/plans -name "PRD*" -o -name "prd*" 2>/dev/null`
3. Check current git branch and status
4. Check for existing GitHub issues: `gh issue list --limit 5 2>/dev/null`
5. Check for existing plan files: `find docs/plans docs/superpowers/plans -name "*.md" 2>/dev/null`

## Step 2: Detect Scope Level

Based on context, determine the entry point:

**L-1 (Onboard)** — No CLAUDE.md found for the project
→ "This project hasn't been set up with the framework yet."
→ Suggest: `/prime` then `/create-rules` then come back to `/start`

**L0 (New Project)** — No PRD, no issues, minimal/no code
→ "Looks like a fresh project. Let's plan it from scratch."
→ Route to: `/create-prd` then `/plan-project`

**L1 (New Feature)** — Project exists, user has a feature idea (no specific issue)
→ "Let's plan this feature."
→ Route to: `/plan-feature`

**L2 (Issue Work)** — User has or references a specific issue number
→ "Let's work on this issue."
→ Route to: `/prime` then `/plan-feature #<issue>` or direct `/execute` if plan exists

**L3 (Bug Fix)** — User describes a bug or references a bug issue
→ "Let's debug this."
→ Route to: `/prime` then use superpowers:systematic-debugging

## Step 3: Ask if Uncertain

If the scope level isn't clear from context, ask:

> **What are you working on today?**
>
> 1. **Starting a new project from an idea** (L0 — full planning pipeline)
> 2. **Building a new feature** (L1 — brainstorm + plan + implement)
> 3. **Working on a specific GitHub issue** (L2 — plan + implement)
> 4. **Fixing a bug** (L3 — debug + fix)
> 5. **Joining this project for the first time** (L-1 — onboard)

## Step 4: Mode Selection

For L0, L1, and complex L2 tasks, ask:

> **Which mode?**
>
> - **Superpowers Mode** — Full discipline: brainstorm, plan, TDD, execute, verify, review, ship, evolve
> - **Standard Mode** — Lighter: plan, implement, validate, ship

For L3 (bugs) and simple L2 (size S/M), default to Standard Mode without asking.

## Step 5: Route

Execute the appropriate command chain based on the detected level and chosen mode. Provide the user with a brief summary of what will happen next.
```

- [ ] **Step 2: Commit**

```bash
git add .claude/commands/start.md
git commit -m "feat: add /start smart router command"
```

---

## Task 11: Command — /prime (Context Loader)

**Files:**
- Create: `.claude/commands/prime.md`

- [ ] **Step 1: Create prime.md**

```markdown
# /prime — Context Loader

Load the full codebase context into the current session. Run at the start of any session, after a context reset, or when switching tasks.

## Process

Run these in parallel for speed:

### 1. Project Structure
```bash
git ls-files | head -200
```
```bash
tree -L 3 -I 'node_modules|.next|dist|build|.git|__pycache__|.expo' --dirsfirst
```

### 2. Project Documentation
Read these files if they exist:
- `CLAUDE.md` (project root)
- `README.md`
- `docs/plans/PRD.md` (or latest PRD)
- Any plan file matching the current branch name

### 3. Recent History
```bash
git log --oneline -10
```
```bash
git status --short
```
```bash
git branch --show-current
```

### 4. Active Context
- If on a feature branch, extract the issue number from the branch name
- If issue number found: `gh issue view <number>`
- Check for existing plan: look for files in `docs/plans/` or `docs/superpowers/plans/` matching branch name

### 5. Configuration
- Read `.claude/agents/architect-agent/index.md` (knowledge base TOC)
- Read `.claude/agents/tester-agent/test-patterns.md` (page inventory)
- Check `package.json` or equivalent for available scripts/commands

## Output Format

Present a structured summary:

```
=== Project Context ===

Project: [name from package.json/CLAUDE.md]
Branch: [current branch]
Issue: [linked issue if found, or "none"]
Plan: [active plan file if found, or "none"]

Structure: [key directories and their purposes]

Recent Activity:
[last 5 commits, one line each]

Uncommitted Changes:
[summary of staged/unstaged changes]

Available Commands:
[dev, test, build commands from package.json]

Knowledge Base: [N domains documented in architect-agent]

=== Ready. Run /start to begin or specify a command. ===
```
```

- [ ] **Step 2: Commit**

```bash
git add .claude/commands/prime.md
git commit -m "feat: add /prime context loader command"
```

---

## Task 12: Command — /create-prd

**Files:**
- Create: `.claude/commands/create-prd.md`

- [ ] **Step 1: Create create-prd.md**

```markdown
# /create-prd — Product Requirements Document Generator

Generate a comprehensive PRD from a product idea. This command ALWAYS starts with brainstorming.

## Arguments

- `$ARGUMENTS` — optional: the product idea in brief (can also be discussed interactively)

## Process

### Phase 1: Brainstorm (MANDATORY)

Invoke the brainstorming skill to explore the idea before writing anything:

1. If `$ARGUMENTS` is provided, use it as the starting point
2. If not, ask: "What are you building? Give me the elevator pitch."
3. Explore through conversation:
   - What problem does this solve?
   - Who is the target user?
   - What are the constraints (timeline, budget, team size, tech preferences)?
   - What does success look like?
   - What's explicitly OUT of scope?
4. Propose 2-3 architectural approaches with tradeoffs
5. Get user's choice before proceeding

### Phase 2: Generate PRD

1. Read `.claude/references/prd-template.md` for the structure
2. Fill in every section based on the brainstorming conversation
3. Be specific — no placeholder text, no "TBD" sections
4. User stories should be concrete and testable
5. Implementation phases should be ordered by dependency and value

### Phase 3: Review and Save

1. Present the PRD to the user section by section
2. Ask for feedback on each major section
3. Incorporate feedback
4. Save to `docs/plans/PRD.md`

### Phase 4: Next Steps

After saving, tell the user:

> **PRD saved to `docs/plans/PRD.md`.**
>
> Next steps:
> - Run `/plan-project` to decompose this into GitHub milestones and issues
> - Or run `/plan-feature` to start planning a specific feature from the PRD

Commit the PRD:
```bash
git add docs/plans/PRD.md
git commit -m "docs: add product requirements document"
```
```

- [ ] **Step 2: Commit**

```bash
git add .claude/commands/create-prd.md
git commit -m "feat: add /create-prd command with brainstorming integration"
```

---

## Task 13: Command — /plan-project

**Files:**
- Create: `.claude/commands/plan-project.md`

- [ ] **Step 1: Create plan-project.md**

```markdown
# /plan-project — PRD to GitHub Issues Decomposer

Decomposes a PRD into GitHub milestones and issues. This bridges the gap between project vision and actionable work items.

## Arguments

- `$ARGUMENTS` — optional: path to PRD file (default: `docs/plans/PRD.md`)

## Prerequisites

- A PRD must exist (run `/create-prd` first if it doesn't)
- GitHub CLI (`gh`) must be authenticated
- Repository must have a GitHub remote

## Process

### Phase 1: Parse PRD

1. Read the PRD file
2. Identify the implementation phases — each becomes a **GitHub milestone**
3. Within each phase, identify discrete features — each becomes a **GitHub issue**

### Phase 2: Decompose into Issues

For each feature/task identified:

1. Write issue title: `[type]: brief description`
2. Write issue body using `.claude/references/issue-template.md` format:
   - Description (what and why)
   - Acceptance criteria (testable checkboxes)
   - Technical notes (files to modify, patterns to follow)
   - Size estimate (S/M/L/XL)
3. Assign labels: type (`feat`/`fix`/`chore`), priority, size
4. Map dependencies: which issues block which

### Phase 3: Determine Order

1. Build dependency graph
2. Identify critical path (longest chain of blocking dependencies)
3. Identify parallelizable work (independent issues that can be worked simultaneously)
4. Order issues by: dependencies first, then critical path, then highest value, then smallest size

### Phase 4: Present for Review

Present the full breakdown to the user:

```
## Milestone 1: [Phase Name]

### Issue 1: [feat: description] (Size: M, Priority: High)
- Acceptance criteria: ...
- Depends on: nothing
- Blocks: Issue 2, Issue 3

### Issue 2: [feat: description] (Size: L, Priority: High)
- Acceptance criteria: ...
- Depends on: Issue 1
- Blocks: Issue 5
```

Ask: "Does this breakdown look right? Any issues to add, remove, or resize?"

### Phase 5: Create in GitHub

After user approval, create milestones and issues using `gh` CLI:

```bash
# Create milestones
gh api repos/{owner}/{repo}/milestones -f title="Phase 1: [Name]" -f description="[Description]"

# Create issues with labels and milestone
gh issue create --title "[type]: description" --body "..." --label "feat,priority:high,size:M" --milestone "Phase 1: [Name]"
```

For issues with dependencies, add a "Blocked by #N" line in the issue body.

### Phase 6: Generate Roadmap

Save a roadmap file to `docs/plans/roadmap.md`:

```markdown
# Project Roadmap

Generated from PRD on YYYY-MM-DD

## Milestone 1: [Phase Name]
- [ ] #1 — [title] (Size: M)
- [ ] #2 — [title] (Size: L) — blocked by #1

## Critical Path
#1 → #2 → #4 → #7 → #9

## Parallel Tracks
Track A: #1 → #2 → #4
Track B: #1 → #3 → #5
```

Commit:
```bash
git add docs/plans/roadmap.md
git commit -m "docs: add project roadmap with GitHub issues"
```

## Re-running

When the PRD is updated, run `/plan-project` again. It will:
1. Read existing GitHub issues
2. Diff against updated PRD
3. Suggest: new issues to create, existing issues to update, obsolete issues to close
4. Present changes for approval before executing
```

- [ ] **Step 2: Commit**

```bash
git add .claude/commands/plan-project.md
git commit -m "feat: add /plan-project command for PRD-to-issues decomposition"
```

---

## Task 14: Command — /plan-feature

**Files:**
- Create: `.claude/commands/plan-feature.md`

- [ ] **Step 1: Create plan-feature.md**

```markdown
# /plan-feature — Feature Implementation Planner

Creates a detailed implementation plan for a feature. The plan must pass the "no prior knowledge" test — an engineer unfamiliar with the codebase can implement using only the plan.

## Arguments

- `$ARGUMENTS` — feature description OR GitHub issue number (e.g., `#42`)

## Process

### Phase 1: Feature Understanding

1. If an issue number is provided, read it: `gh issue view <number>`
2. If a description is provided, clarify:
   - What user-facing behavior should change?
   - What are the acceptance criteria?
   - Is this S/M/L/XL scope?
3. For L/XL features, invoke brainstorming skill first
4. Write user stories in "As a [user], I want [action] so that [benefit]" format

### Phase 2: Codebase Intelligence (Parallel Sub-Agents)

Launch 2-3 parallel sub-agents for speed:

**Agent 1 — Structure and Patterns:**
- Run `/prime` if not already primed
- Glob for files related to the feature
- Identify existing patterns (how similar features are built)
- Map the directory structure for relevant areas

**Agent 2 — Dependencies and Integration:**
- architect-agent RETRIEVE for relevant domains
- architect-agent IMPACT to understand what this change affects
- Identify integration points with other modules
- Check for shared utilities, types, or components to reuse

**Agent 3 — Testing and Validation:**
- Find existing test patterns for similar features
- Identify what test infrastructure exists
- Note validation commands (lint, type-check, test runners)

### Phase 3: External Research

- Use context7 MCP to verify framework APIs you plan to use
- Check library documentation for any unfamiliar APIs
- Note any dependencies that need to be installed

### Phase 4: Strategic Thinking

Before writing the plan, think through:
- Does this fit the existing architecture? If not, is refactoring needed first?
- What are the edge cases? (empty states, error states, concurrent access)
- Security implications? (input validation, auth checks, data exposure)
- Performance concerns? (N+1 queries, large payloads, unnecessary re-renders)
- What could go wrong during implementation?

### Phase 5: Plan Generation

Read `.claude/references/plan-template.md` and generate a complete plan.

Requirements for every plan:
- Exact file paths for every file to create or modify
- Complete code in every step (no placeholders)
- Exact terminal commands with expected output for every verification step
- TDD: tests before implementation in every task
- Conventional commit after every task
- GOTCHA warnings for known pitfalls
- Confidence score (1-10) for one-pass success

### Phase 6: GitHub Issue

If no issue exists for this feature:
```bash
gh issue create --title "[type]: description" --body "..." --label "feat,size:M"
```

If issue exists, add a comment linking to the plan:
```bash
gh issue comment <number> --body "Implementation plan: docs/plans/<plan-file>.md"
```

### Phase 7: Save and Offer Execution

Save to `docs/plans/<kebab-case-feature-name>.md`

Commit:
```bash
git add docs/plans/<plan-file>.md
git commit -m "docs: add implementation plan for <feature>"
```

Then offer:

> **Plan saved. Ready to implement?**
>
> For complex features (context reset recommended):
> Start a new session, run `/prime`, then `/execute docs/plans/<plan-file>.md`
>
> For simpler features (stay in session):
> Run `/execute docs/plans/<plan-file>.md`
```

- [ ] **Step 2: Commit**

```bash
git add .claude/commands/plan-feature.md
git commit -m "feat: add /plan-feature command with 5-phase analysis"
```

---

## Task 15: Command — /execute

**Files:**
- Create: `.claude/commands/execute.md`

- [ ] **Step 1: Create execute.md**

```markdown
# /execute — Plan Executor

Executes an implementation plan task by task with TDD discipline.

## Arguments

- `$ARGUMENTS` — path to plan file (auto-detected from current branch if omitted)

## Prerequisites

- A plan file must exist
- If the plan specifies dependencies to install, install them first
- Read the plan's "Mandatory Reading" section before starting

## Process

### Step 1: Load Plan

1. If path provided, read that file
2. If not, search for plan files:
   - `docs/plans/` and `docs/superpowers/plans/`
   - Match against current branch name
   - If multiple found, ask user which one
3. Parse the plan into tasks and steps

### Step 2: Read Mandatory Files

Read every file listed in the plan's "Mandatory Reading" section. This ensures you have the codebase context needed for implementation.

### Step 3: Execute Tasks

For each task in the plan:

1. **Announce:** "Starting Task N: [task name]"
2. **Read** all files listed in the task's "Files" section
3. **For each step:**
   - If it's a test step: write the test exactly as specified
   - If it's a verification step: run the exact command, check output matches expected
   - If it's an implementation step: write the code as specified
   - If it's a commit step: stage and commit with the specified message
4. **If a test fails unexpectedly:**
   - Read the error output carefully
   - Fix the implementation (not the test, unless the test has a bug)
   - Re-run the test
   - If stuck after 3 attempts, stop and report the issue
5. **After task completion:** mark the task checkbox as done in the plan file

### Step 4: Validation

After all tasks are complete:
1. Run the project's full test suite
2. Run lint/type-check if available
3. Verify the application starts without errors

### Step 5: Completion Report

```
=== Execution Complete ===

Plan: [plan file path]
Tasks completed: N/N
Tests passing: all / N failures
Lint: pass / N issues
Type check: pass / N errors

Next steps:
- Run /validate for full verification
- Run /ship when ready to commit and create PR
```

## Error Handling

- If a task fails and cannot be fixed in 3 attempts: stop, report the issue, ask the user
- If the plan has a bug (wrong file path, missing step): fix the plan and continue
- If a dependency is missing: install it and continue
- Never skip a failing test — either fix the code or report the issue
```

- [ ] **Step 2: Commit**

```bash
git add .claude/commands/execute.md
git commit -m "feat: add /execute plan executor command"
```

---

## Task 16: Command — /validate

**Files:**
- Create: `.claude/commands/validate.md`

- [ ] **Step 1: Create validate.md**

```markdown
# /validate — Verification Orchestrator

Runs comprehensive verification: automated checks, visual testing, and code review.

## Process

### Phase 1: Automated Checks

Run in parallel:

```bash
# Lint (detect from project)
npm run lint 2>/dev/null || npx eslint . 2>/dev/null || echo "No linter configured"

# Type check (detect from project)
npx tsc --noEmit 2>/dev/null || echo "No TypeScript configured"

# Tests (detect from project)
npm test 2>/dev/null || npx jest 2>/dev/null || npx vitest run 2>/dev/null || echo "No test runner configured"
```

If any check fails, report the failure and offer to fix it before continuing.

### Phase 2: Visual Verification (if applicable)

Detect what was changed:
```bash
git diff --name-only main...HEAD
```

**If frontend files changed:**
- Dispatch tester-agent with VERIFY queries for affected pages
- Test at minimum: desktop and mobile viewports
- Check: elements render, navigation works, forms submit

**If mobile files changed:**
- Dispatch mobile-tester-agent with VERIFY queries for affected screens
- Check: elements visible, navigation works, interactions respond

**If API/backend files changed:**
- Run API tests if they exist
- Check: endpoints respond with correct status codes
- If Supabase: run `get_advisors` for schema safety

### Phase 3: Code Review

Invoke the code review skill:
- Review against the implementation plan (does the code match the plan?)
- Check for common issues: error handling, edge cases, security
- Verify no debug code left (console.log, TODO comments, commented-out code)

### Phase 4: Report

```
=== Validation Report ===

Automated Checks:
- Lint: PASS / N issues
- Types: PASS / N errors
- Tests: PASS (N/N) / N failures

Visual Verification:
- [Page/Screen]: PASS / FAIL — [description]

Code Review:
- [Finding 1]
- [Finding 2]

Verdict: Ready to ship / Needs fixes

Next: Run /ship when ready, or fix issues and re-run /validate
```
```

- [ ] **Step 2: Commit**

```bash
git add .claude/commands/validate.md
git commit -m "feat: add /validate verification orchestrator command"
```

---

## Task 17: Command — /ship

**Files:**
- Create: `.claude/commands/ship.md`

- [ ] **Step 1: Create ship.md**

```markdown
# /ship — Commit, Push, and Create PR

Handles the full shipping workflow: staging, committing, pushing, and creating a pull request.

## Process

### Step 1: Pre-flight Check

1. Verify all tests pass: `npm test` (or detected test command)
2. Verify no uncommitted changes that shouldn't be included
3. Check current branch is not main/master

### Step 2: Stage and Commit

Use the `/commit` skill (from commit-commands plugin) for proper conventional commit formatting.

If the commit-commands plugin is not available, fall back to:

1. Show `git status` and `git diff --stat`
2. Ask which files to stage (or confirm staging all)
3. Generate conventional commit message from changes:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `refactor:` for code improvements
   - `docs:` for documentation
   - `test:` for test additions/changes
   - `chore:` for maintenance
4. Commit with the generated message

### Step 3: Push

```bash
git push -u origin $(git branch --show-current)
```

### Step 4: Create Pull Request

Detect the linked GitHub issue from:
- Branch name (e.g., `feat/user-auth-42` implies issue #42)
- Recent commit messages
- Active plan file

Create PR:
```bash
gh pr create \
  --title "[type]: brief description" \
  --body "## Summary
- [what changed and why]

## Linked Issue
Closes #[number]

## Test Plan
- [ ] Automated tests pass
- [ ] Manual verification of [key behavior]
- [ ] Tested on [viewports/devices if applicable]
"
```

### Step 5: Report

```
=== Shipped ===

Branch: [branch name]
Commit: [hash] — [message]
PR: [PR URL]
Closes: #[issue number]

Next steps:
- Wait for review
- After merge: run /evolve to update the system
```
```

- [ ] **Step 2: Commit**

```bash
git add .claude/commands/ship.md
git commit -m "feat: add /ship command for commit, push, and PR creation"
```

---

## Task 18: Command — /evolve

**Files:**
- Create: `.claude/commands/evolve.md`

- [ ] **Step 1: Create evolve.md**

```markdown
# /evolve — Self-Improvement

Updates the framework's rules, knowledge base, and patterns from what was learned in this session. This is what makes the system get smarter over time.

## Philosophy

"Every bug from the AI coding assistant isn't just something to fix — it's an opportunity to address the root cause in your system."

## Process

### Step 1: Reflect on Session

Review what happened in this session:
1. `git log --oneline main..HEAD` — what was built
2. Were there any:
   - Bugs that took multiple attempts to fix?
   - Patterns the AI got wrong repeatedly?
   - Missing context that caused mistakes?
   - New conventions established?
   - Architecture decisions made?

### Step 2: Update CLAUDE.md

Invoke the revise-claude-md skill (from claude-md-management plugin) to:
- Add new conventions discovered
- Update tech stack if it changed
- Add new commands or scripts
- Remove outdated information

If the plugin isn't available, manually check CLAUDE.md for needed updates.

### Step 3: Update Architect Knowledge Base

If structural changes were made:
1. Dispatch architect-agent with RECORD query
2. Agent verifies changes exist in codebase
3. Agent updates relevant domain files in modules/ and frontend/
4. Agent updates index.md if new domains were added
5. If an architectural decision was made, add to decisions/log.md

### Step 4: Update Rules

Check if any domain rules need updating:
- Did a new pattern emerge in backend code? Update rules/backend.md
- Did a new component pattern emerge? Update rules/frontend.md
- Did a testing anti-pattern surface? Update rules/testing.md

### Step 5: Update Code Patterns

If the /execute phase revealed patterns the AI should follow:
- Add to .claude/references/code-patterns.md
- Include real code examples from the current codebase
- Note common pitfalls with before/after examples

### Step 6: Update Test Patterns

If new pages or screens were created:
- Update .claude/agents/tester-agent/test-patterns.md with new routes
- Update .claude/agents/mobile-tester-agent/screen-patterns.md if mobile

### Step 7: Report

```
=== System Evolution ===

Updated:
- [ ] CLAUDE.md — [what changed]
- [ ] architect-agent knowledge base — [domains updated]
- [ ] rules/[domain].md — [what changed]
- [ ] references/code-patterns.md — [patterns added]
- [ ] test-patterns.md — [routes added]

New decisions recorded:
- ADR-N: [decision title]

System health:
The framework is now better equipped to handle [specific scenario].
```

Commit all updates:
```bash
git add CLAUDE.md .claude/
git commit -m "chore: evolve framework — update rules and knowledge base"
```
```

- [ ] **Step 2: Commit**

```bash
git add .claude/commands/evolve.md
git commit -m "feat: add /evolve self-improvement command"
```

---

## Task 19: Command — /setup

**Files:**
- Create: `.claude/commands/setup.md`

- [ ] **Step 1: Create setup.md**

```markdown
# /setup — Framework Health Check

Checks what external plugins, skills, and MCP servers are installed and reports any gaps.

## Process

### Step 1: Check Plugins

Verify each required plugin is installed. Present results as a checklist.

**Core Workflow (required):**

| Plugin | Install Command |
|--------|----------------|
| superpowers | `claude plugin install superpowers` |
| feature-dev | `claude plugin install feature-dev` |
| code-review | `claude plugin install code-review` |
| commit-commands | `claude plugin install commit-commands` |
| claude-md-management | `claude plugin install claude-md-management` |
| security-guidance | `claude plugin install security-guidance` |
| skill-creator | `claude plugin install skill-creator` |

**Framework Support (recommended):**

| Plugin | Install Command |
|--------|----------------|
| firecrawl | `claude plugin install firecrawl` |
| frontend-design | `claude plugin install frontend-design` |
| claude-code-setup | `claude plugin install claude-code-setup` |
| agent-sdk-dev | `claude plugin install agent-sdk-dev` |

**Stack-Specific (install what applies):**

| Plugin | When Needed | Install Command |
|--------|------------|----------------|
| context7 | Any framework/library project | `claude plugin install context7` |
| supabase | Supabase projects | `claude plugin install supabase` |
| typescript-lsp | TypeScript projects | `claude plugin install typescript-lsp` |
| expo-app-design | Expo/React Native projects | `claude plugin install expo-app-design --marketplace expo-plugins` |

### Step 2: Check MCP Servers

Verify project-level MCP server configuration if applicable:
- shadcn — for shadcn/ui component projects
- context7 — for documentation lookup
- supabase — for database operations
- mobile-mcp — for mobile testing

### Step 3: Check Framework Files

Verify .claude/ structure is complete:
- commands/ (10 files)
- agents/ (4 agents + template)
- rules/ (6 rules + template)
- references/ (5 templates)
- hooks/ (5 scripts)
- settings.local.json

### Step 4: Report

```
=== Framework Health Check ===

Plugins:
  [check] superpowers
  [check] feature-dev
  [missing] firecrawl — run: claude plugin install firecrawl

MCP Servers:
  [check] context7
  [missing] shadcn — add to .mcp.json if using shadcn/ui

Framework Files:
  [check] .claude/commands/ (10 commands)
  [check] .claude/agents/ (4 agents)
  [check] .claude/rules/ (6 rules)
  [check] .claude/references/ (5 templates)
  [check] .claude/hooks/ (5 hooks)

Status: Ready (install missing items above for full functionality)
```
```

- [ ] **Step 2: Commit**

```bash
git add .claude/commands/setup.md
git commit -m "feat: add /setup health check command"
```

---

## Task 20: Documentation

**Files:**
- Create: `docs/methodology.md`
- Create: `docs/getting-started.md`
- Create: `docs/command-reference.md`
- Create: `docs/customization.md`
- Create: `docs/plugin-install-guide.md`

- [ ] **Step 1: Create methodology.md**

```markdown
# PIV+E Methodology

A tool-agnostic methodology for reliable AI-assisted software development.

## The Problem

AI coding assistants are powerful but unpredictable. They write code that looks right but subtly isn't. They lose context. They make the same mistakes repeatedly. The solution isn't a better AI — it's a better system around the AI.

## The PIV+E Loop

```
PLAN -> IMPLEMENT -> VALIDATE -> EVOLVE
  ^                               |
  +-------------------------------+
        System gets smarter
```

### Plan (Human decides, AI structures)

The human owns what gets built. The AI helps structure the thinking.

- **Brainstorm** the idea — explore alternatives, constraints, tradeoffs
- **Write a spec** (PRD for projects, plan for features)
- **Decompose** into implementable units (GitHub issues)

The key output is a plan document that passes the "no prior knowledge test."

### Implement (AI executes, guided by plan)

The AI does the heavy lifting, constrained by the plan.

- **Test-Driven Development** — write the test first, then make it pass
- **Follow the plan** — don't improvise, don't add features, don't refactor unrelated code
- **Use specialists** — architecture agents, design skills, framework-specific tools
- **Commit frequently** — small, atomic commits after each task

### Validate (Human + AI verify together)

Both human and AI verify the work.

- **Automated checks** — lint, type-check, test suite (AI runs these)
- **Visual verification** — browser/mobile testing agents (AI runs these)
- **Code review** — review agents flag issues (AI runs, human decides)
- **Human review** — the final authority (human approves the PR)

### Evolve (System learns from each cycle)

The system improves after every cycle.

- **Update rules** — new patterns become rules, mistakes become warnings
- **Update knowledge base** — architecture agent learns new modules/endpoints
- **Update test patterns** — new pages/screens get added to test inventories
- **Record decisions** — why things were done this way

## Context Management

- **Plans are artifacts** — they survive session boundaries
- **Context resets are a feature** — start fresh for implementation after heavy planning
- **Progressive disclosure** — load information as needed, not all at once
- **Knowledge bases** — structured information that agents can query

## Discipline Scaling

| Complexity | Ceremony Level |
|-----------|---------------|
| XL (new module) | Full PIV+E with brainstorming, PRD, parallel agents |
| L (new feature) | Plan + TDD + testing agents |
| M (single task) | Quick plan + implement + verify |
| S (tweak) | Just do it + verify |
| Bug | Debug + fix + verify |

## Principles

1. Context is precious — manage it deliberately
2. Plans are artifacts — they survive session boundaries
3. Discipline scales with complexity
4. The system self-improves — every mistake becomes a rule
5. Human stays in control — AI assists, human decides
```

- [ ] **Step 2: Create getting-started.md**

```markdown
# Getting Started

## Quick Start (Existing Project)

1. Copy the `.claude/` folder into your project root
2. Run `/setup` to check what plugins/skills you need
3. Install missing dependencies (commands provided by /setup)
4. Run `/prime` to load your codebase context
5. Run `/start` to begin your first task

## Quick Start (New Project)

1. Copy the `.claude/` folder into your project root
2. Run `/setup` to check dependencies
3. Run `/start` — it will detect a new project and guide you through:
   - `/create-prd` — brainstorm and define what you're building
   - `/plan-project` — create GitHub issues from the PRD
   - Per-issue implementation via the PIV+E loop

## Your First Feature (Walkthrough)

### 1. Start
```
/start
> What are you working on? -> 3. Working on a specific GitHub issue
> Issue number? -> #1
```

### 2. Plan
```
/plan-feature #1
```
Review the plan. Adjust if needed.

### 3. Implement
```
/execute docs/plans/my-feature.md
```

### 4. Validate
```
/validate
```

### 5. Ship
```
/ship
```

### 6. Evolve (after merge)
```
/evolve
```

## Commands Quick Reference

| Command | When to Use |
|---------|------------|
| `/start` | Beginning of any work session |
| `/prime` | Load/reload codebase context |
| `/create-prd` | Planning a new project from scratch |
| `/plan-project` | Breaking a PRD into GitHub issues |
| `/plan-feature` | Planning a specific feature |
| `/execute` | Implementing a plan |
| `/validate` | Verifying work before shipping |
| `/ship` | Committing, pushing, creating PR |
| `/evolve` | Updating the system after completing work |
| `/setup` | Checking framework health |
```

- [ ] **Step 3: Create command-reference.md**

```markdown
# Command Reference

## /start — Smart Router
**Phase:** Router | **Arguments:** None
Detects scope level and routes to the correct pipeline.

## /prime — Context Loader
**Phase:** Plan | **Arguments:** None
Loads codebase context. Run at session start or after context reset.

## /create-prd — PRD Generator
**Phase:** Plan (L0) | **Arguments:** Optional idea description
Brainstorms and generates a Product Requirements Document. Output: `docs/plans/PRD.md`

## /plan-project — PRD Decomposer
**Phase:** Plan (L0) | **Arguments:** Optional PRD path (default: `docs/plans/PRD.md`)
Breaks PRD into GitHub milestones and issues. Output: GitHub issues + `docs/plans/roadmap.md`

## /plan-feature — Feature Planner
**Phase:** Plan (L1/L2) | **Arguments:** Feature description or issue number (e.g., `#42`)
5-phase analysis producing a detailed implementation plan. Output: `docs/plans/<feature>.md`

## /execute — Plan Executor
**Phase:** Implement | **Arguments:** Optional plan path (auto-detected if omitted)
Executes plan task-by-task with TDD. Reads mandatory files, runs validation commands.

## /validate — Verification Orchestrator
**Phase:** Validate | **Arguments:** None
Runs lint, tests, type-check, visual testing (tester agents), and code review.

## /ship — Commit + Push + PR
**Phase:** Validate | **Arguments:** None
Stages, commits (conventional), pushes, creates PR linked to issue.

## /evolve — Self-Improvement
**Phase:** Evolve | **Arguments:** None
Updates CLAUDE.md, architect knowledge base, rules, code patterns, test patterns.

## /setup — Health Check
**Phase:** Utility | **Arguments:** None
Checks installed plugins, skills, MCP servers. Reports health and install commands.
```

- [ ] **Step 4: Create customization.md**

```markdown
# Customization Guide

## Adding Custom Rules

1. Copy `.claude/rules/_template.md` to `.claude/rules/your-domain.md`
2. Set the `globs` pattern to match your file paths
3. Add your conventions and skill chains
4. Rules auto-load when editing matching files

## Adding Custom Agents

1. Copy `.claude/agents/_template/AGENT.md` to `.claude/agents/your-agent/AGENT.md`
2. Define query types, tools, and response format
3. Add knowledge base files as needed
4. Reference the agent from your commands or rules

## Customizing Commands

Commands are markdown files in `.claude/commands/`. Edit existing commands or add new ones. Commands are invoked as `/command-name` in Claude Code.

## Customizing Hooks

Hooks are shell scripts in `.claude/hooks/`. Edit existing hooks or add new ones. Make sure hooks are executable (`chmod +x`).

## Overriding Rules per Project

Each project gets its own `.claude/` folder. Customize CLAUDE.md, rules, and agent knowledge bases per project. The framework's commands stay the same.

## Contributing

1. Fork the repository
2. Add your contribution
3. Submit a PR with description, usage, and testing notes
```

- [ ] **Step 5: Create plugin-install-guide.md**

```markdown
# Plugin and Skill Install Guide

## Required Plugins

### Core Workflow (Must Have)
```bash
claude plugin install superpowers
claude plugin install feature-dev
claude plugin install code-review
claude plugin install commit-commands
claude plugin install claude-md-management
claude plugin install security-guidance
claude plugin install skill-creator
```

### Framework Support (Recommended)
```bash
claude plugin install firecrawl
claude plugin install frontend-design
claude plugin install claude-code-setup
claude plugin install agent-sdk-dev
```

### Stack-Specific (Install What You Use)
```bash
# For any project using frameworks/libraries
claude plugin install context7

# For Supabase projects
claude plugin install supabase

# For TypeScript projects
claude plugin install typescript-lsp

# For Expo/React Native projects
claude plugin install expo-app-design --marketplace expo-plugins
```

## Global Skills

Skills are installed separately from plugins. Key categories:

**Web and Frontend:** agent-browser, frontend-design, frontend-aesthetics, ui-ux-pro-max, shadcn-ui, nextjs-app-router-patterns, vercel-react-best-practices, web-design-guidelines

**Backend and Database:** fastapi-python, mongodb, mongodb-development, supabase-postgres-best-practices, stripe-best-practices

**Testing and Security:** qa-test-planner, security-audit, web-security-testing, pentest-expert

**Research and Content:** research, search, crawl, extract, multi-ai-research, tavily-best-practices

**Mobile:** All expo-app-design sub-skills (building-native-ui, native-data-fetching, expo-tailwind-setup, expo-dev-client, expo-api-routes, use-dom, expo-ui-swift-ui, expo-ui-jetpack-compose)

## MCP Servers

Configure per project as needed:

| Server | Purpose |
|--------|---------|
| context7 | Framework/library documentation |
| shadcn | shadcn/ui component search |
| supabase | Database operations |
| mobile-mcp | Mobile simulator testing |

## Checking Installation

Run `/setup` at any time to see what's installed and what's missing.
```

- [ ] **Step 6: Commit**

```bash
git add docs/
git commit -m "docs: add methodology, getting-started, command-reference, customization, and plugin guides"
```

---

## Task 21: README and Package

**Files:**
- Create: `README.md`
- Create: `package.json`

- [ ] **Step 1: Create README.md**

```markdown
# AIDevelopmentFramework

The system around the AI that makes the AI reliable.

An open-source framework for structured AI-assisted software development. Built on the **PIV+E loop** (Plan, Implement, Validate, Evolve) — a methodology where the human owns planning and validation, the AI owns implementation, and the system gets smarter with every cycle.

## Why This Exists

AI coding assistants are powerful but unpredictable. They lose context, repeat mistakes, and produce code that looks right but isn't. The solution isn't a better AI — it's a better **system around the AI**: plans that survive session boundaries, rules that prevent known mistakes, agents that maintain architectural knowledge, and a self-improving feedback loop.

## Quick Start

### Existing Project
1. Copy `.claude/` into your project root
2. Run `/setup` to check installed plugins
3. Run `/prime` to load context
4. Run `/start` to begin

### New Project
1. Copy `.claude/` into your project root
2. Run `/setup` to install dependencies
3. Run `/start` and choose "Starting a new project"

## The PIV+E Loop

**Plan** — Brainstorm, write specs, decompose into issues
**Implement** — TDD, execute plans, use specialist agents
**Validate** — Automated checks, visual testing, code review
**Evolve** — Update rules and knowledge from what was learned

## Pipeline Commands

| Command | Phase | Purpose |
|---------|-------|---------|
| `/start` | Router | Detects what you're doing, routes to the right pipeline |
| `/prime` | Plan | Loads codebase context into session |
| `/create-prd` | Plan | Brainstorms and generates a PRD |
| `/plan-project` | Plan | Decomposes PRD into GitHub milestones and issues |
| `/plan-feature` | Plan | Creates detailed implementation plan |
| `/execute` | Implement | Executes plan with TDD, step by step |
| `/validate` | Validate | Runs lint, tests, visual testing, code review |
| `/ship` | Validate | Commits, pushes, creates PR |
| `/evolve` | Evolve | Updates rules and knowledge base |
| `/setup` | Utility | Checks framework health |

## What's Inside

```
.claude/
├── commands/       10 pipeline commands (the workflow)
├── agents/         4 specialist agents + template
├── skills/         Framework-specific skills
├── rules/          Auto-loading domain rules
├── references/     Templates (PRD, plan, issue, patterns)
└── hooks/          Guardrails (branch protection, reminders)
```

## Scope Levels

| Level | Entry Point | Pipeline |
|-------|------------|---------|
| L0 | "I have an idea" | /create-prd then /plan-project then per-issue L2 |
| L1 | "I need a feature" | /plan-feature then per-issue L2 |
| L2 | "I have issue #42" | /prime then /plan then /execute then /validate then /ship |
| L3 | "There's a bug" | /prime then debug then fix then /validate then /ship |

## Documentation

- [Methodology](docs/methodology.md) — The PIV+E loop explained
- [Getting Started](docs/getting-started.md) — Setup and walkthrough
- [Command Reference](docs/command-reference.md) — All commands
- [Customization](docs/customization.md) — Adding agents, rules, skills
- [Plugin Install Guide](docs/plugin-install-guide.md) — Dependencies

## Credits

Synthesizes approaches from:
- [Cole Medin's AI Coding Summit Workshop](https://github.com/coleam00/ai-coding-summit-workshop-2) — PIV loop, context resets, plan-as-specification
- Real-world battle-tested Claude Code configurations from production development

## License

MIT
```

- [ ] **Step 2: Create package.json**

```json
{
  "name": "ai-development-framework",
  "version": "0.1.0",
  "description": "The system around the AI that makes the AI reliable. Structured AI-assisted development with the PIV+E loop.",
  "bin": {
    "ai-framework": "./cli/index.js"
  },
  "keywords": [
    "ai",
    "claude",
    "claude-code",
    "development-framework",
    "agentic",
    "piv-loop"
  ],
  "author": "Cristian-Robert Iosef",
  "license": "MIT",
  "files": [
    "cli/",
    ".claude/",
    "docs/",
    "CLAUDE.md",
    "README.md"
  ],
  "engines": {
    "node": ">=18"
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add README.md package.json
git commit -m "feat: add README and package.json"
```

---

## Task 22: CLI Tool

**Files:**
- Create: `cli/index.js`
- Create: `cli/init.js`

- [ ] **Step 1: Create cli/index.js**

```javascript
#!/usr/bin/env node

const command = process.argv[2];

switch (command) {
  case 'init':
    require('./init.js');
    break;
  case '--help':
  case '-h':
  case undefined:
    console.log(`
AIDevelopmentFramework CLI

Usage:
  ai-framework init        Set up the framework in the current project
  ai-framework --help      Show this help message
    `);
    break;
  default:
    console.error('Unknown command: ' + command);
    console.log('Run "ai-framework --help" for usage information.');
    process.exit(1);
}
```

- [ ] **Step 2: Create cli/init.js**

```javascript
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function detectTechStack() {
  const detected = [];
  try {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
    const deps = Object.assign({}, pkg.dependencies, pkg.devDependencies);
    if (deps['next']) detected.push('Next.js');
    if (deps['react']) detected.push('React');
    if (deps['vue']) detected.push('Vue');
    if (deps['express']) detected.push('Express');
    if (deps['@nestjs/core']) detected.push('NestJS');
    if (deps['expo']) detected.push('Expo');
    if (deps['@supabase/supabase-js']) detected.push('Supabase');
    if (deps['tailwindcss']) detected.push('Tailwind');
    if (deps['stripe']) detected.push('Stripe');
  } catch (e) {
    // No package.json or parse error
  }

  if (fs.existsSync('requirements.txt') || fs.existsSync('pyproject.toml')) {
    detected.push('Python');
  }
  if (fs.existsSync('go.mod')) {
    detected.push('Go');
  }

  return detected;
}

async function main() {
  console.log('\nWelcome to AIDevelopmentFramework!\n');

  const hasGit = fs.existsSync('.git');
  const hasClaudeDir = fs.existsSync('.claude');

  const projectType = await ask(
    'Is this a new project or existing codebase? (new/existing): '
  );

  const stack = detectTechStack();
  if (stack.length > 0) {
    console.log('\nDetected tech stack: ' + stack.join(', '));
    await ask('Press Enter to confirm (or type your stack): ');
  } else {
    await ask('What tech stack are you using? ');
  }

  await ask('Do you use GitHub Issues for task tracking? (yes/no): ');

  // Copy .claude/ structure
  if (!hasClaudeDir) {
    const frameworkDir = path.join(__dirname, '..');
    const sourceClaudeDir = path.join(frameworkDir, '.claude');
    const targetClaudeDir = path.join(process.cwd(), '.claude');
    console.log('\nCopying .claude/ framework structure...');
    copyDirRecursive(sourceClaudeDir, targetClaudeDir);
    console.log('  Done.');
  } else {
    console.log('\n.claude/ already exists. Skipping copy.');
  }

  // Create docs directory
  const docsDir = path.join(process.cwd(), 'docs', 'plans');
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
    console.log('Created docs/plans/ directory.');
  }

  console.log('\nSetup complete!\n');
  console.log('Next steps:');
  console.log('  1. Run /setup in Claude Code to check plugin dependencies');
  console.log('  2. Run /prime to load codebase context');
  console.log('  3. Run /start to begin your first task\n');

  rl.close();
}

main().catch(function (err) {
  console.error('Error: ' + err.message);
  process.exit(1);
});
```

- [ ] **Step 3: Make CLI executable and commit**

```bash
chmod +x cli/index.js
git add cli/
git commit -m "feat: add CLI tool (npx ai-framework init)"
```

---

## Task 23: .gitignore and Final Cleanup

**Files:**
- Create: `.gitignore`

- [ ] **Step 1: Create .gitignore**

```
node_modules/
dist/
build/
.next/
.expo/
*.log
.env
.env.local
.env.*.local
.DS_Store
.idea/
.vscode/
*.swp
*.swo
```

- [ ] **Step 2: Commit**

```bash
git add .gitignore
git commit -m "chore: add .gitignore"
```

---

## Self-Review Checklist

- [x] **Spec coverage:** All items from the design document are covered:
  - 10 commands (Tasks 10-19)
  - 4 agents + template (Tasks 5-8)
  - 2 skills (Task 9)
  - 7 rules (Task 2)
  - 5 references (Task 3)
  - 5 hooks (Task 4)
  - Documentation (Task 20)
  - CLI (Task 22)
  - README + package.json (Task 21)
  - CLAUDE.md + settings (Task 1)

- [x] **Placeholder scan:** No TBD or TODO text. Template files (code-patterns.md, agent knowledge bases) are intentionally empty — they get populated per-project by /create-rules and /evolve.

- [x] **Type consistency:** File paths, command names, agent query types, and skill names are consistent across all files.
