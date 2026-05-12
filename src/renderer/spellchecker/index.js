import fs from 'fs'
import path from 'path'
import os from 'os'
import { isDirectory, isFile } from 'common/filesystem'
import { cloneObj, isOsx, isLinux, isWindows } from '@/util'

// NOTE: Hardcoded in "@hfelix/electron-spellchecker/src/spell-check-handler.js"
export const getDictionaryPath = () => {
  const { userDataPath } = global.marktext.paths
  return path.join(userDataPath, 'dictionaries')
}

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
 * Returns a list of local available Hunspell dictionaries.
 *
 * @returns {string[]} List of available Hunspell dictionary language codes.
 */
export const getAvailableHunspellDictionaries = () => {
  const dictionaryPath = getDictionaryPath()
  const dict = []
  // Search for dictionaries on filesystem.
  if (isDirectory(dictionaryPath)) {
    fs.readdirSync(dictionaryPath).forEach(filename => {
      const fullname = path.join(dictionaryPath, filename)
      const match = filename.match(/^([a-z]{2}(?:[-][A-Z]{2})?)\.bdic$/)
      if (match && match[1] && isFile(fullname)) {
        dict.push(match[1])
      }
    })
  }
  return dict
}

export const isOsSpellcheckerSupported = () => {
  // Electron built-in spellchecker is supported on all platforms
  // when using Electron 28+
  return true
}

/**
 * High level spell checker API using Electron built-in spell checker.
 *
 * Language providers:
 *  - All platforms: Electron built-in spell checker (Chromium)
 */
export class SpellChecker {
  /**
   * ctor
   *
   * @param {boolean} enabled Whether spell checking is enabled.
   */
  constructor (enabled = true) {
    // Always use built-in spell checker (no more Hunspell vs OS distinction)
    this.isHunspell = false
    this.isEnabled = false
    this.isInitialized = false
    this.fallbackLang = null
    this.webContents = null
    this.currentLanguage = 'en-US'
    this._automaticallyIdentifyLanguages = false
    this._isPassiveMode = false

    // Initialize spell check provider. If spell check is not enabled don't
    // initialize the handler.
    if (enabled) {
      this._initHandler()
    }
  }

  _initHandler () {
    if (this.isInitialized) {
      throw new Error('Invalid state.')
    }

    // Get webContents from current window using @electron/remote
    try {
      const { getCurrentWindow } = require('@electron/remote')
      const win = getCurrentWindow()
      this.webContents = win.webContents
    } catch (error) {
      console.error('Failed to get webContents:', error)
      this.webContents = null
    }

    // The spell checker is now initialized but not yet enabled. You need to call `init`.
    this.isEnabled = false
    this.isInitialized = true
  }

