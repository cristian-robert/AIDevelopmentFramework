# Subagent Model Matrix (summary)

Full matrix: `.claude/references/subagent-model-selection.md`. This is the at-dispatch quick-pick.

| Tier | Model | Use for |
|------|-------|---------|
| 1 | `haiku` | Pure retrieval (glob/grep/file inventory, manifest reads) |
| 2 | `sonnet` | Multi-source synthesis, mechanical tools (architect-RETRIEVE, tester-agent screenshots, KB lean-reads, test-placement) |
| 3 | `sonnet` | Implementer for fully-pinned S/M plan tasks (every file pinned, complete code, no design language) |
| 4 | `opus` | Implementer for L/XL or judgement tasks (body says "choose"/"decide"/"design"/"trade-offs", new patterns, security-sensitive) |
| 5 | `opus` | All reviewers (spec-reviewer, /validate Phase 5, 5D Critique, Codex adversarial). Never downgrade. |
| 6 | `sonnet` | Auto-evolve subagent (pattern extraction, KB stub creation) |

## At-dispatch routing

1. Plan task has explicit `model:` frontmatter → use it.
2. Else: judgement work? → opus. Pinned implementation? → sonnet. Pure retrieval? → haiku.
3. Env override `AIDF_MODEL_FLOOR=opus` → force opus.
4. When in doubt, **upgrade**. Never silently downgrade.

## Anti-patterns

- Dispatching with `model:` unspecified → defaults to orchestrator's Opus, wastes budget.
- Sonnet reviewers → false-confidence ship.
- Opus on Tier 1 reads → 15× cost for no benefit.
