# Element UI 使用情况审计

## 审计日期
2026-05-17

## 概述
项目已基本从 Element UI 迁移到 Element Plus，但仍残留部分 Element UI 引用（主要是 CSS 主题处理）。

---

## 一、依赖信息 (package.json)

| 依赖 | 版本 | 状态 |
|------|------|------|
| `element-ui` | `^2.15.7` | 仍在 dependencies 中 |
| `element-plus` | `^2.0` | 主 UI 库 |
| `@element-plus/icons-vue` | `^2.0` | Element Plus 图标 |

## 二、直接引用 element-ui 的文件 (共 2 个源文件)

### 1. `src/renderer/shims/element-ui-css.js`
- **用途**: Vite shim，将 element-ui CSS 内容以字符串形式导出
- **导入**: `import elementUiCss from 'element-ui/lib/theme-chalk/index.css?inline'`

### 2. `src/renderer/util/theme.js`
- **用途**: 运行时主题色替换，读取 element-ui CSS 后替换颜色变量
- **导入**: `import elementStyle from 'element-ui/lib/theme-chalk/index.css?inline'`
- **导出函数**: `addElementStyle()` - 将处理后的 element-ui CSS 注入 DOM
- **调用位置**: `src/renderer/main.js` 第 62 行调用 `addElementStyle()`

## 三、构建配置中的 element-ui 引用

### 1. `vite.config.js`
- **别名 (第 28 行)**: `'element-ui/lib/theme-chalk/index.css'` → `src/renderer/shims/element-ui-css.js`
- **依赖优化 (第 187 行)**: `optimizeDeps.include` 包含 `'element-ui'`
- **注意**: 已使用 `ElementPlusResolver()` 自动导入 Element Plus 组件

### 2. `babel.config.js`
- **第 45-48 行**: renderer 环境使用 `babel-plugin-component`，配置 `libraryName: 'element-ui'`，`style: false`
- **注意**: 这是旧 Webpack 打包的遗留配置，Vite 构建时可能未使用

### 3. `tools/generateThirdPartyLicense.js`
- **第 31 行**: 仅注释中提到 element-ui（无功能影响）

## 四、CSS 样式覆盖 (element-ui 类名)

以下 CSS 文件覆盖了 element-ui 的样式类名：

### `src/renderer/assets/styles/index.css`
覆盖的类名:
- `.el-tooltip__popper` (3 处)
- `.el-button`, `.el-button:hover`, `.el-button:active`, `.el-button:focus` (多个变体)
- `.el-button--primary` 及其各种状态
- `.el-slider__button`, `.el-slider__bar`
- `.el-dialog`, `.el-dialog__header`, `.el-dialog.ag-dialog-*`
- `input.el-input__inner`
- `.el-input-number.is-controls-*`
- `.el-tabs__nav-wrap::after`
- `div.el-tabs__item`, `div.el-tab-pane`
- `.el-button.disabled`, `.el-button[disabled]`
- `.el-button.small`, `.el-button.tiny`

### `src/renderer/assets/themes/one-dark.theme.css`
覆盖的类名:
- `.el-dialog`, `.el-dialog.ag-dialog-*`
- `.el-button:focus`, `.el-button--primary:focus`

## 五、Vue 模板中使用的 el-* 组件 (共 24 个文件)

所有这些组件通过 `ElementPlusResolver` 自动导入到 Element Plus，**不是**从 Element UI 导入。

### 组件使用频率统计

| 组件 | 使用次数 |
|------|---------|
| el-button | 16 |
| el-icon | 14 |
| el-input | 14 |
| el-dialog | 8 |
| el-tab | 6 |
| el-tooltip | 5 |
| el-radio | 4 |
| el-table | 4 |
| el-col | 4 |
| el-form | 3 |
| el-autocomplete | 2 |
| el-select | 1 |
| el-slider | 1 |
| el-switch | 1 |
| el-option | 1 |
| el-checkbox | 1 |
| el-tabs | 1 |
| el-row | 1 |
| el-tree | 1 |

### 使用 el-* 组件的文件列表

| 文件 | 组件数量 |
|------|---------|
| `components/exportSettings/index.vue` | 14 |
| `prefComponents/keybindings/index.vue` | 13 |
| `prefComponents/image/components/uploader/index.vue` | 9 |
| `components/editorWithTabs/editor.vue` | 8 |
| `components/about/index.vue` | 6 |
| `prefComponents/general/index.vue` | 5 |
| `prefComponents/common/bool/index.vue` | 4 |
| `prefComponents/common/select/index.vue` | 3 |
| `prefComponents/common/fontTextBox/index.vue` | 3 |
| `prefComponents/sideBar/index.vue` | 2 |
| `prefComponents/common/range/index.vue` | 2 |
| `prefComponents/common/textBox/index.vue` | 2 |
| `prefComponents/image/components/folderSetting/index.vue` | 2 |
| `prefComponents/image/index.vue` | 2 |
| `prefComponents/theme/index.vue` | 2 |
| `components/sideBar/search.vue` | 2 |
| `components/search/index.vue` | 2 |
| `components/tweet/index.vue` | 1 |
| `components/rename/index.vue` | 1 |
| `components/import/index.vue` | 1 |
| `components/commandPalette/index.vue` | 1 |
| `components/sideBar/toc.vue` | 1 |
| `prefComponents/keybindings/key-input-dialog.vue` | 1 |
| `prefComponents/image/components/uploader/legalNoticesCheckbox.vue` | 1 |

## 六、总结

**Element UI 的残留仅限 CSS 层面**:

1. **必须处理的核心文件**:
   - `src/renderer/shims/element-ui-css.js` — CSS shim
   - `src/renderer/util/theme.js` — 主题色替换逻辑（最关键）
   - `vite.config.js` — CSS 别名和 optimizeDeps

2. **Vue 模板组件已全部使用 Element Plus**:
   - 所有 `el-*` 标签通过 `ElementPlusResolver()` 自动导入
   - 不存在直接从 `element-ui` 导入组件的代码

3. **CSS 兼容性问题**:
   - Element Plus 的 CSS 类名结构与 Element UI 基本相同，但有些差异
   - 现有的 CSS 覆盖（`index.css`, `one-dark.theme.css`）需要适配 Element Plus 的 CSS 类名
