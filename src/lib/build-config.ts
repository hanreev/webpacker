/**
 * Webpacker for webpack
 * https://github.com/hanreev/webpacker
 */

import autoprefixer from 'autoprefixer';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import cssnano from 'cssnano';
import fs from 'fs';
import glob from 'glob';
import merge from 'lodash.merge';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import NoEmitPlugin from 'no-emit-webpack-plugin';
import path from 'path';
import * as postcss from 'postcss';
import TerserPlugin from 'terser-webpack-plugin';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import yargs from 'yargs';

import { HashOutputPlugin } from '../plugins/hash-output';

export interface WebpackerConfig {
  outputPath?: string;
  publicPath?: string;
  entries?: { [destPath: string]: string | string[] };
  splitChunks?: webpack.Options.SplitChunksOptions;
  runtimeChunk?: boolean | 'single' | 'multiple' | webpack.Options.RuntimeChunkOptions;
  providers?: { [key: string]: string };
  copies?: { [destPath: string]: string };
  sourceMap?: boolean | 'auto';
  hashOutput?: boolean | string;
  watchExclude?: string[];
  devServer?: WebpackDevServer.Configuration;
  webpackConfig?: webpack.Configuration;
}

// Configuration
const defaultConfigs: WebpackerConfig = {
  outputPath: '',
  publicPath: '',
  entries: {},
  runtimeChunk: false,
  sourceMap: 'auto',
  hashOutput: true,
  watchExclude: [],
};

const resolveName = (src: string, dest: string) => {
  dest = dest.replace('[name]', path.basename(src));
  dest = dest.replace('[basename]', path.basename(src, path.extname(src)));
  dest = dest.replace('[ext]', path.extname(src).replace(/^\./, ''));
  return dest;
};

export const buildConfig = (configs: WebpackerConfig, argv: yargs.Arguments<WebpackerArgs>): webpack.Configuration => {
  configs = Object.assign({}, defaultConfigs, configs);

  const development = argv.mode === 'development';
  const sourceMap = configs.sourceMap === 'auto' ? development : configs.sourceMap;

  const postcssLoader: webpack.Loader = {
    loader: 'postcss-loader',
    options: {
      sourceMap,
      ident: 'postcss',
      plugins: [autoprefixer] as postcss.Plugin<any>[],
    },
  };

  if (!development)
    postcssLoader.options.plugins.push(cssnano({ preset: ['default', { discardComments: { removeAll: true } }] }));

  const resolveUrlLoader: webpack.Loader = {
    loader: 'resolve-url-loader',
    options: { root: path.resolve(process.cwd(), 'node_modules') },
  };

  const noEmitPaths: string[] = [];

  const entry = () => {
    const entries: { [key: string]: string | string[] } = {};

    Object.keys(configs.entries).forEach(destPath => {
      const srcPath = configs.entries[destPath];
      const hasPlaceholder = /\[(name|basename|ext)\]/.test(destPath);
      if (Array.isArray(srcPath))
        if (hasPlaceholder) srcPath.forEach(src => (entries[resolveName(src, destPath)] = src));
        else entries[destPath] = srcPath;
      else if (!fs.existsSync(path.resolve(process.cwd(), srcPath))) {
        if (!hasPlaceholder) entries[destPath] = [];
        glob.sync(path.resolve(process.cwd(), srcPath)).forEach(file => {
          if (hasPlaceholder) entries[resolveName(file, destPath)] = file;
          else (entries[destPath] as string[]).push(file);
        });
      } else entries[destPath] = srcPath;
    });

    const finalEntries: { [key: string]: string | string[] } = {};
    Object.keys(entries).forEach(key => {
      const value = entries[key];
      if (key.endsWith('.css')) {
        key = key.replace(/\.css$/, '');
        noEmitPaths.push(key);
      }
      finalEntries[key] = value;
    });

    return finalEntries;
  };

  // Plugins
  const plugins: webpack.Plugin[] = [
    new MiniCssExtractPlugin({ filename: '[name].css' }),
    new NoEmitPlugin(noEmitPaths),
  ];

  if (configs.providers) plugins.push(new webpack.ProvidePlugin(configs.providers));
  if (configs.copies)
    plugins.push(
      new CopyWebpackPlugin({
        patterns: Object.keys(configs.copies).map(destPath => {
          return {
            from: path.resolve(process.cwd(), configs.copies[destPath]),
            to: path.resolve(process.cwd(), configs.outputPath, destPath),
          };
        }),
      })
    );

  if (sourceMap) plugins.push(new webpack.SourceMapDevToolPlugin());

  if (configs.hashOutput) {
    let hashOutputPath: string = null;
    if (typeof configs.hashOutput === 'string') hashOutputPath = configs.hashOutput;
    plugins.push(new HashOutputPlugin(hashOutputPath));
  }

  // Webpack configs
  let webpackConfig: webpack.Configuration = {
    entry,
    resolve: {
      extensions: ['.js', '.ts'],
    },
    target: 'web',
    mode: development ? 'development' : 'production',
    stats: {
      all: undefined,
      assets: true,
      assetsSort: 'name',
      children: false,
      entrypoints: false,
      modules: false,
    },
    output: {
      path: path.resolve(process.cwd(), configs.outputPath),
      publicPath: configs.publicPath,
      filename: '[name]',
    },
    optimization: {
      minimizer: [
        new TerserPlugin({
          parallel: true,
          sourceMap,
          terserOptions: {
            output: {
              comments: false,
            },
          },
        }),
      ],
      splitChunks: configs.splitChunks,
      runtimeChunk: configs.runtimeChunk,
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: 'ts-loader',
        },
        {
          test: /\.css$/,
          use: [MiniCssExtractPlugin.loader, 'css-loader', postcssLoader, resolveUrlLoader],
        },
        {
          test: /\.s[ac]ss$/,
          use: [MiniCssExtractPlugin.loader, 'css-loader', postcssLoader, resolveUrlLoader, 'sass-loader'],
        },
        {
          test: /(\.(png|jpe?g|gif)$|^((?!(font)).)*\.svg$)/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: (assetPath: string) => {
                  if (!/node_modules|bower_components/.test(assetPath)) return 'images/[name].[ext]?[hash]';

                  return (
                    'images/vendor/' +
                    assetPath
                      .replace(/\\/g, '/')
                      .replace(/((.*(node_modules|bower_components))|images|image|img|assets|dist)\//g, '') +
                    '?[hash]'
                  );
                },
              },
            },
            'img-loader',
          ],
        },
        {
          test: /(\.(woff2?|ttf|eot|otf)$|font.*\.svg$)/,
          use: {
            loader: 'file-loader',
            options: {
              name: (assetPath: string) => {
                if (!/node_modules|bower_components/.test(assetPath)) return 'fonts/[name].[ext]?[hash]';

                return (
                  'fonts/vendor/' +
                  assetPath
                    .replace(/\\/g, '/')
                    .replace(/((.*(node_modules|bower_components))|fonts|font|assets|dist)\//g, '') +
                  '?[hash]'
                );
              },
            },
          },
        },
      ],
    },
    plugins,
    watchOptions: {
      ignored: ['node_modules'].concat(configs.watchExclude),
    },
    devServer: configs.devServer,
  };

  if (configs.webpackConfig) webpackConfig = merge(webpackConfig, configs.webpackConfig);

  return webpackConfig;
};

export default buildConfig;
