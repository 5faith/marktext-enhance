// Shim for @electron/remote in Vite dev mode
// Uses window.require to access Electron APIs in the renderer process

const remote = window.require('@electron/remote')

export default remote
export const app = remote.app
export const BrowserWindow = remote.BrowserWindow
export const Menu = remote.Menu
export const MenuItem = remote.MenuItem
export const dialog = remote.dialog
export const clipboard = remote.clipboard
export const screen = remote.screen
export const nativeImage = remote.nativeImage
export const getCurrentWindow = remote.getCurrentWindow
export const getCurrentWebContents = remote.getCurrentWebContents
export const getGlobal = remote.getGlobal
export const process = remote.process
export const require = remote.require
