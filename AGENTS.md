# MarkText — Agent Guidelines

Next-gen WYSIWYG Markdown editor built with Electron 28 + Vue 3 + Vite 5.

> **Migration Note**: Migrated from Vue 2/Webpack to Vue 3/Vite. See [`docs/dev/VUE3_MIGRATION.md`](docs/dev/VUE3_MIGRATION.md).

---

## Quick Start

### Prerequisites

- **Node.js** >= 22
- **yarn** package manager
- **Python** 3.6+ and C++ build tools (for native modules)
- **Linux only**: `libx11-dev libxkbfile-dev libsecret-1-dev libfontconfig-dev`

### Installation

```bash
yarn install    # Slow first run: runs preinstall, rebuild, lint:fix hooks
```

### Development Commands

| Command | Description |
|---------|-------------|
| `yarn dev` | Start Vite dev server with hot-reload |
| `yarn build` | Production build + electron-builder package |
| `yarn build:bin` | Build + electron-builder --dir (faster, no full package) |
| `yarn build:dev` | Vite build in development mode |
| `yarn build:clean` | Clean dist directory |
| `yarn preview` | Preview production build |
| `yarn lint` / `yarn lint:fix` | Run ESLint on src/ and test/ |
| `yarn unit` | Unit tests (Karma + Mocha + Chai in Electron) |
| `yarn e2e` | E2E tests (Playwright, requires build first) |
| `yarn test` | Run all tests (unit + e2e) |
| `yarn test:specs` | CommonMark + GFM compliance tests |
| `yarn build:muya` | Build muya sub-package (Webpack) |

---

## Architecture

### Directory Structure

```
src/
├── common/      # Shared Node.js APIs (no Electron), usable from main/ and renderer/
├── main/        # Electron main process (entry: src/main/index.js)
├── renderer/    # Electron renderer (Vue 3 per window, entry: src/renderer/main.js)
└── muya/        # Markdown editor core (browser JS only, no Electron/Node APIs)
```

**Key Points:**
- Each editor window spawns its own renderer process
- Main ↔ renderer communication via IPC
- Built entry point: `./dist/electron/main.js`

### Technology Stack

| Component | Version | Notes |
|-----------|---------|-------|
| Electron | 28 | **Pinned** — native modules break on upgrade |
| Vue | 3.4+ | Composition API (`<script setup>`) for new components |
| Vue Router | 4 | - |
| Pinia | 2.0 | **Primary** state management (Vuex migration complete) |
| Element Plus | 2.0 | Primary UI library |
| Vite | 5 | Primary build tool |

### Build System

- **Primary**: Vite 5 (`vite.config.js`, `vite.test.config.js`)
- **Plugins**: `vite-plugin-electron` + `vite-plugin-electron-renderer`
- **Muya**: `src/muya/vite.config.js` (Vite library mode)
- **Packaging**: `electron-builder.yml` (standalone)
- **Config**: `asar: true` (native `.node` files unpacked), `cross-env` required for Windows

### State Management

- **Location**: `src/renderer/stores/`
- **Library**: Pinia 2.0
- **Status**: Vuex migration complete — all stores now use Pinia

### Muya Sub-package

- **Location**: `src/muya/`
- **Build**: `yarn build:muya` (uses own `vite.config.js`)
- **Constraint**: **Must not** import Electron/Node.js APIs
- **ESLint**: Ignores `src/muya/dist/` and `src/muya/vite.config.js`

---

## Development Standards

### Code Style

- **Indentation**: 2 spaces
- **Line endings**: LF
- **Semicolons**: No semicolons
- **ESLint**: `standard` + `eslint-plugin-vue`
- **Import aliases**:
  - `common/` — shared utilities
  - `@/` — renderer-specific
  - `muya/` — markdown core

### Testing

| Suite | Location | Framework | Config |
|-------|----------|-----------|--------|
| Unit | `test/unit/` | Karma + Mocha + Chai | `karma.conf.js` |
| E2E | `test/e2e/` | Playwright | `playwright.config.js` |
| Specs | `test/specs/` | CommonMark + GFM | - |

### Submission Guidelines

- **Branch**: Submit PRs to **`develop`** branch
- **Title format**: `fix: #<issue> <short message>`
- **Features**: Open a suggestion issue before implementing new features

---

## Important Notes

