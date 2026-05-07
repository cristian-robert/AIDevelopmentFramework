# /ship — Step 1.7: Codex Adversarial Review (optional)

Requires OpenAI subscription + Codex plugin. If not available → skip.

## Detection

```bash
test -f "$HOME/.claude/plugins/cache/openai-codex/codex/*/scripts/codex-companion.mjs" && echo "codex available" || echo "codex not available"
```

## If available

1. Ask: "Run Codex adversarial review before committing? (requires OpenAI subscription)"
   - **Yes** → run `/codex:adversarial-review` against working tree changes.
   - **No** → skip to Step 2.
2. Present review output.
3. Significant concerns surfaced → ask: "Address these before committing, or proceed?"
   - **Address** → stop `/ship`; user fixes; re-run `/ship`.
   - **Proceed** → continue to Step 2.

## Scope

Does NOT replace `/validate` Phase 5 code review. Additional adversarial perspective questioning design choices, tradeoffs, assumptions — not just implementation defects.
