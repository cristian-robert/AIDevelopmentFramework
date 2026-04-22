#!/usr/bin/env node
'use strict';

// cli/cli-hardening.test.js
//
// Regression tests for CLI P0 bugs:
//  - symlink traversal in backupAndCopy
//  - non-atomic index.json writes
//  - corrupted index.json recovery
//  - tmpDir collisions from Date.now()

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');
const assert = require('assert');

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'cli-hardening-'));

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

console.log('\ncli hardening tests\n');

test('backupAndCopy does not follow symlinked directories', () => {
  const src = path.join(TMP, 'src');
  const dest = path.join(TMP, 'dest');
  const outside = path.join(TMP, 'outside');
  fs.mkdirSync(src, { recursive: true });
  fs.mkdirSync(outside, { recursive: true });
  fs.writeFileSync(path.join(outside, 'secret.txt'), 'SECRET');
  // Include a normal file inside src to verify normal operation still works
  fs.writeFileSync(path.join(src, 'normal.txt'), 'NORMAL');
  fs.symlinkSync(outside, path.join(src, 'link-to-outside'), 'dir');

  // Clear require cache so a fresh init.js load picks up exports
  delete require.cache[require.resolve('./init.js')];
  const { backupAndCopy } = require('./init.js');

  backupAndCopy(src, dest, dest);

  assert.ok(
    !fs.existsSync(path.join(dest, 'link-to-outside', 'secret.txt')),
    'symlink should not be traversed'
  );
  assert.ok(
    fs.existsSync(path.join(dest, 'normal.txt')),
    'regular files should still be copied'
  );
});

test('kb-search index is atomically written (no lingering .tmp)', () => {
  const kbPath = path.join(TMP, 'kb');
  fs.mkdirSync(path.join(kbPath, 'wiki'), { recursive: true });
  fs.writeFileSync(
    path.join(kbPath, 'wiki', 'a.md'),
    '---\ntitle: A\ntags: [x]\n---\nbody text here'
  );

  execFileSync('node', [path.join(__dirname, 'kb-search.js'), 'index'], {
    env: { ...process.env, KB_PATH: kbPath },
    encoding: 'utf-8',
  });

  assert.ok(
    !fs.existsSync(path.join(kbPath, '_search', 'index.json.tmp')),
    'tmp file should not linger after build'
  );
  assert.ok(
    fs.existsSync(path.join(kbPath, '_search', 'index.json')),
    'index.json should exist after build'
  );
});

test('corrupted index.json is deleted and rebuilt', () => {
  const kbPath = path.join(TMP, 'kb');
  const idxPath = path.join(kbPath, '_search', 'index.json');
  // Corrupt the index with truncated JSON
  fs.writeFileSync(idxPath, '{"broken":');

  execFileSync('node', [path.join(__dirname, 'kb-search.js'), 'search', 'body'], {
    env: { ...process.env, KB_PATH: kbPath },
    encoding: 'utf-8',
  });

  const raw = fs.readFileSync(idxPath, 'utf-8');
  const result = JSON.parse(raw); // must not throw
  assert.ok(result.docs, 'index rebuilt after corruption (has docs field)');
});

test('tmpDir does not collide across runs', () => {
  delete require.cache[require.resolve('./init.js')];
  const initMod = require('./init.js');
  assert.ok(
    typeof initMod.__test_tmpPath === 'function',
    '__test_tmpPath must be exported'
  );
  const p1 = initMod.__test_tmpPath();
  const p2 = initMod.__test_tmpPath();
  assert.notStrictEqual(p1, p2, 'tmp paths must differ across calls');
});

test('init.js and update.js export main() function', () => {
  delete require.cache[require.resolve('./init.js')];
  delete require.cache[require.resolve('./update.js')];
  const initMod = require('./init.js');
  const updateMod = require('./update.js');
  assert.strictEqual(
    typeof initMod.main,
    'function',
    'init.js must export main() — cli/index.js depends on it'
  );
  assert.strictEqual(
    typeof updateMod.main,
    'function',
    'update.js must export main() — cli/index.js depends on it'
  );
});

