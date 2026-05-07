#!/usr/bin/env node
'use strict';

// ─── File-Size Guardrail Lint ─────────────────────────────────────────────────
//
// Walks the framework's context files (CLAUDE.md, .claude/rules/, .claude/commands/,
// .claude/references/) and reports anything past the budgets defined in
// .claude/references/_shared/file-size-guard.md. Default mode prints a table;
// --json emits a machine-readable summary for /evolve to consume.
//
// Exit codes: 0 = all green; 1 = soft-cap warnings; 2 = hard-cap blockers.
// /evolve treats exit 2 as a blocker and refuses to ship until the file is
// shrunk; exit 1 is informational.

const fs = require('fs');
const path = require('path');

// ─── Budgets ──────────────────────────────────────────────────────────────────
//
// Mirror the table in .claude/references/_shared/file-size-guard.md. If you
// change one, change both — there is no single source of truth on purpose, the
// markdown is for humans and this is for machines, and divergence is caught by
// the test in file-size-check.test.js.

const MULTI_PHASE_COMMANDS = new Set([
  'start.md',
  'merge-configs.md',
  'plan-feature.md',
  'plan-project.md',
  'create-prd.md',
]);

const RULES = [
  {
    name: 'project-root',
    match: (rel) => rel === 'CLAUDE.md',
    soft: 120,
    hard: 150,
  },
  {
    name: 'rule',
    match: (rel) => rel.startsWith('.claude/rules/') && rel.endsWith('.md'),
    soft: 60,
    hard: 80,
  },
  {
    name: 'command',
    match: (rel) => {
      if (!rel.startsWith('.claude/commands/') || !rel.endsWith('.md')) return false;
      const base = path.basename(rel);
      return !MULTI_PHASE_COMMANDS.has(base);
    },
    soft: 60,
    hard: 80,
  },
  {
    name: 'command-multi-phase',
    match: (rel) => {
      if (!rel.startsWith('.claude/commands/') || !rel.endsWith('.md')) return false;
      return MULTI_PHASE_COMMANDS.has(path.basename(rel));
    },
    soft: 80,
    hard: 100,
  },
  {
    name: 'reference-shared',
    match: (rel) => rel.startsWith('.claude/references/_shared/') && rel.endsWith('.md'),
    soft: 80,
    hard: 120,
  },
  {
    name: 'reference-per-command',
    match: (rel) => {
      if (!rel.startsWith('.claude/references/') || !rel.endsWith('.md')) return false;
      const sub = rel.slice('.claude/references/'.length);
      return sub.includes('/') && !sub.startsWith('_shared/');
    },
    soft: 120,
    hard: 200,
  },
  {
    name: 'reference-domain',
    match: (rel) => {
      if (!rel.startsWith('.claude/references/') || !rel.endsWith('.md')) return false;
      const sub = rel.slice('.claude/references/'.length);
      return !sub.includes('/');
    },
    soft: 200,
    hard: 300,
  },
];

// ─── Walking ──────────────────────────────────────────────────────────────────

function walk(dir, root, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.git')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, root, out);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      out.push(path.relative(root, full));
    }
  }
}

function classify(rel) {
  for (const rule of RULES) if (rule.match(rel)) return rule;
  return null;
}

function lineCount(file) {
  const text = fs.readFileSync(file, 'utf8');
  if (text.length === 0) return 0;
  let n = 1;
  for (let i = 0; i < text.length; i++) if (text.charCodeAt(i) === 10) n++;
  if (text.charCodeAt(text.length - 1) === 10) n--;
  return n;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function run(rootArg) {
  const root = path.resolve(rootArg || process.cwd());
  const candidates = [];

  const claudeMd = path.join(root, 'CLAUDE.md');
  if (fs.existsSync(claudeMd)) candidates.push('CLAUDE.md');

  for (const sub of ['rules', 'commands', 'references']) {
    const dir = path.join(root, '.claude', sub);
    if (fs.existsSync(dir)) walk(dir, root, candidates);
  }

  const findings = [];
  for (const rel of candidates) {
    const rule = classify(rel);
    if (!rule) continue;
    const lines = lineCount(path.join(root, rel));
    let level = 'ok';
    if (lines > rule.hard) level = 'block';
    else if (lines > rule.soft) level = 'warn';
    findings.push({ file: rel, klass: rule.name, lines, soft: rule.soft, hard: rule.hard, level });
  }

  return findings;
}

function summarize(findings) {
  const warn = findings.filter((f) => f.level === 'warn');
  const block = findings.filter((f) => f.level === 'block');
  return { total: findings.length, warn: warn.length, block: block.length, warnFiles: warn, blockFiles: block };
}

function format(findings) {
  const violations = findings.filter((f) => f.level !== 'ok');
  if (violations.length === 0) return 'file-size-check: all files within budget';
  const lines = ['file-size-check:'];
  for (const f of violations.sort((a, b) => (a.level === b.level ? b.lines - a.lines : a.level < b.level ? 1 : -1))) {
    const tag = f.level === 'block' ? '[BLOCK]' : '[warn]';
    lines.push(`  ${tag} ${f.file} — ${f.lines} lines (${f.klass}: soft ${f.soft}, hard ${f.hard})`);
  }
  return lines.join('\n');
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const json = args.includes('--json');
  const rootArg = args.find((a) => !a.startsWith('--'));
  const findings = run(rootArg);
  const summary = summarize(findings);
  if (json) {
    process.stdout.write(JSON.stringify({ findings, summary }, null, 2) + '\n');
  } else {
    process.stdout.write(format(findings) + '\n');
  }
  if (summary.block > 0) process.exit(2);
  if (summary.warn > 0) process.exit(1);
  process.exit(0);
}

module.exports = { run, summarize, format, RULES };
