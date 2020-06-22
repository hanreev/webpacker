#!/usr/bin/env node

/**
 * Webpacker for webpack
 * https://github.com/hanreev/webpacker
 */

import fs from 'fs';
import merge from 'lodash.merge';
import path from 'path';
import webpack from 'webpack';
import yargs from 'yargs';

import { buildConfig } from '../lib/build-config';
import { webpackerCompiler } from '../lib/compiler';
import { webpackerDevServer } from '../lib/dev-server';

type ConfigurationType =
  | webpack.Configuration
  | webpack.Configuration[]
  | Promise<webpack.Configuration | webpack.Configuration[]>
  | ((
      env: { [key: string]: any } | undefined,
      argv: { [key: string]: any }
    ) => webpack.Configuration | webpack.Configuration[]);

function handler(mode: 'development' | 'production' = 'production', watch = false, withServer = false) {
  return (args: yargs.Arguments<WebpackerArgs>) => {
    args.mode = mode;
    args.watch = watch;
    let config: webpack.Configuration;
    try {
      config = buildConfig(require(args.config), args);
    } catch (err) {
      throw err;
    }

    const compile = (conf: webpack.Configuration | webpack.Configuration[] = {}) => {
      if (!Array.isArray(conf)) conf = [conf];
      if (withServer) webpackerDevServer(merge(config, ...conf), args);
      else webpackerCompiler(merge(config, ...conf), args);
    };

    let webpackConfig: ConfigurationType;
    if (args.merge && fs.existsSync(args.merge))
      try {
        webpackConfig = require(args.merge);

        if (webpackConfig instanceof Promise) webpackConfig.then(c => compile(c));
        else if (typeof webpackConfig === 'function') compile(webpackConfig.apply(null, [process.env, process.argv]));
        else compile(webpackConfig);
      } catch (error) {
        console.log('Unable to merge with provided webpack config');
      }
    else compile();
  };
}

const serverBuilder = (argv: yargs.Argv) => {
  argv.options(require('webpack-dev-server/bin/options'));
  return argv;
};

const initBuilder = (argv: yargs.Argv) => {
  argv.options({
    out: {
      type: 'string',
      alias: 'o',
      describe: 'Webpacker config output path',
      default: path.resolve(process.cwd(), 'webpacker.config.js'),
    },
  });
  return argv;
};

const initConfig = (args: yargs.Arguments) => {
  const configTemplatePath = path.resolve(__dirname, '../lib/webpacker.config.template');
  let outputPath = path.resolve(args.out as string);

  if (fs.existsSync(outputPath) && fs.statSync(outputPath).isDirectory())
    outputPath = path.join(outputPath, 'webpacker.config.js');

  if (fs.existsSync(outputPath)) return console.error(`${outputPath} already exists`);

  fs.copyFileSync(configTemplatePath, outputPath);
  console.log(`${outputPath} created successfully`);
};

yargs.usage('Usage: $0 <command> [options]').demandCommand().alias('help', 'h').alias('version', 'v');

yargs.command(['production', 'prod', '$0'], 'Compile assets for production', {}, handler());
yargs.command(['development', 'dev'], 'Compile assets for development', {}, handler('development'));
yargs.command('watch', 'Compile assets for production', {}, handler('development', true));
yargs.command('server', 'Compile assets and start dev server', serverBuilder, handler('development', false, true));
yargs.command('init', 'Generate webpacker configuration', initBuilder, initConfig);

yargs.options({
  config: {
    type: 'string',
    alias: 'c',
    describe: 'Webpacker config path',
    default: path.resolve(process.cwd(), 'webpacker.config.js'),
  },
  merge: {
    type: 'string',
    alias: 'm',
    describe: 'Merge with provided webpack config',
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
      return require('supports-color').stdout;
    },
  },
  json: {
    type: 'boolean',
    alias: 'j',
    describe: 'Prints the result as JSON.',
  },
});

yargs.parse();
