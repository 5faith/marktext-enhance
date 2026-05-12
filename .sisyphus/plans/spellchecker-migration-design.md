# 拼写检查迁移设计文档

## 1. 概述

### 1.1 目标
将 MarkText 的拼写检查功能从 `@hfelix/electron-spellchecker` 迁移到 Electron 内置拼写检查 API。

### 1.2 背景
- `@hfelix/spellchecker` v4.1.0 已停止维护（5年前发布）
- Windows + VS2022 编译失败（C++ 语法错误）
- Electron 8+ 已内置完整的拼写检查功能

### 1.3 范围
- **包含**：渲染进程的拼写检查功能迁移
- **不包含**：主进程逻辑、用户词典迁移（Electron 自动管理）

---

## 2. 架构设计

### 2.1 当前架构

```
┌─────────────────────────────────────────────────────────────┐
│  Renderer Process                                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  @hfelix/electron-spellchecker                      │  │
│  │  ├─ SpellCheckHandler (provider)                    │  │
│  │  ├─ Native module (@hfelix/spellchecker)           │  │
│  │  └─ Hunspell dictionaries (.bdic files)             │  │
│  └──────────────────────────────────────────────────────┘  │
│                          │                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  SpellChecker (wrapper class)                        │  │
│  │  ├─ isMisspelled()                                  │  │
│  │  ├─ getWordSuggestion()                              │  │
│  │  ├─ addToDictionary()                              │  │
│  │  ├─ switchLanguage()                               │  │
│  │  └─ getAvailableDictionaries()                     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 新架构

```
┌─────────────────────────────────────────────────────────────┐
│  Renderer Process                                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Electron Built-in SpellChecker                     │  │
│  │  ├─ webContents.session.spellCheckerEnabled         │  │
│  │  ├─ session.setSpellCheckerLanguages()              │  │
│  │  ├─ session.addWordToSpellCheckerDictionary()       │  │
│  │  ├─ session.availableSpellCheckerLanguages          │  │
│  │  └─ context-menu event (dictionarySuggestions)      │  │
│  └──────────────────────────────────────────────────────┘  │
│                          │                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  SpellChecker (wrapper class) - Simplified          │  │
│  │  ├─ enable() / disable()                           │  │
│  │  ├─ switchLanguage()                                │  │
│  │  ├─ addToDictionary()                              │  │
│  │  └─ getAvailableLanguages()                         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. 组件设计

### 3.1 SpellChecker 类重构

**文件**: `src/renderer/spellchecker/index.js`

**核心变化**:
- 移除对 `@hfelix/electron-spellchecker` 的依赖
- 直接使用 Electron 内置 API
- 简化架构，移除 provider 封装层

**新 API 设计**:

```javascript
class SpellChecker {
  constructor () {
    this.isEnabled = false
    this.currentLanguage = 'en-US'
    this.webContents = null
  }

  /**
   * 初始化拼写检查器
   * @param {Object} options - 配置选项
   */
  async initialize (options = {}) {
    // 获取当前窗口的 webContents
    const { webContents } = require('@electron/remote').getCurrentWindow()
    this.webContents = webContents
    
    // 设置拼写检查器
    webContents.session.spellCheckerEnabled = options.enabled !== false
    this.isEnabled = options.enabled !== false
    
    // 设置语言
    if (options.language) {
      await this.switchLanguage(options.language)
    }
  }

  /**
   * 启用拼写检查
   */
  enable () {
    if (this.webContents) {
      this.webContents.session.spellCheckerEnabled = true
      this.isEnabled = true
    }
  }

  /**
   * 禁用拼写检查
   */
  disable () {
    if (this.webContents) {
      this.webContents.session.spellCheckerEnabled = false
      this.isEnabled = false
    }
  }

  /**
   * 切换语言
   * @param {string} lang - 语言代码 (如 'en-US', 'zh-CN')
   */
  async switchLanguage (lang) {
    if (!this.webContents) return false
    
    // 检查语言是否可用
    const available = this.webContents.session.availableSpellCheckerLanguages
    if (!available.includes(lang)) {
      console.warn(`Language ${lang} is not available`)
      return false
    }
    
    this.webContents.session.setSpellCheckerLanguages([lang])
    this.currentLanguage = lang
    return true
  }

  /**
   * 获取可用语言列表
   * @returns {string[]} 可用语言代码数组
   */
  getAvailableLanguages () {
    if (!this.webContents) return []
    return this.webContents.session.availableSpellCheckerLanguages
  }

  /**
   * 添加单词到词典
   * @param {string} word - 要添加的单词
   */
  async addToDictionary (word) {
    if (!this.webContents) return false
    
    try {
      await this.webContents.session.addWordToSpellCheckerDictionary(word)
      return true
    } catch (error) {
      console.error('Failed to add word to dictionary:', error)
      return false
    }
  }

  /**
   * 从词典移除单词
   * @param {string} word - 要移除的单词
   */
  async removeFromDictionary (word) {
    if (!this.webContents) return false
    
    try {
      await this.webContents.session.removeWordFromSpellCheckerDictionary(word)
      return true
    } catch (error) {
      console.error('Failed to remove word from dictionary:', error)
      return false
    }
  }
}
```

