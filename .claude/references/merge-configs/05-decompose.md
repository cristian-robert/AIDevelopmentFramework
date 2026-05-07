# /merge-configs — Step 5 (decomposition): user content → framework architecture

The framework's architecture is **slim rules + on-demand references** (`.claude/references/_shared/file-size-guard.md`). When the user being merged came from a monolithic config — either a 600-line inline `CLAUDE.md` or v0.4 of this framework before compression — splicing sections preserves their content but defeats the architecture: the result is a framework skeleton with the user's bulk stuffed inside.

This step decomposes monolithic user content into the right destination files **without dropping anything**.

## When this step runs

Run decomposition for a discovered file IF either holds:

1. The file is over its budget per `cli/file-size-check.js` (run with `--json`, look at `level=block` or `level=warn` entries that target this file).
2. `.claude/.init-meta.json#previousVersion` is `unknown`, missing, or starts with `0.4` or earlier (semver compare; treat the SemVer-prefix string `0.4` as "below 0.5"). v0.4 predates compression — its CLAUDE.md and rules are inline by design.

If neither holds, fall back to the section-preserving merge documented in `.claude/references/merge-strategy.md`.

## The decomposition routine

For each in-scope user file (`CLAUDE.md`, `.claude/CLAUDE.md` if present, `.claude/rules/*.md`, `.claude/commands/*.md`):

### 1. Walk sections

Parse the file by `##` headings. For files without headings (rare for `commands/`, common for inline rules), treat each top-level bullet group as a section.

### 2. Classify each section

| Section signal | Destination |
|----------------|-------------|
| Headings: `Tech Stack`, `Knowledge Base`, `Design Skill Preference`, `QA Tools`, `Output Compaction` (state line only), or any other framework-template heading | Keep inline in `CLAUDE.md` (replace framework default with user value). |
| Heading or content matches a domain rule (`backend`, `frontend`, `mobile`, `database`, `security`, `testing`, `knowledge-base`) AND is short enough to fit the rule's budget after merge | Append to `.claude/rules/<domain>.md` `## Conventions` or `## Load-bearing rules`; dedupe against existing bullets. |
| Same domain but longer than 8 inline bullets / >25 lines of detail | Move to `.claude/references/<domain>-detail.md` (append, with a `## User-merged: <date>` divider). Add a one-line pointer in the rule's `## References` section. |
| Skill chain (numbered list of "do X then Y then Z") for a domain | Append to `.claude/references/<domain>-skill-chain.md` (or create it). The rule body's `## Skill chain (summary)` line gets a one-liner pointer. |
| Command definition (`## /name` or "Command: ...") | Move to `.claude/commands/<name>.md`; if a framework command of the same name exists, present a 3-way diff and prompt keep-user / keep-framework / merge. |
| Project-specific patterns (component examples, code snippets, "how we name things") | Append to `.claude/references/code-patterns.md`. |
| Workflow steps tied to a framework command (e.g., a custom validate phase) | Append to the matching `.claude/references/<command>/<step>.md`. |
| User-only section with no framework equivalent | Preserve at the bottom of `CLAUDE.md` under `## User Notes — <heading>`. Never silently drop. |

### 3. Build the migration plan

Produce a per-section table:

```
[section]  source-file:line-range  →  destination-file  (strategy: replace | append | reference-pointer)
```

Group rows by destination so the user can review one target at a time.

### 4. Per-section approval

For each row: show the source excerpt + proposed destination + the resulting one-line pointer that will replace it in the source. Prompt **apply / skip / edit / show full diff**.

- `apply` — write the destination, replace source content with the pointer (or remove section if it was duplicated).
- `skip` — leave source untouched, do not write destination.
- `edit` — open the proposed destination text for the user to refine before write.
- `show full diff` — render before/after of both files.

### 5. Verify budgets after each batch

After applying a batch (e.g., all `## Backend` sections), run:

```bash
npx ai-development-framework file-size-check --json
```

If the source file (typically `CLAUDE.md`) is still over budget, loop back to step 4 with the remaining sections highlighted. If a destination file went over its budget, the previous extraction was over-eager — propose a sub-extraction (further split into per-topic references) before continuing.

### 6. Final integrity pass

- Lint exit 0 or 1 → continue.
- Lint exit 2 → blocker; surface the file list and refuse to mark merge complete.
- All `[[wikilinks]]` and `.claude/references/...` paths in the rewritten files must resolve. Run `grep -nE '\.claude/references/[^ )]+\.md' <files> | xargs ... -f` style check; report broken refs to the user.

## Legacy `.claude/CLAUDE.md`

Pre-v0.5 projects sometimes had `.claude/CLAUDE.md` in addition to (or instead of) the root file. Handling:

1. If both exist: root `CLAUDE.md` is canonical. Append the unique sections of `.claude/CLAUDE.md` to the decomposition input list, then delete `.claude/CLAUDE.md` after the user approves.
2. If only `.claude/CLAUDE.md` exists: treat it as the input file but write the merged result to root `CLAUDE.md`. Delete the legacy file once the merge is committed.

Never auto-delete without an apply confirmation in step 4.

## When NOT to decompose

- The file is already under its soft cap → skip (section-preserving merge handles it).
- The user explicitly opts out (`/merge-configs --no-decompose`) → fall back to splice merge but emit a `[warn] decomposition skipped — context budgets may be exceeded` line in the final output.
- The user is on a non-LLM-managed config (e.g., they hand-author a tight CLAUDE.md and want it preserved verbatim) — detect by checking if all sections are short and well-named; the lint will already exempt them.
