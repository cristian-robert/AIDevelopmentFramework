#!/usr/bin/env node

const command = process.argv[2];

switch (command) {
  case 'init':
    require('./init.js');
    break;
  case 'update':
    require('./update.js');
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

Docs: https://github.com/cristian-robert/AIDevelopmentFramework
    `);
    break;
  default:
    console.error('Unknown command: ' + command);
    console.log('Run "npx ai-development-framework --help" for usage information.');
    process.exit(1);
}
