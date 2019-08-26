"use strict";
/**
 * Webpacker for webpack
 * https://github.com/hanreev/webpacker
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const autoprefixer_1 = __importDefault(require("autoprefixer"));
const copy_webpack_plugin_1 = __importDefault(require("copy-webpack-plugin"));
const cssnano_1 = __importDefault(require("cssnano"));
const fs_1 = __importDefault(require("fs"));
const glob_1 = __importDefault(require("glob"));
const mini_css_extract_plugin_1 = __importDefault(require("mini-css-extract-plugin"));
const no_emit_webpack_plugin_1 = __importDefault(require("no-emit-webpack-plugin"));
const path_1 = __importDefault(require("path"));
const terser_webpack_plugin_1 = __importDefault(require("terser-webpack-plugin"));
const webpack_1 = __importDefault(require("webpack"));
const ckeditor5_dev_utils_1 = require("@ckeditor/ckeditor5-dev-utils");
const ckeditor5_dev_webpack_plugin_1 = __importDefault(require("@ckeditor/ckeditor5-dev-webpack-plugin"));
const hash_output_1 = require("../plugins/hash-output");
// Configuration
const defaultConfigs = {
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
const resolveName = (src, dest) => {
    dest = dest.replace('[name]', path_1.default.basename(src));
    dest = dest.replace('[basename]', path_1.default.basename(src, path_1.default.extname(src)));
    dest = dest.replace('[ext]', path_1.default.extname(src).replace(/^\./, ''));
    return dest;
};
exports.buildConfig = (configs, argv) => {
    configs = Object.assign({}, defaultConfigs, configs);
    const development = argv.mode === 'development';
    const sourceMap = configs.sourceMap === 'auto' ? development : configs.sourceMap;
    // Loaders
    const sassLoader = {
        loader: 'sass-loader',
        options: { sourceMap },
    };
    const cssLoader = {
        loader: 'css-loader',
        options: { sourceMap },
    };
    const postcssLoader = {
        loader: 'postcss-loader',
        options: {
            sourceMap,
            ident: 'postcss',
            plugins: [autoprefixer_1.default],
        },
    };
    if (!development)
        postcssLoader.options.plugins.push(cssnano_1.default({
            preset: [
                'default',
                {
                    discardComments: { removeAll: true },
                },
            ],
        }));
    const resolveUrlLoader = {
        loader: 'resolve-url-loader',
        options: {
            root: path_1.default.resolve(process.cwd(), 'node_modules'),
        },
    };
    const noEmitPaths = [];
    const entry = () => {
        const entries = {};
        Object.keys(configs.entries).forEach(destPath => {
            const srcPath = configs.entries[destPath];
            const hasPlaceholder = /\[(name|basename|ext)\]/.test(destPath);
            if (Array.isArray(srcPath))
                if (hasPlaceholder)
                    srcPath.forEach(src => (entries[resolveName(src, destPath)] = src));
                else
                    entries[destPath] = srcPath;
            else if (!fs_1.default.existsSync(path_1.default.resolve(process.cwd(), srcPath))) {
                if (!hasPlaceholder)
                    entries[destPath] = [];
                glob_1.default.sync(path_1.default.resolve(process.cwd(), srcPath)).forEach(file => {
                    if (hasPlaceholder)
                        entries[resolveName(file, destPath)] = file;
                    else
                        entries[destPath].push(file);
                });
            }
            else
                entries[destPath] = srcPath;
        });
        const finalEntries = {};
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
    const plugins = [
        new webpack_1.default.ProvidePlugin(configs.providers),
        new copy_webpack_plugin_1.default(Object.keys(configs.copies).map(destPath => {
            return {
                from: path_1.default.resolve(process.cwd(), configs.copies[destPath]),
                to: path_1.default.resolve(process.cwd(), configs.outputPath, destPath),
            };
        })),
        new mini_css_extract_plugin_1.default({ filename: '[name].css' }),
        new no_emit_webpack_plugin_1.default(noEmitPaths),
        new ckeditor5_dev_webpack_plugin_1.default({ language: configs.ckEditor.language }),
    ];
    if (sourceMap)
        plugins.push(new webpack_1.default.SourceMapDevToolPlugin());
    if (configs.hashOutput) {
        let hashOutputPath = null;
        if (typeof configs.hashOutput === 'string')
            hashOutputPath = configs.hashOutput;
        plugins.push(new hash_output_1.HashOutputPlugin(hashOutputPath));
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
            path: path_1.default.resolve(process.cwd(), configs.outputPath),
            publicPath: configs.publicPath,
            filename: '[name]',
        },
        optimization: {
            minimizer: [
                new terser_webpack_plugin_1.default({
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
                            options: ckeditor5_dev_utils_1.styles.getPostCssConfig({
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
                    use: [mini_css_extract_plugin_1.default.loader, cssLoader, postcssLoader, resolveUrlLoader],
                },
                {
                    test: /\.s[ac]ss$/,
                    use: [mini_css_extract_plugin_1.default.loader, cssLoader, postcssLoader, resolveUrlLoader, sassLoader],
                },
                {
                    test: /(\.(png|jpe?g|gif)$|^((?!(font|ckeditor5)).)*\.svg$)/,
                    use: [
                        {
                            loader: 'file-loader',
                            options: {
                                name: (assetPath) => {
                                    if (!/node_modules|bower_components/.test(assetPath))
                                        return 'images/[name].[ext]?[hash]';
                                    return ('images/vendor/' +
                                        assetPath
                                            .replace(/\\/g, '/')
                                            .replace(/((.*(node_modules|bower_components))|images|image|img|assets|dist)\//g, '') +
                                        '?[hash]');
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
                            name: (assetPath) => {
                                if (!/node_modules|bower_components/.test(assetPath))
                                    return 'fonts/[name].[ext]?[hash]';
                                return ('fonts/vendor/' +
                                    assetPath
                                        .replace(/\\/g, '/')
                                        .replace(/((.*(node_modules|bower_components))|fonts|font|assets|dist)\//g, '') +
                                    '?[hash]');
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
exports.default = exports.buildConfig;
