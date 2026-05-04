// Shim for child_process module in Vite dev mode
// Falls back to window.require for Electron access

const cp = window.require('child_process')
export default cp
export const spawn = cp.spawn
export const exec = cp.exec
export const execFile = cp.execFile
export const fork = cp.fork
