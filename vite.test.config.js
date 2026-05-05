import { defineConfig } from 'vite'
import vue2 from '@vitejs/plugin-vue2'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue2()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src/renderer'),
      'common': resolve(__dirname, 'src/common'),
      'muya': resolve(__dirname, 'src/muya'),
      'vue': 'vue/dist/vue.esm.js'
    }
  }
})
