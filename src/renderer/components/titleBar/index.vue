<template>
  <div>
    <div
      class="title-bar-editor-bg"
      :class="{ 'tabs-visible': showTabBar }"
    ></div>
    <div
      class="title-bar"
      :class="[{ 'active': active }, { 'tabs-visible': showTabBar }, { 'frameless': titleBarStyle === 'custom' }, { 'isOsx': isOsx }]"
    >
      <div class="title" @dblclick.stop="toggleMaxmizeOnMacOS">
        <span v-if="!filename">MarkText</span>
        <span v-else>
          <span
            v-for="(path, index) of paths"
            :key="index"
          >
            {{ path }}
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#icon-arrow-right"></use>
            </svg>
          </span>
          <span
            class="filename"
            :class="{'isOsx': platform === 'darwin'}"
            @click="rename"
          >
            {{ filename }}
          </span>
          <span class="save-dot" :class="{'show': !isSaved}"></span>
        </span>
      </div>
      <div :class="showCustomTitleBar ? 'left-toolbar title-no-drag' : 'right-toolbar'">
        <div
          v-if="showCustomTitleBar"
          class="frameless-titlebar-menu title-no-drag"
          @click.stop="handleMenuClick"
        >
          <span class="text-center-vertical">&#9776;</span>
        </div>
        <div
          v-if="wordCount"
          class="word-count-wrapper"
          :class="[{ 'title-no-drag': platform !== 'darwin' }]"
          @mouseenter="handleWordCountMouseEnter"
          @mouseleave="handleWordCountMouseLeave"
        >
          <div
            class="word-count"
            ref="wordCountBtn"
            @click.stop="handleWordClick"
          >
            <span class="text-center-vertical">{{ `${HASH[show].short} ${wordCount[show]}` }}</span>
          </div>
          <transition name="popup-fade">
            <div
              v-show="showPopup"
              class="word-count-popup"
              :class="{ 'popup-align-left': popupAlignLeft }"
              ref="wordCountPopup"
            >
              <div class="title-item">
                <span class="front">Words:</span><span class="text">{{wordCount['word']}}</span>
              </div>
              <div class="title-item">
                <span class="front">Characters:</span><span class="text">{{wordCount['character']}}</span>
              </div>
              <div class="title-item">
                <span class="front">Paragraphs:</span><span class="text">{{wordCount['paragraph']}}</span>
              </div>
            </div>
          </transition>
        </div>
      </div>
      <div
        v-if="titleBarStyle === 'custom' && !isFullScreen && !isOsx"
        class="right-toolbar"
        :class="[{ 'title-no-drag': titleBarStyle === 'custom' }]"
      >
        <div class="frameless-titlebar-button frameless-titlebar-close" @click.stop="handleCloseClick">
          <div>
            <svg width="10" height="10">
              <path :d="windowIconClose" />
            </svg>
          </div>
        </div>
        <div class="frameless-titlebar-button frameless-titlebar-toggle" @click.stop="handleMaximizeClick">
          <div>
            <svg width="10" height="10">
              <path v-show="!isMaximized" :d="windowIconMaximize" />
              <path v-show="isMaximized" :d="windowIconRestore" />
            </svg>
          </div>
        </div>
        <div class="frameless-titlebar-button frameless-titlebar-minimize" @click.stop="handleMinimizeClick">
          <div>
            <svg width="10" height="10">
              <path :d="windowIconMinimize" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { ipcRenderer } from 'electron'
import { getCurrentWindow, Menu as RemoteMenu } from '@electron/remote'
import { minimizePath, restorePath, maximizePath, closePath } from '../../assets/window-controls.js'
import { PATH_SEPARATOR } from '../../config'
import { isOsx } from '@/util'
import { usePreferencesStore, useLayoutStore, useEditorStore } from '@/stores'

// Static data
const HASH = {
  word: {
    short: 'W',
    full: 'word'
  },
  character: {
    short: 'C',
    full: 'character'
  },
  paragraph: {
    short: 'P',
    full: 'paragraph'
  },
  all: {
    short: 'A',
    full: '(with space)character'
  }
}

const windowIconMinimize = minimizePath
const windowIconRestore = restorePath
const windowIconMaximize = maximizePath
const windowIconClose = closePath

