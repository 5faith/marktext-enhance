// Mock @hfelix/electron-spellchecker to avoid native module issues
const mockSpellChecker = {
  SpellCheckHandler: class {},
  SpellChecker: class {
    constructor() { this.enabled = false }
    setLanguage() {}
    isMisspelled() { return false }
    getAvailableDictionaries() { return [] }
  },
  setGlobalLogger() {},
  fallbackLocales: [],
  normalizeLanguageCode: (code) => code
}

export const SpellCheckHandler = mockSpellChecker.SpellCheckHandler
export const SpellChecker = mockSpellChecker.SpellChecker
export const setGlobalLogger = mockSpellChecker.setGlobalLogger
export const fallbackLocales = mockSpellChecker.fallbackLocales
export const normalizeLanguageCode = mockSpellChecker.normalizeLanguageCode
export default mockSpellChecker
