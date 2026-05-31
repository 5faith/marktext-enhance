// Suppress Prism.js unhandled rejection from component loading order issue
// prism-cpp.js tries to extend Prism.languages.c before prism-c.js is loaded
process.on('unhandledRejection', (reason) => {
  if (reason instanceof TypeError && reason.message.includes('Cannot set properties of undefined')) {
    return
  }
  throw reason
})