// State
const isOsxRef = ref(isOsx)
const isFullScreen = ref(getCurrentWindow().isFullScreen())
const isMaximized = ref(getCurrentWindow().isMaximized())
const show = ref('word')
const showPopup = ref(false)
const popupAlignLeftOverride = ref(false)

// Refs
const wordCountBtn = ref(null)
const wordCountPopup = ref(null)

// Props
const props = defineProps({
  project: Object,
  filename: String,
  pathname: String,
  active: Boolean,
  wordCount: Object,
  platform: String,
  isSaved: Boolean
})

// Stores
const titleBarStyle = computed(() => usePreferencesStore().titleBarStyle)
const showTabBar = computed(() => useLayoutStore().showTabBar)

// Computed
const paths = computed(() => {
  if (!props.pathname) return []
  const pathnameToken = props.pathname.split(PATH_SEPARATOR).filter(i => i)
  return pathnameToken.slice(0, pathnameToken.length - 1).slice(-3)
})

const showCustomTitleBar = computed(() => {
  return titleBarStyle.value === 'custom' && !isOsxRef.value
})

// Watchers
watch(() => props.filename, (value) => {
  // Set filename when hover on dock
  const hasOpenFolder = props.project && props.project.name
  let title = ''
  if (value) {
    title = hasOpenFolder ? `${value} - ${props.project.name}` : `${value} - MarkText`
  } else {
    title = hasOpenFolder ? props.project.name : 'MarkText'
  }

  document.title = title
})

// Methods
const handleWordClick = () => {
  const ITEMS = ['word', 'paragraph', 'character', 'all']
  const len = ITEMS.length
  let index = ITEMS.indexOf(show.value)
  index += 1
  if (index >= len) index = 0
  show.value = ITEMS[index]
}

const handleCloseClick = () => {
  getCurrentWindow().close()
}

const handleMaximizeClick = () => {
  const win = getCurrentWindow()
  if (win.isFullScreen()) {
    win.setFullScreen(false)
  } else if (win.isMaximized()) {
    win.unmaximize()
  } else {
    win.maximize()
  }
}

const toggleMaxmizeOnMacOS = () => {
  if (isOsxRef.value) {
    handleMaximizeClick()
  }
}

const handleMinimizeClick = () => {
  getCurrentWindow().minimize()
}

const handleMenuClick = () => {
  const win = getCurrentWindow()
  RemoteMenu.getApplicationMenu().popup({ window: win, x: 23, y: 20 })
}

const rename = () => {
  if (props.platform === 'darwin') {
    useEditorStore().responseForRename()
  }
}

const handleWordCountMouseEnter = () => {
  showPopup.value = true
  nextTick(() => {
    if (wordCountPopup.value) {
      const popupRect = wordCountPopup.value.getBoundingClientRect()
      if (popupRect.right > window.innerWidth) {
        popupAlignLeftOverride.value = true
      } else {
        popupAlignLeftOverride.value = false
      }
    }
  })
}

const handleWordCountMouseLeave = () => {
  showPopup.value = false
  popupAlignLeftOverride.value = false
}

const popupAlignLeft = computed(() => popupAlignLeftOverride.value)

// IPC handlers
const onMaximize = () => {
  isMaximized.value = true
}

const onUnmaximize = () => {
  isMaximized.value = false
}

const onEnterFullScreen = () => {
  isFullScreen.value = true
}

const onLeaveFullScreen = () => {
  isFullScreen.value = false
}

// Lifecycle
onMounted(() => {
  ipcRenderer.on('mt::window-maximize', onMaximize)
  ipcRenderer.on('mt::window-unmaximize', onUnmaximize)
  ipcRenderer.on('mt::window-enter-full-screen', onEnterFullScreen)
  ipcRenderer.on('mt::window-leave-full-screen', onLeaveFullScreen)
})

onBeforeUnmount(() => {
  ipcRenderer.off('mt::window-maximize', onMaximize)
  ipcRenderer.off('mt::window-unmaximize', onUnmaximize)
  ipcRenderer.off('mt::window-enter-full-screen', onEnterFullScreen)
  ipcRenderer.off('mt::window-leave-full-screen', onLeaveFullScreen)
})
</script>

