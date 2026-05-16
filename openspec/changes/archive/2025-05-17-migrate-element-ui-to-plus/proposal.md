## Why

MarkText 目前同时依赖 Element UI (Vue 2) 和 Element Plus (Vue 3)，导致：
1. 维护两套组件库，增加代码复杂度和包体积
2. 部分组件行为不一致，造成用户体验割裂
3. 无法充分利用 Element Plus 的新特性和性能优化

由于项目已完成 Vue 3 迁移，现在是移除 Element UI、统一使用 Element Plus 的最佳时机。

## What Changes

- **移除 Element UI 依赖** - 从 package.json 和代码中完全移除 element-ui
- **迁移所有 Element UI 组件到 Element Plus** - 包括：
  - Button, Input, Dialog, Dropdown, Menu 等基础组件
  - Table, Form, Select 等复杂组件
  - Icon 系统迁移 (Element UI icons → Element Plus icons)
- **更新组件 API 调用** - Element Plus 的 API 有变化，需要调整 props、事件和插槽
- **样式调整** - Element Plus 的 CSS 变量和主题系统与 Element UI 不同
- **国际化配置更新** - 语言包从 element-ui 切换到 element-plus
- **按需导入配置更新** - 更新 vite 和 babel 的按需导入插件配置

## Capabilities

### New Capabilities
- `element-plus-migration`: 完整的 Element UI 到 Element Plus 迁移方案，包括组件映射、API 差异处理和样式适配

### Modified Capabilities
- 无（这是纯技术债务清理，不涉及功能需求变更）

## Impact

**代码范围：**
- `package.json` - 依赖声明
- `src/renderer/` - Vue 3 渲染层所有使用 Element UI 的组件
- `vite.config.js` - 按需导入配置
- 主题和样式文件

**风险：**
- **BREAKING**: 部分组件 API 不兼容，需要仔细测试
- 样式可能略有差异，需要视觉回归测试
- 第三方插件如果依赖 Element UI 需要同步更新

**收益：**
- 减少约 200KB+ 的打包体积
- 统一的组件库，降低维护成本
- 更好的 TypeScript 支持
- 访问 Element Plus 的新特性（如更好的暗黑模式、虚拟滚动等）
