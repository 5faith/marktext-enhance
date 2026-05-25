## 1. CSS 变量更新

- [x] 1.1 修改 `src/renderer/assets/styles/index.css` 中的 `--titleBarHeight` 从 `32px` 改为 `64px`
- [x] 1.2 检查所有使用 `--titleBarHeight` 的文件，确保兼容性

## 2. 标题栏模板重构

- [x] 2.1 修改 `src/renderer/components/titleBar/index.vue` 的模板结构
- [x] 2.2 创建第一行容器，包含水平菜单和窗口控制按钮
- [x] 2.3 创建第二行容器，包含字数统计和标题
- [x] 2.4 将字数统计从右侧工具栏移到第二行左侧

## 3. CSS 样式调整

- [x] 3.1 修改 `.title-bar` 高度为 64px
- [x] 3.2 修改 `.title-bar-editor-bg` 高度为 64px
- [x] 3.3 修改 `.title` 样式，移到第二行居中显示
- [x] 3.4 修改 `.left-toolbar` 高度为 32px（仅第一行）
- [x] 3.5 新增 `.second-row` 样式，高度 32px，包含字数统计和标题
- [x] 3.6 修改 `.word-count-wrapper` 位置，绝对定位在第二行左侧

## 4. 弹窗透明度

- [x] 4.1 修改 `.word-count-popup` 背景色为 rgba 格式（90% 不透明度）
- [x] 4.2 确保弹窗内容清晰可读

## 5. 测试验证

- [x] 5.1 验证标题栏两行布局正确显示
- [x] 5.2 验证字数统计在第二行左侧
- [x] 5.3 验证标题在第二行居中
- [x] 5.4 验证字数统计弹窗透明度效果
- [x] 5.5 运行 `yarn lint` 检查代码规范