<style scoped>
  .title-bar-editor-bg {
    height: var(--titleBarHeight);
    background: var(--editorBgColor);
    position: relative;
    left: 0;
    top: 0;
    right: 0;
  }
  .title-bar {
    -webkit-app-region: drag;
    user-select: none;
    background: transparent;
    height: var(--titleBarHeight);
    box-sizing: border-box;
    color: var(--editorColor50);
    position: fixed;
    left: 0;
    top: 0;
    right: 0;
    z-index: 2;
    transition: color .4s ease-in-out;
    cursor: default;
  }
  .active {
    color: var(--editorColor);
  }
  img {
    height: 90%;
    margin-top: 1px;
    vertical-align: top;
  }
  .title {
    padding: 0 142px;
    height: 100%;
    line-height: var(--titleBarHeight);
    font-size: 14px;
    text-align: center;
    transition: all .25s ease-in-out;
    & .filename {
      transition: all .25s ease-in-out;
    }
    &::after {
      content: '';
      position: absolute;
      top: 0;
      height: 1px;
      width: 100%;
      z-index: 1;
      -webkit-app-region: no-drag;
    }
  }
  div.title > span {
    /* Workaround for GH#339 */
    display: block;
    direction: rtl;
    overflow: hidden;
    text-overflow: clip;
    white-space: nowrap;
  }

  .title-bar .title .filename.isOsx:hover {
    color: var(--themeColor);
  }

  .active .save-dot {
    margin-left: 3px;
    width: 7px;
    height: 7px;
    display: inline-block;
    border-radius: 50%;
    background: var(--highlightThemeColor);
    opacity: .7;
    visibility: hidden;
  }
  .active .save-dot.show {
    visibility: visible;
  }
  .title:hover {
    color: var(--sideBarTitleColor);
  }

  .left-toolbar {
    padding: 0 10px;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    width: 118px; /* + 2*10px padding*/
    display: flex;
    flex-direction: row;
  }
  .right-toolbar {
    height: 100%;
    position: absolute;
    top: 0;
    right: 0;
    width: 138px;
    display: flex;
    align-items: center;
    flex-direction: row-reverse;
    & .item {
      margin-right: 10px;
    }
  }

  .word-count-wrapper {
    position: relative;
    display: inline-flex;
    align-items: center;
  }

  .word-count {
    cursor: pointer;
    font-size: 14px;
    color: var(--editorColor30);
    text-align: center;
    line-height: 24px;
    padding: 0 5px;
    box-sizing: border-box;
    transition: all .25s ease-in-out;
    & > .text-center-vertical {
      padding: 2px 5px;
      border-radius: 3px;
    }
    &:hover > span {
      background: var(--sideBarBgColor);
      color: var(--sideBarTitleColor);
    }
  }

  .word-count-popup {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 4px;
    padding: 6px 10px;
    background: var(--floatBgColor);
    color: var(--floatFontColor);
    border-radius: 4px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    font-size: 13px;
    line-height: 1.4;
    white-space: nowrap;
    z-index: 100;
    pointer-events: none;
  }

  .word-count-popup.popup-align-left {
    right: auto;
    left: 0;
  }

  .popup-fade-enter-active,
  .popup-fade-leave-active {
    transition: opacity 0.2s ease;
  }

  .popup-fade-enter-from,
  .popup-fade-leave-to {
    opacity: 0;
  }

  .title-no-drag {
    -webkit-app-region: no-drag;
  }
  /* frameless window controls */
  .frameless-titlebar-button {
    position: relative;
    display: block;
    width: 46px;
    height: var(--titleBarHeight);
  }
  .frameless-titlebar-button > div {
    position: absolute;
    display: inline-flex;
    top: 50%;
    left: 50%;
    transform: translateX(-50%) translateY(-50%);
  }
  .frameless-titlebar-menu {
    color: var(--sideBarColor);
  }
  .frameless-titlebar-close:hover {
    background-color: rgb(228, 79, 79);
  }
  .frameless-titlebar-minimize:hover,
  .frameless-titlebar-toggle:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }
  .frameless-titlebar-button svg {
    fill: #000000
  }
  .frameless-titlebar-close:hover svg {
    fill: #ffffff
  }

  .text-center-vertical {
    display: inline-block;
    vertical-align: middle;
    line-height: normal;
  }
</style>

<style>
.title-item {
  height: 28px;
  line-height: 28px;
  & .front {
    opacity: .7;
  }
  & .text {
    margin-left: 10px;
  }
}
</style>
