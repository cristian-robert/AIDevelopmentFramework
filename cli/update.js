const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const readline = require('readline');
const { PROTECTED_FILES, PROTECTED_DIRS, CUSTOMIZABLE_FILES, toProjectRelative } = require('./protected-files');

const REPO = 'cristian-robert/AIDevelopmentFramework';
const BRANCH = 'main';
const TARBALL_URL = 'https://github.com/' + REPO + '/archive/refs/heads/' + BRANCH + '.tar.gz';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise(function (resolve) {
    rl.question(question, resolve);
  });
}

function isTemplateContent(filePath) {
  try {
    var content = fs.readFileSync(filePath, 'utf-8');
    if (content.includes('> Populated by /create-rules')) return true;
    if (content.includes('> Populated when /create-rules')) return true;
    if (content.includes('> No decisions recorded yet')) return true;
    if (content.includes('Run `/create-rules` to populate')) return true;
    if (content.includes('> This section is populated as the project grows')) return true;
    return false;
  } catch (e) {
    return false;
  }
}

function copyDirWithProtection(src, dest, projectRoot, customizedAction) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  var entries = fs.readdirSync(src, { withFileTypes: true });
  var stats = { updated: 0, skipped: 0, backedUp: 0 };
  for (var i = 0; i < entries.length; i++) {
    var entry = entries[i];
    var srcPath = path.join(src, entry.name);
    var destPath = path.join(dest, entry.name);
    var projectRelPath = toProjectRelative(destPath, projectRoot);

    if (entry.isDirectory()) {
      var isProtectedDir = PROTECTED_DIRS.some(function (d) {
        return projectRelPath === d || projectRelPath.startsWith(d + '/');
      });
      if (isProtectedDir && fs.existsSync(destPath)) {
        console.log('  Skipped (project-specific): ' + projectRelPath + '/');
        try {
          var dirFiles = fs.readdirSync(destPath, { recursive: true });
          stats.skipped += dirFiles.length || 1;
        } catch (e) {
          stats.skipped++;
        }
        continue;
      }
      var sub = copyDirWithProtection(srcPath, destPath, projectRoot, customizedAction);
      stats.updated += sub.updated;
      stats.skipped += sub.skipped;
      stats.backedUp += sub.backedUp;
    } else {
      if (!fs.existsSync(destPath)) {
        // New file — always install
        var destDir = path.dirname(destPath);
        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true });
        }
        fs.copyFileSync(srcPath, destPath);
        stats.updated++;
        continue;
      }

      // Protected file — skip if it has real content, update if still template
      if (PROTECTED_FILES.indexOf(projectRelPath) !== -1) {
        if (!isTemplateContent(destPath)) {
          console.log('  Skipped (project-specific): ' + projectRelPath);
          stats.skipped++;
        } else {
          fs.copyFileSync(srcPath, destPath);
          stats.updated++;
        }
        continue;
      }

      // Customizable file — apply chosen action
      if (CUSTOMIZABLE_FILES.indexOf(projectRelPath) !== -1) {
        var srcContent = fs.readFileSync(srcPath, 'utf-8');
        var destContent = fs.readFileSync(destPath, 'utf-8');
        if (srcContent !== destContent) {
          if (customizedAction === 'keep') {
            console.log('  Skipped (customized): ' + projectRelPath);
            stats.skipped++;
            continue;
          } else if (customizedAction === 'backup') {
            var timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
            var backupPath = destPath + '.' + timestamp + '.backup';
            fs.copyFileSync(destPath, backupPath);
            console.log('  Backed up: ' + projectRelPath);
            fs.copyFileSync(srcPath, destPath);
            stats.backedUp++;
            stats.updated++;
            continue;
          }
          // 'overwrite' falls through
        }
      }

      fs.copyFileSync(srcPath, destPath);
      stats.updated++;
    }
  }
  return stats;
}

async function main() {
  console.log('');
  console.log('  AIDevelopmentFramework — Update');
  console.log('');

  if (!fs.existsSync('.claude')) {
    console.error('No .claude/ directory found. Run "npx ai-framework init" first.');
    process.exit(1);
  }

  var projectRoot = process.cwd();
  var tmpDir = path.join(require('os').tmpdir(), 'ai-framework-update-' + Date.now());
  fs.mkdirSync(tmpDir, { recursive: true });

  console.log('Downloading latest framework from GitHub...');

  try {
    execFileSync('curl', ['-sL', TARBALL_URL, '-o', path.join(tmpDir, 'framework.tar.gz')]);
    execFileSync('tar', ['-xzf', path.join(tmpDir, 'framework.tar.gz'), '-C', tmpDir, '--strip-components=1']);

    // Ask about customized files
    var customizedAction = 'keep';
    console.log('');
    var choice = await ask(
      '  How should customized rules/hooks be handled?\n' +
      '    1. Keep mine     — preserve your customizations (default)\n' +
      '    2. Use framework — overwrite with latest framework versions\n' +
      '    3. Backup + update — save yours as .backup, install new versions\n' +
      '  Choice (1/2/3): '
    );

    if (choice === '2') customizedAction = 'overwrite';
    else if (choice === '3') customizedAction = 'backup';

    var sourceClaudeDir = path.join(tmpDir, '.claude');
    var targetClaudeDir = path.join(projectRoot, '.claude');

    if (fs.existsSync(sourceClaudeDir)) {
      console.log('');
      console.log('Updating .claude/ ...');
      console.log('');
      var stats = copyDirWithProtection(sourceClaudeDir, targetClaudeDir, projectRoot, customizedAction);

      // Update docs (but not docs/plans/ or docs/superpowers/)
      var sourceDocsDir = path.join(tmpDir, 'docs');
      var targetDocsDir = path.join(projectRoot, 'docs');
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
      console.log('  Updated:   ' + stats.updated + ' files');
      console.log('  Skipped:   ' + stats.skipped + ' files (preserved your customizations)');
      if (stats.backedUp > 0) {
        console.log('  Backed up: ' + stats.backedUp + ' files (saved as .backup)');
      }
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
    rl.close();
  }
}

main();
