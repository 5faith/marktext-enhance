import { defineStore } from 'pinia'
import { ipcRenderer } from 'electron'
import bus from '../bus'
// Import other stores for cross-store access (ESM hoists these)
import { useLayoutStore } from './layout'
import { usePreferencesStore } from './preferences'

export const useListenForMainStore = defineStore('listenForMain', {
  actions: {
    listenForEdit () {
      const layoutStore = useLayoutStore()
      const _preferencesStore = usePreferencesStore()

      ipcRenderer.on('mt::editor-edit-action', (e, type) => {
        if (type === 'findInFolder') {
          layoutStore.setLayout({
            rightColumn: 'search',
            showSideBar: true
          })
        }
        bus.emit(type, type)
      })
    },

    listenForView () {
      const preferencesStore = usePreferencesStore()

      ipcRenderer.on('mt::editor-change-view', (e, data) => {
        preferencesStore.setMode(data)
      })
      ipcRenderer.on('mt::show-command-palette', () => {
        bus.emit('show-command-palette')
      })
    },

    listenForShowDialog () {
      ipcRenderer.on('mt::about-dialog', () => {
        bus.emit('aboutDialog')
      })
      ipcRenderer.on('mt::show-export-dialog', (e, type) => {
        bus.emit('showExportDialog', type)
      })
    },

    listenForParagraphInlineStyle () {
      ipcRenderer.on('mt::editor-paragraph-action', (e, { type }) => {
        bus.emit('paragraph', type)
      })
      ipcRenderer.on('mt::editor-format-action', (e, { type }) => {
        bus.emit('format', type)
      })
    }
  }
})
