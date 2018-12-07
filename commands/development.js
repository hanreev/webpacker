const buildConfig = require('../lib/build-config')
const compiler = require('../lib/compiler')

const command = ['dev', 'development']
const desc = 'Compile assets for development'
const handler = argv => {
  const config = buildConfig(require(argv.config), argv)
  config.mode = 'development'
  compiler(config, argv)
}

module.exports = { command, desc, handler }
