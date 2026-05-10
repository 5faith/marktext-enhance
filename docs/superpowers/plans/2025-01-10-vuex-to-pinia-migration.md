# Vuex 到 Pinia 迁移实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 完全移除项目中遗留的 Vuex 依赖和代码，确认 Pinia 已完全接管状态管理。

**架构：** 采用渐进式三阶段策略：Phase 1 移除依赖和入口文件，Phase 2 验证应用正常运行，Phase 3 清理遗留代码。每阶段都有明确的验证步骤确保安全性。

**Tech Stack:** Vue 3, Pinia, Electron, Yarn

---

## 前置检查

**开始实施前，请确认：**
- [ ] 当前分支干净（`git status` 显示无未提交更改）
- [ ] 已阅读设计文档 `docs/superpowers/specs/2025-01-10-vuex-to-pinia-migration-design.md`

---

## Phase 1: 移除 Vuex 依赖和入口文件

### Task 1: 从 package.json 移除 vuex 依赖

**Files:**
- Modify: `package.json`

- [ ] **Step 1: 编辑 package.json 移除 vuex**

  打开 `package.json`，在 `dependencies` 部分找到并删除 `"vuex": "^4"` 这一行。

  **修改前:**
  ```json
  "dependencies": {
    ...
    "vue": "^3.4",
    "vue-router": "^4",
    "vuex": "^4",
    ...
  }
  ```

  **修改后:**
  ```json
  "dependencies": {
    ...
    "vue": "^3.4",
    "vue-router": "^4",
    ...
  }
  ```

- [ ] **Step 2: 验证修改**

  运行命令检查 vuex 是否已从 package.json 中移除：
  ```bash
  grep "vuex" package.json
  ```
  
  **Expected:** 无输出（vuex 已不存在）

- [ ] **Step 3: 更新依赖**

  ```bash
  yarn install
  ```
  
  **Expected:** 安装成功，无错误

- [ ] **Step 4: 验证 node_modules**

  ```bash
  ls node_modules/vuex 2>/dev/null || echo "vuex not found (correct)"
  ```
  
  **Expected:** 输出 "vuex not found (correct)"

- [ ] **Step 5: Commit**

  ```bash
  git add package.json yarn.lock
  git commit -m "chore: remove vuex dependency from package.json"
  ```

---

### Task 2: 删除 Vuex Store 入口文件

**Files:**
- Delete: `src/renderer/store/index.js`

- [ ] **Step 1: 删除 index.js**

  ```bash
  rm src/renderer/store/index.js
  ```

- [ ] **Step 2: 验证删除**

  ```bash
  ls src/renderer/store/index.js 2>/dev/null || echo "File deleted (correct)"
  ```
  
  **Expected:** 输出 "File deleted (correct)"

- [ ] **Step 3: Commit**

  ```bash
  git add src/renderer/store/index.js
  git commit -m "chore: remove vuex store entry point"
  ```

---

## Phase 2: 验证

### Task 3: 运行开发服务器验证

**Files:**
- Verify: 应用正常启动

- [ ] **Step 1: 启动开发服务器**

  ```bash
  yarn dev
  ```
  
  **Expected:** 
  - 编译成功
  - Electron 窗口正常打开
  - 控制台无 Vuex 相关错误

- [ ] **Step 2: 检查控制台输出**

  查看终端输出，确认：
  - 无 "vuex" 相关错误
  - 无 "Store" 未定义错误
  - 应用正常初始化

- [ ] **Step 3: 停止开发服务器**

  按 `Ctrl+C` 停止开发服务器。

---

### Task 4: 运行 ESLint 检查

**Files:**
- Verify: 无语法错误

- [ ] **Step 1: 运行 lint**

  ```bash
  yarn lint
  ```
  
  **Expected:** 
  - 无错误（error）
  - 可能有警告（warning），但无阻塞性错误

- [ ] **Step 2: 如有错误则修复**

  如果 lint 报错，运行：
  ```bash
  yarn lint:fix
  ```

- [ ] **Step 3: Commit lint 修复（如有）**

  ```bash
  git add -A
  git commit -m "style: fix lint issues" || echo "No changes to commit"
  ```

---

### Task 5: 运行构建验证

