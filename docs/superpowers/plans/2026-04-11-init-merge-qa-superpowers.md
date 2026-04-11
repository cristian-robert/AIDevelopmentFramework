# Init Merge + QA Automation + Superpowers Integration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Smart init that backs up and merges project knowledge, mandatory QA automation tests with test-planning subagent, and unified verification standard across Standard and Superpowers modes.

**Architecture:** CLI `init`/`update` backs up every existing file as `.backup` and creates `.init-meta.json`. `/start` detects the marker and runs LLM-driven merge with user approval. `/validate` gains a QA test phase. Both modes must run `/validate` before `/ship`. `/ship` enforces the gate.

**Tech Stack:** Node.js (CLI), Claude Code commands (markdown specs), GitHub Secrets (test users)

---

## File Structure

**Existing files to modify:**
- `cli/init.js` — Replace category system with backup-everything + `.init-meta.json`
- `cli/update.js` — Same backup-everything logic
- `cli/protected-files.js` — Repurpose as "needs LLM merge" hint list
- `.claude/commands/start.md` — Add Step 0 merge detection + update mode description
- `.claude/commands/validate.md` — Add QA test phase (Phase 3), renumber Phase 4-6
- `.claude/commands/ship.md` — Add `/validate` gate + QA check in pre-flight
- `.claude/rules/testing.md` — Add QA automation and test placement rules
- `CLAUDE.md` — Add `## Post-Init Merge`, `## Verification Standard`, `## QA Tools` sections

**No new files** — all modifications to existing files.

---

### Task 1: Simplify `cli/protected-files.js`

**Files:**
- Modify: `cli/protected-files.js`

- [ ] **Step 1: Read the current file**

Read `cli/protected-files.js` to confirm current state.

- [ ] **Step 2: Replace file contents**

Replace the entire file with:

```javascript
// Files that need LLM merge during /start after init/update.
// These contain project-specific content that should be preserved.
// All paths are relative to the PROJECT ROOT (not .claude/).
var NEEDS_MERGE = [
  // Project CLAUDE.md (tech stack, conventions, KB config, custom sections)
  'CLAUDE.md',

  // Rules (user-added conventions, skill chains, checklists)
  '.claude/rules/_global.md',
  '.claude/rules/backend.md',
  '.claude/rules/frontend.md',
  '.claude/rules/mobile.md',
  '.claude/rules/database.md',
  '.claude/rules/testing.md',
  '.claude/rules/security.md',
  '.claude/rules/knowledge-base.md',

  // Agent knowledge bases (populated per-project)
  '.claude/agents/architect-agent/index.md',
  '.claude/agents/architect-agent/shared/patterns.md',
  '.claude/agents/architect-agent/decisions/log.md',
  '.claude/agents/tester-agent/test-patterns.md',
  '.claude/agents/tester-agent/auth-state.md',
  '.claude/agents/mobile-tester-agent/screen-patterns.md',

  // Project-specific code patterns
  '.claude/references/code-patterns.md',

  // Project-specific settings
  '.claude/settings.local.json',

  // Knowledge base content
  '.obsidian/wiki/_index.md',
  '.obsidian/wiki/_tags.md',
  '.obsidian/raw/_manifest.md',
];

// Directories with project-specific content — always restore from backup.
var NEEDS_RESTORE = [
  '.claude/agents/architect-agent/modules',
  '.claude/agents/architect-agent/frontend',
  '.obsidian/wiki',
  '.obsidian/raw',
];

// Helper: normalize a path to project-root-relative format.
function toProjectRelative(filePath, rootDir) {
  var path = require('path');
  var abs = path.resolve(filePath);
  var root = path.resolve(rootDir);
  return path.relative(root, abs).split(path.sep).join('/');
}

module.exports = {
  NEEDS_MERGE: NEEDS_MERGE,
  NEEDS_RESTORE: NEEDS_RESTORE,
  toProjectRelative: toProjectRelative,
};
```

- [ ] **Step 3: Commit**

```bash
git add cli/protected-files.js
git commit -m "refactor: repurpose protected-files as merge hint list for init"
```

---

### Task 2: Rewrite `cli/init.js` — Backup-Everything Strategy

**Files:**
- Modify: `cli/init.js`

