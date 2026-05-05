import { ipcRenderer } from 'electron'
import bus from '../bus'
import { defineStore } from 'pinia'

export const usePreferencesStore = defineStore('preferences', {
  state: () => ({
    autoSave: false,
    autoSaveDelay: 5000,
    titleBarStyle: 'custom',
    openFilesInNewWindow: false,
    openFolderInNewWindow: false,
    zoom: 1.0,
    hideScrollbar: false,
    wordWrapInToc: false,
    fileSortBy: 'created',
    startUpAction: 'lastState',
    defaultDirectoryToOpen: '',
    language: 'en',

    editorFontFamily: 'Open Sans',
    fontSize: 16,
    lineHeight: 1.6,
    codeFontSize: 14,
    codeFontFamily: 'DejaVu Sans Mono',
    codeBlockLineNumbers: true,
    trimUnnecessaryCodeBlockEmptyLines: true,
    editorLineWidth: '',

    autoPairBracket: true,
    autoPairMarkdownSyntax: true,
    autoPairQuote: true,
    endOfLine: 'default',
    defaultEncoding: 'utf8',
    autoGuessEncoding: true,
    trimTrailingNewline: 2,
    textDirection: 'ltr',
    hideQuickInsertHint: false,
    imageInsertAction: 'folder',
    imagePreferRelativeDirectory: false,
    imageRelativeDirectoryName: 'assets',
    hideLinkPopup: false,
    autoCheck: false,

    preferLooseListItem: true,
    bulletListMarker: '-',
    orderListDelimiter: '.',
    preferHeadingStyle: 'atx',
    tabSize: 4,
    listIndentation: 1,
    frontmatterType: '-',
    superSubScript: false,
    footnote: false,
    isHtmlEnabled: true,
    isGitlabCompatibilityEnabled: false,
    sequenceTheme: 'hand',

    theme: 'light',
    autoSwitchTheme: 2,

    spellcheckerEnabled: false,
    spellcheckerIsHunspell: false,
    spellcheckerNoUnderline: false,
    spellcheckerAutoDetectLanguage: false,
    spellcheckerLanguage: 'en-US',

    sideBarVisibility: false,
    tabBarVisibility: false,
    sourceCodeModeEnabled: false,

    searchExclusions: [],
    searchMaxFileSize: '',
    searchIncludeHidden: false,
    searchNoIgnore: false,
    searchFollowSymlinks: true,

    watcherUsePolling: false,

    typewriter: false,
    focus: false,
    sourceCode: false,

    imageFolderPath: '',
    webImages: [],
    cloudImages: [],
    currentUploader: 'none',
    githubToken: '',
    imageBed: {
      github: {
        owner: '',
        repo: '',
        branch: ''
      }
    },
    cliScript: ''
  }),

  actions: {
    setUserPreference (preference) {
      Object.keys(preference).forEach(key => {
        if (typeof preference[key] !== 'undefined' && typeof this[key] !== 'undefined') {
          this[key] = preference[key]
        }
      })
    },

    setMode ({ type, checked }) {
      this[type] = checked
    },

    toggleViewMode (entryName) {
      this[entryName] = !this[entryName]
    },

    askForUserPreference () {
      ipcRenderer.send('mt::ask-for-user-preference')
      ipcRenderer.send('mt::ask-for-user-data')

      ipcRenderer.on('mt::user-preference', (e, preferences) => {
        this.setUserPreference(preferences)
      })
    },

    setSinglePreference ({ type, value }) {
      ipcRenderer.send('mt::set-user-preference', { [type]: value })
    },

    setUserData ({ type, value }) {
      ipcRenderer.send('mt::set-user-data', { [type]: value })
    },

    setImageFolderPath (value) {
      ipcRenderer.send('mt::ask-for-modify-image-folder-path', value)
    },

    selectDefaultDirectoryToOpen () {
      ipcRenderer.send('mt::select-default-directory-to-open')
    },

    listenToggleView () {
      bus.on('view:toggle-view-entry', entryName => {
        this.toggleViewMode(entryName)
        const item = {}
        item[entryName] = this[entryName]
        const { windowId } = global.marktext.env
        ipcRenderer.send('mt::view-layout-changed', windowId, item)
      })
    }
  }
})
