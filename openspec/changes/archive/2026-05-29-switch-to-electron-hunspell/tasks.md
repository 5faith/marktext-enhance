## 1. 依赖和资源准备

- [x] 1.1 安装 electron-hunspell 依赖: `yarn add electron-hunspell`
- [x] 1.2 复制 en_US.dic 和 en_US.aff 文件到 resources/hunspell_dictionaries/ 目录
- [x] 1.3 更新 electron-builder.yml 配置，确保新词典文件被打包

## 2. SpellChecker 类重构

- [x] 2.1 重写 SpellChecker 类的初始化逻辑，使用 electron-hunspell 替代 Electron 内置 API
- [x] 2.2 实现 check() 方法，调用 electron-hunspell 的 check() API
- [x] 2.3 实现 suggest() 方法，调用 electron-hunspell 的 suggest() API
- [x] 2.4 更新 switchLanguage() 方法，支持加载 .dic/.aff 格式词典
- [x] 2.5 更新 importDictionary() 方法，支持导入 .dic/.aff 文件对
- [x] 2.6 更新 getAvailableDictionaries() 方法，扫描 .dic 文件而非 .bdic

## 3. 词典加载逻辑

- [x] 3.1 实现词典文件对验证逻辑（检查 .dic 和 .aff 是否同时存在）
- [x] 3.2 实现词典文件大小验证（.dic > 8KB, .aff > 100 bytes）
- [x] 3.3 实现词典文件内容验证（检查是否为有效的 Hunspell 格式）
- [x] 3.4 实现默认词典加载逻辑（从 resources 目录加载 en_US）

## 4. 编辑器集成

- [x] 4.1 更新 editor.vue 中的 SpellChecker 初始化流程
- [x] 4.2 更新 editor.vue 中的拼写建议获取逻辑（从 electron-hunspell 获取而非 Electron 事件）
- [x] 4.3 更新 editor.vue 中的语言切换逻辑
- [ ] 4.4 测试波浪线渲染是否正常工作

## 5. 上下文菜单集成

- [x] 5.1 更新 spellcheck.js 中的拼写建议显示逻辑
- [x] 5.2 更新 "Add to Dictionary" 功能
- [x] 5.3 更新 "Remove from Dictionary" 功能
- [x] 5.4 更新 "Ignore" 功能

## 6. 偏好设置 UI

- [x] 6.1 更新词典导入对话框，支持选择 .dic 文件
- [x] 6.2 更新可用词典列表显示逻辑
- [x] 6.3 更新语言切换下拉菜单
- [x] 6.4 移除对 Electron 内置词典的依赖说明

## 7. 测试和验证

- [x] 7.1 运行现有的单元测试，确保 extractWord 等工具函数正常工作
- [ ] 7.2 测试拼写检查基本功能（检查、建议、替换）
- [ ] 7.3 测试语言切换功能
- [ ] 7.4 测试词典导入功能
- [ ] 7.5 测试右键菜单拼写建议
- [ ] 7.6 测试代码块中的拼写检查跳过
- [ ] 7.7 在不同平台（Windows、macOS、Linux）上测试

## 8. 清理和文档

- [ ] 8.1 移除对 Electron 内置拼写检查 API 的依赖
- [ ] 8.2 更新相关注释和文档
- [ ] 8.3 确保所有废弃的 API 已被移除或标记