test('copyClaudeMdWithBackup restores original on copy failure (fresh backup)', () => {
  const dir = path.join(TMP, 'claude-md-rollback-fresh');
  fs.mkdirSync(dir, { recursive: true });
  const sourcePath = path.join(dir, 'source.md');
  const destPath = path.join(dir, 'CLAUDE.md');
  const backupPath = destPath + '.backup';

  fs.writeFileSync(sourcePath, 'NEW CONTENT');
  fs.writeFileSync(destPath, 'ORIGINAL USER CONTENT');

  delete require.cache[require.resolve('./claude-md-copy.js')];
  const { copyClaudeMdWithBackup } = require('./claude-md-copy.js');

  // Stub fs.copyFileSync to succeed on backup (dest->backup) but fail on
  // the source->dest copy (the second call).
  const realCopy = fs.copyFileSync;
  let callCount = 0;
  fs.copyFileSync = function (src, dst) {
    callCount++;
    if (callCount === 2) {
      throw new Error('simulated copy failure');
    }
    return realCopy(src, dst);
  };

  let threw = null;
  try {
    copyClaudeMdWithBackup(sourcePath, destPath);
  } catch (e) {
    threw = e;
  } finally {
    fs.copyFileSync = realCopy;
  }

  assert.ok(threw, 'helper must rethrow the copy error');
  assert.strictEqual(threw.message, 'simulated copy failure');
  assert.strictEqual(
    fs.readFileSync(destPath, 'utf-8'),
    'ORIGINAL USER CONTENT',
    'original CLAUDE.md must be restored after failure'
  );
  assert.ok(
    !fs.existsSync(backupPath),
    'fresh backup must be cleaned up after rollback'
  );
});

test('copyClaudeMdWithBackup preserves pre-existing backup on failure', () => {
  const dir = path.join(TMP, 'claude-md-rollback-preexisting');
  fs.mkdirSync(dir, { recursive: true });
  const sourcePath = path.join(dir, 'source.md');
  const destPath = path.join(dir, 'CLAUDE.md');
  const backupPath = destPath + '.backup';

  fs.writeFileSync(sourcePath, 'NEW CONTENT');
  fs.writeFileSync(destPath, 'ORIGINAL USER CONTENT');
  fs.writeFileSync(backupPath, 'PRE-EXISTING USER BACKUP');

  delete require.cache[require.resolve('./claude-md-copy.js')];
  const { copyClaudeMdWithBackup } = require('./claude-md-copy.js');

  // Stub fs.copyFileSync to fail on the very first call (no fresh backup
  // was needed, since one already exists — the only copy is source->dest).
  const realCopy = fs.copyFileSync;
  fs.copyFileSync = function () {
    throw new Error('simulated copy failure');
  };

  let threw = null;
  try {
    copyClaudeMdWithBackup(sourcePath, destPath);
  } catch (e) {
    threw = e;
  } finally {
    fs.copyFileSync = realCopy;
  }

  assert.ok(threw, 'helper must rethrow the copy error');
  assert.strictEqual(
    fs.readFileSync(backupPath, 'utf-8'),
    'PRE-EXISTING USER BACKUP',
    'pre-existing backup must NOT be destroyed by a failed run'
  );
});

// ─── Task 2: flag validation, --limit, --help ────────────────────────────────

test('empty query exits non-zero with error message', () => {
  const kbPath = path.join(TMP, 'kb-empty-query');
  fs.mkdirSync(path.join(kbPath, 'wiki'), { recursive: true });
  fs.writeFileSync(
    path.join(kbPath, 'wiki', 'a.md'),
    '---\ntitle: A\ntags: [x]\n---\nbody text here'
  );

  let status = 0;
  let stderr = '';
  try {
    execFileSync('node', [path.join(__dirname, 'kb-search.js'), 'search', ''], {
      env: { ...process.env, KB_PATH: kbPath },
      stdio: 'pipe',
    });
    throw new Error('should have exited non-zero');
  } catch (e) {
    status = e.status;
    stderr = (e.stderr && e.stderr.toString()) || '';
  }
  assert.ok(status !== 0, 'empty query must exit non-zero');
  assert.ok(/empty query/i.test(stderr), 'stderr must mention empty query, got: ' + stderr);
});

