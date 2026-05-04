// Shim for fs/promises module in Vite dev mode
// Falls back to window.require for Electron access

const fsPromises = window.require('fs/promises')
export default fsPromises
export const access = fsPromises.access
export const copyFile = fsPromises.copyFile
export const open = fsPromises.open
export const readFile = fsPromises.readFile
export const writeFile = fsPromises.writeFile
export const appendFile = fsPromises.appendFile
export const unlink = fsPromises.unlink
export const stat = fsPromises.stat
export const mkdir = fsPromises.mkdir
export const readdir = fsPromises.readdir
export const rename = fsPromises.rename
export const rmdir = fsPromises.rmdir
export const rm = fsPromises.rm
