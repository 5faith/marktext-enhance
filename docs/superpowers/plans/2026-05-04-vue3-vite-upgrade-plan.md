# MarkText Vue2+Webpack → Vue3+Vite 升级实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 MarkText 从 Vue 2.6 + Webpack 5 渐进式升级到 Vue 3.4 + Vite 5 + Element Plus + Pinia，分6个独立阶段，每阶段可测试可回退。

**Architecture:** 采用渐进式迁移策略，先替换构建工具（Webpack→Vite），再通过 Vue 2.7 过渡，最后升级到 Vue 3 + @vue/compat 兼容模式，逐步迁移状态管理（Vuex→Pinia）和 UI 库（Element UI→Element Plus），最终移除兼容层并重构为 Composition API。

**Tech Stack:** Vue 3.4, Vite 5, Element Plus 2, Pinia 2, Vue Router 4, vite-plugin-electron, Electron 28

---

## 阶段1: Webpack → Vite（保持Vue2）

### Task 1.1: 安装 Vite 相关依赖

**Files:**
- Modify: `package.json`

- [ ] **Step 1: 安装 Vite 核心依赖**

Run:
```bash
yarn add -D vite@^5.0 @vitejs/plugin-vue@^4.0 vite-plugin-electron@^0.28 vite-plugin-electron-renderer@^0.14
```

- [ ] **Step 2: 安装 SVG 和 ESLint 插件**

Run:
```bash
yarn add -D vite-plugin-svg-icons@^2.0 vite-plugin-eslint@^1.8 rollup-plugin-visualizer@^5.0
```

- [ ] **Step 3: 提交**

```bash
git add package.json yarn.lock
git commit -m "chore: add vite and related dependencies for phase 1"
```

---

### Task 1.2: 创建 Vite 配置文件

**Files:**
- Create: `vite.config.js`
- Create: `vite.main.config.js`
- Create: `vite.renderer.config.js`

- [ ] **Step 1: 创建 vite.config.js**

```javascript
import { defineConfig } from 'vite'
import { resolve } from 'path'
import mainConfig from './vite.main.config.js'
import rendererConfig from './vite.renderer.config.js'

export default defineConfig(({ command }) => {
  const isDev = command === 'serve'
  
  return {
    resolve: {
      alias: {
        'main': resolve(__dirname, 'src/main'),
        '@': resolve(__dirname, 'src/renderer'),
        'common': resolve(__dirname, 'src/common'),
        'muya': resolve(__dirname, 'src/muya'),
        'snapsvg': resolve(__dirname, 'src/muya/lib/assets/libs/snap.svg-min.js')
      }
    },
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'src/main/index.js'),
          renderer: resolve(__dirname, 'src/renderer/main.js')
        }
      }
    },
    // 合并主进程和渲染进程配置
    plugins: [
      ...mainConfig(isDev).plugins,
      ...rendererConfig(isDev).plugins
    ]
  }
})
```

- [ ] **Step 2: 创建 vite.main.config.js**

```javascript
import { resolve } from 'path'
import electron from 'vite-plugin-electron'

export default (isDev = true) => ({
  plugins: [
    electron({
      entry: 'src/main/index.js',
      vite: {
        build: {
          outDir: 'dist/electron',
          rollupOptions: {
            external: Object.keys(require('./package.json').dependencies || {})
          }
        },
        resolve: {
          alias: {
            'common': resolve(__dirname, 'src/common'),
            'main': resolve(__dirname, 'src/main')
          }
        }
      }
    })
  ]
})
```

- [ ] **Step 3: 创建 vite.renderer.config.js**

```javascript
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import eslint from 'vite-plugin-eslint'

export default (isDev = true) => ({
  root: resolve(__dirname, 'src'),
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // Vue 2 兼容选项
          whitespace: 'preserve'
        }
      }
    }),
    createSvgIconsPlugin({
      iconDirs: [resolve(__dirname, 'src/renderer/assets/icons')],
      symbolId: 'icon-[dir]-[name]',
      svgoOptions: true
    }),
    isDev && eslint({
      include: ['src/**/*.js', 'src/**/*.vue'],
      exclude: ['node_modules', 'src/muya/dist']
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src/renderer'),
      'common': resolve(__dirname, 'src/common'),
      'muya': resolve(__dirname, 'src/muya'),
      'vue$': 'vue/dist/vue.esm.js'
    }
  },
  css: {
    preprocessorOptions: {
      // 保留现有 postcss 配置
    }
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
  }
})
```

- [ ] **Step 4: 提交**

```bash
git add vite.config.js vite.main.config.js vite.renderer.config.js
git commit -m "feat(phase1): create vite configuration files"
```

---

### Task 1.3: 创建 index.html 入口

**Files:**
- Create: `index.html`
- Modify: `src/renderer/main.js` (minor)

- [ ] **Step 1: 创建 index.html**

Vite 需要 HTML 入口文件。创建 `index.html` 在项目根目录：

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';">
  <title>MarkText</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/renderer/main.js"></script>
