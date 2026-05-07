# /evolve — Steps 3–6: Architect KB, Rules, CLAUDE.md, Code Patterns

## Step 3: Update architect KB

If structural changes were made:
1. Dispatch architect-agent with RECORD query.
2. Agent verifies changes exist in codebase.
3. Agent updates relevant domain files in `modules/` and `frontend/`.
4. Agent updates `index.md` if new domains were added.

After updates, if Step 2 wiki stubs accumulated → suggest `/kb-compile`. Then:

```bash
KB_PATH=<kb-path> node cli/kb-search.js index
```

## Step 4: Update rules (pointers only)

Rules get NO new prose. For each new convention:
1. Write detail to wiki (or paired `*-detail.md` reference).
2. Add a single bullet in the rule's Conventions block OR an entry in References.
3. If a rule has no place for the pointer → create the paired detail file first.

## Step 5: Update CLAUDE.md (pointers only)

Same policy — detail goes to wiki/references, CLAUDE.md only references.

Invoke `revise-claude-md` skill with: "pointer updates only; reject content additions over 3 lines."

**Post-processing:** the skill may not honor that constraint. Diff its output against prior CLAUDE.md and reject any addition >3 lines — move overflow to wiki / `.claude/references/*-detail.md`.

## Step 6: Update code patterns

If `/execute` revealed patterns the AI should follow:
- Add to `.claude/references/code-patterns.md`.
- Include real code examples from current codebase.
- Note common pitfalls with before/after examples.
