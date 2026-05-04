import { defineConfig } from 'vite'
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'

export default defineConfig(({ command }) => {
  const isDev = command === 'serve'
  
  return {
    root: resolve(__dirname, 'src'),
    resolve: {
      alias: {
        'main': resolve(__dirname, 'src/main'),
        '@': resolve(__dirname, 'src/renderer'),
        'common': resolve(__dirname, 'src/common'),
        'muya': resolve(__dirname, 'src/muya'),
        'snapsvg': resolve(__dirname, 'src/muya/lib/assets/libs/snap.svg-min.js'),
        'vue$': 'vue/dist/vue.esm.js'
      }
    },
    plugins: [
      vue({
        template: {
          compilerOptions: {
            whitespace: 'preserve'
          }
        }
      }),
      createSvgIconsPlugin({
        iconDirs: [resolve(__dirname, 'src/renderer/assets/icons')],
        symbolId: 'icon-[dir]-[name]',
        svgoOptions: true
      }),
      electron([
        {
          entry: 'src/main/index.js',
          vite: {
            build: {
              outDir: 'dist/electron',
              rollupOptions: {
                external: [
                  ...Object.keys(require('./package.json').dependencies || {}),
                  'keytar',
                  'fontmanager-redux',
                  'native-keymap',
                  'ced'
                ]
              }
            },
            resolve: {
              alias: {
                'common': resolve(__dirname, 'src/common'),
                'main': resolve(__dirname, 'src/main')
              }
            }
          }
        }
      ]),
      renderer()
    ],
    css: {
      preprocessorOptions: {}
    },
    build: {
      outDir: resolve(__dirname, 'dist/electron'),
      rollupOptions: {
        input: resolve(__dirname, 'src/renderer/main.js'),
        external: ['snabbdom', 'snabbdom-to-html']
      }
    },
    server: {
      port: 9091,
      strictPort: true
    },
    optimizeDeps: {
      include: ['snapsvg']
    }
  }
})
