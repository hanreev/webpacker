const buildConfig = require('../lib/build-config')
const compiler = require('../lib/compiler')

const command = ['prod', 'production', '$0']
const desc = 'Compile assets for production'
const handler = argv => {
  const config = buildConfig(require(argv.config), argv)
  config.mode = 'production'
  compiler(config, argv)
}

module.exports = { command, desc, handler }
