const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const REPO = 'AIDevelopmentFramework/AIDevelopmentFramework';
const BRANCH = 'main';
const TARBALL_URL = 'https://github.com/' + REPO + '/archive/refs/heads/' + BRANCH + '.tar.gz';

// Files that are project-specific and should NOT be overwritten
var PROTECTED_FILES = [
  '.claude/agents/architect-agent/index.md',
  '.claude/agents/architect-agent/shared/patterns.md',
  '.claude/agents/architect-agent/decisions/log.md',
  '.claude/agents/tester-agent/test-patterns.md',
  '.claude/agents/tester-agent/auth-state.md',
  '.claude/agents/mobile-tester-agent/screen-patterns.md',
  '.claude/references/code-patterns.md',
  '.claude/settings.local.json',
];

// Directories with project-specific content that should NOT be overwritten
var PROTECTED_DIRS = [
  '.claude/agents/architect-agent/modules',
  '.claude/agents/architect-agent/frontend',
];

function copyDirRecursive(src, dest, protectedFiles, protectedDirs) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  var entries = fs.readdirSync(src, { withFileTypes: true });
  for (var i = 0; i < entries.length; i++) {
    var entry = entries[i];
    var srcPath = path.join(src, entry.name);
    var destPath = path.join(dest, entry.name);
    var relativePath = path.relative(process.cwd(), destPath);

    if (entry.isDirectory()) {
      // Skip protected directories entirely
      if (protectedDirs.some(function (d) { return relativePath.startsWith(d); })) {
        continue;
      }
      copyDirRecursive(srcPath, destPath, protectedFiles, protectedDirs);
    } else {
      // Skip protected files
      if (protectedFiles.indexOf(relativePath) !== -1) {
        console.log('  Skipped (project-specific): ' + relativePath);
        continue;
      }
      fs.copyFileSync(srcPath, destPath);
    }
  }
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
      copyDirRecursive(sourceClaudeDir, targetClaudeDir, PROTECTED_FILES, PROTECTED_DIRS);
    }

    // Update docs (but not docs/plans/ which contains project plans)
    var sourceDocsDir = path.join(tmpDir, 'docs');
    var targetDocsDir = path.join(process.cwd(), 'docs');
    if (fs.existsSync(sourceDocsDir)) {
      console.log('Updating docs/...');
      var docEntries = fs.readdirSync(sourceDocsDir, { withFileTypes: true });
      for (var i = 0; i < docEntries.length; i++) {
        var entry = docEntries[i];
        if (entry.isFile()) {
          fs.copyFileSync(
            path.join(sourceDocsDir, entry.name),
            path.join(targetDocsDir, entry.name)
          );
        }
        // Skip docs/plans/ and docs/superpowers/ — project-specific
      }
    }

    console.log('');
    console.log('Update complete!');
    console.log('');
    console.log('Updated: commands, agent protocols, rules templates, hooks, skills, docs');
    console.log('Preserved: agent knowledge bases, test patterns, auth state, code patterns, settings, plans');
    console.log('');
    console.log('Run /setup to check if new plugins are required.');
    console.log('');
  } catch (err) {
    console.error('Update failed: ' + err.message);
    process.exit(1);
  } finally {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch (e) {
      // ignore cleanup errors
    }
  }
}

main();
