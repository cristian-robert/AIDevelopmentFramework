const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function detectTechStack() {
  const detected = [];
  try {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
    const deps = Object.assign({}, pkg.dependencies, pkg.devDependencies);
    if (deps['next']) detected.push('Next.js');
    if (deps['react']) detected.push('React');
    if (deps['vue']) detected.push('Vue');
    if (deps['express']) detected.push('Express');
    if (deps['@nestjs/core']) detected.push('NestJS');
    if (deps['expo']) detected.push('Expo');
    if (deps['@supabase/supabase-js']) detected.push('Supabase');
    if (deps['tailwindcss']) detected.push('Tailwind');
    if (deps['stripe']) detected.push('Stripe');
  } catch (e) {
    // No package.json or parse error
  }

  if (fs.existsSync('requirements.txt') || fs.existsSync('pyproject.toml')) {
    detected.push('Python');
  }
  if (fs.existsSync('go.mod')) {
    detected.push('Go');
  }

  return detected;
}

async function main() {
  console.log('\nWelcome to AIDevelopmentFramework!\n');

  const hasGit = fs.existsSync('.git');
  const hasClaudeDir = fs.existsSync('.claude');

  const projectType = await ask(
    'Is this a new project or existing codebase? (new/existing): '
  );

  const stack = detectTechStack();
  if (stack.length > 0) {
    console.log('\nDetected tech stack: ' + stack.join(', '));
    await ask('Press Enter to confirm (or type your stack): ');
  } else {
    await ask('What tech stack are you using? ');
  }

  await ask('Do you use GitHub Issues for task tracking? (yes/no): ');

  // Copy .claude/ structure
  if (!hasClaudeDir) {
    const frameworkDir = path.join(__dirname, '..');
    const sourceClaudeDir = path.join(frameworkDir, '.claude');
    const targetClaudeDir = path.join(process.cwd(), '.claude');
    console.log('\nCopying .claude/ framework structure...');
    copyDirRecursive(sourceClaudeDir, targetClaudeDir);
    console.log('  Done.');
  } else {
    console.log('\n.claude/ already exists. Skipping copy.');
  }

  // Create docs directory
  const docsDir = path.join(process.cwd(), 'docs', 'plans');
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
    console.log('Created docs/plans/ directory.');
  }

  console.log('\nSetup complete!\n');
  console.log('Next steps:');
  console.log('  1. Run /setup in Claude Code to check plugin dependencies');
  console.log('  2. Run /prime to load codebase context');
  console.log('  3. Run /start to begin your first task\n');

  rl.close();
}

main().catch(function (err) {
  console.error('Error: ' + err.message);
  process.exit(1);
});