### 3.2 右键菜单重构

**文件**: `src/renderer/contextMenu/editor/spellcheck.js`

**核心变化**:
- 从 `context-menu` 事件获取拼写建议
- 使用 `webContents.replaceMisspelling()` 替换单词

**新实现**:

```javascript
// 在编辑器组件中监听 context-menu 事件
window.addEventListener('contextmenu', (event) => {
  // 阻止默认右键菜单
  event.preventDefault()
  
  // 获取当前选中的单词
  const selectedWord = getSelectedWord()
  
  // 显示自定义右键菜单
  showSpellcheckMenu(selectedWord)
})

// 监听 Electron 的 context-menu 事件获取拼写建议
const { webContents } = require('@electron/remote').getCurrentWindow()
webContents.on('context-menu', (event, params) => {
  const { dictionarySuggestions, misspelledWord } = params
  
  // 存储建议供后续使用
  window.spellcheckSuggestions = {
    word: misspelledWord,
    suggestions: dictionarySuggestions
  }
})

/**
 * 构建拼写检查菜单
 */
export const buildSpellcheckMenu = (spellchecker, selectedWord) => {
  const menuItems = []
  const suggestions = window.spellcheckSuggestions
  
  // 如果有拼写建议，显示它们
  if (suggestions && suggestions.word === selectedWord && suggestions.suggestions.length > 0) {
    suggestions.suggestions.forEach(suggestion => {
      menuItems.push({
        label: suggestion,
        click: () => {
          webContents.replaceMisspelling(suggestion)
        }
      })
    })
    
    menuItems.push({ type: 'separator' })
  }
  
  // 添加到词典
  menuItems.push({
    label: 'Add to Dictionary',
    click: () => {
      spellchecker.addToDictionary(selectedWord)
      webContents.replaceMisspelling(selectedWord) // 移除下划线
    }
  })
  
  // 忽略单词
  menuItems.push({
    label: 'Ignore',
    click: () => {
      webContents.replaceMisspelling(selectedWord)
    }
  })
  
  return menuItems
}
```

### 3.3 偏好设置界面调整

**文件**: `src/renderer/prefComponents/spellchecker/index.vue`

**核心变化**:
- 移除 Hunspell 相关设置（下载、更新词典）
- 保留语言选择和启用/禁用选项
- 使用新的 API 获取可用语言

**调整内容**:

```javascript
// 获取可用语言列表
const availableLanguages = computed(() => {
  const { webContents } = require('@electron/remote').getCurrentWindow()
  const languages = webContents.session.availableSpellCheckerLanguages
  
  // 转换为选项格式
  return languages.map(lang => ({
    value: lang,
    label: getLanguageName(lang) // 使用现有的 languageMap.js
  }))
})

// 切换语言
const handleLanguageChange = async (lang) => {
  const { webContents } = require('@electron/remote').getCurrentWindow()
  webContents.session.setSpellCheckerLanguages([lang])
}
```

