#!/usr/bin/env node
'use strict';

// cli/kb-indexes.test.js
//
// Two-index invariant: a single `kb-search.js index` run MUST rebuild both
// the TF-IDF index (_search/index.json) and the lean index
// (_search/lean-index.json) atomically. Their `built`/`generated` timestamps
// must agree to within a few seconds. This guards Finding 2: previously the
// docs told the agent to rebuild only the TF-IDF index after a wiki write,
// which let /prime serve stale lean summaries while /kb search returned
// fresh results.

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');
const assert = require('assert');

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'kb-indexes-'));

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log('  PASS  ' + name);
    passed++;
  } catch (e) {
    console.error('  FAIL  ' + name);
    console.error('        ' + e.message);
    failed++;
    process.exitCode = 1;
  }
}

console.log('\nkb-indexes (two-index invariant) tests\n');

test('kb-search index rebuilds both TF-IDF and lean indexes atomically', () => {
  const kbPath = path.join(TMP, 'kb');
  fs.mkdirSync(path.join(kbPath, 'wiki'), { recursive: true });
  fs.writeFileSync(
    path.join(kbPath, 'wiki', 'a.md'),
    '---\ntitle: A\ntags: [x]\n---\nFirst sentence here. Second sentence.'
  );
  fs.writeFileSync(
    path.join(kbPath, 'wiki', 'b.md'),
    '---\ntitle: B\ntags: [y]\n---\nB body content.'
  );

  execFileSync('node', [path.join(__dirname, 'kb-search.js'), 'index'], {
    env: { ...process.env, KB_PATH: kbPath },
    encoding: 'utf-8',
  });

  const tfIdx = path.join(kbPath, '_search', 'index.json');
  const leanIdx = path.join(kbPath, '_search', 'lean-index.json');

  assert.ok(fs.existsSync(tfIdx), 'TF-IDF index.json must exist after build');
  assert.ok(fs.existsSync(leanIdx), 'lean-index.json must exist after build');

  const tf = JSON.parse(fs.readFileSync(tfIdx, 'utf-8'));
  const lean = JSON.parse(fs.readFileSync(leanIdx, 'utf-8'));

  assert.ok(tf.built, 'TF-IDF index must have a built timestamp');
  assert.ok(lean.generated, 'lean index must have a generated timestamp');

  const tfTime = Date.parse(tf.built);
  const leanTime = Date.parse(lean.generated);
  const skew = Math.abs(tfTime - leanTime);
  assert.ok(
    skew <= 5000,
    'TF-IDF and lean timestamps must be within 5s of each other (got skew=' + skew + 'ms)'
  );

  // Both indexes must cover the same set of files (excluding _-prefixed).
  const tfFiles = new Set(tf.docs.map((d) => d.file));
  const leanFiles = new Set(lean.docs.map((d) => d.file));
  assert.deepStrictEqual(
    [...tfFiles].sort(),
    [...leanFiles].sort(),
    'TF-IDF and lean must cover the same set of files'
  );
  assert.strictEqual(tfFiles.size, 2, 'expected 2 articles');
});

test('a follow-up wiki write + index rebuild updates both files together', () => {
  const kbPath = path.join(TMP, 'kb');
  // Add a third article and rebuild
  fs.writeFileSync(
    path.join(kbPath, 'wiki', 'c.md'),
    '---\ntitle: C\ntags: [z]\n---\nC body.'
  );

  execFileSync('node', [path.join(__dirname, 'kb-search.js'), 'index'], {
    env: { ...process.env, KB_PATH: kbPath },
    encoding: 'utf-8',
  });

  const tf = JSON.parse(
    fs.readFileSync(path.join(kbPath, '_search', 'index.json'), 'utf-8')
  );
  const lean = JSON.parse(
    fs.readFileSync(path.join(kbPath, '_search', 'lean-index.json'), 'utf-8')
  );

  assert.strictEqual(tf.docs.length, 3, 'TF-IDF must reflect new article');
  assert.strictEqual(lean.docs.length, 3, 'lean must reflect new article');
});

// Cleanup
try {
  fs.rmSync(TMP, { recursive: true, force: true });
} catch (_) {}

console.log('\n' + passed + ' passed, ' + failed + ' failed\n');
process.exit(failed > 0 ? 1 : 0);
