const os = require('os')
const path = require('path')
const { _electron } = require('playwright')

const mainEntrypoint = 'dist/electron/main.js'

const getDateAsFilename = () => {
  const date = new Date()
  return '' + date.getFullYear() + (date.getMonth() + 1) + date.getDay()
}

const getTempPath = () => {
  const name = 'marktext-e2etest-' + getDateAsFilename()
  return path.join(os.tmpdir(), name)
}

const getElectronPath = () => {
  const launcherName = process.platform === 'win32' ? 'electron.cmd' : 'electron'
  return path.resolve(path.join('node_modules', '.bin', launcherName))
}

const launchElectron = async userArgs => {
  userArgs = userArgs || []
  const executablePath = getElectronPath()

  // CI environment detection
  const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true'

  const args = [mainEntrypoint, '--user-data-dir', getTempPath()]

  // Add CI-specific flags for headless environments
  if (isCI) {
    args.push('--no-sandbox')
    args.push('--disable-gpu')
  }

  args.push(...userArgs)

  const app = await _electron.launch({
    executablePath,
    args,
    timeout: isCI ? 60000 : 30000
  })
  const page = await app.firstWindow()
  await page.waitForLoadState('domcontentloaded')
  await new Promise((resolve) => setTimeout(resolve, 500))
  return { app, page }
}

module.exports = { getElectronPath, launchElectron}
