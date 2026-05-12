# 拼写检查迁移实施计划

## 1. 概述

### 1.1 目标
将 MarkText 的拼写检查功能从 `@hfelix/electron-spellchecker` 迁移到 Electron 内置拼写检查 API。

### 1.2 预期成果
- 移除 `@hfelix/electron-spellchecker` 依赖
- 解决 Windows + VS2022 编译问题
- 使用 Electron 内置拼写检查 API
- 保持现有功能完整

### 1.3 时间线
- **总工期**: 5-7 天
- **开发**: 3-4 天
- **测试**: 2-3 天

---

## 2. 任务分解

### Wave 1: 准备阶段（第 1 天）

#### 任务 1.1: 创建特性分支
**负责人**: Developer
**耗时**: 0.5 小时
**依赖**: 无

**步骤**:
```bash
git checkout -b feature/migrate-to-electron-spellchecker
git push -u origin feature/migrate-to-electron-spellchecker
```

**验收标准**:
- [ ] 分支创建成功
- [ ] 分支推送到远程

---

#### 任务 1.2: 备份当前代码
**负责人**: Developer
**耗时**: 0.5 小时
**依赖**: 任务 1.1

**步骤**:
```bash
# 备份 spellchecker 目录
cp -r src/renderer/spellchecker src/renderer/spellchecker-backup

# 备份右键菜单
cp src/renderer/contextMenu/editor/spellcheck.js src/renderer/contextMenu/editor/spellcheck.js.backup

# 备份偏好设置
cp src/renderer/prefComponents/spellchecker/index.vue src/renderer/prefComponents/spellchecker/index.vue.backup
```

**验收标准**:
- [ ] 备份文件存在
- [ ] 可以恢复到原始状态

---

#### 任务 1.3: 创建测试环境
**负责人**: Developer
**耗时**: 1 小时
**依赖**: 任务 1.1

**步骤**:
1. 确保 Node.js 和 yarn 环境正常
2. 安装依赖（使用现有 postinstall 修复）
3. 验证当前拼写检查功能正常

**验收标准**:
- [ ] `yarn install` 成功
- [ ] 应用可以正常启动
- [ ] 拼写检查功能工作正常

---

### Wave 2: 核心迁移（第 2-3 天）

#### 任务 2.1: 重构 SpellChecker 类
**负责人**: Developer
**耗时**: 4 小时
**依赖**: 任务 1.3
**文件**: `src/renderer/spellchecker/index.js`

**步骤**:

1. **移除旧依赖导入**
```javascript
// 删除
import { SpellCheckHandler, fallbackLocales, normalizeLanguageCode } from '@hfelix/electron-spellchecker'
```

2. **重构 SpellChecker 类**
```javascript
import { getLanguageName } from './languageMap'

class SpellChecker {
  constructor () {
    this.isEnabled = false
    this.currentLanguage = 'en-US'
    this.webContents = null
    this.isHunspell = false
  }

  /**
   * 初始化拼写检查器
   */
  async initialize (options = {}) {
    const { webContents } = require('@electron/remote').getCurrentWindow()
    this.webContents = webContents
    
    // 设置拼写检查器
    webContents.session.spellCheckerEnabled = options.enabled !== false
    this.isEnabled = options.enabled !== false
    
    // 设置语言
    if (options.language) {
      await this.switchLanguage(options.language)
    }
    
    return true
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
   */
  async switchLanguage (lang) {
    if (!this.webContents) return false
    
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
   */
  getAvailableLanguages () {
    if (!this.webContents) return []
    return this.webContents.session.availableSpellCheckerLanguages
  }

  /**
   * 添加单词到词典
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

  /**
   * 忽略单词（当前运行时）
   */
  ignoreWord (word) {
    // Electron 内置拼写检查没有直接的 ignore API
    // 可以通过添加到词典来实现
    return this.addToDictionary(word)
  }

  /**
   * 检查单词是否拼写错误
   * 注意：Electron 内置拼写检查自动进行，此方法仅用于兼容性
   */
  isMisspelled (word) {
    // 返回 false，因为拼写检查由 Chromium 自动处理
    return false
  }

  /**
   * 获取拼写建议
   * 注意：通过 context-menu 事件获取
   */
  async getWordSuggestion (word) {
    // 返回空数组，建议通过 context-menu 事件获取
    return []
  }
}

// 导出单例
const spellChecker = new SpellChecker()
export default spellChecker
```

