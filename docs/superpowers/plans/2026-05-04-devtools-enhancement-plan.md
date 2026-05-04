# DevTools 增强功能实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 MarkText 添加 DevTools 增强功能，包括 dev 模式自动打开 DevTools 和全局 Developer-Mode 按钮

**Architecture:** 使用 IPC 通信模式，renderer 端发送消息到 main process 打开 DevTools，dev 模式在窗口加载完成后自动打开

**Tech Stack:** Electron 15.x, Vue 2, IPC

---

## 文件结构

| 文件 | 操作 | 职责 |
|------|------|------|
| `src/main/windows/editor.js` | 修改 | 添加 dev 模式自动打开 DevTools 逻辑 |
| `src/main/app/index.js` | 修改 | 添加 IPC handler 处理打开 DevTools 请求 |
| `src/renderer/components/devtools-button/index.vue` | 创建 | Developer-Mode 按钮组件 |
| `src/renderer/components/editorWithTabs/index.vue` | 修改 | 集成 Developer-Mode 按钮到主界面 |

---

### Task 1: Dev 模式自动打开 DevTools

**Files:**
- Modify: `src/main/windows/editor.js:78-108`

- [ ] **Step 1: 在 did-finish-load 事件中添加自动打开 DevTools 逻辑**

在 `src/main/windows/editor.js` 的 `createWindow()` 方法中，找到 `did-finish-load` 事件处理函数（约第 78 行），在 `this.emit('window-ready')` 之后添加：

```javascript
win.webContents.once('did-finish-load', () => {
  this.lifecycle = WindowLifecycle.READY
  this.emit('window-ready')

  // 开发模式自动打开 DevTools
  if (process.env.NODE_ENV === 'development') {
    win.webContents.openDevTools()
  }

  // Restore and focus window
  this.bringToFront()
  // ... 其余代码保持不变
```

- [ ] **Step 2: 验证修改**

运行 `yarn dev`，确认窗口打开时 DevTools 自动显示。

- [ ] **Step 3: Commit**

```bash
git add src/main/windows/editor.js
git commit -m "feat: auto open devtools in development mode"
```

---

### Task 2: IPC Handler (Main Process)

**Files:**
- Modify: `src/main/app/index.js:530-567` (在 `_listenForIpcMain()` 方法末尾添加)

- [ ] **Step 1: 添加 IPC handler**

在 `src/main/app/index.js` 的 `_listenForIpcMain()` 方法末尾（约第 567 行，`mt::make-screenshot` handler 之后）添加：

```javascript
ipcMain.on('mt::open-devtools', e => {
  const win = BrowserWindow.fromWebContents(e.sender)
  if (win) {
    win.webContents.openDevTools()
  }
})
```

- [ ] **Step 2: Commit**

```bash
git add src/main/app/index.js
git commit -m "feat: add IPC handler for opening devtools"
```

---

### Task 3: Developer-Mode 按钮组件

**Files:**
- Create: `src/renderer/components/devtools-button/index.vue`

- [ ] **Step 1: 创建组件目录和文件**

创建 `src/renderer/components/devtools-button/index.vue`：

```vue
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
```

- [ ] **Step 2: Commit**

```bash
git add src/renderer/components/devtools-button/index.vue
git commit -m "feat: create DevtoolsButton component"
```

---

### Task 4: 集成按钮到主界面

**Files:**
- Modify: `src/renderer/components/editorWithTabs/index.vue`

- [ ] **Step 1: 导入组件**

在 `src/renderer/components/editorWithTabs/index.vue` 的 `<script>` 部分添加导入：

```javascript
import DevtoolsButton from 'renderer/components/devtools-button'
```

在 `components` 选项中注册组件：

```javascript
export default {
  components: {
    // ... 现有组件
    DevtoolsButton
  },
  // ... 其余代码
}
```

- [ ] **Step 2: 在模板中添加按钮**

在模板的根元素中添加 `<devtools-button />`，确保它在最外层：

```vue
<template>
  <div class="editor-with-tabs">
    <!-- 现有内容 -->
    <title-bar />
    <side-bar />
    <tabs />
    <!-- ... 其他组件 -->
    
    <!-- Developer-Mode 按钮 -->
    <devtools-button />
  </div>
</template>
```

- [ ] **Step 3: 验证集成**

运行 `yarn dev`，确认：
1. 窗口右下角显示 "Developer-Mode" 按钮
2. 点击按钮后 DevTools 打开

- [ ] **Step 4: Commit**

```bash
git add src/renderer/components/editorWithTabs/index.vue
git commit -m "feat: integrate DevtoolsButton into main interface"
```

---

### Task 5: 测试与验证

- [ ] **Step 1: Dev 模式测试**

```bash
yarn dev
```

验证：
- [ ] 窗口打开时 DevTools 自动显示
- [ ] 右下角显示 "Developer-Mode" 按钮
- [ ] 点击按钮后 DevTools 打开（如果已关闭）

- [ ] **Step 2: Prod 模式测试**

```bash
yarn build:bin
```

验证：
- [ ] 窗口打开时 DevTools 不自动显示
- [ ] 右下角显示 "Developer-Mode" 按钮
- [ ] 点击按钮后 DevTools 打开

- [ ] **Step 3: Lint 检查**

```bash
yarn run lint
```

如有错误，运行：

```bash
yarn run lint:fix
```

- [ ] **Step 4: 最终 Commit**

```bash
git add .
git commit -m "test: verify devtools enhancement functionality"
```

---

## 注意事项

1. **代码风格**: 遵循项目现有的 2-space indent, LF line endings, no semicolons 规范
2. **Electron 版本**: 项目使用 Electron 15.x，确保 API 兼容
3. **IPC 通信**: 使用 `ipcRenderer.send` 而非 `@electron/remote`，符合最佳实践
4. **按钮样式**: 使用 fixed 定位确保在所有界面元素之上，z-index: 9999
