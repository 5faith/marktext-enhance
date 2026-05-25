## ADDED Requirements

### Requirement: 标题栏采用两行布局
系统 SHALL 将标题栏高度从 32px 增加到 64px，采用两行布局结构。

#### Scenario: 标题栏高度为 64px
- **WHEN** 应用启动
- **THEN** 标题栏高度为 64px，包含两行

#### Scenario: 第一行显示菜单和窗口按钮
- **WHEN** 标题栏渲染完成
- **THEN** 第一行左侧显示水平菜单（File, Edit, Paragraph, Format, Window, Theme, View, Help）
- **THEN** 第一行右侧显示窗口控制按钮（最小化、最大化、关闭）

#### Scenario: 第二行显示字数统计和标题
- **WHEN** 标题栏渲染完成
- **THEN** 第二行左侧显示字数统计
- **THEN** 第二行居中显示当前文档标题

### Requirement: 字数统计弹窗具有透明度
系统 SHALL 为字数统计弹窗添加透明度效果，使用 rgba 格式。

#### Scenario: 弹窗背景具有 90% 不透明度
- **WHEN** 用户 hover 到字数统计上
- **THEN** 弹窗背景使用 rgba(63, 63, 63, 0.9) 格式（暗色主题）
- **THEN** 弹窗内容清晰可读

#### Scenario: 弹窗透明度符合设计规范
- **WHEN** 弹窗显示
- **THEN** 透明度值符合 DESIGN.md 的 Float & Overlay 规范
