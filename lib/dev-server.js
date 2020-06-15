"use strict";
/**
 * Webpacker for webpack
 * https://github.com/hanreev/webpacker
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.webpackerDevServer = void 0;
const fs_1 = __importDefault(require("fs"));
const net_1 = __importDefault(require("net"));
const webpack_dev_server_1 = __importDefault(require("webpack-dev-server"));
const createConfig_1 = __importDefault(require("webpack-dev-server/lib/utils/createConfig"));
const createDomain_1 = __importDefault(require("webpack-dev-server/lib/utils/createDomain"));
const defaultTo_1 = __importDefault(require("webpack-dev-server/lib/utils/defaultTo"));
const findPort_1 = __importDefault(require("webpack-dev-server/lib/utils/findPort"));
const runBonjour_1 = __importDefault(require("webpack-dev-server/lib/utils/runBonjour"));
const status_1 = __importDefault(require("webpack-dev-server/lib/utils/status"));
const tryParseInt_1 = __importDefault(require("webpack-dev-server/lib/utils/tryParseInt"));
const compiler_1 = require("./compiler");
const DEFAULT_PORT = 8080;
const defaultPortRetry = defaultTo_1.default(tryParseInt_1.default(process.env.DEFAULT_PORT_RETRY), 3);
let server;
const signals = ['SIGILL', 'SIGTERM'];
function webpackerDevServer(config, argv) {
    signals.forEach(signal => {
        process.on(signal, () => {
            if (server)
                server.close(() => process.exit());
            else
                process.exit();
        });
    });
    const options = createConfig_1.default(config, argv, { port: DEFAULT_PORT });
    const compiler = compiler_1.webpackerCompiler(config, argv, false);
    const suffix = options.inline !== false || options.lazy === true ? '/' : '/webpack-dev-server/';
    server = new webpack_dev_server_1.default(compiler, options);
    if (options.socket) {
        server.listeningApp.on('error', (e) => {
            if (e.code === 'EADDRINUSE') {
                const clientSocket = new net_1.default.Socket();
                clientSocket.on('error', (err) => {
                    if (err.code === 'ECONNREFUSED') {
                        // No other server listening on this socket so it can be safely removed
                        fs_1.default.unlinkSync(options.socket);
                        server.listen(options.socket, options.host, (error) => {
                            if (error)
                                throw error;
                        });
                    }
                });
                clientSocket.connect({ path: options.socket }, () => {
                    throw new Error('This socket is already used');
                });
            }
        });
        server.listen(options.socket, options.host, (err) => {
            if (err)
                throw err;
            // chmod 666 (rw rw rw)
            const READ_WRITE = 438;
            fs_1.default.chmod(options.socket, READ_WRITE, e => {
                if (e)
                    throw e;
                const uri = createDomain_1.default(options, server.listeningApp) + suffix;
                status_1.default(uri, options, server.log, argv.color);
            });
        });
        return;
    }
    const startServer = () => {
        server.listen(options.port, options.host, err => {
            if (err)
                throw err;
            if (options.bonjour)
                runBonjour_1.default(options);
            const uri = createDomain_1.default(options, server.listeningApp) + suffix;
            status_1.default(uri, options, server.log, argv.color);
        });
    };
    if (options.port) {
        startServer();
        return;
    }
    // only run port finder if no port as been specified
    findPort_1.default(server, DEFAULT_PORT, defaultPortRetry, (err, port) => {
        if (err)
            throw err;
        options.port = port;
        startServer();
    });
}
exports.webpackerDevServer = webpackerDevServer;
exports.default = webpackerDevServer;
