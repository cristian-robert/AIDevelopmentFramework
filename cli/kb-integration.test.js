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

// ─── Fixtures ────────────────────────────────────────────────────────────────

function setup() {
  TEST_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'kb-integration-test-'));

  // Full KB directory structure
  fs.mkdirSync(path.join(TEST_DIR, 'raw', 'articles'),  { recursive: true });
  fs.mkdirSync(path.join(TEST_DIR, 'raw', 'papers'),    { recursive: true });
  fs.mkdirSync(path.join(TEST_DIR, 'raw', 'docs'),      { recursive: true });
  fs.mkdirSync(path.join(TEST_DIR, 'raw', 'repos'),     { recursive: true });
  fs.mkdirSync(path.join(TEST_DIR, 'raw', 'sessions'),  { recursive: true });
  fs.mkdirSync(path.join(TEST_DIR, 'wiki'),             { recursive: true });
  fs.mkdirSync(path.join(TEST_DIR, '_search'),          { recursive: true });

  // Empty manifest table
  fs.writeFileSync(
    path.join(TEST_DIR, 'raw', '_manifest.md'),
    `# Raw Source Manifest

| slug | source | ingested | type | status |
|------|--------|----------|------|--------|
`
  );

  // Wiki meta files (should be excluded from indexing)
  fs.writeFileSync(
    path.join(TEST_DIR, 'wiki', '_index.md'),
    `---
title: Wiki Index
type: meta
tags: []
---

# Wiki Index

Master index of all knowledge base articles.
`
  );

  fs.writeFileSync(
    path.join(TEST_DIR, 'wiki', '_tags.md'),
    `---
title: Tag Registry
type: meta
tags: []
---

# Tag Registry

All tags and their article counts.
`
  );

  // Raw article: ingested source material
  fs.writeFileSync(
    path.join(TEST_DIR, 'raw', 'articles', '2026-04-05-react-server-components.md'),
    `---
source: https://react.dev/reference/rsc/server-components
ingested: 2026-04-05
type: article
---

# React Server Components

React Server Components (RSC) allow you to write UI that is rendered on
the server. Server Components can fetch data directly, reducing client
bundle size and improving performance. They run exclusively on the server
and are never sent to the client. This enables server-side rendering (SSR)
of React components without requiring a full page reload.
`
  );

  // Wiki stub: concept article for React Server Components
  fs.writeFileSync(
    path.join(TEST_DIR, 'wiki', 'react-server-components.md'),
    `---
title: React Server Components
type: concept
tags: [react, server-components, performance, ssr]
sources: [https://react.dev/reference/rsc/server-components]
related: [dashboard-feature]
created: 2026-04-05
updated: 2026-04-05
status: stub
---

# React Server Components

React Server Components allow rendering UI on the server, reducing
client bundle size and improving performance. They execute during
server-side rendering and stream results to the client.
`
  );

  // Wiki compiled article: feature with GitHub issue reference
  fs.writeFileSync(
    path.join(TEST_DIR, 'wiki', 'dashboard-feature.md'),
    `---
title: Dashboard Feature
type: feature
tags: [feature, dashboard, react]
sources: []
related: [react-server-components]
created: 2026-04-05
updated: 2026-04-05
status: compiled
---

# Dashboard Feature

The dashboard provides a unified view of project metrics and activity.
It uses React components to render data-driven widgets and charts.

## GitHub Issues

- Implements #42 — Build dashboard layout
- Depends on #38 — Data API endpoints

## Implementation Notes

The dashboard is implemented using React components with server-side
data fetching. Each widget is a self-contained component.
`
  );
}

function cleanup() {
  if (TEST_DIR && fs.existsSync(TEST_DIR)) {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
  }
}

// ─── Tests ───────────────────────────────────────────────────────────────────

function testIndexCreatesIndexJsonWith2Articles() {
  const name = 'index command creates index.json with 2 articles (excluding _index.md, _tags.md)';
  try {
    runCLI(['index']);

    const indexPath = path.join(TEST_DIR, '_search', 'index.json');
    assert(fs.existsSync(indexPath), 'index.json should exist');

    const index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
    assert(index.docs !== undefined, 'index should have docs field');
    assert(
      index.docs.length === 2,
      `expected 2 docs (excluding _ files), got ${index.docs.length}`
    );

    const files = index.docs.map((d) => d.file);
    assert(!files.includes('_index.md'), '_index.md should be excluded');
    assert(!files.includes('_tags.md'), '_tags.md should be excluded');

    pass(name);
  } catch (err) {
    fail(name, err);
  }
}

