import * as contextMenu from './actions'

// NOTE: This are mutable fields that may change at runtime.

export const SEPARATOR = {
  type: 'separator'
}

export const NEW_FILE = {
  label: 'New File',
  id: 'newFileMenuItem',
  click (_menuItem, _browserWindow) {
    contextMenu.newFile()
  }
}

export const NEW_DIRECTORY = {
  label: 'New Directory',
  id: 'newDirectoryMenuItem',
  click (_menuItem, _browserWindow) {
    contextMenu.newDirectory()
  }
}

export const COPY = {
  label: 'Copy',
  id: 'copyMenuItem',
  click (_menuItem, _browserWindow) {
    contextMenu.copy()
  }
}

export const CUT = {
  label: 'Cut',
  id: 'cutMenuItem',
  click (_menuItem, _browserWindow) {
    contextMenu.cut()
  }
}

export const PASTE = {
  label: 'Paste',
  id: 'pasteMenuItem',
  click (_menuItem, _browserWindow) {
    contextMenu.paste()
  }
}

export const RENAME = {
  label: 'Rename',
  id: 'renameMenuItem',
  click (_menuItem, _browserWindow) {
    contextMenu.rename()
  }
}

export const DELETE = {
  label: 'Move To Trash',
  id: 'deleteMenuItem',
  click (_menuItem, _browserWindow) {
    contextMenu.remove()
  }
}

export const SHOW_IN_FOLDER = {
  label: 'Show In Folder',
  id: 'showInFolderMenuItem',
  click (_menuItem, _browserWindow) {
    contextMenu.showInFolder()
  }
}
