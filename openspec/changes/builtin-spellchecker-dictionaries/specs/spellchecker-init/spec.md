## ADDED Requirements

### Requirement: 拼写检查器初始化使用本地词典
`SpellChecker._initSpellchecker()` SHALL 优先从本地加载词典，失败时 fallback 到 CDN。

#### Scenario: 本地词典可用
- **WHEN** 拼写检查器初始化
- **AND** 本地 `static/dictionaries/` 目录包含 `en-US.bdic`
- **THEN** 拼写检查器使用本地词典初始化成功

#### Scenario: 本地词典不可用，CDN 可用
- **WHEN** 拼写检查器初始化
- **AND** 本地词典不存在
- **AND** Google CDN 可访问
- **THEN** 从 CDN 下载词典并初始化成功

#### Scenario: 本地词典不可用，CDN 不可用
- **WHEN** 拼写检查器初始化
- **AND** 本地词典不存在
- **AND** Google CDN 不可访问
- **THEN** 拼写检查器初始化失败，显示错误提示

### Requirement: 合并内置和用户词典列表
`SpellChecker.getAvailableDictionaries()` SHALL 合并内置词典和用户导入的词典列表。

#### Scenario: 合并词典列表
- **WHEN** 调用 `getAvailableDictionaries()`
- **THEN** 返回列表包含 `static/dictionaries/` 中的词典
- **AND** 返回列表包含 `userData/dictionaries/` 中的词典
- **AND** 列表去重

### Requirement: 词典语言切换
用户切换拼写检查语言时，系统 SHALL 加载对应的词典文件。

#### Scenario: 切换到内置语言
- **WHEN** 用户从语言下拉框选择 `en-US`
- **THEN** 系统加载 `static/dictionaries/en-US.bdic`
- **AND** 拼写检查器使用新语言

#### Scenario: 切换到用户导入语言
- **WHEN** 用户从语言下拉框选择用户导入的词典对应的语言
- **THEN** 系统加载 `userData/dictionaries/<lang>.bdic`
- **AND** 拼写检查器使用新语言

### Requirement: 词典加载错误处理
词典加载失败时，系统 SHALL 显示友好的错误提示，不崩溃。

#### Scenario: 词典文件损坏
- **WHEN** 加载词典文件时发生错误
- **THEN** 显示错误提示"词典加载失败"
- **AND** 拼写检查器保持禁用状态

#### Scenario: 词典文件不存在
- **WHEN** 切换到不存在的词典语言
- **THEN** 显示错误提示"词典文件不存在"
- **AND** 保持当前语言不变
