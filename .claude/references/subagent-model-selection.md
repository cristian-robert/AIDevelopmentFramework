# Subagent Model Selection

Cost-aware model routing for every subagent dispatch in the framework. The orchestrator (Opus 4.7 with 1M context) does the planning and judgement; subagents get the cheapest model that can do their job correctly.

## Why this exists

Opus 4.7 in the orchestrator costs roughly **5x** what Sonnet 4.6 costs and **15x** what Haiku 4.5 costs per token. A naive "always-Opus subagents" pipeline burns budget on tasks that don't need judgement (file reads, mechanical implementation of fully-specified tasks, screenshot capture). Conversely, downgrading judgement-heavy work (code review, architectural decisions, ambiguous bug fixes) to Sonnet produces silent quality regressions.

The matrix below is the single source of truth. Every command that spawns a subagent **must** consult it and pass `model: "haiku" | "sonnet" | "opus"` explicitly when invoking the Agent tool.

## Decision matrix

| Tier | Model | Use when… | Examples |
|------|-------|-----------|----------|
| **Tier 1 — Read-only** | `haiku` | Pure retrieval, no synthesis, no judgement. Output is a list, table, or raw extract. | grep/glob/file inventory, "find all callers of X", manifest reads, log scrapes, simple JSON parsing |
| **Tier 2 — Read + light synthesis** | `sonnet` | Reads multiple sources and produces a structured summary. No design decisions. | architect-agent RETRIEVE, codebase-pattern survey, dependency-graph build, test-placement planning, KB lean-index reads, tester-agent VERIFY/FLOW screenshots |
| **Tier 3 — Implementation (precisely specified)** | `sonnet` | Implementer for a plan task that the Opus planner already broke down into exact files, exact code patterns, and exact verification commands. Size S or M. No design left to make. | `/execute` task-implementer when the plan task has: explicit file paths, complete code skeletons, named libraries with versions, exact CLI commands. Bug fixes with reproducer + identified root cause. Mechanical refactors (rename, extract function with given signature). |
| **Tier 4 — Implementation (judgement)** | `opus` | Size L or XL, OR the task includes an ambiguous design decision, OR the plan says "choose between X and Y", OR the implementer must invent a new pattern. | New module from a high-level brief, architectural refactor, multi-file feature with cross-cutting concerns, security-sensitive changes, anything where rolling back a wrong choice is expensive. |
| **Tier 5 — Review and adversarial** | `opus` | Code review, spec-reviewer, /validate Phase 5, Codex adversarial review proxy, design 5D critique. | All review subagents. Cheaper models miss subtle bugs and rubber-stamp. |
| **Tier 6 — Auto-evolve (post-validate / post-ship)** | `sonnet` | The `/evolve` command spawned automatically by `/validate` Phase 7 or `/ship` fallback. Pattern extraction + KB stub creation, no novel architectural judgement. | Capturing session learnings, drafting wiki stubs from diff + git log, suggesting rule extractions. |

## How a command picks a model

Before dispatching any subagent, the orchestrator runs this check (mentally, not as code — it's a routing decision):

1. **Is the subagent's job to produce or judge a *decision*?** (review, design, ambiguous trade-off) → Tier 5/4 → **opus**.
2. **Is the subagent implementing a task whose every file/function/command is already pinned by the plan?** → Tier 3 → **sonnet**.
3. **Is the subagent reading + summarising, or running mechanical tools (browser/mobile, screenshot, lint)?** → Tier 2 → **sonnet**.
4. **Is the subagent doing pure retrieval with no summarisation?** → Tier 1 → **haiku**.

When in doubt, **upgrade** rather than downgrade — a Sonnet-instead-of-Opus regression is invisible until production breaks; a Haiku-instead-of-Sonnet regression usually fails fast (the agent says "I can't do this").

## Plan-task tagging (how the planner pins a tier)

`/plan-feature` writes a `model:` hint into each task's frontmatter so `/execute` doesn't have to re-judge:

```yaml
- task: 3
  title: Add `expiresAt` column to sessions table
  size: S
  model: sonnet           # tier 3 — exact migration SQL specified in the task
  files: [migrations/0042_add_session_expiry.sql, src/types/session.ts]
```

If `model:` is absent, `/execute` falls back to the matrix using `size` + presence of design language ("choose", "design", "decide", "consider trade-offs") in the task body.

## Override paths

- **User override (per task):** the user can say "do this with sonnet" / "use opus for the next task" — honour it without arguing. The matrix is a default, not a law.
- **Env override (per session):** `AIDF_MODEL_FLOOR=opus` forces every subagent to opus regardless of tier (e.g., when the user is debugging a model-quality regression). `AIDF_MODEL_FLOOR=haiku` is **not allowed** — the floor exists to upgrade, not downgrade.
- **Cost guardrail:** if a single `/execute` run is projected to exceed a per-session budget (counted by the orchestrator from prior subagent token totals), surface a one-line warning before the next dispatch — do not auto-downgrade.

## Anti-patterns

- **Don't dispatch a Tier 4 implementer with model unspecified** — Claude Code defaults will pick the orchestrator's model, which is Opus and wastes budget.
- **Don't dispatch a Tier 5 reviewer on Sonnet to "save money"** — reviewers that don't catch real bugs are worse than no reviewer (false-confidence ship).
- **Don't loop the matrix into the user prompt** — load this reference only at the dispatch site, then drop it. The matrix is small but cumulative cost matters.
