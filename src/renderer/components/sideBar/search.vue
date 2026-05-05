<template>
    <div
      class="side-bar-search"
    >
      <div class="search-wrapper">
        <input
          type="text" v-model="keyword"
          placeholder="Search in folder..."
          @keyup="search"
        >
        <div class="controls">
          <span
            title="Case Sensitive"
            class="is-case-sensitive"
            :class="{'active': isCaseSensitive}"
            @click.stop="caseSensitiveClicked()"
          >
            <svg :viewBox="FindCaseIcon.viewBox" aria-hidden="true">
              <use :xlink:href="FindCaseIcon.url" />
            </svg>
          </span>
          <span
            title="Select whole word"
            class="is-whole-word"
            :class="{'active': isWholeWord}"
            @click.stop="wholeWordClicked()"
          >
            <svg :viewBox="FindWordIcon.viewBox" aria-hidden="true">
              <use :xlink:href="FindWordIcon.url" />
            </svg>
          </span>
          <span
            title="Use query as RegEx"
            class="is-regex"
            :class="{'active': isRegexp}"
            @click.stop="regexpClicked()"
          >
            <svg :viewBox="FindRegexIcon.viewBox" aria-hidden="true">
              <use :xlink:href="FindRegexIcon.url" />
            </svg>
          </span>
        </div>
      </div>

      <div class="search-message-section" v-if="showNoFolderOpenedMessage">
        <span>No folder open</span>
      </div>
      <div class="search-message-section" v-if="showNoResultFoundMessage">No results found.</div>
      <div class="search-message-section" v-if="searchErrorString">{{ searchErrorString }}</div>

      <div
        class="cancel-area"
        v-show="showSearchCancelArea"
      >
        <el-button
          type="primary"
          size="mini"
          @click="cancelSearcher"
        >
          Cancel <el-icon><VideoPause /></el-icon>
        </el-button>
      </div>
      <div v-if="searchResult.length" class="search-result-info">{{searchResultInfo}}</div>
      <div class="search-result" v-if="searchResult.length">
        <search-result-item
          v-for="(item, index) of searchResult"
          :key="index"
          :searchResult="item"
        ></search-result-item>
      </div>
      <div class="empty" v-else>
        <div class="no-data">
          <svg :viewBox="EmptyIcon.viewBox" aria-hidden="true">
            <use :xlink:href="EmptyIcon.url" />
          </svg>
          <button
            class="button-primary"
            v-if="showNoFolderOpenedMessage"
            @click="openFolder"
          >
            Open Folder
          </button>
        </div>
      </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useLayoutStore, useEditorStore, useProjectStore, usePreferencesStore } from '@/stores'
import bus from '../../bus'
import SearchResultItem from './searchResultItem.vue'
import RipgrepDirectorySearcher from '../../node/ripgrepSearcher'
import EmptyIcon from '@/assets/icons/undraw_empty.svg'
import FindCaseIcon from '@/assets/icons/searchIcons/iconCase.svg'
import FindWordIcon from '@/assets/icons/searchIcons/iconWord.svg'
import FindRegexIcon from '@/assets/icons/searchIcons/iconRegex.svg'
import { MARKDOWN_INCLUSIONS } from '../../../common/filesystem/paths'

const log = require('electron-log')

// State
const lastKeyword = ref('')
const lastSearchTime = ref(new Date())
const keyUpTimer = ref(null)
const searcherCancelCallback = ref(null)
const ripgrepDirectorySearcher = ref(new RipgrepDirectorySearcher())
const keyword = ref('')
const searchResult = ref([])
const searcherRunning = ref(false)
const showSearchCancelArea = ref(false)
const searchErrorString = ref('')
const isCaseSensitive = ref(false)
const isWholeWord = ref(false)
const isRegexp = ref(false)
const showSearchCancelAreaTimer = ref(null)

