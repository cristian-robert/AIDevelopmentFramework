const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const readline = require('readline');
const { PROTECTED_FILES, PROTECTED_DIRS, CUSTOMIZABLE_FILES } = require('./protected-files');

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

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  var entries = fs.readdirSync(src, { withFileTypes: true });
  for (var i = 0; i < entries.length; i++) {
    var entry = entries[i];
    var srcPath = path.join(src, entry.name);
    var destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
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
  var localClaudeDir = path.join(frameworkDir, '.claude');
  if (fs.existsSync(localClaudeDir)) {
    return frameworkDir;
  }
  return null;
}

function isTemplateContent(filePath) {
  // Check if a file still contains only template/placeholder content
  try {
    var content = fs.readFileSync(filePath, 'utf-8');
    // Files that are still templates have these markers
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

function detectConflicts(sourceDir, targetDir) {
  var conflicts = { protected: [], customized: [], safe: [] };

  function scan(src, dest, relBase) {
    if (!fs.existsSync(src)) return;
    var entries = fs.readdirSync(src, { withFileTypes: true });
    for (var i = 0; i < entries.length; i++) {
      var entry = entries[i];
      var srcPath = path.join(src, entry.name);
      var destPath = path.join(dest, entry.name);
      var relPath = relBase ? relBase + '/' + entry.name : entry.name;

      if (entry.isDirectory()) {
        scan(srcPath, destPath, relPath);
      } else {
        if (!fs.existsSync(destPath)) {
          conflicts.safe.push(relPath);
        } else if (PROTECTED_FILES.indexOf(relPath) !== -1) {
          // Check if protected file has been customized (no longer template)
          if (!isTemplateContent(destPath)) {
            conflicts.protected.push(relPath);
          } else {
            // Still template content — safe to overwrite
            conflicts.safe.push(relPath);
          }
        } else if (CUSTOMIZABLE_FILES.indexOf(relPath) !== -1) {
          // Check if content actually differs
          var srcContent = fs.readFileSync(srcPath, 'utf-8');
          var destContent = fs.readFileSync(destPath, 'utf-8');
          if (srcContent !== destContent) {
            conflicts.customized.push(relPath);
          } else {
            conflicts.safe.push(relPath);
          }
        } else {
          conflicts.safe.push(relPath);
        }
      }
    }
  }

  scan(sourceDir, targetDir, '');
  return conflicts;
}

function smartCopy(sourceDir, targetDir, strategy, customizedAction) {
  // strategy: 'fresh' | 'smart'
  // customizedAction: 'keep' | 'overwrite' | 'backup'
  var stats = { created: 0, updated: 0, skipped: 0, backedUp: 0 };

  function copy(src, dest, relBase) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    var entries = fs.readdirSync(src, { withFileTypes: true });
    for (var i = 0; i < entries.length; i++) {
      var entry = entries[i];
      var srcPath = path.join(src, entry.name);
      var destPath = path.join(dest, entry.name);
      var relPath = relBase ? relBase + '/' + entry.name : entry.name;

      if (entry.isDirectory()) {
        // Skip protected directories in smart mode
        if (strategy === 'smart') {
          var isProtectedDir = PROTECTED_DIRS.some(function (d) {
            return relPath === d || relPath.startsWith(d + '/');
          });
          if (isProtectedDir && fs.existsSync(destPath)) {
            stats.skipped++;
            continue;
          }
        }
        copy(srcPath, destPath, relPath);
      } else {
        var destExists = fs.existsSync(destPath);

        if (strategy === 'smart' && destExists) {
          // Protected file with real content — never overwrite
          if (PROTECTED_FILES.indexOf(relPath) !== -1 && !isTemplateContent(destPath)) {
            stats.skipped++;
            continue;
          }

          // Customized file — apply user's chosen action
          if (CUSTOMIZABLE_FILES.indexOf(relPath) !== -1) {
            var srcContent = fs.readFileSync(srcPath, 'utf-8');
            var destContent = fs.readFileSync(destPath, 'utf-8');
            if (srcContent !== destContent) {
              if (customizedAction === 'keep') {
                stats.skipped++;
                continue;
              } else if (customizedAction === 'backup') {
                var backupPath = destPath + '.backup';
                fs.copyFileSync(destPath, backupPath);
                fs.copyFileSync(srcPath, destPath);
                stats.backedUp++;
                stats.updated++;
                continue;
              }
              // 'overwrite' falls through to normal copy
            }
          }
        }

        fs.copyFileSync(srcPath, destPath);
        if (destExists) {
          stats.updated++;
        } else {
          stats.created++;
        }
      }
    }
  }

  copy(sourceDir, targetDir, '');
  return stats;
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

async function main() {
  console.log('');
  console.log('  AIDevelopmentFramework');
  console.log('  The system around the AI that makes the AI reliable.');
  console.log('');

  var targetDir = process.cwd();
  var hasGit = fs.existsSync('.git');
  var hasClaudeDir = fs.existsSync('.claude');
  var hasCLAUDEmd = fs.existsSync('CLAUDE.md');

  // Detect tech stack
  var stack = detectTechStack();
  if (stack.length > 0) {
    console.log('  Detected tech stack: ' + stack.join(', '));
    console.log('');
  }

  // Download framework to temp dir
  var tmpDir = path.join(require('os').tmpdir(), 'ai-framework-' + Date.now());
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
      rl.close();
      process.exit(1);
    }
  }

  var strategy = 'fresh';
  var customizedAction = 'overwrite';

  if (hasClaudeDir || hasCLAUDEmd) {
    // Existing installation detected — scan for conflicts
    console.log('Existing configuration detected. Scanning for conflicts...');
    console.log('');

    var conflicts = detectConflicts(
      path.join(sourceDir, '.claude'),
      path.join(targetDir, '.claude')
    );

    // Also check CLAUDE.md
    if (hasCLAUDEmd) {
      conflicts.protected.push('CLAUDE.md');
    }

    if (conflicts.protected.length > 0) {
      console.log('  Project-specific files (will be preserved):');
      for (var i = 0; i < conflicts.protected.length; i++) {
        console.log('    ' + conflicts.protected[i]);
      }
      console.log('');
    }

    if (conflicts.customized.length > 0) {
      console.log('  Modified files (differ from framework defaults):');
      for (var j = 0; j < conflicts.customized.length; j++) {
        console.log('    ' + conflicts.customized[j]);
      }
      console.log('');

      var choice = await ask(
        '  How should modified files be handled?\n' +
        '    1. Keep mine     — preserve your customizations, skip framework updates\n' +
        '    2. Use framework — overwrite with latest framework versions\n' +
        '    3. Backup + update — save yours as .backup, install framework versions\n' +
        '  Choice (1/2/3): '
      );

      if (choice === '1') customizedAction = 'keep';
      else if (choice === '2') customizedAction = 'overwrite';
      else if (choice === '3') customizedAction = 'backup';
      else customizedAction = 'keep'; // default to safe option

      console.log('');
    }

    if (conflicts.safe.length > 0) {
      console.log('  New/unchanged files: ' + conflicts.safe.length + ' (will be installed)');
      console.log('');
    }

    strategy = 'smart';
  }

  // Install .claude/
  console.log('Installing framework...');
  var claudeStats = smartCopy(
    path.join(sourceDir, '.claude'),
    path.join(targetDir, '.claude'),
    strategy,
    customizedAction
  );

  // Install docs/ (but not project-specific plans)
  var docsSource = path.join(sourceDir, 'docs');
  if (fs.existsSync(docsSource)) {
    var docsEntries = fs.readdirSync(docsSource, { withFileTypes: true });
    for (var k = 0; k < docsEntries.length; k++) {
      var entry = docsEntries[k];
      if (entry.isFile()) {
        var docsTarget = path.join(targetDir, 'docs');
        if (!fs.existsSync(docsTarget)) {
          fs.mkdirSync(docsTarget, { recursive: true });
        }
        fs.copyFileSync(
          path.join(docsSource, entry.name),
          path.join(docsTarget, entry.name)
        );
        claudeStats.created++;
      }
      // Skip docs/plans/ and docs/superpowers/ — project-specific
    }
  }

  // Create docs/plans directory
  var plansDir = path.join(targetDir, 'docs', 'plans');
  if (!fs.existsSync(plansDir)) {
    fs.mkdirSync(plansDir, { recursive: true });
  }

  // Init git if needed
  if (!hasGit) {
    console.log('');
    var initGit = await ask('No git repo found. Initialize one? (yes/no): ');
    if (initGit.toLowerCase() === 'yes' || initGit.toLowerCase() === 'y') {
      try {
        execFileSync('git', ['init']);
        execFileSync('git', ['branch', '-m', 'main']);
        console.log('Git repository initialized.');
      } catch (e) {
        console.log('Could not initialize git: ' + e.message);
      }
    }
  }

  // Summary
  console.log('');
  console.log('Setup complete!');
  console.log('');
  console.log('  Created:  ' + claudeStats.created + ' files');
  console.log('  Updated:  ' + claudeStats.updated + ' files');
  console.log('  Skipped:  ' + claudeStats.skipped + ' files (preserved your customizations)');
  if (claudeStats.backedUp > 0) {
    console.log('  Backed up: ' + claudeStats.backedUp + ' files (saved as .backup)');
  }
  console.log('');
  console.log('  .claude/commands/    10 pipeline commands');
  console.log('  .claude/agents/      4 specialist agents + template');
  console.log('  .claude/skills/      2 framework skills');
  console.log('  .claude/rules/       6 domain rules + template');
  console.log('  .claude/references/  5 templates');
  console.log('  .claude/hooks/       5 guardrails');
  console.log('  docs/                methodology + guides');
  console.log('');
  console.log('Next steps:');
  console.log('  1. Open Claude Code in this project');
  console.log('  2. Run /setup to check plugin dependencies');
  console.log('  3. Run /start to begin');
  console.log('');

  // Cleanup
  try {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  } catch (e) {
    // ignore
  }

  rl.close();
}

main().catch(function (err) {
  console.error('Error: ' + err.message);
  process.exit(1);
});
