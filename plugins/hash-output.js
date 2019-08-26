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
const path_1 = __importDefault(require("path"));
class HashOutputPlugin {
    constructor(outputPath) {
        const defaultOutputPath = path_1.default.resolve(process.cwd(), 'asset-hash.json');
        this.outputPath = outputPath || defaultOutputPath;
    }
    apply(compiler) {
        compiler.hooks.done.tap('HashOutputPlugin', stats => {
            const outputOptions = stats.compilation.outputOptions;
            const hashData = {};
            stats.compilation.chunks.forEach(chunk => {
                const fullPath = path_1.default.join(outputOptions.publicPath, chunk.name).replace(/\\/g, '/');
                hashData[fullPath] = chunk.hash;
            });
            hashData.hash = stats.hash;
            hashData.fullHash = stats.compilation.fullHash;
            hashData.builtAt = new Date(stats.endTime).toLocaleString();
            fs_1.default.writeFileSync(this.outputPath, JSON.stringify(hashData, null, 2));
        });
    }
}
exports.HashOutputPlugin = HashOutputPlugin;
exports.default = HashOutputPlugin;
