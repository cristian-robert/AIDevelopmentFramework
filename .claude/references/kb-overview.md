# Knowledge Base Overview

Unified LLM knowledge base inspired by [Karpathy's LLM Knowledge Bases](https://x.com/karpathy) workflow. External research and project knowledge live together as a flat wiki. The LLM ingests raw sources, compiles them into wiki articles, auto-searches during task work, and grows the wiki from every coding session.

## Configuration

Add `## Knowledge Base` with `Path: <path>` to your project's CLAUDE.md. Default: `.obsidian/`. Remove the section to disable.

## Structure

```
<path>/
├── raw/                 # Ingested source material (articles, papers, docs, repos, session learnings)
│   └── _manifest.md     # Index of all raw sources with status
├── wiki/                # Unified wiki — ALL knowledge as flat .md files with frontmatter
│   ├── _index.md        # Master index grouped by type
│   └── _tags.md         # Tag registry with article counts
└── _search/
    ├── index.json       # TF-IDF search index (auto-generated)
    ├── lean-index.json  # Metadata-only view (auto-generated)
    └── stats.md         # KB health metrics
```

## KB Commands

- `/kb-ingest <source>` — ingest URL, file, repo, or session learnings into raw/ + create wiki stub
- `/kb-compile` — deep compilation: expand stubs, cross-link, extract concepts, health check
- `/kb-search <query>` — TF-IDF search across wiki
- `/kb-ask <question>` — Q&A against wiki, answer filed back as new article

## When pipeline commands read it

- `/prime` — reads lean wiki index + auto-searches for task-relevant articles
- `/execute` — searches wiki before each task for relevant context

## When pipeline commands write it

- `/start` (L0) — creates KB structure + initial wiki articles
- `/create-prd` — seeds wiki with project overview, architecture, feature articles
- `/plan-project` — creates/updates feature articles alongside GitHub issues
- `/ship` — updates feature articles with implementation details, creates decision articles
- `/evolve` — captures session learnings as raw + stub wiki articles

## Detection at command runtime

See `.claude/references/_shared/kb-detect.md` for the canonical detection logic and index-rebuild command.
