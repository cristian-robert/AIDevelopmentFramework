# AIDevelopmentFramework — Design Document

**Date:** 2026-03-30
**Status:** Approved
**Authors:** Cristian-Robert Iosef + Claude

## 1. Vision

An open-source framework that makes AI coding assistants reliable and predictable. The value isn't the AI writing code — it's the **system around the AI** (plans, rules, commands, validation) that makes the AI dependable.

**Tagline:** "The system around the AI that makes the AI reliable."

**Target audience:** Developers adopting AI coding tools (Claude Code primary, methodology portable to Cursor/Windsurf/Cline/Gemini CLI).

## 2. Core Philosophy: PIV+E Loop

```
PLAN → IMPLEMENT → VALIDATE → EVOLVE
  ↑                              │
  └──────────────────────────────┘
        System gets smarter
```

- **Plan** — Human decides what to build, AI helps structure the thinking
- **Implement** — AI does the heavy lifting, guided by a detailed plan
- **Validate** — Human + AI verify the work meets standards
- **Evolve** — Every cycle makes the system smarter (self-improving system)

### Key Principles

1. **Context is precious** — manage it deliberately; recommend context resets for complex work
2. **Plans are artifacts** — they survive session boundaries (the "no prior knowledge" test)
3. **Discipline scales with complexity** — XL features get full ceremony, S tweaks get fast-tracked
4. **The system self-improves** — every AI mistake becomes a rule, pattern, or guardrail
5. **Ship everything, install nothing** — framework works out of the box; external plugins stay fresh from source

## 3. Scope Levels & Entry Points

The framework handles the full lifecycle from idea to production:

| Level | Entry Point | Trigger | Pipeline |
|-------|------------|---------|----------|
| L-1 | Onboard | Joining existing project | /prime → /create-rules → architect setup |
| L0 | Project | Starting from an idea | /brainstorm → /create-prd → /plan-project → /create-rules → /init-project |
| L1 | Feature | New feature request | /brainstorm → /plan-feature → creates issue(s) → L2 per issue |
| L2 | Issue | Existing GitHub issue | gh issue view → /prime → /brainstorm? → /writing-plans → implement → validate |
| L3 | Bug | Bug report | gh issue view → /prime → /systematic-debugging → fix → validate |

### Discipline Scaling

| Issue Size | Plan Phase | Implement Phase | Validate Phase |
|-----------|-----------|----------------|---------------|
| XL (epic) | Full brainstorm + plan + context reset | TDD + parallel agents | Full testing + code review |
| L (feature) | Brainstorm + plan | TDD + execute | Testing + code review |
| M (task) | Quick plan | Execute | Verification + commit |
| S (tweak) | Read issue | Just do it | Verification + commit |
| Bug | Systematic debug | Fix + regression test | Verification + commit |

### Context Reset Guidance

- **L0/L1:** Recommended between Plan and Implement (lots of research noise)
- **Complex L2 (>5 plan steps):** Recommended
- **Simple L2, L3:** Stay in session, plans are written artifacts anyway
- `/prime` reloads context in any new session

## 4. Architecture: Layered Pipeline

### Distribution Model

| Category | Where It Lives | Who Updates It |
|----------|---------------|----------------|
| Pipeline commands | Framework repo `.claude/commands/` | Framework maintainers |
| Agent templates | Framework repo `.claude/agents/` | Framework maintainers + user customizes |
| Domain rules | Framework repo `.claude/rules/` | Generated per project by /create-rules, updated by /evolve |
| Reference templates | Framework repo `.claude/references/` | Framework maintainers (templates) + /create-rules (fills in) |
| Hooks | Framework repo `.claude/hooks/` | Framework maintainers |
| Workflow skills | External plugins (superpowers, etc.) | Plugin maintainers (always latest) |
| Domain skills | External global skills | Skill maintainers (always latest) |
| MCP servers | External plugin marketplace | MCP maintainers |
| CLAUDE.md | Generated per project | /create-rules + /evolve |

### Directory Structure