</body>
</html>
```

- [ ] **Step 2: 提交**

```bash
git add index.html
git commit -m "feat(phase1): add index.html entry for vite"
```

---

### Task 1.4: 更新 package.json scripts

**Files:**
- Modify: `package.json`

- [ ] **Step 1: 替换 scripts**

将以下 scripts 替换为 Vite 版本：

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:bin": "vite build",
    "build:clean": "rimraf dist",
    "build:dev": "vite build --mode development",
    "preview": "vite preview",
    "lint": "eslint --ext .js,.vue -f ./node_modules/eslint-friendly-formatter src test",
    "lint:fix": "eslint --ext .js,.vue -f ./node_modules/eslint-friendly-formatter --fix src test",
    "e2e": "yarn run build && cross-env MARKTEXT_EXIT_ON_ERROR=1 playwright test -c test/e2e/playwright.config.js test/e2e",
    "unit": "cross-env NODE_ENV=test ELECTRON_DISABLE_SECURITY_WARNINGS=true karma start test/unit/karma.conf.js",
    "test": "yarn run unit && yarn run e2e",
    "test:specs": "node -r esm test/specs/commonMark/run.spec.js && node -r esm test/specs/gfm/run.spec.js",
    "postinstall": "node .electron-vue/postinstall.js && yarn run rebuild && yarn run lint:fix",
    "rebuild": "electron-rebuild -f",
    "build:muya": "cd src/muya && webpack --progress --config webpack.config.js",
    "gen-third-party": "node tools/generateThirdPartyLicense.js",
    "validate-licenses": "node tools/validateLicenses.js",
    "deobfuscateStackTrace": "node tools/deobfuscateStackTrace.js"
  }
}
```

**关键变更说明:**
- `dev`: 使用 `vite` 替代 `.electron-vue/dev-runner.js`
- `build`: 使用 `vite build` 替代 `.electron-vue/build.js`
- 移除 `pack`, `pack:main`, `pack:renderer` (webpack 专用)
- 移除 `release:*` (暂时保留 electron-builder 命令)

- [ ] **Step 2: 提交**

```bash
git add package.json
git commit -m "feat(phase1): update package.json scripts for vite"
```

---

### Task 1.5: 修改 Electron 窗口加载方式

**Files:**
- Modify: `src/main/windows/editor.js`
- Modify: `src/main/windows/setting.js`
- Modify: `src/main/app/windowManager.js`

- [ ] **Step 1: 分析当前窗口加载逻辑**

当前窗口通过 Webpack Dev Server URL 或 file:// 协议加载 HTML。需要改为 Vite Dev Server URL。

读取 `src/main/windows/editor.js:1-100` 找到 `loadURL` 或 `loadFile` 调用。

- [ ] **Step 2: 修改开发环境 URL**

在窗口加载逻辑中，将 Webpack Dev Server URL (`http://localhost:9091`) 改为 Vite Dev Server URL（同样端口 9091）：

```javascript
// 在 editor.js 中找到类似代码并修改：
const isDev = process.env.NODE_ENV === 'development'

if (isDev) {
  // 旧代码可能是:
  // mainWindow.loadURL('http://localhost:9080/index.html')
  
  // 新代码:
  mainWindow.loadURL('http://localhost:9091/index.html')
} else {
  mainWindow.loadFile('dist/electron/index.html')
}
```

- [ ] **Step 3: 提交**

```bash
git add src/main/windows/*.js
git commit -m "feat(phase1): update window loading URLs for vite dev server"
```

---

### Task 1.6: 处理特殊 Loader 迁移

**Files:**
- Modify: `vite.renderer.config.js`
- Create: `vite.plugins/inline-css.js` (如需要)

- [ ] **Step 1: 处理 to-string-loader 场景**

Webpack 中对某些 CSS（如 katex, prism）使用 `to-string-loader + css-loader` 将 CSS 转为字符串。Vite 中使用 `?inline` 查询参数：

搜索代码中使用这些 CSS 的地方：
```bash
grep -r "katex.*css\|prism.*css" src/
```

将导入方式从：
```javascript
import 'katex/dist/katex.min.css'
```
改为（如需要内联）：
```javascript
import katexCSS from 'katex/dist/katex.min.css?inline'
```

- [ ] **Step 2: 处理 imports-loader (snap.svg)**

Webpack 使用 `imports-loader` 向 snap.svg 注入全局变量。Vite 中使用 `vite-plugin-inject` 或手动处理。

在 `vite.renderer.config.js` 中添加：
```javascript
export default (isDev = true) => ({
  // ... 其他配置
  optimizeDeps: {
    include: ['snapsvg']
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true
    }
  }
})
```

- [ ] **Step 3: 处理 .node 原生模块**

Vite 通过 `vite-plugin-electron` 处理原生模块。确保配置中 `external` 包含所有原生模块：

```javascript
// vite.main.config.js
external: [
  ...Object.keys(require('./package.json').dependencies || {}),
  'keytar',
  'fontmanager-redux', 
  'native-keymap',
  'ced'
]
```

- [ ] **Step 4: 提交**

```bash
git add vite.renderer.config.js vite.main.config.js
git commit -m "feat(phase1): handle special loader migrations"
```

---

### Task 1.7: 更新测试配置适配 Vite

**Files:**
- Modify: `test/unit/karma.conf.js`
- Create: `vite.test.config.js`

- [ ] **Step 1: 创建 Vite 测试配置**

```javascript
// vite.test.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src/renderer'),
      'common': resolve(__dirname, 'src/common'),
      'muya': resolve(__dirname, 'src/muya')
    }
  }
})
```

- [ ] **Step 2: 更新 Karma 配置使用 Vite**

修改 `test/unit/karma.conf.js`，将 webpack 中间件替换为 vite：