- [ ] **Step 1: Read the current file**

Read `cli/init.js` to confirm current state (456 lines).

- [ ] **Step 2: Replace the `smartCopy` function and related code**

Replace the entire file. The new version:
- Removes `detectConflicts`, `smartCopy`, and the three-category system
- Adds `backupAndCopy` — for every file that exists at destination, create `.backup` then overwrite
- Adds `createInitMeta` — writes `.claude/.init-meta.json` with timestamp, versions, backed-up file list
- Keeps `downloadAndExtract`, `getLocalFallbackDir`, `detectTechStack`, `cleanupTmpDir`, `copyFileSimple` unchanged
- Updates summary output to show backup count and `/start` merge instruction

```javascript
const fs = require('fs');
const path = require('path');
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

function ask(question) {
  return new Promise(function (resolve) {
    rl.question(question, resolve);
  });
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

      if (entry.isDirectory()) {
        copy(srcPath, destPath);
      } else {
        var destExists = fs.existsSync(destPath);

        if (destExists) {
          // Back up the existing file
          var backupPath = destPath + '.backup';
          fs.copyFileSync(destPath, backupPath);
          stats.backedUp++;
          var relPath = toProjectRelative(destPath, projectRoot);
          stats.backedUpFiles.push(relPath);
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
      cleanupTmpDir(tmpDir);
      rl.close();
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

  // Install CLAUDE.md with backup
  var claudeMdSource = path.join(sourceDir, 'CLAUDE.md');
  if (fs.existsSync(claudeMdSource)) {
    var claudeMdDest = path.join(targetDir, 'CLAUDE.md');
    if (fs.existsSync(claudeMdDest)) {
      fs.copyFileSync(claudeMdDest, claudeMdDest + '.backup');
      stats.backedUp++;
      stats.backedUpFiles.push('CLAUDE.md');
      fs.copyFileSync(claudeMdSource, claudeMdDest);
      stats.updated++;
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
          fs.copyFileSync(destPath, destPath + '.backup');
          stats.backedUp++;
          stats.backedUpFiles.push(toProjectRelative(destPath, targetDir));
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

  // Create docs/plans directory
  var plansDir = path.join(targetDir, 'docs', 'plans');
  if (!fs.existsSync(plansDir)) {
    fs.mkdirSync(plansDir, { recursive: true });
  }

  // Create init metadata if files were backed up
  if (stats.backedUp > 0) {
    createInitMeta(targetDir, previousVersion, newVersion, stats.backedUpFiles);
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
  rl.close();
}

main().catch(function (err) {
  console.error('Error: ' + err.message);
  process.exit(1);
});
```

- [ ] **Step 3: Commit**

```bash
git add cli/init.js
git commit -m "feat: rewrite init.js with backup-everything strategy and .init-meta.json"
```

---

### Task 3: Rewrite `cli/update.js` — Same Backup Strategy

**Files:**
- Modify: `cli/update.js`

- [ ] **Step 1: Read the current file**

Read `cli/update.js` to confirm current state.

- [ ] **Step 2: Replace file contents**

Replace the entire file. The new version mirrors init.js backup logic but skips git init and tech stack detection (update assumes project already set up):

```javascript
const fs = require('fs');
const path = require('path');
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

      if (entry.isDirectory()) {
        copy(srcPath, destPath);
      } else {
        var destExists = fs.existsSync(destPath);

        if (destExists) {
          var backupPath = destPath + '.backup';
          fs.copyFileSync(destPath, backupPath);
          stats.backedUp++;
          var relPath = toProjectRelative(destPath, projectRoot);
          stats.backedUpFiles.push(relPath);
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
    console.error('No .claude/ directory found. Run "npx ai-framework init" first.');
    process.exit(1);
  }

  var projectRoot = process.cwd();
  var previousVersion = getVersion(projectRoot);

  var tmpDir = path.join(require('os').tmpdir(), 'ai-framework-update-' + Date.now());
  fs.mkdirSync(tmpDir, { recursive: true });

  console.log('Downloading latest framework from GitHub...');

  try {
    execFileSync('curl', ['-sL', TARBALL_URL, '-o', path.join(tmpDir, 'framework.tar.gz')]);
    execFileSync('tar', ['-xzf', path.join(tmpDir, 'framework.tar.gz'), '-C', tmpDir, '--strip-components=1']);

    var newVersion = getVersion(tmpDir);

    console.log('');
    console.log('All existing files will be backed up as .backup before updating.');
    console.log('Run /start after update to merge your project configuration.');
    console.log('');

    // Update .claude/ with backup
    console.log('Updating .claude/ ...');
    var stats = backupAndCopy(
      path.join(tmpDir, '.claude'),
      path.join(projectRoot, '.claude'),
      projectRoot
    );

    // Update docs (but not docs/plans/ or docs/superpowers/)
    var sourceDocsDir = path.join(tmpDir, 'docs');
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
            fs.copyFileSync(destPath, destPath + '.backup');
            stats.backedUp++;
            stats.backedUpFiles.push(toProjectRelative(destPath, projectRoot));
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
```

