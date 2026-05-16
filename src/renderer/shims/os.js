// Shim for os module in Vite dev mode
// Falls back to window.require for Electron access

const os = window.require('os')
export default os
export const arch = os.arch
export const cpus = os.cpus
export const endianness = os.endianness
export const freemem = os.freemem
// eslint-disable-next-line node/no-deprecated-api
export const getNetworkInterfaces = os.getNetworkInterfaces
export const homedir = os.homedir
export const hostname = os.hostname
export const loadavg = os.loadavg
export const networkInterfaces = os.networkInterfaces
export const platform = os.platform
export const release = os.release
export const tmpdir = os.tmpdir
export const totalmem = os.totalmem
export const type = os.type
export const uptime = os.uptime
export const userInfo = os.userInfo
