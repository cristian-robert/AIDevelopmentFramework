# Scope Levels and Mode Selection

## Scope levels

- **L-1 (Onboard)** — no project CLAUDE.md found. Run `/prime` then `/create-rules` then come back to `/start`.
- **L0 (Project)** — fresh project, no PRD, no issues. `superpowers:brainstorming` → `/create-prd` → `/plan-project` → `/create-rules` → per-issue L2.
- **L1 (Feature)** — project exists, user has a feature idea (no specific issue). `superpowers:brainstorming` → `/plan-feature` → creates issue(s) → per-issue L2.
- **L2 (Issue)** — user has or references a specific issue number. `gh issue view #N` → `/prime` → `/plan-feature #N` (or `/execute` if plan exists) → `/validate` → `/ship`.
- **L3 (Bug)** — user describes a bug or references a bug issue. `gh issue view` → `/prime` → `superpowers:systematic-debugging` → fix → `/validate` → `/ship`.

## Mode selection

For L0, L1, and complex L2 tasks, ask the user:

- **Superpowers Mode** — Full PIV+E pipeline: `superpowers:brainstorming` → plan → TDD → execute (subagent-driven) → `/validate` (QA + security + visual + review) → `/ship` → `/evolve`.
- **Standard Mode** — Lighter: plan → implement → `/validate` → `/ship`.

For L3 (bugs) and simple L2 (size S/M), default to Standard Mode without asking.
