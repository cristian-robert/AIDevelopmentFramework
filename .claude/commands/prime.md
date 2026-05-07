# /prime — Context Loader (task-aware, lean)

Loads a focused, task-aware slice of project context. Run at session start, after a context reset, or when switching tasks.

**Output:** one line per `_shared/output-contract.md`.

## Step 0: Task scope (blocker — interactive only)

Ask:

> What's the scope for this session?
> 1. **Specific GitHub issue** — enter `#<number>`
> 2. **Task description** — one sentence
> 3. **No task** — prime with generic project context only

Wait for the answer. Capture **task keywords** for Step 5:
- (1) Issue → `gh issue view <number>` and extract keywords from title + first body paragraph
- (2) Description → use the sentence itself
- (3) No task → default to project name from `package.json` / CLAUDE.md title

**Non-interactive fallback:** scripted invocation (hook, CI, command-chain) → skip the prompt; default to "no task".

## Phases (load on demand)

| # | Phase | Reference | Load condition |
|---|-------|-----------|----------------|
| 1+2 | Structure, history, project docs | `prime/01-context-gather.md` | always |
| 3+4 | Active context + config indexes | `prime/02-active-context.md` | always |
| 5 | KB lean load | `prime/03-kb-lean.md` | KB configured per `_shared/kb-detect.md` |

## Output (one line)

```
Primed: <branch> · task=<#N | "<desc>" | none> · plan=<file or none> · KB=<N docs | off> · Next: <suggested command>
```

Suggested command logic:
- Issue + matching plan → `/execute`
- Issue, no plan → `/plan-feature #<N>`
- Description, no issue → `/plan-feature` (or `/start` if uncertain)
- No task → `/start`

## Blockers (replace one-liner)

- KB configured but `<kb-path>` directory missing → "KB path `<path>` configured in CLAUDE.md but does not exist. Run `/start` (L0) to create it, or remove the `## Knowledge Base` section."
- `gh issue view <N>` fails → "Issue #N not found or `gh` not authenticated."