```javascript
// 找到 webpack 相关配置并替换为：
const { createViteTestConfig } = require('vite-plugin-karma')

module.exports = function(config) {
  config.set({
    // ... 保留基础配置
    frameworks: ['mocha', 'chai'],
    files: ['test/unit/index.js'],
    preprocessors: {
      'test/unit/index.js': ['vite']
    },
    // 移除 karma-webpack 相关配置
  })
}
```

或者更简单的方式：暂时保留 karma-webpack，只确保源码能通过 Vite 构建。

- [ ] **Step 3: 提交**

```bash
git add vite.test.config.js test/unit/karma.conf.js
git commit -m "feat(phase1): update test configuration for vite"
```

---

### Task 1.8: 验证阶段1 - 开发环境

**Files:**
- 无修改，仅验证

- [ ] **Step 1: 安装依赖**

Run:
```bash
yarn install
```

- [ ] **Step 2: 启动开发服务器**

Run:
```bash
yarn dev
```

Expected: Vite dev server 启动在 http://localhost:9091，Electron 窗口正常打开

- [ ] **Step 3: 验证热更新**

修改任意 `.vue` 文件，保存后观察 HMR 是否工作。

Expected: 页面自动更新，无需刷新

- [ ] **Step 4: 验证功能**

手动测试以下功能：
- [ ] 打开 markdown 文件
- [ ] 编辑器正常渲染
- [ ] 侧边栏工作
- [ ] 设置面板打开
- [ ] 导出功能

- [ ] **Step 5: 提交验证结果**

```bash
git commit --allow-empty -m "chore(phase1): verify dev environment works with vite"
```

---

### Task 1.9: 验证阶段1 - 生产构建

**Files:**
- 无修改，仅验证

- [ ] **Step 1: 执行生产构建**

Run:
```bash
yarn build
```

Expected: 构建成功，输出到 `dist/electron/`

- [ ] **Step 2: 运行单元测试**

Run:
```bash
yarn run unit
```

Expected: 所有测试通过

- [ ] **Step 3: 运行 E2E 测试**

Run:
```bash
yarn run e2e
```

Expected: Playwright 测试通过

- [ ] **Step 4: 提交**

```bash
git commit --allow-empty -m "chore(phase1): verify production build works"
```

---

### Task 1.10: 删除 Webpack 配置文件

**Files:**
- Delete: `.electron-vue/webpack.main.config.js`
- Delete: `.electron-vue/webpack.renderer.config.js`
- Delete: `.electron-vue/dev-client.js`
- Delete: `.electron-vue/dev-runner.js`
- Delete: `.electron-vue/build.js`

- [ ] **Step 1: 确认 Vite 完全工作后删除**

仅在 Task 1.8 和 1.9 都验证通过后执行：

```bash
rm -rf .electron-vue/webpack.main.config.js
rm -rf .electron-vue/webpack.renderer.config.js
rm -rf .electron-vue/dev-client.js
rm -rf .electron-vue/dev-runner.js
rm -rf .electron-vue/build.js
```

保留 `.electron-vue/` 中仍需要的文件：
- `postinstall.js`
- `preinstall.js`
- `marktextEnvironment.js`
- `electron-builder/`
- `thirdPartyChecker.js`

- [ ] **Step 2: 提交**

```bash
git add -A
git commit -m "chore(phase1): remove webpack configuration files"
```

---

## 阶段2: Vue 2.6 → Vue 2.7

### Task 2.1: 升级 Vue 到 2.7

**Files:**
- Modify: `package.json`

- [ ] **Step 1: 升级 Vue 版本**

Run:
```bash
yarn add vue@^2.7
```

- [ ] **Step 2: 移除 vue-template-compiler**

Vue 2.7 内置编译器，不再需要单独安装：

Run:
```bash
yarn remove vue-template-compiler
```

- [ ] **Step 3: 更新 package.json**

确保依赖为：
```json
{
  "dependencies": {
    "vue": "^2.7"
  }
}
```

- [ ] **Step 4: 提交**

```bash
git add package.json yarn.lock
git commit -m "chore(phase2): upgrade vue to 2.7"
```

---

### Task 2.2: 验证 Composition API 可用

**Files:**
- Create: `src/renderer/components/test-composition-api.vue` (临时测试)

- [ ] **Step 1: 创建测试组件**

```vue
<template>
  <div>
    <p>Count: {{ count }}</p>
    <button @click="increment">Increment</button>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  setup() {
    const count = ref(0)
    
    const increment = () => {
      count.value++
    }
    
    onMounted(() => {
      console.log('Composition API works!')
    })
    
    return {
      count,
      increment
    }
  }
}
</script>
```

- [ ] **Step 2: 在任意页面引入测试组件**

修改 `src/renderer/pages/app.vue`，临时引入测试组件验证 Composition API 工作正常。

- [ ] **Step 3: 验证后删除测试组件**

```bash
rm src/renderer/components/test-composition-api.vue
```

- [ ] **Step 4: 提交**

```bash
git add -A
git commit -m "chore(phase2): verify composition api works in vue 2.7"
```

---

### Task 2.3: 运行迁移构建工具检查兼容性

**Files:**
- 无修改，仅运行工具

- [ ] **Step 1: 安装 @vue/compat 检查工具**

Run:
```bash
yarn add -D @vue/compat@npm:@vue/compat@latest
```

- [ ] **Step 2: 运行迁移构建**

临时修改 `vite.renderer.config.js` 使用 compat 插件：