```
AIDevelopmentFramework/
├── .claude/
│   │
│   ├── commands/                  ← LAYER 1: Pipeline (user-facing)
│   │   ├── start.md              ← Smart router (detects scope level)
│   │   ├── prime.md              ← Context loader
│   │   ├── create-prd.md         ← PRD generator (calls /brainstorm internally)
│   │   ├── plan-project.md       ← PRD → GitHub milestones + issues
│   │   ├── plan-feature.md       ← Feature → implementation plan + issues
│   │   ├── execute.md            ← Plan executor (dispatches TDD, agents, skills)
│   │   ├── validate.md           ← Verification orchestrator
│   │   ├── ship.md               ← Commit + push + PR + finish branch
│   │   ├── evolve.md             ← Self-improvement (update rules + knowledge)
│   │   └── setup.md              ← Health check for plugins/skills/MCP
│   │
│   ├── agents/                    ← LAYER 2: Specialists
│   │   ├── architect-agent/      ← Codebase knowledge base (RETRIEVE/IMPACT/RECORD/PATTERN)
│   │   │   ├── AGENT.md
│   │   │   ├── index.md          ← Knowledge base TOC (generated per project)
│   │   │   ├── modules/          ← Domain knowledge files
│   │   │   ├── frontend/         ← Frontend-specific knowledge
│   │   │   ├── shared/           ← Cross-cutting patterns
│   │   │   └── decisions/        ← Architecture decision log
│   │   ├── tester-agent/         ← Web browser testing (VERIFY/FLOW)
│   │   │   ├── AGENT.md
│   │   │   ├── test-patterns.md  ← Page inventory (generated per project)
│   │   │   └── auth-state.md     ← Test credentials
│   │   ├── mobile-tester-agent/  ← Mobile app testing
│   │   │   ├── AGENT.md
│   │   │   └── screen-patterns.md
│   │   ├── ui-ux-analyzer/       ← Design audit agent
│   │   │   └── AGENT.md
│   │   └── _template/            ← Agent scaffold for custom agents
│   │       └── AGENT.md
│   │
│   ├── skills/                    ← LAYER 2: Framework-specific skills only
│   │   ├── e2e-test/             ← E2E test orchestration (fix-during-test loop)
│   │   │   └── SKILL.md
│   │   └── playwright-cli/       ← Playwright command reference
│   │       └── SKILL.md
│   │
│   ├── rules/                     ← LAYER 3: Auto-loaded by file path context
│   │   ├── _global.md            ← Always active (~30 lines)
│   │   ├── backend.md            ← Loads for backend paths
│   │   ├── frontend.md           ← Loads for frontend paths
│   │   ├── mobile.md             ← Loads for mobile paths
│   │   ├── database.md           ← Loads for migration/schema paths
│   │   ├── testing.md            ← Loads for test paths
│   │   └── _template.md          ← For custom domain rules
│   │
│   ├── references/                ← LAYER 3: On-demand templates & patterns
│   │   ├── prd-template.md       ← PRD structure (used by /create-prd)
│   │   ├── plan-template.md      ← Implementation plan structure (used by /plan-feature)
│   │   ├── claude-md-template.md ← CLAUDE.md generation template (used by /create-rules)
│   │   ├── issue-template.md     ← GitHub issue template (used by /plan-project)
│   │   └── code-patterns.md      ← Generated per project by /create-rules
│   │
│   ├── hooks/                     ← Automated guardrails
│   │   ├── branch-guard.sh       ← Blocks direct commits to main/master
│   │   ├── plan-required.sh      ← Warns if no plan exists for current branch
│   │   ├── architect-sync.sh     ← Reminds to RECORD after structural changes
│   │   ├── evolve-reminder.sh    ← Reminds to /evolve after PR
│   │   └── session-primer.sh     ← Auto-context load on session start
│   │
│   └── settings.local.json       ← Permission whitelist (pre-configured)
│
├── docs/
│   ├── methodology.md             ← PIV+E explained (tool-agnostic, portable)
│   ├── getting-started.md         ← Quick start guide
│   ├── command-reference.md       ← All 10 commands documented
│   ├── customization.md           ← How to add agents, skills, rules
│   ├── plugin-install-guide.md    ← Required plugins + skills with install commands
│   └── plans/                     ← Generated plans stored here
│
├── cli/
│   ├── index.js                   ← Entry point (npx ai-framework init)
│   ├── init.js                    ← Interactive project setup
│   ├── commands/                  ← CLI subcommands
│   └── templates/                 ← Scaffolding templates
│
├── CLAUDE.md                      ← Framework's own rules
├── package.json
└── README.md
```

