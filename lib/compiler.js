"use strict";
/**
 * Webpacker for webpack
 * https://github.com/hanreev/webpacker
 */
Object.defineProperty(exports, "__esModule", { value: true });
var webpack = require("webpack");
exports.webpackerCompiler = function (config, argv, runCompiler) {
    if (runCompiler === void 0) { runCompiler = true; }
    var compiler;
    var lastHash = null;
    var outputOptions = config.stats;
    try {
        compiler = webpack(config);
    }
    catch (err) {
        if (err.name === 'WebpackOptionsValidationError') {
            if (argv.color)
                console.error("\u001B[1m\u001B[31m" + err.message + "\u001B[39m\u001B[22m");
            else
                console.error(err.message);
            process.exit(1);
        }
        throw err;
    }
    if (argv.progress)
        new webpack.ProgressPlugin().apply(compiler);
    if (typeof outputOptions === 'boolean' || typeof outputOptions === 'string')
        outputOptions = webpack.Stats.presetToOptions(outputOptions);
    else if (!outputOptions)
        outputOptions = {};
    if (argv.color && process.stdout.isTTY)
        outputOptions.colors = require('supports-color').stdout;
    if (runCompiler) {
        var compilerCallback = function (err, stats) {
            if (!argv.watch || err)
                compiler.purgeInputFileSystem();
            if (err) {
                lastHash = null;
                console.error(err.stack || err);
                if (err.message)
                    console.error(err.message);
                process.exit(1);
            }
            if (argv.json)
                process.stdout.write(JSON.stringify(stats.toJson(outputOptions), null, 2) + '\n');
            else if (lastHash !== stats.hash) {
                lastHash = stats.hash;
                if (stats.compilation && stats.compilation.errors.length !== 0) {
                    var errors = stats.compilation.errors;
                    if (errors[0].name === 'EntryModuleNotFoundError')
                        console.error(argv.color ? '\n\u001b[1m\u001b[31mNo entry found.' : 'No entry found.');
                }
                var statsString = stats.toString(outputOptions);
                var delimiter = outputOptions.buildDelimiter ? outputOptions.buildDelimiter + "\n" : '';
                if (statsString)
                    process.stdout.write(statsString + "\n" + delimiter);
            }
            if (!argv.watch && stats.hasErrors())
                process.exitCode = 2;
        };
        if (argv.watch) {
            var watchOptions = config.watchOptions || {};
            compiler.watch(watchOptions, compilerCallback);
            if (outputOptions.infoVerbosity !== 'none')
                console.log('\nwebpack is watching the files…\n');
        }
        else
            compiler.run(compilerCallback);
    }
    return compiler;
};
exports.default = exports.webpackerCompiler;