```javascript
import vue from '@vitejs/plugin-vue'

export default (isDev = true) => ({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          compatConfig: {
            MODE: 2, // Vue 2 兼容模式
            GLOBAL_MOUNT: false,
            GLOBAL_EXTEND: false
          }
        }
      }
    })
  ]
})
```

- [ ] **Step 3: 启动应用查看警告**

Run:
```bash
yarn dev
```

查看控制台输出的兼容性警告，记录需要修改的地方。

- [ ] **Step 4: 提交检查报告**

创建 `docs/superpowers/plans/vue27-compat-report.md` 记录发现的问题。

```bash
git add docs/superpowers/plans/vue27-compat-report.md
git commit -m "docs(phase2): add vue 2.7 compatibility report"
```

---

## 阶段3: Vue 2.7 → Vue 3 + @vue/compat

### Task 3.1: 升级 Vue 到 3.x 并配置兼容层

**Files:**
- Modify: `package.json`
- Modify: `src/renderer/main.js`
- Modify: `vite.renderer.config.js`

- [ ] **Step 1: 安装 Vue 3 和兼容层**

Run:
```bash
yarn add vue@^3.4 @vue/compat@npm:@vue/compat@^3.4
yarn add vue-router@^4
```

- [ ] **Step 2: 配置 Vite 使用 compat**

修改 `vite.renderer.config.js`:

```javascript
import vue from '@vitejs/plugin-vue'

export default (isDev = true) => ({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          compatConfig: {
            MODE: 2, // 完全 Vue 2 兼容模式
            GLOBAL_MOUNT: false,
            GLOBAL_EXTEND: false,
            OPTIONS_DATA_FN: false,
            WATCH_ARRAY: false
          }
        }
      }
    })
  ],
  resolve: {
    alias: {
      'vue$': '@vue/compat' // 使用兼容层替换
    }
  }
})
```

- [ ] **Step 3: 提交**

```bash
git add package.json yarn.lock vite.renderer.config.js
git commit -m "chore(phase3): install vue 3 with compat layer"
```

---

### Task 3.2: 迁移 Vue 入口文件

**Files:**
- Modify: `src/renderer/main.js`

- [ ] **Step 1: 修改 Vue 初始化方式**

将 `src/renderer/main.js` 从 Vue 2 改为 Vue 3 风格：

**修改前:**
```javascript
import Vue from 'vue'
import VueRouter from 'vue-router'
import store from './store'
import routes from './router'

Vue.use(VueRouter)
Vue.use(VueElectron)

const router = new VueRouter({
  routes: routes(global.marktext.env.type)
})

new Vue({
  store,
  router,
  template: '<router-view class="view"></router-view>'
}).$mount('#app')
```

**修改后:**
```javascript
import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import store from './store'
import routes from './router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: routes(global.marktext.env.type)
})

const app = createApp({
  router,
  store,
  template: '<router-view class="view"></router-view>'
})

app.use(router)
app.use(store)

// 挂载 Element UI 组件（保持 Vue 2 风格注册）
// 阶段5会迁移到 Element Plus

app.mount('#app')
```

- [ ] **Step 2: 处理 vue-electron 插件**

Vue 3 不再需要 `vue-electron` 插件。直接在代码中使用 Electron API：

移除：
```javascript
import VueElectron from 'vue-electron'
Vue.use(VueElectron)
Vue.http = Vue.prototype.$http = axios
```

替换为在需要的地方直接导入：
```javascript
const { ipcRenderer } = require('electron')
```

- [ ] **Step 3: 处理服务挂载**

将 `services.forEach` 挂载到 `Vue.prototype` 的代码改为 Vue 3 的 `app.config.globalProperties`：

**修改前:**
```javascript
services.forEach(s => {
  Vue.prototype['$' + s.name] = s[s.name]
})
```

**修改后:**
```javascript
services.forEach(s => {
  app.config.globalProperties['$' + s.name] = s[s.name]
})
```

- [ ] **Step 4: 提交**

```bash
git add src/renderer/main.js
git commit -m "feat(phase3): migrate vue entry to vue 3 createApp"
```

---

### Task 3.3: 升级 Vue Router 到 v4

**Files:**
- Modify: `src/renderer/router/index.js`

- [ ] **Step 1: 修改 Router 创建方式**

读取 `src/renderer/router/index.js`，将 Vue Router 3 改为 v4：

**修改前:**
```javascript
import VueRouter from 'vue-router'

export default (windowType) => {
  return new VueRouter({
    routes: [
      { path: '/', redirect: windowType === 'preference' ? '/preference' : '/editor' },
      // ... 其他路由
    ]
  })
}
```

**修改后:**
```javascript
export default (windowType) => {
  return [
    { path: '/', redirect: windowType === 'preference' ? '/preference' : '/editor' },
    // ... 其他路由（routes 数组本身不变）
  ]
}
```

Router 的创建已在 `main.js` 中通过 `createRouter` 完成。

- [ ] **Step 2: 提交**

```bash
git add src/renderer/router/index.js
git commit -m "feat(phase3): upgrade vue router to v4 api"
```

---

### Task 3.4: 处理 Breaking Changes

**Files:**
- Modify: 多个组件文件

- [ ] **Step 1: 修复 $on/$off/$once 移除**

搜索所有使用 `$on`, `$off`, `$once` 的地方：

```bash
grep -rn "\$on\|\$off\|\$once" src/renderer/
```

替换为 mitt 事件总线。创建 `src/renderer/bus/index.js`:

```javascript
import mitt from 'mitt'
export default mitt()
```

Run:
```bash
yarn add mitt@^3.0
```

