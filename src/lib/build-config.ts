/**
 * Webpacker for webpack
 * https://github.com/hanreev/webpacker
 */

// Helper modules
import * as fs from 'fs'
import * as path from 'path'
import * as glob from 'glob'
import * as yargs from 'yargs'

// Webpack modules
import * as webpack from 'webpack'
import * as WebpackDevServer from 'webpack-dev-server'
import * as CopyWebpackPlugin from 'copy-webpack-plugin'
import * as ExtractTextPlugin from 'extract-text-webpack-plugin'
import * as TerserPlugin from 'terser-webpack-plugin'
import { HashOutputPlugin } from '../plugins/hash-output'

// CKEditor5
import * as CKEditorWebpackPlugin from '@ckeditor/ckeditor5-dev-webpack-plugin'
import { styles } from '@ckeditor/ckeditor5-dev-utils'

// PostCSS plugins
import * as autoprefixer from 'autoprefixer'
import * as cssnano from 'cssnano'

interface WebpackerConfig {
  outputPath?: string
  publicPath?: string
  entries?: { [destPath: string]: string | string[] }
  splitChunks?: webpack.Options.SplitChunksOptions
  runtimeChunk?: boolean | 'single' | 'multiple' | webpack.Options.RuntimeChunkOptions
  providers?: { [key: string]: string }
  copies?: { [destPath: string]: string }
  sourceMap?: boolean | 'auto'
  hashOutput?: boolean | string
  watchExclude?: string[]
  devServer?: WebpackDevServer.Configuration
  ckEditor?: { language: string, themePath: string }
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
}

const resolveName = (src: string, dest: string) => {
  dest = dest.replace('[name]', path.basename(src))
  dest = dest.replace('[basename]', path.basename(src, path.extname(src)))
  dest = dest.replace('[ext]', path.extname(src).replace(/^\./, ''))
  return dest
}

export const buildConfig = (configs: WebpackerConfig, argv: yargs.Arguments<WebpackerArgs>): webpack.Configuration => {
  configs = Object.assign({}, defaultConfigs, configs)

  const development = argv.mode === 'development'
  const sourceMap = configs.sourceMap === 'auto' ? development : configs.sourceMap

  // Loaders
  const sassLoader = {
    loader: 'sass-loader',
    options: { sourceMap }
  }

  const cssLoader = {
    loader: 'css-loader',
    options: { sourceMap }
  }

  const postcssLoader = {
    loader: 'postcss-loader',
    options: {
      sourceMap,
      ident: 'postcss',
      plugins: [
        autoprefixer
      ]
    }
  }

  if (!development)
    postcssLoader.options.plugins.push(
      cssnano({
        preset: ['default', {
          discardComments: { removeAll: true }
        }]
      })
    )

  const resolveUrlLoader = {
    loader: 'resolve-url-loader',
    options: {
      root: path.resolve(process.cwd(), 'node_modules')
    }
  }

  // Plugins
  const plugins = [
    new webpack.ProvidePlugin(configs.providers),
    new CopyWebpackPlugin(
      Object.keys(configs.copies).map(destPath => {
        return {
          from: path.resolve(process.cwd(), configs.copies[destPath]),
          to: path.resolve(process.cwd(), configs.outputPath, destPath)
        }
      })
    ),
    new ExtractTextPlugin('[name]'),
    new CKEditorWebpackPlugin({ language: configs.ckEditor.language }),
  ]

  if (sourceMap)
    plugins.push(new webpack.SourceMapDevToolPlugin())

  if (configs.hashOutput) {
    let hashOutputPath = null
    if (typeof configs.hashOutput === 'string')
      hashOutputPath = configs.hashOutput
    plugins.push(new HashOutputPlugin(hashOutputPath))
  }

  // Webpack configs
  return {
    entry: () => {
      const entries = {}

      Object.keys(configs.entries).forEach(destPath => {
        const srcPath = configs.entries[destPath]
        const hasPlaceholder = /\[(name|basename|ext)\]/.test(destPath)
        if (Array.isArray(srcPath))
          if (hasPlaceholder)
            srcPath.forEach(src => {
              entries[resolveName(src, destPath)] = src
            })
          else
            entries[destPath] = srcPath
        else if (!fs.existsSync(path.resolve(process.cwd(), srcPath))) {
          if (!hasPlaceholder)
            entries[destPath] = []

          glob.sync(path.resolve(process.cwd(), srcPath)).forEach(file => {
            if (hasPlaceholder)
              entries[resolveName(file, destPath)] = file
            else
              entries[destPath].push(file)
          })
        } else
          entries[destPath] = srcPath
      })

      return entries
    },
    resolve: {
      extensions: ['.js', '.ts']
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
      filename: '[name]'
    },
    optimization: {
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            output: {
              comments: false
            }
          }
        })
      ],
      splitChunks: configs.splitChunks,
      runtimeChunk: configs.runtimeChunk
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: 'ts-loader'
        },
        {
          test: /ckeditor5-[^/\\]+[\/\\]theme[\/\\]icons[\/\\][^/\\]+\.svg$/,
          use: ['raw-loader']
        },
        {
          test: /ckeditor5-[^/\\]+[\/\\]theme[\/\\][\w-\/\\]+\.css$/,
          use: [
            {
              loader: 'style-loader',
              options: {
                singleton: true
              }
            },
            {
              loader: 'postcss-loader',
              options: styles.getPostCssConfig({
                themeImporter: {
                  themePath: require.resolve(configs.ckEditor.themePath)
                },
                minify: true
              })
            },
          ]
        },
        {
          test: /^((?!ckeditor5).)*\.css$/,
          use: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: [cssLoader, postcssLoader, resolveUrlLoader],
          })
        },
        {
          test: /\.s[ac]ss$/,
          use: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: [cssLoader, postcssLoader, resolveUrlLoader, sassLoader],
          })
        },
        {
          test: /(\.(png|jpe?g|gif)$|^((?!(font|ckeditor5)).)*\.svg$)/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: (assetPath: string) => {
                  if (!/node_modules|bower_components/.test(assetPath))
                    return 'images/[name].[ext]?[hash]'

                  return (
                    'images/vendor/' +
                    assetPath.replace(/\\/g, '/')
                      .replace(/((.*(node_modules|bower_components))|images|image|img|assets|dist)\//g, '') +
                    '?[hash]'
                  )
                },
              }
            },
            'img-loader'
          ]
        },
        {
          test: /(\.(woff2?|ttf|eot|otf)$|^((?!ckeditor5).)*font.*\.svg$)/,
          use: {
            loader: 'file-loader',
            options: {
              name: (assetPath: string) => {
                if (!/node_modules|bower_components/.test(assetPath))
                  return 'fonts/[name].[ext]?[hash]'

                return (
                  'fonts/vendor/' +
                  assetPath.replace(/\\/g, '/')
                    .replace(/((.*(node_modules|bower_components))|fonts|font|assets|dist)\//g, '') +
                  '?[hash]'
                )
              }
            }
          }
        }
      ]
    },
    plugins,
    watchOptions: {
      ignored: ['node_modules'].concat(configs.watchExclude)
    },
    devServer: configs.devServer
  }
}

export default buildConfig
