# /kb-ingest — Phase 2: Detect Source Type + Fetch

## Source classification

| Condition | Source Type |
|-----------|-------------|
| Starts with `http://` or `https://` | URL |
| Literal string `session` | Session |
| Path ends `.md`/`.txt`/`.pdf`/`.rst`/`.html` | Local file |
| Path is a directory | Directory |

## Fetching

- **URL** → Firecrawl MCP `scrape` with `formats: ["markdown"]`. Fall back to WebFetch. Strip nav/footers/ads.
- **Local file** → Read tool.
- **Directory** → Read each file (non-recursive unless `--recursive`). Concatenate with `---` separators + file path headers.
- **Session** → extract from current conversation: decisions, patterns, bugs fixed, conventions, tools/libs, key takeaways. Format as structured markdown.

## Category detection (URLs and files only)

Scan title + first 500 chars:
- `arxiv` / `doi` / `abstract` / `proceedings` / `journal` → `papers/`
- `docs.*` / `developer.*` / `api.*` / `reference.*` domains → `docs/`
- `github.com` / `gitlab.com` → `repos/`
- Default → `articles/`

## Web Clipper preferred path (for articles)

The [Obsidian Web Clipper](https://obsidian.md/clipper) extension saves pages as `.md` directly into `<kb-path>/raw/articles/` with sane frontmatter. Configure a hotkey to download inline images to `<kb-path>/raw/articles/_assets/<slug>/` for link-rot survival. After clipping, `/kb-ingest <path-to-clipped-file>` skips re-fetching and just creates the manifest entry + stub.
