# /merge-configs — Step 4: Execute (per-file approval)

For each file in the plan:

1. Show the file + strategy.
2. Ask: **apply / skip / show full diff / edit**.
3. Apply on approval; track applied/skipped counts.
4. **Run the post-merge budget guard** (per `.claude/references/merge-strategy.md` § Post-merge budget guard). Hard-cap blockers must round-trip through `merge-configs/05-decompose.md` before the file is considered merged; no `.backup` deletion until the lint exits 0 or 1.

## Category-specific execution

- **CLAUDE.md** — branch by Step 3 decision:
  - **Decomposition triggered** → hand off to `merge-configs/05-decompose.md`. Do NOT splice; the decomposition routine produces the merged file.
  - **Splice path (file already lean, previousVersion ≥ 0.5)** → identify project sections in the backup (`## Tech Stack`, `## Knowledge Base`, `## Design Skill Preference`, `## QA Tools`, user-added sections not in framework template); splice into new template; write merged file.
- **Rules** — branch by Step 3 decision:
  - **Decomposition triggered** → hand off to `merge-configs/05-decompose.md`; the routine extracts overflow into references and writes the slim rule.
  - **Splice path** — three-way merge (user / framework / base where available):
    1. Compute the union of bullets under each user-side section header (`## Conventions`, `## Load-bearing rules`, `## Skill chain`, `## Critical checklist`, `## References`); dedupe by normalized text.
    2. Identify framework-edit-since-base bullets (changed/added in framework relative to base) — take the framework version. Identify user-edits-since-base bullets — preserve them. Conflicts (both sides changed the same bullet): prompt the user diff-style.
    3. Write the merged rule body.
    4. **Post-merge budget guard runs (Step 4 of this file).** If the merged rule exceeds its hard cap, route the longer side's surplus to `.claude/references/<domain>-detail.md` under `## User-merged: YYYY-MM-DD`; cite it with a pointer in `## References`. Never drop bullets — relocate them.
- **Commands** — compare backup to PREVIOUS framework version. Identical → silent discard. User-modified → show diff, prompt for keep/merge/drop.
- **References — `code-patterns.md`** — restore from backup verbatim.
- **References — other** — discard backup (framework templates).
- **Agents (architect/tester/mobile-tester)** — restore from backup verbatim.
- **KB content** — restore from backup verbatim.
- **Hooks** — diff old vs new; user-edited → prompt; unchanged → discard.
- **Settings (`.claude/settings.local.json`)** — **deep-merge with `cli/merge-settings.js`**:
  1. `node cli/merge-settings.js --dry-run --user .claude/settings.local.json.backup --framework .claude/settings.local.json`. Show resulting JSON to user as the merge plan.
  2. On approval, re-run with `--apply` (writes atomically: tmp file + rename).
  3. Fallback if the script is missing locally (pre-v0.6.2 install): `npx ai-development-framework merge-settings …` with the same flags.
  4. The "keep user / keep framework / manual edit" chooser is no longer used for hooks/permissions — it dropped one side or the other and broke setups in practice. Use the deep-merge.
  5. To skip the deep-merge (e.g., user wants to discard the framework's new hook entirely), hand-edit after merge runs — `--apply` is reversible from `.backup`.
  6. Settings is the only category exempt from the post-merge budget guard — `.json` files are not in scope for `cli/file-size-check.js`.
