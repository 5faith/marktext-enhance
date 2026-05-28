import { MenuItem as RemoteMenuItem } from '@electron/remote'
import bus from '@/bus'
import { getLanguageName } from '@/spellchecker/languageMap'
import { SEPARATOR } from './menuItems'

const log = /* @vite-ignore */ require('electron-log')

/**
 * Build the spell checker menu depending on input.
 *
 * @param {[SpellChecker]} spellchecker The spellcheck wrapper.
 * @param {[string]} selectedWord The selected word.
 * @param {[string[]]} wordSuggestions Suggestions for `word`.
 * @param {*} replaceCallback The callback to replace the word by a replacement.
 * @returns {MenuItem[]}
 */
export default (spellchecker, selectedWord, wordSuggestions, replaceCallback) => {
  if (spellchecker && spellchecker.isEnabled) {
    const spellingSubmenu = []

    // Change language menu entries
    const currentLanguage = spellchecker.lang
    const availableDictionaries = spellchecker.getAvailableDictionaries()
    const availableDictionariesSubmenu = []
    for (const dict of availableDictionaries) {
      availableDictionariesSubmenu.push(new RemoteMenuItem({
        label: getLanguageName(dict),
        enabled: dict !== currentLanguage,
        click () {
          bus.emit('switch-spellchecker-language', dict)
        }
      }))
    }

    spellingSubmenu.push(new RemoteMenuItem({
      label: 'Change Language...',
      submenu: availableDictionariesSubmenu
    }))

    spellingSubmenu.push(SEPARATOR)

    // Handle misspelled word if wordSuggestions is set, otherwise word is correct.
    if (selectedWord && wordSuggestions && wordSuggestions.length > 0) {
      // Show spelling suggestions first
      for (const suggestion of wordSuggestions) {
        spellingSubmenu.push(new RemoteMenuItem({
          label: suggestion,
          click () {
            // Notify Muya to replace the word. We cannot just use Chromium to
            // replace the word because the change is not forwarded to Muya.
            replaceCallback(suggestion)
          }
        }))
      }

      spellingSubmenu.push(SEPARATOR)

      spellingSubmenu.push(new RemoteMenuItem({
        label: 'Add to Dictionary',
        click () {
          // Add word to dictionary using electron-hunspell
          spellchecker.addToDictionary(selectedWord)
            .catch(error => {
              log.error(`Error while adding "${selectedWord}" to dictionary.`)
              log.error(error)
            })
        }
      }))

      // Ignore word for current runtime for all languages.
      spellingSubmenu.push(new RemoteMenuItem({
        label: 'Ignore',
        click () {
          // Ignore word using electron-hunspell
          spellchecker.ignoreWord(selectedWord)
        }
      }))
    } else if (selectedWord) {
      // Word is spelled correctly - show option to remove from dictionary
      spellingSubmenu.push(new RemoteMenuItem({
        label: 'Remove from Dictionary',
        // NOTE: We cannot validate that the word is inside the user dictionary.
        enabled: !!selectedWord && selectedWord.length >= 2,
        click () {
          // Remove word from dictionary using electron-hunspell
          spellchecker.removeFromDictionary(selectedWord)
            .catch(error => {
              log.error(`Error while removing "${selectedWord}" from dictionary.`)
              log.error(error)
            })
        }
      }))
    }
    return spellingSubmenu
  }
  return null
}
