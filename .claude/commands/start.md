# /start — Smart Pipeline Router

You are the entry point to the AIDevelopmentFramework PIV+E pipeline. Your job is to detect where the user is in their workflow and route them to the right commands.

## Step 1: Gather Context

Run these in parallel:
1. Check if `CLAUDE.md` exists in the project root (not the framework's own CLAUDE.md)
2. Check if any PRD exists: `find docs/plans -name "PRD*" -o -name "prd*" 2>/dev/null`
3. Check current git branch and status
4. Check for existing GitHub issues: `gh issue list --limit 5 2>/dev/null`
5. Check for existing plan files: `find docs/plans docs/superpowers/plans -name "*.md" 2>/dev/null`
6. Check if knowledge base is configured: look for `## Knowledge Base` section with `Path:` in CLAUDE.md. If found, check if the directory exists and has `overview.md`

## Step 2: Detect Scope Level

Based on context, determine the entry point:

**L-1 (Onboard)** — No CLAUDE.md found for the project
→ "This project hasn't been set up with the framework yet."
→ Suggest: `/prime` then `/create-rules` then come back to `/start`

**L0 (New Project)** — No PRD, no issues, minimal/no code
→ "Looks like a fresh project. Let's plan it from scratch."
→ Route to:
  1. Brainstorm functionalities (interactive discussion)
  2. If knowledge base configured in CLAUDE.md:
     a. Create knowledge base folder structure (`overview.md`, `features/`, `decisions/`, `config/`, `research/`, `architecture/`)
     b. Create `overview.md` from brainstorming results using `.claude/references/knowledge-base-templates.md`
     c. Create feature notes in `features/` for each agreed functionality
  3. `/create-prd` (generates PRD from brainstorming, seeds knowledge base if configured)
  4. `/plan-project` (creates GitHub issues, links them to feature notes)
  5. STOP — present the issue list and ask: "Which issue do you want to work on first?"

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
