## Overview

MarkText 是一个基于 Electron 35 + Vue 3 + Vite 5 的下一代所见即所得 Markdown 编辑器。主题系统采用 CSS 变量实现，支持 6 种内置主题，通过动态切换 `:root` 变量实现主题切换。

**主题系统核心特点：**
- 所有主题变量定义在 `:root` 选择器中
- 主题文件位于 `src/renderer/assets/themes/`
- 通过 `theme.js` 中的 `addThemeStyle()` 函数动态应用
- 支持亮色和暗色主题变体
- 主题颜色通过 `themeColor.js` 统一导出

## Colors

### Theme Colors

每个主题都定义了主题色及其 10 级透明度变体：

| Token | Description | Example (dark) |
|---|---|---|
| `--themeColor` | 主题主色 | `#409eff` |
| `--themeColor90` | 90% 透明度 | `rgba(64, 158, 255, .9)` |
| `--themeColor80` | 80% 透明度 | `rgba(64, 158, 255, .8)` |
| `--themeColor70` | 70% 透明度 | `rgba(64, 158, 255, .7)` |
| `--themeColor60` | 60% 透明度 | `rgba(64, 158, 255, .6)` |
| `--themeColor50` | 50% 透明度 | `rgba(64, 158, 255, .5)` |
| `--themeColor40` | 40% 透明度 | `rgba(64, 158, 255, .4)` |
| `--themeColor30` | 30% 透明度 | `rgba(64, 158, 255, .3)` |
| `--themeColor20` | 20% 透明度 | `rgba(64, 158, 255, .2)` |
| `--themeColor10` | 10% 透明度 | `rgba(64, 158, 255, .1)` |

### Editor Colors

编辑器文本颜色及其透明度变体：

| Token | Description | Example (dark) |
|---|---|---|
| `--editorColor` | 主要文本颜色 | `rgba(255, 255, 255, .7)` |
| `--editorColor80` | 80% 透明度 | `rgba(255, 255, 255, .8)` |
| `--editorColor60` | 60% 透明度 | `rgba(255, 255, 255, .6)` |
| `--editorColor50` | 50% 透明度 | `rgba(255, 255, 255, .5)` |
| `--editorColor40` | 40% 透明度 | `rgba(255, 255, 255, .4)` |
| `--editorColor30` | 30% 透明度 | `rgba(255, 255, 255, .3)` |
| `--editorColor10` | 10% 透明度 | `rgba(255, 255, 255, .1)` |
| `--editorColor04` | 4% 透明度 | `rgba(255, 255, 255, .04)` |

### Background Colors

| Token | Description | Example (dark) |
|---|---|---|
| `--editorBgColor` | 编辑器背景色 | `#282828` |
| `--codeBgColor` | 行内代码背景 | `#424344` |
| `--codeBlockBgColor` | 代码块背景 | `#424344` |
| `--inputBgColor` | 输入框背景 | `#2f3336` |
| `--footnoteBgColor` | 脚注背景 | `rgba(66, 67, 68, .3)` |

### Special Colors

| Token | Description | Example (dark) |
|---|---|---|
| `--highlightColor` | 高亮颜色 | `rgba(102, 177, 255, .6)` |
| `--highlightThemeColor` | 主题高亮颜色 | `var(--themeColor)` |
| `--selectionColor` | 选区颜色 | `rgba(102, 177, 255, .3)` |
| `--deleteColor` | 删除颜色 | `#409eff` |
| `--iconColor` | 图标颜色 | `rgba(255, 255, 255, .56)` |
| `--focusColor` | 焦点颜色 | `var(--themeColor)` |
| `--tableBorderColor` | 表格边框颜色 | `#363839` |

### Notification Colors

| Token | Description | Example (light) |
|---|---|---|
| `--notificationPrimaryColor` | 通知主要颜色 | `#ffffff` |
| `--notificationPrimaryBg` | 通知主要背景 | `var(--themeColor)` |
| `--notificationInfoColor` | 通知信息颜色 | `#ffffff` |
| `--notificationInfoBg` | 通知信息背景 | `#909399` |
| `--notificationWarningColor` | 通知警告颜色 | `#ffffff` |
| `--notificationWarningBg` | 通知警告背景 | `#ff8800` |
| `--notificationErrorColor` | 通知错误颜色 | `#ffffff` |
| `--notificationErrorBg` | 通知错误背景 | `#ff6969` |