将 `bus.$emit('event')` 改为 `bus.emit('event')`
将 `bus.$on('event', cb)` 改为 `bus.on('event', cb)`
将 `bus.$off('event', cb)` 改为 `bus.off('event', cb)`

- [ ] **Step 2: 修复过滤器移除**

搜索所有使用过滤器的地方：

```bash
grep -rn "| " src/renderer/**/*.vue
```

将模板中的过滤器：
```html
{{ value | formatDate }}
```
改为方法调用：
```html
{{ formatDate(value) }}
```

在组件中添加对应的方法。

- [ ] **Step 3: 修复 v-model 语法变更**

Vue 3 中 `.sync` 修饰符已合并到 `v-model`。搜索：

```bash
grep -rn "\.sync" src/renderer/**/*.vue
```

将：
```html
<child :title.sync="pageTitle" />
```
改为：
```html
<child v-model:title="pageTitle" />
```

- [ ] **Step 4: 修复 $listeners 移除**

Vue 3 中 `$listeners` 已合并到 `$attrs`。搜索：

```bash
grep -rn "\$listeners" src/renderer/**/*.vue
```

将 `$listeners` 改为 `$attrs`。

- [ ] **Step 5: 提交**

```bash
git add src/renderer/
git commit -m "feat(phase3): fix vue 3 breaking changes"
```

---

### Task 3.5: 验证阶段3

**Files:**
- 无修改，仅验证

- [ ] **Step 1: 启动开发环境**

Run:
```bash
yarn dev
```

Expected: 应用正常启动，无严重错误

- [ ] **Step 2: 检查 compat 警告**

查看控制台输出，记录所有 compat 警告。这些警告会在阶段6处理。

- [ ] **Step 3: 运行测试**

Run:
```bash
yarn run unit
yarn run e2e
```

Expected: 测试通过（允许少量因 compat 层导致的失败）

- [ ] **Step 4: 提交**

```bash
git commit --allow-empty -m "chore(phase3): verify vue 3 with compat layer works"
```

---

## 阶段4: Vuex 3 → Pinia

### Task 4.1: 安装 Pinia 并创建 Store 基础结构

**Files:**
- Modify: `package.json`
- Create: `src/renderer/stores/index.js`

- [ ] **Step 1: 安装 Pinia**

Run:
```bash
yarn add pinia@^2.0
```

- [ ] **Step 2: 创建 Pinia 实例**

在 `src/renderer/main.js` 中添加：

```javascript
import { createPinia } from 'pinia'

const pinia = createPinia()
app.use(pinia)
```

- [ ] **Step 3: 创建 stores 目录**

```bash
mkdir -p src/renderer/stores
```

- [ ] **Step 4: 提交**

```bash
git add package.json yarn.lock src/renderer/main.js src/renderer/stores/
git commit -m "feat(phase4): install pinia and create store structure"
```

---

### Task 4.2: 迁移简单 Store 模块

**Files:**
- Create: `src/renderer/stores/notification.js`
- Create: `src/renderer/stores/tweet.js`
- Create: `src/renderer/stores/autoUpdates.js`

- [ ] **Step 1: 迁移 notification store**

读取 `src/renderer/store/notification.js`，转换为 Pinia store：

```javascript
// src/renderer/stores/notification.js
import { defineStore } from 'pinia'

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: []
  }),
  actions: {
    add(notification) {
      this.notifications.push(notification)
    },
    remove(id) {
      this.notifications = this.notifications.filter(n => n.id !== id)
    }
  }
})
```

- [ ] **Step 2: 迁移 tweet store**

```javascript
// src/renderer/stores/tweet.js
import { defineStore } from 'pinia'

export const useTweetStore = defineStore('tweet', {
  state: () => ({
    // 从原 Vuex tweet module 迁移 state
  }),
  actions: {
    // 迁移 actions
  }
})
```

- [ ] **Step 3: 迁移 autoUpdates store**

```javascript
// src/renderer/stores/autoUpdates.js
import { defineStore } from 'pinia'

export const useAutoUpdatesStore = defineStore('autoUpdates', {
  state: () => ({
    // 迁移 state
  }),
  actions: {
    // 迁移 actions
  }
})
```

- [ ] **Step 4: 提交**

```bash
git add src/renderer/stores/notification.js src/renderer/stores/tweet.js src/renderer/stores/autoUpdates.js
git commit -m "feat(phase4): migrate simple store modules to pinia"
```

---

### Task 4.3: 迁移复杂 Store 模块

**Files:**
- Create: `src/renderer/stores/editor.js`
- Create: `src/renderer/stores/preferences.js`
- Create: `src/renderer/stores/layout.js`
- Create: `src/renderer/stores/project.js`

- [ ] **Step 1: 迁移 editor store**

读取 `src/renderer/store/editor.js`（最复杂模块，1413行），转换为 Pinia：

```javascript
// src/renderer/stores/editor.js
import { defineStore } from 'pinia'
import { ipcRenderer } from 'electron'

export const useEditorStore = defineStore('editor', {
  state: () => ({
    tabs: [],
    currentFile: null,
    // ... 其他 state
  }),
  getters: {
    currentTab: (state) => {
      return state.tabs.find(t => t.id === state.currentFile?.id)
    },
    toc: (state) => {
      return state.currentFile?.toc || []
    }
  },
  actions: {
    async openFile(path) {
      // 迁移原 actions
    },
    async saveFile() {
      // 迁移原 actions
    },
    // ... 其他 actions
  }
})
```

