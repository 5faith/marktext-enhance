import { defineStore } from 'pinia'
import { ipcRenderer } from 'electron'
import bus from '../bus'
import staticCommands, { RootCommand } from '../commands'

const log = /* @vite-ignore */ require('electron-log')

export const useCommandCenterStore = defineStore('commandCenter', {
  state: () => ({
    rootCommand: new RootCommand(staticCommands)
  }),
  actions: {
    listenCommandCenterBus () {
      bus.on('cmd::sort-commands', () => {
        this.sortCommands()
      })
      ipcRenderer.on('mt::keybindings-response', (e, keybindingMap) => {
        const { subcommands } = this.rootCommand
        for (const entry of subcommands) {
          const value = keybindingMap[entry.id]
          if (value) {
            entry.shortcut = normalizeAccelerator(value)
          }
        }
      })

      bus.on('cmd::register-command', command => {
        this.registerCommand(command)
      })

      bus.on('cmd::execute', commandId => {
        executeCommand(this, commandId)
      })
      ipcRenderer.on('mt::execute-command-by-id', (e, commandId) => {
        executeCommand(this, commandId)
      })
    },

    registerCommand (command) {
      this.rootCommand.subcommands.push(command)
    },

    sortCommands () {
      this.rootCommand.subcommands.sort((a, b) => a.description.localeCompare(b.description))
    }
  }
})

const executeCommand = (store, commandId) => {
  const { subcommands } = store.rootCommand
  const command = subcommands.find(c => c.id === commandId)
  if (!command) {
    const errorMsg = `Cannot execute command "${commandId}" because it's missing.`
    log.error(errorMsg)
    throw new Error(errorMsg)
  }
  command.execute()
}

const normalizeAccelerator = acc => {
  try {
    return acc
      .replace(/cmdorctrl|cmd/i, 'Cmd')
      .replace(/ctrl/i, 'Ctrl')
      .split('+')
  } catch (_) {
    return [acc]
  }
}
