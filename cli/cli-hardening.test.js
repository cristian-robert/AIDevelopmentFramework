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

// ─── update.js teardown: no bare `rl` references after closeRl refactor ─────

test('update.js has no bare rl.close() (uses closeRl helper)', () => {
  const src = fs.readFileSync(path.join(__dirname, 'update.js'), 'utf-8');
  // Strip comments to avoid matching words in doc strings.
  const lines = src.split('\n');
  const bareRlLines = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Skip single-line comments.
    if (/^\s*\/\//.test(line)) continue;
    // Match standalone `rl` as an identifier (not `closeRl`, not `_rl`, not
    // inside words). Negative lookbehind not portable in old JS — use
    // boundary + explicit exclusions.
    const re = /(^|[^A-Za-z0-9_])rl(\.[A-Za-z_]|\b)/;
    const m = line.match(re);
    if (m) {
      // Confirm it's not closeRl/getRl/_rl by looking at what's immediately
      // before the match.
      const before = line.slice(0, m.index + (m[1] ? m[1].length : 0));
      if (/[A-Za-z0-9_]$/.test(before)) continue; // part of a longer ident
      bareRlLines.push((i + 1) + ': ' + line.trim());
    }
  }
  assert.deepStrictEqual(
    bareRlLines,
    [],
    'update.js must not reference bare `rl`; use closeRl() helper instead. Found: ' + bareRlLines.join(' | ')
  );
});

