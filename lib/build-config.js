"use strict";
/**
 * Webpacker for webpack
 * https://github.com/hanreev/webpacker
 */
Object.defineProperty(exports, "__esModule", { value: true });
// Helper modules
var fs = require("fs");
var path = require("path");
var glob = require("glob");
// Webpack modules
var webpack_1 = require("webpack");
var CopyWebpackPlugin = require("copy-webpack-plugin");
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var TerserPlugin = require("terser-webpack-plugin");
var hash_output_1 = require("../plugins/hash-output");
// CKEditor5
var CKEditorWebpackPlugin = require("@ckeditor/ckeditor5-dev-webpack-plugin");
var ckeditor5_dev_utils_1 = require("@ckeditor/ckeditor5-dev-utils");
// PostCSS plugins
var autoprefixer = require("autoprefixer");
var cssnano = require("cssnano");
// Configuration
var defaultConfigs = {
    outputPath: '',
    publicPath: '',
    entries: {},
    splitChunks: {},
    runtimeChunk: false,
    providers: {},
    copies: {},
    sourceMap: 'auto',
    hashOutput: true,
    watchExclude: []
};
var resolveName = function (src, dest) {
    dest = dest.replace('[name]', path.basename(src));
    dest = dest.replace('[basename]', path.basename(src, path.extname(src)));
    dest = dest.replace('[ext]', path.extname(src).replace(/^\./, ''));
    return dest;
};
exports.buildConfig = function (configs, argv) {
    configs = Object.assign({}, defaultConfigs, configs);
    var development = argv.mode === 'development';
    var sourceMap = configs.sourceMap === 'auto' ? development : configs.sourceMap;
    // Loaders
    var sassLoader = {
        loader: 'sass-loader',
        options: { sourceMap: sourceMap }
    };
    var cssLoader = {
        loader: 'css-loader',
        options: { sourceMap: sourceMap }
    };
    var postcssLoader = {
        loader: 'postcss-loader',
        options: {
            sourceMap: sourceMap,
            ident: 'postcss',
            plugins: [
                autoprefixer
            ]
        }
    };
    if (!development)
        postcssLoader.options.plugins.push(cssnano({
            preset: ['default', {
                    discardComments: { removeAll: true }
                }]
        }));
    var resolveUrlLoader = {
        loader: 'resolve-url-loader',
        options: {
            root: path.resolve(process.cwd(), 'node_modules')
        }
    };
    // Plugins
    var plugins = [
        new webpack_1.ProvidePlugin(configs.providers),
        new CopyWebpackPlugin(Object.keys(configs.copies).map(function (destPath) {
            return {
                from: path.resolve(process.cwd(), configs.copies[destPath]),
                to: path.resolve(process.cwd(), configs.outputPath, destPath)
            };
        })),
        new ExtractTextPlugin('[name]'),
        new CKEditorWebpackPlugin({ language: 'en' }),
    ];
    if (sourceMap)
        plugins.push(new webpack_1.SourceMapDevToolPlugin());
    if (configs.hashOutput) {
        var hashOutputPath = null;
        if (typeof configs.hashOutput === 'string')
            hashOutputPath = configs.hashOutput;
        plugins.push(new hash_output_1.HashOutputPlugin(hashOutputPath));
    }
    // Webpack configs
    return {
        entry: function () {
            var entries = {};
            Object.keys(configs.entries).forEach(function (destPath) {
                var srcPath = configs.entries[destPath];
                var hasPlaceholder = /\[(name|basename|ext)\]/.test(destPath);
                if (srcPath instanceof Array)
                    if (hasPlaceholder)
                        srcPath.forEach(function (src) {
                            entries[resolveName(src, destPath)] = src;
                        });
                    else
                        entries[destPath] = srcPath;
                else if (!fs.existsSync(path.resolve(process.cwd(), srcPath))) {
                    if (!hasPlaceholder)
                        entries[destPath] = [];
                    glob.sync(path.resolve(process.cwd(), srcPath)).forEach(function (file) {
                        if (hasPlaceholder)
                            entries[resolveName(file, destPath)] = file;
                        else
                            entries[destPath].push(file);
                    });
                }
                else
                    entries[destPath] = srcPath;
            });
            return entries;
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
                    test: /ckeditor5-[^/]+\/theme\/icons\/[^/]+\.svg$/,
                    use: ['raw-loader']
                },
                {
                    test: /ckeditor5-[^/]+\/theme\/[\w-/]+\.css$/,
                    use: [
                        {
                            loader: 'style-loader',
                            options: {
                                singleton: true
                            }
                        },
                        {
                            loader: 'postcss-loader',
                            options: ckeditor5_dev_utils_1.styles.getPostCssConfig({
                                themeImporter: {
                                    themePath: require.resolve('@ckeditor/ckeditor5-theme-lark')
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
                                name: function (assetPath) {
                                    if (!/node_modules|bower_components/.test(assetPath))
                                        return 'images/[name].[ext]?[hash]';
                                    return ('images/vendor/' +
                                        assetPath.replace(/\\/g, '/')
                                            .replace(/((.*(node_modules|bower_components))|images|image|img|assets|dist)\//g, '') +
                                        '?[hash]');
                                },
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
                            name: function (assetPath) {
                                if (!/node_modules|bower_components/.test(assetPath))
                                    return 'fonts/[name].[ext]?[hash]';
                                return ('fonts/vendor/' +
                                    assetPath.replace(/\\/g, '/')
                                        .replace(/((.*(node_modules|bower_components))|fonts|font|assets|dist)\//g, '') +
                                    '?[hash]');
                            }
                        }
                    }
                }
            ]
        },
        plugins: plugins,
        watchOptions: {
            ignored: ['node_modules'].concat(configs.watchExclude)
        }
    };
};
exports.default = exports.buildConfig;
