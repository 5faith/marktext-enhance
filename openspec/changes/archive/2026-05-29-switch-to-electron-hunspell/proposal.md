## Why

当前 MarkText 的拼写检查完全依赖 Electron/Chromium 内置的 Hunspell 引擎，只支持 `.bdic` 格式的词典文件。用户想要使用 `.dic` 和 `.aff` 格式的 Hunspell 词典（如 `en_US.dic`），但这些格式无法直接被 Electron 识别。需要切换到一个支持原生 Hunspell 格式的拼写检查库。

## What Changes

- 移除对 Electron 内置拼写检查器的依赖（`session.setSpellChecker*` API）
- 引入 `electron-hunspell` 作为新的拼写检查引擎，支持直接读取 `.dic` 和 `.aff` 文件
- 将 `en_US.dic` 和 `en_US.aff` 作为默认内置词典打包到应用中
- 修改 `SpellChecker` 类的内部实现，使用 `electron-hunspell` 的 API
- 更新词典导入功能，支持 `.dic` 和 `.aff` 格式（不再只支持 `.bdic`）
- 修改偏好设置 UI，移除对 Electron 内置词典的依赖

## Capabilities

### New Capabilities

- `hunspell-dictionary-loading`: 支持加载 .dic/.aff 格式的 Hunspell 词典文件
- `spellcheck-engine`: 基于 electron-hunspell 的拼写检查引擎实现

### Modified Capabilities

<!-- 无现有 spec 需要修改 -->

## Impact

- **核心模块**: `src/renderer/spellchecker/index.js` — SpellChecker 类需要重写内部实现
- **依赖**: 新增 `electron-hunspell` 和 `hunspell-asm` 依赖
- **构建配置**: `electron-builder.yml` 需要添加内置词典文件的打包配置
- **偏好设置 UI**: `src/renderer/prefComponents/spellchecker/index.vue` — 词典导入对话框需要支持新格式
- **上下文菜单**: `src/renderer/contextMenu/editor/spellcheck.js` — 拼写建议的获取方式需要调整
- **编辑器组件**: `src/renderer/components/editorWithTabs/editor.vue` — 初始化流程需要调整
- **资源文件**: 需要将 `en_US.dic` 和 `en_US.aff` 添加到 `resources/` 目录