- [ ] **Step 2: 迁移 preferences store**

```javascript
// src/renderer/stores/preferences.js
import { defineStore } from 'pinia'

export const usePreferencesStore = defineStore('preferences', {
  state: () => ({
    // 迁移 50+ 配置项
  }),
  actions: {
    async loadPreferences() {
      // 从 electron-store 加载
    },
    async savePreference(key, value) {
      // 保存到 electron-store
    }
  }
})
```

- [ ] **Step 3: 迁移 layout 和 project stores**

类似方式迁移 `layout.js` 和 `project.js`。

- [ ] **Step 4: 提交**

```bash
git add src/renderer/stores/editor.js src/renderer/stores/preferences.js src/renderer/stores/layout.js src/renderer/stores/project.js
git commit -m "feat(phase4): migrate complex store modules to pinia"
```

---

### Task 4.4: 更新组件使用 Pinia

**Files:**
- Modify: 所有使用 Vuex 的组件

- [ ] **Step 1: 更新组件导入**

在所有使用 `mapState`, `mapActions` 的组件中：

**修改前:**
```javascript
import { mapState, mapActions } from 'vuex'

export default {
  computed: {
    ...mapState('editor', ['tabs', 'currentFile'])
  },
  methods: {
    ...mapActions('editor', ['openFile', 'saveFile'])
  }
}
```

**修改后:**
```javascript
import { useEditorStore } from '@/stores/editor'
import { computed } from 'vue'

export default {
  setup() {
    const editorStore = useEditorStore()
    
    const tabs = computed(() => editorStore.tabs)
    const currentFile = computed(() => editorStore.currentFile)
    
    return {
      tabs,
      currentFile,
      openFile: editorStore.openFile,
      saveFile: editorStore.saveFile
    }
  }
}
```

- [ ] **Step 2: 批量更新组件**

按复杂度从低到高更新：
1. 简单展示组件（无状态操作）
2. 基础表单组件
3. 业务逻辑组件
4. 复杂页面组件

- [ ] **Step 3: 移除 Vuex**

确认所有组件都使用 Pinia 后：

Run:
```bash
yarn remove vuex
```

从 `main.js` 中移除 Vuex 相关代码。

- [ ] **Step 4: 提交**

```bash
git add src/renderer/
git commit -m "feat(phase4): update components to use pinia and remove vuex"
```

---

### Task 4.5: 验证阶段4

**Files:**
- 无修改，仅验证

- [ ] **Step 1: 启动开发环境**

Run:
```bash
yarn dev
```

- [ ] **Step 2: 验证状态管理**

手动测试：
- [ ] 打开文件，检查 editor store 更新
- [ ] 切换设置，检查 preferences store 更新
- [ ] 侧边栏展开/折叠，检查 layout store
- [ ] 多标签页切换

- [ ] **Step 3: 运行测试**

Run:
```bash
yarn run unit
yarn run e2e
```

- [ ] **Step 4: 提交**

```bash
git commit --allow-empty -m "chore(phase4): verify pinia migration works"
```

---

## 阶段5: Element UI → Element Plus

### Task 5.1: 安装 Element Plus

**Files:**
- Modify: `package.json`

- [ ] **Step 1: 安装 Element Plus**

Run:
```bash
yarn add element-plus@^2.0 @element-plus/icons-vue@^2.0
```

- [ ] **Step 2: 提交**

```bash
git add package.json yarn.lock
git commit -m "feat(phase5): install element plus and icons"
```

---

### Task 5.2: 配置 Element Plus 按需导入

**Files:**
- Modify: `vite.renderer.config.js`
- Modify: `src/renderer/main.js`

- [ ] **Step 1: 安装自动导入插件)**

Run:
```bash
yarn add -D unplugin-vue-components@^0.25 unplugin-auto-import@^0.16
```

- [ ] **Step 2: 配置 Vite 插件**

在 `vite.renderer.config.js` 中添加：

```javascript
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default (isDev = true) => ({
  plugins: [
    // ... 其他插件
    Components({
      resolvers: [ElementPlusResolver()]
    })
  ]
})
```

- [ ] **Step 3: 更新 main.js**

移除 Element UI 导入，添加 Element Plus（如需全局注册）：

```javascript
// 移除旧的 element-ui 导入
// import { Dialog, Form, ... } from 'element-ui'

// Element Plus 通过自动导入插件注册，无需手动 Vue.use
```

- [ ] **Step 4: 提交**

```bash
git add vite.renderer.config.js src/renderer/main.js package.json
git commit -m "feat(phase5): configure element plus auto import"
```

---

### Task 5.3: 迁移基础组件

**Files:**
- Modify: 使用 Element UI 的基础组件

- [ ] **Step 1: 迁移 Button, Input, Switch 等**

搜索使用 `el-button`, `el-input`, `el-switch` 的组件，这些组件 API 基本兼容，通常无需修改。

验证以下组件：
- `src/renderer/prefComponents/common/bool/index.vue`
- `src/renderer/prefComponents/common/textBox/index.vue`
- `src/renderer/prefComponents/common/select/index.vue`

- [ ] **Step 2: 更新图标引用**

搜索 `icon="xxx"` 属性，Element Plus 使用图标组件：

**修改前:**
```html
<el-button icon="el-icon-search">Search</el-button>
```

**修改后:**
```html
<el-button :icon="Search">Search</el-button>

<script>
import { Search } from '@element-plus/icons-vue'
export default {
  setup() {
    return { Search }
  }
}
</script>
```

