## Context

MarkText 已从 `@hfelix/electron-spellchecker` 迁移到 Electron 内置拼写检查器。当前实现中，`SpellChecker` 类在 `_initSpellchecker()` 中硬编码设置 `'en-US'` 并调用 `setSpellCheckerLanguages()`，依赖 Electron 从 Google CDN 自动下载词典。在 Windows/Linux 上，这需要网络访问，国内环境无法正常工作。

现有代码中已有词典文件 `resources/hunspell_dictionaries/en-US.bdic`（446KB），但未被使用。`editor.js` 中可以配置 `setSpellCheckerDictionaryDownloadURL` 指向本地路径。

## Goals / Non-Goals

**Goals:**
- 内置 `en-US.bdic` 词典到应用，实现离线拼写检查
- 支持用户导入自定义词典文件（`.bdic` 格式）
- 导入时验证文件格式和完整性
- 自动扫描可用词典列表
- 保持与现有偏好设置 UI 的一致性

**Non-Goals:**
- 不实现词典自动更新机制（用户可手动导入新版词典）
- 不支持 `.aff/.dic` 格式转换（需要 `.bdic` 格式）
- 不实现多语言词典预置（仅预置 `en-US`）
- 不修改 macOS 拼写检查逻辑（macOS 使用原生 API，不受影响）

## Decisions

### 1. 词典文件存储位置

**决策**：内置词典放 `static/dictionaries/`，用户导入词典放 `userData/dictionaries/`

**理由**：
- `static/` 目录在构建时会被复制到应用目录，可通过 `__static` 访问
- `userData/dictionaries/` 是用户数据目录，支持自定义词典持久化
- 分离内置和用户词典，便于管理和清理

**备选方案**：
- 全部放 `resources/`：构建后路径不可预测
- 全部放 `userData/`：内置词典会被用户修改

### 2. 词典加载流程

**决策**：`editor.js` 中配置本地路径，`SpellChecker` 扫描两个目录合并可用词典列表

```
┌─────────────────────────────────────────────────────────┐
│                    词典加载流程                          │
└─────────────────────────────────────────────────────────┘

1. editor.js 创建窗口后：
   session.setSpellCheckerDictionaryDownloadURL('file:///${__static}/dictionaries/')

2. SpellChecker._initSpellchecker()：
   - 调用 getAvailableSpellCheckerLanguages() 获取可用词典
   - 扫描 userData/dictionaries/ 补充用户导入的词典
   - 合并去重后返回完整列表

3. 用户切换语言时：
   - 调用 setSpellCheckerLanguages([lang])
   - Electron 自动从配置的 URL 加载词典文件
```

### 3. 词典导入验证

**决策**：导入时检查文件扩展名、MAGIC 字节、文件大小

**验证规则**：
- 扩展名必须为 `.bdic`
- 文件大小 > 8KB（防止空文件或损坏文件）
- 读取前 4 字节检查 BDIC magic number（可选，增强健壮性）

**理由**：
- 扩展名检查：快速筛选
- 大小检查：防止恶意文件
- MAGIC 字节：确认文件格式

### 4. UI 集成

**决策**：在偏好设置 → Spelling 页面添加"导入词典"按钮

**UI 布局**：
```
Spelling
├── Enable spell checking (toggle)
├── ...
├── Spell checker language (select - 包含内置 + 用户导入的词典)
└── Import dictionary (button) ← 新增
```

导入流程：文件选择器 → 验证 → 复制到 userData/dictionaries/ → 刷新词典列表

## Risks / Trade-offs

### 风险
- **词典文件体积**：`en-US.bdic` 约 450KB，会增加应用包体积约 450KB
  - 缓解：词典文件可压缩，增量小
- **词典版本过旧**：内置词典可能不是最新版本
  - 缓解：用户可通过导入功能更新
- **BDIC 格式兼容性**：不同版本 Electron 可能需要不同格式的词典
  - 缓解：当前使用的词典与 Electron 28 兼容

### Trade-offs
- 增加包体积 vs 离线可用性 → 选择离线可用
- 预置多语言 vs 单语言 + 手动导入 → 选择单语言 + 手动导入（减少体积）
- 自动更新 vs 手动导入 → 选择手动导入（简化实现）
