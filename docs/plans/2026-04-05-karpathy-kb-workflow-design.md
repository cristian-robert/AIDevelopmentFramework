# Karpathy LLM Knowledge Base Workflow Integration

**Date:** 2026-04-05
**Status:** Approved
**Approach:** KB Command Suite (Approach A)
**Inspiration:** [Andrej Karpathy's LLM Knowledge Bases workflow](https://x.com/karpathy)

## Problem

The existing knowledge base is project-scoped and code-focused (features, architecture decisions). It doesn't support ingesting external sources (papers, articles, docs, repos), compiling them into a unified wiki, or querying across accumulated knowledge. The LLM has no "long-term memory" across sessions beyond what's in the codebase.

## Vision

The Obsidian KB becomes a lightweight RAG for the LLM — a unified knowledge graph where project knowledge and external research live together. The LLM ingests raw sources, compiles them into a wiki, auto-searches it during task work, and grows it from every coding session. Queries and explorations file back into the wiki, so knowledge compounds over time.

## Design Decisions

- **Unified wiki** — No separation between "project" and "external" knowledge. Everything is a wiki article with tags, backlinks, and sources. A feature note, a concept article, and a decision record are all just articles with different `type` tags.
- **Flat structure** — Wiki articles are flat files in `wiki/`, not nested in folders. Discoverability comes from tags, backlinks, and the master index.
- **Local CLI search** — Zero-dependency Node.js TF-IDF search tool. No vector DB, no embeddings. The LLM and user both call it the same way.
- **Commands, not agents** — KB operations are `/kb` commands (ingest, compile, search, ask) that fit the existing command-driven architecture.
- **Quick ingest + deep compile** — On ingest: quick summary stub. On compile: deep cross-linking, concept extraction, health checks.
- **Pipeline auto-integration** — `/prime` and `/execute` auto-search the KB. `/evolve` and `/ship` auto-write to it.

## Directory Structure

```
.obsidian/
├── raw/                         # ingested source material (inbox)
│   ├── _manifest.md             # index: source, date, status, tags
│   ├── articles/                # web articles, blog posts
│   ├── papers/                  # academic papers, whitepapers
│   ├── docs/                    # library/framework documentation
│   ├── repos/                   # README + key files from repositories
│   └── sessions/                # auto-captured from coding sessions
│
├── wiki/                        # THE knowledge base — everything lives here
│   ├── _index.md                # master index: all articles with one-line summaries
│   ├── _tags.md                 # tag registry with article counts
│   └── *.md                     # flat collection of articles
│
└── _search/
    ├── kb-search.js             # search CLI tool
    ├── index.json               # search index (auto-generated)
    └── stats.md                 # KB health metrics
```

### Migration from Current Structure

Existing KB content migrates into `wiki/` as articles:
- `overview.md` → `wiki/project-overview.md` (type: `reference`)
- `features/*.md` → `wiki/<feature-name>.md` (type: `feature`)
- `decisions/*.md` → `wiki/<decision-name>.md` (type: `decision`)
- `architecture/*.md` → `wiki/<topic>.md` (type: `concept`)
- `config/*.md` → `wiki/<config-topic>.md` (type: `reference`)
- `research/*.md` → `wiki/<research-topic>.md` (type: `guide` or `concept`)

## Article Format

Every wiki article follows this format:

```markdown
---
title: OAuth2 Patterns for SPAs
type: concept
tags: [auth, security, oauth2, spa]
sources:
  - raw/articles/oauth2-best-practices.md
  - raw/docs/auth0-spa-guide.md
related:
  - auth-system-feature.md
  - adr-001-chose-auth0.md
created: 2026-04-05
updated: 2026-04-05
status: compiled
---

# OAuth2 Patterns for SPAs

Brief summary — what this article covers and why it matters.

## Content

Main body. Written and maintained by the LLM.

## Key Takeaways

- Most important insights as bullet points
- Pulled into `_index.md` summaries

## See Also

- [[auth-system-feature]] — How our project implements auth
- [[adr-001-chose-auth0]] — Why we chose Auth0
```

### Frontmatter Fields

| Field | Required | Values |
|-------|----------|--------|
| `title` | Yes | Human-readable title |
| `type` | Yes | `concept`, `feature`, `decision`, `guide`, `comparison`, `reference`, `session-learning` |
| `tags` | Yes | Lowercase, hyphenated array |
| `sources` | No | Paths to `raw/` files this was compiled from |
| `related` | No | Filenames of related wiki articles (backlinks) |
| `created` | Yes | ISO date |
| `updated` | Yes | ISO date |
| `status` | Yes | `stub`, `compiled`, `reviewed` |

## Command Suite

### `/kb ingest <source>`

**Input:** URL, file path, directory, or "session"

**Process:**
1. Detect source type (URL → fetch & convert to markdown via Firecrawl, PDF → extract text, repo → pull README + key files, session → extract decisions/patterns/learnings from conversation)
2. Save to appropriate `raw/` subfolder: `YYYY-MM-DD-slugified-title.md`
3. Add entry to `raw/_manifest.md` (source, date, type, status: `pending`)
4. Generate stub wiki article — title, tags, one-paragraph summary, status: `stub`
5. Update `wiki/_index.md` and `wiki/_tags.md`
6. Incremental search index update

### `/kb compile`

**Input:** Optional scope — a tag, article name, or "all"

**Process:**
1. Scan `raw/_manifest.md` for `pending` or `updated` sources
2. Read full raw content for each unprocessed source
3. Find related existing wiki articles (via tags, title similarity, backlinks)
4. Expand stubs, create new articles, add cross-links, extract concepts, write comparisons
5. Update backlinks bidirectionally
6. Run health check pass (see Health Checks section)
7. Rebuild `wiki/_index.md`, `wiki/_tags.md`
8. Full search index rebuild
9. Update `raw/_manifest.md` statuses to `compiled`
10. Report: new articles, updated articles, health issues found

### `/kb search <query>`

**Input:** Search query string

**Process:**
1. Run CLI search tool: `node .obsidian/_search/kb-search.js search "<query>"`
2. Returns ranked results: title, score, excerpt, tags, related articles
3. LLM reads top results if deeper context needed

Also used internally by `/prime` and `/execute` for auto-loading.

### `/kb ask <question>`

**Input:** A question about the knowledge base

**Process:**
1. Run `/kb search` with the question
2. Read top relevant articles in full
3. Synthesize answer as a new wiki article (tagged `guide` or `reference`)
4. Link to source articles with backlinks
5. Display answer to user
6. Answer is now part of the wiki — future queries benefit

## Pipeline Integration

### Reading KB (auto-search)

**`/prime`:**
1. Read `wiki/_index.md` for full KB overview
2. Run `/kb search` with current task keywords
3. Load top 3-5 matching articles into context
4. Report: "Loaded KB context: [article names]"

**`/execute`:**
1. Before each plan task, extract keywords from task description
2. Run `/kb search` for relevant articles
3. Load matches alongside the plan step
4. Flag reusable insights for `/evolve`

### Writing KB (auto-capture)

**`/evolve`:**
1. Review session: decisions, patterns, bugs solved, trade-offs
2. Run `/kb ingest session` for each significant learning
3. Auto-generate stub wiki articles
4. Suggest `/kb compile` if stubs accumulated

**`/ship`:**
1. Update relevant wiki articles with implementation details
2. Create `decision` articles for architectural choices
3. Update `_index.md`

**`/create-prd`:**
1. Create wiki articles for key PRD concepts (tagged `feature`, `concept`)
2. Link to PRD document

**`/start` (L0):**
1. Create full `.obsidian/` structure including `raw/`, `wiki/`, `_search/`
2. Create initial `_index.md` and `_tags.md`
3. Prompt: "Do you have sources to ingest? Run `/kb ingest <source>`"

## Search Tool

### Location

`cli/kb-search.js` (ships with framework, copied to `.obsidian/_search/kb-search.js` on init)

### Interface

```bash
# Rebuild index
node .obsidian/_search/kb-search.js index

# Search
node .obsidian/_search/kb-search.js search "oauth2 token refresh"

# Search with filters
node .obsidian/_search/kb-search.js search "auth" --type=decision --tag=security

# Stats
node .obsidian/_search/kb-search.js stats
```

### Output Format

```json
{
  "query": "oauth2 token refresh",
  "results": [
    {
      "file": "wiki/oauth2-patterns.md",
      "title": "OAuth2 Patterns for SPAs",
      "score": 0.87,
      "type": "concept",
      "tags": ["auth", "oauth2", "spa"],
      "excerpt": "...token refresh should use rotating refresh tokens...",
      "related": ["auth-system-feature.md"]
    }
  ],
  "total": 12
}
```

### Implementation

- Zero external dependencies — pure Node.js (`fs` only)
- Frontmatter parsing via simple regex
- TF-IDF scoring (~100 lines)
- Title and tag matches boosted over body text
- Auto-rebuild when index is stale (checks file mtime vs index timestamp)

### Index Rebuild Triggers

- After `/kb ingest` — incremental (new article only)
- After `/kb compile` — full rebuild
- Before `/kb search` — auto-rebuild if stale

## Health Checks

Built into every `/kb compile` run. Output written to `_search/stats.md`.

### Structural Issues

- Orphaned articles (no backlinks from any other article)
- Broken wikilinks (references to non-existent articles)
- Stubs uncompiled for 7+ days
- Articles with incomplete frontmatter

### Content Issues

- Duplicate/overlapping articles on the same concept
- Inconsistent information across articles
- Outdated sources (raw updated but wiki not recompiled)
- Articles missing "Key Takeaways" section

### Suggestions

- Merge candidates (overlapping articles)
- Missing concepts (referenced but no dedicated article)
- Stale articles (not updated in 30+ days, sources changed)

## Rule File

New auto-loading rule at `.claude/rules/knowledge-base.md`:

**Globs:** `.obsidian/**/*.md`

**Conventions:**
- Never edit `raw/` files — source-of-truth snapshots
- Wiki articles are LLM-maintained — user rarely touches directly
- Every article has complete frontmatter
- Wikilinks: `[[filename-without-extension]]`
- Tags: lowercase, hyphenated
- Filenames: slugified titles

**Checklist:**
- Frontmatter complete
- Backlinks updated bidirectionally
- `_index.md` reflects changes
- `_tags.md` reflects new tags
- No broken wikilinks introduced

## What This Replaces

The existing KB structure (`overview.md`, `features/`, `decisions/`, `architecture/`, `config/`, `research/`) migrates entirely into the flat `wiki/` model. Existing pipeline commands that reference those paths get updated to use `/kb search` instead. The `## Knowledge Base` section in CLAUDE.md still configures the root path.

## What This Does NOT Include

- Embeddings or vector search — may add later if TF-IDF proves insufficient at scale
- Obsidian plugin development — we use Obsidian as a viewer, not extend it
- Synthetic data generation or fine-tuning — future exploration per Karpathy
- Multi-project KB sharing — each project has its own KB