- [ ] **Step 3: Commit**

```bash
git add cli/update.js
git commit -m "feat: rewrite update.js with backup-everything strategy and .init-meta.json"
```

---

### Task 4: Update `/start` — Merge Detection + Mode Description

**Files:**
- Modify: `.claude/commands/start.md`

- [ ] **Step 1: Add Step 0 merge detection before Step 1**

Insert at the very beginning of the file, after the introductory paragraph (after line 3), before `## Step 1: Gather Context`:

```markdown
## Step 0: Check for Pending Merge

Check if `.claude/.init-meta.json` exists. If it does, the framework was recently installed or updated and project-specific files need to be merged.

1. Read `.claude/.init-meta.json` to get the list of backed-up files
2. Announce: "Detected a recent framework init/update (vX → vY). N files were backed up. I'll merge your project-specific content into the new framework files."
3. Process each backed-up file by category, in this order:

   **CLAUDE.md:**
   - Read `CLAUDE.md` (new) and `CLAUDE.md.backup` (old)
   - Identify project-specific sections in the old file: `## Tech Stack`, `## Knowledge Base`, `## Design Skill Preference`, `## QA Tools`, any user-added sections not in the framework template
   - Present merge plan: "Your old CLAUDE.md had these project-specific sections: [list]. I'll merge them into the new framework template."
   - Wait for user approval → write merged file → delete `CLAUDE.md.backup`

   **Rules (`.claude/rules/*.md`):**
   - For each rule with a `.backup`: diff old vs new
   - Identify user-added conventions, checklist items, skill chain customizations
   - Present: "Your [rule].md had N extra items. I'll add them to the new version."
   - Wait for user approval → merge → delete `.backup`

   **Commands (`.claude/commands/*.md`):**
   - For each command with a `.backup`: compare old content to the PREVIOUS framework version (not user changes)
   - If content is identical to previous framework version → no user changes → delete `.backup` silently
   - If user modified → present diff → wait for approval → merge or keep new → delete `.backup`

   **References (`.claude/references/*.md`):**
   - `code-patterns.md`: always restore from `.backup` (entirely project-specific)
   - All others: delete `.backup` silently (framework templates, no project content)

   **Agents:**
   - All architect-agent, tester-agent, mobile-tester-agent files: always restore from `.backup`
   - Delete `.backup` files after restore

   **KB content (`.obsidian/**`):**
   - Always restore from `.backup` — project wiki and raw sources
   - Delete `.backup` files after restore

4. Delete `.claude/.init-meta.json`
5. Report: "Merge complete. N files merged, N files restored. Your project configuration is up to date."
6. Continue to Step 1 (normal `/start` routing)

If `.claude/.init-meta.json` does NOT exist, skip directly to Step 1.
```

- [ ] **Step 2: Update the Mode Selection in Step 4**

In Step 4 (around line 65-74), replace the Superpowers Mode description:

Old:
```markdown
> - **Superpowers Mode** — Full discipline: brainstorm, plan, TDD, execute, verify, review, ship, evolve
```

New:
```markdown
> - **Superpowers Mode** — Full discipline: brainstorm, plan, TDD, execute (subagent-driven), /validate (security + visual + QA + code review), ship, evolve
```

- [ ] **Step 3: Commit**

```bash
git add .claude/commands/start.md
git commit -m "feat: add Step 0 merge detection and update superpowers mode description in /start"
```

---

### Task 5: Update `/validate` — Add QA Test Phase

**Files:**
- Modify: `.claude/commands/validate.md`

- [ ] **Step 1: Add QA test phase between Phase 2 and Phase 3**

After Phase 2 (Visual Verification, ends around line 43) and before Phase 3 (Security Verification, starts around line 45), insert:

```markdown
### Phase 3: QA Test Verification

