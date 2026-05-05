<template>
  <div class="command-palette">
    <el-dialog
      :visible.sync="showCommandPalette"
      :show-close="false"
      :modal="true"
      @close="handleDialogClose"
      custom-class="ag-dialog-table"
      width="500px"
    >
      <div slot="title" class="search-wrapper">
        <div class="input-wrapper">
          <input
            ref="search"
            type="text"
            v-model="query"
            class="search"
            @keydown="handleBeforeInput"
            @keyup="handleInput"
            :placeholder="placeholderText"
          >
        </div>
        <loading v-if="searcherBusy"></loading>
        <transition name="fade" v-else-if="availableCommands.length">
          <ul class="commands">
            <li
              v-for="(item, index) of availableCommands"
              :key="index"
              ref="command-items"
              @click="search(item.id)"
              :class="{'active': index === selectedCommandIndex}"
            >
              <span class="title" :title="item.title">{{item.description}}</span>
              <span class="shortcut">
                <span
                  class="shortcut"
                  v-for="(accelerator, index) of item.shortcut"
                  :key="index"
                >
                    <kbd>{{accelerator}}</kbd>
                </span>
              </span>
            </li>
          </ul>
        </transition>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import bus from '../../bus'
import loading from '../loading'
import { useCommandCenterStore } from '@/stores'

const log = require('electron-log')

const currentCommand = ref(null)
const showCommandPalette = ref(false)
const defaultPlaceholderText = 'Type a command to execute'
const placeholderText = ref(defaultPlaceholderText)
const query = ref('')
const selectedCommandIndex = ref(-1)
const availableCommands = ref([])
const searcherBusy = ref(false)
const searchRef = ref(null)
const commandItemsRef = ref([])

const rootCommand = computed(() => useCommandCenterStore().rootCommand)

const handleShow = (command) => {
  currentCommand.value = command || rootCommand.value
  currentCommand.value.run()
    .then(() => {
      availableCommands.value = currentCommand.value.subcommands
      selectedCommandIndex.value = currentCommand.value.subcommandSelectedIndex
      placeholderText.value = currentCommand.value.placeholder || defaultPlaceholderText
      query.value = ''
      showCommandPalette.value = true
      bus.emit('editor-blur')
      nextTick(() => {
        if (searchRef.value) {
          searchRef.value.focus()
        }
      })
    })
    .catch(error => {
      if (error && error.message) {
        log.error('Unable to initialize command:', error)
      }
    })
}

const handleDialogClose = () => {
  selectedCommandIndex.value = -1
  query.value = ''
  availableCommands.value = []
  if (currentCommand.value?.unload) {
    currentCommand.value.unload()
  }
  currentCommand.value = null
}

const handleBeforeInput = (event) => {
  const { availableCommands: availCmds, selectedCommandIndex: selIdx } = { availableCommands: availableCommands.value, selectedCommandIndex: selectedCommandIndex.value }
  switch (event.key) {
    case 'ArrowUp': {
      event.preventDefault()
      event.stopPropagation()
      if (selIdx <= 0) {
        selectedCommandIndex.value = availCmds.length - 1
      } else {
        selectedCommandIndex.value--
      }

      const items = commandItemsRef.value
      if (items && items.length > 0) {
        items[selectedCommandIndex.value]?.scrollIntoView({ block: 'end' })
      }
      break
    }
    case 'ArrowDown': {
      event.preventDefault()
      event.stopPropagation()
      if (selIdx + 1 >= availCmds.length) {
        selectedCommandIndex.value = 0
      } else {
        selectedCommandIndex.value++
      }

      const items = commandItemsRef.value
      if (items && items.length > 0) {
        items[selectedCommandIndex.value]?.scrollIntoView({ block: 'end' })
      }
      break
    }
  }
}

const handleInput = (event) => {
  if (event.isComposing) {
    return
  }
  switch (event.key) {
    case 'Control':
    case 'Alt':
    case 'Meta':
    case 'Shift':
    case 'Escape':
    case 'PageDown':
    case 'PageUp':
    case 'ArrowUp':
    case 'ArrowDown':
    case 'ArrowLeft':
    case 'ArrowRight': {
      break
    }
    case 'Enter': {
      search()
      break
    }
    default: {
      updateCommands()
      break
    }
  }
}

const search = (commandId = null) => {
  const { availableCommands: availCmds, selectedCommandIndex: selIdx } = { availableCommands: availableCommands.value, selectedCommandIndex: selectedCommandIndex.value }
  if (commandId) {
    executeCommand(commandId)
    return
  } else if (selIdx >= 0 && selIdx < availCmds.length) {
    executeCommand(availCmds[selIdx].id)
    return
  }

  updateCommands()
}

