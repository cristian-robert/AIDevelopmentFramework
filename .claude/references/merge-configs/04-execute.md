# /merge-configs — Step 4: Execute (per-file approval)

For each file in the plan:

1. Show the file + strategy.
2. Ask: **apply / skip / show full diff / edit**.
3. Apply on approval; track applied/skipped counts.

## Category-specific execution

- **CLAUDE.md** — branch by Step 3 decision:
  - **Decomposition triggered** → hand off to `merge-configs/05-decompose.md`. Do NOT splice; the decomposition routine produces the merged file.
  - **Splice path (file already lean, previousVersion ≥ 0.5)** → identify project sections in the backup (`## Tech Stack`, `## Knowledge Base`, `## Design Skill Preference`, `## QA Tools`, user-added sections not in framework template); splice into new template; write merged file.
- **Rules** — branch by Step 3 decision:
  - **Decomposition triggered** → hand off to `merge-configs/05-decompose.md`; the routine extracts overflow into references and writes the slim rule.
  - **Splice path** → diff old vs new; extract user-added conventions, checklist items, skill-chain lines; append to new file; dedupe.
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
  3. The "keep user / keep framework / manual edit" chooser is no longer used for hooks/permissions — it dropped one side or the other and broke setups in practice. Use the deep-merge.
  4. To skip the deep-merge (e.g., user wants to discard the framework's new hook entirely), hand-edit after merge runs — `--apply` is reversible from `.backup`.
