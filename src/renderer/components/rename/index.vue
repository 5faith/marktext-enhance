<template>
  <div class="rename">
    <el-dialog
      :visible.sync="showRename"
      :show-close="false"
      :modal="true"
      custom-class="ag-dialog-table"
      width="410px"
    >
      <div slot="title" class="search-wrapper">
        <div class="input-wrapper">
          <input
            type="text" v-model="tempName" class="search"
            @keyup.13="confirm"
            ref="search"
          >
          <svg class="icon" aria-hidden="true" @click="confirm">
            <use xlink:href="#icon-markdown"></use>
          </svg>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import bus from '../../bus'
import { useEditorStore } from '@/stores'

const showRename = ref(false)
const tempName = ref('')
const searchRef = ref(null)

const filename = computed(() => useEditorStore().currentFile?.filename)

const handleRename = () => {
  showRename.value = true
  tempName.value = filename.value || ''
  nextTick(() => {
    if (searchRef.value) {
      searchRef.value.focus()
    }
  })
}

const confirm = () => {
  useEditorStore().rename(tempName.value)
  showRename.value = false
}

onMounted(() => {
  bus.on('rename', handleRename)
})

onBeforeUnmount(() => {
  bus.off('rename', handleRename)
})
</script>

<style>
  .rename .el-dialog__header {
    box-sizing: border-box;
  }
  .rename .el-dialog__body {
    display: none;
  }
</style>

<style scoped>
  .search-wrapper {
    margin-top: 8px;
    z-index: 10000;
    position: relative;
    left: 50%;
    transform: translateX(-50%);
    width: 410px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-shadow: none;
    border: none;
    border-radius: 3px;
    margin: 0;
    padding: 0 8px;

    & .input-wrapper {
      display: flex;
      width: 100%;
      & input {
        background: transparent;
      }
    }
  }
  .search {
    width: 100%;
    height: 30px;
    outline: none;
    border: none;
    font-size: 14px;
    padding: 0 8px;
    margin: 0 10px;
    color: var(--sideBarColor);
  }
  .search-wrapper svg {
    cursor: pointer;
    margin: 0 5px;
    width: 30px;
    height: 30px;
    color: var(--iconColor);
    transition: all .3s ease-in-out;
  }
  .search-wrapper svg:hover {
    color: var(--themeColor);
  }
</style>
