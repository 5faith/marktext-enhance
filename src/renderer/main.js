import { createApp, h } from 'vue'
import { createRouter, createWebHashHistory, RouterView } from 'vue-router'
import { createPinia } from 'pinia'
import sourceMapSupport from 'source-map-support'
import bootstrapRenderer from './bootstrap'
import axios from './axios'
import './assets/symbolIcon'
import { ipcRenderer } from 'electron'

// Import stores and other modules
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

import eve from 'eve-raphael'
import services from './services'
import routes from './router'
import { addElementStyle } from '@/util/theme'

import './assets/styles/index.css'
import './assets/styles/printService.css'

// Global error handler
window.addEventListener('error', (event) => {
  console.error('[Renderer Error]:', event.error?.stack || event.error)
})
window.addEventListener('unhandledrejection', (event) => {
  console.error('[Renderer Rejection]:', event.reason?.stack || event.reason)
})

console.log('[Renderer] Starting...')
console.log('[Renderer] URL:', window.location.href)
if (typeof window !== 'undefined') {
  window.eve = eve
}

// -----------------------------------------------
sourceMapSupport.install({
  environment: 'node',
  handleUncaughtExceptions: false,
  hookRequire: false
})

global.marktext = {}
bootstrapRenderer()
addElementStyle()

// -----------------------------------------------
console.log('[Renderer] Creating router with type:', global.marktext?.env?.type)
const router = createRouter({
  history: createWebHashHistory(),
  routes: routes(global.marktext?.env?.type)
})

const pinia = createPinia()
const app = createApp({
  render: () => h(RouterView, { class: 'view' })
})

app.use(pinia)
app.use(router)
app.config.globalProperties.$http = axios

services.forEach(s => {
  app.config.globalProperties['$' + s.name] = s[s.name]
})

app.mount('#app')

console.log('[Renderer] App mounted!')

// Test: Directly manipulate DOM to see if page can display anything
const appEl = document.querySelector('#app')
if (appEl) {
  console.log('[Renderer] #app element found, innerHTML length:', appEl.innerHTML.length)
  // Don't override if Vue is working
  // appEl.innerHTML = '<h1 style="color: red;">Hello from raw DOM!</h1>'
} else {
  console.error('[Renderer] #app element NOT found!')
}

// Initialize Pinia stores
console.log('[Renderer] Initializing stores...')
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

// Initialize directly from URL params (no IPC needed)
const urlParams = new URLSearchParams(window.location.search)
const _addBlankTab = urlParams.get('addBlankTab') === 'true' || true // default true for editor
console.log('[Renderer] Initializing directly (no IPC)...')
rootStore.setInitialized()

// Default initialization
editorStore.newUntitledTab({})
console.log('[Renderer] Direct initialization done!')

// Bootstrap editor (register commands)
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

// Root store listeners
rootStore.listenForWinStatus()

// Editor store listeners
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
