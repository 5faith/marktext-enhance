import { defineConfig } from 'vite'
import { resolve } from 'path'
import vue2 from '@vitejs/plugin-vue2'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'

const prismjsComponentsDir = resolve(__dirname, 'node_modules/prismjs/components')

export default defineConfig(({ command }) => {
  const isDev = command === 'serve'
  
  return {
    root: resolve(__dirname),
    resolve: {
      alias: {
        'main': resolve(__dirname, 'src/main'),
        '@': resolve(__dirname, 'src/renderer'),
        'common': resolve(__dirname, 'src/common'),
        'muya': resolve(__dirname, 'src/muya'),
        'snapsvg': resolve(__dirname, 'src/muya/lib/assets/libs/snap.svg-min.js'),
        'vue': 'vue/dist/vue.esm.js',
        'eve': resolve(__dirname, 'node_modules/eve-raphael'),
        'fs-extra': resolve(__dirname, 'src/renderer/shims/fs-extra.js'),
        '@hfelix/electron-spellchecker': resolve(__dirname, 'src/renderer/shims/electron-spellchecker.js'),
        'element-ui/lib/theme-chalk/index.css': resolve(__dirname, 'src/renderer/shims/element-ui-css.js'),
        '@prism-components/': prismjsComponentsDir + '/'
      },
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
    },
    define: {
      __static: JSON.stringify(resolve(__dirname, 'static'))
    },
    plugins: [
      vue2(),
      createSvgIconsPlugin({
        iconDirs: [resolve(__dirname, 'src/renderer/assets/icons')],
        symbolId: 'icon-[dir]-[name]',
        svgoOptions: true
      }),
      electron({
        entry: 'src/main/index.js',
        vite: {
          build: {
            outDir: resolve(__dirname, 'dist/electron'),
            lib: {
              entry: resolve(__dirname, 'src/main/index.js'),
              formats: ['cjs'],
              fileName: () => 'main.js'
            },
            rollupOptions: {
              external: [
                'electron',
                '@electron/remote',
                'electron-log',
                'electron-store',
                'electron-window-state',
                'chokidar',
                'vscode-ripgrep',
                'keytar',
                'fontmanager-redux',
                'native-keymap',
                'ced',
                'cld',
                '@hfelix/spellchecker',
                '@hfelix/electron-localshortcut',
                '@hfelix/electron-spellchecker',
                'command-exists',
                'iconv-lite',
                'minizlib',
                'plist',
                'webfontloader',
                'element-resize-detector',
                'unsplash-js',
                '@octokit/rest',
                'arg',
                'dayjs',
                'deep-equal',
                'fuzzaldrin',
                'iso-639-1',
                'turndown',
                'joplin-turndown-plugin-gfm',
                'dompurify',
                'dom-autoscroller',
                'dragula',
                'codemirror',
                'katex',
                'mermaid',
                'prismjs',
                'vega',
                'vega-embed',
                'vega-lite',
                'flowchart.js',
                'snabbdom',
                'snabbdom-to-html',
                'marked',
                'axios',
                'github-markdown-css',
                'html-tags',
                'execall',
                'keyboard-layout'
              ]
            }
          },
          resolve: {
            alias: {
              'common': resolve(__dirname, 'src/common'),
              'main': resolve(__dirname, 'src/main')
            }
          },
          define: {
            __static: JSON.stringify(resolve(__dirname, 'static'))
          }
        }
      }),
      renderer()
    ],
    css: {},
    build: {
      outDir: resolve(__dirname, 'dist/electron'),
      rollupOptions: {
        input: resolve(__dirname, 'src/renderer/main.js'),
        external: [
          'snabbdom',
          'snabbdom-to-html',
          'keyboard-layout',
          'keytar',
          'fontmanager-redux',
          'native-keymap',
          'ced',
          'cld',
          '@hfelix/spellchecker',
          'electron-log',
          '@electron/remote',
          'electron-store',
          'electron-window-state',
          '@hfelix/electron-localshortcut',
          '@hfelix/electron-spellchecker',
          'vscode-ripgrep',
          'octokit/rest',
          'fs-extra',
          'graceful-fs',
          'chokidar',
          'fs/promises',
          'child_process',
          'os',
          'crypto',
          'path'
        ]
      }
    },
    server: {
      port: 9091,
      strictPort: false
    },
    assetsInclude: ["**/*.md", "**/*.html"],
    optimizeDeps: {
      include: ['snapsvg', 'prismjs', 'prismjs/components.js', 'prismjs/dependencies', 'prismjs/components/prism-latex', 'prismjs/components/prism-yaml'],
      exclude: ['keytar', 'fontmanager-redux', 'native-keymap', 'ced', 'cld', '@hfelix/spellchecker', 'keyboard-layout', 'electron-log', 'fs-extra', 'graceful-fs', 'chokidar', '@hfelix/electron-spellchecker']
    },
    ssr: {
      external: ['keytar', 'fontmanager-redux', 'native-keymap', 'ced', 'cld', '@hfelix/spellchecker', 'keyboard-layout', 'electron-log', 'fs-extra', 'graceful-fs', 'chokidar', '@hfelix/electron-spellchecker']
    }
  }
})