**Files:**
- Verify: 构建成功

- [ ] **Step 1: 运行构建**

  ```bash
  yarn build
  ```
  
  **Expected:** 
  - Vite 构建成功
  - electron-builder 打包成功
  - 无 Vuex 相关错误

- [ ] **Step 2: 检查构建输出**

  ```bash
  ls dist/
  ```
  
  **Expected:** 存在 `dist/` 目录且包含构建产物

---

## Phase 3: 清理遗留代码

### Task 6: 删除 Vuex Store 目录

**Files:**
- Delete: `src/renderer/store/` 目录及所有内容

- [ ] **Step 1: 列出待删除文件**

  ```bash
  ls -la src/renderer/store/
  ```
  
  **Expected:** 显示以下文件：
  - autoUpdates.js
  - commandCenter.js
  - editor.js
  - help.js
  - index.js（已删除）
  - layout.js
  - listenForMain.js
  - notification.js
  - preferences.js
  - project.js
  - treeCtrl.js
  - tweet.js

- [ ] **Step 2: 删除整个目录**

  ```bash
  rm -rf src/renderer/store/
  ```

- [ ] **Step 3: 验证删除**

  ```bash
  ls src/renderer/store/ 2>/dev/null || echo "Directory deleted (correct)"
  ```
  
  **Expected:** 输出 "Directory deleted (correct)"

- [ ] **Step 4: Commit**

  ```bash
  git add src/renderer/store/
  git commit -m "chore: remove legacy vuex store directory"
  ```

---

## Phase 4: 最终验证

### Task 7: 最终功能验证

**Files:**
- Verify: 应用功能完全正常

- [ ] **Step 1: 再次启动开发服务器**

  ```bash
  yarn dev
  ```
  
  **Expected:** 
  - 编译成功
  - Electron 窗口正常打开
  - 控制台无错误

- [ ] **Step 2: 测试核心功能**

  手动测试以下功能：
  - [ ] 创建新文件
  - [ ] 编辑文本
  - [ ] 保存文件
  - [ ] 切换主题
  - [ ] 打开侧边栏

- [ ] **Step 3: 停止开发服务器**

  按 `Ctrl+C` 停止开发服务器。

---

### Task 8: 最终检查

**Files:**
- Verify: 所有成功标准达成

- [ ] **Step 1: 验证 package.json**

  ```bash
  grep "vuex" package.json && echo "FAIL: vuex still in package.json" || echo "PASS: vuex removed from package.json"
  ```
  
  **Expected:** "PASS: vuex removed from package.json"

- [ ] **Step 2: 验证 store 目录已删除**

  ```bash
  [ -d "src/renderer/store" ] && echo "FAIL: store directory still exists" || echo "PASS: store directory removed"
  ```
  
  **Expected:** "PASS: store directory removed"

- [ ] **Step 3: 验证 Pinia 仍在工作**

  ```bash
  grep -r "useRootStore\|useEditorStore" src/renderer/ | head -5
  ```
  
  **Expected:** 显示多个 Pinia store 引用

- [ ] **Step 4: 查看 git 日志**

  ```bash
  git log --oneline -5
  ```
  
  **Expected:** 显示最近的 commits：
  - "chore: remove legacy vuex store directory"
  - "chore: remove vuex store entry point"
  - "chore: remove vuex dependency from package.json"

---

## 完成总结

**所有任务完成后：**

✅ **成功标准检查清单：**
- [ ] `package.json` 中无 `vuex` 依赖
- [ ] `src/renderer/store/` 目录已删除
- [ ] `yarn dev` 正常启动
- [ ] `yarn lint` 无错误
- [ ] `yarn build` 构建成功
- [ ] 应用功能正常

**迁移完成！** Vuex 已完全从项目中移除，Pinia 继续正常运作。

---

## 回滚指南

**如果出现问题需要回滚：**

```bash
# 回滚到迁移前状态
git log --oneline -10  # 找到迁移前的 commit
git reset --hard <commit-before-migration>
yarn install
```

**或者逐步回滚：**
```bash
# 回滚最后一次 commit
git reset --soft HEAD~1
git checkout -- src/renderer/store/
git checkout -- package.json
yarn install
```

---

**计划结束**