## Typography

### Font Family

| Token | Description | Default Value |
|---|---|---|
| `--editorFontFamily` | 编辑器字体 | `"Open Sans", "Clear Sans", "Helvetica Neue", Helvetica, Arial, sans-serif` |
| `--codeFontFamily` | 代码字体 | `"DejaVu Sans Mono", "Source Code Pro", "Droid Sans Mono", monospace` |

### Font Size

| Token | Description | Default Value |
|---|---|---|
| `--codeFontSize` | 代码字体大小 | `14px` |

## Buttons

### Standard Button

| Token | Description | Example (dark) |
|---|---|---|
| `--buttonFontColor` | 按钮字体颜色 | `rgba(255, 255, 255, .6)` |
| `--buttonBgColor` | 按钮背景色 | `#424344` |
| `--buttonBorder` | 按钮边框 | `1px solid rgba(0, 0, 0, 0.2)` |
| `--buttonShadow` | 按钮阴影 | `none` |
| `--buttonFontColorHover` | 悬停字体颜色 | `var(--buttonFontColor)` |
| `--buttonBgColorHover` | 悬停背景色 | `#4f5051` |
| `--buttonBorderHover` | 悬停边框 | `1px solid rgba(0, 0, 0, 0.3)` |
| `--buttonFontColorActive` | 激活字体颜色 | `var(--buttonFontColor)` |
| `--buttonBgColorActive` | 激活背景色 | `#333434` |
| `--buttonBorderActive` | 激活边框 | `var(--buttonBorder)` |

### Primary Button

| Token | Description | Example (dark) |
|---|---|---|
| `--buttonPrimaryFontColor` | 主要按钮字体颜色 | `#ffffff` |
| `--buttonPrimaryBgColor` | 主要按钮背景色 | `var(--themeColor)` |
| `--buttonPrimaryBorder` | 主要按钮边框 | `none` |
| `--buttonPrimaryShadow` | 主要按钮阴影 | `none` |
| `--buttonPrimaryFontColorHover` | 悬停字体颜色 | `var(--buttonPrimaryFontColor)` |
| `--buttonPrimaryBgColorHover` | 悬停背景色 | `#5aabff` |
| `--buttonPrimaryBorderHover` | 悬停边框 | `var(--buttonPrimaryBorder)` |
| `--buttonPrimaryFontColorActive` | 激活字体颜色 | `var(--buttonPrimaryFontColor)` |
| `--buttonPrimaryBgColorActive` | 激活背景色 | `#2791ff` |
| `--buttonPrimaryBorderActive` | 激活边框 | `var(--buttonPrimaryBorder)` |
| `--buttonPrimaryFocusBorder` | 焦点边框 | `none` |
| `--buttonPrimaryFocusShadow` | 焦点阴影 | `inset 0 0 0 1px rgba(24, 26, 31, 0.5), 0 0 0 1px var(--themeColor)` |

## Sidebar

| Token | Description | Example (dark) |
|---|---|---|
| `--sideBarColor` | 侧边栏颜色 | `rgba(255, 255, 255, .6)` |
| `--sideBarIconColor` | 侧边栏图标颜色 | `var(--iconColor)` |
| `--sideBarTitleColor` | 侧边栏标题颜色 | `rgba(255, 255, 255, .8)` |
| `--sideBarTextColor` | 侧边栏文本颜色 | `rgba(255, 255, 255, .4)` |
| `--sideBarBgColor` | 侧边栏背景色 | `#1e1e1e` |
| `--sideBarItemHoverBgColor` | 侧边栏项悬停背景 | `rgba(255, 255, 255, .03)` |
| `--itemBgColor` | 项目背景色 | `#3f3f3f` |

## Float & Overlay

| Token | Description | Example (dark) |
|---|---|---|
| `--floatFontColor` | 浮动元素字体颜色 | `rgba(255, 255, 255, .7)` |
| `--floatBgColor` | 浮动元素背景色 | `#3f3f3f` |
| `--floatHoverColor` | 浮动元素悬停颜色 | `rgba(255, 255, 255, .04)` |
| `--floatBorderColor` | 浮动元素边框颜色 | `rgba(0, 0, 0, .05)` |
| `--floatShadow` | 浮动元素阴影 | `rgba(0, 0, 0, 0.2)` |
| `--maskColor` | 遮罩颜色 | `rgba(0, 0, 0, .7)` |

