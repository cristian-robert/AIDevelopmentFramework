# /evolve — Self-Improvement

Updates the framework's rules, KB, and patterns from what was learned in this session. Makes the system smarter over time.

**Philosophy:** "Every bug from the AI coding assistant isn't just something to fix — it's an opportunity to address the root cause in your system."

**Output:** one line per `_shared/output-contract.md`.

## Steps (load on demand)

| # | Step | Reference | Load condition |
|---|------|-----------|----------------|
| 1+2+2.5 | Reflect, capture learnings (KB-first), token-budget check | `evolve/01-reflect-and-capture.md` | always |
| 3–6 | Architect KB, rules, CLAUDE.md, code patterns | `evolve/03-update-architect-and-rules.md` | always (sub-steps gated by what changed) |
| 7 | Commit + output | inline | always |

## Step 7 — inline

```bash
git add CLAUDE.md .claude/
git commit -m "chore: evolve framework — update rules and knowledge base"
```

## Output (one line)

```
Evolved: N learnings · M rule extractions · K stubs pending · size-warn=W · Next: /kb-compile (if K>0) or /start
```

Omit `size-warn=W` when W is 0. Hard-cap blockers (`exit 2` from the lint) do not produce a one-liner — they block until extracted, per Step 2.5.
