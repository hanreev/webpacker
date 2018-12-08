"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var HashOutputPlugin = /** @class */ (function () {
    function HashOutputPlugin(outputPath) {
        var defaultOutputPath = path.resolve(process.cwd(), 'asset-hash.json');
        this.outputPath = outputPath || defaultOutputPath;
    }
    HashOutputPlugin.prototype.apply = function (compiler) {
        var _this = this;
        compiler.hooks.done.tap('HashOutputPlugin', function (stats) {
            var outputOptions = stats.compilation.outputOptions;
            var hashData = {};
            stats.compilation.chunks.forEach(function (chunk) {
                var fullPath = path.join(outputOptions.publicPath, chunk.name).replace(/\\/g, '/');
                hashData[fullPath] = chunk.hash;
            });
            hashData.hash = stats.hash;
            hashData.fullHash = stats.compilation['fullHash'];
            hashData.builtAt = (new Date(stats.endTime)).toLocaleString();
            fs.writeFileSync(_this.outputPath, JSON.stringify(hashData, null, 2));
        });
    };
    return HashOutputPlugin;
}());
exports.HashOutputPlugin = HashOutputPlugin;
exports.default = HashOutputPlugin;