## 5. Progressive Disclosure

### Three-Tier Information Loading

**Tier 1: Always loaded (CLAUDE.md — under 150 lines)**
- Project overview + tech stack
- PIV+E pipeline (6 commands listed, not explained)
- Core principles (5 bullets)
- Mode selection (Superpowers vs Standard)
- Pointers to `.claude/rules/` and `.claude/references/`

**Tier 2: Auto-loaded by context (.claude/rules/)**
- Rules activate based on file paths being edited
- Each rule file is under 50 lines
- Contains skill chains for that domain (e.g., architect → design → shadcn → tester)
- References `code-patterns.md` for examples instead of inlining them

**Tier 3: On-demand (.claude/references/, agent knowledge bases)**
- Loaded by commands/agents when needed
- PRD template loaded by `/create-prd`
- Plan template loaded by `/plan-feature`
- Agent modules loaded by architect-agent on RETRIEVE queries
- Code patterns loaded by `/execute` during implementation

### User Experience by Expertise Level

| User Level | What They See | How They Interact |
|-----------|--------------|------------------|
| New user | `/start` guides everything | Follow prompts, framework handles routing |
| Intermediate | 10 commands in CLAUDE.md | Jump directly to `/plan-feature`, `/execute`, etc. |
| Power user | Full `.claude/` structure | Customize agents, add rules, create skills |

## 6. Hooks & Guardrails

### Hook Inventory

| Hook | Type | Triggers On | Action | Behavior |
|------|------|------------|--------|----------|
| security-check | PreToolUse | Edit, Write | OWASP/injection/XSS reminder | Remind (from security-guidance plugin) |
| branch-guard | PreToolUse | Bash (git commit/push) | Block direct commits to main/master | Block |
| plan-required | PreToolUse | Bash (implementation detection) | Warn if no plan file for current branch | Warn |
| architect-sync | PostToolUse | Write, Edit (structural files) | Remind to run architect-agent RECORD | Remind |
| loop-prevention | Stop | Agent loops | Break infinite loops | Block (from ralph-loop plugin) |
| evolve-reminder | Stop | After PR commands | Remind to run /evolve | Remind |
| session-primer | Notification | Session start | Auto lightweight context load | Inform |

### Philosophy
- Hooks REMIND, they don't BLOCK (except branch-guard and loop-prevention)
- The developer always has the final say
- Hooks are pre-configured but can be disabled in settings

## 7. Command Pipeline (Detailed)

### /start — Smart Router
```
Detects current state:
  - No CLAUDE.md? → Suggest /setup then L-1 onboard
  - No PRD, no issues? → Route to L0 (project from scratch)
  - Has PRD, no issues? → Route to /plan-project
  - Has issues? → Ask which one, route to L2
  - Bug label? → Route to L3

Asks:
  "What are you working on?"
  1. Starting a new project from an idea
  2. Planning a new feature
  3. Working on a GitHub issue (#number)
  4. Fixing a bug
  5. Joining an existing project

Routes to correct pipeline with appropriate ceremony level.
```

### /prime — Context Loader
```
Runs:
  - git ls-files (project structure)
  - tree -L 3 (visual layout)
  - Reads CLAUDE.md, PRD, active plans
  - git log -10 (recent history)
  - git status + current branch
  - Reads active GitHub issue if on a feature branch
  - Checks for existing plan file for current branch

Outputs: Structured context summary report
When: Start of any session, or after context reset
```

### /create-prd — PRD Generator
```
Internally calls: /brainstorm skill (mandatory)

Process:
  1. Brainstorm the idea (explore intent, constraints, success criteria)
  2. Propose 2-3 approaches with tradeoffs
  3. Once approach is chosen, generate PRD using references/prd-template.md
  4. PRD covers: executive summary, user stories, architecture,
     API specs, implementation phases, risks, success criteria
  5. Human reviews and approves

Outputs: docs/plans/PRD.md
```