- [ ] **Step 3: 提交**

```bash
git add src/renderer/prefComponents/common/
git commit -m "feat(phase5): migrate basic element ui components"
```

---

### Task 5.4: 迁移复杂组件

**Files:**
- Modify: 使用 Table, Tree, Dialog 等复杂组件的文件

- [ ] **Step 1: 迁移 Table 组件**

修改 `src/renderer/prefComponents/spellchecker/index.vue`:

Element Plus Table API 有少量 breaking changes：
- `slot-scope` → `v-slot` 或 `#default`
- 部分属性名称变更

**修改前:**
```html
<el-table :data="dictionaries">
  <el-table-column label="Language">
    <template slot-scope="scope">
      {{ scope.row.name }}
    </template>
  </el-table-column>
</el-table>
```

**修改后:**
```html
<el-table :data="dictionaries">
  <el-table-column label="Language">
    <template #default="scope">
      {{ scope.row.name }}
    </template>
  </el-table-column>
</el-table>
```

- [ ] **Step 2: 迁移 Tree 组件**

修改 `src/renderer/components/sideBar/tree.vue`:

Tree 组件 API 基本兼容，检查：
- `node-key` 属性
- `@node-click` 事件
- 自定义节点内容渲染

- [ ] **Step 3: 迁移 Dialog 组件**

搜索所有使用 `el-dialog` 的组件，检查：
- `visible` → `model-value` (v-model)
- `before-close` 回调签名

- [ ] **Step 4: 提交**

```bash
git add src/renderer/prefComponents/spellchecker/index.vue src/renderer/components/sideBar/tree.vue
git commit -m "feat(phase5): migrate complex element ui components"
```

---

### Task 5.5: 更新样式引用

**Files:**
- Modify: `src/renderer/assets/styles/index.css`
- Modify: `vite.renderer.config.js`

- [ ] **Step 1: 更新 CSS 引用**

Element Plus 的 CSS 路径与 Element UI 不同：

**修改前:**
```css
@import '~element-ui/lib/theme-chalk/index.css';
```

**修改后 (通过自动导入插件无需手动引入):**
```css
/* Element Plus 样式由 unplugin-vue-components 自动注入 */
```

- [ ] **Step 2: 处理自定义主题**

如有自定义 Element 主题，更新变量名称（部分变量在 Element Plus 中更名）。

- [ ] **Step 3: 提交**

```bash
git add src/renderer/assets/styles/index.css
git commit -m "feat(phase5): update element plus styles"
```

---

### Task 5.6: 验证阶段5

**Files:**
- 无修改，仅验证

- [ ] **Step 1: 启动开发环境**

Run:
```bash
yarn dev
```

- [ ] **Step 2: 视觉验证**

检查以下页面/组件：
- [ ] 设置面板所有控件正常显示
- [ ] 编辑器对话框正常弹出
- [ ] 侧边栏 Tree 组件正常渲染
- [ ] 拼写检查 Table 组件
- [ ] 图片上传组件
- [ ] 快捷键设置对话框
- [ ] 主题选择器

- [ ] **Step 3: 运行测试**

Run:
```bash
yarn run unit
yarn run e2e
```

- [ ] **Step 4: 移除 Element UI**

确认所有组件迁移完成后：

Run:
```bash
yarn remove element-ui
```

- [ ] **Step 5: 提交**

```bash
git commit --allow-empty -m "chore(phase5): verify element plus migration and remove element-ui"
```

---

## 阶段6: 移除兼容层 + Composition API 重构

### Task 6.1: 移除 @vue/compat

**Files:**
- Modify: `vite.renderer.config.js`
- Modify: `package.json`

- [ ] **Step 1: 移除 compat 别名**

在 `vite.renderer.config.js` 中：

```javascript
// 移除这行:
// 'vue$': '@vue/compat'
```

- [ ] **Step 2: 移除 compatConfig**

```javascript
// 移除 vue 插件配置中的 compatConfig:
plugins: [
  vue({
    // 移除 template.compilerOptions.compatConfig
  })
]
```

- [ ] **Step 3: 卸载 compat 包**

Run:
```bash
yarn remove @vue/compat
```

- [ ] **Step 4: 提交**

```bash
git add vite.renderer.config.js package.json yarn.lock
git commit -m "chore(phase6): remove @vue/compat layer"
```

---

### Task 6.2: 修复 compat 警告对应的代码

**Files:**
- Modify: 产生警告的组件

- [ ] **Step 1: 查看阶段3记录的 compat 警告**

读取 `docs/superpowers/plans/vue27-compat-report.md`，逐个修复警告。

- [ ] **Step 2: 常见修复项**

**data 选项必须是函数:**
```javascript
// 确保所有组件 data 是函数
export default {
  data() {
    return {
      // ...
    }
  }
}
```

**移除已废弃 API:**
- `Vue.set` / `Vue.delete` → 直接赋值（Vue 3 响应式自动检测）
- `$children` → 使用 `$refs` 或 provide/inject
- `$scopedSlots` → `$slots`

- [ ] **Step 3: 启动应用验证无警告**

Run:
```bash
yarn dev
```

Expected: 控制台无 Vue 警告

- [ ] **Step 4: 提交**

```bash
git add src/renderer/
git commit -m "fix(phase6): fix all compat warnings"
```

---

### Task 6.3: 重构简单组件为 <script setup>

