// Shim for electron-hunspell in Vite dev mode
// electron-hunspell uses emscripten-wasm-loader which requires Node.js require
// In Vite dev mode, we need to use window.require to load it

const electronHunspell = window.require('electron-hunspell')

export const SpellCheckerProvider = electronHunspell.SpellCheckerProvider
export const attachSpellCheckProvider = electronHunspell.attachSpellCheckProvider
export const enableLogger = electronHunspell.enableLogger
