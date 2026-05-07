# /merge-configs — Merge Existing Config with Framework

Usable any time: post-init, after manual framework upgrade, after repo merge, or when adopting the framework mid-project.

**Args:** `$ARGUMENTS` = optional path to a user config directory (defaults to scanning current repo for `.backup` files and `.claude/.init-meta.json`).

**Output:** one line per `_shared/output-contract.md`.

## Steps

| # | Step | Reference / inline |
|---|------|-------------------|
| 1 | Discover (init marker, .backup files, optional `$ARGUMENTS` path) | inline |
| 2 | Categorize (per `.claude/references/merge-strategy.md`) | inline |
| 3 | Detect version + decide decomposition need | inline |
| 4 | Plan (per-file table grouped by category, plus decomposition rows) | inline |
| 5 | Execute (per-file approval + category-specific logic) | `merge-configs/04-execute.md` |
| 5.5 | Decompose monolithic user content into framework architecture (when triggered by Step 3) | `merge-configs/05-decompose.md` |
| 6 | Cleanup (delete `.backup` files + `.init-meta.json`) | inline |
| 7 | Output | inline |

## Step 1 — Discover (inline)

1. Check `.claude/.init-meta.json`. If present → read it for backed-up files + `previousVersion` + `newVersion`.
2. `find . -name "*.backup" -not -path "./node_modules/*" -not -path "./.git/*"`.
3. Check for legacy `.claude/CLAUDE.md` (pre-v0.5 convention). If found → add to discovery list.
4. If `$ARGUMENTS` provided → scan that directory for `CLAUDE.md`, `.claude/**`, configured KB path. Treat as "user" side; current repo copies as "framework" side.

If nothing found → exit one-liner: `No config to merge · Next: /prime`.

## Step 2 — Categorize (inline)

Load `.claude/references/merge-strategy.md`. Assign each discovered file to a category from its table.

## Step 3 — Detect version + decide decomposition need (inline)

Trigger conditions for decomposition (per `merge-configs/05-decompose.md`):

- `previousVersion` is missing, `unknown`, or compares below `0.5` (semver) → all in-scope user files go through decomposition.
- `previousVersion >= 0.5` but `node cli/file-size-check.js --json` flags any user file as `level=warn` or `level=block` → decompose those files only.
- `--no-decompose` flag passed → skip; emit `[warn] decomposition skipped` in final output.

Record the decision per file. Pass it to Step 4 / 5.5.

## Step 4 — Plan (inline)

Per-file table grouped by category. Each entry: file path · category + strategy · short diff preview for merge-requiring cases.

For files marked for decomposition, append a per-section table from `merge-configs/05-decompose.md` step 3.

## Step 6 — Cleanup (inline)

- Delete all `.backup` files processed.
- Delete `.claude/.init-meta.json` if present.
- Delete legacy `.claude/CLAUDE.md` if its content was merged into root `CLAUDE.md` and the user approved deletion in Step 5.

## Output (one line)

```
Merged: <N merged> · <N restored> · <N skipped> · decomposed=<D> · size-warn=<W> · Next: /prime
```

Omit `decomposed=` and `size-warn=` segments when zero. Per-file approval prompts in Steps 4 and 5.5 are blockers, not output. If post-merge `cli/file-size-check.js` returns exit 2, the merge does not produce a one-liner — it stops with the violating files listed.

## Delegation

`/start` Step 0 delegates here when `.claude/.init-meta.json` is found. No merge logic is duplicated — `.claude/references/merge-strategy.md` is the single source of truth.
