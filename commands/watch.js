const buildConfig = require('../lib/build-config')
const compiler = require('../lib/compiler')

const command = 'watch'
const desc = 'Compile assets for development, watch then recompile on changes'
const handler = argv => {
  const config = buildConfig(require(argv.config), argv)
  config.mode = 'development'
  argv.watch = true
  compiler(config, argv)
}

module.exports = { command, desc, handler }
