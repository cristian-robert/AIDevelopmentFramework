# Karpathy LLM Knowledge Base Workflow — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the Obsidian KB into a unified, LLM-searchable wiki with raw source ingestion, compilation, search CLI, and automatic pipeline integration — following Andrej Karpathy's LLM Knowledge Base workflow.

**Architecture:** Four new `/kb` commands (ingest, compile, search, ask) backed by a zero-dependency Node.js TF-IDF search tool. The existing folder-based KB (features/, decisions/, architecture/) migrates to a flat `wiki/` model. Pipeline commands (`/prime`, `/execute`, `/ship`, `/evolve`) get updated to auto-search and auto-write the wiki.

**Tech Stack:** Node.js (search CLI), Claude Code commands (markdown specs), Obsidian (viewer), Firecrawl MCP (URL ingestion)

---

## File Structure

**New files to create:**
- `cli/kb-search.js` — TF-IDF search CLI tool (~200 lines)
- `.claude/commands/kb-ingest.md` — Ingest command spec
- `.claude/commands/kb-compile.md` — Compile command spec
- `.claude/commands/kb-search.md` — Search command spec
- `.claude/commands/kb-ask.md` — Ask/Q&A command spec
- `.claude/rules/knowledge-base.md` — Auto-loading KB rule
- `.claude/references/kb-article-template.md` — Wiki article template with frontmatter

**Existing files to modify:**
- `.claude/commands/start.md` — Update L0 KB scaffolding to new structure
- `.claude/commands/prime.md` — Replace folder-based KB loading with wiki search
- `.claude/commands/execute.md` — Replace folder-based KB loading with wiki search
- `.claude/commands/ship.md` — Update KB writes to wiki format
- `.claude/commands/evolve.md` — Add session learning ingestion
- `.claude/commands/create-prd.md` — Update KB seeding to wiki format
- `.claude/commands/plan-project.md` — Update feature note creation to wiki format
- `.claude/references/knowledge-base-templates.md` — Replace folder-based templates with wiki article templates
- `CLAUDE.md` — Update Knowledge Base section with new structure
- `.gitignore` — Add `_search/index.json` to gitignore
- `cli/protected-files.js` — Add wiki index files to protected list

---

### Task 1: Search CLI Tool

**Files:**
- Create: `cli/kb-search.js`
- Create: `cli/kb-search.test.js`

- [ ] **Step 1: Write the test file**

```javascript
// cli/kb-search.test.js
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const SEARCH_CLI = path.join(__dirname, 'kb-search.js');
const TEST_DIR = path.join(require('os').tmpdir(), 'kb-search-test-' + Date.now());
const WIKI_DIR = path.join(TEST_DIR, 'wiki');
const SEARCH_DIR = path.join(TEST_DIR, '_search');

function run(args) {
  return execFileSync('node', [SEARCH_CLI, ...args], {
    env: { ...process.env, KB_PATH: TEST_DIR },
    encoding: 'utf-8',
  });
}

function setup() {
  fs.mkdirSync(WIKI_DIR, { recursive: true });
  fs.mkdirSync(SEARCH_DIR, { recursive: true });

  fs.writeFileSync(path.join(WIKI_DIR, 'oauth2-patterns.md'), [
    '---',
    'title: OAuth2 Patterns for SPAs',
    'type: concept',
    'tags: [auth, security, oauth2, spa]',
    'sources:',
    '  - raw/articles/oauth2-best-practices.md',
    'related:',
    '  - auth-system-feature.md',
    'created: 2026-04-05',
    'updated: 2026-04-05',
    'status: compiled',
    '---',
    '',
    '# OAuth2 Patterns for SPAs',
    '',
    'Token refresh should use rotating refresh tokens for security.',
    '',
    '## Key Takeaways',
    '',
    '- Use rotating refresh tokens',
    '- Never store tokens in localStorage',
  ].join('\n'));

  fs.writeFileSync(path.join(WIKI_DIR, 'auth-system-feature.md'), [
    '---',
    'title: Authentication System',
    'type: feature',
    'tags: [auth, feature]',
    'related:',
    '  - oauth2-patterns.md',
    'created: 2026-04-05',
    'updated: 2026-04-05',
    'status: compiled',
    '---',
    '',
    '# Authentication System',
    '',
    'Our project uses Auth0 for authentication with PKCE flow.',
    '',
    '## Key Takeaways',
    '',
    '- Auth0 with PKCE flow',
    '- Session stored in httpOnly cookies',
  ].join('\n'));

  fs.writeFileSync(path.join(WIKI_DIR, 'database-design.md'), [
    '---',
    'title: Database Design Decisions',
    'type: decision',
    'tags: [database, postgres, architecture]',
    'created: 2026-04-05',
    'updated: 2026-04-05',
    'status: compiled',
    '---',
    '',
    '# Database Design Decisions',
    '',
    'We chose PostgreSQL with Supabase for the database layer.',
    '',
    '## Key Takeaways',
    '',
    '- PostgreSQL via Supabase',
    '- Row Level Security for multi-tenancy',
  ].join('\n'));

  fs.writeFileSync(path.join(WIKI_DIR, '_index.md'), '# Wiki Index\n');
  fs.writeFileSync(path.join(WIKI_DIR, '_tags.md'), '# Tags\n');
}

function cleanup() {
  fs.rmSync(TEST_DIR, { recursive: true, force: true });
}

function runTests() {
  var passed = 0;
  var failed = 0;

  function assert(name, condition) {
    if (condition) {
      console.log('  PASS: ' + name);
      passed++;
    } else {
      console.log('  FAIL: ' + name);
      failed++;
    }
  }

  setup();

  // Test: index command
  console.log('index command:');
  var indexOutput = run(['index']);
  assert('index command runs', indexOutput.includes('Indexed'));
  assert('index.json created', fs.existsSync(path.join(SEARCH_DIR, 'index.json')));
  var index = JSON.parse(fs.readFileSync(path.join(SEARCH_DIR, 'index.json'), 'utf-8'));
  assert('index has 3 articles (excludes _index.md and _tags.md)', index.documents.length === 3);

  // Test: search command
  console.log('search command:');
  var searchOutput = run(['search', 'oauth2 token refresh']);
  var results = JSON.parse(searchOutput);
  assert('search returns results', results.results.length > 0);
  assert('top result is oauth2-patterns', results.results[0].file.includes('oauth2-patterns'));
  assert('result has score', typeof results.results[0].score === 'number');
  assert('result has title', results.results[0].title === 'OAuth2 Patterns for SPAs');
  assert('result has tags', Array.isArray(results.results[0].tags));
  assert('result has excerpt', typeof results.results[0].excerpt === 'string');

  // Test: search with type filter
  console.log('search with filters:');
  var filteredOutput = run(['search', 'auth', '--type=feature']);
  var filteredResults = JSON.parse(filteredOutput);
  assert('type filter returns results', filteredResults.results.length > 0);
  assert('all results are type feature', filteredResults.results.every(function(r) { return r.type === 'feature'; }));

  // Test: search with tag filter
  var tagOutput = run(['search', 'design', '--tag=database']);
  var tagResults = JSON.parse(tagOutput);
  assert('tag filter returns results', tagResults.results.length > 0);
  assert('all results have database tag', tagResults.results.every(function(r) { return r.tags.includes('database'); }));

  // Test: stats command
  console.log('stats command:');
  var statsOutput = run(['stats']);
  assert('stats includes total', statsOutput.includes('Total articles:'));
  assert('stats includes types', statsOutput.includes('concept:'));

  // Test: no results
  console.log('edge cases:');
  var emptyOutput = run(['search', 'xyznonexistent123']);
  var emptyResults = JSON.parse(emptyOutput);
  assert('no results for gibberish query', emptyResults.results.length === 0);

  cleanup();

  console.log('\n' + passed + ' passed, ' + failed + ' failed');
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node cli/kb-search.test.js`
Expected: FAIL — `Cannot find module './kb-search.js'` or similar

- [ ] **Step 3: Implement the search CLI tool**

