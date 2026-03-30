#!/usr/bin/env node

const command = process.argv[2];

switch (command) {
  case 'init':
    require('./init.js');
    break;
  case '--help':
  case '-h':
  case undefined:
    console.log(`
AIDevelopmentFramework CLI

Usage:
  ai-framework init        Set up the framework in the current project
  ai-framework --help      Show this help message
    `);
    break;
  default:
    console.error('Unknown command: ' + command);
    console.log('Run "ai-framework --help" for usage information.');
    process.exit(1);
}
