# AIDevelopmentFramework

The system around the AI that makes the AI reliable.

An open-source framework for structured AI-assisted software development. Built on the **PIV+E loop** (Plan, Implement, Validate, Evolve) — a methodology where the human owns planning and validation, the AI owns implementation, and the system gets smarter with every cycle.

## Why This Exists

AI coding assistants are powerful but unpredictable. They lose context, repeat mistakes, and produce code that looks right but isn't. The solution isn't a better AI — it's a better **system around the AI**: plans that survive session boundaries, rules that prevent known mistakes, agents that maintain architectural knowledge, and a self-improving feedback loop.

## Quick Start

### Install via npm

```bash
# In your project directory
npx ai-framework init
```

This downloads the latest framework and sets up `.claude/`, `CLAUDE.md`, and `docs/` in your project. Existing customizations are preserved — the CLI detects conflicts and asks how to handle them.

### Update to latest version

```bash
npx ai-framework update
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
├── commands/       10 pipeline commands (the workflow)
├── agents/         4 specialist agents + template
├── skills/         Framework-specific skills
├── rules/          6 auto-loading domain rules + template
├── references/     6 templates (PRD, plan, issue, patterns, knowledge base)
└── hooks/          5 guardrails (branch protection, reminders)
```

## Knowledge Base (Optional)

An Obsidian-compatible project knowledge base that gives the agent persistent understanding across sessions. Feature specs, architecture decisions, and project context — stored as markdown, read and updated automatically by pipeline commands.

```
.obsidian/           # or any custom path
├── overview.md      # Project vision, goals, tech stack
├── architecture/    # System design, data model
├── features/        # One note per feature area, linked to GitHub issues
├── decisions/       # Architecture Decision Records
├── config/          # Integration metadata (never actual secrets)
└── research/        # Brainstorming notes, tech comparisons
```

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
npx ai-framework init          Install framework in current project
npx ai-framework update        Update framework files (preserves customizations)
npx ai-framework --version     Show version
npx ai-framework --help        Show help
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