```javascript
// cli/kb-search.js
//
// Zero-dependency TF-IDF search over Obsidian wiki markdown files.
// Used by the LLM (via Bash tool) and by users directly.
//
// Usage:
//   KB_PATH=.obsidian node cli/kb-search.js index
//   KB_PATH=.obsidian node cli/kb-search.js search "query" [--type=X] [--tag=X]
//   KB_PATH=.obsidian node cli/kb-search.js stats

var fs = require('fs');
var path = require('path');

var KB_PATH = process.env.KB_PATH || '.obsidian';
var WIKI_DIR = path.join(KB_PATH, 'wiki');
var INDEX_PATH = path.join(KB_PATH, '_search', 'index.json');

// --- Frontmatter parser ---

function parseFrontmatter(content) {
  var match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return { meta: {}, body: content };

  var meta = {};
  var lines = match[1].split('\n');
  var currentKey = null;
  var currentArray = null;

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    var kvMatch = line.match(/^(\w[\w-]*):\s*(.*)$/);
    if (kvMatch) {
      currentKey = kvMatch[1];
      var value = kvMatch[2].trim();
      if (value.startsWith('[') && value.endsWith(']')) {
        // Inline array: [a, b, c]
        meta[currentKey] = value.slice(1, -1).split(',').map(function(s) { return s.trim(); }).filter(Boolean);
        currentArray = null;
      } else if (value === '') {
        // Might be a multi-line array
        currentArray = currentKey;
        meta[currentKey] = [];
      } else {
        meta[currentKey] = value;
        currentArray = null;
      }
    } else if (currentArray && line.match(/^\s+-\s+(.+)/)) {
      meta[currentArray].push(line.match(/^\s+-\s+(.+)/)[1].trim());
    }
  }

  var body = content.slice(match[0].length).trim();
  return { meta: meta, body: body };
}

// --- TF-IDF ---

function tokenize(text) {
  return text.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(function(t) { return t.length > 1; });
}

function termFrequency(tokens) {
  var tf = {};
  for (var i = 0; i < tokens.length; i++) {
    tf[tokens[i]] = (tf[tokens[i]] || 0) + 1;
  }
  // Normalize by document length
  var len = tokens.length || 1;
  for (var term in tf) {
    tf[term] = tf[term] / len;
  }
  return tf;
}

function buildIndex() {
  if (!fs.existsSync(WIKI_DIR)) {
    console.error('Wiki directory not found: ' + WIKI_DIR);
    process.exit(1);
  }

  var files = fs.readdirSync(WIKI_DIR).filter(function(f) {
    return f.endsWith('.md') && !f.startsWith('_');
  });

  var documents = [];
  var df = {}; // document frequency

  for (var i = 0; i < files.length; i++) {
    var filePath = path.join(WIKI_DIR, files[i]);
    var content = fs.readFileSync(filePath, 'utf-8');
    var parsed = parseFrontmatter(content);

    var titleTokens = tokenize(parsed.meta.title || '');
    var tagTokens = (parsed.meta.tags || []).map(function(t) { return t.toLowerCase(); });
    var bodyTokens = tokenize(parsed.body);

    // Boost: title tokens count 3x, tag tokens count 2x
    var allTokens = [];
    for (var t = 0; t < titleTokens.length; t++) {
      allTokens.push(titleTokens[t]);
      allTokens.push(titleTokens[t]);
      allTokens.push(titleTokens[t]);
    }
    for (var g = 0; g < tagTokens.length; g++) {
      allTokens.push(tagTokens[g]);
      allTokens.push(tagTokens[g]);
    }
    allTokens = allTokens.concat(bodyTokens);

    var tf = termFrequency(allTokens);

    // Track document frequency
    var seen = {};
    for (var term in tf) {
      if (!seen[term]) {
        df[term] = (df[term] || 0) + 1;
        seen[term] = true;
      }
    }

    documents.push({
      file: files[i],
      title: parsed.meta.title || files[i].replace('.md', ''),
      type: parsed.meta.type || 'unknown',
      tags: parsed.meta.tags || [],
      related: parsed.meta.related || [],
      status: parsed.meta.status || 'unknown',
      tf: tf,
      bodyPreview: parsed.body.substring(0, 500),
    });
  }

  var indexData = {
    documents: documents,
    df: df,
    totalDocs: documents.length,
    built: new Date().toISOString(),
  };

  var searchDir = path.dirname(INDEX_PATH);
  if (!fs.existsSync(searchDir)) {
    fs.mkdirSync(searchDir, { recursive: true });
  }
  fs.writeFileSync(INDEX_PATH, JSON.stringify(indexData, null, 2));
  return indexData;
}

function loadOrBuildIndex() {
  // Auto-rebuild if stale
  if (fs.existsSync(INDEX_PATH) && fs.existsSync(WIKI_DIR)) {
    var indexMtime = fs.statSync(INDEX_PATH).mtimeMs;
    var wikiFiles = fs.readdirSync(WIKI_DIR).filter(function(f) {
      return f.endsWith('.md') && !f.startsWith('_');
    });
    var needsRebuild = false;
    for (var i = 0; i < wikiFiles.length; i++) {
      if (fs.statSync(path.join(WIKI_DIR, wikiFiles[i])).mtimeMs > indexMtime) {
        needsRebuild = true;
        break;
      }
    }
    if (!needsRebuild) {
      return JSON.parse(fs.readFileSync(INDEX_PATH, 'utf-8'));
    }
  }
  return buildIndex();
}

function search(query, filters) {
  var index = loadOrBuildIndex();
  var queryTokens = tokenize(query);
  var results = [];

  for (var i = 0; i < index.documents.length; i++) {
    var doc = index.documents[i];

    // Apply filters
    if (filters.type && doc.type !== filters.type) continue;
    if (filters.tag && doc.tags.indexOf(filters.tag) === -1) continue;

    // Score using TF-IDF
    var score = 0;
    for (var j = 0; j < queryTokens.length; j++) {
      var term = queryTokens[j];
      if (doc.tf[term]) {
        var idf = Math.log(index.totalDocs / (index.df[term] || 1));
        score += doc.tf[term] * idf;
      }
    }

    if (score > 0) {
      // Find best excerpt
      var excerpt = '';
      var bodyLower = doc.bodyPreview.toLowerCase();
      for (var k = 0; k < queryTokens.length; k++) {
        var pos = bodyLower.indexOf(queryTokens[k]);
        if (pos !== -1) {
          var start = Math.max(0, pos - 40);
          var end = Math.min(doc.bodyPreview.length, pos + 60);
          excerpt = '...' + doc.bodyPreview.substring(start, end).trim() + '...';
          break;
        }
      }

      results.push({
        file: 'wiki/' + doc.file,
        title: doc.title,
        score: Math.round(score * 1000) / 1000,
        type: doc.type,
        tags: doc.tags,
        excerpt: excerpt,
        related: doc.related,
      });
    }
  }

  results.sort(function(a, b) { return b.score - a.score; });
  return { query: query, results: results, total: results.length };
}

function stats() {
  var index = loadOrBuildIndex();
  var types = {};
  var tags = {};
  var statuses = {};

  for (var i = 0; i < index.documents.length; i++) {
    var doc = index.documents[i];
    types[doc.type] = (types[doc.type] || 0) + 1;
    statuses[doc.status] = (statuses[doc.status] || 0) + 1;
    for (var j = 0; j < doc.tags.length; j++) {
      tags[doc.tags[j]] = (tags[doc.tags[j]] || 0) + 1;
    }
  }

  var lines = [];
  lines.push('Total articles: ' + index.documents.length);
  lines.push('Index built: ' + index.built);
  lines.push('');
  lines.push('By type:');
  for (var type in types) { lines.push('  ' + type + ': ' + types[type]); }
  lines.push('');
  lines.push('By status:');
  for (var status in statuses) { lines.push('  ' + status + ': ' + statuses[status]); }
  lines.push('');
  lines.push('Top tags:');
  var sortedTags = Object.entries(tags).sort(function(a, b) { return b[1] - a[1]; }).slice(0, 20);
  for (var k = 0; k < sortedTags.length; k++) {
    lines.push('  ' + sortedTags[k][0] + ': ' + sortedTags[k][1]);
  }

  return lines.join('\n');
}

// --- CLI ---

var args = process.argv.slice(2);
var command = args[0];

if (command === 'index') {
  var idx = buildIndex();
  console.log('Indexed ' + idx.totalDocs + ' articles.');
} else if (command === 'search') {
  var query = args[1];
  if (!query) {
    console.error('Usage: kb-search.js search "query" [--type=X] [--tag=X]');
    process.exit(1);
  }
  var filters = {};
  for (var a = 2; a < args.length; a++) {
    var flagMatch = args[a].match(/^--(\w+)=(.+)/);
    if (flagMatch) filters[flagMatch[1]] = flagMatch[2];
  }
  console.log(JSON.stringify(search(query, filters)));
} else if (command === 'stats') {
  console.log(stats());
} else {
  console.log('Usage: kb-search.js <index|search|stats>');
  console.log('  Set KB_PATH env var to the knowledge base root (default: .obsidian)');
  process.exit(1);
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node cli/kb-search.test.js`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add cli/kb-search.js cli/kb-search.test.js
git commit -m "feat: add TF-IDF search CLI tool for knowledge base"
```

---

### Task 2: Wiki Article Template Reference

**Files:**
- Create: `.claude/references/kb-article-template.md`

- [ ] **Step 1: Create the article template reference**

```markdown
# Wiki Article Template