## Layout

| Token | Description | Default Value |
|---|---|---|
| `--editorAreaWidth` | 编辑器区域宽度 | `750px` |

## Themes

### Theme List

| Theme | Type | Theme Color | Description |
|---|---|---|---|
| `light` | Light | `#409EFF` | 默认浅色主题 |
| `dark` | Dark | `#409EFF` | 深色主题 |
| `graphite` | Light | `rgb(104, 134, 170)` | 石墨主题 |
| `material-dark` | Dark | `#f48237` | Material 深色主题 |
| `ulysses` | Light | `#f48237` | Ulysses 主题 |
| `one-dark` | Dark | `rgba(77, 120, 204, 1)` | One Dark 主题 |

### Theme Files

```
src/renderer/assets/themes/
├── dark.theme.css           # 深色主题
├── graphite.theme.css       # 石墨主题
├── material-dark.theme.css  # Material 深色主题
├── one-dark.theme.css       # One Dark 主题
├── ulysses.theme.css        # Ulysses 主题
├── codemirror/              # CodeMirror 主题
│   └── one-dark.css
├── prismjs/                 # Prism.js 代码高亮主题
│   ├── dark.theme.css
│   └── one-dark.theme.css
└── export/                  # 导出主题
    ├── academic.theme.css
    └── liber.theme.css
```

## Components

### Editor Tabs

编辑器标签页样式：

```css
.editor-tabs {
  box-shadow: none !important;
}
.editor-tabs:after {
  position: absolute;
  content: '';
  border-bottom: 1px solid {border-color};
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1;
}
.tabs-container > li,
.tabs-container > li.active {
  background: var(--editorBgColor) !important;
}
```

### Code Blocks

代码块样式：

```css
:not(pre) > code[class*="language-"],
pre:not(.CodeMirror-line),
pre[class*="language-"],
pre.ag-paragraph {
  background: var(--codeBlockBgColor) !important;
  border: none !important;
}
```

### Task List

任务列表样式：

```css
li.ag-task-list-item {
  list-style-type: none;
  position: relative;
}
li.ag-task-list-item > input[type=checkbox] {
  position: absolute;
  cursor: pointer;
  width: 16px;
  height: 16px;
  top: .1em;
  transform: rotate(-90deg);
  margin: 0;
  left: -24px;
  transform-origin: center;
  transition: all .2s ease;
}
```

### Horizontal Rule

水平线样式：

```css
p:not(.ag-active)[data-role="hr"]::before {
  border-top: 2px dashed var(--editorColor10) !important;
  background: none !important;
}
```

## Do's and Don'ts

### Do

- 使用 CSS 变量定义所有主题相关的颜色和样式
- 为每个主题定义完整的变量集（包括所有透明度变体）
- 保持所有主题的变量结构一致
- 使用 `patchTheme()` 函数包装主题 CSS 以支持打印
- 为亮色和暗色主题分别优化对比度

### Don't

- 不要在主题文件中使用硬编码的颜色值（除了特殊情况如滚动条）
- 不要修改其他主题的变量结构
- 不要在组件中直接使用主题颜色，应使用 CSS 变量
- 不要忘记定义变量的透明度变体

## Iteration Guide

1. **添加新主题**：在 `src/renderer/assets/themes/` 创建新的 `.theme.css` 文件
2. **导出主题**：在 `themeColor.js` 中导入并导出主题函数
3. **注册主题**：在 `theme.js` 的 `addThemeStyle()` 中添加新的 case
4. **配置主题**：在 `prefComponents/theme/config.js` 中添加主题选项
5. **更新默认值**：如需要，在 `stores/preferences.js` 中更新默认主题

## Known Gaps

- 主题变量命名不一致（有些使用 `--button` 前缀，有些使用 `--sideBar` 前缀）
- 部分主题缺少某些变量定义
- 导出主题（export/）的变量定义不完整
- CodeMirror 和 Prism.js 主题与主主题的集成方式不统一
- 缺少主题切换的过渡动画定义
