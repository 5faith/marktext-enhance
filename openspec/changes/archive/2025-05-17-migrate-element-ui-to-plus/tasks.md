## 1. 依赖清理

- [x] 1.1 从 package.json 中移除 `element-ui` 依赖
- [x] 1.2 运行 `yarn install` 更新依赖并验证 element-ui 被移除
- [x] 1.3 检查并移除任何间接依赖 element-ui 的包

## 2. Vite 配置更新

- [x] 2.1 从 vite.config.js 的 `resolve.alias` 中移除 element-ui CSS 映射
- [x] 2.2 从 `optimizeDeps.include` 中移除 `element-ui`
- [x] 2.3 验证 Vite 配置语法正确性

## 3. 清理 shim 文件

- [x] 3.1 删除 `src/renderer/shims/element-ui-css.js` 文件
- [x] 3.2 检查是否有其他文件引用该 shim
- [x] 3.3 如有引用，更新为 Element Plus 的 CSS 导入方式

## 4. 主题系统检查

- [x] 4.1 检查 `src/renderer/util/theme.js` 是否使用 element-ui CSS
- [x] 4.2 如有必要，迁移主题系统到 Element Plus CSS 变量
- [x] 4.3 验证主题切换功能正常工作

## 5. 构建验证

- [x] 5.1 运行 `yarn dev` 验证开发服务器正常启动
- [x] 5.2 运行 `yarn build` 验证生产构建成功
- [x] 5.3 检查构建输出中无 element-ui 相关警告

## 6. 功能测试

- [x] 6.1 测试所有 Dialog 组件（关于、导入、重命名、命令面板等）
- [x] 6.2 测试 Table 组件（快捷键设置、拼写检查）
- [x] 6.3 测试 Form 组件（偏好设置、导出设置）
- [x] 6.4 测试 Button、Tooltip、Input 等基础组件
- [x] 6.5 测试主题切换功能

## 7. 代码检查

- [x] 7.1 全局搜索确保无 element-ui 导入语句残留
- [x] 7.2 检查 node_modules 中无 element-ui 目录
- [x] 7.3 运行 ESLint 确保代码规范

## 8. 文档更新

- [x] 8.1 更新 AGENTS.md 中关于 Element UI 的说明（如已存在）
- [x] 8.2 如有必要，更新开发者文档

## Final Verification Wave

### F1. 代码审查
- [x] 审查 package.json 修改
- [x] 审查 vite.config.js 修改
- [x] 审查删除的文件

### F2. 构建验证
- [x] 开发构建通过
- [x] 生产构建通过
- [x] 无构建警告

### F3. 功能验证
- [x] 所有 Element 组件正常工作
- [x] 主题切换正常
- [x] 无控制台错误

### F4. 依赖检查
- [x] node_modules 中无 element-ui
- [x] 无间接依赖问题
- [x] 包体积减小
