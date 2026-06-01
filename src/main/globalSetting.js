import path from 'path'

// Set `__static` path to static files at runtime.
global.__static = path.join(__dirname, '/static').replace(/\\/g, '\\\\')