3. **保留辅助函数**
```javascript
// 保留这些函数，它们不依赖拼写检查器
export const offsetToWordCursor = (lineCursor, left, right) => { /* ... */ }
export const validateLineCursor = selection => { /* ... */ }
export const getDictionaryPath = () => { /* ... */ }
export const getAvailableHunspellDictionaries = () => { /* ... */ }
export const isOsSpellcheckerSupported = () => { /* ... */ }
```

**验收标准**:
- [ ] 代码编译无错误
- [ ] 类方法完整
- [ ] 导出正确

---

#### 任务 2.2: 重构右键菜单
**负责人**: Developer
**耗时**: 3 小时
**依赖**: 任务 2.1
**文件**: `src/renderer/contextMenu/editor/spellcheck.js`

**步骤**:

1. **修改导入**
```javascript
// 修改
import { getLanguageName } from '@/spellchecker/languageMap'
import { SEPARATOR } from './menuItems'
import spellChecker from '@/spellchecker'
```

2. **修改菜单构建函数**
```javascript
/**
 * 构建拼写检查菜单
 */
export default (selectedWord, wordSuggestions, replaceCallback) => {
  const menuItems = []
  
  if (!spellChecker.isEnabled) {
    return null
  }

  // 语言选择子菜单
  const currentLanguage = spellChecker.currentLanguage
  const availableLanguages = spellChecker.getAvailableLanguages()
  const languageSubmenu = []
  
  for (const lang of availableLanguages) {
    languageSubmenu.push(new RemoteMenuItem({
      label: getLanguageName(lang),
      enabled: lang !== currentLanguage,
      click () {
        spellChecker.switchLanguage(lang)
      }
    }))
  }
  
  menuItems.push(new RemoteMenuItem({
    label: 'Change Language...',
    submenu: languageSubmenu
  }))
  
  menuItems.push(SEPARATOR)

  // 处理拼写错误
  if (selectedWord && wordSuggestions && wordSuggestions.length > 0) {
    // 显示建议
    for (const suggestion of wordSuggestions) {
      menuItems.push(new RemoteMenuItem({
        label: suggestion,
        click () {
          replaceCallback(suggestion)
        }
      }))
    }
    
    menuItems.push(SEPARATOR)
    
    // 添加到词典
    menuItems.push(new RemoteMenuItem({
      label: 'Add to Dictionary',
      click () {
        spellChecker.addToDictionary(selectedWord)
      }
    }))
    
    // 忽略
    menuItems.push(new RemoteMenuItem({
      label: 'Ignore',
      click () {
        spellChecker.ignoreWord(selectedWord)
      }
    }))
  } else if (selectedWord) {
    // 单词正确，显示移除选项
    menuItems.push(new RemoteMenuItem({
      label: 'Remove from Dictionary',
      enabled: selectedWord.length >= 2,
      click () {
        spellChecker.removeFromDictionary(selectedWord)
      }
    }))
  }
  
  return menuItems
}
```

**验收标准**:
- [ ] 菜单显示正确
- [ ] 语言切换工作
- [ ] 添加到词典功能正常

---

#### 任务 2.3: 修改编辑器组件
**负责人**: Developer
**耗时**: 3 小时
**依赖**: 任务 2.2
**文件**: `src/renderer/components/editorWithTabs/editor.vue`

**步骤**:

1. **修改拼写检查初始化**
```javascript
// 在编辑器初始化时
import spellChecker from '@/spellchecker'

// ...

async initializeSpellChecker () {
  const preferences = usePreferencesStore()
  
  await spellChecker.initialize({
    enabled: preferences.spellcheckerEnabled,
    language: preferences.spellcheckerLanguage
  })
  
  // 监听 context-menu 事件获取拼写建议
  const { webContents } = require('@electron/remote').getCurrentWindow()
  webContents.on('context-menu', (event, params) => {
    this.spellcheckSuggestions = params.dictionarySuggestions
    this.misspelledWord = params.misspelledWord
  })
}
```

2. **修改右键菜单调用**
```javascript
// 在显示右键菜单时
showContextMenu({
  // ...
  spellcheckSuggestions: this.spellcheckSuggestions,
  misspelledWord: this.misspelledWord,
  // ...
})
```

**验收标准**:
- [ ] 编辑器初始化成功
- [ ] 右键菜单显示拼写建议
- [ ] 可以替换单词

---

#### 任务 2.4: 修改偏好设置界面
**负责人**: Developer
**耗时**: 2 小时
**依赖**: 任务 2.1
**文件**: `src/renderer/prefComponents/spellchecker/index.vue`

