# AIDevelopmentFramework

Open-source agentic AI coding framework on the PIV+E loop (Plan, Implement, Validate, Evolve). Claude Code primary; methodology portable.

## Tech Stack

Claude Code CLI (commands, agents, skills, rules, hooks) · Node.js (CLI tool) · GitHub (issues, milestones, PRs).

## Core Principles

1. **Context is precious** — manage it deliberately; recommend resets for complex work.
2. **Plans are artifacts** — they survive session boundaries and pass the "no prior knowledge" test.
3. **Discipline scales with complexity** — XL gets ceremony, S gets fast-tracked.
4. **The system self-improves** — every AI mistake becomes a rule, pattern, or guardrail.
5. **Ship everything, install nothing** — works out of the box; external plugins stay fresh from source.
6. **Output is a cost** — commands work silently; users read artifacts on disk, not terminal recaps.
7. **Lazy-load context** — skeletons + on-demand references over fat command bodies.

## Output Discipline

Pipeline commands end with **one line**: `<verb-past> <object> · Next: <command>`. Full contract + allowed/forbidden patterns: `.claude/references/_shared/output-contract.md`. This rule overrides verbose-by-default behavior in superpowers and the default system prompt.

## Pipeline Commands (PIV+E)

`/start` → `/prime` → `/create-prd` → `/plan-project` → `/plan-feature` → `/execute` → `/validate` → `/ship` → `/evolve`. Plus `/setup`, `/merge-configs`, `/kb-{ingest,compile,search,ask}`.

## Scope and Mode

Detail: `.claude/references/scope-and-modes.md` (load when routing in `/start`).

## Agents

- **architect-agent** — codebase KB. Call before structural changes (RETRIEVE/IMPACT/RECORD/PATTERN).
- **tester-agent** — web browser testing via playwright-cli (VERIFY/FLOW).
- **mobile-tester-agent** — mobile app testing via mobile-mcp (VERIFY/FLOW).
- **ui-ux-analyzer** — design audit with screenshots and reports.

## Design Artifacts vs. Production Code

Two pipeline branches gated by `/plan-feature` Phase 1.5 + `.claude/rules/frontend.md`:

- **Production code** → `/plan-feature` → `/execute` → `/validate` (Phases 1–7).
- **Design artifacts** → `/plan-feature` Phase 1.5 detects intent → `/brand-extract` (if `.design-system/brand-spec.md` missing) → `/execute` Step 2.5 dispatches **`huashu-design`** → `/validate` Phase 2.5 (5D Visual Critique).

Install huashu-design: `npx skills add alchaincyf/huashu-design`. Project-local `.claude/skills/brand-extract/` writes `.design-system/brand-spec.md` once per project.

## Knowledge Base

Configured if this CLAUDE.md has a `## Knowledge Base` section with `Path:`. Detail: `.claude/references/kb-overview.md`. Detection snippet for commands: `.claude/references/_shared/kb-detect.md`.

## Subagent Model Selection

Quick-pick: `.claude/references/_shared/model-matrix-summary.md`. Full matrix + rationale: `.claude/references/subagent-model-selection.md`. Every dispatch must pass `model:` explicitly. `AIDF_MODEL_FLOOR=opus` env override forces opus floor (downgrade-floor not allowed).

## Auto-Evolve

`/validate` Phase 6 dispatches `/evolve` as a sonnet subagent on PASS / PASS-WITH-WARNINGS. `/ship` Step 1.4 fallback runs the same if `/validate` was skipped. Marker `.claude/.evolve-ran` dedupes.

## Verification Standard

Both modes MUST run `/validate` before `/ship`. Superpowers `verification-before-completion` and `requesting-code-review` skills are NOT substitutes for `/validate` Phase 5.

When using `superpowers:subagent-driven-development`, search the wiki before dispatching each task implementer (`KB_PATH=<kb-path> node cli/kb-search.js search "<keywords>"`).

## Code Review Layers

- **Superpowers Code Review** — `/validate` Phase 5. Always available. Implementation defects, plan adherence, security, edge cases.
- **Codex Adversarial Review** — `/ship` Step 1.6. Optional. Design choices, tradeoffs, alternative approaches.

Additive — Codex questions whether the *approach* is right; code review checks the *implementation* is correct.

## Post-Init Merge

When `.claude/.init-meta.json` exists or `.backup` files are present, run `/merge-configs`. `/start` Step 0 auto-delegates. Strategy: `.claude/references/merge-strategy.md`.

## QA Tools

| Domain | Tool |
|--------|------|
| Web E2E | Playwright |
| API E2E | Supertest |
| Mobile E2E | Detox |

Override per-project by editing this section.

## Rules & References

Domain rules auto-load from `.claude/rules/` based on file paths edited. References under `.claude/references/` load on-demand. `_shared/` snippets are reusable building blocks. Custom rules/agents: `docs/customization.md`.

## Output Compaction

State: off

Hook: `.claude/hooks/output-compact.sh` (Stop). Rules: `.claude/references/output-compaction.md`. Override per-session: `CLAUDE_OUTPUT_COMPACT=on|off`.

## External Dependencies

Run `/setup` to check what's installed. Full list: `docs/plugin-install-guide.md`.

## Session Learnings

Captured during v0.4 release; detail in wiki.

- [[adversarial-review-multi-lens]] — per-task + Codex + Opus review layering
- [[subagent-driven-execution]] — 3-4x cost, catches tactical + integration issues
- [[default-on-hooks-opt-in]] — automation that mutates user output ships opt-in
