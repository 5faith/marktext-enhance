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

const rightColumn = computed(() => useLayoutStore().rightColumn)
const showSideBar = computed(() => useLayoutStore().showSideBar)
const projectTree = computed(() => useProjectStore().projectTree)
const sideBarWidth = computed(() => useLayoutStore().sideBarWidth)
const tabs = computed(() => useEditorStore().tabs)

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

onMounted(() => {
  nextTick(() => {
    const dragBarEl = dragBar.value
    if (!dragBarEl) return

    let startX = 0
    let sideBarWidthVal = +sideBarWidth.value
    let startWidth = sideBarWidthVal

    sideBarViewWidth.value = sideBarWidthVal

    const mouseUpHandler = (event) => {
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
    height: 100vh;
    min-width: 220px;
    position: relative;
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
    padding-top: 40px;
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
