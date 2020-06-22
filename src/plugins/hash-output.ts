/**
 * Webpacker for webpack
 * https://github.com/hanreev/webpacker
 */

import fs from 'fs';
import path from 'path';
import { Compiler, Plugin } from 'webpack';

export interface HashOutputData {
  [name: string]: string;
  hash?: string;
  fullHash?: string;
  builtAt?: string;
}

export class HashOutputPlugin implements Plugin {
  outputPath: string;

  constructor(outputPath?: string) {
    const defaultOutputPath = path.resolve(process.cwd(), 'asset-hash.json');
    this.outputPath = outputPath || defaultOutputPath;
  }

  apply(compiler: Compiler) {
    compiler.hooks.done.tap('HashOutputPlugin', stats => {
      const outputOptions = stats.compilation.outputOptions;
      const hashData: HashOutputData = {};
      const assets = Object.keys(stats.compilation.assets);
      stats.compilation.chunks.forEach(chunk => {
        const name = chunk.files.find((file: string) => assets.includes(file)) || chunk.name;
        const fullPath = path.join(outputOptions.publicPath, name).replace(/\\/g, '/');
        hashData[fullPath] = chunk.hash;
      });
      hashData.hash = stats.hash;
      hashData.fullHash = (stats.compilation as any).fullHash;
      hashData.builtAt = new Date(stats.endTime).toLocaleString();
      fs.writeFileSync(this.outputPath, JSON.stringify(hashData, null, 2));
    });
  }
}

export default HashOutputPlugin;