- `yarn install` is slow due to preinstall, rebuild, and lint:fix hooks
- Electron 28 is pinned — upgrading requires testing all native modules
- `package.json` has no `engines` field; Node >=22 requirement documented in `docs/dev/BUILD.md`
- `resolutions` field pins: `cld`, `node-abi`, `node-addon-api`, `turndown`, `snabbdom`

---

## Design System

> **Full Reference**: See [`DESIGN.md`](DESIGN.md) for complete design specifications.

### Theme System

主题系统采用 CSS 变量实现，支持 6 种内置主题，通过动态切换 `:root` 变量实现主题切换。

**核心特点：**
- 所有主题变量定义在 `:root` 选择器中
- 主题文件位于 `src/renderer/assets/themes/`
- 通过 `theme.js` 中的 `addThemeStyle()` 函数动态应用
- 主题颜色通过 `themeColor.js` 统一导出

### Required CSS Variables

每个主题必须定义以下变量集：

**主题色（10级透明度变体）：**
```css
--themeColor, --themeColor90 ~ --themeColor10
--highlightThemeColor
```

**编辑器色（8级透明度变体）：**
```css
--editorColor, --editorColor80 ~ --editorColor04
```

**背景色：**
```css
--editorBgColor, --codeBgColor, --codeBlockBgColor, --inputBgColor, --footnoteBgColor
```

**特殊色：**
```css
--highlightColor, --selectionColor, --deleteColor, --iconColor, --focusColor, --tableBorderColor
```

**按钮样式：**
```css
--buttonFontColor, --buttonBgColor, --buttonBorder, --buttonShadow
--buttonFontColorHover, --buttonBgColorHover, --buttonBorderHover
--buttonFontColorActive, --buttonBgColorActive, --buttonBorderActive
--buttonFocusBorder
--buttonPrimaryFontColor, --buttonPrimaryBgColor, --buttonPrimaryBorder, --buttonPrimaryShadow
--buttonPrimaryFontColorHover, --buttonPrimaryBgColorHover, --buttonPrimaryBorderHover
--buttonPrimaryFontColorActive, --buttonPrimaryBgColorActive, --buttonPrimaryBorderActive
--buttonPrimaryFocusBorder, --buttonPrimaryFocusShadow
```

**侧边栏样式：**
```css
--sideBarColor, --sideBarIconColor, --sideBarTitleColor, --sideBarTextColor
--sideBarBgColor, --sideBarItemHoverBgColor, --itemBgColor
```

**浮动元素样式：**
```css
--floatFontColor, --floatBgColor, --floatHoverColor, --floatBorderColor
--floatShadow, --maskColor
```

**通知颜色：**
```css
--notificationPrimaryColor, --notificationPrimaryBg
--notificationInfoColor, --notificationInfoBg
--notificationWarningColor, --notificationWarningBg
--notificationErrorColor, --notificationErrorBg
```

**布局：**
```css
--editorAreaWidth
```

### Theme List

| Theme | Type | Theme Color |
|---|---|---|
| `light` | Light | `#409EFF` |
| `dark` | Dark | `#409EFF` |
| `graphite` | Light | `rgb(104, 134, 170)` |
| `material-dark` | Dark | `#f48237` |
| `ulysses` | Light | `#f48237` |
| `one-dark` | Dark | `rgba(77, 120, 204, 1)` |

### Design Rules

**Do:**
- 使用 CSS 变量定义所有主题相关的颜色和样式
- 为每个主题定义完整的变量集（包括所有透明度变体）
- 保持所有主题的变量结构一致
- 使用 `patchTheme()` 函数包装主题 CSS 以支持打印
- 为亮色和暗色主题分别优化对比度

**Don't:**
- 不要在主题文件中使用硬编码的颜色值（除了特殊情况如滚动条）
- 不要修改其他主题的变量结构
- 不要在组件中直接使用主题颜色，应使用 CSS 变量
- 不要忘记定义变量的透明度变体

### Adding New Themes

1. 在 `src/renderer/assets/themes/` 创建新的 `.theme.css` 文件
2. 在 `themeColor.js` 中导入并导出主题函数
3. 在 `theme.js` 的 `addThemeStyle()` 中添加新的 case
4. 在 `prefComponents/theme/config.js` 中添加主题选项
5. 如需要，在 `stores/preferences.js` 中更新默认主题

