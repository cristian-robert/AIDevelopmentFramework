#!/usr/bin/env node
'use strict';

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const SEARCH_CLI = path.join(__dirname, 'kb-search.js');

// ─── Test helpers ────────────────────────────────────────────────────────────

let TEST_DIR;

function runCLI(args, env = {}) {
  return execFileSync('node', [SEARCH_CLI, ...args], {
    env: { ...process.env, KB_PATH: TEST_DIR, ...env },
    encoding: 'utf-8',
  });
}

function pass(name) {
  console.log(`  PASS  ${name}`);
}

function fail(name, err) {
  console.error(`  FAIL  ${name}`);
  console.error(`        ${err.message}`);
  process.exitCode = 1;
}

function assert(condition, message) {
  if (!condition) throw new Error(`Assertion failed: ${message}`);
}

// ─── Test fixtures ────────────────────────────────────────────────────────────

function setup() {
  TEST_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'kb-search-test-'));
  const wikiDir = path.join(TEST_DIR, 'wiki');
  fs.mkdirSync(wikiDir, { recursive: true });

  // Article 1: oauth2-patterns (feature type, auth+security tags)
  fs.writeFileSync(
    path.join(wikiDir, 'oauth2-patterns.md'),
    `---
title: OAuth2 Patterns and Token Refresh
type: feature
tags: [auth, security, oauth2]
sources: [https://oauth.net/2/]
related: [jwt-guide, session-management]
created: 2024-01-10
updated: 2024-03-15
status: active
---

# OAuth2 Patterns and Token Refresh

OAuth2 is an authorization framework. Token refresh is a mechanism to obtain
new access tokens without re-authenticating. Use refresh tokens to maintain
long-lived sessions securely. The authorization code flow is the recommended
approach for server-side applications.
`
  );

  // Article 2: jwt-guide (feature type, auth+security tags)
  fs.writeFileSync(
    path.join(wikiDir, 'jwt-guide.md'),
    `---
title: JWT Authentication Guide
type: feature
tags: [auth, security, jwt]
sources: [https://jwt.io]
related: [oauth2-patterns]
created: 2024-01-12
updated: 2024-02-20
status: active
---

# JWT Authentication Guide

JSON Web Tokens provide a compact, self-contained way to transmit information
between parties. Claims are encoded and digitally signed. Use short expiry
times for access tokens and rotate signing keys periodically.
`
  );

  // Article 3: database-indexing (architecture type, database tag)
  fs.writeFileSync(
    path.join(wikiDir, 'database-indexing.md'),
    `---
title: Database Indexing Strategies
type: architecture
tags: [database, performance, sql]
sources: [https://use-the-index-luke.com]
related: []
created: 2024-02-01
updated: 2024-03-01
status: active
---

# Database Indexing Strategies

Proper index design is critical for query performance. B-tree indexes work
well for equality and range queries. Composite indexes should be ordered by
selectivity. Avoid over-indexing as it degrades write performance.
See issue #5 for benchmark results.
`
  );

  // Special files that should be excluded from indexing
  fs.writeFileSync(
    path.join(wikiDir, '_index.md'),
    `---
title: Index
type: meta
tags: []
---
This is the wiki index file and should be excluded.
`
  );

  fs.writeFileSync(
    path.join(wikiDir, '_tags.md'),
    `---
title: Tags
type: meta
tags: []
---
This is the tags file and should be excluded.
`
  );
}

function cleanup() {
  if (TEST_DIR && fs.existsSync(TEST_DIR)) {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
  }
}

// ─── Tests ───────────────────────────────────────────────────────────────────

function testIndexCreatesIndexJson() {
  const name = 'index command creates index.json with correct doc count';
  try {
    runCLI(['index']);

    const indexPath = path.join(TEST_DIR, '_search', 'index.json');
    assert(fs.existsSync(indexPath), 'index.json should exist');

    const index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
    assert(index.docs !== undefined, 'index should have docs field');
    assert(
      index.docs.length === 3,
      `expected 3 docs (excluding _ files), got ${index.docs.length}`
    );

    // Verify _index.md and _tags.md are excluded
    const files = index.docs.map((d) => d.file);
    assert(!files.includes('_index.md'), '_index.md should be excluded');
    assert(!files.includes('_tags.md'), '_tags.md should be excluded');

    pass(name);
  } catch (err) {
    fail(name, err);
  }
}

function testSearchReturnsRelevantResults() {
  const name = 'search "oauth2 token refresh" returns results with oauth2-patterns as top hit';
  try {
    const output = runCLI(['search', 'oauth2 token refresh']);
    const result = JSON.parse(output);

    assert(result.query === 'oauth2 token refresh', 'query field should match');
    assert(Array.isArray(result.results), 'results should be an array');
    assert(result.results.length > 0, 'should return at least one result');
    assert(typeof result.total === 'number', 'total should be a number');

    const top = result.results[0];
    assert(top.file === 'wiki/oauth2-patterns.md', `top result should be wiki/oauth2-patterns.md, got ${top.file}`);
    assert(typeof top.score === 'number', 'score should be a number');
    assert(typeof top.title === 'string', 'title should be a string');
    assert(Array.isArray(top.tags), 'tags should be an array');
    assert(typeof top.excerpt === 'string', 'excerpt should be a string');
    assert(top.excerpt.length > 0, 'excerpt should not be empty');

    pass(name);
  } catch (err) {
    fail(name, err);
  }
}