function testSearchServerComponents() {
  const name = 'search "server components rendering" finds react-server-components article';
  try {
    const output = runCLI(['search', 'server components rendering']);
    const result = JSON.parse(output);

    assert(result.query === 'server components rendering', 'query field should match');
    assert(Array.isArray(result.results), 'results should be an array');
    assert(result.results.length > 0, 'should return at least one result');

    const files = result.results.map((r) => r.file);
    assert(
      files.includes('wiki/react-server-components.md'),
      `react-server-components.md should appear in results, got: ${files.join(', ')}`
    );

    pass(name);
  } catch (err) {
    fail(name, err);
  }
}

function testSearchIssueAndDashboard() {
  const name = 'search "#42 dashboard" finds dashboard feature article';
  try {
    // The # will be stripped by tokenizer; "42" and "dashboard" are the effective terms
    const output = runCLI(['search', '#42 dashboard']);
    const result = JSON.parse(output);

    assert(Array.isArray(result.results), 'results should be an array');
    assert(result.results.length > 0, 'should return at least one result');

    const files = result.results.map((r) => r.file);
    assert(
      files.includes('wiki/dashboard-feature.md'),
      `dashboard-feature.md should appear in results, got: ${files.join(', ')}`
    );

    pass(name);
  } catch (err) {
    fail(name, err);
  }
}

function testSearchByTypeFeature() {
  const name = 'search "react" --type=feature returns only feature articles';
  try {
    const output = runCLI(['search', 'react', '--type=feature']);
    const result = JSON.parse(output);

    assert(Array.isArray(result.results), 'results should be an array');
    assert(result.results.length > 0, 'should return at least one result');

    for (const doc of result.results) {
      assert(
        doc.type === 'feature',
        `all results should have type=feature, got type=${doc.type} for ${doc.file}`
      );
    }

    // react-server-components is type=concept — must not appear
    const files = result.results.map((r) => r.file);
    assert(
      !files.includes('wiki/react-server-components.md'),
      'react-server-components.md (concept type) should be excluded'
    );

    pass(name);
  } catch (err) {
    fail(name, err);
  }
}

function testSearchByTagPerformance() {
  const name = 'search "components" --tag=performance returns only articles with performance tag';
  try {
    const output = runCLI(['search', 'components', '--tag=performance']);
    const result = JSON.parse(output);

    assert(Array.isArray(result.results), 'results should be an array');

    for (const doc of result.results) {
      assert(
        Array.isArray(doc.tags) && doc.tags.includes('performance'),
        `all results should have tag=performance, got tags=[${doc.tags}] for ${doc.file}`
      );
    }

    // dashboard-feature does not have the performance tag — must not appear
    const files = result.results.map((r) => r.file);
    assert(
      !files.includes('wiki/dashboard-feature.md'),
      'dashboard-feature.md (no performance tag) should be excluded'
    );

    pass(name);
  } catch (err) {
    fail(name, err);
  }
}

function testStatsShowsCorrectBreakdown() {
  const name = 'stats shows 2 articles with correct type breakdown';
  try {
    const output = runCLI(['stats']);

    assert(output.includes('2'), 'stats should mention 2 articles');
    assert(output.toLowerCase().includes('concept'), 'stats should show concept type');
    assert(output.toLowerCase().includes('feature'), 'stats should show feature type');

    pass(name);
  } catch (err) {
    fail(name, err);
  }
}

// ─── Runner ──────────────────────────────────────────────────────────────────

console.log('\nkb-integration tests\n');

setup();

try {
  testIndexCreatesIndexJsonWith2Articles();
  testSearchServerComponents();
  testSearchIssueAndDashboard();
  testSearchByTypeFeature();
  testSearchByTagPerformance();
  testStatsShowsCorrectBreakdown();
} finally {
  cleanup();
}

console.log('\nDone.\n');
