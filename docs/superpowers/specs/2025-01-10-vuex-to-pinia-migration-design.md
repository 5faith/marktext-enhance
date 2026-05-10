# Vuex 到 Pinia 迁移设计文档

**日期**: 2025-01-10  
**作者**: Claude Code  
**状态**: 待评审

---

## 1. 概述

### 1.1 目标
将 MarkText 项目中遗留的 Vuex 代码完全移除，确认 Pinia 已完全接管状态管理。

### 1.2 背景
MarkText 项目已完成从 Vue 2/Webpack 到 Vue 3/Vite 的迁移（见 `docs/dev/VUE3_MIGRATION.md`）。状态管理也从 Vuex 迁移到了 Pinia。目前 Pinia 已完全运行，但 Vuex 的依赖和遗留代码仍然存在。

### 1.3 范围
- 移除 `package.json` 中的 `vuex` 依赖
- 删除 `src/renderer/store/` 目录（Vuex 遗留代码）
- 验证应用正常运行

---

## 2. 当前状态分析

### 2.1 Pinia 现状（已迁移完成）
- **位置**: `src/renderer/stores/`
- **模块数**: 10 个 store 模块
  - `autoUpdates.js`
  - `commandCenter.js`
  - `editor.js`
  - `layout.js`
  - `listenForMain.js`
  - `notification.js`
  - `preferences.js`
  - `project.js`
  - `root.js`
  - `tweet.js`
- **初始化**: `src/renderer/main.js` 第 71-76 行
- **使用情况**: 298 处引用，完全接管状态管理

### 2.2 Vuex 现状（待移除）
- **依赖**: `package.json` 中 `"vuex": "^4"`
- **代码**: `src/renderer/store/` 目录
  - `index.js` - Vuex store 入口
  - `autoUpdates.js`
  - `commandCenter.js`
  - `editor.js`
  - `help.js`
  - `layout.js`
  - `listenForMain.js`
  - `notification.js`
  - `preferences.js`
  - `project.js`
  - `treeCtrl.js`
  - `tweet.js`
- **引用情况**: 全局搜索确认无任何代码引用 Vuex

---

## 3. 迁移策略

采用**渐进式三阶段**策略，确保安全性。

### 3.1 Phase 1: 移除 Vuex 依赖和入口

**操作步骤**:
1. 从 `package.json` 的 `dependencies` 中移除 `"vuex": "^4"`
2. 删除 `src/renderer/store/index.js` 文件

**验证**:
- 运行 `yarn install` 更新依赖
- 确认 `node_modules/vuex` 已被移除

### 3.2 Phase 2: 验证

**操作步骤**:
1. 运行 `yarn dev` 验证应用正常启动
2. 运行 `yarn lint` 确保无语法错误
3. 运行 `yarn build` 确保构建成功

**成功标准**:
- 应用启动无报错
- 无 ESLint 错误
- 构建成功

### 3.3 Phase 3: 清理

**操作步骤**:
1. 删除整个 `src/renderer/store/` 目录
2. 再次运行 `yarn dev` 验证

**成功标准**:
- 应用功能完全正常
- 无运行时错误

---

## 4. 风险评估

### 4.1 风险等级
**低** - 已确认无代码引用 Vuex

### 4.2 风险点
| 风险 | 可能性 | 影响 | 缓解措施 |
|------|--------|------|----------|
| 遗漏的 Vuex 引用 | 低 | 高 | 全局搜索确认无引用 |
| 构建失败 | 低 | 中 | 渐进式迁移，每步验证 |
| 运行时错误 | 低 | 中 | 充分测试后再删除 |

### 4.3 回滚方案
如出现问题，可从 git 恢复：
```bash
git checkout HEAD -- package.json
yarn install
git checkout HEAD -- src/renderer/store/
```

---

## 5. 成功标准

- [ ] `package.json` 中无 `vuex` 依赖
- [ ] `src/renderer/store/` 目录已删除
- [ ] `yarn dev` 正常启动
- [ ] `yarn lint` 无错误
- [ ] `yarn build` 构建成功
- [ ] 应用功能正常

---

## 6. 实施计划

### 6.1 前置条件
- 当前分支干净（无未提交更改）
- 已备份或确认可回滚

### 6.2 实施步骤
1. **移除依赖** (5 分钟)
   - 编辑 `package.json`
   - 运行 `yarn install`

2. **删除入口** (2 分钟)
   - 删除 `src/renderer/store/index.js`

3. **验证** (10 分钟)
   - `yarn dev`
   - `yarn lint`
   - `yarn build`

4. **清理** (2 分钟)
   - 删除 `src/renderer/store/` 目录

5. **最终验证** (5 分钟)
   - 再次运行 `yarn dev`
   - 测试核心功能

**预计总时间**: 24 分钟

---

## 7. 附录

### 7.1 文件清单

**待删除**:
- `src/renderer/store/index.js`
- `src/renderer/store/autoUpdates.js`
- `src/renderer/store/commandCenter.js`
- `src/renderer/store/editor.js`
- `src/renderer/store/help.js`
- `src/renderer/store/layout.js`
- `src/renderer/store/listenForMain.js`
- `src/renderer/store/notification.js`
- `src/renderer/store/preferences.js`
- `src/renderer/store/project.js`
- `src/renderer/store/treeCtrl.js`
- `src/renderer/store/tweet.js`

**待修改**:
- `package.json` - 移除 `vuex` 依赖

### 7.2 验证命令

```bash
# 检查是否还有 Vuex 引用
grep -r "from 'vuex'\|from \"vuex\"\|import.*vuex" src/

# 检查 package.json
grep "vuex" package.json

# 验证构建
yarn dev
yarn lint
yarn build
```

---

## 8. 评审记录

| 版本 | 日期 | 评审人 | 状态 |
|------|------|--------|------|
| v1.0 | 2025-01-10 | - | 待评审 |

---

**文档结束**