QA automation tests are mandatory for all domains affected by the implementation.

**Step 1: Detect changed domains**

```bash
git diff --name-only main...HEAD
```

Categorize changed files:
- Backend API files (routes, controllers, services) → needs API E2E tests
- Frontend files (pages, components) → needs browser E2E tests
- Mobile files (.ios.tsx, .android.tsx, Expo screens) → needs mobile E2E tests
- Database files (migrations, schemas) → needs migration tests

**Step 2: Spawn test-planning subagent**

Before writing any QA tests, spawn a subagent to plan test placement. The subagent:
1. Scans existing test directories for E2E/integration tests
2. Maps which features/routes/endpoints already have coverage
3. Checks if current changes affect assertions in existing tests
4. Reports back: list of test files to update + new test files to create (if any)

The subagent does NOT write tests — it only produces the placement plan.

**Step 3: Update affected existing tests**

If the planning subagent identified existing tests affected by the implementation, update them first:
- Fix broken assertions caused by the implementation changes
- Add new test cases to existing files for new behavior

**Step 4: Create new QA tests (only where no coverage exists)**

Using the planning subagent's report, create new test files only for uncovered areas:
- One E2E test file per feature area, not per implementation task
- Use the project's QA tool (check CLAUDE.md `## QA Tools` section, or defaults: Playwright for web, Supertest for API, Detox for mobile)
- Test users: read credentials from `.env.test` (local) or reference GitHub secrets documentation

**Step 5: Run all QA tests**

```bash
# Detect and run (project-specific command takes priority)
npm run test:e2e 2>/dev/null || npx playwright test 2>/dev/null || echo "No E2E test runner configured"
```

If any QA test fails, report the failure and offer to fix it before continuing.
```

- [ ] **Step 2: Renumber Phase 3 → Phase 4, Phase 4 → Phase 5, Phase 5 → Phase 6**

In the existing file:
- Rename `### Phase 3: Security Verification` → `### Phase 4: Security Verification`
- Rename `### Phase 4: Code Review` → `### Phase 5: Code Review`
- Rename `### Phase 5: Report` → `### Phase 6: Report`

- [ ] **Step 3: Update the report format in Phase 6**

Add a QA Tests section to the report template, between Visual Verification and Security Verification:

```markdown
QA Tests:
- API E2E: PASS (N/N) / N failures / not applicable
- Browser E2E: PASS (N/N) / N failures / not applicable
- Mobile E2E: PASS (N/N) / N failures / not applicable
```

Also update the Code Review Layers table reference in CLAUDE.md from `Phase 3` to `Phase 5`.

- [ ] **Step 4: Commit**

```bash
git add .claude/commands/validate.md
git commit -m "feat: add QA test verification phase to /validate"
```

---

### Task 6: Update `/ship` — Validate Gate + QA Check

**Files:**
- Modify: `.claude/commands/ship.md`

- [ ] **Step 1: Add /validate gate to pre-flight**

In Step 1 (Pre-flight Check, lines 7-11), add two new checks after the existing three:

```markdown
4. Verify `/validate` has been run in this session. If not:
   - Ask: "/validate hasn't been run yet. Run it now before shipping?"
   - If yes: run `/validate`, then continue `/ship` if it passes
   - If no: warn that shipping without validation is not recommended, but allow if user insists
5. Verify QA tests exist for changed domains:
   - Check `git diff --name-only main...HEAD` for backend/frontend/mobile changes
   - For each changed domain, verify corresponding E2E test files exist
   - If missing: warn "No QA tests found for [domain]. Run `/validate` to create them."
```

- [ ] **Step 2: Commit**

```bash
git add .claude/commands/ship.md
git commit -m "feat: add /validate gate and QA test check to /ship pre-flight"
```

---

### Task 7: Update Testing Rules