const updateCommands = () => {
  const { currentCommand: currCmd, query: q } = { currentCommand: currentCommand.value, query: query.value }
  const queryString = q.trim()

  if (currCmd?.search) {
    searcherBusy.value = true
    currCmd.search(queryString)
      .then(result => {
        searcherBusy.value = false
        availableCommands.value = result || []
        selectedCommandIndex.value = availableCommands.value.length ? 0 : -1
      })
      .catch(error => {
        if (error && error.message) {
          searcherBusy.value = false
          availableCommands.value = []
          selectedCommandIndex.value = -1
          log.error(error)
        }
      })
    return
  }

  if (!queryString) {
    availableCommands.value = currCmd?.subcommands || []
  } else {
    availableCommands.value = (currCmd?.subcommands || [])
      .filter(c => c.description.toLowerCase().indexOf(queryString.toLowerCase()) !== -1)
  }
  selectedCommandIndex.value = availableCommands.value.length ? 0 : -1
}

const executeCommand = (commandId) => {
  const { availableCommands: availCmds, currentCommand: currCmd } = { availableCommands: availableCommands.value, currentCommand: currentCommand.value }
  const command = availCmds.find(c => c.id === commandId)
  if (!command) {
    log.error(`Cannot find command "${commandId}".`)
    return
  }

  const { executeSubcommand } = currCmd || {}
  if (executeSubcommand) {
    showCommandPalette.value = false
    executeSubcommand(commandId, command.value)
  } else {
    const { execute, subcommands, run } = command
    if (execute === undefined && run === undefined && subcommands) {
      currentCommand.value = command
      selectedCommandIndex.value = -1
      query.value = ''
      updateCommands()
    } else {
      showCommandPalette.value = false
      execute()
    }
  }
}

onMounted(() => {
  bus.on('show-command-palette', handleShow)
})

onBeforeUnmount(() => {
  bus.off('show-command-palette', handleShow)
})
</script>

<style scoped>
  /* Hide scrollbar for this dialog */
  ::-webkit-scrollbar {
    display: none;
  }

  .search-wrapper {
    position: absolute;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 500px;
    height: auto;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    padding: 8px;
    margin: 0 auto;
    margin-top: 8px;
    box-sizing: border-box;
    color: var(--editorColor);
    background: var(--floatBgColor);
    border: 1px solid var(--floatBorderColor);
    border-radius: 4px;
    box-shadow: 0 3px 8px 3px var(--floatShadow);
    z-index: 10000;
  }
  .input-wrapper {
    display: block;
    width: 100%;
    border: 1px solid var(--inputBgColor);
    background: var(--inputBgColor);
    border-radius: 3px;
  }
  input.search {
    width: 100%;
    height: 30px;
    margin: 0 10px;
    font-size: 14px;
    color: var(--editorColor);
    background: transparent;
    outline: none;
    border: none;
  }
  .cpt-loading {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 50px;
    padding: 0;
    margin: 8px 0 0 0;
    box-sizing: border-box;
  }
  ul.commands {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-height: 300px;
    padding: 0;
    margin: 8px 0 0 0;
    box-sizing: border-box;
    list-style: none;
    overflow: hidden;
    overflow-y: scroll;
  }
  ul.commands li {
    position: relative;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    max-width: 100%;
    height: 35px;
    padding: 0 8px;
    font-size: 14px;
    line-height: 35px;
    text-overflow: ellipsis;
    cursor: pointer;
  }
  ul.commands li:hover {
    background: var(--floatHoverColor);
    opacity: 0.9;
  }
  ul.commands li.active {
    background: var(--floatHoverColor);
  }
  ul.commands li span {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }
  ul.commands li span.shortcut {
    font-size: 12px;
    line-height: 20px;
    & > kbd {
      margin-left: 2px;
    }
  }

  .fade-enter-active, .fade-leave-active {
    transition: opacity .2s;
  }
  .fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
    opacity: 0;
  }
</style>
<style>
  .command-palette .cpt-loading .loader {
    margin-top: 20px;
  }

  .command-palette .el-dialog,
  .command-palette .el-dialog.ag-dialog-table {
    box-shadow: none !important;
    border: none !important;
    background: none !important;
  }
  .command-palette .el-dialog__header {
    margin-bottom: 20px;
    padding: 0 !important;
  }
  .command-palette .el-dialog__body {
    display: none !important;
  }
</style>
