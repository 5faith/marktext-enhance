# Builtin Spellchecker Dictionaries Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 内置拼写检查词典到应用，实现离线可用，并支持用户手动导入自定义词典

**Architecture:** 在 `static/dictionaries/` 目录内置 `en-US.bdic` 词典文件，通过 `editor.js` 配置本地加载路径，修改 `SpellChecker` 类支持扫描内置和用户词典目录，在偏好设置 UI 添加导入功能。

**Tech Stack:** Electron, Vue 3, Pinia, Element Plus

---

## File Structure

| File | Responsibility |
|------|----------------|
| `static/dictionaries/en-US.bdic` | 内置词典文件 |
| `src/main/windows/editor.js` | 配置本地词典加载路径 |
| `src/renderer/spellchecker/index.js` | 拼写检查器核心逻辑 |
| `src/renderer/prefComponents/spellchecker/index.vue` | 偏好设置 UI |

---

### Task 1: 复制内置词典文件

**Files:**
- Copy: `resources/hunspell_dictionaries/en-US.bdic` → `static/dictionaries/en-US.bdic`

- [ ] **Step 1: 创建 dictionaries 目录并复制词典文件**

```powershell
New-Item -ItemType Directory -Force -Path "D:\workspace\github-my\marktext-enhance\static\dictionaries"
Copy-Item "D:\workspace\github-my\marktext-enhance\resources\hunspell_dictionaries\en-US.bdic" -Destination "D:\workspace\github-my\marktext-enhance\static\dictionaries\en-US.bdic"
```

- [ ] **Step 2: 验证词典文件存在且大小 > 8KB**

```powershell
$file = Get-Item "D:\workspace\github-my\marktext-enhance\static\dictionaries\en-US.bdic"
if ($file.Length -gt 8192) { "OK: $($file.Length) bytes" } else { "FAIL: File too small" }
```

- [ ] **Step 3: Commit**

```bash
git add static/dictionaries/en-US.bdic
git commit -m "feat: add builtin en-US spellchecker dictionary"
```

---

### Task 2: 配置本地词典加载路径

**Files:**
- Modify: `src/main/windows/editor.js:71-78`

- [ ] **Step 1: 在 editor.js 中添加 setSpellCheckerDictionaryDownloadURL 配置**

```javascript
// 在 remoteEnable(win.webContents) 之后添加
// Use local Hunspell dictionary instead of downloading from CDN
win.webContents.session.setSpellCheckerDictionaryDownloadURL(
  `file://${path.join(__static, 'dictionaries')}/`
)
```

- [ ] **Step 2: 验证 lint 通过**

Run: `npx eslint src/main/windows/editor.js --no-error-on-unmatched-pattern`
Expected: No output (success)

- [ ] **Step 3: Commit**

```bash
git add src/main/windows/editor.js
git commit -m "feat: configure local spellchecker dictionary path"
```

---

### Task 3: 修改 SpellChecker 初始化逻辑

**Files:**
- Modify: `src/renderer/spellchecker/index.js:127-141`
- Modify: `src/renderer/spellchecker/index.js:293-300`
- Modify: `src/renderer/spellchecker/index.js:470-483`

- [ ] **Step 1: 修改 _initSpellchecker() 添加错误处理**

```javascript
_initSpellchecker () {
  const webContents = getWebContents()
  if (!webContents) {
    return
  }

  // Enable the spell checker on the session
  webContents.session.setSpellCheckerEnabled(true)

  // Check available languages and pick a valid one
  const available = webContents.session.availableSpellCheckerLanguages || []
  let lang = 'en-US'
  if (!available.includes(lang)) {
    lang = available[0] || ''
  }

  if (lang) {
    try {
      webContents.session.setSpellCheckerLanguages([lang])
      this._lang = lang
      this.isEnabled = true
    } catch (e) {
      console.error('Failed to init spell checker:', e.message)
    }
  }
}
```

- [ ] **Step 2: 修改 getAvailableDictionaries() 扫描两个目录**

```javascript
getAvailableDictionaries () {
  const webContents = getWebContents()
  if (!webContents) {
    return []
  }

  const available = webContents.session.availableSpellCheckerLanguages || []
  
  // Scan userData/dictionaries/ for user-imported dictionaries
  const userDataDictPath = path.join(
    global.marktext?.paths?.userDataPath || '',
    'dictionaries'
  )
  
  const userDicts = []
  if (fs.existsSync(userDataDictPath)) {
    const files = fs.readdirSync(userDataDictPath)
    files.forEach(filename => {
      const match = filename.match(/^([a-z]{2}(?:[-][A-Z]{2})?)\.bdic$/)
      if (match && match[1] && !available.includes(match[1])) {
        userDicts.push(match[1])
      }
    })
  }

  return [...new Set([...available, ...userDicts])]
}
```

- [ ] **Step 3: 修改 _switchLanguage() 添加词典文件存在性检查**

```javascript
async _switchLanguage (lang) {
  const webContents = getWebContents()
  if (!webContents) {
    return null
  }

  const available = webContents.session.availableSpellCheckerLanguages || []
  if (!available.includes(lang)) {
    // Try to find a fallback: en-US > en > first available
    const fallback = available.find(l => l.startsWith('en')) || available[0]
    if (!fallback) {
      return null
    }
    lang = fallback
  }

  try {
    webContents.session.setSpellCheckerLanguages([lang])
    this._lang = lang
    return this._lang
  } catch (e) {
    return null
  }
}
```

- [ ] **Step 4: 添加必要的 import**

在文件顶部添加：
```javascript
import fs from 'fs'
import path from 'path'
```

- [ ] **Step 5: 验证 lint 通过**

Run: `npx eslint src/renderer/spellchecker/index.js --no-error-on-unmatched-pattern`
Expected: No output (success)

- [ ] **Step 6: Commit**

```bash
git add src/renderer/spellchecker/index.js
git commit -m "feat: update SpellChecker to support builtin and user dictionaries"
```

---

### Task 4: 添加导入词典方法

**Files:**
- Modify: `src/renderer/spellchecker/index.js` (add new methods after line 277)

- [ ] **Step 1: 添加 importDictionary 方法**

```javascript
/**
 * Import a dictionary file.
 *
 * @param {string} sourcePath The path to the .bdic file to import.
 * @returns {Promise<{success: boolean, message: string}>}
 */
