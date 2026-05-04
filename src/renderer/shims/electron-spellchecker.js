const spellchecker = window.require('@hfelix/electron-spellchecker')

export const SpellCheckHandler = spellchecker.SpellCheckHandler
export const SpellChecker = spellchecker.SpellChecker
export const setGlobalLogger = spellchecker.setGlobalLogger
export const fallbackLocales = spellchecker.fallbackLocales
export const normalizeLanguageCode = spellchecker.normalizeLanguageCode
export default spellchecker