**步骤**:

1. **修改可用语言获取**
```javascript
import spellChecker from '@/spellchecker'

// ...

computed: {
  availableDictionaries () {
    const languages = spellChecker.getAvailableLanguages()
    return languages.map(lang => ({
      value: lang,
      label: getLanguageName(lang)
    }))
  }
}
```

2. **修改语言切换**
```javascript
methods: {
  async handleLanguageChange (lang) {
    await spellChecker.switchLanguage(lang)
    this.spellcheckerLanguage = lang
  }
}
```

3. **移除 Hunspell 相关 UI**
- 移除词典下载表格
- 移除下载/更新/删除按钮
- 保留语言选择

**验收标准**:
- [ ] 偏好设置页面正常显示
- [ ] 语言列表正确
- [ ] 语言切换工作

---

### Wave 3: 配置和清理（第 4 天）

#### 任务 3.1: 更新 package.json
**负责人**: Developer
**耗时**: 1 小时
**依赖**: 任务 2.4
**文件**: `package.json`

**步骤**:

1. **移除依赖**
```json
{
  "dependencies": {
    // 删除这一行
    "@hfelix/electron-spellchecker": "^2.0.0",
    // ...
  }
}
```

2. **更新 postinstall 脚本**
```javascript
// .electron-vue/postinstall.js
// 移除 @hfelix/spellchecker 修复逻辑

// 保留其他修复（如 windows-release）
```

**验收标准**:
- [ ] package.json 更新成功
- [ ] postinstall 脚本清理完成

---

#### 任务 3.2: 删除不需要的文件
**负责人**: Developer
**耗时**: 0.5 小时
**依赖**: 任务 3.1

**步骤**:

```bash
# 删除词典下载器
rm src/renderer/spellchecker/dictionaryDownloader.js

# 删除 shims
rm src/renderer/shims/electron-spellchecker.js

# 删除备份文件
rm -rf src/renderer/spellchecker-backup
rm src/renderer/contextMenu/editor/spellcheck.js.backup
rm src/renderer/prefComponents/spellchecker/index.vue.backup
```

**验收标准**:
- [ ] 文件删除成功
- [ ] 应用仍然可以编译

---

#### 任务 3.3: 配置国内词典镜像（可选）
**负责人**: Developer
**耗时**: 2 小时
**依赖**: 任务 3.2
**文件**: `src/main/index.js` 或新配置文件

**步骤**:

1. **在主进程中配置词典下载 URL**
```javascript
// src/main/index.js
const { session } = require('electron')

app.whenReady().then(() => {
  // 配置自定义词典下载 URL
  const customDictURL = process.env.SPELLCHECKER_DICT_URL || 
    'https://your-mirror-domain.com/dictionaries/'
  
  session.defaultSession.setSpellCheckerDictionaryDownloadURL(customDictURL)
})
```

2. **添加环境变量支持**
```javascript
// 在应用启动时检查环境变量
if (process.env.SPELLCHECKER_DICT_URL) {
  console.log('Using custom spellchecker dictionary URL:', process.env.SPELLCHECKER_DICT_URL)
}
```

**验收标准**:
- [ ] 配置生效
- [ ] 可以指定自定义词典 URL

---

### Wave 4: 测试阶段（第 5-7 天）

#### 任务 4.1: 功能测试
**负责人**: QA/Developer
**耗时**: 1 天
**依赖**: 任务 3.3

**测试用例**:

1. **启用/禁用拼写检查**
   - [ ] 可以在偏好设置中启用拼写检查
   - [ ] 可以在偏好设置中禁用拼写检查
   - [ ] 状态正确保存

2. **拼写错误标记**
   - [ ] 输入错误单词时显示下划线
   - [ ] 正确单词不显示下划线
   - [ ] 代码块中的单词不检查

3. **右键菜单**
   - [ ] 右键点击错误单词显示建议
   - [ ] 可以替换为建议单词
   - [ ] 可以添加到词典
   - [ ] 可以忽略单词

4. **语言切换**
   - [ ] 可以切换不同语言
   - [ ] 切换后拼写检查使用新语言
   - [ ] 可用语言列表正确

5. **用户词典**
   - [ ] 添加到词典的单词不再标记为错误
   - [ ] 从词典移除后重新标记为错误

**验收标准**:
- [ ] 所有测试用例通过

---

