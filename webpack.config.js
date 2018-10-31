/**
 * Webpacker for webpack
 * https://github.com/hanreev/webpacker
 */

// Configuration
const defaultConfigs = {
  outputPath: '',
  entries: {},
  splitChunks: {},
  providers: {},
  copies: {},
  sourceMap: 'auto',
  watchExclude: []
}
const configs = Object.assign({}, defaultConfigs, require('./webpacker'))

// Helper modules
const fs = require('fs')
const path = require('path')
const glob = require('glob')

// Webpack plugins
const ProvidePlugin = require('webpack/lib/ProvidePlugin')
const SourceMapDevToolPlugin = require('webpack/lib/SourceMapDevToolPlugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

// PostCSS plugins
const autoprefixer = require('autoprefixer')
const cssnano = require('cssnano')

const resolveName = (src, dest) => {
  dest = dest.replace('[name]', path.basename(src))
  dest = dest.replace('[basename]', path.basename(src, path.extname(src)))
  dest = dest.replace('[ext]', path.extname(src).replace(/^\./, ''))
  return dest
}

module.exports = (env, argv) => {
  const development = argv.mode == 'development'
  const sourceMap = configs.sourceMap == 'auto' ? development : configs.sourceMap

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
        autoprefixer,
        cssnano({
          preset: ['default', {
            discardComments: { removeAll: !development }
          }]
        })
      ]
    }
  }

  const resolveUrlLoader = {
    loader: 'resolve-url-loader',
    options: {
      root: path.resolve(__dirname, 'node_modules')
    }
  }

  // Plugins
  const plugins = [
    new ProvidePlugin(configs.providers),
    new CopyWebpackPlugin(
      Object.keys(configs.copies).map(destPath => {
        return {
          from: path.resolve(__dirname, configs.copies[destPath]),
          to: path.resolve(__dirname, configs.outputPath, destPath)
        }
      })
    ),
    new ExtractTextPlugin('[name]'),
  ]

  if (sourceMap)
    plugins.push(new SourceMapDevToolPlugin())

  // Webpack configs
  return {
    entry: () => {
      const entries =  {}

      Object.keys(configs.entries).forEach(destPath => {
        const srcPath = configs.entries[destPath]
        const hasPlaceholder = /\[(name|basename|ext)\]/.test(destPath)
        if (srcPath instanceof Array) {
          if (hasPlaceholder)
            srcPath.forEach(src => {
              entries[resolveName(src, destPath)] = src
            })
          else
            entries[destPath] = srcPath
        } else if (!fs.existsSync(path.resolve(__dirname, srcPath))) {
          if (!hasPlaceholder)
            entries[destPath] = []

          glob.sync(path.resolve(__dirname, srcPath)).forEach(file => {
            if (hasPlaceholder)
              entries[resolveName(file, destPath)] = file
            else
              entries[destPath].push(file)
          })
        } else {
          entries[destPath] = srcPath
        }
      })

      return entries
    },
    resolve: {
      extensions: ['.js', '.ts']
    },
    target: 'web',
    mode: 'production',
    stats: {
      all: undefined,
      assets: true,
      assetsSort: 'name',
      children: false,
      entrypoints: false,
      modules: false,
    },
    output: {
      path: path.resolve(__dirname, configs.outputPath),
      filename: '[name]'
    },
    optimization: {
      minimizer: [
        new UglifyJsPlugin({
          uglifyOptions: {
            output: {
              comments: false
            }
          }
        })
      ],
      splitChunks: {
        cacheGroups: configs.splitChunks
      }
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: 'ts-loader'
        },
        {
          test: /\.css$/,
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
          test: /(\.(png|jpe?g|gif)$|^((?!font).)*\.svg$)/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: path => {
                  if (!/node_modules|bower_components/.test(path))
                    return '/images/[name].[ext]?[hash]'

                  return (
                    '/images/vendor/' +
                    path.replace(/\\/g, '/')
                      .replace(/((.*(node_modules|bower_components))|images|image|img|assets|dist)\//g, '') +
                      '?[hash]'
                  )
                },
                publicPath: ''
              }
            },
            'img-loader'
          ]
        },
        {
          test: /(\.(woff2?|ttf|eot|otf)$|font.*\.svg$)/,
          use: {
            loader: 'file-loader',
            options: {
              name: path => {
                if (!/node_modules|bower_components/.test(path))
                  return '/fonts/[name].[ext]?[hash]'

                return (
                  '/fonts/vendor/' +
                  path.replace(/\\/g, '/')
                    .replace(/((.*(node_modules|bower_components))|fonts|font|assets|dist)\//g, '') +
                    '?[hash]'
                )
              },
              publicPath: ''
            }
          }
        }
      ]
    },
    plugins,
    watchOptions: {
      ignored: ['node_modules'].concat(configs.excludeWatch)
    }
  }
}
