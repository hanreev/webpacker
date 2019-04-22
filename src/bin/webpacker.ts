#!/usr/bin/env node

/**
 * Webpacker for webpack
 * https://github.com/hanreev/webpacker
 */

import * as path from 'path'
import * as yargs from 'yargs'
import * as webpack from 'webpack'
import { buildConfig } from '../lib/build-config'
import { webpackerCompiler } from '../lib/compiler'
import { webpackerDevServer } from '../lib/dev-server';

function handler(mode: 'development' | 'production' = 'production', watch = false, withServer = false) {
  return (argv: yargs.Arguments<WebpackerArgv>) => {
    argv.mode = mode
    argv.watch = watch
    let config: webpack.Configuration
    try {
      config = buildConfig(require(argv.config), argv)
    } catch (err) {
      throw err
    }

    if (withServer)
      webpackerDevServer(config, argv)
    else
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
yargs.command('server', 'Compile assets and start dev server', yargs => {
  yargs.options(require('webpack-dev-server/bin/options'))
  return yargs
}, handler('development', true, true))

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
    default: function supportsColor() {
      return require('supports-color').stdout
    },
    describe: 'Enables/Disables colors on the console',
  },
  json: {
    type: 'boolean',
    alias: 'j',
    describe: 'Prints the result as JSON.'
  }
})

yargs.parse()
