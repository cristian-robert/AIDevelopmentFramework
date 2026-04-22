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

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function cleanupTmpDir(tmpDir) {
  try {
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  } catch (e) {
    // Best-effort cleanup
  }
}

function getVersion(dir) {
  try {
    var pkg = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf-8'));
    return pkg.version || null;
  } catch (e) {
    return null;
  }
}

function getLocalFallbackDir() {
  var frameworkDir = path.join(__dirname, '..');
  if (fs.existsSync(path.join(frameworkDir, '.claude'))) {
    return frameworkDir;
  }
  return null;
}

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

      // Refuse to traverse symlinks — a malicious or accidental link could
      // otherwise redirect copy/backup into the user's home directory.
      if (entry.isSymbolicLink()) {
        continue;
      }

      if (entry.isDirectory()) {
        copy(srcPath, destPath);
      } else if (entry.isFile()) {
        var destExists = fs.existsSync(destPath);

        if (destExists) {
          // Only create backup if one doesn't already exist (preserve original)
          var backupPath = destPath + '.backup';
          if (!fs.existsSync(backupPath)) {
            fs.copyFileSync(destPath, backupPath);
            stats.backedUp++;
            var relPath = toProjectRelative(destPath, projectRoot);
            stats.backedUpFiles.push(relPath);
          }
        }

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
      // Skip special files silently.
    }
  }

  copy(sourceDir, targetDir);
  return stats;
}

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
  console.log('  AIDevelopmentFramework — Update');
  console.log('');

  if (!fs.existsSync('.claude')) {
    console.error('No .claude/ directory found. Run "npx ai-development-framework init" first.');
    process.exit(1);
  }

  var projectRoot = process.cwd();
  var previousVersion = getVersion(projectRoot);

  // UUID-based tmp dir — avoids collisions when two update runs start in the
  // same millisecond (Date.now() has millisecond granularity).
  var tmpDir = path.join(os.tmpdir(), 'ai-framework-update-' + crypto.randomUUID());
  fs.mkdirSync(tmpDir, { recursive: true });

  console.log('Downloading latest framework from GitHub...');

  var sourceDir = null;
  var downloaded = false;
  try {
    execFileSync('curl', ['-sL', TARBALL_URL, '-o', path.join(tmpDir, 'framework.tar.gz')]);
    execFileSync('tar', ['-xzf', path.join(tmpDir, 'framework.tar.gz'), '-C', tmpDir, '--strip-components=1']);
    sourceDir = tmpDir;
    downloaded = true;
  } catch (dlErr) {
    console.error('Download failed: ' + dlErr.message);
    // Clean up the partially-populated tmpDir before falling back. Otherwise
    // a half-extracted tarball could pollute future runs or confuse callers
    // that probe the same directory.
    cleanupTmpDir(tmpDir);
    var fallback = getLocalFallbackDir();
    if (fallback) {
      console.log('Using local package as fallback...');
      sourceDir = fallback;
    } else {
      console.error('No framework source available. Check your internet connection.');
      rl.close();
      process.exit(1);
    }
  }

  try {
    var newVersion = getVersion(sourceDir);

    console.log('');
    console.log('All existing files will be backed up as .backup before updating.');
    console.log('Run /start after update to merge your project configuration.');
    console.log('');

    // Update .claude/ with backup
    console.log('Updating .claude/ ...');
    var stats = backupAndCopy(
      path.join(sourceDir, '.claude'),
      path.join(projectRoot, '.claude'),
      projectRoot
    );

    // Update CLAUDE.md with backup
    var claudeMdSource = path.join(sourceDir, 'CLAUDE.md');
    if (fs.existsSync(claudeMdSource)) {
      var claudeMdDest = path.join(projectRoot, 'CLAUDE.md');
      if (fs.existsSync(claudeMdDest)) {
        var backupPath = claudeMdDest + '.backup';
        if (!fs.existsSync(backupPath)) {
          fs.copyFileSync(claudeMdDest, backupPath);
          stats.backedUp++;
          stats.backedUpFiles.push('CLAUDE.md');
        }
        fs.copyFileSync(claudeMdSource, claudeMdDest);
        stats.updated++;
      } else {
        // No existing CLAUDE.md — just copy
        fs.copyFileSync(claudeMdSource, claudeMdDest);
        stats.created++;
      }
    }

    // Update docs (but not docs/plans/ or docs/superpowers/)
    var sourceDocsDir = path.join(sourceDir, 'docs');
    var targetDocsDir = path.join(projectRoot, 'docs');
    if (fs.existsSync(sourceDocsDir)) {
      console.log('Updating docs/...');
      if (!fs.existsSync(targetDocsDir)) {
        fs.mkdirSync(targetDocsDir, { recursive: true });
      }
      var docEntries = fs.readdirSync(sourceDocsDir, { withFileTypes: true });
      for (var i = 0; i < docEntries.length; i++) {
        var entry = docEntries[i];
        if (entry.isFile()) {
          var srcPath = path.join(sourceDocsDir, entry.name);
          var destPath = path.join(targetDocsDir, entry.name);
          var existed = fs.existsSync(destPath);
          if (existed) {
            var docBackupPath = destPath + '.backup';
            if (!fs.existsSync(docBackupPath)) {
              fs.copyFileSync(destPath, docBackupPath);
              stats.backedUp++;
              stats.backedUpFiles.push(toProjectRelative(destPath, projectRoot));
            }
          }
          fs.copyFileSync(srcPath, destPath);
          if (existed) {
            stats.updated++;
          } else {
            stats.created++;
          }
        }
      }
    }

    // Update cli/kb-search.js (knowledge base search tool)
    var kbSearchSource = path.join(sourceDir, 'cli', 'kb-search.js');
    if (fs.existsSync(kbSearchSource)) {
      var cliDir = path.join(projectRoot, 'cli');
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
          stats.backedUpFiles.push(toProjectRelative(kbSearchDest, projectRoot));
        }
      }
      fs.copyFileSync(kbSearchSource, kbSearchDest);
      if (kbSearchExisted) {
        stats.updated++;
      } else {
        stats.created++;
      }
    }

    // Create init metadata for /start merge
    if (stats.backedUp > 0) {
      createInitMeta(projectRoot, previousVersion, newVersion, stats.backedUpFiles);
    }

    console.log('');
    console.log('Update complete!');
    console.log('');
    console.log('  Created:   ' + stats.created + ' files');
    console.log('  Updated:   ' + stats.updated + ' files');
    if (stats.backedUp > 0) {
      console.log('  Backed up: ' + stats.backedUp + ' files (saved as .backup)');
    }
    console.log('');
    if (stats.backedUp > 0) {
      console.log('Run /start to merge your existing configuration with the new framework.');
    } else {
      console.log('Run /setup to check if new plugins are required.');
    }
    console.log('');
  } catch (err) {
    console.error('Update failed: ' + err.message);
    process.exit(1);
  } finally {
    cleanupTmpDir(tmpDir);
    rl.close();
  }
}

main();
