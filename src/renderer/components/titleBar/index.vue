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
      <!-- 第一行：水平菜单 + 窗口控制按钮 -->
      <div class="first-row">
        <div :class="showCustomTitleBar ? 'left-toolbar title-no-drag' : 'right-toolbar'">
          <div
            v-if="showCustomTitleBar"
            class="horizontal-menu title-no-drag"
          >
            <div
              v-for="(menu, index) in menuData"
              :key="index"
              class="menu-item"
              @click.stop="handleMenuClick($event, index)"
              @mouseenter="handleMenuHover($event, index)"
            >
              <span class="text-center-vertical">{{ menu.label }}</span>
            </div>
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

      <!-- 第二行：标题 -->
      <div class="second-row">
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
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { ipcRenderer } from 'electron'
import { getCurrentWindow, Menu as RemoteMenu } from '@electron/remote'
import { minimizePath, restorePath, maximizePath, closePath } from '../../assets/window-controls.js'
import { PATH_SEPARATOR } from '../../config'
import { isOsx } from '@/util'
import { usePreferencesStore, useLayoutStore, useEditorStore } from '@/stores'

// Static data
const windowIconMinimize = minimizePath
const windowIconRestore = restorePath
const windowIconMaximize = maximizePath
const windowIconClose = closePath

// State
const isOsxRef = ref(isOsx)
const isFullScreen = ref(getCurrentWindow().isFullScreen())
const isMaximized = ref(getCurrentWindow().isMaximized())
const menuData = ref([])
const activeMenuIndex = ref(-1)

// Props
const props = defineProps({
  project: Object,
  filename: String,
  pathname: String,
  active: Boolean,
  platform: String,
  isSaved: Boolean
})

// Stores
const layoutStore = useLayoutStore()
const titleBarStyle = computed(() => usePreferencesStore().titleBarStyle)
const showTabBar = computed(() => layoutStore.showTabBar)

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

const handleMenuClick = (event, index) => {
  const win = getCurrentWindow()
  const menu = RemoteMenu.getApplicationMenu()
  const menuItem = menu.items[index]

  if (menuItem && menuItem.submenu) {
    const rect = event.target.getBoundingClientRect()
    menuItem.submenu.popup({
      window: win,
      x: Math.round(rect.left),
      y: Math.round(rect.bottom)
    })
  }
}

const handleMenuHover = (event, index) => {
  activeMenuIndex.value = index
}

const rename = () => {
  if (props.platform === 'darwin') {
    useEditorStore().responseForRename()
  }
}

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

  // Get menu data for horizontal menu bar
  ipcRenderer.invoke('mt::get-menu-data').then(data => {
    menuData.value = data
  })
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
    height: calc(var(--menuBarHeight) * 2);
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
    height: calc(var(--menuBarHeight) * 2);
    box-sizing: border-box;
    color: var(--editorColor50);
    position: fixed;
    left: 0;
    top: 0;
    right: 0;
    z-index: 2;
    transition: color .4s ease-in-out;
    cursor: default;
    display: flex;
    flex-direction: column;
  }
  .first-row {
    height: 32px;
    display: flex;
    justify-content: space-between;
    position: relative;
  }
  .second-row {
    height: var(--menuBarHeight);
    display: flex;
    align-items: center;
    position: fixed;
    top: var(--menuBarHeight);
    left: 0;
    right: 0;
    z-index: 1;
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
    flex: 1;
    padding: 0 142px;
    height: 100%;
    line-height: 32px;
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
    height: 32px;
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  .horizontal-menu {
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 100%;
    gap: 2px;
  }
  .horizontal-menu .menu-item {
    padding: 0 8px;
    height: 100%;
    display: flex;
    align-items: center;
    cursor: pointer;
    font-size: 12px;
    color: var(--editorColor50);
    transition: background-color 0.2s ease;
    white-space: nowrap;
  }
  .horizontal-menu .menu-item:hover {
    background-color: rgba(0, 0, 0, 0.1);
    color: var(--editorColor);
  }
  .active .horizontal-menu .menu-item {
    color: var(--editorColor);
  }
  .active .horizontal-menu .menu-item:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }
  .right-toolbar {
    height: 32px;
    display: flex;
    align-items: center;
    flex-direction: row-reverse;
    & .item {
      margin-right: 10px;
    }
  }

  .title-no-drag {
    -webkit-app-region: no-drag;
  }
  /* frameless window controls */
  .frameless-titlebar-button {
    position: relative;
    display: block;
    width: 46px;
    height: 32px;
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
