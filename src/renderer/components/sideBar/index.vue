<template>
  <div
    v-show="showSideBar"
    class="side-bar"
    ref="sideBar"
    :style="[ !rightColumn ? { 'min-width': '45px' } : {}, { 'width': `${finalSideBarWidth}px` } ]"
  >
    <div class="left-column">
      <ul>
        <li
          v-for="(c, index) of sideBarIcons"
          :key="index"
          @click="handleLeftIconClick(c.name)"
          :class="{ 'active': c.name === rightColumn }"
        >
          <svg :viewBox="c.icon.viewBox">
            <use :xlink:href="c.icon.url"></use>
          </svg>
        </li>
      </ul>
      <ul class="bottom">
        <li
          v-for="(c, index) of sideBarBottomIcons"
          :key="index"
          @click="handleLeftBottomClick(c.name)"
        >
          <svg :viewBox="c.icon.viewBox">
            <use :xlink:href="c.icon.url"></use>
          </svg>
        </li>
      </ul>
    </div>
    <div class="right-column" v-show="rightColumn">
      <div
        v-if="wordCount"
        class="word-count-wrapper"
        @mouseenter="handleWordCountMouseEnter"
        @mouseleave="handleWordCountMouseLeave"
      >
        <div
          class="word-count"
          ref="wordCountBtn"
          @click.stop="handleWordClick"
        >
          <span class="text-center-vertical">{{ `${WORD_HASH[showCountType].short} ${wordCount[showCountType]}` }}</span>
        </div>
        <transition name="popup-fade">
          <div
            v-show="showPopup"
            class="word-count-popup"
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
      <tree
        :project-tree="projectTree"
        :opened-files="openedFiles"
        :tabs="tabs"
        v-if="rightColumn === 'files'"
      ></tree>
      <side-bar-search
        v-else-if="rightColumn === 'search'"
      ></side-bar-search>
      <toc
        v-else-if="rightColumn === 'toc'"
      ></toc>
    </div>
    <div class="drag-bar" ref="dragBar" v-show="rightColumn"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import Tree from './tree.vue'
import SideBarSearch from './search.vue'
import Toc from './toc.vue'
import { useLayoutStore, useProjectStore, useEditorStore } from '@/stores'

const WORD_HASH = {
  word: { short: 'W', full: 'word' },
  character: { short: 'C', full: 'character' },
  paragraph: { short: 'P', full: 'paragraph' },
  all: { short: 'A', full: '(with space)character' }
}

const sideBarIcons = [
  { name: 'folder', icon: 'folder' },
  { name: 'file', icon: 'file' },
  { name: 'search', icon: 'search' },
  { name: 'toc', icon: 'list' }
]

const sideBarBottomIcons = [
  { name: 'settings', icon: 'setting' }
]

const openedFiles = ref([])
const sideBarViewWidth = ref(280)
const dragBar = ref(null)
const showCountType = ref('word')
const showPopup = ref(false)
const wordCountBtn = ref(null)
const wordCountPopup = ref(null)

const rightColumn = computed(() => useLayoutStore().rightColumn)
const showSideBar = computed(() => useLayoutStore().showSideBar)
const projectTree = computed(() => useProjectStore().projectTree)
const sideBarWidth = computed(() => useLayoutStore().sideBarWidth)
const tabs = computed(() => useEditorStore().tabs)
const wordCount = computed(() => useEditorStore().currentFile?.wordCount)

const finalSideBarWidth = computed(() => {
  if (!showSideBar.value) return 0
  if (rightColumn.value === '') return 45
  return sideBarViewWidth.value < 220 ? 220 : sideBarViewWidth.value
})

const handleLeftIconClick = (name) => {
  if (rightColumn.value === name) {
    useLayoutStore().setLayout({ rightColumn: '' })
    useLayoutStore().changeSideBarWidth(finalSideBarWidth.value)
  } else {
    const needDispatch = rightColumn.value === ''
    useLayoutStore().setLayout({ rightColumn: name })
    sideBarViewWidth.value = +sideBarWidth.value
    if (needDispatch) {
      useLayoutStore().changeSideBarWidth(finalSideBarWidth.value)
    }
  }
}

const handleLeftBottomClick = (name) => {
  if (name === 'settings') {
    useProjectStore().openSettingWindow()
  }
}

const handleWordClick = () => {
  const ITEMS = ['word', 'paragraph', 'character', 'all']
  let index = ITEMS.indexOf(showCountType.value)
  index = (index + 1) % ITEMS.length
  showCountType.value = ITEMS[index]
}

