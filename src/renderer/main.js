import { createApp } from 'vue'
import sourceMapSupport from 'source-map-support'
import bootstrapRenderer from './bootstrap'
import { createRouter, createWebHashHistory } from 'vue-router'
import { createPinia } from 'pinia'
import axios from './axios'
import './assets/symbolIcon'
import { ipcRenderer } from 'electron'

// Pinia stores
import {
  useRootStore,
  useEditorStore,
  usePreferencesStore,
  useLayoutStore,
  useProjectStore,
  useCommandCenterStore,
  useTweetStore,
  useNotificationStore,
  useAutoUpdatesStore,
  useListenForMainStore
} from './stores'
import bus from './bus'
import {
  FileEncodingCommand,
  LineEndingCommand,
  QuickOpenCommand,
  TrailingNewlineCommand
} from './commands'

// Load eve before snap.svg (which depends on eve being a global variable)
import eve from 'eve-raphael'
import services from './services'
import routes from './router'
import { addElementStyle } from '@/util/theme'

import './assets/styles/index.css'
import './assets/styles/printService.css'
if (typeof window !== 'undefined') {
  window.eve = eve
}

// -----------------------------------------------

// Decode source map in production - must be registered first
sourceMapSupport.install({
  environment: 'node',
  handleUncaughtExceptions: false,
  hookRequire: false
})

global.marktext = {}
bootstrapRenderer()

addElementStyle()

// -----------------------------------------------
// Be careful when changing code before this line!

// Configure Vue
locale.use(lang)

const router = createRouter({
  history: createWebHashHistory(),
  routes: routes(global.marktext.env.type)
})

const pinia = createPinia()

const app = createApp({
  router,
  template: '<router-view class="view"></router-view>'
})

app.use(pinia)
app.use(router)

app.config.globalProperties.$http = axios

services.forEach(s => {
  app.config.globalProperties['$' + s.name] = s[s.name]
})

app.mount('#app')

// Initialize Pinia stores and dispatch all IPC listener actions
const rootStore = useRootStore()
const editorStore = useEditorStore()
const preferencesStore = usePreferencesStore()
const layoutStore = useLayoutStore()
const projectStore = useProjectStore()
const commandCenterStore = useCommandCenterStore()
const tweetStore = useTweetStore()
const notificationStore = useNotificationStore()
const autoUpdatesStore = useAutoUpdatesStore()
const listenForMainStore = useListenForMainStore()

// Root store listeners
rootStore.listenForWinStatus()

// Editor store listeners (exclude bootstrap - handled below)
editorStore.listenForSave()
editorStore.listenForSaveAs()
editorStore.listenForSetPathname()
editorStore.listenForClose()
editorStore.listenForSaveClose()
editorStore.listenForMoveTo()
editorStore.listenForRename()
editorStore.listenForNewTab()
editorStore.listenForCloseTab()
editorStore.listenForTabCycle()
editorStore.listenForSwitchTabs()
editorStore.lintenForSetLineEnding()
editorStore.lintenForSetEncoding()
editorStore.lintenForSetFinalNewline()
editorStore.listenForFileChange()
editorStore.listenWindowZoom()
editorStore.listenForReloadImages()
editorStore.lintenForExportSuccess()
editorStore.lintenForPrintServiceClearup()
editorStore.listenScreenShot()

// Bootstrap editor (moved from editor store to avoid circular dependencies)
setTimeout(() => {
  const editorState = {
    currentFile: editorStore.currentFile,
    tabs: editorStore.tabs,
    listToc: editorStore.listToc,
    toc: editorStore.toc
  }
  const rootState = {
    platform: rootStore.platform,
    appVersion: rootStore.appVersion,
    windowActive: rootStore.windowActive,
    init: rootStore.init,
    editor: editorState
  }
  bus.emit('cmd::register-command', new FileEncodingCommand(editorState))
  bus.emit('cmd::register-command', new QuickOpenCommand(rootState))
  bus.emit('cmd::register-command', new LineEndingCommand(editorState))
  bus.emit('cmd::register-command', new TrailingNewlineCommand(editorState))

  setTimeout(() => {
    ipcRenderer.send('mt::request-keybindings')
    bus.emit('cmd::sort-commands')
  }, 100)
}, 400)

ipcRenderer.on('mt::bootstrap-editor', (e, config) => {
  const { addBlankTab, markdownList, lineEnding, sideBarVisibility, tabBarVisibility, sourceCodeModeEnabled } = config

  rootStore.setInitialized()

  preferencesStore.setUserPreference({ endOfLine: lineEnding })

  layoutStore.setLayout({
    rightColumn: 'files',
    showSideBar: !!sideBarVisibility,
    showTabBar: !!tabBarVisibility
  })
  layoutStore.setLayoutMenuItem()

  preferencesStore.setMode({
    type: 'sourceCode',
    checked: !!sourceCodeModeEnabled
  })

  if (addBlankTab) {
    editorStore.newUntitledTab({})
  } else if (markdownList && markdownList.length) {
    let isFirst = true
    for (const markdown of markdownList) {
      editorStore.newUntitledTab({ markdown, selected: isFirst })
      isFirst = false
    }
  }
})

// Layout store listeners
layoutStore.listenForLayout()
layoutStore.listenForRequestLayout()

// Preferences store listeners
preferencesStore.askForUserPreference()
preferencesStore.listenToggleView()

// Project store listeners
projectStore.listenForLoadProject()
projectStore.listenForUpdateProject()
projectStore.listenForSidebarContextMenu()

// Command center store listener
commandCenterStore.listenCommandCenterBus()

// Simple IPC listener stores
tweetStore.listenForTweet()
notificationStore.listenForNotification()
autoUpdatesStore.listenForUpdate()

// Listen for main process messages
listenForMainStore.listenForEdit()
listenForMainStore.listenForView()
listenForMainStore.listenForShowDialog()
listenForMainStore.listenForParagraphInlineStyle()
