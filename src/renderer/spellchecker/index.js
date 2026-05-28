import { cloneObj } from '@/util'
import fs from 'fs'
import path from 'path'

// Source: https://github.com/Microsoft/vscode/blob/master/src/vs/editor/common/model/wordHelper.ts
// /(-?\d*\.\d\w*)|([^\`\~\!\@\#\$\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s]+)/
/* eslint-disable no-useless-escape */
const WORD_SEPARATORS = /(?:[`~!@#$%^&*()-=+[{\]}\\|;:'",\.<>\/?\s])/g
const WORD_DEFINITION = /(?:-?\d*\.\d\w*)|(?:[^`~!@#$%^&*()-=+[{\]}\\|;:'",\.<>\/?\s]+)/g
/* eslint-enable no-useless-escape */

/**
 * Translate a left and right offset from a word in `line` into a cursor with
 * the given line cursor.
 *
 * @param {*} lineCursor The original line cursor.
 * @param {number} left Start offset/index of word in `lineCursor`.
 * @param {number} right End offset/index of word in `lineCursor`.
 * @returns {*} Return a cursor of the word selected in `lineCursor`(e.g.
 *              "foo >bar< foo" where `>`/`<` start and end offset).
 */
export const offsetToWordCursor = (lineCursor, left, right) => {
  // Deep clone cursor start and end
  const start = cloneObj(lineCursor.start, true)
  const end = cloneObj(lineCursor.end, true)
  start.offset = left
  end.offset = right
  return { start, end }
}

/**
 * Validate whether the selection is valid for spelling correction.
 *
 * @param {*} selection The preview editor selection range.
 */
export const validateLineCursor = selection => {
  // Validate selection range.
  if (!selection && !selection.start && !selection.start.hasOwnProperty('offset') &&
    !selection.end && !selection.end.hasOwnProperty('offset')) {
    return false
  }

  // Allow only single lines
  const { start: startCursor, end: endCursor } = selection
  if (startCursor.key !== endCursor.key || !startCursor.block) {
    return false
  }

  // Don't correct words in code blocks or editors for HTML, LaTex and diagrams.
  if (startCursor.block.functionType === 'codeContent' &&
    startCursor.block.lang !== undefined) {
    return false
  }

  // Don't correct words in code blocks or pre elements such as language identifier.
  if (selection.affiliation && selection.affiliation.length === 1 &&
    selection.affiliation[0].type === 'pre') {
    return false
  }
  return true
}

/**
 * Get the webContents from the current window.
 * @returns {Electron.WebContents|null}
 */
const getWebContents = () => {
  if (global.marktext && global.marktext.window) {
    return global.marktext.window.webContents
  }
  return null
}

/**
 * Returns a list of local available Hunspell dictionaries.
 * @deprecated Use getAvailableDictionaries instead
 * @returns {string[]} List of available Hunspell dictionary language codes.
 */
export const getAvailableHunspellDictionaries = () => {
  // Deprecated: Electron built-in spellchecker doesn't use Hunspell dictionaries
  return []
}

/**
 * Check if OS spellchecker is supported.
 * @returns {boolean} Always true for Electron built-in spellchecker
 */
export const isOsSpellcheckerSupported = () => {
  // Electron built-in spellchecker is supported on all platforms
  return true
}

/**
 * Get dictionary path.
 * @deprecated Not needed for Electron built-in spellchecker
 * @returns {string} Empty string
 */
export const getDictionaryPath = () => {
  // Deprecated: Electron built-in spellchecker manages dictionaries automatically
  return ''
}

/**
 * High level spell checker API using Electron's built-in spellchecker.
 *
 * Language providers:
 *  - macOS: NSSpellChecker (default) or Hunspell
 *  - Linux and Windows: Hunspell
 */
export class SpellChecker {
  /**
   * ctor
   *
   * @param {boolean} enabled Whether spell checking is enabled.
   */
  constructor (enabled = true) {
    this.isEnabled = false
    this.fallbackLang = null
    this._lang = ''
    this.isHunspell = false // Always false for Electron built-in

    // Initialize spell check provider. If spell check is not enabled don't
    // initialize the handler.
    if (enabled) {
      this._initSpellchecker()
    }
  }

  _initSpellchecker () {
    const webContents = getWebContents()
    if (!webContents) {
      return
    }

    // Enable the spell checker on the session
    webContents.session.setSpellCheckerEnabled(true)

    // Check available languages and pick a valid one
    const available = webContents.session.availableSpellCheckerLanguages || []
    let lang = 'en-US'
    if (!available.includes(lang)) {
      lang = available[0] || ''
    }

    if (lang) {
      try {
        webContents.session.setSpellCheckerLanguages([lang])
        this._lang = lang
        this.isEnabled = true
      } catch (e) {
        console.error('Failed to init spell checker:', e.message)
      }
    }
  }

  /**
   * Initialize the spell checker and attach it to the window.
   *
   * @param {string} lang 4-letter language ISO-code.
   * @param {boolean} automaticallyIdentifyLanguages Whether we should try to identify the typed language.
   * @param {boolean} isPassiveMode Should we highlight misspelled words? (Not supported in Electron's spellchecker)
   * @param {[HTMLElement]} container The optional container (ignored - not needed for Electron spellchecker)
   * @returns {string} Returns current spell checker language.
   */
  async init (lang = '', _automaticallyIdentifyLanguages = false, _isPassiveMode = false, _container = null) {
    if (this.isEnabled) {
      return this.lang
    }

    this._initSpellchecker()

    if (!lang && !_automaticallyIdentifyLanguages) {
      throw new Error('Init: Either language or automatic language detection must be set.')
    }

    if (!lang) {
      // Set default language
      lang = 'en-US'
    }

    const currentLang = await this._switchLanguage(lang)
    if (!currentLang) {
      throw new Error(`Language "${lang}" is not available.`)
    }

    this.fallbackLang = currentLang
    this.isEnabled = true
    return currentLang
  }

  /**
   * Enable spell checker.
   *
   * NOTE: Using `undefined` will use the existing values.
   * NOTE: When spell checker is already enabled this method has no effect.
   *
   * @param {[string]} lang 4-letter language ISO-code.
   * @param {[boolean]} automaticallyIdentifyLanguages Whether we should try to identify the typed language. (ignored)
   * @param {[boolean]} isPassiveMode Should we highlight misspelled words? (ignored)
   */
  async enableSpellchecker (lang = undefined, _automaticallyIdentifyLanguages = undefined, _isPassiveMode = undefined) {
    if (this.isEnabled) {
      return true
    }

    const webContents = getWebContents()
    if (!webContents) {
      return false
    }

    try {
      webContents.session.setSpellCheckerEnabled(true)

      if (lang) {
        await this._switchLanguage(lang)
      } else {
        const currentLang = await this._switchLanguage('en-US')
        if (!currentLang) {
          return false
        }
        this.fallbackLang = currentLang
      }

      this.isEnabled = true
      return true
    } catch (e) {
      return false
    }
  }

  /**
   * Disable spell checker.
   */
  disableSpellchecker () {
    if (!this.isEnabled) {
      return
    }

    const webContents = getWebContents()
    if (webContents) {
      webContents.session.setSpellCheckerEnabled(false)
    }
    this.isEnabled = false
  }

  /**
   * Add a word to the user dictionary.
   *
   * @param {string} word The word to add.
   */
  async addToDictionary (word) {
    if (!this.isEnabled) {
      return false
    }

    const webContents = getWebContents()
    if (webContents) {
      try {
        await webContents.session.addWordToSpellCheckerDictionary(word)
        return true
      } catch (error) {
        console.error('Failed to add word to dictionary:', error)
        return false
      }
    }
    return false
  }

  /**
   * Remove a word from the user dictionary.
   *
   * @param {string} word The word to remove.
   */
  async removeFromDictionary (word) {
    if (!this.isEnabled) {
      return false
    }

    const webContents = getWebContents()
    if (webContents) {
      try {
        await webContents.session.removeWordFromSpellCheckerDictionary(word)
        return true
      } catch (error) {
        console.error('Failed to remove word from dictionary:', error)
        return false
      }
    }
    return false
  }

  /**
   * Ignore a word for the current runtime.
   *
   * @param {string} word The word to ignore.
   */
  ignoreWord (_word) {
    // Electron doesn't support ignore word, but we can add it to dictionary temporarily
    // For now, this is a no-op as Electron spellchecker doesn't have ignore list
  }

  /**
   * Returns a list of available dictionaries.
   * @returns {string[]} Available dictionary languages.
   */
  getAvailableDictionaries () {
    const webContents = getWebContents()
    if (!webContents) {
      return []
    }

    const available = webContents.session.availableSpellCheckerLanguages || []

    // Scan userData/dictionaries/ for user-imported dictionaries
    const userDataDictPath = path.join(
      global.marktext?.paths?.userDataPath || '',
      'dictionaries'
    )

    const userDicts = []
    if (fs.existsSync(userDataDictPath)) {
      const files = fs.readdirSync(userDataDictPath)
      files.forEach(filename => {
        const match = filename.match(/^([a-z]{2}(?:[-][A-Z]{2})?)\.bdic$/)
        if (match && match[1] && !available.includes(match[1])) {
          userDicts.push(match[1])
        }
      })
    }

    return [...new Set([...available, ...userDicts])]
  }

  /**
   * Is the spellchecker trying to detect the typed language automatically?
   * Note: Electron spellchecker does not support automatic language detection.
   */
  get automaticallyIdentifyLanguages () {
    return false
  }

  /**
   * Is the spellchecker trying to detect the typed language automatically?
   */
  set automaticallyIdentifyLanguages (value) {
    // Electron spellchecker does not support automatic language detection
    // No-op
  }

  /**
   * Returns true if not misspelled words should be highlighted.
   * Note: Electron spellchecker always highlights misspelled words.
   */
  get isPassiveMode () {
    return false
  }

  /**
   * Should we highlight misspelled words.
   */
  set isPassiveMode (value) {
    // Electron spellchecker always highlights misspelled words
    // No-op
  }

  /**
   * Return the current language.
   */
  get lang () {
    return this._lang
  }

  /**
   * Whether the spell checker is in an invalid state and therefore deactivated.
   */
  get isInvalidState () {
    if (!this.isEnabled) {
      return false
    }

    const webContents = getWebContents()
    return !webContents || !webContents.session.isSpellCheckerEnabled
  }

  /**
   * Explicitly switch the language to a specific language.
   *
   * NOTE: This function can throw an exception.
   *
   * @param {string} lang The language code
   * @returns {string|null} Return the language on success or null.
   */
  async switchLanguage (lang) {
    if (!this.isEnabled) {
      throw new Error('Invalid state: spell checker is disabled.')
    } else if (!lang) {
      throw new Error('Invalid language.')
    }

    const currentLang = await this._switchLanguage(lang)
    if (currentLang) {
      this.fallbackLang = currentLang
    }
    return currentLang
  }

  /**
   * Is the given word misspelled.
   *
   * NOTE: Electron's spellchecker doesn't expose a direct API for checking
   * individual words. This method relies on context menu data from the renderer.
   * For standalone checking, it always returns false.
   *
   * @param {string} _word The word to check (unused - requires context menu data).
   */
  isMisspelled (_word) {
    if (!this.isEnabled) {
      return false
    }
    // Electron doesn't expose isMisspelled directly
    // This would need to be called with context menu data from the renderer
    return false
  }

  /**
   * Get corrections.
   *
   * NOTE: Electron's spellchecker doesn't expose suggestions directly.
   * This method relies on context menu data from the renderer.
   *
   * @param {string} _word The word to get suggestion for (unused - requires context menu data).
   * @returns {string[]} A array of suggestions.
   */
  async getWordSuggestion (_word) {
    return []
  }

  /**
   * Extract the word at the given offset from the text.
   *
   * @param {string} text Text
   * @param {number} offset Normalized cursor offset (e.g. ab<cursor>c def --> 2)
   */
  static extractWord (text, offset) {
    if (!text || text.length === 0) {
      return null
    } else if (offset < 0) {
      offset = 0
    } else if (offset >= text.length) {
      offset = text.length - 1
    }

    // Matches all words starting at a good position.
    WORD_DEFINITION.lastIndex = text.lastIndexOf(' ', offset - 1) + 1
    let match = null
    let left = -1
    while (match = WORD_DEFINITION.exec(text)) { // eslint-disable-line
      if (match && match.index <= offset) {
        if (WORD_DEFINITION.lastIndex > offset) {
          left = match.index
        }
      } else {
        break
      }
    }
    WORD_DEFINITION.lastIndex = 0

    // Cursor is between two word separators (e.g "*<cursor>*" or " <cursor>*")
    if (left <= -1) {
      return null
    }

    // Find word ending.
    WORD_SEPARATORS.lastIndex = offset
    match = WORD_SEPARATORS.exec(text)
    let right = -1
    if (match) {
      right = match.index
    }
    WORD_SEPARATORS.lastIndex = 0

    // The last word in the string is a special case.
    if (right < 0) {
      return {
        left,
        right: text.length,
        word: text.slice(left)
      }
    }
    return {
      left,
      right: right,
      word: text.slice(left, right)
    }
  }

  /**
   * @private
   * @param {string} lang The language code
   * @returns {string|null} Return the language on success or null.
   */
  async _switchLanguage (lang) {
    const webContents = getWebContents()
    if (!webContents) {
      return null
    }

    const available = webContents.session.availableSpellCheckerLanguages || []
    if (!available.includes(lang)) {
      // Try to find a fallback: en-US > en > first available
      const fallback = available.find(l => l.startsWith('en')) || available[0]
      if (!fallback) {
        return null
      }
      lang = fallback
    }

    try {
      webContents.session.setSpellCheckerLanguages([lang])
      this._lang = lang
      return this._lang
    } catch (e) {
      return null
    }
  }

  /**
   * Try to recover the spell checker's invalid state.
   *
   * @returns {string|null} Return the language on success or null.
   */
  async _tryRecover () {
    const lang = this.fallbackLang
    if (lang) {
      // Prevent recursive loop.
      this.fallbackLang = null

      // Try fallback language.
      const result = await this._switchLanguage(lang)
      if (result) {
        this.fallbackLang = lang
        return lang
      }

      // Spell checker is deactivated from recursive call.
      return null
    }

    // Spell checker is in an invalid state. We can recover it by enabling
    // with a valid language.
    this.disableSpellchecker()
    return null
  }
}