async importDictionary (sourcePath) {
  // Validate file extension
  if (!sourcePath.endsWith('.bdic')) {
    return { success: false, message: '仅支持 .bdic 格式的词典文件' }
  }

  // Validate file size
  const stats = fs.statSync(sourcePath)
  if (stats.size <= 8192) {
    return { success: false, message: '词典文件无效或已损坏' }
  }

  // Get userData dictionaries path
  const userDataDictPath = path.join(
    global.marktext?.paths?.userDataPath || '',
    'dictionaries'
  )

  // Ensure directory exists
  if (!fs.existsSync(userDataDictPath)) {
    fs.mkdirSync(userDataDictPath, { recursive: true })
  }

  // Copy file
  const filename = path.basename(sourcePath)
  const destPath = path.join(userDataDictPath, filename)
  fs.copyFileSync(sourcePath, destPath)

  return { success: true, message: '词典导入成功' }
}

/**
 * Get user dictionaries path.
 *
 * @returns {string} The path to user dictionaries directory.
 */
getUserDictionariesPath () {
  return path.join(
    global.marktext?.paths?.userDataPath || '',
    'dictionaries'
  )
}
```

- [ ] **Step 2: 验证 lint 通过**

Run: `npx eslint src/renderer/spellchecker/index.js --no-error-on-unmatched-pattern`
Expected: No output (success)

- [ ] **Step 3: Commit**

```bash
git add src/renderer/spellchecker/index.js
git commit -m "feat: add importDictionary method to SpellChecker"
```

---

### Task 5: 更新偏好设置 UI

**Files:**
- Modify: `src/renderer/prefComponents/spellchecker/index.vue`

- [ ] **Step 1: 在 template 中添加导入按钮**

在 `</template>` 前添加：
```html
<div class="pref-spellchecker-import">
  <el-button size="small" @click="handleImportDictionary">
    导入词典
  </el-button>
</div>
```

- [ ] **Step 2: 在 script 中添加导入方法**

在 `methods` 中添加：
```javascript
async handleImportDictionary () {
  const { dialog } = require('electron').remote || require('@electron/remote')
  const result = await dialog.showOpenDialog({
    title: '选择词典文件',
    filters: [
      { name: 'Hunspell Dictionary', extensions: ['bdic'] }
    ],
    properties: ['openFile']
  })

  if (result.canceled || !result.filePaths.length) {
    return
  }

  const filePath = result.filePaths[0]
  const { SpellChecker } = require('@/spellchecker')
  const spellchecker = new SpellChecker(false)
  
  const importResult = await spellchecker.importDictionary(filePath)
  
  if (importResult.success) {
    this.$message.success(importResult.message)
    this.refreshDictionaryList()
  } else {
    this.$message.error(importResult.message)
  }
},

refreshDictionaryList () {
  // Refresh the language select options
  this.$forceUpdate()
}
```

- [ ] **Step 3: 添加样式**

在 `<style scoped>` 中添加：
```css
.pref-spellchecker-import {
  margin-top: 16px;
}
```

- [ ] **Step 4: 验证 lint 通过**

Run: `npx eslint src/renderer/prefComponents/spellchecker/index.vue --no-error-on-unmatched-pattern`
Expected: No output (success)

- [ ] **Step 5: Commit**

```bash
git add src/renderer/prefComponents/spellchecker/index.vue
git commit -m "feat: add dictionary import button to spellchecker preferences"
```

---

### Task 6: 测试验证

- [ ] **Step 1: 测试离线环境下拼写检查器正常工作**

Run: `yarn dev`
Expected: 启动后拼写检查器正常工作，无 "Language en-US is not available" 错误

- [ ] **Step 2: 测试导入有效词典文件成功**

1. 打开偏好设置 → Spelling
2. 点击"导入词典"按钮
3. 选择一个有效的 .bdic 文件
4. 预期：显示"词典导入成功"提示

- [ ] **Step 3: 测试导入无效文件显示错误提示**

1. 点击"导入词典"按钮
2. 选择一个 .txt 文件（重命名为 .bdic）
3. 预期：显示"词典文件无效或已损坏"提示

- [ ] **Step 4: 测试词典列表正确合并内置和用户词典**

1. 打开偏好设置 → Spelling
2. 查看语言选择下拉框
3. 预期：包含 en-US 和用户导入的词典语言

- [ ] **Step 5: Final Commit**

```bash
git add -A
git commit -m "feat: complete builtin spellchecker dictionaries implementation"
```
