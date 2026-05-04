// Shim for path module in Vite dev mode
// Uses path-browserify (browser-compatible version of path)
// Plus adds process.resourcesPath shim for development

import pathBrowserify from 'path-browserify'

if (typeof window.process === 'undefined') {
  window.process = {
    platform: 'win32',
    env: {},
    resourcesPath: '/resources'
  }
}

export default pathBrowserify