test('update.js requires cleanly without throwing (teardown path is safe)', () => {
  // End-to-end smoke: require the module, then invoke the finally-path helper
  // directly. closeRl() must exist and be callable with no readline opened.
  delete require.cache[require.resolve('./update.js')];
  const out = execFileSync('node', ['-e', "require('./cli/update.js');"], {
    cwd: path.join(__dirname, '..'),
    encoding: 'utf-8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  assert.strictEqual(
    out,
    '',
    'requiring update.js must not produce side-effect output, got: ' + out
  );
});

// ─── spec-reviewer marker lifecycle (Option B) ──────────────────────────────

test('spec-reviewer-marker.sh writes and clears the marker file', () => {
  const repoRoot = path.join(__dirname, '..');
  const marker = path.join(repoRoot, '.claude', '.last-impl-task');
  const helper = path.join(repoRoot, '.claude', 'hooks', 'spec-reviewer-marker.sh');

  // Ensure starting clean.
  try { fs.rmSync(marker, { force: true }); } catch (_) {}

  // write implementer
  execFileSync('bash', [helper, 'write', 'implementer'], { cwd: repoRoot });
  assert.ok(fs.existsSync(marker), 'marker should exist after write implementer');
  const impl = fs.readFileSync(marker, 'utf-8');
  assert.ok(/^implementer:\d+$/.test(impl), 'marker body must be implementer:<epoch>, got: ' + impl);

  // write reviewer (overwrites)
  execFileSync('bash', [helper, 'write', 'reviewer'], { cwd: repoRoot });
  const rev = fs.readFileSync(marker, 'utf-8');
  assert.ok(/^reviewer:\d+$/.test(rev), 'marker body must be reviewer:<epoch>, got: ' + rev);

  // clear
  execFileSync('bash', [helper, 'clear'], { cwd: repoRoot });
  assert.ok(!fs.existsSync(marker), 'marker must be removed after clear');

  // clear is a no-op when absent.
  execFileSync('bash', [helper, 'clear'], { cwd: repoRoot });
});

test('spec-reviewer-marker.sh rejects invalid actions with exit 2', () => {
  const repoRoot = path.join(__dirname, '..');
  const helper = path.join(repoRoot, '.claude', 'hooks', 'spec-reviewer-marker.sh');
  let status = 0;
  try {
    execFileSync('bash', [helper, 'write', 'garbage'], { cwd: repoRoot, stdio: 'pipe' });
  } catch (e) {
    status = e.status;
  }
  assert.strictEqual(status, 2, 'invalid write arg must exit 2');

  status = 0;
  try {
    execFileSync('bash', [helper, 'bogus'], { cwd: repoRoot, stdio: 'pipe' });
  } catch (e) {
    status = e.status;
  }
  assert.strictEqual(status, 2, 'unknown action must exit 2');
});

test('spec-reviewer marker lifecycle drives enforce hook outcomes', () => {
  const repoRoot = path.join(__dirname, '..');
  const marker = path.join(repoRoot, '.claude', '.last-impl-task');
  const markerHelper = path.join(repoRoot, '.claude', 'hooks', 'spec-reviewer-marker.sh');
  const enforce = path.join(repoRoot, '.claude', 'hooks', 'spec-reviewer-enforce.sh');

  // Preserve any pre-existing marker so we don't disturb a live /execute run.
  let savedMarker = null;
  if (fs.existsSync(marker)) {
    savedMarker = fs.readFileSync(marker, 'utf-8');
  }

  function runEnforce() {
    let status = 0;
    try {
      execFileSync('bash', [enforce], {
        cwd: repoRoot,
        input: '{"tool":"TodoWrite"}',
        // Explicitly clear CLAUDE_TRANSCRIPT_PATH to prove the hook does NOT
        // depend on it (Finding 3: marker-only enforcement).
        env: { ...process.env, CLAUDE_TRANSCRIPT_PATH: '' },
        stdio: 'pipe',
      });
    } catch (e) {
      status = e.status;
    }
    return status;
  }

  try {
    // Marker absent → enforce must ALLOW (exit 0).
    try { fs.rmSync(marker, { force: true }); } catch (_) {}
    assert.strictEqual(runEnforce(), 0, 'marker absent → exit 0');

    // write implementer → enforce must BLOCK (exit 2).
    execFileSync('bash', [markerHelper, 'write', 'implementer'], { cwd: repoRoot });
    assert.strictEqual(runEnforce(), 2, 'implementer:<now> → block');

    // write reviewer → enforce must ALLOW (exit 0).
    execFileSync('bash', [markerHelper, 'write', 'reviewer'], { cwd: repoRoot });
    assert.strictEqual(runEnforce(), 0, 'reviewer:<now> → allow');

    // clear → enforce must ALLOW (exit 0). No more "informational warning" tier.
    execFileSync('bash', [markerHelper, 'clear'], { cwd: repoRoot });
    assert.strictEqual(runEnforce(), 0, 'cleared marker → exit 0');

    // Stale implementer marker (700s old, > 600s window) → exit 0 with warning.
    const now = Math.floor(Date.now() / 1000);
    fs.writeFileSync(marker, 'implementer:' + (now - 700));
    assert.strictEqual(runEnforce(), 0, 'stale implementer (>600s) → allow');

    // Implementer marker 500s old (< 600s window) → still blocks.
    fs.writeFileSync(marker, 'implementer:' + (now - 500));
    assert.strictEqual(runEnforce(), 2, 'fresh implementer (<600s) → block');

    // Malformed marker → block with fix-up message.
    fs.writeFileSync(marker, 'malformed garbage');
    assert.strictEqual(runEnforce(), 2, 'malformed marker → block');

    // Unknown state → block.
    fs.writeFileSync(marker, 'orchestrator:' + now);
    assert.strictEqual(runEnforce(), 2, 'unknown state → block');

    // Empty marker file → allow (treat as absent).
    fs.writeFileSync(marker, '');
    assert.strictEqual(runEnforce(), 0, 'empty marker file → allow');
  } finally {
    // Restore any pre-existing marker.
    if (savedMarker !== null) {
      fs.writeFileSync(marker, savedMarker);
    } else {
      try { fs.rmSync(marker, { force: true }); } catch (_) {}
    }
  }
});

test('spec-reviewer enforce hook does not consult CLAUDE_TRANSCRIPT_PATH', () => {
  // Finding 3: even when CLAUDE_TRANSCRIPT_PATH points at a transcript that
  // contains a properly-paired implementer/reviewer dispatch, the marker
  // file is the ONLY thing that determines the outcome. A stale implementer
  // marker must still block, regardless of what the transcript says.
  const repoRoot = path.join(__dirname, '..');
  const marker = path.join(repoRoot, '.claude', '.last-impl-task');
  const enforce = path.join(repoRoot, '.claude', 'hooks', 'spec-reviewer-enforce.sh');

  let savedMarker = null;
  if (fs.existsSync(marker)) {
    savedMarker = fs.readFileSync(marker, 'utf-8');
  }

  // Forge a transcript that LOOKS paired — the old hook would have honored
  // this and exited 0; the new hook must ignore it.
  const transcriptDir = fs.mkdtempSync(path.join(os.tmpdir(), 'enforce-transcript-'));
  const transcriptPath = path.join(transcriptDir, 'session.jsonl');
  fs.writeFileSync(
    transcriptPath,
    '[dispatch] role=task-implementer task=1\n' +
    '[dispatch] role=spec-reviewer task=1\n'
  );

  try {
    const now = Math.floor(Date.now() / 1000);
    fs.writeFileSync(marker, 'implementer:' + now);

    let status = 0;
    try {
      execFileSync('bash', [enforce], {
        cwd: repoRoot,
        input: '{"tool":"TodoWrite"}',
        env: { ...process.env, CLAUDE_TRANSCRIPT_PATH: transcriptPath },
        stdio: 'pipe',
      });
    } catch (e) {
      status = e.status;
    }
    assert.strictEqual(
      status, 2,
      'transcript pairing must NOT override marker — marker is the single source of truth'
    );
  } finally {
    try { fs.rmSync(transcriptDir, { recursive: true, force: true }); } catch (_) {}
    if (savedMarker !== null) {
      fs.writeFileSync(marker, savedMarker);
    } else {
      try { fs.rmSync(marker, { force: true }); } catch (_) {}
    }
  }
});

// Cleanup
try {
  fs.rmSync(TMP, { recursive: true, force: true });
} catch (_) {}

console.log('\n' + passed + ' passed, ' + failed + ' failed\n');
process.exit(failed > 0 ? 1 : 0);
