## Why

Muya（MarkText 的 Markdown 编辑器核心）目前使用 Webpack 5 构建，而项目主应用已迁移至 Vite 5。维护两套构建工具增加了复杂性和维护成本。将 Muya 迁移到 Vite 可以统一构建工具链，利用 Vite 更快的构建速度和更简洁的配置，同时保持 Muya 作为独立子包的特性。

## What Changes

- **移除 Webpack 配置**：删除 `src/muya/webpack.config.js`
- **创建 Vite 配置**：新增 `src/muya/vite.config.js`，使用 Vite 库模式构建 UMD 输出
- **更新构建脚本**：修改根目录 `package.json` 中的 `build:muya` 脚本
- **更新技术栈文档**：修改 `AGENTS.md`，移除 Webpack 相关描述
- **清理依赖**：从根 `package.json` 中移除 Webpack 相关依赖（可选）
- **BREAKING**：Muya 构建输出路径和文件名保持不变（`src/muya/dist/index.min.js` 和 `index.min.css`），确保主应用引用不受影响

## Capabilities

### New Capabilities
- `muya-vite-build`: 使用 Vite 构建 Muya 子包，支持 UMD 输出、CSS 提取、资源处理

### Modified Capabilities
- `build-system`: 统一构建工具为 Vite，移除 Webpack 相关配置和依赖

## Impact

- **代码位置**：`src/muya/` 目录
- **配置文件**：`src/muya/vite.config.js`（新增），`src/muya/webpack.config.js`（删除）
- **构建脚本**：根目录 `package.json` 中的 `build:muya` 和 `release:muya`
- **文档**：`AGENTS.md` 技术栈表格和构建系统说明
- **依赖**：`webpack`, `webpack-cli`, `babel-loader`, `mini-css-extract-plugin` 等（可选移除）
- **风险**：低风险，Muya 是纯浏览器代码，无 Electron/Node.js API 依赖
