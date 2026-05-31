import { defineConfig } from 'vitest/config'
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src/renderer'),
      'common': resolve(__dirname, 'src/common'),
      'muya': resolve(__dirname, 'src/muya'),
      'vue': 'vue/dist/vue.esm-bundler.js'
    }
  },
  test: {
    environment: 'node',
    globals: true,
    include: ['test/unit/specs/**/*.spec.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/renderer/**/*.{js,vue}'],
      exclude: ['src/renderer/main.js']
    }
  }
})