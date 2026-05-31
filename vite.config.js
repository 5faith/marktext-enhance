import { defineConfig } from 'vite'
import { resolve, relative, extname, normalize } from 'path'
import { readFileSync } from 'fs'
import vue from '@vitejs/plugin-vue'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import AutoImport from 'unplugin-auto-import/vite'

function svgImportPlugin (iconDirs) {
  const normalizedDirs = iconDirs.map(d => normalize(d))
  return {
    name: 'vite-plugin-svg-import',
    enforce: 'pre',
    transform (code, id) {
      let normalizedId = id
      if (normalizedId.startsWith('/@fs/')) {
        normalizedId = normalizedId.slice(4)
      }
      if (normalizedId.startsWith('/') && /^[A-Z]:/i.test(normalizedId.slice(1))) {
        normalizedId = normalizedId.slice(1)
      }
      normalizedId = normalize(normalizedId)

      if (!normalizedId.endsWith('.svg')) return null
      if (normalizedId.includes('?')) return null

      const isIconSvg = normalizedDirs.some(dir => normalizedId.startsWith(dir))
      if (!isIconSvg) return null

      const content = readFileSync(normalizedId, 'utf-8')
      const viewBoxMatch = content.match(/viewBox=["']([^"']*)["']/)
      const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 1024 1024'

      const iconDir = normalizedDirs.find(dir => normalizedId.startsWith(dir))
      const relativePath = relative(iconDir, normalizedId).replace(/\\/g, '/')
      const ext = extname(relativePath)
      const nameWithoutExt = relativePath.slice(0, -ext.length)
      const parts = nameWithoutExt.split('/')
      const fileName = parts.pop()
      const dirName = parts.join('-')
      let symbolId = 'icon-[dir]-[name]'
      symbolId = symbolId.replace(/\[dir\]/g, dirName)
      if (!dirName) {
        symbolId = symbolId.replace('--', '-')
      }
      symbolId = symbolId.replace(/\[name\]/g, fileName)

      return {
        code: `export default { viewBox: "${viewBox}", url: "#${symbolId}" }`,
        map: null
      }
    }
  }
}

export default defineConfig(({ command }) => {
  const isDev = command === 'serve'
  
  return {
    root: resolve(__dirname),
    resolve: {
      alias: {
        'vue': 'vue/dist/vue.esm-bundler.js',
        'main': resolve(__dirname, 'src/main'),
        '@': resolve(__dirname, 'src/renderer'),
        'common': resolve(__dirname, 'src/common'),
        'muya': resolve(__dirname, 'src/muya'),
        'snapsvg': resolve(__dirname, 'src/muya/lib/assets/libs/snap.svg-min.js'),
        'eve': resolve(__dirname, 'node_modules/eve-raphael'),
        'fs-extra': resolve(__dirname, 'src/renderer/shims/fs-extra.js'),
        'fs/promises': resolve(__dirname, 'src/renderer/shims/fs-promises.js'),
        '@hfelix/electron-spellchecker': resolve(__dirname, 'src/renderer/shims/electron-spellchecker.js'),
        'vscode-ripgrep': resolve(__dirname, 'src/renderer/shims/vscode-ripgrep.js'),
        '@electron/remote': resolve(__dirname, 'src/renderer/shims/electron-remote.js'),
        'path': resolve(__dirname, 'src/renderer/shims/path.js'),
        'fs': resolve(__dirname, 'src/renderer/shims/fs.js'),
        'child_process': resolve(__dirname, 'src/renderer/shims/child_process.js'),
        'os': resolve(__dirname, 'src/renderer/shims/os.js'),
        'crypto': resolve(__dirname, 'src/renderer/shims/crypto.js'),
        'electron': resolve(__dirname, 'src/renderer/shims/electron.js'),
        'electron-hunspell': resolve(__dirname, 'src/renderer/shims/electron-hunspell.js'),
        '@marktext/file-icons': resolve(__dirname, 'node_modules/@marktext/file-icons/src/index.js'),
        '@marktext/file-icons/build/index.css': resolve(__dirname, 'node_modules/@marktext/file-icons/src/index.css')
      },
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
      dedupe: ['vue']
    },
    define: {
      __static: JSON.stringify(resolve(__dirname, 'static')),
      'process.env.NODE_ENV': isDev ? JSON.stringify('development') : JSON.stringify('production')
    },
    plugins: [
      vue({
        template: {
          compilerOptions: {
          }
        }
      }),
      svgImportPlugin([resolve(__dirname, 'src/renderer/assets/icons')]),
      createSvgIconsPlugin({
        iconDirs: [resolve(__dirname, 'src/renderer/assets/icons')],
        symbolId: 'icon-[dir]-[name]',
        svgoOptions: true
      }),
      Components({
        resolvers: [ElementPlusResolver()],
        dts: false
      }),
      AutoImport({
        resolvers: [ElementPlusResolver()],
        dts: false
      }),
      electron([
        {
          entry: 'src/main/index.js',
          onstart(args) {
            args.startup()
          },
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
        }
      ]),
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
        'util'
        ]
      }
    },
    server: {
      port: 9091,
      strictPort: true
    },
    assetsInclude: ["**/*.md", "**/*.html"],
    optimizeDeps: {
      include: ['snapsvg', 'path-browserify'],
      exclude: ['keytar', 'fontmanager-redux', 'native-keymap', 'ced', 'cld', '@hfelix/spellchecker', 'keyboard-layout', 'electron-log', 'fs-extra', 'graceful-fs', 'chokidar', '@hfelix/electron-spellchecker', 'vscode-ripgrep', 'electron-hunspell', 'hunspell-asm', 'emscripten-wasm-loader']
    },
    ssr: {
      external: ['keytar', 'fontmanager-redux', 'native-keymap', 'ced', 'cld', '@hfelix/spellchecker', 'keyboard-layout', 'electron-log', 'fs-extra', 'graceful-fs', 'chokidar', '@hfelix/electron-spellchecker', 'electron-hunspell', 'hunspell-asm', 'emscripten-wasm-loader']
    }
  }
})
