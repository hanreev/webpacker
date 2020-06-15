#!/usr/bin/env node
"use strict";
/**
 * Webpacker for webpack
 * https://github.com/hanreev/webpacker
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const lodash_merge_1 = __importDefault(require("lodash.merge"));
const path_1 = __importDefault(require("path"));
const yargs_1 = __importDefault(require("yargs"));
const build_config_1 = require("../lib/build-config");
const compiler_1 = require("../lib/compiler");
const dev_server_1 = require("../lib/dev-server");
function handler(mode = 'production', watch = false, withServer = false) {
    return (args) => {
        args.mode = mode;
        args.watch = watch;
        let config;
        try {
            config = build_config_1.buildConfig(require(args.config), args);
        }
        catch (err) {
            throw err;
        }
        const compile = (conf = {}) => {
            if (!Array.isArray(conf))
                conf = [conf];
            if (withServer)
                dev_server_1.webpackerDevServer(lodash_merge_1.default(config, conf[0]), args);
            else
                conf.forEach(c => {
                    c = lodash_merge_1.default(config, c);
                    compiler_1.webpackerCompiler(c, args);
                });
        };
        let webpackConfig;
        if (args.merge && fs_1.default.existsSync(args.merge))
            try {
                webpackConfig = require(args.merge);
                if (webpackConfig instanceof Promise)
                    webpackConfig.then(c => compile(c));
                else if (typeof webpackConfig === 'function')
                    compile(webpackConfig.apply(null, [process.env, process.argv]));
                else
                    compile(webpackConfig);
            }
            catch (error) {
                console.log('Unable to merge with provided webpack config');
            }
        else
            compile();
    };
}
const serverBuilder = (_yargs) => {
    _yargs.options(require('webpack-dev-server/bin/options'));
    return _yargs;
};
const initBuilder = (_yargs) => {
    _yargs.options({
        out: {
            type: 'string',
            alias: 'o',
            describe: 'Webpacker config output path',
            default: path_1.default.resolve(process.cwd(), 'webpacker.config.js'),
        },
    });
    return _yargs;
};
const initConfig = (args) => {
    const configTemplatePath = path_1.default.resolve(__dirname, '../lib/webpacker.config.template');
    let outputPath = path_1.default.resolve(args.out);
    if (fs_1.default.existsSync(outputPath) && fs_1.default.statSync(outputPath).isDirectory())
        outputPath = path_1.default.join(outputPath, 'webpacker.config.js');
    if (fs_1.default.existsSync(outputPath))
        return console.error(`${outputPath} already exists`);
    fs_1.default.copyFileSync(configTemplatePath, outputPath);
    console.log(`${outputPath} created successfully`);
};
yargs_1.default.usage('Usage: $0 <command> [options]').demandCommand().alias('help', 'h').alias('version', 'v');
yargs_1.default.command(['production', 'prod', '$0'], 'Compile assets for production', {}, handler());
yargs_1.default.command(['development', 'dev'], 'Compile assets for development', {}, handler('development'));
yargs_1.default.command('watch', 'Compile assets for production', {}, handler('development', true));
yargs_1.default.command('server', 'Compile assets and start dev server', serverBuilder, handler('development', false, true));
yargs_1.default.command('init', 'Generate webpacker configuration', initBuilder, initConfig);
yargs_1.default.options({
    config: {
        type: 'string',
        alias: 'c',
        describe: 'Webpacker config path',
        default: path_1.default.resolve(process.cwd(), 'webpacker.config.js'),
    },
    merge: {
        type: 'string',
        alias: 'm',
        describe: 'Merge with provided webpack config',
        default: path_1.default.resolve(process.cwd(), 'webpack.config.js'),
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
yargs_1.default.parse();
