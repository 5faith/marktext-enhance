import bus from '../../bus'

export const copyAsMarkdown = (_menuItem, _browserWindow) => {
  bus.emit('copyAsMarkdown', 'copyAsMarkdown')
}

export const copyAsHtml = (_menuItem, _browserWindow) => {
  bus.emit('copyAsHtml', 'copyAsHtml')
}

export const pasteAsPlainText = (_menuItem, _browserWindow) => {
  bus.emit('pasteAsPlainText', 'pasteAsPlainText')
}

export const insertParagraph = location => {
  bus.emit('insertParagraph', location)
}
