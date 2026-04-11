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

- **Superpowers Mode:** Full PIV+E pipeline — brainstorm → plan → TDD → execute (subagent-driven) → /validate (QA + security + visual + review) → ship → evolve
- **Standard Mode:** Lighter workflow — plan → implement → validate → ship

## Agents

- **architect-agent** — Codebase knowledge base. Call before structural changes (RETRIEVE/IMPACT/RECORD/PATTERN)
- **tester-agent** — Web browser testing via playwright-cli (VERIFY/FLOW)
- **mobile-tester-agent** — Mobile app testing via mobile-mcp (VERIFY/FLOW)
- **ui-ux-analyzer** — Design audit agent with screenshots and reports

## Knowledge Base

Unified LLM knowledge base inspired by [Karpathy's LLM Knowledge Bases](https://x.com/karpathy) workflow. External research and project knowledge live together as a flat wiki. The LLM ingests raw sources, compiles them into wiki articles, auto-searches during task work, and grows the wiki from every coding session.

**Configuration:** Add `## Knowledge Base` with `Path: <path>` to your project's CLAUDE.md. Default: `.obsidian/`. Remove the section to disable.

**Structure:**
```
<path>/
├── raw/                 # Ingested source material (articles, papers, docs, repos, session learnings)
│   └── _manifest.md     # Index of all raw sources with status
├── wiki/                # Unified wiki — ALL knowledge as flat .md files with frontmatter
│   ├── _index.md        # Master index grouped by type
│   └── _tags.md         # Tag registry with article counts
└── _search/
    ├── index.json       # TF-IDF search index (auto-generated)
    └── stats.md         # KB health metrics
```

**KB Commands:**
- `/kb ingest <source>` — ingest URL, file, repo, or session learnings into raw/ + create wiki stub
- `/kb compile` — deep compilation: expand stubs, cross-link, extract concepts, health check
- `/kb search <query>` — TF-IDF search across wiki (used by LLM and user)
- `/kb ask <question>` — Q&A against wiki, answer filed back as new article

**When pipeline commands read it:**
- `/prime` — reads wiki index + auto-searches for task-relevant articles
- `/execute` — searches wiki before each task for relevant context

**When pipeline commands write it:**
- `/start` (L0) — creates KB structure + initial wiki articles
- `/create-prd` — seeds wiki with project overview, architecture, feature articles
- `/plan-project` — creates/updates feature articles alongside GitHub issues
- `/ship` — updates feature articles with implementation details, creates decision articles
- `/evolve` — captures session learnings as raw + stub wiki articles

## Post-Init Merge

When `.claude/.init-meta.json` exists, the framework was recently installed or updated. Files with `.backup` extensions contain the project's previous versions. The `/start` command will detect this and run the merge flow before normal routing.

**Merge rules by file type:**

| File | Strategy |
|------|----------|
| `CLAUDE.md` | Merge project-specific sections (Tech Stack, Knowledge Base, Design Skill Preference, QA Tools, custom sections) into new template. Preserve all user-added content. |
| `.claude/rules/*.md` | Append user-added conventions, checklist items, and skill chain customizations to new framework rules. Don't duplicate entries already in the new version. |
| `.claude/commands/*.md` | If user modified a command, present diff and ask. Otherwise skip (no merge needed). |
| `.claude/references/code-patterns.md` | Always restore from backup — entirely project-specific. |
| `.claude/references/*.md` (other) | Skip — framework templates, no project content. |
| `.claude/agents/architect-agent/*` | Always restore from backup — project knowledge base. |
| `.claude/agents/tester-agent/*` | Always restore from backup — project test patterns. |
| `.claude/agents/mobile-tester-agent/*` | Always restore from backup — project screen patterns. |
| `.obsidian/**` | Always restore from backup — project wiki and raw sources. |

**Merge process:** For each `.backup` file, read both versions, present a summary of what will be merged, wait for user approval, then apply. Delete `.backup` files and `.init-meta.json` when complete.

## Code Review Layers

The framework supports two complementary review layers:

| Layer | Command | What it checks | Required |
|-------|---------|---------------|----------|
| **Superpowers Code Review** | `/validate` Phase 5 | Implementation defects, plan adherence, security, edge cases | Always available |
| **Codex Adversarial Review** | `/ship` Step 1.6 | Design choices, tradeoffs, assumptions, alternative approaches | Optional (requires OpenAI subscription + Codex plugin) |

These are additive — the adversarial review questions whether the *approach* is right, while the code review checks whether the *implementation* is correct.

## Verification Standard

Both Standard and Superpowers modes MUST run `/validate` before `/ship`. The superpowers `verification-before-completion` skill is NOT a substitute for `/validate`. The superpowers `requesting-code-review` skill is NOT a substitute for `/validate` Phase 5.

After implementation (via `/execute` or `superpowers:subagent-driven-development`), always run `/validate` to verify: automated checks, visual testing, QA tests, security scans, and code review.

**Superpowers KB integration:** When using `superpowers:subagent-driven-development`, search the wiki (`KB_PATH=<kb-path> node cli/kb-search.js search "<keywords>"`) before dispatching each task implementer to provide relevant project context.

## QA Tools

Default QA test tools by domain. Override per-project by editing this section.

| Domain | Tool |
|--------|------|
| Web E2E | Playwright |
| API E2E | Supertest |
| Mobile E2E | Detox |

## Rules & References

- Domain-specific rules auto-load from `.claude/rules/` based on file paths being edited
- Reference templates in `.claude/references/` are loaded on-demand by commands
- See `docs/customization.md` for adding custom rules and agents

## External Dependencies

Run `/setup` to check what's installed. See `docs/plugin-install-guide.md` for full list.