function testSearchFilterByType() {
  const name = 'search "auth" --type=feature returns only type=feature results';
  try {
    const output = runCLI(['search', 'auth', '--type=feature']);
    const result = JSON.parse(output);

    assert(Array.isArray(result.results), 'results should be an array');
    assert(result.results.length > 0, 'should return results');

    // All results must be type=feature
    for (const doc of result.results) {
      assert(doc.type === 'feature', `all results should have type=feature, got type=${doc.type} for ${doc.file}`);
    }

    // database-indexing (architecture type) should NOT appear
    const files = result.results.map((r) => r.file);
    assert(
      !files.includes('wiki/database-indexing.md'),
      'wiki/database-indexing.md (architecture type) should be excluded'
    );

    pass(name);
  } catch (err) {
    fail(name, err);
  }
}

function testSearchFilterByTag() {
  const name = 'search "design" --tag=database returns only articles with database tag';
  try {
    const output = runCLI(['search', 'design', '--tag=database']);
    const result = JSON.parse(output);

    assert(Array.isArray(result.results), 'results should be an array');

    // All results must have the database tag
    for (const doc of result.results) {
      assert(
        Array.isArray(doc.tags) && doc.tags.includes('database'),
        `all results should have tag=database, got tags=[${doc.tags}] for ${doc.file}`
      );
    }

    // auth articles should NOT appear (they don't have database tag)
    const files = result.results.map((r) => r.file);
    assert(!files.includes('wiki/oauth2-patterns.md'), 'wiki/oauth2-patterns.md should be excluded (no database tag)');
    assert(!files.includes('wiki/jwt-guide.md'), 'wiki/jwt-guide.md should be excluded (no database tag)');

    pass(name);
  } catch (err) {
    fail(name, err);
  }
}

function testStatsOutput() {
  const name = 'stats shows total articles and type breakdown';
  try {
    const output = runCLI(['stats']);

    // Should mention 3 articles total
    assert(output.includes('3'), 'stats should mention 3 articles');

    // Should mention types
    assert(output.toLowerCase().includes('feature'), 'stats should show feature type');
    assert(output.toLowerCase().includes('architecture'), 'stats should show architecture type');

    pass(name);
  } catch (err) {
    fail(name, err);
  }
}

function testSearchGibberishReturnsEmpty() {
  const name = 'search for gibberish returns empty results';
  try {
    const output = runCLI(['search', 'xyzzy12345qqqnotaword']);
    const result = JSON.parse(output);

    assert(Array.isArray(result.results), 'results should be an array');
    assert(result.results.length === 0, `gibberish search should return 0 results, got ${result.results.length}`);
    assert(result.total === 0, `total should be 0, got ${result.total}`);

    pass(name);
  } catch (err) {
    fail(name, err);
  }
}

function testAutoRebuildIndex() {
  const name = 'index auto-rebuilds when wiki file is newer than index.json';
  try {
    // Run initial index
    runCLI(['index']);

    const indexPath = path.join(TEST_DIR, '_search', 'index.json');
    const statBefore = fs.statSync(indexPath);

    // Set index mtime to past
    const pastTime = new Date(Date.now() - 10000);
    fs.utimesSync(indexPath, pastTime, pastTime);

    // Touch a wiki file to make it newer than index
    const wikiFile = path.join(TEST_DIR, 'wiki', 'oauth2-patterns.md');
    const now = new Date();
    fs.utimesSync(wikiFile, now, now);

    // A search should auto-rebuild (index will be newer after search)
    runCLI(['search', 'oauth2']);

    const statAfter = fs.statSync(indexPath);
    assert(
      statAfter.mtimeMs > pastTime.getTime(),
      'index should have been rebuilt (mtime updated)'
    );

    pass(name);
  } catch (err) {
    fail(name, err);
  }
}

function testSingleDigitIssueSearch() {
  const name = 'search for single digit "5" finds article with issue #5 reference';
  try {
    const output = runCLI(['search', '5']);
    const result = JSON.parse(output);

    assert(Array.isArray(result.results), 'results should be an array');
    assert(result.results.length > 0, 'single-digit search should return at least one result');

    const files = result.results.map((r) => r.file);
    assert(
      files.includes('wiki/database-indexing.md'),
      `database-indexing.md (contains #5) should appear in results, got [${files}]`
    );

    pass(name);
  } catch (err) {
    fail(name, err);
  }
}

// ─── Runner ──────────────────────────────────────────────────────────────────

console.log('\nkb-search tests\n');

setup();

try {
  testIndexCreatesIndexJson();
  testSearchReturnsRelevantResults();
  testSearchFilterByType();
  testSearchFilterByTag();
  testStatsOutput();
  testSearchGibberishReturnsEmpty();
  testAutoRebuildIndex();
  testSingleDigitIssueSearch();
} finally {
  cleanup();
}

console.log('\nDone.\n');