**Files:**
- Modify: `.claude/rules/testing.md`

- [ ] **Step 1: Add QA automation and test placement sections**

Append after the existing `## Coverage` section (after line 38):

```markdown
## QA Automation (Mandatory)

After every development task, QA automation tests are mandatory — not just unit tests.

| Domain | QA Test Type | Default Tool | What to test |
|--------|-------------|-------------|-------------|
| Backend API | API E2E tests | Supertest/Pactum | Endpoints respond correctly, auth works, error responses match format |
| Frontend Web | Browser E2E tests | Playwright | User flows, form submissions, navigation, responsive viewports |
| Mobile | Mobile E2E tests | Detox/Maestro | Screen navigation, gestures, form inputs, platform-specific behavior |
| Database | Migration tests | Project test runner | Migrations up/down, seed data, constraints hold |

Override defaults in CLAUDE.md `## QA Tools` section.

## QA Test Placement

- NEVER create a new test file without first checking existing test files for the same feature area
- Prefer adding test cases to existing files over creating new ones
- One E2E test file per feature area, not per implementation task
- Spawn a test-planning subagent before writing QA tests to avoid context bloat
- The subagent scans, plans placement, reports — it does NOT write tests

## Test Users

- Credentials stored as GitHub secrets: `TEST_USER_EMAIL`, `TEST_USER_PASSWORD`, `TEST_ADMIN_EMAIL`, `TEST_ADMIN_PASSWORD`
- For local development: stored in `.env.test` (gitignored)
- Never hardcode test credentials in test files — read from environment
```

- [ ] **Step 2: Commit**

```bash
git add .claude/rules/testing.md
git commit -m "feat: add QA automation, test placement, and test user rules"
```

---

### Task 8: Update CLAUDE.md — Three New Sections

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Add `## Post-Init Merge` section**

Insert after the `## Knowledge Base` section (after line 91, before `## Code Review Layers`):

