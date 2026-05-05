<template>
  <div class="pref-container">
    <title-bar v-if="showCustomTitleBar"></title-bar>
    <side-bar></side-bar>
    <div
      class="pref-content"
      :class="{ 'frameless': titleBarStyle === 'custom' || isOsx }"
    >
      <div class="title-bar" v-if="!showCustomTitleBar"></div>
      <router-view class="pref-setting"></router-view>
    </div>
  </div>
</template>

<script setup>
import { computed, watch, onMounted, nextTick } from 'vue'
import TitleBar from '@/prefComponents/common/titlebar'
import SideBar from '@/prefComponents/sideBar'
import { loadingPageMixins } from '@/mixins'
import { addThemeStyle } from '@/util/theme'
import { DEFAULT_STYLE } from '@/config'
import { isOsx } from '@/util'
import { usePreferencesStore } from '@/stores'

const { hideLoadingPage } = loadingPageMixins

const theme = computed(() => usePreferencesStore().theme)
const titleBarStyle = computed(() => usePreferencesStore().titleBarStyle)
const showCustomTitleBar = computed(() => {
  return titleBarStyle.value === 'custom' && !isOsx
})

watch(theme, (value, oldValue) => {
  if (value !== oldValue) {
    addThemeStyle(value)
  }
})

onMounted(() => {
  nextTick(() => {
    const state = global.marktext.initialState || DEFAULT_STYLE
    addThemeStyle(state.theme)

    usePreferencesStore().askForUserPreference()
    hideLoadingPage()
  })
})
</script>

<style>
.pref-container {
  --prefSideBarWidth: 280px;

  width: 100vw;
  height: 100vh;
  max-width: 100vw;
  max-height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  background: var(--editorBgColor);

  & h4 {
    margin: 0;
    font-weight: normal;
  }

  & h5 {
    font-weight: normal;
  }

  & .pref-content {
    position: relative;
    flex: 1;
    display: flex;
    flex-direction: column;
    max-width: calc(100vw - var(--prefSideBarWidth));
    & .title-bar {
      width: 100%;
      height: var(--titleBarHeight);
      position: fixed;
      top: 0;
      right: 0;
      -webkit-app-region: drag;
    }
    & .pref-setting {
      padding: 50px 20px;
      padding-top: var(--titleBarHeight);
      flex: 1;
      height: calc(100vh - var(--titleBarHeight));
      overflow: auto;
    }
    & span, & div,
    & h1, & h2, & h3, & h4, & h5 {
      user-select: none;
    }
  }
  & .pref-content.frameless .pref-setting {
    /* Move the scrollbar below the titlebar */
    margin-top: var(--titleBarHeight);
    padding-top: 0;
  }
}
</style>
