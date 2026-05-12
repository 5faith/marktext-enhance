# @hfelix/spellchecker 升级方案

## 现状分析

### 当前问题
- **@hfelix/spellchecker v4.1.0** 已停止维护（5年前发布，已归档）
- Windows + VS2022 编译失败（C++ 语法错误）
- 依赖原生模块，安装复杂

### 当前使用情况
根据代码分析，MarkText 使用以下 API：
- `isMisspelled(word)` - 检查拼写
- `getCorrectionsForMisspelling(word)` / `getWordSuggestion(word)` - 获取建议
- `addToDictionary(word)` / `removeFromDictionary(word)` - 用户词典管理
- `switchLanguage(lang)` - 切换语言
- `getAvailableDictionaries()` - 获取可用词典
- `enableSpellchecker()` / `disableSpellchecker()` - 启用/禁用
- `ignoreWord(word)` - 忽略单词

支持 40+ 种语言，使用 Hunspell 词典（.bdic 格式）。

---

## 方案对比

### 方案 1: Electron 内置拼写检查（推荐 ⭐）

**Electron 从 v8 开始内置拼写检查，v9+ 默认启用**

#### 优点
- ✅ **官方支持**，与 Electron 版本同步更新
- ✅ **无需原生模块**，纯 JavaScript API
- ✅ **跨平台一致**，Windows/macOS/Linux 都支持
- ✅ **自动下载词典**，无需手动管理 Hunspell 文件
- ✅ **性能更好**，使用 Chromium 原生实现
- ✅ **安装简单**，`yarn install` 无需编译

#### 缺点
- ⚠️ 语言切换需要重启（Windows/Linux）
- ⚠️ 自定义词典 API 略有不同
- ⚠️ 需要重写部分集成代码

#### API 对比

| 功能 | @hfelix/spellchecker | Electron 内置 |
|------|---------------------|---------------|
| 检查拼写 | `isMisspelled(word)` | `webContents.session.spellCheckerEnabled` |
| 获取建议 | `getCorrectionsForMisspelling(word)` | `context-menu` 事件参数 |
| 添加到词典 | `addToDictionary(word)` | `session.addWordToSpellCheckerDictionary(word)` |
| 切换语言 | `switchLanguage(lang)` | `session.setSpellCheckerLanguages(['en-US'])` |
| 获取可用语言 | `getAvailableDictionaries()` | `session.availableSpellCheckerLanguages` |

#### 迁移工作量
- **中等**：需要重写 `src/renderer/spellchecker/index.js`
- 修改右键菜单处理（`context-menu` 事件）
- 调整偏好设置界面
- 测试所有功能

---

### 方案 2: 继续使用 @hfelix/spellchecker + 修复脚本

#### 优点
- ✅ **改动最小**，保持现有代码
- ✅ **功能完整**，所有现有功能继续工作

#### 缺点
- ❌ **技术债务**，依赖已归档项目
- ❌ **编译问题**，每次安装都需要修复
- ❌ **安全风险**，不再接收安全更新

#### 实施方式
保持现有的 `.electron-vue/postinstall.js` 修复脚本。

---

### 方案 3: 使用其他第三方库

#### 可选方案

**A. node-spellchecker (atom 原版)**
- 同样使用 Hunspell，也有编译问题
- 维护状态不明

**B. simple-spellchecker**
- 纯 JavaScript，但功能较弱
- 不支持多语言

**C. nspell (Hunspell 的 JS 实现)**
- 纯 JavaScript，但性能较差
- 需要自行加载词典文件

**D. electron-spellchecker-provider**
- 社区维护，但用户较少
- 功能可能不完整

#### 结论
**不推荐**，Electron 内置方案更成熟。

---

## 推荐方案：迁移到 Electron 内置拼写检查

### 迁移计划

#### Phase 1: 准备工作（1-2 天）
1. **备份当前代码**
   - 备份 `src/renderer/spellchecker/` 目录
   - 备份 `src/renderer/contextMenu/editor/spellcheck.js`

2. **创建 feature 分支**
   ```bash
   git checkout -b feature/migrate-to-electron-spellchecker
   ```

3. **阅读 Electron 文档**
   - 确认 Electron 28 的拼写检查 API
   - 测试基础功能

#### Phase 2: 核心迁移（3-5 天）

**任务 1: 修改主进程**
- 文件：`src/main/preferences/hunspell.js`
- 操作：移除 Hunspell 词典初始化逻辑
- 新逻辑：Electron 会自动下载词典

