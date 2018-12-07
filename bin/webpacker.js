#!/usr/bin/env node

const path = require('path')
const yargs = require('yargs')

yargs.usage('Usage: $0 <command> [options]')
  .commandDir('../commands')
  .demandCommand()
  .alias('help', 'h')
  .alias('version', 'v')

yargs.options({
  config: {
    type: 'string',
    alias: 'c',
    describe: 'Webpacker config path',
    default: path.resolve(process.cwd(), 'webpacker.config.js'),
  },
  progress: {
    type: 'boolean',
    alias: 'p',
    describe: 'Print compilation progress in percentage',
  },
  color: {
    type: 'boolean',
    alias: 'colors',
    describe: 'Enables/Disables colors on the console',
  },
  json: {
    type: 'boolean',
    alias: 'j',
    describe: 'Prints the result as JSON.'
  }
})

yargs.parse()
