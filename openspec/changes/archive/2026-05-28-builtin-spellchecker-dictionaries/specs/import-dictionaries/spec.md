## ADDED Requirements

### Requirement: 导入词典按钮
偏好设置 → Spelling 页面 SHALL 提供"导入词典"按钮，允许用户导入自定义词典文件。

#### Scenario: 显示导入按钮
- **WHEN** 用户打开偏好设置 → Spelling 页面
- **THEN** 页面显示"导入词典"按钮

### Requirement: 词典文件选择
点击"导入词典"按钮 SHALL 打开文件选择器，仅允许选择 `.bdic` 格式的文件。

#### Scenario: 打开文件选择器
- **WHEN** 用户点击"导入词典"按钮
- **THEN** 打开系统文件选择器，文件类型过滤为 `*.bdic`

### Requirement: 词典文件验证
导入时 SHALL 验证词典文件的格式和完整性。

#### Scenario: 验证通过
- **WHEN** 用户选择有效的 `.bdic` 文件（大小 > 8KB）
- **THEN** 文件被复制到 `userData/dictionaries/` 目录
- **AND** 显示成功提示

#### Scenario: 验证失败 - 文件格式错误
- **WHEN** 用户选择非 `.bdic` 格式的文件
- **THEN** 显示错误提示"仅支持 .bdic 格式的词典文件"

#### Scenario: 验证失败 - 文件过小
- **WHEN** 用户选择大小 ≤ 8KB 的 `.bdic` 文件
- **THEN** 显示错误提示"词典文件无效或已损坏"

### Requirement: 导入后刷新词典列表
导入成功后 SHALL 自动刷新可用词典列表，新导入的词典出现在语言选择下拉框中。

#### Scenario: 刷新词典列表
- **WHEN** 词典导入成功
- **THEN** 语言选择下拉框更新，包含新导入的词典

### Requirement: 词典文件存储位置
用户导入的词典 SHALL 存储在 `userData/dictionaries/` 目录，与内置词典分离。

#### Scenario: 检查导入文件位置
- **WHEN** 用户成功导入词典文件
- **THEN** 文件被复制到 `userData/dictionaries/` 目录
- **AND** 原始文件不被修改