### /plan-project — PRD to GitHub Issues (NEW)
```
Inputs: PRD.md

Process:
  1. Parse PRD into epics (major feature areas)
  2. Each epic → GitHub milestone
  3. Each epic decomposes into implementable issues:
     - Title, description (from references/issue-template.md)
     - Acceptance criteria
     - Labels (feat/fix/chore, priority, S/M/L/XL)
     - Dependencies (blocked-by relationships)
  4. Determine implementation order (critical path)
  5. Present full breakdown to human for review
  6. On approval: create via gh CLI
  7. Generate roadmap

Outputs: GitHub milestones + issues + docs/plans/roadmap.md
Re-runnable: Diffs against existing issues on subsequent runs
```

### /plan-feature — Feature Planner
```
Inputs: Feature description or GitHub issue number

Process (5 phases from Cole's repo, enhanced):
  Phase 1: Feature understanding (user stories, complexity)
  Phase 2: Codebase intelligence (parallel sub-agents for structure, patterns, deps)
  Phase 3: External research (context7, docs)
  Phase 4: Strategic thinking (architect-agent IMPACT, edge cases, security)
  Phase 5: Plan generation (using references/plan-template.md)

Plan includes:
  - Mandatory reading list (files + line numbers)
  - New files to create
  - Patterns to follow (with code examples from code-patterns.md)
  - Step-by-step tasks with validation commands
  - GOTCHA warnings per task
  - Testing strategy
  - Confidence score (1-10)

If no GitHub issue exists: creates one
If feature is large: creates multiple issues with dependencies

Outputs: docs/plans/{feature-name}.md + GitHub issue(s)
```

### /execute — Plan Executor
```
Inputs: Path to plan file (auto-detected from current branch if not specified)

Process:
  1. Read plan file
  2. For each task:
     a. Call /test-driven-development (write test first)
     b. Implement the change
     c. Run validation command from plan
     d. If fail: fix and retry
     e. If pass: move to next task
  3. Use domain skills as specified in plan (architect-agent, design, DB, etc.)
  4. Dispatch parallel agents for independent tasks (/dispatching-parallel-agents)
  5. Generate completion report

Outputs: Working code, passing tests, completion report
```

### /validate — Verification Orchestrator
```
Process:
  1. /verification-before-completion (lint, types, tests)
  2. Detect what changed:
     - Frontend files? → tester-agent VERIFY + FLOW
     - Mobile files? → mobile-tester-agent VERIFY + FLOW
     - API/backend? → integration tests + Supabase advisors
     - UI changes? → ui-ux-analyzer (optional, on request)
  3. E2E test skill if applicable (fix-during-test loop)
  4. /requesting-code-review

Outputs: Test results, review feedback, confidence assessment
```

### /ship — Commit + Push + PR
```
Process:
  1. /commit (conventional commit, staged changes)
  2. Push to remote
  3. Create PR via gh CLI:
     - Title from plan/issue
     - Body: summary + test plan + link to issue
     - Request reviewers if configured
  4. /finishing-a-development-branch

Outputs: Merged PR closing the GitHub issue
```

### /evolve — Self-Improvement
```
Process:
  1. /revise-claude-md (update CLAUDE.md from session learnings)
  2. architect-agent RECORD (update codebase knowledge base)
  3. Check: did any hook fire that revealed a pattern gap?
     - If yes: add to rules/ or references/code-patterns.md
  4. Check: did any test fail unexpectedly?
     - If yes: add pattern to testing.md rule
  5. Report what was updated

Outputs: Updated rules, knowledge base, patterns
```

### /setup — Health Check
```
Process:
  1. Check installed plugins vs required list
  2. Check installed skills
  3. Check MCP server configuration
  4. Report: ✅ installed / ❌ missing / ⚠️ outdated
  5. Provide exact install commands for missing items

Outputs: Health report + install instructions
Re-runnable anytime
```

## 8. External Dependencies

### Required Plugins (install from source for latest versions)

