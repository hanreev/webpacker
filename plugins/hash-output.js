const fs = require('fs')
const path = require('path')

class HashOutputPlugin {
  constructor(outputPath) {
    const defaultOutputPath = path.resolve(process.cwd(), 'asset-hash.json')
    this.outputPath = outputPath || defaultOutputPath
  }

  apply(compiler) {
    compiler.hooks.done.tap('HashOutputPlugin', stats => {
      const outputOptions =  stats.compilation.outputOptions
      const hashData = {}
      stats.compilation.chunks.forEach(chunk => {
        const fullPath = path.join(outputOptions.publicPath, chunk.name).replace(/\\/g, '/')
        hashData[fullPath] = chunk.hash
      })
      hashData.hash = stats.hash
      hashData.fullHash = stats.compilation.fullHash
      hashData.builtAt = (new Date(stats.endTime)).toLocaleString()
      fs.writeFileSync(this.outputPath, JSON.stringify(hashData, null, 2))
    })
  }
}

module.exports = HashOutputPlugin
