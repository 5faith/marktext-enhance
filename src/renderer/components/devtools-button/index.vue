<template>
  <div class="devtools-button" @click="openDevTools">
    Developer-Mode
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'

export default {
  name: 'DevtoolsButton',
  methods: {
    openDevTools () {
      ipcRenderer.send('mt::open-devtools')
    }
  }
}
</script>

<style scoped>
.devtools-button {
  position: fixed;
  bottom: 10px;
  right: 10px;
  padding: 6px 12px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  z-index: 9999;
  user-select: none;
  transition: background 0.2s;
}

.devtools-button:hover {
  background: rgba(0, 0, 0, 0.8);
}
</style>
