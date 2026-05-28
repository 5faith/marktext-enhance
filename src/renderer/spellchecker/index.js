import { cloneObj } from '@/util'
import fs from 'fs'
import path from 'path'
import { SpellCheckerProvider, attachSpellCheckProvider } from 'electron-hunspell'

// Source: https://github.com/Microsoft/vscode/blob/master/src/vs/editor/common/model/wordHelper.ts
// /(-?\d*\.\d\w*)|([^\`\~\!\@\#\$\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/?\s]+)/
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
 * Get the path to the resources hunspell_dictionaries directory.
 * @returns {string}
 */
const getResourcesDictPath = () => {
  // __static is defined in vite.config.js:
  //   Dev mode: <project>/static
  //   Production: <app>/resources
  if (typeof __static !== 'undefined') {
    return path.join(__static, 'dictionaries')
  }
  return path.join(process.resourcesPath || '', 'hunspell_dictionaries')
}

/**
 * Get the path to the userData dictionaries directory.
 * @returns {string}
 */
const getUserDataDictPath = () => {
  // global.marktext.paths.userDataPath is set during bootstrap
  const userDataPath = global.marktext?.paths?.userDataPath
  if (userDataPath) {
    return path.join(userDataPath, 'dictionaries')
  }
  return ''
}

/**
 * High level spell checker API using electron-hunspell.
 *
 * Language providers:
 *  - Uses hunspell-asm (WebAssembly) for cross-platform spell checking
 *  - Supports .dic and .aff dictionary formats directly
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
    this.isHunspell = false // Always false for electron-hunspell (not Electron built-in)

    // electron-hunspell instances
    this._provider = null
    this._attached = null
    this._loadedDictionaries = new Set()
    this._initPromise = null

    // NOTE: Do NOT call _initSpellchecker() here without await.
    // Initialization is deferred to init() / enableSpellchecker() which await it.
  }

  async _initSpellchecker () {
    if (this._initPromise) {
      return this._initPromise
    }

    this._initPromise = (async () => {
      // Initialize electron-hunspell provider
      // NOTE: attachSpellCheckProvider uses webFrame (renderer built-in),
      // NOT webContents. No need to check global.marktext.window.
      this._provider = new SpellCheckerProvider()
      await this._provider.initialize()

      // Attach provider to webFrame
      this._attached = await attachSpellCheckProvider(this._provider)

      // Load default dictionary (en_US)
      await this._loadDefaultDictionary()

      this.isEnabled = true
    })()

    await this._initPromise
  }

  /**
   * Load the default en_US dictionary from resources.
   */
  async _loadDefaultDictionary () {
    const resourcesDictPath = getResourcesDictPath()
    const dicPath = path.join(resourcesDictPath, 'en_US.dic')
    const affPath = path.join(resourcesDictPath, 'en_US.aff')

    if (fs.existsSync(dicPath) && fs.existsSync(affPath)) {
      const dicBuffer = fs.readFileSync(dicPath)
      const affBuffer = fs.readFileSync(affPath)

      await this._provider.loadDictionary('en-US', dicBuffer, affBuffer)
      this._loadedDictionaries.add('en-US')
      this._lang = 'en-US'
    }
  }

  /**
   * Initialize the spell checker and attach it to the window.
   *
   * @param {string} lang 4-letter language ISO-code.
   * @param {boolean} automaticallyIdentifyLanguages Whether we should try to identify the typed language.
   * @param {boolean} isPassiveMode Should we highlight misspelled words? (ignored)
   * @param {[HTMLElement]} container The optional container (ignored)
   * @returns {string} Returns current spell checker language.
   */
  async init (lang = '', _automaticallyIdentifyLanguages = false, _isPassiveMode = false, _container = null) {
    if (this.isEnabled) {
      return this.lang
    }

    await this._initSpellchecker()

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
   * @param {[string]} lang 4-letter language ISO-code.
   * @param {[boolean]} automaticallyIdentifyLanguages Whether we should try to identify the typed language. (ignored)
   * @param {[boolean]} isPassiveMode Should we highlight misspelled words? (ignored)
   */
  async enableSpellchecker (lang = undefined, _automaticallyIdentifyLanguages = undefined, _isPassiveMode = undefined) {
    if (this.isEnabled) {
      return true
    }

    try {
      await this._initSpellchecker()

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

    if (this._attached) {
      this._attached.unsubscribe()
    }
    this.isEnabled = false
  }

  /**
   * Add a word to the user dictionary.
   *
   * @param {string} word The word to add.
   */
  async addToDictionary (word) {
    if (!this.isEnabled || !this._provider) {
      return false
    }

    try {
      await this._provider.addWord(this._lang, word)
      return true
    } catch (error) {
      console.error('Failed to add word to dictionary:', error)
      return false
    }
  }

  /**
   * Remove a word from the user dictionary.
   * Note: electron-hunspell doesn't support removing words, this is a no-op.
   *
   * @param {string} word The word to remove.
   */
  async removeFromDictionary (word) {
    // electron-hunspell doesn't support removing words from dictionary
    // This is a limitation of the hunspell-asm implementation
    return false
  }

  /**
   * Ignore a word for the current runtime.
   *
   * @param {string} word The word to ignore.
   */
  ignoreWord (_word) {
    // electron-hunspell doesn't have a built-in ignore list
    // For now, this is a no-op
  }

  /**
   * Import a dictionary file pair (.dic and .aff).
   *
   * @param {string} sourcePath The path to the .dic file to import.
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async importDictionary (sourcePath) {
    // Validate file extension
    if (!sourcePath.endsWith('.dic')) {
      return { success: false, message: '仅支持 .dic 格式的词典文件' }
    }

    // Check if .aff file exists
    const affPath = sourcePath.replace(/\.dic$/, '.aff')
    if (!fs.existsSync(affPath)) {
      return { success: false, message: '需要同时提供 .dic 和 .aff 文件' }
    }

    // Validate file sizes
    const dicStats = fs.statSync(sourcePath)
    if (dicStats.size <= 8192) {
      return { success: false, message: '词典文件无效或已损坏' }
    }

    const affStats = fs.statSync(affPath)
    if (affStats.size <= 100) {
      return { success: false, message: '词典文件无效或已损坏' }
    }

    // Get userData dictionaries path
    const userDataDictPath = getUserDataDictPath()

    // Ensure directory exists
    if (!fs.existsSync(userDataDictPath)) {
      fs.mkdirSync(userDataDictPath, { recursive: true })
    }

    // Copy files
    const filename = path.basename(sourcePath)
    const langCode = filename.replace(/\.dic$/, '')
    const destDicPath = path.join(userDataDictPath, `${langCode}.dic`)
    const destAffPath = path.join(userDataDictPath, `${langCode}.aff`)

    fs.copyFileSync(sourcePath, destDicPath)
    fs.copyFileSync(affPath, destAffPath)

    return { success: true, message: '词典导入成功' }
  }

  /**
   * Get user dictionaries path.
   *
   * @returns {string} The path to user dictionaries directory.
   */
  getUserDictionariesPath () {
    return getUserDataDictPath()
  }

  /**
   * Returns a list of available dictionaries.
   * @returns {string[]} Available dictionary languages.
   */
  getAvailableDictionaries () {
    const resourcesDictPath = getResourcesDictPath()
    const userDictPath = getUserDataDictPath()

    const available = []

    // Scan resources/static directory for built-in dictionaries
    if (fs.existsSync(resourcesDictPath)) {
      const files = fs.readdirSync(resourcesDictPath)
      files.forEach(filename => {
        const match = filename.match(/^([a-z]{2}(?:[-_][A-Z]{2})?)\.dic$/)
        if (match && match[1]) {
          const langCode = match[1].replace('_', '-')
          available.push(langCode)
        }
      })
    }

    // Scan userData/dictionaries/ for user-imported dictionaries
    if (userDictPath && fs.existsSync(userDictPath)) {
      const files = fs.readdirSync(userDictPath)
      files.forEach(filename => {
        const match = filename.match(/^([a-z]{2}(?:[-_][A-Z]{2})?)\.dic$/)
        if (match && match[1] && !available.includes(match[1])) {
          const langCode = match[1].replace('_', '-')
          available.push(langCode)
        }
      })
    }

    return [...new Set(available)]
  }

  /**
   * Is the spellchecker trying to detect the typed language automatically?
   * Note: electron-hunspell does not support automatic language detection.
   */
  get automaticallyIdentifyLanguages () {
    return false
  }

  /**
   * Is the spellchecker trying to detect the typed language automatically?
   */
  set automaticallyIdentifyLanguages (value) {
    // electron-hunspell does not support automatic language detection
    // No-op
  }

  /**
   * Returns true if not misspelled words should be highlighted.
   * Note: electron-hunspell always highlights misspelled words.
   */
  get isPassiveMode () {
    return false
  }

  /**
   * Should we highlight misspelled words.
   */
  set isPassiveMode (value) {
    // electron-hunspell always highlights misspelled words
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
    return !this.isEnabled || !this._provider || !this._attached
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
   * @returns {boolean} True if the word is misspelled.
   */
  async isMisspelled (word) {
    if (!this.isEnabled || !this._provider) {
      return false
    }

    try {
      const result = await this._provider.spell(word)
      return !result // spell() returns true if correct, false if misspelled
    } catch (e) {
      return false
    }
  }

  /**
   * Get corrections for a misspelled word.
   *
   * @param {string} word The word to get suggestions for.
   * @returns {string[]} An array of suggestions.
   */
  async getWordSuggestion (word) {
    if (!this.isEnabled || !this._provider) {
      return []
    }

    try {
      const suggestions = await this._provider.getSuggestion(word)
      return Array.isArray(suggestions) ? suggestions : []
    } catch (e) {
      return []
    }
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
    if (!this._provider || !this._attached) {
      return null
    }

    // Check if dictionary is already loaded
    if (!this._loadedDictionaries.has(lang)) {
      // Try to load the dictionary
      const loaded = await this._loadDictionary(lang)
      if (!loaded) {
        // Try fallback: en-US > en > first available
        const available = this.getAvailableDictionaries()
        const fallback = available.find(l => l.startsWith('en')) || available[0]
        if (!fallback) {
          return null
        }
        lang = fallback

        if (!this._loadedDictionaries.has(lang)) {
          const loaded = await this._loadDictionary(lang)
          if (!loaded) {
            return null
          }
        }
      }
    }

    try {
      await this._attached.switchLanguage(lang)
      this._lang = lang
      return this._lang
    } catch (e) {
      return null
    }
  }

  /**
   * Load a dictionary from disk.
   *
   * @param {string} lang Language code (e.g., "en-US")
   * @returns {boolean} True if dictionary was loaded successfully
   */
  async _loadDictionary (lang) {
    if (!this._provider) {
      return false
    }

    // Convert language code to filename format (e.g., "en-US" -> "en_US")
    const filename = lang.replace('-', '_')

    // Check resources directory first
    const resourcesDictPath = getResourcesDictPath()
    let dicPath = path.join(resourcesDictPath, `${filename}.dic`)
    let affPath = path.join(resourcesDictPath, `${filename}.aff`)

    // If not found, try with hyphen format
    if (!fs.existsSync(dicPath) || !fs.existsSync(affPath)) {
      dicPath = path.join(resourcesDictPath, `${lang}.dic`)
      affPath = path.join(resourcesDictPath, `${lang}.aff`)
    }

    // If not in resources, check userData directory
    if (!fs.existsSync(dicPath) || !fs.existsSync(affPath)) {
      const userDictPath = getUserDataDictPath()
      dicPath = path.join(userDictPath, `${filename}.dic`)
      affPath = path.join(userDictPath, `${filename}.aff`)

      // If not found, try with hyphen format
      if (!fs.existsSync(dicPath) || !fs.existsSync(affPath)) {
        dicPath = path.join(userDictPath, `${lang}.dic`)
        affPath = path.join(userDictPath, `${lang}.aff`)
      }
    }

    if (!fs.existsSync(dicPath) || !fs.existsSync(affPath)) {
      return false
    }

    try {
      const dicBuffer = fs.readFileSync(dicPath)
      const affBuffer = fs.readFileSync(affPath)

      await this._provider.loadDictionary(lang, dicBuffer, affBuffer)
      this._loadedDictionaries.add(lang)
      return true
    } catch (e) {
      console.error(`Failed to load dictionary for ${lang}:`, e.message)
      return false
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