Used by `/kb ingest`, `/kb compile`, and pipeline commands when creating or updating wiki articles. All wiki articles live in `<kb-path>/wiki/` as flat files.

**Security:** Wiki articles are committed to git. NEVER store actual secret values (API keys, tokens, passwords). Store only metadata: which env vars are needed, which services are used, who owns credentials.

---

## Article Types

| Type | Use for |
|------|---------|
| `concept` | Technology explanations, patterns, principles |
| `feature` | Project feature documentation |
| `decision` | Architecture Decision Records (ADRs) |
| `guide` | How-to articles synthesized from sources |
| `comparison` | X vs Y analyses |
| `reference` | Quick-reference sheets, cheat sheets, project overview |
| `session-learning` | Insights captured from coding sessions |

---

## Full Article Template

```
---
title: [Human-readable title]
type: [concept|feature|decision|guide|comparison|reference|session-learning]
tags: [lowercase, hyphenated, array]
sources:
  - raw/articles/source-file.md
related:
  - other-article.md
created: YYYY-MM-DD
updated: YYYY-MM-DD
status: [stub|compiled|reviewed]
---

# [Title]

[1-2 sentence summary: what this covers and why it matters]

## Content

[Main body — written and maintained by the LLM]

## Key Takeaways

- [Most important insight 1]
- [Most important insight 2]

## See Also

- [[related-article]] — [why it's related]
```

---

## Stub Article Template

Created during `/kb ingest` for quick capture. Expanded during `/kb compile`.

```
---
title: [Title extracted from source]
type: [best guess from content]
tags: [extracted keywords]
sources:
  - raw/[type]/[source-file].md
related: []
created: YYYY-MM-DD
updated: YYYY-MM-DD
status: stub
---

# [Title]

[One-paragraph summary of the source material]

## Key Takeaways

- [Key point 1 from source]
- [Key point 2 from source]
```

---

## Feature Article Template

For project feature documentation (migrated from the old `features/` folder structure).

```
---
title: "Feature: [Name]"
type: feature
tags: [feature, relevant-domain-tags]
sources: []
related: []
created: YYYY-MM-DD
updated: YYYY-MM-DD
status: compiled
---

# Feature: [Name]

[1-2 sentences: what this feature does and why]

## GitHub Issues

- #N — [title] (status: open/closed)

## Key Decisions

- [Decision and why]

## Implementation Notes

[Updated by /ship — endpoints, components, patterns used]

## Key Takeaways

- [Summary of what this feature does]

## See Also

- [[related-feature]] — [relationship]
```

---

## Decision Article Template

For Architecture Decision Records (migrated from the old `decisions/` folder structure).

```
---
title: "ADR-NNN: [Title]"
type: decision
tags: [decision, relevant-domain-tags]
sources: []
related: []
created: YYYY-MM-DD
updated: YYYY-MM-DD
status: compiled
---

# ADR-NNN: [Title]

**Date:** YYYY-MM-DD
**Status:** Accepted

## Context

[What situation led to this decision]

## Decision

[What we chose and why]

## Consequences

[What this means for future work — positive and negative]

## Key Takeaways

- [The decision in one sentence]

## See Also

- [[related-feature-or-concept]] — [relationship]
```

---

## Manifest Entry Format

Each entry in `raw/_manifest.md`:

```markdown
| Source | Date | Type | Raw File | Status | Wiki Article |
|--------|------|------|----------|--------|--------------|
| https://example.com/article | 2026-04-05 | article | raw/articles/2026-04-05-example-article.md | compiled | wiki/example-concept.md |
```

---

## Index File Formats

### `wiki/_index.md`

```markdown
# Wiki Index

Last updated: YYYY-MM-DD | Articles: N | Stubs: N

## By Type

### Concepts
- [[concept-name]] — one-line summary

### Features
- [[feature-name]] — one-line summary

### Decisions
- [[adr-nnn-title]] — one-line summary

### Guides
- [[guide-name]] — one-line summary

### Comparisons
- [[comparison-name]] — one-line summary

### References
- [[reference-name]] — one-line summary

### Session Learnings
- [[learning-name]] — one-line summary
```

### `wiki/_tags.md`

```markdown
# Tag Registry

| Tag | Count | Articles |
|-----|-------|----------|
| auth | 5 | [[oauth2-patterns]], [[auth-system]], ... |
| database | 3 | [[database-design]], [[migrations]], ... |
```
```

- [ ] **Step 2: Commit**

```bash
git add .claude/references/kb-article-template.md
git commit -m "docs: add wiki article template reference for KB workflow"
```

---

### Task 3: KB Commands — `/kb ingest`

**Files:**
- Create: `.claude/commands/kb-ingest.md`

- [ ] **Step 1: Create the ingest command spec**

```markdown
# /kb ingest — Knowledge Base Ingestion

Ingest a source (URL, file, directory, or session learnings) into the knowledge base.

## Arguments

- `$ARGUMENTS` — source to ingest. Can be:
  - A URL (starts with `http://` or `https://`)
  - A local file path (ends with `.md`, `.pdf`, `.txt`)
  - A local directory path
  - The word `session` (to capture current conversation learnings)

## Prerequisites

- Knowledge base must be configured: CLAUDE.md has `## Knowledge Base` section with `Path:` value
- For URL ingestion: Firecrawl MCP must be available (fall back to WebFetch if not)

## Process

### Step 1: Detect KB Path

1. Parse CLAUDE.md for `## Knowledge Base` section
2. Extract the `Path:` value (e.g., `.obsidian/`)
3. Verify `<kb-path>/raw/` and `<kb-path>/wiki/` directories exist
4. If directories don't exist, create the full KB structure:
   ```
   <kb-path>/raw/_manifest.md
   <kb-path>/raw/articles/
   <kb-path>/raw/papers/
   <kb-path>/raw/docs/
   <kb-path>/raw/repos/
   <kb-path>/raw/sessions/
   <kb-path>/wiki/_index.md
   <kb-path>/wiki/_tags.md
   <kb-path>/_search/
   ```

### Step 2: Detect Source Type and Fetch

**URL source:**
1. Use Firecrawl MCP `firecrawl_scrape` to fetch and convert to markdown
2. If Firecrawl unavailable, use WebFetch tool
3. Determine subcategory from content:
   - API docs / framework docs → `raw/docs/`
   - Academic paper / whitepaper → `raw/papers/`
   - Blog post / article → `raw/articles/`
   - GitHub repo → `raw/repos/`

**Local file/directory:**
1. Read the file(s) using the Read tool
2. Copy content to appropriate `raw/` subfolder
3. For directories: create a single combined markdown with section headers per file