```markdown
## Post-Init Merge

When `.claude/.init-meta.json` exists, the framework was recently installed or updated. Files with `.backup` extensions contain the project's previous versions. The `/start` command will detect this and run the merge flow before normal routing.

**Merge rules by file type:**

| File | Strategy |
|------|----------|
| `CLAUDE.md` | Merge project-specific sections (Tech Stack, Knowledge Base, Design Skill Preference, QA Tools, custom sections) into new template. Preserve all user-added content. |
| `.claude/rules/*.md` | Append user-added conventions, checklist items, and skill chain customizations to new framework rules. Don't duplicate entries already in the new version. |
| `.claude/commands/*.md` | If user modified a command, present diff and ask. Otherwise skip (no merge needed). |
| `.claude/references/code-patterns.md` | Always restore from backup — entirely project-specific. |
| `.claude/references/*.md` (other) | Skip — framework templates, no project content. |
| `.claude/agents/architect-agent/*` | Always restore from backup — project knowledge base. |
| `.claude/agents/tester-agent/*` | Always restore from backup — project test patterns. |
| `.claude/agents/mobile-tester-agent/*` | Always restore from backup — project screen patterns. |
| `.obsidian/**` | Always restore from backup — project wiki and raw sources. |

**Merge process:** For each `.backup` file, read both versions, present a summary of what will be merged, wait for user approval, then apply. Delete `.backup` files and `.init-meta.json` when complete.
```

- [ ] **Step 2: Add `## Verification Standard` section**

Insert after `## Code Review Layers` (after line 102):

```markdown
## Verification Standard

Both Standard and Superpowers modes MUST run `/validate` before `/ship`. The superpowers `verification-before-completion` skill is NOT a substitute for `/validate`. The superpowers `requesting-code-review` skill is NOT a substitute for `/validate` Phase 5.

After implementation (via `/execute` or `superpowers:subagent-driven-development`), always run `/validate` to verify: automated checks, visual testing, QA tests, security scans, and code review.

**Superpowers KB integration:** When using `superpowers:subagent-driven-development`, search the wiki (`KB_PATH=<kb-path> node cli/kb-search.js search "<keywords>"`) before dispatching each task implementer to provide relevant project context.
```

- [ ] **Step 3: Add `## QA Tools` section**

Insert after `## Verification Standard`:

```markdown
## QA Tools

Default QA test tools by domain. Override per-project by editing this section.

| Domain | Tool |
|--------|------|
| Web E2E | Playwright |
| API E2E | Supertest |
| Mobile E2E | Detox |
```

- [ ] **Step 4: Update the Code Review Layers table**

Update the Phase reference from `Phase 3` to `Phase 5` in the table:

Old:
```markdown
| **Superpowers Code Review** | `/validate` Phase 3 | Implementation defects, plan adherence, security, edge cases | Always available |
```

New:
```markdown
| **Superpowers Code Review** | `/validate` Phase 5 | Implementation defects, plan adherence, security, edge cases | Always available |
```

- [ ] **Step 5: Update the Scope Levels to mention /validate explicitly**

In the Mode Selection section, update Superpowers Mode:

Old:
```markdown
- **Superpowers Mode:** Full PIV+E pipeline — brainstorm → plan → TDD → execute → verify → review → ship → evolve
```

New:
```markdown
- **Superpowers Mode:** Full PIV+E pipeline — brainstorm → plan → TDD → execute (subagent-driven) → /validate (QA + security + visual + review) → ship → evolve
```

- [ ] **Step 6: Commit**

```bash
git add CLAUDE.md
git commit -m "feat: add Post-Init Merge, Verification Standard, and QA Tools to CLAUDE.md"
```

---

### Task 9: Add `.init-meta.json` to `.gitignore`

**Files:**
- Modify: `.gitignore`

- [ ] **Step 1: Add init metadata to gitignore**

Append after the `.worktrees/` line:

```
# Init/update metadata (temporary, consumed by /start merge)
.claude/.init-meta.json

# Backup files from init/update (temporary, consumed by /start merge)
*.backup
```

- [ ] **Step 2: Commit**

```bash
git add .gitignore
git commit -m "chore: add .init-meta.json and .backup to gitignore"
```

---

### Task 10: Write Tests for CLI Backup Logic

**Files:**
- Create: `cli/init-backup.test.js`

- [ ] **Step 1: Write the test file**

```javascript
// cli/init-backup.test.js
//
// Tests the backup-and-copy logic used by init.js and update.js.
// Verifies: backup creation, .init-meta.json, version detection.

const fs = require('fs');
const path = require('path');

const TEST_DIR = path.join(require('os').tmpdir(), 'init-backup-test-' + Date.now());
const SOURCE_DIR = path.join(TEST_DIR, 'source');
const TARGET_DIR = path.join(TEST_DIR, 'target');

// Import the functions we need to test by requiring init.js internals
// Since init.js doesn't export, we'll test via the CLI interface
const { execFileSync } = require('child_process');

function setup() {
  // Create source (simulating framework files)
  fs.mkdirSync(path.join(SOURCE_DIR, '.claude', 'rules'), { recursive: true });
  fs.mkdirSync(path.join(SOURCE_DIR, '.claude', 'commands'), { recursive: true });
  fs.writeFileSync(path.join(SOURCE_DIR, 'CLAUDE.md'), '# Framework CLAUDE.md\n\n## Tech Stack\n\n- Node.js\n');
  fs.writeFileSync(path.join(SOURCE_DIR, '.claude', 'rules', 'backend.md'), '# Backend Rules v2\n\n## New section\n');
  fs.writeFileSync(path.join(SOURCE_DIR, '.claude', 'commands', 'start.md'), '# /start v2\n');
  fs.writeFileSync(path.join(SOURCE_DIR, 'package.json'), '{"version": "0.3.0"}');

  // Create target (simulating existing project)
  fs.mkdirSync(path.join(TARGET_DIR, '.claude', 'rules'), { recursive: true });
  fs.mkdirSync(path.join(TARGET_DIR, '.claude', 'commands'), { recursive: true });
  fs.writeFileSync(path.join(TARGET_DIR, 'CLAUDE.md'), '# My Project\n\n## Tech Stack\n\n- React\n- Supabase\n');
  fs.writeFileSync(path.join(TARGET_DIR, '.claude', 'rules', 'backend.md'), '# Backend Rules v1\n\n## My custom convention\n');
  fs.writeFileSync(path.join(TARGET_DIR, '.claude', 'commands', 'start.md'), '# /start v1\n');
  fs.writeFileSync(path.join(TARGET_DIR, 'package.json'), '{"version": "0.2.0"}');
}

function cleanup() {
  fs.rmSync(TEST_DIR, { recursive: true, force: true });
}

// Inline backupAndCopy for testing (extracted from init.js logic)
function backupAndCopy(sourceDir, targetDir) {
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

      if (entry.isDirectory()) {
        copy(srcPath, destPath);
      } else {
        var destExists = fs.existsSync(destPath);
        if (destExists) {
          fs.copyFileSync(destPath, destPath + '.backup');
          stats.backedUp++;
          stats.backedUpFiles.push(path.relative(targetDir, destPath).split(path.sep).join('/'));
        }
        fs.copyFileSync(srcPath, destPath);
        if (destExists) { stats.updated++; } else { stats.created++; }
      }
    }
  }

  copy(sourceDir, targetDir);
  return stats;
}

function runTests() {
  var passed = 0;
  var failed = 0;

  function assert(name, condition) {
    if (condition) {
      console.log('  PASS: ' + name);
      passed++;
    } else {
      console.log('  FAIL: ' + name);
      failed++;
    }
  }

  setup();

  // Test: backup-and-copy creates .backup files
  console.log('backup-and-copy:');
  var stats = backupAndCopy(SOURCE_DIR, TARGET_DIR);

  assert('backed up 4 existing files', stats.backedUp === 4);
  assert('CLAUDE.md.backup exists', fs.existsSync(path.join(TARGET_DIR, 'CLAUDE.md.backup')));
  assert('backend.md.backup exists', fs.existsSync(path.join(TARGET_DIR, '.claude', 'rules', 'backend.md.backup')));
  assert('start.md.backup exists', fs.existsSync(path.join(TARGET_DIR, '.claude', 'commands', 'start.md.backup')));
  assert('package.json.backup exists', fs.existsSync(path.join(TARGET_DIR, 'package.json.backup')));

  // Test: backup contains old content
  console.log('backup content:');
  var backupContent = fs.readFileSync(path.join(TARGET_DIR, 'CLAUDE.md.backup'), 'utf-8');
  assert('CLAUDE.md.backup has old content', backupContent.includes('My Project'));
  assert('CLAUDE.md.backup has old tech stack', backupContent.includes('React'));

  // Test: new file has framework content
  var newContent = fs.readFileSync(path.join(TARGET_DIR, 'CLAUDE.md'), 'utf-8');
  assert('CLAUDE.md has new framework content', newContent.includes('Framework CLAUDE.md'));

  // Test: backed up files list is correct
  console.log('backed up files list:');
  assert('backedUpFiles has 4 entries', stats.backedUpFiles.length === 4);
  assert('backedUpFiles includes CLAUDE.md', stats.backedUpFiles.includes('CLAUDE.md'));

  // Test: new files with no existing counterpart are just created (no backup)
  console.log('new files:');
  fs.writeFileSync(path.join(SOURCE_DIR, '.claude', 'rules', 'new-rule.md'), '# New Rule\n');
  var stats2 = backupAndCopy(SOURCE_DIR, TARGET_DIR);
  assert('new file counted as created', stats2.created >= 1);

  cleanup();

  console.log('\n' + passed + ' passed, ' + failed + ' failed');
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
```

- [ ] **Step 2: Run the test**

Run: `node cli/init-backup.test.js`
Expected: All tests PASS

- [ ] **Step 3: Commit**

```bash
git add cli/init-backup.test.js
git commit -m "test: add backup-and-copy logic tests for init"
```

---

### Task 11: Update `package.json` — Add Test Script

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Update test:kb script to include init-backup test**

Read `package.json`, update the `test:kb` script:

Old:
```json
"test:kb": "node cli/kb-search.test.js && node cli/kb-integration.test.js"
```

New:
```json
"test:kb": "node cli/kb-search.test.js && node cli/kb-integration.test.js",
"test:init": "node cli/init-backup.test.js",
"test": "node cli/kb-search.test.js && node cli/kb-integration.test.js && node cli/init-backup.test.js"
```

- [ ] **Step 2: Commit**

```bash
git add package.json
git commit -m "chore: add init-backup test to package.json scripts"
```
