const config = {
  workers: 1,
  use: {
    headless: false,
    viewport: { width: 1280, height: 720 },
    timeout: 30000,
    actionTimeout: 10000
  },
  globalSetup: undefined,
  globalTeardown: './global-teardown.js',
  retries: process.env.CI ? 1 : 0,
  timeout: 90000
}
module.exports = config
