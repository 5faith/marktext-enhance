import * as contextMenu from './actions'

// NOTE: This are mutable fields that may change at runtime.

export const SEPARATOR = {
  type: 'separator'
}

export const CLOSE_THIS = {
  label: 'Close',
  id: 'closeThisTab',
  click (menuItem, _browserWindow) {
    contextMenu.closeThis(menuItem._tabId)
  }
}

export const CLOSE_OTHERS = {
  label: 'Close others',
  id: 'closeOtherTabs',
  click (menuItem, _browserWindow) {
    contextMenu.closeOthers(menuItem._tabId)
  }
}

export const CLOSE_SAVED = {
  label: 'Close saved tabs',
  id: 'closeSavedTabs',
  click (_menuItem, _browserWindow) {
    contextMenu.closeSaved()
  }
}

export const CLOSE_ALL = {
  label: 'Close all tabs',
  id: 'closeAllTabs',
  click (_menuItem, _browserWindow) {
    contextMenu.closeAll()
  }
}

export const RENAME = {
  label: 'Rename',
  id: 'renameFile',
  click (menuItem, _browserWindow) {
    contextMenu.rename(menuItem._tabId)
  }
}

export const COPY_PATH = {
  label: 'Copy path',
  id: 'copyPath',
  click (menuItem, _browserWindow) {
    contextMenu.copyPath(menuItem._tabId)
  }
}

export const SHOW_IN_FOLDER = {
  label: 'Show in folder',
  id: 'showInFolder',
  click (menuItem, _browserWindow) {
    contextMenu.showInFolder(menuItem._tabId)
  }
}