**任务 2: 重写 SpellChecker 类**
- 文件：`src/renderer/spellchecker/index.js`
- 新实现：
  ```javascript
  class SpellChecker {
    constructor () {
      this.enabled = false
      this.languages = []
    }

    enable () {
      const { webContents } = require('electron')
      webContents.getFocusedWebContents()?.session.setSpellCheckerEnabled(true)
      this.enabled = true
    }

    disable () {
      const { webContents } = require('electron')
      webContents.getFocusedWebContents()?.session.setSpellCheckerEnabled(false)
      this.enabled = false
    }

    switchLanguage (lang) {
      const { webContents } = require('electron')
      webContents.getFocusedWebContents()?.session.setSpellCheckerLanguages([lang])
    }

    addToDictionary (word) {
      const { webContents } = require('electron')
      webContents.getFocusedWebContents()?.session.addWordToSpellCheckerDictionary(word)
    }

    // ... 其他方法
  }
  ```

**任务 3: 修改右键菜单**
- 文件：`src/renderer/contextMenu/editor/spellcheck.js`
- 修改：监听 `context-menu` 事件获取拼写建议
- 新实现：
  ```javascript
  window.addEventListener('context-menu', (event, params) => {
    const suggestions = params.dictionarySuggestions
    const misspelledWord = params.misspelledWord
    // 构建右键菜单...
  })
  ```

**任务 4: 修改编辑器组件**
- 文件：`src/renderer/components/editorWithTabs/editor.vue`
- 修改：移除对旧 spellchecker API 的直接调用
- 使用新的 SpellChecker 类

**任务 5: 更新偏好设置**
- 文件：`src/renderer/prefComponents/spellchecker/index.vue`
- 修改：使用新的 API 获取可用语言列表
- 使用 `session.availableSpellCheckerLanguages`

**任务 6: 移除词典下载器**
- 文件：`src/renderer/spellchecker/dictionaryDownloader.js`
- 操作：删除（Electron 自动处理）

**任务 7: 更新 package.json**
- 移除 `@hfelix/electron-spellchecker` 依赖
- 移除相关的 postinstall 修复脚本

#### Phase 3: 测试（2-3 天）
1. **功能测试**
   - [ ] 拼写检查启用/禁用
   - [ ] 拼写错误标记显示
   - [ ] 右键菜单建议
   - [ ] 添加到词典
   - [ ] 语言切换
   - [ ] 多语言支持

2. **平台测试**
   - [ ] Windows 10/11
   - [ ] macOS
   - [ ] Linux

3. **回归测试**
   - [ ] 现有文档打开正常
   - [ ] 性能无退化

#### Phase 4: 清理（1 天）
1. 删除旧代码
   - `src/renderer/spellchecker/dictionaryDownloader.js`
   - `src/renderer/spellchecker/languageMap.js`（如不需要）
   - `.electron-vue/postinstall.js` 中的修复逻辑

2. 更新文档
   - 开发文档
   - 用户文档（如需要）

3. 代码审查

---

### 风险评估

| 风险 | 可能性 | 影响 | 缓解措施 |
|------|--------|------|----------|
| API 不兼容 | 中 | 高 | 充分测试，保留回滚方案 |
| 性能下降 | 低 | 中 | 性能测试对比 |
| 语言支持减少 | 低 | 中 | 验证所有需要的语言 |
| 用户词典迁移 | 中 | 中 | 提供迁移脚本 |

### 回滚方案
- 保留旧分支 `backup/legacy-spellchecker`
- 如出现问题，可快速切换回旧实现

---

## 实施建议

### 短期（保持现状）
继续使用现有的 `postinstall.js` 修复脚本，这是目前最稳定的方案。

### 中期（推荐）
实施 **方案 1：迁移到 Electron 内置拼写检查**
- 预计工作量：1-2 周
- 长期收益：减少技术债务，提高稳定性

### 长期
- 监控 Electron 拼写检查 API 的更新
- 考虑贡献代码到 Electron 社区

---

## 决策建议

**推荐选择：方案 1（迁移到 Electron 内置拼写检查）**

理由：
1. Electron 28 已经内置完整的拼写检查功能
2. 官方维护，长期稳定
3. 消除原生模块编译问题
4. 符合 MarkText 的技术栈升级方向（Vue 3 + Vite 迁移）

**下一步行动：**
1. 创建 feature 分支
2. 开始 Phase 1 准备工作
3. 逐步实施迁移

如需开始实施，请告诉我，我可以协助编写具体的迁移代码。
