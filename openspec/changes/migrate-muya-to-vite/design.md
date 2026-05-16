## Context

Muya 是 MarkText 的 Markdown 编辑器核心，目前使用 Webpack 5 构建。项目主应用已完成从 Vue 2/Webpack 到 Vue 3/Vite 的迁移，但 Muya 仍保留独立的 Webpack 配置。这导致：

1. **工具链分裂**：项目同时维护 Webpack 和 Vite 两套构建系统
2. **依赖冗余**：根 `package.json` 包含大量 Webpack 相关依赖（webpack、babel-loader、mini-css-extract-plugin 等）
3. **配置复杂**：Muya 的 Webpack 配置包含特殊 loader（imports-loader、to-string-loader）和插件，维护成本高

当前 Webpack 配置的关键点：
- Entry: `src/muya/lib/index.js`
- Output: UMD 格式，`dist/index.min.js` + `dist/index.min.css`
- 特殊处理：Snap.svg 的 imports-loader、特定 CSS 的 to-string-loader、PostCSS、Babel
- 资源处理：图片、字体、媒体文件使用 asset/resource

## Goals / Non-Goals

**Goals:**
- 将 Muya 构建从 Webpack 迁移到 Vite
- 保持输出格式一致（UMD、CSS 提取、资源处理）
- 保持 Muya 作为独立子包的特性
- 最小化对主应用的影响

**Non-Goals:**
- 不修改 Muya 源代码（lib/ 目录）
- 不改变 Muya 的 API 或功能
- 不将 Muya 集成到主 Vite 配置（保持独立）
- 不修改主应用的构建流程

## Decisions

### 1. 使用 Vite 库模式（Library Mode）

**决策**：使用 Vite 的 `build.lib` 配置构建 UMD 库。

**理由**：
- Vite 原生支持库模式，可输出 UMD、ESM、CJS 格式
- 与 Webpack 的 `libraryTarget: 'umd'` 等效
- 配置简洁，无需额外插件

**配置对比**：

```javascript
// Webpack (当前)
output: {
  filename: 'index.min.js',
  libraryTarget: 'umd',
  library: 'Muya',
  path: path.join(__dirname, './dist')
}

// Vite (新)
build: {
  lib: {
    entry: './lib/index.js',
    name: 'Muya',
    fileName: 'index.min',
    formats: ['umd']
  },
  outDir: 'dist'
}
```

### 2. 使用原生 CSS 处理替代 MiniCssExtractPlugin

**决策**：使用 Vite 原生 CSS 处理，通过 `build.cssCodeSplit` 和 `build.assetsInlineLimit` 控制。

**理由**：
- Vite 内置 CSS 处理，无需 mini-css-extract-plugin
- 通过 `cssCodeSplit: false` 可将所有 CSS 合并到单个文件
- 通过插件钩子实现 CSS 提取到独立文件

**处理方式**：
- 使用 `vite-plugin-css-injected-by-js` 或自定义插件将 CSS 注入 JS
- 或者使用 `rollup-plugin-styles` 提取 CSS 到独立文件

### 3. 使用 Rollup 插件替代特殊 Loader

**决策**：使用 Rollup 插件替代 Webpack 的特殊 loader。

**替换映射**：

| Webpack Loader | Vite/Rollup 替代方案 |
|----------------|---------------------|
| `imports-loader` (Snap.svg) | `@rollup/plugin-inject` 或 `rollup-plugin-inject` |
| `to-string-loader` (特定 CSS) | 自定义 Rollup 插件或内联处理 |
| `babel-loader` | Vite 内置 ESBuild（无需额外配置） |
| `vue-html-loader` | Vite 原生支持（无需配置） |
| `postcss-loader` | Vite 原生支持（自动读取 postcss.config.js） |

**Snap.svg 处理**：
```javascript
// Webpack
{
  test: require.resolve('./lib/assets/libs/snap.svg-min.js'),
  use: 'imports-loader?this=>window,fix=>module.exports=0'
}

// Vite (使用 rollup-plugin-inject)
rollupInject({
  'snap.svg-min.js': ['window', 'window']
})
```

### 4. 保持独立子包结构

**决策**：在 `src/muya/` 目录下创建独立的 `vite.config.js`。

**理由**：
- 保持 Muya 的独立性，未来可单独发布 npm 包
- 与主应用构建解耦，风险隔离
- 符合项目现有架构设计

**目录结构**：
```
src/muya/
├── vite.config.js      # 新增
├── webpack.config.js     # 删除
├── package.json          # 可选：添加构建脚本
├── lib/                  # 源码（不变）
├── themes/               # 主题（不变）
└── dist/                 # 输出（不变）
```

### 5. 更新构建脚本

**决策**：修改根 `package.json` 中的 `build:muya` 脚本。

**变更**：
```json
// 旧
"build:muya": "cd src/muya && webpack --progress --config webpack.config.js"

// 新
"build:muya": "cd src/muya && vite build"
```

## Risks / Trade-offs

### [Risk] CSS 提取行为不一致
**风险**：Vite 的 CSS 处理与 MiniCssExtractPlugin 可能有差异，导致输出 CSS 文件内容或格式不同。
**缓解**：
- 使用 `rollup-plugin-styles` 精确控制 CSS 提取
- 对比构建前后的 CSS 文件内容
- 测试主题样式是否正确加载

### [Risk] Snap.svg 注入失败
**风险**：Snap.svg 依赖全局 `window` 对象，Vite 的注入方式可能与 Webpack 不同。
**缓解**：
- 使用 `rollup-plugin-inject` 或 `@rollup/plugin-inject`
- 测试图形绘制功能（时序图等）
- 备选方案：修改 Snap.svg 源码或替换为其他库

### [Risk] 资源文件路径变化
**风险**：Vite 的资源文件命名和路径可能与 Webpack 不同（contenthash 算法差异）。
**缓解**：
- 配置 `rollupOptions.output.assetFileNames` 匹配现有模式
- 测试图片、字体加载

### [Risk] Babel 转换差异
**风险**：Vite 使用 ESBuild 而非 Babel，可能对某些语法支持不同。
**缓解**：
- Muya 源码使用标准 ES6+，ESBuild 完全支持
- 如有特殊需求，可配置 `esbuild.target`

## Migration Plan

### Phase 1: 准备
1. 创建 `src/muya/vite.config.js`
2. 安装必要依赖（如有）
3. 配置 Vite 库模式

### Phase 2: 配置迁移
1. 配置入口和输出（UMD、文件名）
2. 配置路径别名（snapsvg）
3. 配置 CSS 处理
4. 配置 Snap.svg 注入
5. 配置资源处理

### Phase 3: 测试
1. 运行 `yarn build:muya`
2. 验证输出文件（dist/index.min.js、dist/index.min.css）
3. 运行主应用 `yarn dev`，测试编辑器功能
4. 运行 `yarn build`，验证完整构建

### Phase 4: 清理
1. 删除 `src/muya/webpack.config.js`
2. 更新 `AGENTS.md` 技术栈文档
3. （可选）从根 `package.json` 移除 Webpack 依赖

### Rollback Strategy
- 保留 `webpack.config.js` 直到验证完成
- 如有问题，可快速切换回 `build:muya` 脚本

## Open Questions

1. 是否需要添加 `src/muya/package.json` 的构建脚本？
2. 是否需要在 `src/muya/` 目录下安装独立依赖？
3. 是否需要保留 `to-string-loader` 的特定 CSS 处理逻辑？
