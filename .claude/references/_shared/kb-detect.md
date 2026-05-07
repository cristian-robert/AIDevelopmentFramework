# KB Detection Snippet

Read this when a command needs to know whether the project's knowledge base is configured.

## Detection

1. Read project-root `CLAUDE.md`.
2. Look for a `## Knowledge Base` section with a `Path:` line.
3. Resolve `Path:` relative to the project root.

## Outcomes

- **No `## Knowledge Base` section** → KB is **off**. Skip every KB-related step in the calling command.
- **Section present, `Path:` set, directory exists** → KB is **on**. `<kb-path>` is the resolved path. Use it for `KB_PATH=<kb-path> node cli/kb-search.js …` invocations.
- **Section present, `Path:` set, directory missing** → blocker. Surface: "KB path `<path>` configured in CLAUDE.md but does not exist. Run `/start` (L0) to create it, or remove the `## Knowledge Base` section."
- **Default fallback** — if `Path:` is missing but the section exists, default to `.obsidian/`.

## Indexes (when rebuilding after writes)

```bash
KB_PATH=<kb-path> node cli/kb-search.js index
```

This rebuilds **both** `_search/index.json` (TF-IDF for `/kb-search`) and `_search/lean-index.json` (metadata view for `/prime`) atomically. Never call them separately for the standard rebuild — they must stay in lockstep.
