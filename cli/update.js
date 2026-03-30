const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { PROTECTED_FILES, PROTECTED_DIRS } = require('./protected-files');

const REPO = 'cristian-robert/AIDevelopmentFramework';
const BRANCH = 'main';
const TARBALL_URL = 'https://github.com/' + REPO + '/archive/refs/heads/' + BRANCH + '.tar.gz';

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  var entries = fs.readdirSync(src, { withFileTypes: true });
  var stats = { updated: 0, skipped: 0 };
  for (var i = 0; i < entries.length; i++) {
    var entry = entries[i];
    var srcPath = path.join(src, entry.name);
    var destPath = path.join(dest, entry.name);
    var relativePath = path.relative(process.cwd(), destPath);

    if (entry.isDirectory()) {
      var isProtectedDir = PROTECTED_DIRS.some(function (d) {
        return relativePath === d || relativePath.startsWith(d + '/');
      });
      if (isProtectedDir && fs.existsSync(destPath)) {
        console.log('  Skipped (project-specific): ' + relativePath + '/');
        stats.skipped++;
        continue;
      }
      var sub = copyDirRecursive(srcPath, destPath);
      stats.updated += sub.updated;
      stats.skipped += sub.skipped;
    } else {
      if (PROTECTED_FILES.indexOf(relativePath) !== -1 && fs.existsSync(destPath)) {
        console.log('  Skipped (project-specific): ' + relativePath);
        stats.skipped++;
        continue;
      }
      fs.copyFileSync(srcPath, destPath);
      stats.updated++;
    }
  }
  return stats;
}

function main() {
  console.log('');
  console.log('  AIDevelopmentFramework — Update');
  console.log('');

  if (!fs.existsSync('.claude')) {
    console.error('No .claude/ directory found. Run "npx ai-framework init" first.');
    process.exit(1);
  }

  var tmpDir = path.join(require('os').tmpdir(), 'ai-framework-update-' + Date.now());
  fs.mkdirSync(tmpDir, { recursive: true });

  console.log('Downloading latest framework from GitHub...');

  try {
    execFileSync('curl', ['-sL', TARBALL_URL, '-o', path.join(tmpDir, 'framework.tar.gz')]);
    execFileSync('tar', ['-xzf', path.join(tmpDir, 'framework.tar.gz'), '-C', tmpDir, '--strip-components=1']);

    var sourceClaudeDir = path.join(tmpDir, '.claude');
    var targetClaudeDir = path.join(process.cwd(), '.claude');

    if (fs.existsSync(sourceClaudeDir)) {
      console.log('Updating .claude/ (preserving project-specific files)...');
      console.log('');
      var stats = copyDirRecursive(sourceClaudeDir, targetClaudeDir);

      // Update docs (but not docs/plans/ or docs/superpowers/)
      var sourceDocsDir = path.join(tmpDir, 'docs');
      var targetDocsDir = path.join(process.cwd(), 'docs');
      if (fs.existsSync(sourceDocsDir)) {
        console.log('');
        console.log('Updating docs/...');
        if (!fs.existsSync(targetDocsDir)) {
          fs.mkdirSync(targetDocsDir, { recursive: true });
        }
        var docEntries = fs.readdirSync(sourceDocsDir, { withFileTypes: true });
        for (var i = 0; i < docEntries.length; i++) {
          var entry = docEntries[i];
          if (entry.isFile()) {
            fs.copyFileSync(
              path.join(sourceDocsDir, entry.name),
              path.join(targetDocsDir, entry.name)
            );
            stats.updated++;
          }
        }
      }

      console.log('');
      console.log('Update complete!');
      console.log('');
      console.log('  Updated: ' + stats.updated + ' files');
      console.log('  Skipped: ' + stats.skipped + ' files (preserved your customizations)');
      console.log('');
      console.log('Run /setup to check if new plugins are required.');
      console.log('');
    }
  } catch (err) {
    console.error('Update failed: ' + err.message);
    process.exit(1);
  } finally {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch (e) {
      // ignore
    }
  }
}

main();
