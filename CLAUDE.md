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

## Design Artifacts vs. Production Code

Two distinct paths through the pipeline:

- **Production code** (React components, pages, real shipping UI) — `/plan-feature` → `/execute` (implementer + reviewer subagents) → `/validate` (Phases 1–7)
- **Design artifacts** (clickable HTML prototypes, slide decks, motion, infographics, mockups) — `/plan-feature` Phase 1.5 detects intent → `/brand-extract` (if `.design-system/brand-spec.md` missing) → `/execute` Step 2.5 dispatches **`huashu-design`** → `/validate` Phase 2.5 (5D Visual Critique)

The design-artifact branch uses [huashu-design](https://github.com/alchaincyf/huashu-design) externally; install with `npx skills add alchaincyf/huashu-design`. Project-local `.claude/skills/brand-extract/` writes `.design-system/brand-spec.md` once per project so huashu-design's Core Asset Protocol doesn't re-ask for assets every run. See `.claude/rules/frontend.md` for the gate that routes between the two paths.

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

When `.claude/.init-meta.json` exists (or `.backup` files are present), run `/merge-configs` to reconcile project-specific content with the new framework files. `/start` Step 0 auto-delegates to `/merge-configs` when the init marker is found.

See `.claude/references/merge-strategy.md` for the canonical merge strategy — it is the single source of truth for per-file categorization and merge rules.

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

## Output Compaction

State: off

Controls the `.claude/hooks/output-compact.sh` Stop hook. Defaults to OFF — flip to `on` to enable. Read the rules in `.claude/references/output-compaction.md` first. Does not affect agent-to-agent communication.

Override per-session: `CLAUDE_OUTPUT_COMPACT=on` (force on) or `CLAUDE_OUTPUT_COMPACT=off` (force off).

## External Dependencies

Run `/setup` to check what's installed. See `docs/plugin-install-guide.md` for full list.

## Session Learnings

Captured during v0.4 release; full detail in wiki.

- [[adversarial-review-multi-lens]] — per-task + Codex + Opus review layering
- [[subagent-driven-execution]] — 3-4x cost, catches tactical + integration issues
- [[default-on-hooks-opt-in]] — automation that mutates user output ships opt-in
