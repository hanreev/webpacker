/**
 * Webpacker for webpack
 * https://github.com/hanreev/webpacker
 */

import fs from 'fs';
import net from 'net';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import createConfig from 'webpack-dev-server/lib/utils/createConfig';
import createDomain from 'webpack-dev-server/lib/utils/createDomain';
import defaultTo from 'webpack-dev-server/lib/utils/defaultTo';
import findPort from 'webpack-dev-server/lib/utils/findPort';
import runBonjour from 'webpack-dev-server/lib/utils/runBonjour';
import status from 'webpack-dev-server/lib/utils/status';
import tryParseInt from 'webpack-dev-server/lib/utils/tryParseInt';
import yargs from 'yargs';

import { webpackerCompiler } from './compiler';

const DEFAULT_PORT = 8080;

const defaultPortRetry = defaultTo(tryParseInt(process.env.DEFAULT_PORT_RETRY), 3);

let server: WebpackDevServer;

const signals: NodeJS.Signals[] = ['SIGILL', 'SIGTERM'];

export function webpackerDevServer(config: webpack.Configuration, argv: yargs.Arguments<WebpackerArgs>) {
  signals.forEach(signal => {
    process.on(signal, () => {
      if (server) server.close(() => process.exit());
      else process.exit();
    });
  });

  const options: WebpackDevServer.Configuration = createConfig(config, argv, { port: DEFAULT_PORT });
  const compiler = webpackerCompiler(config, argv, false);
  const suffix = options.inline !== false || options.lazy === true ? '/' : '/webpack-dev-server/';

  server = new WebpackDevServer(compiler, options);

  if (options.socket) {
    (server as any).listeningApp.on('error', (e: any) => {
      if (e.code === 'EADDRINUSE') {
        const clientSocket = new net.Socket();

        clientSocket.on('error', (err: any) => {
          if (err.code === 'ECONNREFUSED') {
            // No other server listening on this socket so it can be safely removed
            fs.unlinkSync(options.socket);

            server.listen(options.socket as any, options.host, (error: any) => {
              if (error) throw error;
            });
          }
        });

        clientSocket.connect({ path: options.socket }, () => {
          throw new Error('This socket is already used');
        });
      }
    });

    server.listen(options.socket as any, options.host, (err: any) => {
      if (err) throw err;

      // chmod 666 (rw rw rw)
      const READ_WRITE = 438;

      fs.chmod(options.socket, READ_WRITE, e => {
        if (e) throw e;

        const uri = createDomain(options, (server as any).listeningApp) + suffix;

        status(uri, options, (server as any).log, argv.color);
      });
    });
    return;
  }

  const startServer = () => {
    server.listen(options.port, options.host, err => {
      if (err) throw err;

      if (options.bonjour) runBonjour(options);

      const uri = createDomain(options, (server as any).listeningApp) + suffix;
      status(uri, options, (server as any).log, argv.color);
    });
  };

  if (options.port) {
    startServer();
    return;
  }

  // only run port finder if no port as been specified
  findPort(server, DEFAULT_PORT, defaultPortRetry, (err: Error, port: number) => {
    if (err) throw err;

    options.port = port;
    startServer();
  });
}

export default webpackerDevServer;
