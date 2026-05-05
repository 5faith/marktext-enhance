<template>
  <div
    class="editor-container"
  >
    <side-bar v-if="init"></side-bar>
    <div class="editor-middle">
      <title-bar
        :project="projectTree"
        :pathname="pathname"
        :filename="filename"
        :active="windowActive"
        :word-count="wordCount"
        :platform="platform"
        :is-saved="isSaved"
      ></title-bar>
      <div class="editor-placeholder" v-if="!init"></div>
      <recent
        v-if="!hasCurrentFile && init"
      ></recent>
      <editor-with-tabs
        v-if="hasCurrentFile && init"
        :markdown="markdown"
        :cursor="cursor"
        :source-code="sourceCode"
        :show-tab-bar="showTabBar"
        :text-direction="textDirection"
        :platform="platform"
      ></editor-with-tabs>
      <command-palette></command-palette>
      <about-dialog></about-dialog>
      <export-setting-dialog></export-setting-dialog>
      <rename></rename>
      <tweet></tweet>
      <import-modal></import-modal>
    </div>
  </div>
</template>

<script setup>
import { computed, watch, onMounted, nextTick, ref } from 'vue'
import { addStyles, addThemeStyle } from '@/util/theme'
import Recent from '@/components/recent'
import EditorWithTabs from '@/components/editorWithTabs'
import TitleBar from '@/components/titleBar'
import SideBar from '@/components/sideBar'
import AboutDialog from '@/components/about'
import CommandPalette from '@/components/commandPalette'
import ExportSettingDialog from '@/components/exportSettings'
import Rename from '@/components/rename'
import Tweet from '@/components/tweet'
import ImportModal from '@/components/import'
import { loadingPageMixins } from '@/mixins'
import bus from '@/bus'
import { DEFAULT_STYLE } from '@/config'
import { ipcRenderer } from 'electron'
import { useRootStore, useLayoutStore, usePreferencesStore, useProjectStore, useEditorStore } from '@/stores'

// mixin: loadingPageMixins
const { hideLoadingPage } = loadingPageMixins

const timer = ref(null)

const showTabBar = computed(() => useLayoutStore().showTabBar)
const sourceCode = computed(() => usePreferencesStore().sourceCode)
const theme = computed(() => usePreferencesStore().theme)
const textDirection = computed(() => usePreferencesStore().textDirection)
const zoom = computed(() => usePreferencesStore().zoom)
const projectTree = computed(() => useProjectStore().projectTree)
const pathname = computed(() => useEditorStore().currentFile?.pathname)
const filename = computed(() => useEditorStore().currentFile?.filename)
const isSaved = computed(() => useEditorStore().currentFile?.isSaved)
const markdown = computed(() => useEditorStore().currentFile?.markdown)
const cursor = computed(() => useEditorStore().currentFile?.cursor)
const wordCount = computed(() => useEditorStore().currentFile?.wordCount)
const windowActive = computed(() => useRootStore().windowActive)
const platform = computed(() => useRootStore().platform)
const init = computed(() => useRootStore().init)
const hasCurrentFile = computed(() => markdown.value !== undefined)

watch(theme, (value, oldValue) => {
  if (value !== oldValue) {
    addThemeStyle(value)
  }
})

watch(zoom, (zoom) => {
  ipcRenderer.emit('mt::window-zoom', null, zoom)
})

onMounted(() => {
  // Apply initial state
  if (global.marktext.initialState) {
    usePreferencesStore().setUserPreference(global.marktext.initialState)
  }

  // prevent Chromium's default behavior and try to open the first file
  window.addEventListener('dragover', e => {
    if (!e.dataTransfer.types.length) return

    if (e.dataTransfer.types.indexOf('Files') >= 0) {
      if (e.dataTransfer.items.length === 1 && e.dataTransfer.items[0].type.indexOf('image') > -1) {
        // Do nothing, because we already drag/drop image in muya.
      } else {
        e.preventDefault()
        if (timer.value) {
          clearTimeout(timer.value)
        }
        timer.value = setTimeout(() => {
          bus.emit('importDialog', false)
        }, 300)
        bus.emit('importDialog', true)
      }

      e.dataTransfer.dropEffect = 'copy'
    } else {
      e.stopPropagation()
      e.dataTransfer.dropEffect = 'none'
    }
  }, false)

  nextTick(() => {
    const style = global.marktext.initialState || DEFAULT_STYLE
    addStyles(style)
    hideLoadingPage()
  })
})
</script>

<style scoped>
  .editor-placeholder,
  .editor-container {
    display: flex;
    flex-direction: row;
    position: absolute;
    width: 100vw;
    height: 100vh;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
  .editor-container .hide {
    z-index: -1;
    opacity: 0;
    position: absolute;
    left: -10000px;
  }
  .editor-placeholder {
    background: var(--editorBgColor);
  }
  .editor-middle {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 100vh;
    position: relative;
    & > .editor {
      flex: 1;
    }
  }
</style>
