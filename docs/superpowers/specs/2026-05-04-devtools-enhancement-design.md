# DevTools 增强功能设计

## 概述

为 MarkText 添加开发工具增强功能，包括：
1. dev 模式启动时自动打开 DevTools
2. 在窗口右下角添加 Developer-Mode 按钮，可随时打开 DevTools
3. 支持 dev 和 prod 两种环境

## 需求

- **DEV-1**: `yarn dev` 启动时自动打开 Chrome DevTools
- **DEV-2**: 窗口右下角显示 "Developer-Mode" 按钮
- **DEV-3**: 点击按钮后打开 DevTools
- **DEV-4**: 按钮在 dev 和 prod 模式下都显示

## 架构

### 1. Dev 模式自动打开 DevTools

**文件**: `src/main/windows/editor.js`

**实现位置**: `createWindow()` 方法中的 `did-finish-load` 事件处理函数

**逻辑**:
```
当 window 加载完成时:
  如果 process.env.NODE_ENV === 'development':
    调用 win.webContents.openDevTools()
```

### 2. Developer-Mode 按钮组件

**文件**: `src/renderer/components/devtools-button/index.vue` (新建)

**组件职责**:
- 渲染固定在窗口右下角的按钮
- 监听点击事件，发送 IPC 消息到 main process

**组件结构**:
- 使用 Vue 2 单文件组件格式
- 通过 `ipcRenderer.send('mt::open-devtools')` 发送消息
- 使用 fixed 定位，z-index: 9999 确保在最上层
- 样式使用半透明黑色背景，白色文字

### 3. IPC Handler (Main Process)

**文件**: `src/main/app/index.js`

**实现位置**: `_listenForIpcMain()` 方法

**逻辑**:
```
监听 'mt::open-devtools' 消息:
  从事件 sender 获取 BrowserWindow 实例
  调用 win.webContents.openDevTools()
```

### 4. 集成到主界面

**文件**: `src/renderer/components/editorWithTabs/index.vue`

**实现**:
- 导入 DevtoolsButton 组件
- 在模板中添加 `<devtools-button />` 元素

## 环境配置

项目已使用 `NODE_ENV` 区分环境：

| 命令 | NODE_ENV | 说明 |
|------|----------|------|
| `yarn dev` | development | 开发模式，自动打开 DevTools |
| `yarn build` | production | 生产打包模式 |

无需额外配置。

## 数据流

```
用户点击 Developer-Mode 按钮
  ↓
renderer: ipcRenderer.send('mt::open-devtools')
  ↓
main: ipcMain.on('mt::open-devtools', callback)
  ↓
main: BrowserWindow.openDevTools()
  ↓
窗口显示 DevTools 面板
```

## 测试

### 手动测试

1. **Dev 模式自动打开**:
   - 运行 `yarn dev`
   - 验证窗口打开时 DevTools 自动显示

2. **按钮显示**:
   - 在 dev 和 prod 模式下分别启动应用
   - 验证右下角显示 "Developer-Mode" 按钮

3. **按钮功能**:
   - 点击按钮
   - 验证 DevTools 窗口打开

### 注意事项

- DevTools 打开方式（detach/undocked）使用 Electron 默认行为
- 按钮样式需适配深色/浅色主题
- 按钮不应遮挡其他 UI 元素
