const webpack = require('webpack')


module.exports = (config, argv) => {
  let compiler
  let lastHash = null
  let outputOptions = config.stats

  try {
    compiler = webpack(config)
  } catch (err) {
    if (err.name === 'WebpackOptionsValidationError') {
      if (argv.color)
        console.error(`\u001b[1m\u001b[31m${err.message}\u001b[39m\u001b[22m`)
      else
        console.error(err.message)
      process.exit(1)
    }
    throw err
  }

  if (argv.progress)
    new webpack.ProgressPlugin().apply(compiler)

  if (typeof outputOptions === 'boolean' || typeof outputOptions === 'string')
    outputOptions = webpack.Stats.presetToOptions(outputOptions)
  else if (!outputOptions)
    outputOptions = {}

  if (argv.color && process.stdout.isTTY)
    outputOptions.colors = require('supports-color').stdout

  const compilerCallback = (err, stats) => {
    if (!argv.watch || err)
      compiler.purgeInputFileSystem()
    if (err) {
      lastHash = null
      console.error(err.stack || err)
      if (err.details) console.error(err.details)
      process.exit(1)
    }
    if (argv.json) {
      process.stdout.write(JSON.stringify(stats.toJson(outputOptions), null, 2) + '\n')
    } else if (lastHash !== stats.hash) {
      lastHash = stats.hash
      if (stats.compilation && stats.compilation.errors.length !== 0) {
        const errors = stats.compilation.errors
        if (errors[0].name === 'EntryModuleNotFoundError')
          console.error(argv.color ? '\n\u001b[1m\u001b[31mNo entry found.' : 'No entry found.')
      }
      const statsString = stats.toString(outputOptions)
      const delimiter = outputOptions.buildDelimiter ? `${outputOptions.buildDelimiter}\n` : ''
      if (statsString)
        process.stdout.write(`${statsString}\n${delimiter}`)
    }
    if (!argv.watch && stats.hasErrors())
      process.exitCode = 2
  }
  if (argv.watch) {
    const watchOptions = config.watch || {}
    if (watchOptions.stdin) {
      process.stdin.on('end', () => process.exit())
      process.stdin.resume()
    }
    compiler.watch(watchOptions, compilerCallback)
    if (outputOptions.infoVerbosity !== 'none')
      console.log('\nwebpack is watching the files…\n')
  } else {
    compiler.run(compilerCallback)
  }
}
