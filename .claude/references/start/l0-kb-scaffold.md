# /start L0 — KB Scaffold + Initial Routing

For a fresh project, after invoking `superpowers:brainstorming`:

## If KB is configured (per `_shared/kb-detect.md`)

Create the unified KB structure:

- `<kb-path>/raw/_manifest.md` (empty manifest table)
- `<kb-path>/raw/articles/`, `raw/papers/`, `raw/docs/`, `raw/repos/`, `raw/sessions/`
- `<kb-path>/wiki/_index.md` (empty index)
- `<kb-path>/wiki/_tags.md` (empty tag registry)
- `<kb-path>/_search/` (search infrastructure directory)

Then create initial wiki articles using `.claude/references/kb-article-template.md`:

- `wiki/project-overview.md` from brainstorming results (type: `reference`)
- `wiki/<feature-name>.md` for each agreed functionality (type: `feature`)

Ask: "Do you have research sources to ingest? Run `/kb-ingest <source>` for each."

## Continue the L0 chain

3. `/create-prd` (generates PRD from brainstorming, seeds KB if configured)
4. `/plan-project` (creates GitHub issues, links them to feature notes)
5. **STOP** — present the issue list and ask: "Which issue do you want to work on first?"
