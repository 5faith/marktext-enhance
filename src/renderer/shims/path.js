// Shim for path module in Vite dev mode
// Directly use path-browserify with proper ESM interop

import * as pathBrowserify from 'path-browserify'

// Handle both default export and namespace import
const path = pathBrowserify.default || pathBrowserify

// Debug: log path shim info
if (typeof window !== 'undefined' && window.location) {
  console.log('[path shim] Loaded, dirname type:', typeof path.dirname)
  console.log('[path shim] path object keys:', Object.keys(path))
  console.log('[path shim] path.dirname:', path.dirname)
}

if (typeof window.process === 'undefined') {
  window.process = {
    platform: 'win32',
    env: {},
    resourcesPath: '/resources'
  }
}

// Re-export all functions for named imports
export const resolve = path.resolve
export const normalize = path.normalize
export const isAbsolute = path.isAbsolute
export const join = path.join
export const relative = path.relative
export const dirname = path.dirname
export const basename = path.basename
export const extname = path.extname
export const format = path.format
export const parse = path.parse
export const sep = path.sep
export const delimiter = path.delimiter
export const win32 = path.win32
export const posix = path.posix

// Default export
export default path
