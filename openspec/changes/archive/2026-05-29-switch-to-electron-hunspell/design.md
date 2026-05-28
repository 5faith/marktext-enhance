## Context

MarkText 当前的拼写检查系统完全依赖 Electron/Chromium 内置的 Hunspell 引擎。该引擎通过 `session.setSpellCheckerLanguages()` API 加载 `.bdic` 格式的词典文件。`.bdic` 是 Chromium 的二进制词典格式，由 `.dic` 和 `.aff` 文件编译而成。

用户希望直接使用原生 Hunspell 格式（`.dic` + `.aff`）的词典文件，特别是 `en_US.dic`。这些文件在 LibreOffice、Firefox 等应用中广泛使用，但 Electron 不直接支持。

## Goals / Non-Goals

**Goals:**

- 使用 `electron-hunspell` 库替代 Electron 内置拼写检查器
- 支持直接加载 `.dic` 和 `.aff` 格式的词典文件
- 将 `en_US.dic` 和 `en_US.aff` 作为默认内置词典
- 保持现有的拼写检查用户体验（红色波浪线、右键菜单建议）

**Non-Goals:**

- 不修改 Muya 编辑器的渲染层（波浪线由浏览器原生渲染）
- 不支持自动语言检测（保持现有行为）
- 不迁移现有的 `.bdic` 词典文件

## Decisions

### Decision 1: 使用 electron-hunspell 而非纯 JS 库（nspell）

**选择**: `electron-hunspell`

**理由**:

- 专门为 Electron 应用设计，与 Electron 集成更紧密
- 底层使用 WebAssembly 实现的 Hunspell，性能优于纯 JS
- 提供完整的 `check()` 和 `suggest()` API
- 维护者是 Electron 社区的活跃贡献者

**备选方案**:

- `nspell`: 纯 JS 实现，包体积小，但性能可能不如 WASM
- `hunspell-wasm`: 更新的 WASM 实现，但缺少 Electron 专用集成

### Decision 2: 将词典文件打包到 resources 目录

**选择**: 将 `en_US.dic` 和 `en_US.aff` 复制到 `resources/hunspell_dictionaries/` 目录

**理由**:

- 与现有词典文件的位置保持一致
- 构建时通过 `electron-builder.yml` 自动打包到应用中
- 运行时通过 `__static` 全局变量访问

**实现细节**:

- 源文件: `D:\Desktop\en_extracted\en\en_US.dic` (551KB)
- 源文件: `D:\Desktop\en_extracted\en\en_US.aff` (3KB)
- 目标: `resources/hunspell_dictionaries/en_US.dic`
- 目标: `resources/hunspell_dictionaries/en_US.aff`

### Decision 3: 修改 SpellChecker 类的内部实现

**选择**: 保持 SpellChecker 类的公共 API 不变，仅修改内部实现

**理由**:

- 最小化对其他模块的影响
- 现有的调用代码（editor.vue, spellcheck.js）无需修改
- 便于后续维护和测试

**内部变化**:

- 移除对 `session.setSpellChecker*` API 的调用
- 使用 `electron-hunspell` 的 `SpellChecker.create()` 初始化
- 实现 `check()` 和 `suggest()` 方法
- 词典导入逻辑改为支持 `.dic` 和 `.aff` 文件

### Decision 4: 波浪线渲染策略

**选择**: 继续使用 Electron 原生的波浪线渲染

**理由**:

- `electron-hunspell` 可以与 Electron 的拼写检查器集成
- 无需修改 Muya 编辑器的渲染层
- 保持最佳性能和用户体验

**风险**:

- 如果 `electron-hunspell` 无法与 Electron 原生集成，可能需要手动实现波浪线渲染
- 这是一个较大的改动，需要修改 Muya 的渲染逻辑

## Risks / Trade-offs

### Risk 1: electron-hunspell 与 Electron 版本兼容性

**风险**: `electron-hunspell` 可能不完全兼容 Electron 28

**缓解措施**:

- 检查 `electron-hunspell` 的文档和 issues
- 如果不兼容，考虑使用 `nspell` 作为备选方案

### Risk 2: 词典文件大小影响应用体积

**风险**: `en_US.dic` (551KB) + `en_US.aff` (3KB) 会增加应用体积

**缓解措施**:

- 这个大小是可以接受的（比现有的 `.bdic` 文件小）
- 可以考虑在后续版本中提供词典下载功能，减少内置词典数量

### Risk 3: 性能影响

**风险**: WebAssembly 拼写检查可能比 Chromium 原生实现慢

**缓解措施**:

- `electron-hunspell` 使用 WASM，性能接近原生
- 拼写检查是异步操作，不会阻塞 UI
- 可以通过缓存机制优化重复检查

### Risk 4: 需要同时加载 .dic 和 .aff 文件

**风险**: 用户可能只导入了 `.dic` 文件而没有 `.aff` 文件

**缓解措施**:

- 在 UI 中明确提示需要同时提供两个文件
- 验证导入时检查两个文件是否都存在
- 提供默认的 `.aff` 文件（如果缺失）
