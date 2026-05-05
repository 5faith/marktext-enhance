import { defineStore } from 'pinia'
import { ipcRenderer } from 'electron'

export const useRootStore = defineStore('root', {
  state: () => ({
    platform: process.platform,
    appVersion: process.versions.MARKTEXT_VERSION_STRING,
    windowActive: true,
    init: false
  }),

  actions: {
    setWinStatus (status) {
      this.windowActive = status
    },

    setInitialized () {
      this.init = true
    },

    listenForWinStatus () {
      ipcRenderer.on('mt::window-active-status', (e, { status }) => {
        this.setWinStatus(status)
      })
    }
  }
})
