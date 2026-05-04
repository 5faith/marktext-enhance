// Shim for electron module in Vite dev mode
const electron = window.require('electron')

export const clipboard = electron.clipboard
export const contextBridge = electron.contextBridge
export const crashReporter = electron.crashReporter
export const ipcRenderer = electron.ipcRenderer
export const nativeImage = electron.nativeImage
export const screen = electron.screen
export const shell = electron.shell
export const webFrame = electron.webFrame
export const deprecate = electron.deprecate

// Re-export remote submodules if available
// In @electron/remote, these are often accessed via electron.remote
const { remoteModule, dialog, BrowserWindow, Menu, MenuItem, getCurrentWindow, getCurrentWebContents } = (() => {
  try {
    const remote = electron.remote || window.require('@electron/remote')
    return {
      remoteModule: remote,
      dialog: remote.dialog,
      BrowserWindow: remote.BrowserWindow,
      Menu: remote.Menu,
      MenuItem: remote.MenuItem,
      getCurrentWindow: remote.getCurrentWindow,
      getCurrentWebContents: remote.getCurrentWebContents
    }
  } catch (e) {
    console.warn('Remote module not available in shim', e)
    return {
      remoteModule: undefined,
      dialog: undefined,
      BrowserWindow: undefined,
      Menu: undefined,
      MenuItem: undefined,
      getCurrentWindow: undefined,
      getCurrentWebContents: undefined
    }
  }
})()

export { remoteModule, dialog, BrowserWindow, Menu, MenuItem, getCurrentWindow, getCurrentWebContents }