#### 任务 4.2: 平台测试
**负责人**: QA/Developer
**耗时**: 1 天
**依赖**: 任务 4.1

**测试环境**:
- Windows 10/11
- macOS
- Linux

**测试内容**:
- [ ] 在各平台上安装依赖无错误
- [ ] 在各平台上编译成功
- [ ] 拼写检查功能在各平台正常工作

**验收标准**:
- [ ] 所有平台测试通过

---

#### 任务 4.3: 网络测试（国内环境）
**负责人**: QA/Developer
**耗时**: 0.5 天
**依赖**: 任务 4.2

**测试内容**:
- [ ] 在国内网络环境下首次使用拼写检查
- [ ] 词典自动下载成功
- [ ] 或使用自定义词典 URL 成功

**验收标准**:
- [ ] 国内网络环境可用

---

#### 任务 4.4: 回归测试
**负责人**: QA/Developer
**耗时**: 0.5 天
**依赖**: 任务 4.3

**测试内容**:
- [ ] 现有文档打开正常
- [ ] 编辑功能正常
- [ ] 导出功能正常
- [ ] 性能无退化

**验收标准**:
- [ ] 无回归问题

---

## 3. 风险缓解

| 风险 | 缓解措施 |
|------|----------|
| 功能不完整 | 详细测试，与旧功能对比 |
| 国内网络问题 | 提供自定义词典 URL 配置 |
| 平台差异 | 在所有目标平台测试 |
| 性能问题 | 性能测试对比 |

---

## 4. 回滚方案

如果迁移失败：

1. **切换到备份分支**
```bash
git checkout backup/legacy-spellchecker
git checkout -b hotfix/rollback-spellchecker
```

2. **恢复备份文件**
```bash
cp -r src/renderer/spellchecker-backup/* src/renderer/spellchecker/
cp src/renderer/contextMenu/editor/spellcheck.js.backup src/renderer/contextMenu/editor/spellcheck.js
cp src/renderer/prefComponents/spellchecker/index.vue.backup src/renderer/prefComponents/spellchecker/index.vue
```

3. **恢复 package.json**
```bash
# 手动恢复 @hfelix/electron-spellchecker 依赖
```

4. **重新安装依赖**
```bash
yarn install
```

---

## 5. 提交和审查

### 提交策略

**提交 1**: SpellChecker 类重构
```
refactor(spellchecker): migrate to Electron built-in API

- Remove @hfelix/electron-spellchecker dependency
- Refactor SpellChecker class to use Electron built-in API
- Update initialization and language switching
```

**提交 2**: 右键菜单重构
```
refactor(context-menu): update spellcheck menu for Electron API

- Use context-menu event for spell suggestions
- Update menu item actions
```

**提交 3**: 偏好设置更新
```
refactor(preferences): update spellchecker settings UI

- Remove Hunspell-related UI
- Update language selection
```

**提交 4**: 清理和配置
```
chore(spellchecker): remove unused files and update config

- Remove dictionary downloader
- Remove shims
- Update package.json
- Add custom dictionary URL config
```

### 代码审查

**审查清单**:
- [ ] 代码风格符合项目规范
- [ ] 无冗余代码
- [ ] 错误处理完善
- [ ] 注释清晰
- [ ] 测试覆盖

---

## 6. 文档更新

### 6.1 开发文档
- 更新 `docs/dev/ARCHITECTURE.md` 中的拼写检查部分
- 添加 Electron 内置拼写检查 API 说明

### 6.2 用户文档
- 更新用户手册中的拼写检查说明
- 添加自定义词典 URL 配置说明

---

## 7. 验收标准

### 7.1 功能验收
- [ ] 所有拼写检查功能正常工作
- [ ] 右键菜单显示正确
- [ ] 语言切换正常
- [ ] 用户词典功能正常

### 7.2 技术验收
- [ ] 无 `@hfelix/electron-spellchecker` 依赖
- [ ] Windows + VS2022 编译成功
- [ ] 所有平台测试通过
- [ ] 代码审查通过

### 7.3 发布验收
- [ ] 文档更新完成
- [ ] 版本号更新
- [ ] 发布说明编写

---

## 8. 附录

### 8.1 参考文档
- [Electron SpellChecker Tutorial](https://www.electronjs.org/docs/latest/tutorial/spellchecker)
- [Session API Documentation](https://www.electronjs.org/docs/latest/api/session)

### 8.2 相关文件
- 设计文档: `spellchecker-migration-design.md`
- 备份分支: `backup/legacy-spellchecker`
