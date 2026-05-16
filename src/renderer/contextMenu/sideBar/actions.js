import bus from '../../bus'

export const newFile = (_menuItem, _browserWindow) => {
  bus.emit('SIDEBAR::new', 'file')
}

export const newDirectory = (_menuItem, _browserWindow) => {
  bus.emit('SIDEBAR::new', 'directory')
}

export const copy = (_menuItem, _browserWindow) => {
  bus.emit('SIDEBAR::copy-cut', 'copy')
}

export const cut = (_menuItem, _browserWindow) => {
  bus.emit('SIDEBAR::copy-cut', 'cut')
}

export const paste = (_menuItem, _browserWindow) => {
  bus.emit('SIDEBAR::paste')
}

export const rename = (_menuItem, _browserWindow) => {
  bus.emit('SIDEBAR::rename')
}

export const remove = (_menuItem, _browserWindow) => {
  bus.emit('SIDEBAR::remove')
}

export const showInFolder = (_menuItem, _browserWindow) => {
  bus.emit('SIDEBAR::show-in-folder')
}