**Core Workflow (must have):**
- superpowers — PIV+E workflow skills (brainstorm, TDD, debug, plans, verification, etc.)
- feature-dev — Guided feature development with bundled agents
- code-review — PR review with multi-agent analysis
- commit-commands — Git commit + push + PR workflows
- claude-md-management — CLAUDE.md audit and improvement
- security-guidance — PreToolUse security reminders
- skill-creator — Create and modify skills

**Framework Support:**
- firecrawl — Web operations (search, scrape, crawl)
- frontend-design — UI/UX design patterns
- claude-code-setup — Automation recommendations
- agent-sdk-dev — Agent SDK app scaffolding

**Stack-Specific (install what applies):**
- context7 — Library/framework documentation lookup
- supabase — Database operations MCP
- typescript-lsp — Language server support
- expo-app-design — Expo/React Native skills (8 sub-skills)

### Required Global Skills (33+)
Installed via their own mechanisms. Full list in `docs/plugin-install-guide.md`.

Categories: web automation, frontend design (3 variants), frameworks, testing/QA, security, research, web scraping, payment integration.

### MCP Servers (configure per project)
shadcn, context7, supabase, mobile-mcp — configured in project's settings.

## 9. CLI Tool

### `npx ai-framework init`

Interactive setup that generates `.claude/` for any project:

```
1. Detect or ask: new project vs existing codebase
2. Detect or ask: tech stack
3. Ask: GitHub Issues for tracking? Repo URL?
4. Generate .claude/ structure:
   - commands/ (10 pipeline commands)
   - agents/ (4 agent templates, knowledge bases initialized)
   - rules/ (domain rules customized for detected stack)
   - references/ (templates + auto-detected code patterns)
   - hooks/ (guardrails configured)
   - settings.local.json (permissions)
   - CLAUDE.md (generated, under 150 lines)
5. Check external dependencies → report missing + install commands
6. Offer to run /prime for initial context load
```

### `npx ai-framework update`

Updates framework commands, agents, rules templates to latest version without overwriting project-specific customizations (knowledge bases, code-patterns, generated CLAUDE.md).

## 10. Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Audience | Open-source framework | Broadest impact, community-driven improvement |
| Tool target | Claude Code primary, methodology portable | Richest automation surface, concepts transfer |
| Lifecycle | Full (bootstrap → ongoing development) | Neither source repo covers both |
| Distribution | Scaffold repo + CLI tool | Methodology is forkable, CLI makes it practical |
| Context management | Hybrid (recommend resets, don't force) | Discipline scales with complexity |
| Agents | Pluggable (core set + template for custom) | Universal agents ship, project-specific ones are user-created |
| Bundling | Ship everything in .claude/ | No module management, users ignore what they don't need |
| External deps | Users install plugins/skills from source | Always latest versions, no staleness |
| Pipeline | PIV+E (Plan, Implement, Validate, Evolve) | Cole's PIV + bzroo's self-improvement = 4 phases |
| Information loading | Progressive disclosure (3 tiers) | New users aren't overwhelmed, power users have full access |
| Hooks | Remind, don't block (mostly) | Developer autonomy preserved, nudges toward best practices |

## 11. Source Attribution

This framework synthesizes approaches from:

- **Cole Medin's ai-coding-summit-workshop-2**: PIV loop, /prime context loader, /create-prd, /plan-feature with confidence scores, /create-rules auto-generation, context reset between phases, "commandify everything" philosophy, self-improving system mindset, e2e-test fix-during-test loop, plan-as-specification pattern
- **bzroo project (.claude/ setup)**: Architect-agent knowledge base with progressive disclosure, tester-agent/mobile-tester-agent protocols, domain-specific auto-loading rules, Superpowers pipeline (brainstorm → TDD → execute → verify → finish), skill recipes and composability, GitHub issue-driven workflow, mode selection (Superpowers vs Standard)

## 12. Success Criteria

1. A new user can go from `npx ai-framework init` to shipping their first feature in under 30 minutes
2. The PIV+E loop produces consistent, high-quality code across different tech stacks
3. The self-improving system measurably reduces AI mistakes over time (fewer hook reminders, higher plan confidence scores)
4. The methodology section is useful even without Claude Code (portable to other tools)
5. Community can contribute agents, rules templates, and stack-specific presets
