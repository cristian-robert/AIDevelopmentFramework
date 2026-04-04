#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

// ─── Config ───────────────────────────────────────────────────────────────────

const KB_PATH = process.env.KB_PATH || '.obsidian';
const WIKI_DIR = path.join(KB_PATH, 'wiki');
const SEARCH_DIR = path.join(KB_PATH, '_search');
const INDEX_FILE = path.join(SEARCH_DIR, 'index.json');

// ─── Frontmatter parser ───────────────────────────────────────────────────────

function parseFrontmatter(content) {
  const meta = {};
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return { meta, body: content };

  const body = content.slice(match[0].length).trim();
  const lines = match[1].split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const kv = line.match(/^(\w[\w-]*):\s*(.*)$/);
    if (!kv) { i++; continue; }

    const key = kv[1];
    const raw = kv[2].trim();

    if (raw.startsWith('[')) {
      // Inline array: [a, b, c]
      const inner = raw.replace(/^\[|\]$/g, '');
      meta[key] = inner ? inner.split(',').map((s) => s.trim()).filter(Boolean) : [];
      i++;
    } else if (raw === '') {
      // Multi-line list
      const items = [];
      i++;
      while (i < lines.length && lines[i].match(/^\s+-\s+/)) {
        items.push(lines[i].replace(/^\s+-\s+/, '').trim());
        i++;
      }
      meta[key] = items;
    } else {
      meta[key] = raw;
      i++;
    }
  }

  return { meta, body };
}

// ─── Tokenizer ────────────────────────────────────────────────────────────────

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

// ─── TF-IDF builder ───────────────────────────────────────────────────────────

function buildDoc(file, content) {
  const { meta, body } = parseFrontmatter(content);

  const titleTokens = tokenize(meta.title || '');
  const tagTokens = (meta.tags || []).flatMap(tokenize);
  const bodyTokens = tokenize(body);

  // Weighted token frequency: title x3, tags x2, body x1
  const tf = {};
  for (const t of titleTokens) tf[t] = (tf[t] || 0) + 3;
  for (const t of tagTokens)   tf[t] = (tf[t] || 0) + 2;
  for (const t of bodyTokens)  tf[t] = (tf[t] || 0) + 1;

  const excerpt = body
    .replace(/^#+\s+.*/gm, '')   // strip headings
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 200);

  return {
    file,
    title: meta.title || file,
    type: meta.type || '',
    tags: meta.tags || [],
    status: meta.status || '',
    related: meta.related || [],
    excerpt,
    tf,
  };
}

// ─── Index operations ─────────────────────────────────────────────────────────

function buildIndex() {
  if (!fs.existsSync(WIKI_DIR)) {
    console.error(`Wiki directory not found: ${WIKI_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(WIKI_DIR).filter(
    (f) => f.endsWith('.md') && !f.startsWith('_')
  );

  const docs = files.map((file) => {
    const content = fs.readFileSync(path.join(WIKI_DIR, file), 'utf-8');
    return buildDoc(file, content);
  });

  // Compute IDF: log(N / df) for each term
  const N = docs.length;
  const df = {};
  for (const doc of docs) {
    for (const term of Object.keys(doc.tf)) {
      df[term] = (df[term] || 0) + 1;
    }
  }
  const idf = {};
  for (const [term, count] of Object.entries(df)) {
    idf[term] = Math.log((N + 1) / (count + 1)) + 1;
  }

  const index = { built: new Date().toISOString(), docs, idf };

  fs.mkdirSync(SEARCH_DIR, { recursive: true });
  fs.writeFileSync(INDEX_FILE, JSON.stringify(index, null, 2));
  return index;
}

function loadIndex() {
  // Auto-rebuild if index is missing or stale
  if (fs.existsSync(INDEX_FILE) && fs.existsSync(WIKI_DIR)) {
    const indexMtime = fs.statSync(INDEX_FILE).mtimeMs;
    const wikiFiles = fs.readdirSync(WIKI_DIR).filter(
      (f) => f.endsWith('.md') && !f.startsWith('_')
    );
    const anyNewer = wikiFiles.some(
      (f) => fs.statSync(path.join(WIKI_DIR, f)).mtimeMs > indexMtime
    );
    if (anyNewer) return buildIndex();
    return JSON.parse(fs.readFileSync(INDEX_FILE, 'utf-8'));
  }
  return buildIndex();
}

// ─── Search ───────────────────────────────────────────────────────────────────

function search(query, opts = {}) {
  const index = loadIndex();
  const queryTerms = tokenize(query);

  if (queryTerms.length === 0) {
    return { query, results: [], total: 0 };
  }

  const scored = index.docs
    .filter((doc) => {
      if (opts.type && doc.type !== opts.type) return false;
      if (opts.tag && !doc.tags.includes(opts.tag)) return false;
      return true;
    })
    .map((doc) => {
      let score = 0;
      for (const term of queryTerms) {
        const tf = doc.tf[term] || 0;
        const idf = index.idf[term] || 0;
        score += tf * idf;
      }
      return { ...doc, score };
    })
    .filter((doc) => doc.score > 0)
    .sort((a, b) => b.score - a.score);

  // Strip internal tf field from output
  const results = scored.map(({ tf: _tf, ...rest }) => rest);

  return { query, results, total: results.length };
}

// ─── Stats ────────────────────────────────────────────────────────────────────

function stats() {
  const index = loadIndex();
  const docs = index.docs;

  const byType = {};
  const byStatus = {};
  const tagCount = {};

  for (const doc of docs) {
    byType[doc.type || 'unknown'] = (byType[doc.type || 'unknown'] || 0) + 1;
    byStatus[doc.status || 'unknown'] = (byStatus[doc.status || 'unknown'] || 0) + 1;
    for (const tag of doc.tags) {
      tagCount[tag] = (tagCount[tag] || 0) + 1;
    }
  }

  const topTags = Object.entries(tagCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);

  const lines = [
    `Total articles: ${docs.length}`,
    '',
    'By type:',
    ...Object.entries(byType)
      .sort((a, b) => b[1] - a[1])
      .map(([t, n]) => `  ${t}: ${n}`),
    '',
    'By status:',
    ...Object.entries(byStatus)
      .sort((a, b) => b[1] - a[1])
      .map(([s, n]) => `  ${s}: ${n}`),
    '',
    'Top tags:',
    ...topTags.map(([tag, n]) => `  ${tag}: ${n}`),
  ];

  console.log(lines.join('\n'));
}

// ─── CLI entry ────────────────────────────────────────────────────────────────

const [, , command, ...rest] = process.argv;

switch (command) {
  case 'index': {
    const idx = buildIndex();
    console.log(`Indexed ${idx.docs.length} articles → ${INDEX_FILE}`);
    break;
  }

  case 'search': {
    const query = rest.find((a) => !a.startsWith('--')) || '';
    const typeArg = rest.find((a) => a.startsWith('--type='));
    const tagArg  = rest.find((a) => a.startsWith('--tag='));
    const opts = {};
    if (typeArg) opts.type = typeArg.split('=')[1];
    if (tagArg)  opts.tag  = tagArg.split('=')[1];

    const result = search(query, opts);
    console.log(JSON.stringify(result, null, 2));
    break;
  }

  case 'stats': {
    stats();
    break;
  }

  default: {
    console.error(
      'Usage: kb-search <index|search|stats> [query] [--type=X] [--tag=X]'
    );
    process.exit(1);
  }
}
