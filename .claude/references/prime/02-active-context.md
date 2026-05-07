# /prime — Steps 3+4: Active Context + Configuration Indexes

## Step 3: Active context

- Issue number from Step 0 (if not already fetched) → `gh issue view <number>`
- Feature branch → extract issue number from branch name as a secondary signal
- Look for matching plan file under `docs/plans/` or `docs/superpowers/plans/` — match by issue number, branch name, or task description keywords
- Plan file found → read **only** the "Goal", "Architecture", and "Mandatory Reading" sections (targeted Read, not full-file). The rest is loaded on demand when execution reaches those tasks.

## Step 4: Configuration (indexes only)

Load TOC-level views only. Do not follow internal links or expand nested files.

- `.claude/agents/architect-agent/index.md` — TOC only (top-level module list / link list).
- `.claude/agents/tester-agent/test-patterns.md` — inventory table only (page/route listing).
- `package.json` (or equivalent) — for available scripts/commands.
