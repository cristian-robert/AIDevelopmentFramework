#!/usr/bin/env node
'use strict';

// Tests for cli/lean-index.js. Node's built-in assert is used instead of a
// test framework to keep the CLI dependency-free (mirrors kb-search.test.js).

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');

function pass(name) { console.log('  PASS  ' + name); }
function fail(name, err) {
  console.error('  FAIL  ' + name);
  console.error('        ' + (err && err.message ? err.message : err));
  process.exitCode = 1;
}

// ─── Test 1: basic metadata extraction ───────────────────────────────────────

(function testBasicMetadata() {
  const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'lean-'));
  process.env.KB_PATH = TMP;
  fs.mkdirSync(path.join(TMP, 'wiki'), { recursive: true });
  fs.writeFileSync(
    path.join(TMP, 'wiki', 'a.md'),
    '---\ntitle: Auth\ntype: feature\ntags: [auth, security]\n---\nAuthentication module for login/signup flows.'
  );

  // Purge cache so KB_PATH env change is picked up.
  delete require.cache[require.resolve('./lean-index.js')];
  const { buildLeanIndex } = require('./lean-index.js');
  const idx = buildLeanIndex();

  try {
    assert.strictEqual(idx.docs[0].title, 'Auth');
    assert.strictEqual(idx.docs[0].type, 'feature');
    assert.deepStrictEqual(idx.docs[0].tags, ['auth', 'security']);
    assert.ok(
      idx.docs[0].summary.length > 0 && idx.docs[0].summary.length < 200,
      'summary should be non-empty and under 200 chars, got ' + idx.docs[0].summary.length
    );
    assert.ok(!idx.docs[0].body, 'lean index must not contain full body');
    // Also verify the JSON on disk contains no body field.
    const written = JSON.parse(
      fs.readFileSync(path.join(TMP, '_search', 'lean-index.json'), 'utf-8')
    );
    assert.ok(!written.docs[0].body, 'persisted lean index must not contain full body');
    pass('basic metadata extraction');
  } catch (e) {
    fail('basic metadata extraction', e);
  } finally {
    fs.rmSync(TMP, { recursive: true, force: true });
  }
})();

// ─── Test 2: missing wiki directory handled gracefully ────────────────────────

(function testMissingWikiDir() {
  const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'lean-nowiki-'));
  process.env.KB_PATH = TMP;
  // Intentionally do NOT create wiki/ — exercises the graceful-empty path.

  delete require.cache[require.resolve('./lean-index.js')];
  const { buildLeanIndex } = require('./lean-index.js');
  try {
    const idx = buildLeanIndex();
    assert.deepStrictEqual(idx.docs, [], 'missing wiki/ should produce empty docs');
    assert.ok(typeof idx.generated === 'string', 'generated timestamp should be present');
    pass('missing wiki directory handled gracefully');
  } catch (e) {
    fail('missing wiki directory handled gracefully', e);
  } finally {
    fs.rmSync(TMP, { recursive: true, force: true });
  }
})();

// ─── Test 3: malformed YAML does not crash build ─────────────────────────────

(function testMalformedYaml() {
  const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'lean-bad-'));
  process.env.KB_PATH = TMP;
  fs.mkdirSync(path.join(TMP, 'wiki'), { recursive: true });

  // A valid article + a file with no frontmatter (treated as body-only —
  // not strictly malformed). The parser is lenient so the main thing we
  // want is: a single bad file cannot take down the whole index.
  fs.writeFileSync(
    path.join(TMP, 'wiki', 'good.md'),
    '---\ntitle: Good\ntype: feature\ntags: [ok]\n---\nA healthy article about things.'
  );
  fs.writeFileSync(
    path.join(TMP, 'wiki', 'nofrontmatter.md'),
    'Just a plain markdown file with no frontmatter at all.'
  );

  delete require.cache[require.resolve('./lean-index.js')];
  const { buildLeanIndex } = require('./lean-index.js');
  try {
    const idx = buildLeanIndex();
    assert.strictEqual(idx.docs.length, 2, 'both files should appear (no crash)');
    const good = idx.docs.find((d) => d.file === 'good.md');
    assert.ok(good, 'good article must be present');
    assert.strictEqual(good.title, 'Good');
    pass('malformed YAML does not crash build');
  } catch (e) {
    fail('malformed YAML does not crash build', e);
  } finally {
    fs.rmSync(TMP, { recursive: true, force: true });
  }
})();

// ─── Test 4: size cap — lean index is <5% of the full TF-IDF index ──────────
//
// GOTCHA enforcement: the lean index must never embed article bodies. A
// size-cap assertion is the easiest way to catch a regression (e.g., someone
// adds a `body` field or the summary extractor stops truncating). We seed
// enough articles with substantial body text to make the ratio meaningful.

