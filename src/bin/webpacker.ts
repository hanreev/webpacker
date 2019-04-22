#!/usr/bin/env node

/**
 * Webpacker for webpack
 * https://github.com/hanreev/webpacker
 */

import * as fs from 'fs'
import * as path from 'path'
import * as yargs from 'yargs'
import * as webpack from 'webpack'
import { buildConfig } from '../lib/build-config'
import { webpackerCompiler } from '../lib/compiler'
import { webpackerDevServer } from '../lib/dev-server';

function handler(mode: 'development' | 'production' = 'production', watch = false, withServer = false) {
  return (args: yargs.Arguments<WebpackerArgs>) => {
    args.mode = mode
    args.watch = watch
    let config: webpack.Configuration
    try {
      config = buildConfig(require(args.config), args)
    } catch (err) {
      throw err
    }

    if (withServer)
      webpackerDevServer(config, args)
    else
      webpackerCompiler(config, args)
  }
}

const serverBuilder = (_yargs: yargs.Argv) => {
  _yargs.options(require('webpack-dev-server/bin/options'))
  return _yargs
}

const initBuilder = (_yargs: yargs.Argv) => {
  _yargs.options({
    out: {
      type: 'string',
      alias: 'o',
      describe: 'Webpacker config output path',
      default: path.resolve(process.cwd(), 'webpacker.config.js')
    }
  })
  return _yargs
}

const initConfig = (args: yargs.Arguments) => {
  const configTemplatePath = path.resolve(__dirname, '../lib/webpacker.config.template')
  console.log(configTemplatePath)
  let outputPath = path.resolve(args.out as string)

  if (fs.statSync(outputPath).isDirectory())
    outputPath = path.join(outputPath, 'webpacker.config.js')

  if (fs.existsSync(outputPath))
    return console.error(`${outputPath} already exists`)

  fs.copyFileSync(configTemplatePath, outputPath)
  console.log(`${outputPath} created successfully`)
}

yargs.usage('Usage: $0 <command> [options]')
  .demandCommand()
  .alias('help', 'h')
  .alias('version', 'v')

yargs.command(['production', 'prod', '$0'], 'Compile assets for production', {}, handler())
yargs.command(['development', 'dev'], 'Compile assets for development', {}, handler('development'))
yargs.command('watch', 'Compile assets for production', {}, handler('development', true))
yargs.command('server', 'Compile assets and start dev server', serverBuilder, handler('development', false, true))
yargs.command('init', 'Generate webpacker configuration', initBuilder, initConfig)

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
    default: function supportsColor() {
      return require('supports-color').stdout
    },
  },
  json: {
    type: 'boolean',
    alias: 'j',
    describe: 'Prints the result as JSON.'
  }
})

yargs.parse()
