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
  case '--version':
  case '-v':
    console.log(require('../package.json').version);
    break;
  case '--help':
  case '-h':
  case undefined:
    console.log(`
AIDevelopmentFramework — The system around the AI that makes the AI reliable.

Usage:
  npx ai-development-framework init          Download and set up the framework in the current project
  npx ai-development-framework update        Update framework files to the latest version
  npx ai-development-framework --version     Show version
  npx ai-development-framework --help        Show this help message

Knowledge base tools (run from your project after install):
  node cli/kb-search.js index                                     Build / rebuild the wiki search index
  node cli/kb-search.js search <q> [--type=T] [--tag=T] [--limit=N]
                                              Search the wiki (prints JSON)
  node cli/kb-search.js stats                                     Print KB statistics
  node cli/lean-index.js                                          (coming soon) lean context index builder

Docs: https://github.com/cristian-robert/AIDevelopmentFramework
    `);
    break;
  default:
    console.error('Unknown command: ' + command);
    console.log('Run "npx ai-development-framework --help" for usage information.');
    process.exit(1);
}
