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

  // Knowledge base content (default path — actual path configured per-project in CLAUDE.md)
  // These are hints for the /start merge flow. The backup-everything strategy
  // in init/update protects files regardless of whether they're in this list.
  '.obsidian/wiki/_index.md',
  '.obsidian/wiki/_tags.md',
  '.obsidian/raw/_manifest.md',
];

// Directories with project-specific content — always restore from backup.
var NEEDS_RESTORE = [
  '.claude/agents/architect-agent/modules',
  '.claude/agents/architect-agent/frontend',
  // Knowledge base directories (default path — see note above)
  '.obsidian/wiki',
  '.obsidian/raw',
];

// Framework-shipped CLI files that init.js and update.js must copy into
// the target project alongside the .claude/ tree. Listing them here gives
// a single source of truth so adding a new CLI tool (e.g. cli/lean-index.js)
// only requires touching this catalog plus the install/update copy loops.
var FRAMEWORK_CLI_FILES = [
  'cli/kb-search.js',
  'cli/lean-index.js',
  'cli/merge-settings.js',
  'cli/file-size-check.js',
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
  FRAMEWORK_CLI_FILES: FRAMEWORK_CLI_FILES,
  toProjectRelative: toProjectRelative,
};
