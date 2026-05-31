const { stopDevServer } = require('./helpers')

const config = {
  workers: 1,
  use: {
    headless: false,
    viewport: { width: 1280, height: 720 },
    timeout: 30000
  },
  globalTeardown: async () => {
    stopDevServer()
  }
}
module.exports = config
