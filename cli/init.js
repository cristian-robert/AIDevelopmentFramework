const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const { execFileSync } = require('child_process');
const readline = require('readline');
const { toProjectRelative } = require('./protected-files');

const REPO = 'cristian-robert/AIDevelopmentFramework';
const BRANCH = 'main';
const TARBALL_URL = 'https://github.com/' + REPO + '/archive/refs/heads/' + BRANCH + '.tar.gz';

// Lazy-init readline so requiring this module for tests doesn't open stdin.
var _rl = null;
function getRl() {
  if (!_rl) {
    _rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }
  return _rl;
}

function ask(question) {
  var rl = getRl();
  return new Promise(function (resolve) {
    rl.question(question, resolve);
  });
}

// Collision-resistant temp path (UUID-based). Replaces Date.now() which
// collided when two CLI runs started in the same millisecond.
function __test_tmpPath(prefix) {
  var p = prefix || 'ai-framework-';
  return path.join(os.tmpdir(), p + crypto.randomUUID());
}

function copyFileSimple(srcPath, destPath) {
  var destDir = path.dirname(destPath);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  fs.copyFileSync(srcPath, destPath);
}

function downloadAndExtract(tmpDir) {
  console.log('Downloading latest framework from GitHub...');
  try {
    execFileSync('curl', ['-sL', TARBALL_URL, '-o', path.join(tmpDir, 'framework.tar.gz')]);
    execFileSync('tar', ['-xzf', path.join(tmpDir, 'framework.tar.gz'), '-C', tmpDir, '--strip-components=1']);
    return true;
  } catch (err) {
    console.error('Download failed: ' + err.message);
    return false;
  }
}

function getLocalFallbackDir() {
  var frameworkDir = path.join(__dirname, '..');
  if (fs.existsSync(path.join(frameworkDir, '.claude'))) {
    return frameworkDir;
  }
  return null;
}

function cleanupTmpDir(tmpDir) {
  try {
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  } catch (e) {
    // Best-effort cleanup
  }
}

function detectTechStack() {
  var detected = [];
  try {
    var pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
    var deps = Object.assign({}, pkg.dependencies, pkg.devDependencies);
    if (deps['next']) detected.push('Next.js');
    if (deps['react']) detected.push('React');
    if (deps['vue']) detected.push('Vue');
    if (deps['svelte'] || deps['@sveltejs/kit']) detected.push('Svelte');
    if (deps['express']) detected.push('Express');
    if (deps['@nestjs/core']) detected.push('NestJS');
    if (deps['expo']) detected.push('Expo');
    if (deps['@supabase/supabase-js']) detected.push('Supabase');
    if (deps['tailwindcss']) detected.push('Tailwind');
    if (deps['stripe']) detected.push('Stripe');
    if (deps['prisma'] || deps['@prisma/client']) detected.push('Prisma');
    if (deps['drizzle-orm']) detected.push('Drizzle');
    if (deps['mongoose']) detected.push('MongoDB/Mongoose');
  } catch (e) {
    // No package.json or parse error
  }

  if (fs.existsSync('requirements.txt') || fs.existsSync('pyproject.toml')) {
    detected.push('Python');
    try {
      var reqContent = '';
      if (fs.existsSync('requirements.txt')) {
        reqContent = fs.readFileSync('requirements.txt', 'utf-8');
      } else if (fs.existsSync('pyproject.toml')) {
        reqContent = fs.readFileSync('pyproject.toml', 'utf-8');
      }
      if (reqContent.includes('fastapi')) detected.push('FastAPI');
      if (reqContent.includes('django')) detected.push('Django');
      if (reqContent.includes('flask')) detected.push('Flask');
    } catch (e) {
      // ignore
    }
  }
  if (fs.existsSync('go.mod')) detected.push('Go');
  if (fs.existsSync('Cargo.toml')) detected.push('Rust');

  return detected;
}

// Get version from a package.json file, returns null if not found
function getVersion(dir) {
  try {
    var pkg = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf-8'));
    return pkg.version || null;
  } catch (e) {
    return null;
  }
}

// Back up every existing file, then copy source over it.
// Returns { created, updated, backedUp, backedUpFiles[] }
function backupAndCopy(sourceDir, targetDir, projectRoot) {
  var stats = { created: 0, updated: 0, backedUp: 0, backedUpFiles: [] };

  function copy(src, dest) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    var entries = fs.readdirSync(src, { withFileTypes: true });
    for (var i = 0; i < entries.length; i++) {
      var entry = entries[i];
      var srcPath = path.join(src, entry.name);
      var destPath = path.join(dest, entry.name);

      // Refuse to follow symlinks. A malicious or accidental symlink in the
      // source tree (e.g. inside an extracted tarball) could otherwise cause
      // us to traverse into /etc, $HOME, or other directories outside the
      // intended scope. Dirent.isSymbolicLink() reports the link itself
      // without following it — no extra lstat needed.
      if (entry.isSymbolicLink()) {
        continue;
      }

      if (entry.isDirectory()) {
        copy(srcPath, destPath);
      } else if (entry.isFile()) {
        var destExists = fs.existsSync(destPath);

        if (destExists) {
          // Back up the existing file — only if no backup exists yet
          // (preserves original user content on double-init/update)
          var backupPath = destPath + '.backup';
          if (!fs.existsSync(backupPath)) {
            fs.copyFileSync(destPath, backupPath);
            stats.backedUp++;
            var relPath = toProjectRelative(destPath, projectRoot);
            stats.backedUpFiles.push(relPath);
          }
        }

        // Copy new framework file
        var destDir = path.dirname(destPath);
        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true });
        }
        fs.copyFileSync(srcPath, destPath);

        if (destExists) {
          stats.updated++;
        } else {
          stats.created++;
        }
      }
      // Skip special files (sockets, devices, FIFOs) silently.
    }
  }

  copy(sourceDir, targetDir);
  return stats;
}

