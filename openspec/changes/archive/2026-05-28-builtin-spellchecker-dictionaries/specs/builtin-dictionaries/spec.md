## ADDED Requirements

### Requirement: 应用内置 en-US 词典文件
应用 SHALL 将 `en-US.bdic` 词典文件内置到 `static/dictionaries/` 目录，确保离线环境下拼写检查功能可用。

#### Scenario: 词典文件存在
- **WHEN** 应用安装完成
- **THEN** `static/dictionaries/en-US.bdic` 文件存在且大小 > 8KB

### Requirement: 配置本地词典加载路径
`editor.js` SHALL 调用 `setSpellCheckerDictionaryDownloadURL` 将词典下载 URL 指向本地 `file://` 路径，指向 `static/dictionaries/` 目录。

#### Scenario: 窗口创建时配置本地路径
- **WHEN** 编辑器窗口创建完成
- **THEN** `session.setSpellCheckerDictionaryDownloadURL` 被调用，URL 为 `file:///${__static}/dictionaries/`

### Requirement: 可用词典列表包含内置词典
`SpellChecker.getAvailableDictionaries()` 返回的列表 SHALL 包含内置的 `en-US` 词典。

#### Scenario: 获取可用词典列表
- **WHEN** 调用 `SpellChecker.getAvailableDictionaries()`
- **THEN** 返回列表包含 `en-US`

### Requirement: 拼写检查器使用内置词典
拼写检查器 SHALL 能够使用内置的 `en-US` 词典进行拼写检查，无需网络访问。

#### Scenario: 离线启用拼写检查
- **WHEN** 网络不可用时启用拼写检查器
- **THEN** 拼写检查器成功初始化并使用 `en-US` 词典
