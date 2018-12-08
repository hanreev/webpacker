#!/usr/bin/env node

import * as path from 'path'
import * as yargs from 'yargs'
import { Configuration as WebpackConfig } from 'webpack'
import { buildConfig } from '../lib/build-config'
import { webpackerCompiler } from '../lib/compiler'

const handler = (mode: 'development' | 'production' = 'production', watch = false) => {
  return argv => {
    argv.mode = mode
    argv.watch = watch
    let config: WebpackConfig
    try {
      config = buildConfig(require(argv.config), argv)
    } catch (err) {
      throw err
    }
    config.mode = mode
    webpackerCompiler(config, argv)
  }
}

yargs.usage('Usage: $0 <command> [options]')
  .demandCommand()
  .alias('help', 'h')
  .alias('version', 'v')

yargs.command(['production', 'prod', '$0'], 'Compile assets for production', {}, handler())
yargs.command(['development', 'dev'], 'Compile assets for development', {}, handler('development'))
yargs.command('watch', 'Compile assets for production', {}, handler('development', true))

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