// Write init metadata for /start merge detection
function createInitMeta(targetDir, previousVersion, newVersion, backedUpFiles) {
  var metaDir = path.join(targetDir, '.claude');
  if (!fs.existsSync(metaDir)) {
    fs.mkdirSync(metaDir, { recursive: true });
  }
  var meta = {
    timestamp: new Date().toISOString(),
    previousVersion: previousVersion || 'unknown',
    newVersion: newVersion || 'unknown',
    backedUpFiles: backedUpFiles,
  };
  fs.writeFileSync(
    path.join(metaDir, '.init-meta.json'),
    JSON.stringify(meta, null, 2)
  );
}

async function main() {
  console.log('');
  console.log('  AIDevelopmentFramework');
  console.log('  The system around the AI that makes the AI reliable.');
  console.log('');

  var targetDir = process.cwd();
  var hasGit = fs.existsSync('.git');
  var hasExisting = fs.existsSync('.claude') || fs.existsSync('CLAUDE.md');

  // Detect tech stack
  var stack = detectTechStack();
  if (stack.length > 0) {
    console.log('  Detected tech stack: ' + stack.join(', '));
    console.log('');
  }

  // Get previous version before overwriting
  var previousVersion = getVersion(targetDir);

  // Download framework to temp dir. UUID-based to avoid collisions between
  // parallel CLI runs (Date.now() has millisecond granularity).
  var tmpDir = __test_tmpPath('ai-framework-');
  fs.mkdirSync(tmpDir, { recursive: true });

  var sourceDir = null;
  var downloaded = downloadAndExtract(tmpDir);
  if (downloaded) {
    sourceDir = tmpDir;
  } else {
    var fallback = getLocalFallbackDir();
    if (fallback) {
      console.log('Using local package as fallback...');
      sourceDir = fallback;
    } else {
      console.error('No framework source available. Check your internet connection.');
      cleanupTmpDir(tmpDir);
      getRl().close();
      process.exit(1);
    }
  }

  var newVersion = getVersion(sourceDir);

  if (hasExisting) {
    console.log('Existing configuration detected. All files will be backed up as .backup');
    console.log('before installing new framework versions.');
    console.log('');
  }

  // Install .claude/ with backup
  console.log('Installing framework...');
  var stats = backupAndCopy(
    path.join(sourceDir, '.claude'),
    path.join(targetDir, '.claude'),
    targetDir
  );

  // Install CLAUDE.md with backup. Wrapped in try/catch: if the copy fails
  // after we've created a fresh .backup, we must restore the backup so the
  // user is not left with a deleted/mangled CLAUDE.md and a backup they
  // didn't know was just created.
  var claudeMdSource = path.join(sourceDir, 'CLAUDE.md');
  if (fs.existsSync(claudeMdSource)) {
    var claudeMdDest = path.join(targetDir, 'CLAUDE.md');
    if (fs.existsSync(claudeMdDest)) {
      var claudeMdBackup = claudeMdDest + '.backup';
      var createdBackupThisRun = false;
      if (!fs.existsSync(claudeMdBackup)) {
        fs.copyFileSync(claudeMdDest, claudeMdBackup);
        createdBackupThisRun = true;
      }
      try {
        fs.copyFileSync(claudeMdSource, claudeMdDest);
        if (createdBackupThisRun) {
          stats.backedUp++;
          stats.backedUpFiles.push('CLAUDE.md');
        }
        stats.updated++;
      } catch (copyErr) {
        // Rollback: if we created the backup on this run, restore it and
        // discard the backup file so the user's state is unchanged.
        if (createdBackupThisRun) {
          try {
            fs.copyFileSync(claudeMdBackup, claudeMdDest);
            fs.unlinkSync(claudeMdBackup);
          } catch (rollbackErr) {
            // Best-effort rollback; surface the original error anyway.
          }
        }
        throw copyErr;
      }
    } else {
      copyFileSimple(claudeMdSource, claudeMdDest);
      stats.created++;
    }
  }

  // Install docs/ (methodology guides only, not project-specific plans)
  var docsSource = path.join(sourceDir, 'docs');
  if (fs.existsSync(docsSource)) {
    var docsTarget = path.join(targetDir, 'docs');
    if (!fs.existsSync(docsTarget)) {
      fs.mkdirSync(docsTarget, { recursive: true });
    }
    var docsEntries = fs.readdirSync(docsSource, { withFileTypes: true });
    for (var k = 0; k < docsEntries.length; k++) {
      var entry = docsEntries[k];
      if (entry.isFile()) {
        var srcPath = path.join(docsSource, entry.name);
        var destPath = path.join(docsTarget, entry.name);
        var existed = fs.existsSync(destPath);
        if (existed) {
          var docBackupPath = destPath + '.backup';
          if (!fs.existsSync(docBackupPath)) {
            fs.copyFileSync(destPath, docBackupPath);
            stats.backedUp++;
            stats.backedUpFiles.push(toProjectRelative(destPath, targetDir));
          }
        }
        fs.copyFileSync(srcPath, destPath);
        if (existed) {
          stats.updated++;
        } else {
          stats.created++;
        }
      }
      // Skip docs/plans/ and docs/superpowers/ — project-specific
    }
  }

  // Install cli/kb-search.js (knowledge base search tool)
  var kbSearchSource = path.join(sourceDir, 'cli', 'kb-search.js');
  if (fs.existsSync(kbSearchSource)) {
    var cliDir = path.join(targetDir, 'cli');
    if (!fs.existsSync(cliDir)) {
      fs.mkdirSync(cliDir, { recursive: true });
    }
    var kbSearchDest = path.join(cliDir, 'kb-search.js');
    var kbSearchExisted = fs.existsSync(kbSearchDest);
    if (kbSearchExisted) {
      var kbSearchBackup = kbSearchDest + '.backup';
      if (!fs.existsSync(kbSearchBackup)) {
        fs.copyFileSync(kbSearchDest, kbSearchBackup);
        stats.backedUp++;
        stats.backedUpFiles.push(toProjectRelative(kbSearchDest, targetDir));
      }
    }
    fs.copyFileSync(kbSearchSource, kbSearchDest);
    if (kbSearchExisted) {
      stats.updated++;
    } else {
      stats.created++;
    }
  }

  // Create docs/plans directory
  var plansDir = path.join(targetDir, 'docs', 'plans');
  if (!fs.existsSync(plansDir)) {
    fs.mkdirSync(plansDir, { recursive: true });
  }

  // Create init metadata if files were backed up
  if (stats.backedUp > 0) {
    createInitMeta(targetDir, previousVersion, newVersion, stats.backedUpFiles);
  }

  // Init git if needed. When the user explicitly opts in, a failure is fatal —
  // silently continuing would leave them with a non-git project while the
  // framework's workflow (branch naming, /ship, /evolve) assumes git works.
  if (!hasGit) {
    console.log('');
    var initGit = await ask('No git repo found. Initialize one? (yes/no): ');
    if (initGit.toLowerCase() === 'yes' || initGit.toLowerCase() === 'y') {
      try {
        execFileSync('git', ['init']);
        execFileSync('git', ['branch', '-m', 'main']);
        console.log('Git repository initialized.');
      } catch (e) {
        console.error('Could not initialize git: ' + e.message);
        console.error('You explicitly opted in to git init, but it failed. Aborting.');
        cleanupTmpDir(tmpDir);
        getRl().close();
        process.exit(1);
      }
    }
  }

  // Summary
  console.log('');
  console.log('Setup complete!');
  console.log('');
  console.log('  Created:   ' + stats.created + ' files');
  console.log('  Updated:   ' + stats.updated + ' files');
  if (stats.backedUp > 0) {
    console.log('  Backed up: ' + stats.backedUp + ' files (saved as .backup)');
  }
  console.log('');
  console.log('  .claude/commands/    14 pipeline commands (incl. 4 /kb commands)');
  console.log('  .claude/agents/      4 specialist agents + template');
  console.log('  .claude/skills/      2 framework skills');
  console.log('  .claude/rules/       8 domain rules + template');
  console.log('  .claude/references/  7 templates');
  console.log('  .claude/hooks/       5 guardrails');
  console.log('  cli/kb-search.js     knowledge base search tool');
  console.log('  docs/                methodology + guides');
  console.log('');

  if (stats.backedUp > 0) {
    console.log('Next steps:');
    console.log('  1. Open Claude Code in this project');
    console.log('  2. Run /start to merge your existing configuration with the new framework');
    console.log('');
  } else {
    console.log('Next steps:');
    console.log('  1. Open Claude Code in this project');
    console.log('  2. Run /setup to check plugin dependencies');
    console.log('  3. Run /start to begin');
    console.log('');
  }

  cleanupTmpDir(tmpDir);
  getRl().close();
}

// Export for tests and other CLI entry points. Only run main() when invoked
// directly (`node cli/init.js`), NOT when required from a test file — which
// would otherwise install the framework against the tester's cwd.
module.exports = {
  backupAndCopy: backupAndCopy,
  __test_tmpPath: __test_tmpPath,
  main: main,
};

if (require.main === module) {
  main().catch(function (err) {
    console.error('Error: ' + err.message);
    process.exit(1);
  });
}
