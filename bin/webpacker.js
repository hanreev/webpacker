"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var yargs = require("yargs");
var build_config_1 = require("../lib/build-config");
var compiler_1 = require("../lib/compiler");
var handler = function (mode, watch) {
    if (mode === void 0) { mode = 'production'; }
    if (watch === void 0) { watch = false; }
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
        config.mode = mode;
        compiler_1.webpackerCompiler(config, argv);
    };
};
yargs.usage('Usage: $0 <command> [options]')
    .demandCommand()
    .alias('help', 'h')
    .alias('version', 'v');
yargs.command(['production', 'prod', '$0'], 'Compile assets for production', {}, handler());
yargs.command(['development', 'dev'], 'Compile assets for development', {}, handler('development'));
yargs.command('watch', 'Compile assets for production', {}, handler('development', true));
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
        describe: 'Enables/Disables colors on the console',
    },
    json: {
        type: 'boolean',
        alias: 'j',
        describe: 'Prints the result as JSON.'
    }
});
yargs.parse();
