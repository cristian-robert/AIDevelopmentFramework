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

// Cleanup
try {
  fs.rmSync(TMP, { recursive: true, force: true });
} catch (_) {}

console.log('\n' + passed + ' passed, ' + failed + ' failed\n');
process.exit(failed > 0 ? 1 : 0);
