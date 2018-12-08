import * as fs from 'fs'
import * as path from 'path'
import { Compiler } from 'webpack'

export interface HashOutputData {
  [name: string]: string
  hash?: string
  fullHash?: string
  builtAt?: string
}

export class HashOutputPlugin {
  outputPath: string

  constructor(outputPath?: string) {
    const defaultOutputPath = path.resolve(process.cwd(), 'asset-hash.json')
    this.outputPath = outputPath || defaultOutputPath
  }

  apply(compiler: Compiler) {
    compiler.hooks.done.tap('HashOutputPlugin', stats => {
      const outputOptions =  stats.compilation.outputOptions
      const hashData: HashOutputData = {}
      stats.compilation.chunks.forEach(chunk => {
        const fullPath = path.join(outputOptions.publicPath, chunk.name).replace(/\\/g, '/')
        hashData[fullPath] = chunk.hash
      })
      hashData.hash = stats.hash
      hashData.fullHash = stats.compilation['fullHash']
      hashData.builtAt = (new Date(stats.endTime)).toLocaleString()
      fs.writeFileSync(this.outputPath, JSON.stringify(hashData, null, 2))
    })
  }
}

export default HashOutputPlugin
