## Context

MarkText 是一个基于 Vue 3 + Electron 的 Markdown 编辑器。根据 AGENTS.md 的说明，项目应该使用 Element Plus 作为主要的 UI 库。然而，package.json 中同时存在 `element-ui` (v2.15.7) 和 `element-plus` (v2.0+) 两个依赖。

通过代码分析发现：
1. **实际使用情况**：项目已经在使用 Element Plus 组件（通过 `unplugin-vue-components` 自动导入）
2. **遗留依赖**：`element-ui` 仍作为依赖存在，但主要用于 CSS 主题兼容（通过 `element-ui-css.js` shim）
3. **组件使用**：共发现 25+ 个 Vue 文件使用了 Element Plus 组件（el-dialog, el-button, el-table 等）

## Goals / Non-Goals

**Goals:**
- 完全移除 `element-ui` 依赖
- 更新 Vite 配置，移除 element-ui 相关配置
- 迁移主题系统到 Element Plus
- 确保所有组件正常工作

**Non-Goals:**
- 不修改组件功能逻辑
- 不引入新的 UI 设计
- 不升级 Element Plus 版本（保持 v2.0+）

## Decisions

### 1. 移除 element-ui 依赖
**决策**：完全从 package.json 中移除 element-ui
**理由**：
- 项目已使用 Element Plus 作为主要 UI 库
- element-ui 仅用于 CSS shim，可以被 Element Plus 的主题系统替代
- 减少依赖复杂度和打包体积

**替代方案考虑**：
- ❌ 保留 element-ui 用于兼容性 - 增加维护负担
- ✅ 完全移除并迁移到 Element Plus - 符合项目长期规划

### 2. 更新 Vite 配置
**决策**：
1. 移除 `optimizeDeps.include` 中的 `element-ui`
2. 移除 `resolve.alias` 中的 `element-ui/lib/theme-chalk/index.css` 映射
3. 删除 `src/renderer/shims/element-ui-css.js` 文件

**理由**：
- Element Plus 使用 CSS 变量系统，不需要手动导入 CSS
- Vite 的 `unplugin-vue-components` 已自动处理组件导入

### 3. 主题系统迁移
**决策**：使用 Element Plus 的 CSS 变量覆盖主题
**理由**：
- Element Plus 支持通过 CSS 变量自定义主题
- 比 Element UI 的 SCSS 变量更灵活
- 支持动态主题切换（如暗黑模式）

**实现方式**：
```css
/* 在 index.css 中添加 */
:root {
  --el-color-primary: #409eff;
  /* 其他主题变量 */
}
```

### 4. 组件 API 兼容性
**决策**：保持现有组件使用方式，不需要修改
**理由**：
- Element Plus 2.x 与 Element UI 2.x 的组件 API 高度兼容
- 项目已通过自动导入使用 Element Plus 组件
- 测试验证现有功能正常工作

**需要注意的差异**：
- `el-submenu` → `el-sub-menu`（已自动处理）
- Icon 系统：Element Plus 使用 `@element-plus/icons-vue`，但项目已有自己的图标系统
- 部分组件的默认样式可能有细微差异

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| 主题样式不一致 | 对比 Element UI 和 Element Plus 的默认样式，必要时覆盖 CSS 变量 |
| 第三方库依赖 element-ui | 检查所有依赖，必要时更新或替换 |
| 构建失败 | 在 CI 环境中测试构建，确保无 element-ui 引用 |
| 运行时错误 | 全面测试所有使用 Element 组件的功能 |

## Migration Plan

### Phase 1: 依赖清理
1. 从 package.json 移除 `element-ui`
2. 运行 `yarn install` 更新依赖
3. 验证 node_modules 中无 element-ui

### Phase 2: 配置更新
1. 更新 vite.config.js：
   - 移除 `element-ui` 相关 alias
   - 移除 `optimizeDeps.include` 中的 `element-ui`
2. 删除 `src/renderer/shims/element-ui-css.js`
3. 更新 `src/renderer/util/theme.js`（如果使用 element-ui CSS）

### Phase 3: 主题迁移
1. 检查现有主题文件
2. 迁移到 Element Plus CSS 变量
3. 测试主题切换功能

### Phase 4: 验证
1. 运行开发服务器，检查无错误
2. 构建生产版本
3. 测试所有使用 Element 组件的功能：
   - Dialog（关于、导入、重命名等）
   - Table（快捷键设置、拼写检查）
   - Form 组件（偏好设置）
   - Button、Tooltip 等基础组件

### Rollback Strategy
- 保留 package.json 修改前的备份
- 如出现问题，可快速恢复 element-ui 依赖
- 关键功能需有手动测试清单

## Open Questions

1. **主题系统**：需要确认 `src/renderer/util/theme.js` 是否使用了 element-ui 的 CSS
2. **测试覆盖**：哪些功能需要重点测试？
3. **第三方依赖**：是否有其他依赖间接依赖 element-ui？