---

## Reference Documentation

| Document | Path | Description |
|----------|------|-------------|
| Build Guide | `docs/dev/BUILD.md` | Build instructions and troubleshooting |
| Architecture | `docs/dev/ARCHITECTURE.md` | System architecture details |
| Vue 3 Migration | `docs/dev/VUE3_MIGRATION.md` | Migration from Vue 2/Webpack |
| Debugging | `docs/dev/DEBUGGING.md` | Debugging techniques |
| Release | `docs/dev/RELEASE.md` | Release process |
| Release Hotfix | `docs/dev/RELEASE_HOTFIX.md` | Hotfix procedures |
| Code Docs | `docs/dev/code/README.md` | Code documentation |
| Contributing | `CONTRIBUTING.md` | Contribution guidelines |

### Module-Specific Guidelines

| Directory | Guidelines File | Purpose |
|-----------|-----------------|---------|
| `src/main/` | `src/main/AGENTS.md` | Electron main process |
| `src/renderer/` | `src/renderer/AGENTS.md` | Vue 3 renderer |
| `src/muya/` | `src/muya/AGENTS.md` | Markdown editor core |

### Knowledge Graph

- **Location**: `graphify-out/`
- **Report**: Read `graphify-out/GRAPH_REPORT.md` for architecture questions (god nodes, community structure)
- **Navigation**: If `graphify-out/wiki/index.md` exists, use it instead of raw files
- **Update**: Run `graphify update .` after modifying code

<!-- CODEGRAPH_START -->
## CodeGraph

This project has a CodeGraph MCP server (`codegraph_*` tools) configured. CodeGraph is a tree-sitter-parsed knowledge graph of every symbol, edge, and file. Reads are sub-millisecond and return structural information grep cannot.

### When to prefer codegraph over native search

Use codegraph for **structural** questions — what calls what, what would break, where is X defined, what is X's signature. Use native grep/read only for **literal text** queries (string contents, comments, log messages) or after you already have a specific file open.

| Question | Tool |
|---|---|
| "Where is X defined?" / "Find symbol named X" | `codegraph_search` |
| "What calls function Y?" | `codegraph_callers` |
| "What does Y call?" | `codegraph_callees` |
| "How does X reach/become Y? / trace the flow from X to Y" | `codegraph_trace` (one call = the whole path, incl. callback/React/JSX dynamic hops) |
| "What would break if I changed Z?" | `codegraph_impact` |
| "Show me Y's signature / source / docstring" | `codegraph_node` |
| "Give me focused context for a task/area" | `codegraph_context` |
| "See several related symbols' source at once" | `codegraph_explore` |
| "What files exist under path/" | `codegraph_files` |
| "Is the index healthy?" | `codegraph_status` |

### Rules of thumb

- **Answer directly — don't delegate exploration.** For "how does X work" / architecture questions, answer with 2-3 codegraph calls: `codegraph_context` first, then ONE `codegraph_explore` for the source of the symbols it surfaces. For a specific **flow** ("how does X reach Y") start with `codegraph_trace` from→to — one call returns the whole path with dynamic hops bridged — then ONE `codegraph_explore` for the bodies; don't rebuild the path with `codegraph_search` + `codegraph_callers`. Codegraph IS the pre-built index, so spawning a separate file-reading sub-task/agent — or running a grep + read loop — repeats work codegraph already did and costs more for the same answer.
- **Trust codegraph results.** They come from a full AST parse. Do NOT re-verify them with grep — that's slower, less accurate, and wastes context.
- **Don't grep first** when looking up a symbol by name. `codegraph_search` is faster and returns kind + location + signature in one call.
- **Don't chain `codegraph_search` + `codegraph_node`** when you just want context — `codegraph_context` is one call.
- **Don't loop `codegraph_node` over many symbols** — one `codegraph_explore` call returns several symbols' source grouped in a single capped call, while each separate node/Read call re-reads the whole context and costs far more.
- **Index lag**: the file watcher debounces ~500ms behind writes; don't re-query immediately after editing a file in the same turn.

### If `.codegraph/` doesn't exist

The MCP server returns "not initialized." Ask the user: *"I notice this project doesn't have CodeGraph initialized. Want me to run `codegraph init -i` to build the index?"*
<!-- CODEGRAPH_END -->
