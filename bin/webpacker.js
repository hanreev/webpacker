#!/usr/bin/env node
"use strict";
/**
 * Webpacker for webpack
 * https://github.com/hanreev/webpacker
 */
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var yargs = require("yargs");
var build_config_1 = require("../lib/build-config");
var compiler_1 = require("../lib/compiler");
var dev_server_1 = require("../lib/dev-server");
function handler(mode, watch, withServer) {
    if (mode === void 0) { mode = 'production'; }
    if (watch === void 0) { watch = false; }
    if (withServer === void 0) { withServer = false; }
    return function (argv) {
        argv.mode = mode;
        argv.watch = watch;
        var config;
        try {
            config = build_config_1.buildConfig(require(argv.config), argv);
        }
        catch (err) {
            throw err;
        }
        if (withServer)
            dev_server_1.webpackerDevServer(config, argv);
        else
            compiler_1.webpackerCompiler(config, argv);
    };
}
yargs.usage('Usage: $0 <command> [options]')
    .demandCommand()
    .alias('help', 'h')
    .alias('version', 'v');
yargs.command(['production', 'prod', '$0'], 'Compile assets for production', {}, handler());
yargs.command(['development', 'dev'], 'Compile assets for development', {}, handler('development'));
yargs.command('watch', 'Compile assets for production', {}, handler('development', true));
yargs.command('server', 'Compile assets and start dev server', function (yargs) {
    yargs.options(require('webpack-dev-server/bin/options'));
    return yargs;
}, handler('development', true, true));
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
        default: function supportsColor() {
            return require('supports-color').stdout;
        },
        describe: 'Enables/Disables colors on the console',
    },
    json: {
        type: 'boolean',
        alias: 'j',
        describe: 'Prints the result as JSON.'
    }
});
yargs.parse();