**Session learnings:**
1. Review the current conversation for:
   - Decisions made and their rationale
   - Patterns discovered or established
   - Bugs solved and root causes
   - Trade-offs evaluated
   - New conventions adopted
2. Create a structured session summary

### Step 3: Save to Raw

Save the content to `raw/<type>/YYYY-MM-DD-<slugified-title>.md`.

The raw file should preserve the original content as-is, with a metadata header:

```markdown
---
source: [URL or file path]
ingested: YYYY-MM-DD
type: [article|paper|doc|repo|session]
---

[Original content below]
```

### Step 4: Update Manifest

Add an entry to `raw/_manifest.md`:

```markdown
| [source] | YYYY-MM-DD | [type] | raw/[type]/[filename] | pending | — |
```

### Step 5: Create Stub Wiki Article

1. Read the raw content
2. Generate:
   - A descriptive title
   - 3-5 relevant tags (lowercase, hyphenated)
   - A one-paragraph summary
   - 2-3 key takeaways
   - Best-guess article type
3. Write to `wiki/<slugified-title>.md` using the stub template from `.claude/references/kb-article-template.md`
4. Set `status: stub`

### Step 6: Update Wiki Index Files

1. Add entry to `wiki/_index.md` under the appropriate type section
2. Add/update tags in `wiki/_tags.md`

### Step 7: Update Search Index

Run: `KB_PATH=<kb-path> node cli/kb-search.js index`

### Step 8: Report

```
=== Ingested ===

Source: [source]
Raw file: raw/[type]/[filename]
Wiki stub: wiki/[article-name].md
Tags: [tag1, tag2, tag3]

Run /kb compile to expand this stub into a full article with cross-links.
```
```

- [ ] **Step 2: Commit**

```bash
git add .claude/commands/kb-ingest.md
git commit -m "feat: add /kb ingest command spec"
```

---

### Task 4: KB Commands — `/kb compile`

**Files:**
- Create: `.claude/commands/kb-compile.md`

- [ ] **Step 1: Create the compile command spec**

```markdown
# /kb compile — Knowledge Base Compilation

Deep compilation pass: expands stubs, cross-links articles, extracts new concepts, and runs health checks.

## Arguments

- `$ARGUMENTS` — optional scope:
  - A tag name (e.g., `auth`) — compile only articles with that tag
  - An article filename (e.g., `oauth2-patterns.md`) — compile just that article
  - `all` or omitted — compile everything pending

## Prerequisites

- Knowledge base must be configured in CLAUDE.md
- At least one article must exist in `wiki/`

## Process

### Step 1: Detect KB Path

Parse CLAUDE.md for `## Knowledge Base` section. Extract `Path:` value. Verify directory exists.

### Step 2: Scan for Pending Work

1. Read `raw/_manifest.md` — identify entries with status `pending` or `updated`
2. Read `wiki/` — identify articles with `status: stub`
3. If scope argument provided, filter to matching articles/sources only
4. Report: "Found N pending sources, M stubs to expand"

### Step 3: Expand Stubs

For each stub article:

1. Read the corresponding raw source(s) from the `sources:` frontmatter field
2. Read the full raw content
3. Search for related existing wiki articles:
   - Run `KB_PATH=<kb-path> node cli/kb-search.js search "<stub title and tags>"`
   - Read the top 3-5 related articles
4. Expand the stub:
   - Write a comprehensive `## Content` section synthesizing the source material
   - Add connections to related articles in `## See Also`
   - Expand `## Key Takeaways` to 3-5 points
   - Update `status: stub` → `status: compiled`
   - Update `updated:` date

### Step 4: Cross-Link

For each newly compiled article:

1. Scan all other wiki articles for mentions of this article's key concepts
2. Add wikilinks `[[article-name]]` where concepts are referenced
3. Update the `related:` frontmatter field in both directions:
   - Add this article to related articles' `related:` lists
   - Add related articles to this article's `related:` list

### Step 5: Extract New Concepts

Scan all compiled articles for:
1. Concepts mentioned in 3+ articles that don't have their own article
2. Natural comparison opportunities (two articles covering similar topics from different angles)
3. Create new stub articles for discovered concepts/comparisons

### Step 6: Health Check

Run these checks across the entire wiki:

