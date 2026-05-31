const os = require('os')
const path = require('path')
const { spawn } = require('child_process')
const { _electron } = require('playwright')

const mainEntrypoint = 'dist/electron/main.js'

let devServer = null

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

const waitForDevServer = (url, timeout = 30000) => {
  return new Promise((resolve, reject) => {
    const start = Date.now()
    const check = async () => {
      try {
        const response = await fetch(url)
        if (response.ok) {
          resolve()
          return
        }
      } catch (e) {
        // Server not ready yet
      }
      if (Date.now() - start > timeout) {
        reject(new Error(`Dev server did not start within ${timeout}ms`))
        return
      }
      setTimeout(check, 500)
    }
    check()
  })
}

const startDevServer = async () => {
  const devServerUrl = 'http://localhost:9091'

  // Check if dev server is already running
  try {
    const response = await fetch(devServerUrl)
    if (response.ok) {
      process.env.VITE_DEV_SERVER_URL = devServerUrl
      return
    }
  } catch (e) {
    // Not running, start it
  }

  const viteBin = path.resolve(path.join('node_modules', '.bin', process.platform === 'win32' ? 'vite.cmd' : 'vite'))
  devServer = spawn(viteBin, ['--port', '9091', '--strictPort'], {
    stdio: 'pipe',
    env: { ...process.env, NODE_ENV: 'development' }
  })

  devServer.stderr.on('data', (data) => {
    const output = data.toString()
    if (output.includes('VITE') || output.includes('ready')) {
      console.log('[E2E DevServer]', output.trim())
    }
  })

  await waitForDevServer(devServerUrl)
  process.env.VITE_DEV_SERVER_URL = devServerUrl
  console.log('[E2E] Dev server started at', devServerUrl)
}

const stopDevServer = () => {
  if (devServer) {
    devServer.kill('SIGTERM')
    devServer = null
  }
}

const launchElectron = async userArgs => {
  userArgs = userArgs || []
  const executablePath = getElectronPath()

  // CI environment detection
  const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true'

  // Ensure dev server is running
  await startDevServer()

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
    timeout: isCI ? 60000 : 30000,
    env: {
      ...process.env,
      VITE_DEV_SERVER_URL: process.env.VITE_DEV_SERVER_URL || 'http://localhost:9091'
    }
  })
  const page = await app.firstWindow()
  await page.waitForLoadState('domcontentloaded')
  await new Promise((resolve) => setTimeout(resolve, 500))
  return { app, page }
}

module.exports = { getElectronPath, launchElectron, stopDevServer }
