import { defineStore } from 'pinia'
import { ipcRenderer, shell } from 'electron'
import path from 'path'
import { addFile, unlinkFile, addDirectory, unlinkDirectory } from '../store/treeCtrl'
import bus from '../bus'
import { create, paste, rename } from '../util/fileSystem'
import { PATH_SEPARATOR } from '../config'
import notice from '../services/notification'
import { getFileStateFromData } from '../store/help'
import { hasMarkdownExtension } from '../../common/filesystem/paths'
import { useLayoutStore } from './layout'

export const useProjectStore = defineStore('project', {
  state: () => ({
    activeItem: {},
    createCache: {},
    newFileNameCache: '',
    renameCache: null,
    clipboard: null,
    projectTree: null
  }),
  actions: {
    setRootDirectory(pathname) {
      let name = path.basename(pathname)
      if (!name) {
        name = pathname
      }

      this.projectTree = {
        pathname: path.normalize(pathname),
        name,
        isDirectory: true,
        isFile: false,
        isMarkdown: false,
        folders: [],
        files: []
      }
    },

    setNewFileName(name) {
      this.newFileNameCache = name
    },

    addFileToTree(change) {
      addFile(this.projectTree, change)
    },

    unlinkFileFromTree(change) {
      unlinkFile(this.projectTree, change)
    },

    addDirectoryToTree(change) {
      addDirectory(this.projectTree, change)
    },

    unlinkDirectoryFromTree(change) {
      unlinkDirectory(this.projectTree, change)
    },

    setActiveItem(activeItem) {
      this.activeItem = activeItem
    },

    setClipboard(data) {
      this.clipboard = data
    },

    setCreateCache(cache) {
      this.createCache = cache
    },

    setRenameCache(cache) {
      this.renameCache = cache
    },

    listenForLoadProject() {
      ipcRenderer.on('mt::open-directory', (e, pathname) => {
        this.setRootDirectory(pathname)
        const layoutStore = useLayoutStore()
        layoutStore.setLayout({
          rightColumn: 'files',
          showSideBar: true,
          showTabBar: true
        })
        layoutStore.setLayoutMenuItem()
      })
    },

    listenForUpdateProject() {
      ipcRenderer.on('mt::update-object-tree', (e, { type, change }) => {
        switch (type) {
          case 'add': {
            const { pathname, data, isMarkdown } = change
            this.addFileToTree(change)
            if (isMarkdown && this.newFileNameCache && pathname === this.newFileNameCache) {
              const fileState = getFileStateFromData(data)
              // TODO: migrate to editor store after editor store is created
              // dispatch('UPDATE_CURRENT_FILE', fileState)
              this.setNewFileName('')
            }
            break
          }
          case 'unlink':
            this.unlinkFileFromTree(change)
            // TODO: migrate to editor store after editor store is created
            // commit('SET_SAVE_STATUS_WHEN_REMOVE', change)
            break
          case 'addDir':
            this.addDirectoryToTree(change)
            break
          case 'unlinkDir':
            this.unlinkDirectoryFromTree(change)
            break
          case 'change':
            break
          default:
            if (process.env.NODE_ENV === 'development') {
              console.log(`Unknown directory watch type: "${type}"`)
            }
            break
        }
      })
    },

    changeActiveItem(activeItem) {
      this.setActiveItem(activeItem)
    },

    changeClipboard(data) {
      this.setClipboard(data)
    },

    askForOpenProject() {
      ipcRenderer.send('mt::ask-for-open-project-in-sidebar')
    },

    listenForSidebarContextMenu() {
      bus.on('SIDEBAR::show-in-folder', () => {
        const { pathname } = this.activeItem
        shell.showItemInFolder(pathname)
      })
      bus.on('SIDEBAR::new', type => {
        const { pathname, isDirectory } = this.activeItem
        const dirname = isDirectory ? pathname : path.dirname(pathname)
        this.setCreateCache({ dirname, type })
        bus.emit('SIDEBAR::show-new-input')
      })
      bus.on('SIDEBAR::remove', () => {
        const { pathname } = this.activeItem
        shell.trashItem(pathname).catch(err => {
          notice.notify({
            title: 'Error while deleting',
            type: 'error',
            message: err.message
          })
        })
      })
      bus.on('SIDEBAR::copy-cut', type => {
        const { pathname: src } = this.activeItem
        this.setClipboard({ type, src })
      })
      bus.on('SIDEBAR::paste', () => {
        const { clipboard } = this
        const { pathname, isDirectory } = this.activeItem
        const dirname = isDirectory ? pathname : path.dirname(pathname)
        if (clipboard && clipboard.src) {
          clipboard.dest = dirname + PATH_SEPARATOR + path.basename(clipboard.src)

          if (path.normalize(clipboard.src) === path.normalize(clipboard.dest)) {
            notice.notify({
              title: 'Paste Forbidden',
              type: 'warning',
              message: 'Source and destination must not be the same.'
            })
            return
          }

          paste(clipboard)
            .then(() => {
              this.setClipboard(null)
            })
            .catch(err => {
              notice.notify({
                title: 'Error while pasting',
                type: 'error',
                message: err.message
              })
            })
        }
      })
      bus.on('SIDEBAR::rename', () => {
        const { pathname } = this.activeItem
        this.setRenameCache(pathname)
        bus.emit('SIDEBAR::show-rename-input')
      })
    },

    createFileDirectory(name) {
      const { dirname, type } = this.createCache

      if (type === 'file' && !hasMarkdownExtension(name)) {
        name += '.md'
      }

      const fullName = `${dirname}/${name}`

      create(fullName, type)
        .then(() => {
          this.setCreateCache({})
          if (type === 'file') {
            this.setNewFileName(fullName)
          }
        })
        .catch(err => {
          notice.notify({
            title: 'Error in Side Bar',
            type: 'error',
            message: err.message
          })
        })
    },

    renameInSidebar(name) {
      const src = this.renameCache
      const dirname = path.dirname(src)
      const dest = dirname + PATH_SEPARATOR + name
      rename(src, dest)
        .then(() => {
          // TODO: migrate to editor store after editor store is created
          // commit('RENAME_IF_NEEDED', { src, dest })
        })
    },

    openSettingWindow() {
      ipcRenderer.send('mt::open-setting-window')
    }
  }
})
