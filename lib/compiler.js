"use strict";
/**
 * Webpacker for webpack
 * https://github.com/hanreev/webpacker
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.webpackerCompiler = void 0;
const webpack_1 = __importDefault(require("webpack"));
exports.webpackerCompiler = (config, argv, runCompiler = true) => {
    let compiler;
    let lastHash = null;
    let outputOptions = config.stats;
    try {
        compiler = webpack_1.default(config);
    }
    catch (err) {
        if (err.name === 'WebpackOptionsValidationError') {
            if (argv.color)
                console.error(`\u001b[1m\u001b[31m${err.message}\u001b[39m\u001b[22m`);
            else
                console.error(err.message);
            process.exit(1);
        }
        throw err;
    }
    if (argv.progress)
        new webpack_1.default.ProgressPlugin().apply(compiler);
    if (typeof outputOptions === 'boolean' || typeof outputOptions === 'string')
        outputOptions = webpack_1.default.Stats.presetToOptions(outputOptions);
    else if (!outputOptions)
        outputOptions = {};
    if (argv.color && process.stdout.isTTY)
        outputOptions.colors = require('supports-color').stdout;
    if (runCompiler) {
        const compilerCallback = (err, stats) => {
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
                    const errors = stats.compilation.errors;
                    if (errors[0].name === 'EntryModuleNotFoundError')
                        console.error(argv.color ? '\n\u001b[1m\u001b[31mNo entry found.' : 'No entry found.');
                }
                const statsString = stats.toString(outputOptions);
                const delimiter = outputOptions.buildDelimiter ? `${outputOptions.buildDelimiter}\n` : '';
                if (statsString)
                    process.stdout.write(`${statsString}\n${delimiter}`);
            }
            if (!argv.watch && stats.hasErrors())
                process.exitCode = 2;
        };
        if (argv.watch) {
            const watchOptions = config.watchOptions || {};
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
