# AIDevelopmentFramework

The system around the AI that makes the AI reliable.

An open-source framework for structured AI-assisted software development. Built on the **PIV+E loop** (Plan, Implement, Validate, Evolve) — a methodology where the human owns planning and validation, the AI owns implementation, and the system gets smarter with every cycle.

## Why This Exists

AI coding assistants are powerful but unpredictable. They lose context, repeat mistakes, and produce code that looks right but isn't. The solution isn't a better AI — it's a better **system around the AI**: plans that survive session boundaries, rules that prevent known mistakes, agents that maintain architectural knowledge, and a self-improving feedback loop.

## Quick Start

### Install via npm

```bash
# In your project directory
npx ai-development-framework init
```

This downloads the latest framework and sets up `.claude/`, `CLAUDE.md`, and `docs/` in your project. Existing files are backed up as `.backup` — run `/start` to merge your project configuration with the new framework.

### Update to latest version

```bash
npx ai-development-framework update
```

Updates framework files while preserving your project-specific configurations (knowledge bases, agent data, custom rules).

### First session

```bash
# 1. Open Claude Code in your project
# 2. Check dependencies
/setup
# 3. Start working
/start
```

`/start` detects where you are and routes you to the right pipeline:
- **New project?** Brainstorm, create knowledge base, generate issues
- **New feature?** Plan and decompose into issues
- **Have an issue?** Load context and start building
- **Found a bug?** Debug systematically

## The PIV+E Loop

```
Plan ──> Implement ──> Validate ──> Evolve
  ^                                    │
  └────────────────────────────────────┘
```

**Plan** — Brainstorm, write specs, decompose into issues
**Implement** — TDD, execute plans, use specialist agents
**Validate** — Automated checks, visual testing, code review
**Evolve** — Update rules and knowledge from what was learned

## Pipeline Commands

| Command | Phase | Purpose |
|---------|-------|---------|
| `/start` | Router | Detects what you're doing, routes to the right pipeline |
| `/prime` | Plan | Loads codebase + knowledge base context into session |
| `/create-prd` | Plan | Brainstorms and generates a PRD, seeds knowledge base |
| `/plan-project` | Plan | Decomposes PRD into GitHub milestones, issues, and feature notes |
| `/plan-feature` | Plan | Creates detailed implementation plan |
| `/execute` | Implement | Executes plan with TDD, reads related knowledge |
| `/validate` | Validate | Runs lint, tests, visual testing, code review |
| `/ship` | Validate | Updates knowledge base, optional Codex review, commits, pushes, creates PR |
| `/evolve` | Evolve | Updates rules and knowledge base |
| `/setup` | Utility | Checks framework health and dependencies |

## Scope Levels

| Level | You say... | Pipeline |
|-------|-----------|---------|
| L0 (Project) | "I have an idea" | Brainstorm > PRD > Issues > Knowledge base > per-issue L2 |
| L1 (Feature) | "I need a feature" | Plan feature > Create issues > per-issue L2 |
| L2 (Issue) | "I have issue #42" | Prime > Plan > Execute > Validate > Ship |
| L3 (Bug) | "There's a bug" | Prime > Debug > Fix > Validate > Ship |

## What's Inside

```
.claude/
├── commands/       14 pipeline commands (incl. 4 /kb commands)
├── agents/         4 specialist agents + template
├── skills/         Framework-specific skills
├── rules/          8 auto-loading domain rules + template
├── references/     7 templates (PRD, plan, issue, patterns, KB articles)
└── hooks/          5 guardrails (branch protection, reminders)
cli/
└── kb-search.js    TF-IDF search tool for knowledge base
```

## Knowledge Base (Optional)

A unified LLM knowledge base inspired by [Karpathy's LLM Knowledge Bases](https://x.com/karpathy) workflow. External research and project knowledge live together as a flat wiki. The LLM ingests raw sources, compiles them into wiki articles, auto-searches during task work, and grows the wiki from every coding session.

```
.obsidian/           # or any custom path
├── raw/             # Ingested source material (articles, papers, docs, repos, sessions)
│   └── _manifest.md # Index of all raw sources with status
├── wiki/            # Unified wiki — all knowledge as flat .md files with frontmatter
│   ├── _index.md    # Master index grouped by type
│   └── _tags.md     # Tag registry with article counts
└── _search/
    └── index.json   # TF-IDF search index (auto-generated)
```

**KB Commands:**
- `/kb ingest <source>` — ingest URL, file, repo, or session learnings
- `/kb compile` — expand stubs, cross-link, extract concepts, health check
- `/kb search <query>` — TF-IDF search across wiki
- `/kb ask <question>` — Q&A against wiki, answer filed back as new article

**Enable it** by adding to your project's `CLAUDE.md`:

```markdown
## Knowledge Base

Path: .obsidian/
```

Works with [Obsidian](https://obsidian.md/) for a navigable UI, but Obsidian is not required — it's just markdown.

## Code Review Layers

The framework supports two complementary review layers:

| Layer | When | What it checks |
|-------|------|---------------|
| **Superpowers Code Review** | `/validate` | Implementation defects, plan adherence, security, edge cases |
| **Codex Adversarial Review** | `/ship` (optional) | Design choices, tradeoffs, assumptions, alternative approaches |

The adversarial review requires an OpenAI subscription and the Codex plugin. It questions whether the *approach* is right, while the code review checks whether the *implementation* is correct.

## Specialist Agents

| Agent | Purpose |
|-------|---------|
| **architect-agent** | Codebase knowledge base. Call before structural changes. |
| **tester-agent** | Web browser testing via playwright-cli. |
| **mobile-tester-agent** | Mobile app testing via mobile-mcp. |
| **ui-ux-analyzer** | Design audits with screenshots and reports. |

## CLI Reference

```
npx ai-development-framework init          Install framework (backs up existing files)
npx ai-development-framework update        Update framework (backs up, run /start to merge)
npx ai-development-framework --version     Show version
npx ai-development-framework --help        Show help
```

## Documentation

- [Methodology](docs/methodology.md) — The PIV+E loop explained
- [Getting Started](docs/getting-started.md) — Setup and walkthrough
- [Command Reference](docs/command-reference.md) — All commands
- [Customization](docs/customization.md) — Adding agents, rules, skills, knowledge base
- [Plugin Install Guide](docs/plugin-install-guide.md) — Dependencies

## Credits

Synthesizes approaches from:
- [Cole Medin's AI Coding Summit Workshop](https://github.com/coleam00/ai-coding-summit-workshop-2) — PIV loop, context resets, plan-as-specification
- Real-world battle-tested Claude Code configurations from production development

## License

MIT
