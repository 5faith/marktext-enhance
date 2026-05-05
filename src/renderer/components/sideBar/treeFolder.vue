<template>
  <div
    class="side-bar-folder"
  >
    <div
      class="folder-name" @click="folderNameClick"
      :style="{'padding-left': `${(depth * 20) + 20}px`}"
      :class="[{ 'active': folder.id === activeItem.id }]"
      :title="folder.pathname"
      ref="folder"
    >
      <svg class="icon" aria-hidden="true">
        <use :xlink:href="`#${folder.isCollapsed ? 'icon-folder-close' : 'icon-folder-open'}`"></use>
      </svg>
      <input
        type="text"
        @click.stop="noop"
        class="rename"
        v-if="renameCache === folder.pathname"
        v-model="newName"
        ref="renameInput"
        @keydown.enter="rename"
      >
      <span v-else class="text-overflow">{{folder.name}}</span>
    </div>
    <div
      class="folder-contents"
      v-if="!folder.isCollapsed"
    >
      <folder
        v-for="(childFolder, index) of folder.folders" :key="index + 'folder'"
        :folder="childFolder"
        :depth="depth + 1"
      ></folder>
      <input
        type="text" v-if="createCache.dirname === folder.pathname"
        class="new-input"
        :style="{'margin-left': `${depth * 5 + 15}px` }"
        ref="input"
        @keydown.enter="handleInputEnter"
        v-model="createName"
      >
      <file
        v-for="(file, index) of folder.files" :key="index + 'file'"
        :file="file"
        :depth="depth + 1"
      ></file>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, useTemplateRef, defineAsyncComponent } from 'vue'
import { useProjectStore } from '@/stores'
import { showContextMenu } from '../../contextMenu/sideBar'
import bus from '../../bus'
import { createFileOrDirectoryMixins } from '../../mixins'

// Props
const props = defineProps({
  folder: {
    type: Object,
    required: true
  },
  depth: {
    type: Number,
    required: true
  }
})

// Async component
const File = defineAsyncComponent(() => import('./treeFile.vue'))

// Template refs
const folderRef = useTemplateRef('folder')
const renameInput = useTemplateRef('renameInput')
const inputRef = useTemplateRef('input')

// State
const createName = ref('')
const newName = ref('')

// Stores
const renameCache = computed(() => useProjectStore().renameCache)
const createCache = computed(() => useProjectStore().createCache)
const activeItem = computed(() => useProjectStore().activeItem)
const clipboard = computed(() => useProjectStore().clipboard)

// Methods
const folderNameClick = () => {
  props.folder.isCollapsed = !props.folder.isCollapsed
}

const noop = () => {}

const focusRenameInput = () => {
  nextTick(() => {
    if (renameInput.value) {
      renameInput.value.focus()
      newName.value = props.folder.name
    }
  })
}

const rename = () => {
  const name = newName.value
  if (name) {
    useProjectStore().renameInSidebar(name)
  }
}

const handleInputEnter = () => {
  // Handle input enter logic
  console.log('Input enter:', createName.value)
}

const handleInputFocus = () => {
  nextTick(() => {
    if (inputRef.value) {
      inputRef.value.focus()
    }
  })
}

// Lifecycle
onMounted(() => {
  if (folderRef.value) {
    folderRef.value.addEventListener('contextmenu', event => {
      event.preventDefault()
      useProjectStore().changeActiveItem(props.folder)
      showContextMenu(event, !!clipboard.value)
    })
  }
  
  bus.on('SIDEBAR::show-new-input', handleInputFocus)
  bus.on('SIDEBAR::show-rename-input', focusRenameInput)
})
</script>

<style scoped>
  .side-bar-folder {
    & > .folder-name {
      cursor: default;
      user-select: none;
      display: flex;
      align-items: center;
      height: 30px;
      padding-right: 15px;
      & > svg {
        flex-shrink: 0;
        color: var(--sideBarIconColor);
        margin-right: 5px;
      }
      &:hover {
        background: var(--sideBarItemHoverBgColor);
      }
    }
  }
  .new-input, input.rename {
    outline: none;
    height: 22px;
    margin: 5px 0;
    padding: 0 6px;
    color: var(--sideBarColor);
    border: 1px solid var(--floatBorderColor);
    background: var(--floatBorderColor);
    width: 70%;
    border-radius: 3px;
  }
</style>