// Stores
const rightColumn = computed(() => useLayoutStore().rightColumn)
const showSideBar = computed(() => useLayoutStore().showSideBar)
const searchMatches = computed(() => useEditorStore().currentFile.searchMatches)
const projectTree = computed(() => useProjectStore().projectTree)
const searchExclusions = computed(() => usePreferencesStore().searchExclusions)
const searchMaxFileSize = computed(() => usePreferencesStore().searchMaxFileSize)
const searchIncludeHidden = computed(() => usePreferencesStore().searchIncludeHidden)
const searchNoIgnore = computed(() => usePreferencesStore().searchNoIgnore)
const searchFollowSymlinks = computed(() => usePreferencesStore().searchFollowSymlinks)

// Computed
const searchResultInfo = computed(() => {
  const fileCount = searchResult.value.length
  const matchCount = searchResult.value.reduce((acc, item) => {
    return acc + item.matches.length
  }, 0)
  
  return `${matchCount} ${matchCount > 1 ? 'matches' : 'match'} in ${fileCount} ${fileCount > 1 ? 'files' : 'file'}`
})

const showNoFolderOpenedMessage = computed(() => {
  return !projectTree.value || !projectTree.value.pathname
})

const showNoResultFoundMessage = computed(() => {
  return searchResult.value.length === 0 && searcherRunning.value === false && keyword.value.length > 0
})

// Watchers
watch(showSideBar, (value, oldValue) => {
  if (value && !oldValue && rightColumn.value === 'search') {
    keyword.value = searchMatches.value
  }
})

// Methods
const search = () => {
  // No root directory is opened.
  if (showNoFolderOpenedMessage.value) {
    return
  }
  
  const { pathname: rootDirectoryPath } = projectTree.value
  const {
    keyword: currentKeyword,
    searcherRunning: isRunning,
    searcherCancelCallback: cancelCb,
    isCaseSensitive: caseSensitive,
    isWholeWord: wholeWord,
    isRegexp: regexp,
    ripgrepDirectorySearcher: searcher
  } = {
    keyword: keyword.value,
    searcherRunning: searcherRunning.value,
    searcherCancelCallback: searcherCancelCallback.value,
    isCaseSensitive: isCaseSensitive.value,
    isWholeWord: isWholeWord.value,
    isRegexp: isRegexp.value,
    ripgrepDirectorySearcher: ripgrepDirectorySearcher.value
  }
  
  if (isRunning && cancelCb) {
    cancelCb()
  }
  
  searchErrorString.value = ''
  searcherCancelCallback.value = null
  
  if (!currentKeyword) {
    searchResult.value = []
    searcherRunning.value = false
    return
  }
  
  let canceled = false
  searcherRunning.value = true
  startShowSearchCancelAreaTimer()
  
  const newSearchResult = []
  const promises = searcher.search([rootDirectoryPath], currentKeyword, {
    didMatch: searchResult => {
      if (canceled) return
      newSearchResult.push(searchResult)
    },
    didSearchPaths: numPathsFound => {
      // More than 100 files with (multiple) matches were found.
      if (!canceled && numPathsFound > 100) {
        canceled = true
        if (promises.cancel) {
          promises.cancel()
        }
        searchErrorString.value = 'Search was limited to 100 files.'
      }
    },
    
    // UI options
    isCaseSensitive: caseSensitive,
    isWholeWord: wholeWord,
    isRegexp: regexp,
    
    // Options loaded from settings
    exclusions: searchExclusions.value,
    maxFileSize: searchMaxFileSize.value || null,
    includeHidden: searchIncludeHidden.value,
    noIgnore: searchNoIgnore.value,
    followSymlinks: searchFollowSymlinks.value,
    
    // Only search markdown files
    inclusions: MARKDOWN_INCLUSIONS
  })
    .then(() => {
      searchResult.value = newSearchResult
      searcherRunning.value = false
      searcherCancelCallback.value = null
      stopShowSearchCancelAreaTimer()
    })
    .catch(err => {
      canceled = true
      if (promises.cancel) {
        promises.cancel()
      }
      searcherRunning.value = false
      searcherCancelCallback.value = null
      stopShowSearchCancelAreaTimer()
      
      searchErrorString.value = err.message
      log.error(err)
    })
  
  searcherCancelCallback.value = () => {
    stopShowSearchCancelAreaTimer()
    canceled = true
    if (promises.cancel) {
      promises.cancel()
    }
  }
}

