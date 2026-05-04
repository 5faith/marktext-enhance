// Test script to verify path shim
const path = require('./src/renderer/shims/path.js')
console.log('Path shim test:')
console.log('- dirname type:', typeof path.dirname)
console.log('- join type:', typeof path.join)
console.log('- default export:', typeof path.default)
console.log('- dirname via default:', typeof path.default?.dirname)
