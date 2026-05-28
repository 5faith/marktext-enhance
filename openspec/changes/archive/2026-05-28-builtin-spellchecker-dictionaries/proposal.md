## Why

MarkText 从 `@hfelix/electron-spellchecker` 迁移到 Electron 内置拼写检查器后，Windows/Linux 上的 Hunspell 词典依赖从 Google CDN 自动下载。在国内网络环境下，CDN 访问失败导致拼写检查功能完全不可用。需要内置词典文件到应用中，实现离线可用，并支持用户手动导入自定义词典。

## What Changes

- 将 `en-US.bdic` 词典文件内置到应用的 `static/dictionaries/` 目录
- 在 `editor.js` 中配置 `setSpellCheckerDictionaryDownloadURL` 指向本地路径，实现离线加载
- 在偏好设置中添加"导入词典"功能，支持用户添加自定义语言词典
- 导入时检查词典文件格式（`.bdic`）和完整性（文件大小 > 8KB）
- 导入的词典存储在用户数据目录的 `dictionaries/` 文件夹
- 自动扫描可用词典列表，更新语言选择下拉框

## Capabilities

### New Capabilities
- `builtin-dictionaries`: 内置词典文件到应用，配置本地加载路径
- `import-dictionaries`: 用户手动导入自定义词典文件，包含格式检查和完整性验证

### Modified Capabilities
- `spellchecker-init`: 拼写检查器初始化逻辑改为优先使用本地词典，fallback 到 CDN

## Impact

- **代码文件**：
  - `src/main/windows/editor.js` - 配置本地词典路径
  - `src/renderer/spellchecker/index.js` - 初始化逻辑、词典扫描
  - `src/renderer/prefComponents/spellchecker/index.vue` - 导入词典 UI
  - `package.json` - 构建配置（static 目录包含词典）
- **静态资源**：
  - `static/dictionaries/en-US.bdic` - 内置词典文件
- **用户数据**：
  - `userData/dictionaries/` - 用户导入的词典存储位置
- **依赖**：无新增依赖，使用现有 Electron API