**Files:**
- Modify: 简单组件（如 `devtools-button/index.vue`）

- [ ] **Step 1: 重构 devtools-button 组件**

**修改前:**
```vue
<template>
  <button class="devtools-btn" @click="openDevtools">
    DevTools
  </button>
</template>

<script>
import { ipcRenderer } from 'electron'

export default {
  methods: {
    openDevtools() {
      ipcRenderer.send('mt::open-devtools')
    }
  }
}
</script>
```

**修改后:**
```vue
<template>
  <button class="devtools-btn" @click="openDevtools">
    DevTools
  </button>
</template>

<script setup>
import { ipcRenderer } from 'electron'

const openDevtools = () => {
  ipcRenderer.send('mt::open-devtools')
}
</script>
```

- [ ] **Step 2: 重构其他简单组件**

类似方式重构：
- `src/renderer/components/loading/index.vue`
- `src/renderer/components/about/index.vue`
- `src/renderer/prefComponents/common/separator/index.vue`
- `src/renderer/prefComponents/common/titlebar.vue`

- [ ] **Step 3: 提交**

```bash
git add src/renderer/components/devtools-button/index.vue src/renderer/components/loading/index.vue
git commit -m "refactor(phase6): convert simple components to script setup"
```

---

### Task 6.4: 重构复杂组件为 <script setup>

**Files:**
- Modify: 复杂组件（如 `editorWithTabs/editor.vue`）

- [ ] **Step 1: 重构 editor.vue**

这是最复杂的组件（1384行）。使用 Composition API 重构：

```vue
<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useEditorStore } from '@/stores/editor'
import { usePreferencesStore } from '@/stores/preferences'

const editorStore = useEditorStore()
const preferencesStore = usePreferencesStore()

const editorRef = ref(null)
const markdown = computed(() => editorStore.currentFile?.markdown || '')

const handleInput = (content) => {
  editorStore.updateMarkdown(content)
}

// 迁移原 computed, methods, watch, lifecycle hooks

onMounted(() => {
  // 初始化逻辑
})

onUnmounted(() => {
  // 清理逻辑
})
</script>
```

- [ ] **Step 2: 重构其他复杂组件**

- `src/renderer/components/sideBar/index.vue`
- `src/renderer/components/commandPalette/index.vue`
- `src/renderer/pages/app.vue`
- `src/renderer/pages/preference.vue`

- [ ] **Step 3: 提交**

```bash
git add src/renderer/components/editorWithTabs/editor.vue
git commit -m "refactor(phase6): convert editor component to script setup"
```

---

### Task 6.5: 优化响应式系统使用

**Files:**
- Modify: 使用 Vue 3 响应式 API 的组件

- [ ] **Step 1: 使用 ref/reactive 优化**

在 `<script setup>` 组件中，确保正确使用：
- `ref()` 用于基本类型
- `reactive()` 用于对象
- `computed()` 用于计算属性
- `watch()` / `watchEffect()` 用于副作用

- [ ] **Step 2: 移除不必要的 Vue.observable 使用**

搜索 `Vue.observable` 并替换为 `reactive()`。

- [ ] **Step 3: 提交**

```bash
git add src/renderer/
git commit -m "refactor(phase6): optimize reactivity usage"
```

---

### Task 6.6: 最终验证

**Files:**
- 无修改，仅验证

- [ ] **Step 1: 启动开发环境**

Run:
```bash
yarn dev
```

Expected:
- 启动时间 < 5秒
- 热更新响应 < 1秒
- 无控制台警告

- [ ] **Step 2: 完整功能测试**

手动测试所有核心功能：
- [ ] 打开/保存 markdown 文件
- [ ] 编辑器 WYSIWYG 渲染
- [ ] 侧边栏文件树
- [ ] 多标签页管理
- [ ] 设置面板所有选项
- [ ] 导出功能
- [ ] 主题切换
- [ ] 拼写检查
- [ ] 图片上传
- [ ] 快捷键设置

- [ ] **Step 3: 运行所有测试**

Run:
```bash
yarn run test
```

Expected: 所有测试通过

- [ ] **Step 4: 生产构建**

Run:
```bash
yarn run build
```

Expected:
- 构建成功
- 打包体积相比之前减小或持平
- 打包后的应用正常运行

- [ ] **Step 5: 最终提交**

```bash
git commit --allow-empty -m "chore(phase6): final verification complete"
```

---

## 回退策略

每个阶段完成后都有独立 commit，如遇到问题可回退：

```bash
# 查看提交历史
git log --oneline

# 回退到特定阶段
git revert <commit-hash>
# 或
git checkout <phase-stable-tag>
```

建议在每个阶段完成后打标签：

```bash
git tag phase1-vite-complete
git tag phase2-vue27-complete
git tag phase3-vue3-compat-complete
git tag phase4-pinia-complete
git tag phase5-element-plus-complete
git tag phase6-final-complete
```

---

## 验证清单

完成所有阶段后，确认以下标准：

- [ ] 所有 6 个阶段完成
- [ ] 应用功能完整，无回归
- [ ] 现有测试套件通过
- [ ] 打包体积减小或持平
- [ ] 开发服务器启动时间 < 5秒
- [ ] 热更新响应时间 < 1秒
- [ ] 无 @vue/compat 依赖
- [ ] 所有组件使用 `<script setup>` 或 Options API（混合允许）
- [ ] 使用 Pinia 进行状态管理
- [ ] 使用 Element Plus 作为 UI 库
