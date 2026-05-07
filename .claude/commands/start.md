# /start — Smart Pipeline Router

Entry point to the AIDevelopmentFramework PIV+E pipeline. Detects where the user is in their workflow and routes to the right commands.

**Output:** one line per `_shared/output-contract.md`.

## Step 0: Pending merge

If `.claude/.init-meta.json` exists → invoke `/merge-configs` and wait for completion before continuing. The merge command owns all merge logic (`.claude/references/merge-strategy.md` is the source of truth).

## Step 0.5: Deliverable-type routing (UI work only)

If the request involves any UI/visual work (page, screen, component, dashboard, mockup, prototype, deck, animation, infographic, redesign, look-and-feel) → run the canonical clarifying script in `.claude/references/design-clarifying-script.md` **before** Step 2 scope detection.

Process:
1. Detect project state in parallel:
   - Fresh project (no UI files, no `package.json`) → route directly to `/brand-extract` Direction Advisor; skip the script and skip Step 2's L0 path's design assumptions.
   - In-dev → continue.
2. Apply the "When the script runs" conditions. Skip silently for unambiguous requests.
3. Run the 3-question script. Persist answers so `/plan-feature` and `/execute` Step 2.5 read them instead of re-asking.
4. Use the routing matrix to set the deliverable type before falling through to Step 2.

If no UI/visual signal → skip Step 0.5.

## Step 1: Gather context (parallel)

```bash
test -f CLAUDE.md && echo "yes" || echo "no"
find docs/plans -name "PRD*" -o -name "prd*" 2>/dev/null
git status --short && git branch --show-current
gh issue list --limit 5 2>/dev/null
find docs/plans docs/superpowers/plans -name "*.md" 2>/dev/null
```

KB detection per `_shared/kb-detect.md`.

## Step 2: Detect scope level

Per `.claude/references/scope-and-modes.md`. Routing summary:

- **L-1 (Onboard)** — no project CLAUDE.md → suggest `/prime` then `/create-rules`, return to `/start`.
- **L0 (New project)** — no PRD, no issues, minimal code → invoke `superpowers:brainstorming`, then KB scaffold per `.claude/references/start/l0-kb-scaffold.md`, then `/create-prd` → `/plan-project`.
- **L1 (New feature)** — project exists, feature idea, no specific issue → `/plan-feature`.
- **L2 (Issue work)** — user has/references a specific issue number → `/prime` then `/plan-feature #<n>` (or direct `/execute` if plan exists).
- **L3 (Bug fix)** — bug description or bug issue → `/prime` then `superpowers:systematic-debugging`.

## Step 3: Ask if uncertain

If scope isn't clear, ask:

> What are you working on today?
> 1. Starting a new project from an idea (L0 — full planning pipeline)
> 2. Building a new feature (L1 — `superpowers:brainstorming` + plan + implement)
> 3. Working on a specific GitHub issue (L2 — plan + implement)
> 4. Fixing a bug (L3 — debug + fix)
> 5. Joining this project for the first time (L-1 — onboard)

## Step 4: Mode selection

For L0, L1, complex L2 → ask Superpowers vs Standard (full text in `.claude/references/scope-and-modes.md`). For L3 and simple L2 (S/M) → default to Standard without asking.

## Step 5: Output (one line)

```
Routed: L<n> <mode> · Next: <next command>
```
