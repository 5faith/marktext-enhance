## Why

标题栏中水平菜单、标题和字数统计在同一行（32px高度），导致元素重叠，影响用户体验。需要将布局改为两行，并为字数统计弹窗增加透明度以符合设计规范。

## What Changes

- 标题栏高度从 32px 增加到 64px（两行布局）
- 第一行：水平菜单（左侧） + 窗口控制按钮（右侧）
- 第二行：字数统计（左侧） + 标题（居中）
- 字数统计弹窗背景增加透明度（使用 rgba 格式，90% 不透明度）

## Capabilities

### New Capabilities
- `title-bar-two-row-layout`: 标题栏两行布局，分离菜单和标题/字数统计

### Modified Capabilities

## Impact

- `src/renderer/components/titleBar/index.vue` - 标题栏组件模板和样式
- `src/renderer/assets/styles/index.css` - `--titleBarHeight` CSS 变量
- `src/renderer/pages/preference.vue` - 使用 `--titleBarHeight` 的地方
- `src/renderer/components/editorWithTabs/sourceCode.vue` - 使用 `--titleBarHeight` 的地方
