<template>
    <div class="search-result-item">
      <div
        class="search-result"
        :title="searchResult.filePath"
      >
        <svg
          class="icon icon-arrow"
          :class="{'fold': !showSearchMatches}"
          aria-hidden="true"
          @click.stop="toggleSearchMatches()"
        >
          <use xlink:href="#icon-arrow"></use>
        </svg>
        <div
          class="file-info"
          @click.stop="toggleSearchMatches()"
        >
          <div class="title">
            <span class="filename">
              <span class="name">{{ filename }}</span><span class="extension">{{extension}}</span>
            </span>
            <span class="match-count">{{ matchCount }}</span>
          </div>
          <!-- <div class="folder-path">
            <span>{{ dirname }}</span>
          </div> -->
        </div>
      </div>
      <div
        class="matches"
        v-if="showSearchMatches"
      >
        <ul>
          <li
            class="text-overflow"
            v-for="(searchMatch, index) of getMatches"
            :key="index"
            :searchMatch="searchMatch"
            :title="searchMatch.lineText"
            @click="handleSearchResultClick(searchMatch)"
          >
            <!-- <span class="line-number">{{ searchMatch.range[0][0] }}</span> -->
            <span>{{ ellipsisText(searchMatch.lineText.substring(0, searchMatch.range[0][1])) }}</span>
            <span class="highlight">{{ searchMatch.lineText.substring(searchMatch.range[0][1], searchMatch.range[1][1]) }}</span>
            <span>{{ searchMatch.lineText.substring(searchMatch.range[1][1]) }}</span>
          </li>
        </ul>
        <div v-if="!allMatchesShown">
          <div
            class="button tiny"
            @click="handleShowMoreMatches"
          >
            Show more matches
          </div>
        </div>
      </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import path from 'path'
import { useEditorStore } from '@/stores'
import { fileMixins } from '../../mixins'
import { PATH_SEPARATOR } from '../../config'

// State
const props = defineProps({
  searchResult: {
    type: Object,
    required: true
  }
})

const showSearchMatches = ref(props.searchResult.matches.length <= 20)
const allMatchesShown = ref(props.searchResult.matches.length <= 10)
const shownMatches = ref(10)

// Stores
const tabs = computed(() => useEditorStore().tabs)
const currentFile = computed(() => useEditorStore().currentFile)

// Computed
const getMatches = computed(() => {
  if (props.searchResult.matches.length === 0 || allMatchesShown.value) {
    return props.searchResult.matches
  }
  return props.searchResult.matches.slice(0, shownMatches.value)
})

// Return filename without extension.
const filename = computed(() => {
  return path.basename(props.searchResult.filePath, path.extname(props.searchResult.filePath))
})

const matchCount = computed(() => {
  return props.searchResult.matches.length
})

// Return the filename extension or null.
const extension = computed(() => {
  return path.extname(props.searchResult.filePath)
})

// Return the parent directory with trailing path separator.
const dirname = computed(() => {
  return path.join(path.dirname(props.searchResult.filePath), PATH_SEPARATOR)
})

// Methods
const toggleSearchMatches = () => {
  showSearchMatches.value = !showSearchMatches.value
}

const handleShowMoreMatches = (event) => {
  shownMatches.value += 15
  if (event.ctrlKey || event.metaKey ||
      shownMatches.value >= props.searchResult.matches.length) {
    allMatchesShown.value = true
  }
}

const ellipsisText = (text) => {
  const len = text.length
  const MAX_PRETEXT_LEN = 6
  return len > MAX_PRETEXT_LEN ? `...${text.substring(len - MAX_PRETEXT_LEN)}` : text
}

const handleSearchResultClick = (searchMatch) => {
  // Implement search result click logic
  // This might need to emit an event or call a store action
  console.log('Search result clicked:', searchMatch)
}
</script>

<style scoped>
  .search-result-item {
    position: relative;
    user-select: none;
    padding: 0 10px 8px 10px;
    color: var(--sideBarColor);
    font-size: 14px;
    & > .search-result {
      display: flex;
      align-items: center;
      & > svg:first-child {
        margin-right: 3px;
      }
      & > .file-info {
        flex: 1;
        overflow: hidden;
      }
    }
    & .title .filename {
      font-size: 14px;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
      padding-right: 8px;
    }
    & .matches {
      & ul {
        padding-left: 0;
        list-style-type: none;
        & li {
          display: block;
          padding: 2px 16px;
          padding-right: 0;
          cursor: pointer;
          /* Hide space between inline spans */
          font-size: 0;
          & .highlight {
            background: var(--highlightColor);
            line-height: 16px;
            height: 16px;
            display: inline-block;
            color: var(--sideBarTextColor);
            border-radius: 1px;
          }
          &:hover {
            background: var(--sideBarItemHoverBgColor);
          }
          & span {
            font-size: 13px;
            white-space: pre;
          }
        }
      }
      & .button {
        width: 130px;
        margin: 0 auto;
        text-align: center;
      }
    }
  }
  .search-result-item.active {
    font-weight: 600;
    .title {
      color: var(--themeColor);
    }
  }
  .search-result-item.active::before {
    height: 100%;
  }
  .title {
    display: flex;
    color: var(--sideBarTextColor);
    & .filename {
      flex: 1;
      & .name {
        font-weight: 600;
      }
      & .extension {
        color: var(--sideBarTextColor);
        font-size: 12px;
      }
    }
    & .match-count {
      display: inline-block;
      font-size: 12px;
      line-height: 18px;
      text-align: center;
      min-width: 18px;
      height: 18px;
      border-radius: 9px;
      flex-shrink: 0;
      background: var(--itemBgColor);
      color: var(--sideBarTextColor);
    }
  }

  .folder-path {
    font-size: 12px;
  }

  .folder-path > span,
  .matches {
    width: 100%;
    margin-top: 5px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--sideBarTextColor);
  }

  .icon-arrow {
    transition: all .25s ease-out;
    transform: rotate(90deg);
    fill: var(--sideBarTextColor);
  }
  .icon-arrow.fold {
    transform: rotate(0);
  }
</style>
