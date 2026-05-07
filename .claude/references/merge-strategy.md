# Config Merge Strategy

Canonical reference for merging project-specific configuration with framework files after an install, update, or manual framework upgrade. Consumed by `/merge-configs` and `/start` Step 0.

## File Categories

The strategy column gives the **default**. When `merge-configs/05-decompose.md`'s trigger conditions hold (pre-v0.5 user, or any user file over its `_shared/file-size-guard.md` budget), CLAUDE.md and Rules switch to decomposition instead of section-preserving merge.

| Category | Files | Strategy |
|----------|-------|----------|
| CLAUDE.md | Project root, plus legacy `.claude/CLAUDE.md` if present | Section-preserving merge (default) OR decomposition (when triggered) |
| Rules | `.claude/rules/*.md` | Append user additions + dedupe (default) OR decomposition (when triggered) |
| Commands | `.claude/commands/*.md` | Diff vs previous framework version; user-edited → prompt; unchanged → discard backup |
| References — project-specific | `.claude/references/code-patterns.md` | Always restore from backup |
| References — templates | `.claude/references/*.md` (other) | Keep framework version |
| Agents — project KB | `.claude/agents/architect-agent/**` | Always restore from backup |
| Agents — test patterns | `.claude/agents/tester-agent/**`, `mobile-tester-agent/**` | Always restore from backup |
| KB content | `<kb-path>/**` | Always restore from backup |
| Hooks | `.claude/hooks/*.sh` | User-edited → prompt; unchanged → discard |
| Settings | `.claude/settings.local.json` | **Deep-merge** via `cli/merge-settings.js` (shipped to consumer projects via `FRAMEWORK_CLI_FILES`; `npx ai-development-framework merge-settings` is the equivalent fallback). Hook arrays union by `(matcher, type, command)` tuple — user entries preserved, framework entries added if missing, exact duplicates deduped. `permissions.allow` / `deny` arrays union-sorted-deduped. Other top-level keys: user value wins on scalar conflicts. Run `--dry-run` first to show the plan, then `--apply` on approval. |

## Three sides of a merge

For each `.backup` file the merge has three logical inputs:

- **user** — content from `<file>.backup` (the pre-update state, what the user had).
- **framework** — content of `<file>` after `init`/`update` overwrote it (the new shipped version).
- **base** — the framework version that produced what the user was previously using. Reconstruct from `.claude/.init-meta.json#previousVersion` when needed (`git show v<previousVersion>:<path>` against this repo, or fall back to user-vs-framework two-way merge when unavailable).

The base lets the merger distinguish "user customised this" from "framework changed this since the user's previous install" — which decides whether a difference is a user edit to preserve or a framework edit to take.

## Process

For each `.backup` file found:
1. Categorize using the table above.
2. Compute merge plan for the category, three-way when base is available.
3. Present plan to user; await approval.
4. Apply merge.
5. **Run the post-merge budget guard (mandatory; see below).**
6. Delete `.backup` only after the budget guard exits clean.

## Post-merge budget guard

After every category-specific merge operation writes its result, the merger MUST run:

```bash
node cli/file-size-check.js --json
```

Decision matrix on the result:

| Lint outcome on the merged file | Action |
|---------------------------------|--------|
| `level=ok` | Continue — file is within budget. |
| `level=warn` (soft cap) | Continue. Surface as `size-warn=N` in the final one-liner. The next `/evolve` may extract; merge does not. |
| `level=block` (hard cap) | **Blocker.** Hand the file to `merge-configs/05-decompose.md` to split overflow into references. The decomposition routine MUST preserve both user and framework content — extraction relocates, never deletes. Re-lint after each round. |
| Decomposition cannot bring the file under hard cap after one pass | Stop. Surface to the user as a manual-resolution blocker; the merge does not finalize. Do NOT delete the `.backup` file in this state — the user needs it to re-attempt. |

This rule is the single source of truth that makes the v0.6 line-count budgets honest: budgets enforced on inputs but not outputs would let `/merge-configs` ship the very bloat the rules are designed to prevent.

### What "preserve both sides" means in practice

Bullet-level rule merges (`.claude/rules/*.md`):

- Take the union of user bullets and framework bullets (dedupe by normalized text).
- If the union under `## Conventions` / `## Load-bearing rules` exceeds the rule's per-section limit, move the LONGER side's surplus into `.claude/references/<domain>-detail.md` under a dated `## User-merged: YYYY-MM-DD` heading. Cite it with a one-line pointer in the rule's `## References`. Never silently drop bullets.

CLAUDE.md merges:

- Splice user-only sections into the framework template at the bottom under `## User Notes — <heading>`.
- If the spliced result exceeds budget, run the existing `05-decompose.md` walk on the merged file (not on the original user file). The walk finds the heaviest section and proposes a destination per its classification table.

Reference / agent / KB content:

- Always restored from backup verbatim (no merge), so they only hit the budget guard if the user's pre-update content was already over budget. In that case decomposition runs against the restored file, never against the framework's current shipped reference.

## Detection sources

- `.claude/.init-meta.json` — presence indicates post-init merge pending; `previousVersion` drives version-aware migration (see Cross-version migration below)
- User-invoked via `/merge-configs` — scans for any `.backup` files plus optionally a user-supplied directory
- Legacy `.claude/CLAUDE.md` — pre-v0.5 convention; treat as additional input for the CLAUDE.md merge

## Cross-version migration

`previousVersion` semantics (read from `.init-meta.json`):

| `previousVersion` | Behavior |
|-------------------|----------|
| Missing / `unknown` | Treat as pre-compression. Decompose CLAUDE.md and rules per `merge-configs/05-decompose.md`. |
| `<` `0.5` (semver) | Same as above — v0.4 and earlier shipped inline content that needs to be split into the slim-rule + references architecture. |
| `>=` `0.5` | Default to splice merge. Per-file size lint may still trigger decomposition for any single file that ballooned. |

Comparison rule: zero-pad missing fields (`0.4` is treated as `0.4.0`, `0.5` as `0.5.0`); compare numerically left to right.

## Notes on Settings

The `.claude/settings.local.json` deep-merge is implemented in `cli/merge-settings.js`. Since v0.6.2 the script is copied into consumer projects on `init`/`update` (alongside `kb-search.js`, `lean-index.js`, `file-size-check.js`), so `node cli/merge-settings.js …` works directly. The published binary `npx ai-development-framework merge-settings` runs the same script and exists as a fallback for older installs. Specifics:

- **Hooks**: union by `(matcher, type, command)` tuple. User's existing entries are preserved in their original order; framework entries are appended only if not already present. Same matcher with a different command means the user customised one and the framework added a separate hook on the same trigger — both run.
- **Permissions**: `allow` and `deny` arrays are union-sorted-deduped.
- **Other top-level keys** (e.g. `enableAllProjectMcpServers`): user value wins on scalar conflicts. Nested objects merge recursively with the same rule.

Always run with `--dry-run` first to surface the merge plan, then `--apply` on user approval. The script writes atomically (tmp file + rename), so a failed run cannot leave settings.local.json in a corrupt state.
