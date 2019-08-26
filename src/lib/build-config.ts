/**
 * Webpacker for webpack
 * https://github.com/hanreev/webpacker
 */

import autoprefixer from 'autoprefixer';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import cssnano from 'cssnano';
import fs from 'fs';
import glob from 'glob';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import NoEmitPlugin from 'no-emit-webpack-plugin';
import path from 'path';
import TerserPlugin from 'terser-webpack-plugin';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import yargs from 'yargs';

import { styles } from '@ckeditor/ckeditor5-dev-utils';
import CKEditorWebpackPlugin from '@ckeditor/ckeditor5-dev-webpack-plugin';

import { HashOutputPlugin } from '../plugins/hash-output';

import postcss = require('postcss');

interface WebpackerConfig {
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
  ckEditor?: { language: string; themePath: string };
}

// Configuration
const defaultConfigs: WebpackerConfig = {
  outputPath: '',
  publicPath: '',
  entries: {},
  splitChunks: {},
  runtimeChunk: false,
  providers: {},
  copies: {},
  sourceMap: 'auto',
  hashOutput: true,
  watchExclude: [],
  ckEditor: { language: 'en', themePath: '@ckeditor/ckeditor5-theme-lark' },
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

  // Loaders
  const sassLoader: webpack.Loader = {
    loader: 'sass-loader',
    options: { sourceMap },
  };

  const cssLoader: webpack.Loader = {
    loader: 'css-loader',
    options: { sourceMap },
  };

  const postcssLoader: webpack.Loader = {
    loader: 'postcss-loader',
    options: {
      sourceMap,
      ident: 'postcss',
      plugins: [autoprefixer] as postcss.Plugin<any>[],
    },
  };

  if (!development)
    postcssLoader.options.plugins.push(
      cssnano({
        preset: [
          'default',
          {
            discardComments: { removeAll: true },
          },
        ],
      }),
    );

  const resolveUrlLoader: webpack.Loader = {
    loader: 'resolve-url-loader',
    options: {
      root: path.resolve(process.cwd(), 'node_modules'),
    },
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
    new webpack.ProvidePlugin(configs.providers),
    new CopyWebpackPlugin(
      Object.keys(configs.copies).map(destPath => {
        return {
          from: path.resolve(process.cwd(), configs.copies[destPath]),
          to: path.resolve(process.cwd(), configs.outputPath, destPath),
        };
      }),
    ),
    new MiniCssExtractPlugin({ filename: '[name].css' }),
    new NoEmitPlugin(noEmitPaths),
    new CKEditorWebpackPlugin({ language: configs.ckEditor.language }),
  ];

  if (sourceMap) plugins.push(new webpack.SourceMapDevToolPlugin());

  if (configs.hashOutput) {
    let hashOutputPath: string = null;
    if (typeof configs.hashOutput === 'string') hashOutputPath = configs.hashOutput;
    plugins.push(new HashOutputPlugin(hashOutputPath));
  }

  // Webpack configs
  return {
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
          test: /ckeditor5-[^/\\]+[\/\\]theme[\/\\]icons[\/\\][^/\\]+\.svg$/,
          use: ['raw-loader'],
        },
        {
          test: /ckeditor5-[^/\\]+[\/\\]theme[\/\\][\w-\/\\]+\.css$/,
          use: [
            {
              loader: 'style-loader',
              options: {
                injectType: 'singletonStyleTag',
              },
            },
            {
              loader: 'postcss-loader',
              options: styles.getPostCssConfig({
                themeImporter: {
                  themePath: require.resolve(configs.ckEditor.themePath),
                },
                minify: true,
              }),
            },
          ],
        },
        {
          test: /^((?!ckeditor5).)*\.css$/,
          use: [MiniCssExtractPlugin.loader, cssLoader, postcssLoader, resolveUrlLoader],
        },
        {
          test: /\.s[ac]ss$/,
          use: [MiniCssExtractPlugin.loader, cssLoader, postcssLoader, resolveUrlLoader, sassLoader],
        },
        {
          test: /(\.(png|jpe?g|gif)$|^((?!(font|ckeditor5)).)*\.svg$)/,
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
          test: /(\.(woff2?|ttf|eot|otf)$|^((?!ckeditor5).)*font.*\.svg$)/,
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
};

export default buildConfig;