  /**
   * Initialize the spell checker and attach it to the window.
   *
   * @param {string} lang 4-letter language ISO-code.
   * @param {boolean} automaticallyIdentifyLanguages Whether we should try to identify the typed language.
   * @param {boolean} isPassiveMode Should we highlight misspelled words?
   * @param {[HTMLElement]} container The optional container to attach the automatic spell detection when
   *                                  using Hunspell. Default `document.body`.
   * @returns {string} Returns current spell checker language.
   */
  async init (lang = '', automaticallyIdentifyLanguages = false, isPassiveMode = false, container = null) {
    if (this.isEnabled) {
      return this.currentLanguage
    } else if (!this.isInitialized) {
      this._initHandler()
    }

    if (!lang && !automaticallyIdentifyLanguages) {
      throw new Error('Init: Either language or automatic language detection must be set.')
    }

    // Store settings
    this._automaticallyIdentifyLanguages = automaticallyIdentifyLanguages
    this._isPassiveMode = isPassiveMode

    // Set default language if not provided
    if (!lang) {
      lang = 'en-US'
    }

    // Try to set the language
    const currentLang = await this._switchLanguage(lang)
    if (!currentLang) {
      throw new Error(`Language "${lang}" is not available.`)
    }

    // Enable spell checker
    if (this.webContents) {
      this.webContents.session.spellCheckerEnabled = true
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
   * @param {[boolean]} automaticallyIdentifyLanguages Whether we should try to identify the typed language.
   * @param {[boolean]} isPassiveMode Should we highlight misspelled words?
   */
  async enableSpellchecker (lang = undefined, automaticallyIdentifyLanguages = undefined, isPassiveMode = undefined) {
    if (this.isEnabled) {
      return true
    }

    if (!this.isInitialized) {
      this._initHandler()
    }

    // Update settings if provided
    if (automaticallyIdentifyLanguages !== undefined) {
      this._automaticallyIdentifyLanguages = automaticallyIdentifyLanguages
    }
    if (isPassiveMode !== undefined) {
      this._isPassiveMode = isPassiveMode
    }

    // Set language
    const languageToUse = lang || this.fallbackLang || 'en-US'
    const result = await this._switchLanguage(languageToUse)

    if (!result) {
      // Spell checker may be in an invalid state and don't try to recover.
      this.disableSpellchecker()
      return false
    }

    // Enable spell checker
    if (this.webContents) {
      this.webContents.session.spellCheckerEnabled = true
    }

    this.fallbackLang = this.currentLanguage
    this.isEnabled = true
    return true
  }

  /**
   * Disable spell checker.
   */
  disableSpellchecker () {
    if (!this.isEnabled) {
      return
    }

    if (this.webContents) {
      this.webContents.session.spellCheckerEnabled = false
    }
    this.isEnabled = false
  }

  /**
   * Add a word to the user dictionary.
   *
   * @param {string} word The word to add.
   */
  async addToDictionary (word) {
    if (!this.webContents) {
      return false
    }
    try {
      await this.webContents.session.addWordToSpellCheckerDictionary(word)
      return true
    } catch (error) {
      console.error('Failed to add word to dictionary:', error)
      return false
    }
  }

  /**
   * Remove a word from the user dictionary.
   *
   * @param {string} word The word to remove.
   */
  async removeFromDictionary (word) {
    if (!this.webContents) {
      return false
    }
    try {
      await this.webContents.session.removeWordFromSpellCheckerDictionary(word)
      return true
    } catch (error) {
      console.error('Failed to remove word from dictionary:', error)
      return false
    }
  }

  /**
   * Ignore a word for the current runtime.
   *
   * @param {string} word The word to ignore.
   */
  ignoreWord (word) {
    // In Electron built-in spell checker, we add the word to dictionary
    // to effectively ignore it
    this.addToDictionary(word)
  }

  /**
   * Returns a list of available dictionaries.
   * @returns {string[]} Available dictionary languages.
   */
  getAvailableDictionaries () {
    if (!this.webContents) {
      return []
    }

    // Get available languages from Electron's built-in spell checker
    const availableLanguages = this.webContents.session.availableSpellCheckerLanguages || []

    // Normalize language codes to match expected format
    return availableLanguages.map(lang => {
      // Convert underscores to hyphens if needed
      return lang.replace(/_/g, '-')
    })
  }

  /**
   * Is the spellchecker trying to detect the typed language automatically?
   */
  get automaticallyIdentifyLanguages () {
    if (!this.isEnabled) {
      return false
    }
    return this._automaticallyIdentifyLanguages
  }

  /**
   * Is the spellchecker trying to detect the typed language automatically?
   */
  set automaticallyIdentifyLanguages (value) {
    if (!this.isEnabled) {
      return
    }
    this._automaticallyIdentifyLanguages = !!value
    // Note: Electron built-in spell checker handles language detection automatically
    // when multiple languages are set
    if (this.webContents && value) {
      // Enable multiple languages if auto-detection is enabled
      const available = this.getAvailableDictionaries()
      if (available.length > 0) {
        this.webContents.session.setSpellCheckerLanguages(available.slice(0, 5))
      }
    }
  }

  /**
   * Returns true if not misspelled words should be highlighted.
   */
  get isPassiveMode () {
    if (!this.isEnabled) {
      return false
    }
    return this._isPassiveMode
  }

  /**
   * Should we highlight misspelled words.
   */
  set isPassiveMode (value) {
    if (!this.isEnabled) {
      return
    }
    this._isPassiveMode = !!value
    // Note: Electron doesn't have a direct passive mode setting.
    // We disable spell checking entirely to hide underlines.
    if (this.webContents) {
      this.webContents.session.spellCheckerEnabled = !value
    }
  }

  /**
   * Return the current language.
   */
  get lang () {
    return this.currentLanguage
  }

  /**
   * Whether the spell checker is in an invalid state and therefore deactivated.
   */
  get isInvalidState () {
    return !this.webContents && this.isInitialized
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
   * @param {string} word The word to check.
   */
  isMisspelled (word) {
    if (!this.isEnabled || !this.webContents) {
      return false
    }
    // Electron built-in spell checker doesn't expose a direct isMisspelled method
    // The spell checking is done automatically by Chromium
    // We return false here as the actual checking is handled by the browser
    return false
  }

  /**
   * Get corrections.
   *
   * @param {string} word The word to get suggestion for.
   * @returns {string[]} A array of suggestions.
   */
  async getWordSuggestion (word) {
    // Electron built-in spell checker doesn't expose a direct getCorrectionsForMisspelling method
    // Suggestions are obtained via the 'context-menu' event in the renderer
    // This method is kept for API compatibility but returns empty array
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
    if (!this.webContents) {
      return null
    }

    const available = this.getAvailableDictionaries()

    // Check if language is available
    if (!available.includes(lang)) {
      // Try to find a fallback
      const langPrefix = lang.split('-')[0]
      const fallback = available.find(l => l.startsWith(langPrefix + '-'))
      if (fallback) {
        lang = fallback
      } else {
        // Try to recover with fallback language
        return await this._tryRecover()
      }
    }

    try {
      this.webContents.session.setSpellCheckerLanguages([lang])
      this.currentLanguage = lang
      return lang
    } catch (error) {
      console.error('Failed to set spell checker language:', error)
      return await this._tryRecover()
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

    // Try with en-US as ultimate fallback
    const available = this.getAvailableDictionaries()
    if (available.includes('en-US')) {
      const result = await this._switchLanguage('en-US')
      if (result) {
        this.fallbackLang = 'en-US'
        return 'en-US'
      }
    }

    // Try any available language
    if (available.length > 0) {
      const result = await this._switchLanguage(available[0])
      if (result) {
        this.fallbackLang = available[0]
        return available[0]
      }
    }

    // Spell checker is in an invalid state. We can recover it by enabling
    // with a valid language.
    this.disableSpellchecker()
    return null
  }
}