---

## 4. 国内网络问题解决方案

### 4.1 问题
Electron 内置拼写检查默认从 Google CDN 下载词典，在国内可能无法访问。

### 4.2 解决方案

**方案 1：配置自定义词典下载 URL（推荐）**

```javascript
// 在主进程中配置
const { session } = require('electron')

// 使用国内镜像或自定义 CDN
session.defaultSession.setSpellCheckerDictionaryDownloadURL(
  'https://your-mirror-domain.com/dictionaries/'
)
```

**方案 2：预置词典文件**

```javascript
// 在应用打包时包含词典文件
// 放在 resources/dictionaries/ 目录下
// Electron 会优先使用本地词典
```

**方案 3：禁用自动下载，手动管理**

```javascript
// 禁用拼写检查器的自动下载
// 用户手动下载词典文件到指定目录
```

**实施建议**:
- 默认使用方案 1，配置国内可用的 CDN
- 提供配置选项让用户自定义词典 URL
- 在文档中说明如何手动配置

---

## 5. 文件变更清单

### 5.1 修改的文件

| 文件 | 变更类型 | 说明 |
|------|---------|------|
| `src/renderer/spellchecker/index.js` | 重写 | 使用 Electron 内置 API |
| `src/renderer/contextMenu/editor/spellcheck.js` | 重写 | 使用 context-menu 事件 |
| `src/renderer/prefComponents/spellchecker/index.vue` | 调整 | 移除 Hunspell 相关功能 |
| `src/renderer/components/editorWithTabs/editor.vue` | 调整 | 更新拼写检查初始化 |

### 5.2 删除的文件

| 文件 | 说明 |
|------|------|
| `src/renderer/spellchecker/dictionaryDownloader.js` | Electron 自动管理词典 |
| `src/renderer/shims/electron-spellchecker.js` | 不再需要 |

### 5.3 依赖变更

**package.json**:
```json
{
  "dependencies": {
    // 移除
    "@hfelix/electron-spellchecker": "^2.0.0",
    
    // 保留（如果其他地方使用）
    // ...
  }
}
```

---

## 6. 测试策略

### 6.1 功能测试

- [ ] 拼写检查启用/禁用
- [ ] 拼写错误标记显示
- [ ] 右键菜单拼写建议
- [ ] 添加到词典
- [ ] 语言切换
- [ ] 多语言支持

### 6.2 平台测试

- [ ] Windows 10/11
- [ ] macOS
- [ ] Linux

### 6.3 网络测试

- [ ] 国内网络环境词典下载
- [ ] 自定义词典 URL 配置

---

## 7. 风险评估

| 风险 | 可能性 | 影响 | 缓解措施 |
|------|--------|------|----------|
| 国内网络问题 | 高 | 中 | 配置国内 CDN 镜像 |
| 语言切换需重启 | 中 | 低 | 文档说明，用户可接受 |
| API 不兼容 | 低 | 高 | 充分测试，保留回滚方案 |

---

## 8. 回滚方案

1. 保留旧代码备份分支
2. 如出现问题，可快速切换回 `@hfelix/electron-spellchecker`
3. 保留 `postinstall.js` 修复脚本作为备选

---

## 9. 实施计划

详见 `spellchecker-migration-implementation-plan.md`

---

## 10. 附录

### 10.1 Electron 拼写检查 API 参考

- [Electron SpellChecker Tutorial](https://www.electronjs.org/docs/latest/tutorial/spellchecker)
- [Session API - setSpellCheckerDictionaryDownloadURL](https://www.electronjs.org/docs/latest/api/session#sessetspellcheckerdictionarydownloadurlurl)

### 10.2 语言代码映射

保留现有的 `src/renderer/spellchecker/languageMap.js`，用于显示语言名称。
