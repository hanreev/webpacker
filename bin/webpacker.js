#!/usr/bin/env node
"use strict";
/**
 * Webpacker for webpack
 * https://github.com/hanreev/webpacker
 */
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var yargs = require("yargs");
var build_config_1 = require("../lib/build-config");
var compiler_1 = require("../lib/compiler");
var dev_server_1 = require("../lib/dev-server");
var merge = require("lodash.merge");
function handler(mode, watch, withServer) {
    if (mode === void 0) { mode = 'production'; }
    if (watch === void 0) { watch = false; }
    if (withServer === void 0) { withServer = false; }
    return function (args) {
        args.mode = mode;
        args.watch = watch;
        var config;
        try {
            config = build_config_1.buildConfig(require(args.config), args);
        }
        catch (err) {
            throw err;
        }
        var compile = function (conf) {
            if (conf === void 0) { conf = {}; }
            conf = merge(config, conf);
            if (withServer)
                dev_server_1.webpackerDevServer(conf, args);
            else
                compiler_1.webpackerCompiler(conf, args);
        };
        var webpackConfig;
        if (args.merge && fs.existsSync(args.merge))
            try {
                webpackConfig = require(args.merge);
                if (webpackConfig instanceof Promise)
                    webpackConfig.then(function (c) { return compile(c); });
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
var serverBuilder = function (_yargs) {
    _yargs.options(require('webpack-dev-server/bin/options'));
    return _yargs;
};
var initBuilder = function (_yargs) {
    _yargs.options({
        out: {
            type: 'string',
            alias: 'o',
            describe: 'Webpacker config output path',
            default: path.resolve(process.cwd(), 'webpacker.config.js')
        }
    });
    return _yargs;
};
var initConfig = function (args) {
    var configTemplatePath = path.resolve(__dirname, '../lib/webpacker.config.template');
    var outputPath = path.resolve(args.out);
    if (fs.existsSync(outputPath) && fs.statSync(outputPath).isDirectory())
        outputPath = path.join(outputPath, 'webpacker.config.js');
    if (fs.existsSync(outputPath))
        return console.error(outputPath + " already exists");
    fs.copyFileSync(configTemplatePath, outputPath);
    console.log(outputPath + " created successfully");
};
yargs.usage('Usage: $0 <command> [options]')
    .demandCommand()
    .alias('help', 'h')
    .alias('version', 'v');
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
        default: path.resolve(process.cwd(), 'webpack.config.js'),
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
        describe: 'Prints the result as JSON.'
    }
});
yargs.parse();