**Structural:**
- [ ] Orphaned articles (no incoming backlinks from any other article)
- [ ] Broken wikilinks (`[[name]]` where `name.md` doesn't exist)
- [ ] Stubs older than 7 days
- [ ] Articles with incomplete frontmatter (missing required fields)

**Content:**
- [ ] Duplicate articles (>70% tag overlap + similar titles)
- [ ] Inconsistent information (contradictions across articles)
- [ ] Stale sources (raw file modified after wiki article's `updated` date)
- [ ] Articles missing `## Key Takeaways` section

**Suggestions:**
- Merge candidates with rationale
- Missing concept articles (referenced but don't exist)
- Stale articles that need updating

Write the health report to `<kb-path>/_search/stats.md`:

```markdown
# KB Health — YYYY-MM-DD

## Stats
- Total articles: N
- By type: N concept, N feature, N decision, N guide, N comparison, N reference
- Stubs pending: N
- Raw sources pending: N

## Issues (N)
- [warning/info] [description]

## Suggestions (N)
- [suggestion]
```

### Step 7: Rebuild Indexes

1. Rebuild `wiki/_index.md` — scan all wiki articles, group by type, one-line summary each
2. Rebuild `wiki/_tags.md` — scan all tags, count articles, list top articles per tag
3. Run: `KB_PATH=<kb-path> node cli/kb-search.js index`

### Step 8: Update Manifest

For each processed raw source, update `raw/_manifest.md`:
- Change status from `pending` → `compiled`
- Add the wiki article filename in the "Wiki Article" column

### Step 9: Report

```
=== Compilation Complete ===

Processed: N sources
Expanded: N stubs → compiled articles
New articles: N (from concept extraction)
Cross-links added: N
Health issues: N (see _search/stats.md)

Wiki now has N total articles.
```
```

- [ ] **Step 2: Commit**

```bash
git add .claude/commands/kb-compile.md
git commit -m "feat: add /kb compile command spec"
```

---

### Task 5: KB Commands — `/kb search` and `/kb ask`

**Files:**
- Create: `.claude/commands/kb-search.md`
- Create: `.claude/commands/kb-ask.md`

- [ ] **Step 1: Create the search command spec**

```markdown
# /kb search — Knowledge Base Search

Search the wiki using the TF-IDF search CLI tool.

## Arguments

- `$ARGUMENTS` — search query, optionally followed by filters:
  - `--type=concept|feature|decision|guide|comparison|reference|session-learning`
  - `--tag=<tag-name>`

## Prerequisites

- Knowledge base must be configured in CLAUDE.md
- Search CLI must exist at `cli/kb-search.js`

## Process

### Step 1: Detect KB Path

Parse CLAUDE.md for `## Knowledge Base` section. Extract `Path:` value.

### Step 2: Run Search

```bash
KB_PATH=<kb-path> node cli/kb-search.js search "$ARGUMENTS"
```

Parse the JSON output.

### Step 3: Load Results

1. If results found, read the top 3 articles in full using the Read tool
2. Present results to the user:

```
=== KB Search: "[query]" ===

Found N results:

1. [title] (score: 0.87, type: concept)
   Tags: auth, oauth2, spa
   [excerpt]

2. [title] (score: 0.65, type: feature)
   Tags: auth, feature
   [excerpt]

3. [title] (score: 0.42, type: decision)
   Tags: database, architecture
   [excerpt]
```

### Step 4: Offer Actions

```
Actions:
- Read any article in full: "read wiki/[filename]"
- Ask a question: /kb ask "[question]"
- Ingest more sources: /kb ingest [source]
```
```

- [ ] **Step 2: Create the ask command spec**

```markdown
# /kb ask — Knowledge Base Q&A

Ask a question against the wiki. The answer is synthesized from existing articles and filed back into the wiki.

## Arguments

- `$ARGUMENTS` — the question to answer

## Prerequisites

- Knowledge base must be configured in CLAUDE.md
- Wiki must have at least a few articles

## Process

### Step 1: Detect KB Path

Parse CLAUDE.md for `## Knowledge Base` section. Extract `Path:` value.

### Step 2: Search for Relevant Articles

Run: `KB_PATH=<kb-path> node cli/kb-search.js search "$ARGUMENTS"`

Parse the JSON output. If no results, tell the user:
> "No relevant articles found. Try `/kb ingest` to add sources on this topic first."

### Step 3: Read Source Articles

Read the top 5 relevant articles in full using the Read tool. Note which articles inform the answer.

### Step 4: Synthesize Answer

Write a comprehensive answer drawing from the source articles. The answer should:
- Directly address the question
- Reference specific articles with wikilinks
- Include code examples if relevant
- Note any gaps or areas where the wiki lacks coverage

### Step 5: File Answer as Wiki Article

1. Determine if this answer should be:
   - A `guide` — if it's a how-to
   - A `comparison` — if it compares options
   - A `reference` — if it's a factual summary
2. Write the answer as a new wiki article using `.claude/references/kb-article-template.md`
3. Set `status: compiled`
4. Add references to source articles in `related:` and `## See Also`
5. Update backlinks in source articles

### Step 6: Update Indexes

1. Add to `wiki/_index.md`
2. Update `wiki/_tags.md`
3. Run: `KB_PATH=<kb-path> node cli/kb-search.js index`

### Step 7: Present Answer

Display the synthesized answer directly to the user, then note:

```
Answer filed as: wiki/[article-name].md
Sources: [list of articles referenced]

This answer is now part of your wiki and will inform future queries.
```
```

- [ ] **Step 3: Commit**

```bash
git add .claude/commands/kb-search.md .claude/commands/kb-ask.md
git commit -m "feat: add /kb search and /kb ask command specs"
```

---

### Task 6: KB Auto-Loading Rule

**Files:**
- Create: `.claude/rules/knowledge-base.md`

- [ ] **Step 1: Create the rule file**

```markdown
---
globs: .obsidian/**/*.md
description: Auto-loads when editing knowledge base files. Enforces wiki article format, backlinks, and index consistency.
---

# Knowledge Base Rules

## Skill Chain

1. `/kb search` — find related articles before creating new ones
2. Create/update article — follow frontmatter format from `.claude/references/kb-article-template.md`
3. Update backlinks — both directions (this article's `related:` and linked articles' `related:`)
4. Update `wiki/_index.md` and `wiki/_tags.md`
5. Rebuild search index: `KB_PATH=<kb-path> node cli/kb-search.js index`

## Conventions

- Never edit `raw/` files — they are source-of-truth snapshots of ingested material
- Wiki articles are LLM-maintained — the user rarely touches them directly
- Every article must have complete frontmatter (all required fields from template)
- Wikilinks use `[[filename-without-extension]]` format (Obsidian-compatible)
- Tags are lowercase, hyphenated (e.g., `api-design`, not `API Design` or `apiDesign`)
- Article filenames are slugified titles (e.g., `oauth2-patterns-for-spas.md`)
- Stub articles (`status: stub`) must be expanded in the next `/kb compile` run
- Files starting with `_` (`_index.md`, `_tags.md`) are index files — auto-generated, do not manually edit

## Checklist

- [ ] Frontmatter complete (title, type, tags, created, updated, status — all required)
- [ ] Backlinks updated in related articles (bidirectional)
- [ ] `wiki/_index.md` reflects the change
- [ ] `wiki/_tags.md` reflects any new tags
- [ ] No broken wikilinks introduced (every `[[name]]` has a matching `name.md`)
- [ ] Search index rebuilt after changes
```

- [ ] **Step 2: Commit**

```bash
git add .claude/rules/knowledge-base.md
git commit -m "feat: add auto-loading KB rule for wiki article editing"
```

---

### Task 7: Update Pipeline Commands — `/start` and `/prime`

**Files:**
- Modify: `.claude/commands/start.md:27-31`
- Modify: `.claude/commands/prime.md:45-54,79-82`

- [ ] **Step 1: Update `/start` L0 KB scaffolding**

In `.claude/commands/start.md`, replace lines 27-31 (the L0 knowledge base creation block):

Old:
```markdown
  2. If knowledge base configured in CLAUDE.md:
     a. Create knowledge base folder structure (`overview.md`, `features/`, `decisions/`, `config/`, `research/`, `architecture/`)
     b. Create `overview.md` from brainstorming results using `.claude/references/knowledge-base-templates.md`
     c. Create feature notes in `features/` for each agreed functionality
```

New:
```markdown
  2. If knowledge base configured in CLAUDE.md:
     a. Create the unified KB structure:
        - `<kb-path>/raw/_manifest.md` (empty manifest table)
        - `<kb-path>/raw/articles/`, `raw/papers/`, `raw/docs/`, `raw/repos/`, `raw/sessions/`
        - `<kb-path>/wiki/_index.md` (empty index)
        - `<kb-path>/wiki/_tags.md` (empty tag registry)
        - `<kb-path>/_search/` (search infrastructure directory)
     b. Create `wiki/project-overview.md` from brainstorming results using `.claude/references/kb-article-template.md` (type: `reference`)
     c. Create wiki articles in `wiki/` for each agreed functionality (type: `feature`)
     d. Ask: "Do you have research sources to ingest? Run `/kb ingest <source>` for each."
```

- [ ] **Step 2: Update `/prime` KB context loading**

In `.claude/commands/prime.md`, replace lines 45-54 (the Knowledge Base Context section):

Old:
```markdown
### 6. Knowledge Base Context

Check CLAUDE.md for a `## Knowledge Base` section with a `Path:` value (e.g., `.obsidian/`). If configured and the directory exists:

1. **Always read:** `<kb-path>/overview.md`
2. **Find linked feature note:** If working on a specific issue (detected from branch name or user input), grep `<kb-path>/features/*.md` for the issue number. Read the matching feature note.
3. **Scan for related features:** List all files in `<kb-path>/features/`. Read the first 5 lines (`## Summary`) of each. If any feature has a clear dependency or overlap with the current issue (shared entities, referenced in acceptance criteria, same domain area), read the full note.
4. **Check decisions:** List `<kb-path>/decisions/`. Read any whose title references the same feature area.

If no knowledge base configured, skip this section entirely.
```

New:
```markdown
### 6. Knowledge Base Context

Check CLAUDE.md for a `## Knowledge Base` section with a `Path:` value (e.g., `.obsidian/`). If configured and the directory exists:

1. **Read the wiki index:** `<kb-path>/wiki/_index.md` — this gives an overview of all knowledge available
2. **Search for task-relevant knowledge:** Run `KB_PATH=<kb-path> node cli/kb-search.js search "<task keywords>"` where task keywords come from the current issue title, branch name, or user description
3. **Load top results:** Read the top 3-5 matching wiki articles in full using the Read tool
4. **Check for feature articles:** If working on a specific issue, also search: `KB_PATH=<kb-path> node cli/kb-search.js search "#<issue-number>" --type=feature`

If no knowledge base configured, skip this section entirely.
```

- [ ] **Step 3: Update `/prime` output format**

In `.claude/commands/prime.md`, replace lines 79-82:

Old:
```markdown
Knowledge Base: [N domains documented in architect-agent]

Project Knowledge: [summary from overview.md if knowledge base exists, or "not configured"]
Related Features: [list of feature notes loaded for this session]
```

New:
```markdown
Knowledge Base: [N articles in wiki, N stubs pending | "not configured"]

KB Context Loaded: [list of wiki articles loaded for this session, with types]
```

- [ ] **Step 4: Commit**

```bash
git add .claude/commands/start.md .claude/commands/prime.md
git commit -m "feat: update /start and /prime for unified wiki KB"
```

---

### Task 8: Update Pipeline Commands — `/execute` and `/ship`

**Files:**
- Modify: `.claude/commands/execute.md:30-42`
- Modify: `.claude/commands/ship.md:13-35`

- [ ] **Step 1: Update `/execute` KB context loading**

In `.claude/commands/execute.md`, replace lines 30-42:

Old:
```markdown
#### Knowledge Base Context (if configured)

Check CLAUDE.md for a `## Knowledge Base` section with a `Path:` value. If configured:

1. Detect the issue number from the plan file or current branch
2. Grep `<kb-path>/features/*.md` for the issue number — read the matching feature note
3. Scan other feature notes (first 5 lines each) for related features — read any with clear overlap
4. Check `<kb-path>/decisions/` for decisions referencing the same feature area
5. Read `<kb-path>/overview.md` for project context

This supplements the plan's mandatory reading with project-level context the plan author may not have included.

If no knowledge base configured, skip this step.
```

New:
```markdown
#### Knowledge Base Context (if configured)

Check CLAUDE.md for a `## Knowledge Base` section with a `Path:` value. If configured:

1. Read `<kb-path>/wiki/_index.md` for an overview of available knowledge
2. Extract keywords from the current task description
3. Run: `KB_PATH=<kb-path> node cli/kb-search.js search "<task keywords>"`
4. Read the top 3-5 matching wiki articles in full
5. If working on a specific issue, also search: `KB_PATH=<kb-path> node cli/kb-search.js search "#<issue-number>" --type=feature`

This supplements the plan's mandatory reading with wiki knowledge the plan author may not have included. The search automatically finds relevant concepts, decisions, and feature context.

If no knowledge base configured, skip this step.
```

- [ ] **Step 2: Update `/ship` KB update step**

In `.claude/commands/ship.md`, replace lines 13-35:

Old:
```markdown
### Step 1.5: Update Knowledge Base (if configured)

Check CLAUDE.md for a `## Knowledge Base` section with a `Path:` value. If configured:

1. **Find the feature note:** Detect the current issue number from the branch name. Grep `<kb-path>/features/*.md` for that issue number. If no match, use keyword matching between branch name and feature note filenames.

2. **Update the feature note:**
   - `## Implementation Notes` — append what was built: key files created/modified, endpoints added, components built, patterns used
   - `## GitHub Issues` — update the status of the current issue to reflect completion
   - `## Key Decisions` — add any decisions made during implementation that weren't pre-planned

3. **Create decision records** (only if warranted):
   - A technology or approach was chosen over alternatives during implementation
   - A pattern was established that future features should follow
   - Something was intentionally excluded and the reason matters for future work

4. **Update overview** (only if significant):
   - New integration or service was added to the stack
   - Project scope changed

5. Stage knowledge base changes alongside code changes.

If no knowledge base configured, skip to Step 2.
```

New:
```markdown
### Step 1.5: Update Knowledge Base (if configured)

Check CLAUDE.md for a `## Knowledge Base` section with a `Path:` value. If configured:

1. **Find the feature article:** Search for the current issue: `KB_PATH=<kb-path> node cli/kb-search.js search "#<issue-number>" --type=feature`. If no match, search by branch name keywords.

2. **Update the feature article** (or create one if none exists):
   - Update `## Implementation Notes` — key files created/modified, endpoints, components, patterns
   - Update `## GitHub Issues` — mark the current issue as completed
   - Update `## Key Decisions` — add decisions made during implementation
   - Update `updated:` date in frontmatter
   - Add/update backlinks to any new related articles

3. **Create decision articles** (only if warranted):
   - Use the decision article template from `.claude/references/kb-article-template.md`
   - Save to `wiki/adr-NNN-<slugified-title>.md` (type: `decision`)
   - Add backlinks from the feature article

4. **Update project overview** (only if significant):
   - Search: `KB_PATH=<kb-path> node cli/kb-search.js search "project overview" --type=reference`
   - Update the project overview article if scope or stack changed

5. **Rebuild indexes:**
   - Update `wiki/_index.md` and `wiki/_tags.md`
   - Run: `KB_PATH=<kb-path> node cli/kb-search.js index`

6. Stage knowledge base changes alongside code changes: `git add <kb-path>/wiki/ <kb-path>/raw/`

If no knowledge base configured, skip to Step 2.
```

- [ ] **Step 3: Commit**

```bash
git add .claude/commands/execute.md .claude/commands/ship.md
git commit -m "feat: update /execute and /ship for unified wiki KB"
```

---

### Task 9: Update Pipeline Commands — `/evolve`, `/create-prd`, `/plan-project`

**Files:**
- Modify: `.claude/commands/evolve.md:32-41`
- Modify: `.claude/commands/create-prd.md:34-51,70-76`
- Modify: `.claude/commands/plan-project.md:77-92`

- [ ] **Step 1: Update `/evolve` KB step**

In `.claude/commands/evolve.md`, replace lines 32-41:

Old:
```markdown
### Step 3: Update Architect Knowledge Base

If structural changes were made:
1. Dispatch architect-agent with RECORD query
2. Agent verifies changes exist in codebase
3. Agent updates relevant domain files in modules/ and frontend/
4. Agent updates index.md if new domains were added
5. If an architectural decision was made, add to decisions/log.md
```

New:
```markdown
### Step 3: Update Knowledge Bases

**Architect Knowledge Base** — If structural changes were made:
1. Dispatch architect-agent with RECORD query
2. Agent verifies changes exist in codebase
3. Agent updates relevant domain files in modules/ and frontend/
4. Agent updates index.md if new domains were added

**Wiki Knowledge Base** — If configured in CLAUDE.md (`## Knowledge Base` section):
1. Review the session for learnings: decisions made, patterns discovered, bugs solved, trade-offs evaluated, conventions adopted
2. For each significant learning, create a raw session file:
   - Save to `<kb-path>/raw/sessions/YYYY-MM-DD-<topic>.md`
   - Add entry to `<kb-path>/raw/_manifest.md` with status `pending`
3. Create stub wiki articles for each learning (type: `session-learning`)
4. Update `wiki/_index.md` and `wiki/_tags.md`
5. Run: `KB_PATH=<kb-path> node cli/kb-search.js index`
6. If stubs have accumulated, suggest: "Run `/kb compile` to expand session learnings into full articles with cross-links."
```

- [ ] **Step 2: Update `/create-prd` KB seeding**

In `.claude/commands/create-prd.md`, replace lines 34-51:

Old:
```markdown
### Phase 2.5: Seed Knowledge Base (if configured)

Check CLAUDE.md for a `## Knowledge Base` section with a `Path:` value. If configured:

1. Read `.claude/references/knowledge-base-templates.md` for templates
2. Create `<kb-path>/overview.md` from the PRD:
   - Vision from Executive Summary
   - Goals from Goals & Success Criteria
   - Target Users from Target Users section
   - Tech Stack from Technical Architecture
   - Feature Areas listing each epic/feature
3. Create `<kb-path>/architecture/system-design.md` from the PRD's Technical Architecture and System Diagram sections
4. For each epic or major feature in the PRD, create `<kb-path>/features/<feature-name>.md` using the feature note template:
   - Summary from the epic description
   - GitHub Issues section left empty (populated by `/plan-project`)
   - Key Decisions from any decisions made during brainstorming

If no knowledge base configured, skip this phase.
```

New:
```markdown
### Phase 2.5: Seed Knowledge Base (if configured)

Check CLAUDE.md for a `## Knowledge Base` section with a `Path:` value. If configured:

1. Read `.claude/references/kb-article-template.md` for templates
2. Create the KB structure if it doesn't exist (same as `/start` L0 step)
3. Create `<kb-path>/wiki/project-overview.md` (type: `reference`):
   - Vision from Executive Summary
   - Goals from Goals & Success Criteria
   - Target Users from Target Users section
   - Tech Stack from Technical Architecture
   - Feature Areas listing each epic/feature with wikilinks
4. Create `<kb-path>/wiki/system-design.md` (type: `concept`):
   - Architecture from Technical Architecture and System Diagram sections
5. For each epic or major feature in the PRD, create `<kb-path>/wiki/<feature-name>.md` (type: `feature`):
   - Summary from the epic description
   - GitHub Issues section left empty (populated by `/plan-project`)
   - Key Decisions from brainstorming
   - Related articles linking to project-overview and system-design
6. Update `wiki/_index.md` and `wiki/_tags.md`
7. Run: `KB_PATH=<kb-path> node cli/kb-search.js index`

If no knowledge base configured, skip this phase.
```

- [ ] **Step 3: Update `/create-prd` git add**

In `.claude/commands/create-prd.md`, replace lines 70-76:

Old:
```markdown
Commit the PRD and knowledge base files (if created):
```bash
git add docs/plans/PRD.md
# If knowledge base was seeded:
git add <kb-path>/overview.md <kb-path>/architecture/ <kb-path>/features/
git commit -m "docs: add PRD and seed project knowledge base"
```
```

New:
```markdown
Commit the PRD and knowledge base files (if created):
```bash
git add docs/plans/PRD.md
# If knowledge base was seeded:
git add <kb-path>/wiki/ <kb-path>/raw/_manifest.md
git commit -m "docs: add PRD and seed project knowledge base"
```
```

- [ ] **Step 4: Update `/plan-project` KB integration**

In `.claude/commands/plan-project.md`, replace lines 77-92:

Old:
```markdown
#### Knowledge Base Integration (if configured)

Check CLAUDE.md for a `## Knowledge Base` section with a `Path:` value. If configured, after creating each GitHub issue:

1. Check if a feature note already exists in `<kb-path>/features/` for this feature area
2. If yes: update the `## GitHub Issues` section with the new issue number and title
3. If no: create a new feature note using `.claude/references/knowledge-base-templates.md` template, with:
   - Summary from the issue description
   - GitHub Issues section listing the new issue
4. If architectural decisions were made during the planning process, create `<kb-path>/decisions/NNN-title.md` for each significant decision

Stage knowledge base files for commit:
```bash
git add <kb-path>/features/ <kb-path>/decisions/
```

If no knowledge base configured, skip this step.
```

New:
```markdown
#### Knowledge Base Integration (if configured)

Check CLAUDE.md for a `## Knowledge Base` section with a `Path:` value. If configured, after creating each GitHub issue:

1. Search for an existing feature article: `KB_PATH=<kb-path> node cli/kb-search.js search "<feature name>" --type=feature`
2. If found: update the article's `## GitHub Issues` section with the new issue number and title
3. If not found: create a new feature article in `wiki/<feature-name>.md` using `.claude/references/kb-article-template.md` feature template, with:
   - Summary from the issue description
   - GitHub Issues section listing the new issue
   - Tags relevant to the feature domain
4. If architectural decisions were made, create decision articles in `wiki/adr-NNN-<title>.md` using the decision template
5. Update `wiki/_index.md`, `wiki/_tags.md`
6. Run: `KB_PATH=<kb-path> node cli/kb-search.js index`

Stage knowledge base files for commit:
```bash
git add <kb-path>/wiki/
```

If no knowledge base configured, skip this step.
```

- [ ] **Step 5: Commit**

```bash
git add .claude/commands/evolve.md .claude/commands/create-prd.md .claude/commands/plan-project.md
git commit -m "feat: update /evolve, /create-prd, /plan-project for unified wiki KB"
```

---

### Task 10: Update Templates, CLAUDE.md, and Infrastructure

**Files:**
- Modify: `.claude/references/knowledge-base-templates.md`
- Modify: `CLAUDE.md:57-82`
- Modify: `.gitignore`
- Modify: `cli/protected-files.js:3-24`

- [ ] **Step 1: Update the knowledge base templates reference**

Replace the entire contents of `.claude/references/knowledge-base-templates.md`:

```markdown
# Knowledge Base Templates

> **Deprecated:** This file now redirects to the unified wiki article templates.
> See `.claude/references/kb-article-template.md` for all wiki article templates.
>
> The old folder-based structure (`features/`, `decisions/`, `architecture/`, `config/`, `research/`)
> has been replaced by a flat wiki model. All articles live in `<kb-path>/wiki/` with type tags
> in frontmatter to distinguish feature notes, decisions, concepts, etc.

For the full template reference, read: `.claude/references/kb-article-template.md`
```

- [ ] **Step 2: Update CLAUDE.md Knowledge Base section**

In `CLAUDE.md`, replace lines 57-82 (the `## Knowledge Base` section through the "When commands write it" block):

Old:
```markdown
## Knowledge Base

Optional Obsidian-compatible project knowledge base. Stores feature specs, architecture decisions, and project overview as markdown notes that the agent reads/writes during the pipeline.

**Configuration:** Add `## Knowledge Base` with `Path: <path>` to your project's CLAUDE.md. Default: `.obsidian/`. Remove the section to disable.

**Structure:**
```
<path>/
├── overview.md          # Project vision, goals, tech stack
├── architecture/        # System design, data model
├── features/            # One note per feature area, linked to GitHub issues
├── decisions/           # Architecture Decision Records (ADRs)
├── config/              # Integration metadata, env var names (never actual secrets)
└── research/            # Brainstorming notes, tech comparisons
```

**When commands read it:**
- `/prime` — loads overview + related feature notes (smart/targeted)
- `/execute` — reads feature context before implementing

**When commands write it:**
- `/start` (L0) — creates structure + feature notes during brainstorming
- `/create-prd` — seeds overview + architecture from PRD
- `/plan-project` — creates feature notes alongside GitHub issues
- `/ship` — updates feature notes with implementation details
```

New:
```markdown
## Knowledge Base

Unified LLM knowledge base inspired by [Karpathy's LLM Knowledge Bases](https://x.com/karpathy) workflow. External research and project knowledge live together as a flat wiki. The LLM ingests raw sources, compiles them into wiki articles, auto-searches during task work, and grows the wiki from every coding session.

**Configuration:** Add `## Knowledge Base` with `Path: <path>` to your project's CLAUDE.md. Default: `.obsidian/`. Remove the section to disable.

**Structure:**
```
<path>/
├── raw/                 # Ingested source material (articles, papers, docs, repos, session learnings)
│   └── _manifest.md     # Index of all raw sources with status
├── wiki/                # Unified wiki — ALL knowledge as flat .md files with frontmatter
│   ├── _index.md        # Master index grouped by type
│   └── _tags.md         # Tag registry with article counts
└── _search/
    ├── index.json       # TF-IDF search index (auto-generated)
    └── stats.md         # KB health metrics
```

**KB Commands:**
- `/kb ingest <source>` — ingest URL, file, repo, or session learnings into raw/ + create wiki stub
- `/kb compile` — deep compilation: expand stubs, cross-link, extract concepts, health check
- `/kb search <query>` — TF-IDF search across wiki (used by LLM and user)
- `/kb ask <question>` — Q&A against wiki, answer filed back as new article

**When pipeline commands read it:**
- `/prime` — reads wiki index + auto-searches for task-relevant articles
- `/execute` — searches wiki before each task for relevant context

**When pipeline commands write it:**
- `/start` (L0) — creates KB structure + initial wiki articles
- `/create-prd` — seeds wiki with project overview, architecture, feature articles
- `/plan-project` — creates/updates feature articles alongside GitHub issues
- `/ship` — updates feature articles with implementation details, creates decision articles
- `/evolve` — captures session learnings as raw + stub wiki articles
```

- [ ] **Step 3: Update .gitignore**

Add to `.gitignore` after the existing Obsidian section:

```
# KB search index (auto-generated, rebuild with: node cli/kb-search.js index)
.obsidian/_search/index.json
```

- [ ] **Step 4: Update protected-files.js**

In `cli/protected-files.js`, add wiki index files to the PROTECTED_FILES array (after line 23, before the closing bracket):

```javascript
  // Knowledge base wiki index files (LLM-maintained)
  '.obsidian/wiki/_index.md',
  '.obsidian/wiki/_tags.md',
  '.obsidian/raw/_manifest.md',
```

And add the wiki directory to PROTECTED_DIRS (after line 30):

```javascript
  '.obsidian/wiki',
  '.obsidian/raw',
```

- [ ] **Step 5: Commit**

```bash
git add .claude/references/knowledge-base-templates.md CLAUDE.md .gitignore cli/protected-files.js
git commit -m "feat: update templates, CLAUDE.md, gitignore, and protected files for wiki KB"
```

---

### Task 11: Update CLI Init for KB Structure

**Files:**
- Modify: `cli/init.js:433-438`

- [ ] **Step 1: Update the CLI summary output**

In `cli/init.js`, replace lines 433-438 (the summary section that shows installed counts):

Old:
```javascript
  console.log('  .claude/commands/    10 pipeline commands');
  console.log('  .claude/agents/      4 specialist agents + template');
  console.log('  .claude/skills/      2 framework skills');
  console.log('  .claude/rules/       6 domain rules + template');
  console.log('  .claude/references/  6 templates');
  console.log('  .claude/hooks/       5 guardrails');
```

New:
```javascript
  console.log('  .claude/commands/    14 pipeline commands (incl. 4 /kb commands)');
  console.log('  .claude/agents/      4 specialist agents + template');
  console.log('  .claude/skills/      2 framework skills');
  console.log('  .claude/rules/       7 domain rules + template');
  console.log('  .claude/references/  7 templates');
  console.log('  .claude/hooks/       5 guardrails');
  console.log('  cli/kb-search.js     knowledge base search tool');
```

- [ ] **Step 2: Commit**

```bash
git add cli/init.js
git commit -m "chore: update CLI init summary for KB commands"
```

---

### Task 12: Integration Test — End-to-End KB Workflow

**Files:**
- Create: `cli/kb-integration.test.js`

- [ ] **Step 1: Write the integration test**

```javascript
// cli/kb-integration.test.js
//
// End-to-end test: creates a KB structure, ingests mock content,
// verifies search works, and checks index consistency.

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const SEARCH_CLI = path.join(__dirname, 'kb-search.js');
const TEST_DIR = path.join(require('os').tmpdir(), 'kb-e2e-test-' + Date.now());

function run(args) {
  return execFileSync('node', [SEARCH_CLI, ...args], {
    env: { ...process.env, KB_PATH: TEST_DIR },
    encoding: 'utf-8',
  });
}

function createKBStructure() {
  var dirs = [
    'raw/articles', 'raw/papers', 'raw/docs', 'raw/repos', 'raw/sessions',
    'wiki', '_search',
  ];
  for (var i = 0; i < dirs.length; i++) {
    fs.mkdirSync(path.join(TEST_DIR, dirs[i]), { recursive: true });
  }

  // Create manifest
  fs.writeFileSync(path.join(TEST_DIR, 'raw/_manifest.md'), [
    '# Raw Source Manifest',
    '',
    '| Source | Date | Type | Raw File | Status | Wiki Article |',
    '|--------|------|------|----------|--------|--------------|',
  ].join('\n'));

  // Create empty index files
  fs.writeFileSync(path.join(TEST_DIR, 'wiki/_index.md'), '# Wiki Index\n');
  fs.writeFileSync(path.join(TEST_DIR, 'wiki/_tags.md'), '# Tag Registry\n');
}

function simulateIngest() {
  // Simulate raw source
  fs.writeFileSync(path.join(TEST_DIR, 'raw/articles/2026-04-05-react-server-components.md'), [
    '---',
    'source: https://example.com/rsc-guide',
    'ingested: 2026-04-05',
    'type: article',
    '---',
    '',
    '# Understanding React Server Components',
    '',
    'React Server Components allow rendering on the server without sending JavaScript to the client...',
  ].join('\n'));

  // Simulate stub wiki article
  fs.writeFileSync(path.join(TEST_DIR, 'wiki/react-server-components.md'), [
    '---',
    'title: React Server Components',
    'type: concept',
    'tags: [react, server-components, performance, ssr]',
    'sources:',
    '  - raw/articles/2026-04-05-react-server-components.md',
    'related: []',
    'created: 2026-04-05',
    'updated: 2026-04-05',
    'status: stub',
    '---',
    '',
    '# React Server Components',
    '',
    'Server-side rendering approach that eliminates client JavaScript for server components.',
    '',
    '## Key Takeaways',
    '',
    '- Reduces client bundle size',
    '- Server components cannot use hooks or browser APIs',
  ].join('\n'));

  // Simulate feature article
  fs.writeFileSync(path.join(TEST_DIR, 'wiki/dashboard-feature.md'), [
    '---',
    'title: "Feature: Dashboard"',
    'type: feature',
    'tags: [feature, dashboard, react]',
    'sources: []',
    'related:',
    '  - react-server-components.md',
    'created: 2026-04-05',
    'updated: 2026-04-05',
    'status: compiled',
    '---',
    '',
    '# Feature: Dashboard',
    '',
    'Main dashboard using React Server Components for fast initial load.',
    '',
    '## GitHub Issues',
    '',
    '- #42 — feat: build dashboard layout (status: open)',
    '',
    '## Key Takeaways',
    '',
    '- Uses RSC for performance',
  ].join('\n'));
}

function runTests() {
  var passed = 0;
  var failed = 0;

  function assert(name, condition) {
    if (condition) {
      console.log('  PASS: ' + name);
      passed++;
    } else {
      console.log('  FAIL: ' + name);
      failed++;
    }
  }

  createKBStructure();
  simulateIngest();

  // Test: build index over simulated KB
  console.log('E2E: index build');
  run(['index']);
  var indexPath = path.join(TEST_DIR, '_search/index.json');
  assert('index.json exists', fs.existsSync(indexPath));
  var index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
  assert('index has 2 articles', index.documents.length === 2);

  // Test: search finds concept by content
  console.log('E2E: concept search');
  var conceptResults = JSON.parse(run(['search', 'server components rendering']));
  assert('finds react-server-components article', conceptResults.results.some(function(r) {
    return r.file.includes('react-server-components');
  }));

  // Test: search finds feature by issue number
  console.log('E2E: feature search');
  var featureResults = JSON.parse(run(['search', '#42 dashboard']));
  assert('finds dashboard feature', featureResults.results.some(function(r) {
    return r.file.includes('dashboard-feature');
  }));

  // Test: type filter works
  console.log('E2E: type filter');
  var featureOnly = JSON.parse(run(['search', 'react', '--type=feature']));
  assert('type filter returns only features', featureOnly.results.every(function(r) {
    return r.type === 'feature';
  }));

  // Test: tag filter works
  console.log('E2E: tag filter');
  var tagResults = JSON.parse(run(['search', 'components', '--tag=performance']));
  assert('tag filter returns articles with tag', tagResults.results.every(function(r) {
    return r.tags.includes('performance');
  }));

  // Test: stats work
  console.log('E2E: stats');
  var statsOutput = run(['stats']);
  assert('stats shows 2 articles', statsOutput.includes('Total articles: 2'));
  assert('stats shows concept type', statsOutput.includes('concept:'));
  assert('stats shows feature type', statsOutput.includes('feature:'));

  // Cleanup
  fs.rmSync(TEST_DIR, { recursive: true, force: true });

  console.log('\n' + passed + ' passed, ' + failed + ' failed');
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
```

- [ ] **Step 2: Run the integration test**

Run: `node cli/kb-integration.test.js`
Expected: All tests PASS

- [ ] **Step 3: Commit**

```bash
git add cli/kb-integration.test.js
git commit -m "test: add end-to-end integration test for KB search workflow"
```

---

### Task 13: Update package.json

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Read current package.json**

Read `package.json` to see current scripts and version.

- [ ] **Step 2: Add KB scripts and bump version**

Add to the `scripts` section:

```json
"kb:search": "node cli/kb-search.js search",
"kb:index": "node cli/kb-search.js index",
"kb:stats": "node cli/kb-search.js stats",
"test:kb": "node cli/kb-search.test.js && node cli/kb-integration.test.js"
```

Bump version from `0.2.0` to `0.3.0` (minor version bump for new feature).

- [ ] **Step 3: Commit**

```bash
git add package.json
git commit -m "feat: add KB scripts to package.json, bump to 0.3.0"
```