const handleWordCountMouseEnter = () => {
  showPopup.value = true
  nextTick(() => {
    if (wordCountPopup.value && wordCountBtn.value) {
      const popup = wordCountPopup.value
      const btnRect = wordCountBtn.value.getBoundingClientRect()
      const popupRect = popup.getBoundingClientRect()

      let left = btnRect.right - popupRect.width
      let top = btnRect.bottom + 4

      if (left + popupRect.width > window.innerWidth) {
        left = window.innerWidth - popupRect.width - 4
      }
      if (left < 0) {
        left = 4
      }

      popup.style.position = 'fixed'
      popup.style.left = `${left}px`
      popup.style.top = `${top}px`
    }
  })
}

const handleWordCountMouseLeave = () => {
  showPopup.value = false
}

onMounted(() => {
  nextTick(() => {
    const dragBarEl = dragBar.value
    if (!dragBarEl) return

    let startX = 0
    let sideBarWidthVal = +sideBarWidth.value
    let startWidth = sideBarWidthVal

    sideBarViewWidth.value = sideBarWidthVal

    const mouseUpHandler = (_event) => {
      document.removeEventListener('mousemove', mouseMoveHandler, false)
      document.removeEventListener('mouseup', mouseUpHandler, false)
      useLayoutStore().changeSideBarWidth(sideBarWidthVal < 220 ? 220 : sideBarWidthVal)
    }

    const mouseMoveHandler = (event) => {
      const offset = event.clientX - startX
      sideBarWidthVal = startWidth + offset
      sideBarViewWidth.value = sideBarWidthVal
    }

    const mouseDownHandler = (event) => {
      startX = event.clientX
      startWidth = +sideBarWidth.value
      document.addEventListener('mousemove', mouseMoveHandler, false)
      document.addEventListener('mouseup', mouseUpHandler, false)
    }

    dragBarEl.addEventListener('mousedown', mouseDownHandler, false)
  })
})
</script>

<style scoped>
  .side-bar {
    display: flex;
    flex-shrink: 0;
    flex-grow: 0;
    width: 280px;
    height: calc(100vh - var(--menuBarHeight) * 2);
    min-width: 220px;
    position: relative;
    top: calc(var(--menuBarHeight) * 2);
    color: var(--sideBarColor);
    user-select: none;
    background: var(--sideBarBgColor);
    border-right: 1px solid var(--itemBgColor);
    & .left-column {
      & svg {
        fill: var(--iconColor);
      }
    }
  }

  .left-column {
    height: 100%;
    width: 45px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding-top: 0;
    box-sizing: border-box;
    & > ul {
      opacity: 1;
    }
  }

  .left-column ul {
    list-style: none;
    display: flex;
    flex-direction: column;
    margin: 0;
    padding: 0;
    & > li {
      width: 45px;
      height: 45px;
      margin: 0;
      padding: 0;
      display: flex;
      justify-content: space-around;
      align-items: center;
      cursor: pointer;
      & > svg {
        width: 18px;
        height: 18px;
        fill: var(--sideBarIconColor);
        opacity: 1;
        transition: transform .25s ease-in-out;
      }
      &.active > svg {
        fill: var(--themeColor);
      }
    }
  }

  .side-bar:hover .left-column ul li svg {
    opacity: 1;
  }
  .right-column {
    flex: 1;
    width: calc(100% - 50px);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .word-count-wrapper {
    display: flex;
    align-items: center;
    padding: 4px 10px;
    flex-shrink: 0;
  }
  .word-count {
    cursor: pointer;
    font-size: 12px;
    color: var(--editorColor30);
    text-align: center;
    line-height: 20px;
    padding: 0 5px;
    box-sizing: border-box;
    transition: all .25s ease-in-out;
    & > .text-center-vertical {
      padding: 2px 5px;
      border-radius: 3px;
    }
    &:hover > span {
      background: var(--sideBarItemHoverBgColor);
      color: var(--sideBarTitleColor);
    }
  }
  .word-count-popup {
    position: fixed;
    padding: 6px 10px;
    background: var(--floatBgColorAlpha);
    color: var(--floatFontColor);
    border-radius: 4px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    font-size: 13px;
    line-height: 1.4;
    white-space: nowrap;
    z-index: 100;
    pointer-events: none;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }
  .popup-fade-enter-active,
  .popup-fade-leave-active {
    transition: opacity 0.2s ease;
  }
  .popup-fade-enter-from,
  .popup-fade-leave-to {
    opacity: 0;
  }
  .text-center-vertical {
    display: inline-block;
    vertical-align: middle;
    line-height: normal;
  }
  .drag-bar {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    height: 100%;
    width: 3px;
    cursor: col-resize;
    &:hover {
      border-right: 2px solid var(--iconColor);
    }
  }
</style>

<style>
.word-count-wrapper .title-item {
  height: 28px;
  line-height: 28px;
}
.word-count-wrapper .title-item .front {
  opacity: .7;
}
.word-count-wrapper .title-item .text {
  margin-left: 10px;
}
</style>
