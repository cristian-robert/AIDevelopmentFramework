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
| Settings | `.claude/settings.local.json` | **Deep-merge** via `npx ai-development-framework merge-settings` (script source is `cli/merge-settings.js` in the framework repo; only the binary is available in consumer projects). Hook arrays union by `(matcher, type, command)` tuple — user entries preserved, framework entries added if missing, exact duplicates deduped. `permissions.allow` / `deny` arrays union-sorted-deduped. Other top-level keys: user value wins on scalar conflicts. Run `--dry-run` first to show the plan, then `--apply` on approval. |

## Process

For each `.backup` file found:
1. Categorize using the table above
2. Compute merge plan for the category
3. Present plan to user; await approval
4. Apply merge
5. Delete `.backup`

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

The `.claude/settings.local.json` deep-merge is implemented in `cli/merge-settings.js` (framework repo only) and exposed to consumer projects via `npx ai-development-framework merge-settings`. Specifics:

- **Hooks**: union by `(matcher, type, command)` tuple. User's existing entries are preserved in their original order; framework entries are appended only if not already present. Same matcher with a different command means the user customised one and the framework added a separate hook on the same trigger — both run.
- **Permissions**: `allow` and `deny` arrays are union-sorted-deduped.
- **Other top-level keys** (e.g. `enableAllProjectMcpServers`): user value wins on scalar conflicts. Nested objects merge recursively with the same rule.

Always run with `--dry-run` first to surface the merge plan, then `--apply` on user approval. The script writes atomically (tmp file + rename), so a failed run cannot leave settings.local.json in a corrupt state.
