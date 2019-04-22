"use strict";
/**
 * Webpacker for webpack
 * https://github.com/hanreev/webpacker
 */
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var net = require("net");
var WebpackDevServer = require("webpack-dev-server");
var createConfig = require("webpack-dev-server/lib/utils/createConfig");
var createDomain = require("webpack-dev-server/lib/utils/createDomain");
var defaultTo = require("webpack-dev-server/lib/utils/defaultTo");
var runBonjour = require("webpack-dev-server/lib/utils/runBonjour");
var status = require("webpack-dev-server/lib/utils/status");
var tryParseInt = require("webpack-dev-server/lib/utils/tryParseInt");
var findPort = require("webpack-dev-server/lib/utils/findPort");
var compiler_1 = require("./compiler");
var DEFAULT_PORT = 8080;
var defaultPortRetry = defaultTo(tryParseInt(process.env.DEFAULT_PORT_RETRY), 3);
var server;
var signals = ['SIGILL', 'SIGTERM'];
function webpackerDevServer(config, argv) {
    signals.forEach(function (signal) {
        process.on(signal, function () {
            if (server)
                server.close(function () { return process.exit(); });
            else
                process.exit();
        });
    });
    var options = createConfig(config, argv, { port: DEFAULT_PORT });
    var compiler = compiler_1.webpackerCompiler(config, argv, false);
    var suffix = options.inline !== false || options.lazy === true
        ? '/'
        : '/webpack-dev-server/';
    server = new WebpackDevServer(compiler, options);
    if (options.socket) {
        server.listeningApp.on('error', function (e) {
            if (e.code === 'EADDRINUSE') {
                var clientSocket = new net.Socket();
                clientSocket.on('error', function (err) {
                    if (err.code === 'ECONNREFUSED') {
                        // No other server listening on this socket so it can be safely removed
                        fs.unlinkSync(options.socket);
                        server.listen(options.socket, options.host, function (error) {
                            if (error)
                                throw error;
                        });
                    }
                });
                clientSocket.connect({ path: options.socket }, function () {
                    throw new Error('This socket is already used');
                });
            }
        });
        server.listen(options.socket, options.host, function (err) {
            if (err)
                throw err;
            // chmod 666 (rw rw rw)
            var READ_WRITE = 438;
            fs.chmod(options.socket, READ_WRITE, function (err) {
                if (err)
                    throw err;
                var uri = createDomain(options, server.listeningApp) + suffix;
                status(uri, options, server.log, argv.color);
            });
        });
        return;
    }
    var startServer = function () {
        server.listen(options.port, options.host, function (err) {
            if (err)
                throw err;
            if (options.bonjour)
                runBonjour(options);
            var uri = createDomain(options, server.listeningApp) + suffix;
            status(uri, options, server.log, argv.color);
        });
    };
    if (options.port) {
        startServer();
        return;
    }
    // only run port finder if no port as been specified
    findPort(server, DEFAULT_PORT, defaultPortRetry, function (err, port) {
        if (err)
            throw err;
        options.port = port;
        startServer();
    });
}
exports.webpackerDevServer = webpackerDevServer;
exports.default = webpackerDevServer;