const startShowSearchCancelAreaTimer = () => {
  stopShowSearchCancelAreaTimer()
  
  const SHOW_SEARCH_CANCEL_DELAY_MS = 5000
  showSearchCancelAreaTimer.value = window.setTimeout(() => {
    showSearchCancelArea.value = true
  }, SHOW_SEARCH_CANCEL_DELAY_MS)
}

const stopShowSearchCancelAreaTimer = () => {
  showSearchCancelArea.value = false
  if (!showSearchCancelAreaTimer.value) {
    return
  }
  window.clearTimeout(showSearchCancelAreaTimer.value)
  showSearchCancelAreaTimer.value = null
}

const cancelSearcher = () => {
  const { searcherCancelCallback: cancelCb } = { searcherCancelCallback: searcherCancelCallback.value }
  if (cancelCb) {
    cancelCb()
    searcherCancelCallback.value = null
  }
}

const caseSensitiveClicked = () => {
  isCaseSensitive.value = !isCaseSensitive.value
  search()
}

const wholeWordClicked = () => {
  isWholeWord.value = !isWholeWord.value
  search()
}

const regexpClicked = () => {
  isRegexp.value = !isRegexp.value
  search()
}

const openFolder = () => {
  useProjectStore().askForOpenProject()
}

const handleFindInFolder = () => {
  keyword.value = searchMatches.value
}

// Lifecycle
onMounted(() => {
  nextTick(() => {
    keyword.value = searchMatches.value
    bus.on('findInFolder', handleFindInFolder)
    if (keyword.value.length > 0 && searcherRunning.value === false) {
      searcherRunning.value = true
      search()
    }
  })
})

onBeforeUnmount(() => {
  bus.off('findInFolder', handleFindInFolder)
})
</script>

<style scoped>
  .side-bar-search {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  .search-wrapper {
    display: flex;
    margin: 37px 15px 10px 15px;
    padding: 0 6px;
    border-radius: 14px;
    height: 28px;
    border: 1px solid var(--floatBorderColor);
    background: var(--inputBgColor);
    box-sizing: border-box;
    align-items: center;
    & > input {
      color: var(--sideBarColor);
      background: transparent;
      height: 100%;
      flex: 1;
      border: none;
      outline: none;
      padding: 0 8px;
      font-size: 13px;
      width: 50%;
    }
    & > .controls {
      display: flex;
      flex-shrink: 0;
      margin-top: 3px;
      & > span {
        cursor: pointer;
        width: 20px;
        height: 20px;
        margin-left: 2px;
        margin-right: 2px;
        &:hover {
          color: var(--sideBarIconColor);
        }
        & > svg {
          fill: var(--sideBarIconColor);
          &:hover {
            fill: var(--highlightThemeColor);
          }
        }
        &.active svg {
            fill: var(--highlightThemeColor);
        }
      }
    }

    & > svg {
      cursor: pointer;
      flex-shrink: 0;
      width: 20px;
      height: 20px;
      margin-right: 10px;
      &:hover {
        color: var(--sideBarIconColor);
      }
    }
  }
  .cancel-area {
    text-align: center;
    margin-bottom: 16px;
  }
  .search-message-section {
    overflow-wrap: break-word;
  }
  .search-result-info,
  .search-message-section {
    padding-left: 15px;
    margin-bottom: 5px;
    font-size: 12px;
    color: var(--sideBarColor);
  }
  .empty,
  .search-result {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    &::-webkit-scrollbar:vertical {
      width: 8px;
    }
  }
  .empty {
    font-size: 14px;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    padding-bottom: 100px;
    & .no-data {
      display: flex;
      align-items: center;
      flex-direction: column;
    }
    & .no-data svg {
      fill: var(--themeColor);
      width: 120px;
    }
    & .no-data .button-primary {
      display: block;
      margin-top: 20px;
    }
  }
</style>
