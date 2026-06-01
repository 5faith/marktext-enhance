const noop = () => {}
const log = { info: noop, warn: noop, error: noop, debug: noop, verbose: noop, silly: noop, transports: { file: { level: 'info' }, console: { level: 'info' } } }
module.exports = log
module.exports.default = log
