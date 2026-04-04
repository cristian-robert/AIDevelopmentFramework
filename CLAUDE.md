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

## Knowledge Base

Optional Obsidian-compatible project knowledge base. Stores feature specs, architecture decisions, and project overview as markdown notes that the agent reads/writes during the pipeline.

**Configuration:** Add `## Knowledge Base` with `Path: <path>` to your project's CLAUDE.md. Default: `.obsidian/`. Remove the section to disable.

**Structure:**
```
<path>/
├── overview.md          # Project vision, goals, tech stack
├── architecture/        # System design, data model
├── features/            # One note per feature area, linked to GitHub issues
├── decisions/           # Architecture Decision Records (ADRs)
├── config/              # Integration metadata, env var names (never actual secrets)
└── research/            # Brainstorming notes, tech comparisons
```

**When commands read it:**
- `/prime` — loads overview + related feature notes (smart/targeted)
- `/execute` — reads feature context before implementing

**When commands write it:**
- `/start` (L0) — creates structure + feature notes during brainstorming
- `/create-prd` — seeds overview + architecture from PRD
- `/plan-project` — creates feature notes alongside GitHub issues
- `/ship` — updates feature notes with implementation details

## Code Review Layers

The framework supports two complementary review layers:

| Layer | Command | What it checks | Required |
|-------|---------|---------------|----------|
| **Superpowers Code Review** | `/validate` Phase 3 | Implementation defects, plan adherence, security, edge cases | Always available |
| **Codex Adversarial Review** | `/ship` Step 1.6 | Design choices, tradeoffs, assumptions, alternative approaches | Optional (requires OpenAI subscription + Codex plugin) |

These are additive — the adversarial review questions whether the *approach* is right, while the code review checks whether the *implementation* is correct.

## Rules & References

- Domain-specific rules auto-load from `.claude/rules/` based on file paths being edited
- Reference templates in `.claude/references/` are loaded on-demand by commands
- See `docs/customization.md` for adding custom rules and agents

## External Dependencies

Run `/setup` to check what's installed. See `docs/plugin-install-guide.md` for full list.
