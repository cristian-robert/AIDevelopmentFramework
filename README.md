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
