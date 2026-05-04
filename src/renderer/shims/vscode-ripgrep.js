// Shim for vscode-ripgrep in Vite dev mode
// The actual binary is only available in Electron main process
// This shim allows the renderer process to load without errors during development

export const rgPath = ''
