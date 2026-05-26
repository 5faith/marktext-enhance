import { defineStore } from 'pinia'
import { ipcRenderer } from 'electron'
import bus from '../bus'

const width = localStorage.getItem('side-bar-width')
const sideBarWidth = typeof +width === 'number' ? Math.max(+width, 220) : 280

export const useLayoutStore = defineStore('layout', {
  state: () => ({
    rightColumn: 'files',
    showSideBar: true,
    showTabBar: true,
    sideBarWidth
  }),
  actions: {
    listenForLayout () {
      ipcRenderer.on('mt::set-view-layout', (e, layout) => {
        if (layout.rightColumn) {
          this.setLayout({
            ...layout,
            rightColumn: layout.rightColumn === this.rightColumn ? '' : layout.rightColumn,
            showSideBar: true
          })
        } else {
          this.setLayout(layout)
        }
      })

      bus.on('view:toggle-view-layout-entry', entryName => {
        this.toggleLayoutEntry(entryName)
        const item = {}
        item[entryName] = this[entryName]
        const { windowId } = global.marktext.env
        ipcRenderer.send('mt::view-layout-changed', windowId, item)
      })
    },

    listenForRequestLayout () {
      ipcRenderer.on('mt::request-for-view-layout', () => {
        this.setLayoutMenuItem()
      })
    },

    setLayout (layout) {
      if (layout.showSideBar !== undefined) {
        const { windowId } = global.marktext.env
        ipcRenderer.send('mt::update-sidebar-menu', windowId, !!layout.showSideBar)
      }
      Object.assign(this, layout)
    },

    toggleLayoutEntry (entryName) {
      this[entryName] = !this[entryName]
    },

    setLayoutMenuItem () {
      const { windowId } = global.marktext.env
      const { showTabBar, showSideBar } = this
      ipcRenderer.send('mt::view-layout-changed', windowId, { showTabBar, showSideBar })
    },

    changeSideBarWidth (width) {
      localStorage.setItem('side-bar-width', Math.max(+width, 220))
      this.sideBarWidth = width
    }
  }
})
