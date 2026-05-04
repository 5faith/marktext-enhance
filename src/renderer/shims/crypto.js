// Shim for crypto module in Vite dev mode
// Falls back to window.require for Electron access

const crypto = window.require('crypto')
export default crypto
export const getRandomValues = crypto.getRandomValues
export const randomBytes = crypto.randomBytes
export const randomUUID = crypto.randomUUID
