#!/usr/bin/env node

const command = process.argv[2];

switch (command) {
  case 'init':
    // init.js only runs main() when invoked directly (to keep requiring it
    // from tests side-effect-free). Call the exported main() explicitly.
    require('./init.js').main().catch(function (err) {
      console.error('Error: ' + err.message);
      process.exit(1);
    });
    break;
  case 'update':
    // update.js only runs main() when invoked directly (to keep requiring it
    // from tests side-effect-free). Call the exported main() explicitly.
    require('./update.js').main();
    break;
  case 'lean-index': {
    // Expose the lean-index builder as a top-level subcommand. Same
    // side-effect-free import pattern: lean-index.js only builds when
    // invoked as __main__, so calling buildLeanIndex() here is explicit.
    const { buildLeanIndex } = require('./lean-index.js');
    const idx = buildLeanIndex();
    console.log('Lean-indexed ' + idx.docs.length + ' articles');
    break;
  }
  case '--version':
  case '-v':
    console.log(require('../package.json').version);
    break;
  case '--help':
  case '-h':
  case undefined: {
    // Pull kb-search help from the canonical source rather than duplicating
    // flag / subcommand text here. Indent each line by two spaces so it
    // aligns with the surrounding sections.
    const kbHelp = require('./kb-search.js').HELP_TEXT
      .split('\n')
      .map(function (line) { return line ? '  ' + line : line; })
      .join('\n');
    console.log(`
AIDevelopmentFramework — The system around the AI that makes the AI reliable.

Usage:
  npx ai-development-framework init          Download and set up the framework in the current project
  npx ai-development-framework update        Update framework files to the latest version
  npx ai-development-framework lean-index    Rebuild the lean (metadata-only) KB index
  npx ai-development-framework --version     Show version
  npx ai-development-framework --help        Show this help message

Knowledge base tools (run from your project after install):
  Invoke as: node cli/kb-search.js <command> [args] [flags]

${kbHelp}

  node cli/lean-index.js [build|print]                            Build or print the lean (metadata-only) index

Docs: https://github.com/cristian-robert/AIDevelopmentFramework
    `);
    break;
  }
  default:
    console.error('Unknown command: ' + command);
    console.log('Run "npx ai-development-framework --help" for usage information.');
    process.exit(1);
}
