const buildConfig = require('../lib/build-config')
const compiler = require('../lib/compiler')

const command = ['dev', 'development']
const desc = 'Compile assets for development'
const handler = argv => {
  let config
  try {
    config = buildConfig(require(argv.config), argv)
  } catch (err) {
    throw err
  }
  config.mode = 'development'
  compiler(config, argv)
}

module.exports = { command, desc, handler }
