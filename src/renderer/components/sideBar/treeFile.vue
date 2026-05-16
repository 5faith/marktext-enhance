<template>
  <div
    :title="file.pathname"
    class="side-bar-file"
    :style="{'padding-left': `${(depth * 20) + 20}px`, 'opacity': file.isMarkdown ? 1 : 0.75 }"
    @click="handleFileClick()"
    :class="[{'current': currentFile.pathname === file.pathname, 'active': file.id === activeItem.id }]"
    ref="file"
  >
    <file-icon
      :name="file.name"
    ></file-icon>
    <input
      type="text"
      @click.stop="noop"
      class="rename"
      v-if="renameCache === file.pathname"
      v-model="newName"
      ref="renameInput"
      @keydown.enter="rename"
    >
    <span v-else>{{ file.name }}</span>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, useTemplateRef } from 'vue'
import FileIcon from './icon.vue'
import { useProjectStore, useEditorStore } from '@/stores'
import { fileMixins as _fileMixins } from '../../mixins'
import { showContextMenu } from '../../contextMenu/sideBar'
import bus from '../../bus'

// Props
const props = defineProps({
  file: {
    type: Object,
    required: true
  },
  depth: {
    type: Number,
    required: true
  }
})

// Template refs
const fileRef = useTemplateRef('file')
const renameInput = useTemplateRef('renameInput')
const newName = ref('')

// Stores
const renameCache = computed(() => useProjectStore().renameCache)
const activeItem = computed(() => useProjectStore().activeItem)
const clipboard = computed(() => useProjectStore().clipboard)
const currentFile = computed(() => useEditorStore().currentFile)
const _tabs = computed(() => useEditorStore().tabs)

// Methods
const noop = () => {}

const focusRenameInput = () => {
  nextTick(() => {
    if (renameInput.value) {
      renameInput.value.focus()
      newName.value = props.file.name
    }
  })
}

const rename = () => {
  const name = newName.value
  if (name) {
    useProjectStore().renameInSidebar(name)
  }
}

const handleFileClick = () => {
  // Handle file click logic
  console.log('File clicked:', props.file)
}

// Lifecycle
onMounted(() => {
  if (fileRef.value) {
    fileRef.value.addEventListener('contextmenu', event => {
      event.preventDefault()
      useProjectStore().changeActiveItem(props.file)
      showContextMenu(event, !!clipboard.value)
    })
  }

  bus.on('SIDEBAR::show-rename-input', focusRenameInput)
})
</script>

<style scoped>
  .side-bar-file {
    display: flex;
    position: relative;
    align-items: center;
    cursor: default;
    user-select: none;
    height: 30px;
    box-sizing: border-box;
    padding-right: 15px;
    &:hover {
      background: var(--sideBarItemHoverBgColor);
    }
    & > span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    &::before {
      content: '';
      position: absolute;
      display: block;
      left: 0;
      background: var(--themeColor);
      width: 2px;
      height: 0;
      top: 50%;
      transform: translateY(-50%);
      transition: all .2s ease;
    }
  }
  .side-bar-file.current::before {
    height: 100%;
  }
  .side-bar-file.current > span {
    color: var(--themeColor);
  }
  .side-bar-file.active > span {
    color: var(--sideBarTitleColor);
  }
  input.rename {
    height: 22px;
    outline: none;
    margin: 5px 0;
    padding: 0 8px;
    color: var(--sideBarColor);
    border: 1px solid var(--floatBorderColor);
    background: var(--floatBorderColor);
    width: 100%;
    border-radius: 3px;
  }
</style>