test('--type= empty value is rejected', () => {
  const kbPath = path.join(TMP, 'kb-empty-type');
  fs.mkdirSync(path.join(kbPath, 'wiki'), { recursive: true });
  fs.writeFileSync(
    path.join(kbPath, 'wiki', 'a.md'),
    '---\ntitle: A\ntags: [x]\n---\nbody text here'
  );

  let status = 0;
  try {
    execFileSync(
      'node',
      [path.join(__dirname, 'kb-search.js'), 'search', 'foo', '--type='],
      { env: { ...process.env, KB_PATH: kbPath }, stdio: 'pipe' }
    );
    throw new Error('should have exited non-zero');
  } catch (e) {
    status = e.status;
  }
  assert.ok(status !== 0, '--type= with empty value must exit non-zero');
});

test('--tag= empty value is rejected', () => {
  const kbPath = path.join(TMP, 'kb-empty-tag');
  fs.mkdirSync(path.join(kbPath, 'wiki'), { recursive: true });
  fs.writeFileSync(
    path.join(kbPath, 'wiki', 'a.md'),
    '---\ntitle: A\ntags: [x]\n---\nbody text here'
  );

  let status = 0;
  try {
    execFileSync(
      'node',
      [path.join(__dirname, 'kb-search.js'), 'search', 'foo', '--tag='],
      { env: { ...process.env, KB_PATH: kbPath }, stdio: 'pipe' }
    );
    throw new Error('should have exited non-zero');
  } catch (e) {
    status = e.status;
  }
  assert.ok(status !== 0, '--tag= with empty value must exit non-zero');
});

test('--limit=N limits results', () => {
  const kbPath = path.join(TMP, 'kb-limit');
  const wiki = path.join(kbPath, 'wiki');
  fs.mkdirSync(wiki, { recursive: true });
  // Seed 10 articles that all contain the word "alpha" so the search returns them all.
  for (let i = 0; i < 10; i++) {
    fs.writeFileSync(
      path.join(wiki, 'doc-' + i + '.md'),
      '---\ntitle: Doc ' + i + '\ntags: [x]\n---\nalpha beta body ' + i
    );
  }

  const out = execFileSync(
    'node',
    [path.join(__dirname, 'kb-search.js'), 'search', 'alpha', '--limit=3'],
    { env: { ...process.env, KB_PATH: kbPath }, encoding: 'utf-8' }
  );
  const res = JSON.parse(out);
  assert.strictEqual(res.results.length, 3, 'results length must equal --limit');
  assert.strictEqual(res.total, 10, 'total must reflect full match count, not the limit');
});

test('--limit=0 is rejected', () => {
  const kbPath = path.join(TMP, 'kb-limit-zero');
  fs.mkdirSync(path.join(kbPath, 'wiki'), { recursive: true });
  fs.writeFileSync(
    path.join(kbPath, 'wiki', 'a.md'),
    '---\ntitle: A\ntags: [x]\n---\nalpha body'
  );

  let status = 0;
  try {
    execFileSync(
      'node',
      [path.join(__dirname, 'kb-search.js'), 'search', 'alpha', '--limit=0'],
      { env: { ...process.env, KB_PATH: kbPath }, stdio: 'pipe' }
    );
    throw new Error('should have exited non-zero');
  } catch (e) {
    status = e.status;
  }
  assert.ok(status !== 0, '--limit=0 must exit non-zero');
});

test('--help prints usage', () => {
  const out = execFileSync(
    'node',
    [path.join(__dirname, 'kb-search.js'), '--help'],
    { encoding: 'utf-8' }
  );
  assert.ok(out.includes('Usage:'), 'help output must include "Usage:"');
  assert.ok(out.includes('search'), 'help output must mention the search command');
  assert.ok(out.includes('--limit'), 'help output must document --limit');
});

// Cleanup
try {
  fs.rmSync(TMP, { recursive: true, force: true });
} catch (_) {}

console.log('\n' + passed + ' passed, ' + failed + ' failed\n');
process.exit(failed > 0 ? 1 : 0);
