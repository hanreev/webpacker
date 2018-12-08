const buildConfig = require('../lib/build-config')
const compiler = require('../lib/compiler')

const command = ['prod', 'production', '$0']
const desc = 'Compile assets for production'
const handler = argv => {
  let config
  try {
    config = buildConfig(require(argv.config), argv)
  } catch (err) {
    throw err
  }
  config.mode = 'production'
  compiler(config, argv)
}

module.exports = { command, desc, handler }
