# Config Merge Strategy

Canonical reference for merging project-specific configuration with framework files after an install, update, or manual framework upgrade. Consumed by `/merge-configs` and `/start` Step 0.

## File Categories

| Category | Files | Strategy |
|----------|-------|----------|
| CLAUDE.md | Project root | Section-preserving merge (preserve user sections, update framework sections) |
| Rules | `.claude/rules/*.md` | Append user additions; dedupe |
| Commands | `.claude/commands/*.md` | Diff vs previous framework version; user-edited → prompt; unchanged → discard backup |
| References — project-specific | `.claude/references/code-patterns.md` | Always restore from backup |
| References — templates | `.claude/references/*.md` (other) | Keep framework version |
| Agents — project KB | `.claude/agents/architect-agent/**` | Always restore from backup |
| Agents — test patterns | `.claude/agents/tester-agent/**`, `mobile-tester-agent/**` | Always restore from backup |
| KB content | `<kb-path>/**` | Always restore from backup |
| Hooks | `.claude/hooks/*.sh` | User-edited → prompt; unchanged → discard |
| Settings | `.claude/settings.local.json` | **Conservative: present JSON diff and ask "keep user / keep framework / manual edit". Do NOT auto deep-merge** — array order matters (especially for hooks) and silent merges risk breaking behavior. User chooses explicitly. |

## Process

For each `.backup` file found:
1. Categorize using the table above
2. Compute merge plan for the category
3. Present plan to user; await approval
4. Apply merge
5. Delete `.backup`

## Detection sources

- `.claude/.init-meta.json` — presence indicates post-init merge pending
- User-invoked via `/merge-configs` — scans for any `.backup` files plus optionally a user-supplied directory

## Notes on Settings

The `.claude/settings.local.json` row deserves special care. Automatic deep-merge is tempting but unsafe:

- Hook arrays have ordering semantics (the first matching hook runs first)
- Permission arrays can conflict in subtle ways (allow vs deny precedence)
- Env var overrides may clobber framework defaults unexpectedly

Prefer a visible three-way choice: **keep user**, **keep framework**, or **manual edit**. If the user chooses manual edit, open both files side-by-side for them.
