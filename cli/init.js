const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const readline = require('readline');

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

function downloadFramework(targetDir) {
  var tmpDir = path.join(require('os').tmpdir(), 'ai-framework-' + Date.now());
  fs.mkdirSync(tmpDir, { recursive: true });

  console.log('Downloading latest framework from GitHub...');

  try {
    // Download and extract tarball
    execFileSync('curl', ['-sL', TARBALL_URL, '-o', path.join(tmpDir, 'framework.tar.gz')]);
    execFileSync('tar', ['-xzf', path.join(tmpDir, 'framework.tar.gz'), '-C', tmpDir, '--strip-components=1']);

    // Copy .claude/ folder
    var sourceClaudeDir = path.join(tmpDir, '.claude');
    var targetClaudeDir = path.join(targetDir, '.claude');

    if (fs.existsSync(sourceClaudeDir)) {
      console.log('Installing .claude/ framework structure...');
      copyDirRecursive(sourceClaudeDir, targetClaudeDir);
    }

    // Copy docs/ folder
    var sourceDocsDir = path.join(tmpDir, 'docs');
    var targetDocsDir = path.join(targetDir, 'docs');

    if (fs.existsSync(sourceDocsDir)) {
      console.log('Installing docs/...');
      copyDirRecursive(sourceDocsDir, targetDocsDir);
    }

    return true;
  } catch (err) {
    console.error('Download failed: ' + err.message);
    console.log('');
    console.log('Falling back to local copy...');
    return false;
  } finally {
    // Cleanup tmp
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch (e) {
      // ignore cleanup errors
    }
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
      // ignore read errors
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

  // Check if .claude/ already exists
  if (hasClaudeDir) {
    var overwrite = await ask('.claude/ already exists. Overwrite? (yes/no): ');
    if (overwrite.toLowerCase() !== 'yes' && overwrite.toLowerCase() !== 'y') {
      console.log('Aborted. Use "npx ai-framework update" to update existing installation.');
      rl.close();
      return;
    }
  }

  // Detect tech stack
  var stack = detectTechStack();
  if (stack.length > 0) {
    console.log('Detected tech stack: ' + stack.join(', '));
  }

  // Download from GitHub (latest version)
  var downloaded = downloadFramework(targetDir);

  // Fall back to local copy if download fails (when installed via npm)
  if (!downloaded) {
    var frameworkDir = path.join(__dirname, '..');
    var localClaudeDir = path.join(frameworkDir, '.claude');
    if (fs.existsSync(localClaudeDir)) {
      console.log('Copying from local package...');
      copyDirRecursive(localClaudeDir, path.join(targetDir, '.claude'));

      var localDocsDir = path.join(frameworkDir, 'docs');
      if (fs.existsSync(localDocsDir)) {
        copyDirRecursive(localDocsDir, path.join(targetDir, 'docs'));
      }
    } else {
      console.error('No local framework files found. Please check your installation.');
      rl.close();
      process.exit(1);
    }
  }

  // Create docs/plans directory
  var plansDir = path.join(targetDir, 'docs', 'plans');
  if (!fs.existsSync(plansDir)) {
    fs.mkdirSync(plansDir, { recursive: true });
  }

  // Init git if needed
  if (!hasGit) {
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

  console.log('');
  console.log('Setup complete!');
  console.log('');
  console.log('Installed:');
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

  rl.close();
}

main().catch(function (err) {
  console.error('Error: ' + err.message);
  process.exit(1);
});