(function testSizeCap() {
  const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'lean-size-'));
  process.env.KB_PATH = TMP;
  fs.mkdirSync(path.join(TMP, 'wiki'), { recursive: true });

  // Each article gets a unique, long body to give the TF-IDF index
  // substantive per-doc vocabulary. The first sentence is short so the lean
  // summary stays ~100 chars, while the bulk of the body inflates the full
  // index. Eight articles keeps the ratio meaningful without slowing the test.
  const articles = [
    { slug: 'auth-module', title: 'Auth Module', type: 'feature', tags: ['auth', 'security'],
      body: 'Handles authentication and session management.' },
    { slug: 'payment-flow', title: 'Payment Flow', type: 'feature', tags: ['payments', 'stripe'],
      body: 'Checkout flow for one-time and recurring payments.' },
    { slug: 'rate-limiting', title: 'Rate Limiting', type: 'pattern', tags: ['security', 'api'],
      body: 'Token-bucket rate limiting for public endpoints.' },
    { slug: 'caching-layer', title: 'Caching Layer', type: 'pattern', tags: ['performance'],
      body: 'Two-tier cache with edge and origin invalidation.' },
    { slug: 'audit-logging', title: 'Audit Logging', type: 'feature', tags: ['security', 'ops'],
      body: 'Structured event trail for privileged actions.' },
    { slug: 'search-index', title: 'Search Index', type: 'feature', tags: ['search', 'tf-idf'],
      body: 'TF-IDF index of wiki articles for fast retrieval.' },
    { slug: 'session-refresh', title: 'Session Refresh', type: 'pattern', tags: ['auth'],
      body: 'Sliding-window refresh with httpOnly cookies.' },
    { slug: 'migration-runner', title: 'Migration Runner', type: 'feature', tags: ['database'],
      body: 'Reversible up/down migrations with checksum lock.' },
  ];

  // Generate a unique ~2 KB filler for each article so the TF-IDF body
  // vocabulary differs between docs. Uniqueness prevents IDF collapse, which
  // would otherwise flatten the full index and inflate the ratio.
  function makeUniqueFiller(seed) {
    const chunks = [];
    // 200 unique tokens per article → ~2k unique terms across 8 articles.
    // Each token appears multiple times inside its own doc so the TF vector
    // carries real weight (not just 1s), which grows the full index payload.
    for (let n = 0; n < 200; n++) {
      chunks.push(
        `term${seed}_${n} concept${seed}_${n} approach${seed}_${n} ` +
        `pattern${seed}_${n} benchmark${seed}_${n} guideline${seed}_${n} ` +
        `constraint${seed}_${n} invariant${seed}_${n} observation${seed}_${n} ` +
        `rationale${seed}_${n} term${seed}_${n} concept${seed}_${n} ` +
        `approach${seed}_${n} pattern${seed}_${n}.`
      );
    }
    return chunks.join(' ');
  }

  articles.forEach((a, idx) => {
    const fm = [
      '---',
      `title: ${a.title}`,
      `type: ${a.type}`,
      `tags: [${a.tags.join(', ')}]`,
      '---',
    ].join('\n');
    const body = a.body + '\n\n' + makeUniqueFiller(idx);
    fs.writeFileSync(path.join(TMP, 'wiki', a.slug + '.md'), fm + '\n' + body);
  });

  delete require.cache[require.resolve('./lean-index.js')];
  delete require.cache[require.resolve('./kb-search.js')];
  const { buildLeanIndex } = require('./lean-index.js');
  const { buildIndex } = require('./kb-search.js');

  try {
    buildIndex();                // writes _search/index.json
    buildLeanIndex();            // writes _search/lean-index.json

    const fullPath = path.join(TMP, '_search', 'index.json');
    const leanPath = path.join(TMP, '_search', 'lean-index.json');
    const fullSize = fs.statSync(fullPath).size;
    const leanSize = fs.statSync(leanPath).size;

    assert.ok(fullSize > 0, 'full index should have non-zero size');
    assert.ok(leanSize > 0, 'lean index should have non-zero size');

    const ratio = leanSize / fullSize;
    assert.ok(
      ratio < 0.05,
      `lean index must be <5% of full index — got ratio=${ratio.toFixed(4)} (lean=${leanSize}B, full=${fullSize}B)`
    );

    // Extra: verify no document contains the filler text — proves no body
    // was smuggled in. The filler uses distinctive tokens (`term0_10`) that
    // will never appear in a title, tag, or first-sentence summary.
    const lean = JSON.parse(fs.readFileSync(leanPath, 'utf-8'));
    for (const doc of lean.docs) {
      const serialised = JSON.stringify(doc);
      assert.ok(
        !/term\d+_\d+/.test(serialised),
        `doc ${doc.file} must not contain filler/body content; found in serialisation`
      );
    }

    pass(`size cap: lean=${leanSize}B, full=${fullSize}B, ratio=${ratio.toFixed(4)}`);
  } catch (e) {
    fail('size cap: lean <5% of full', e);
  } finally {
    fs.rmSync(TMP, { recursive: true, force: true });
  }
})();

if (process.exitCode) {
  process.exit(process.exitCode);
}
console.log('All lean-index tests passed.');
