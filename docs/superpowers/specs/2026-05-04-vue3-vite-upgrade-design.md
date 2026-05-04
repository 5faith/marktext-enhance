# MarkText Vue2+Webpack → Vue3+Vite 升级设计文档

> **日期:** 2026-05-04
> **状态:** 待用户审查
> **升级策略:** 渐进式迁移（方案A）

---

## 目标

将 MarkText 从 Vue 2.6 + Webpack 5 渐进式升级到 Vue 3.4 + Vite 5 + Element Plus + Pinia，保持应用功能完整，每阶段独立可测试可回退。

## 当前架构

- **框架:** Vue 2.6.14, Vuex 3.6.2, Vue Router 3.5.3
- **UI库:** Element UI 2.15.7
- **构建:** Webpack 5.69.1 + Babel 7 + .electron-vue/ 配置
- **入口:** `src/renderer/main.js` (Vue), `src/main/index.js` (Electron)
- **组件:** 47个 .vue 组件 (Options API)
- **测试:** Karma + Mocha + Chai (unit), Playwright (e2e)

## 目标架构

- **框架:** Vue 3.4+, Pinia 2.x, Vue Router 4.x
- **UI库:** Element Plus 2.x
- **构建:** Vite 5.x + vite-plugin-electron
- **API:** Composition API (`<script setup>`)
- **测试:** 现有测试套件保持通过

---

## 升级阶段

### 阶段1: Webpack → Vite（保持Vue2）

**目标:** 替换构建工具，应用逻辑保持不变

**核心变更:**
- 移除 `.electron-vue/` 整个目录
- 新增 `vite.config.js`
- 修改 `package.json` scripts
- 配置 vite-plugin-electron 处理主进程和渲染进程

**依赖变更:**
- 新增: vite ^5.0, @vitejs/plugin-vue ^4.0, vite-plugin-electron ^0.28
- 移除: webpack 全家桶, babel-loader, vue-loader, vue-template-compiler 等

**关键配置:**
```javascript
// vite.config.js 核心结构
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import electron from 'vite-plugin-electron'

export default defineConfig({
  plugins: [vue(), electron({...})],
  resolve: { alias: {/* 保持现有别名 */} },
  root: 'src/'
})
```

**验证标准:**
- `yarn dev` 正常启动，热更新工作
- `yarn build` 成功打包
- 现有 unit tests 通过
- 应用功能无回归

**预估时间:** 1-2天 | **风险:** 中

---

### 阶段2: Vue 2.6 → Vue 2.7（过渡版本）

**目标:** 获取 Composition API 和迁移工具

**变更:**
- `package.json`: vue ^2.6 → ^2.7
- 移除 vue-template-compiler（Vue 2.7 内置）
- 启用 Composition API 语法

**验证:**
- 应用正常运行
- 可使用 `setup()` 编写新组件
- 运行 `@vue/compat` 迁移构建工具检查兼容性

**预估时间:** 0.5天 | **风险:** 低

---

### 阶段3: Vue 2.7 → Vue 3 + @vue/compat

**目标:** 运行在 Vue3 上，兼容层处理 breaking changes

**变更:**
- vue ^2.7 → ^3.4 + @vue/compat
- vite.config.js 配置 compat 插件
- 修复明确的 breaking changes
- 更新 Vue Router 3 → 4

**关键 Breaking Changes 处理:**
- `new Vue()` → `createApp()`
- `Vue.use()` → `app.use()`
- `$on/$off/$once` 移除 → 使用 mitt 或自定义事件总线
- 过滤器 `|` 移除 → 改用方法或 computed
- `v-model` 语法变更
- `$listeners` 移除

**验证:**
- 应用在 compat 模式下正常运行
- 控制台无 compat 警告（或已记录的已知警告）
- 现有测试通过

**预估时间:** 2-3天 | **风险:** 高

---

### 阶段4: Vuex 3 → Pinia

**目标:** 迁移到 Vue3 推荐的状态管理方案

**变更:**
- 新增 pinia 依赖
- `src/renderer/store/` 目录重构
- modules → 独立 stores
- `mapState/mapActions` → `useStore()` composables

**迁移策略:**
- 先迁移简单 store modules
- 保持 Vuex 和 Pinia 共存（通过插件桥接）
- 逐步迁移所有 modules
- 最后移除 Vuex

**验证:**
- 状态读写正常
- DevTools 可调试
- 测试通过

**预估时间:** 1-2天 | **风险:** 中

---

### 阶段5: Element UI → Element Plus

**目标:** 升级 UI 组件库到 Vue3 版本

**变更:**
- element-ui → element-plus
- 按需引入配置更新
- API 变更适配（如 `slot-scope` → `v-slot`）
- 图标系统变更（@element-plus/icons-vue）

**组件迁移顺序（按复杂度）:**
1. Button, Input, Switch 等基础组件
2. Dialog, Tooltip, Tabs 等容器组件
3. Table, Tree, Select 等复杂组件
4. Upload, ColorPicker 等特殊组件

**验证:**
- 所有 UI 组件正常渲染
- 交互行为一致
- 样式无异常

**预估时间:** 2-3天 | **风险:** 中

---

### 阶段6: 移除兼容层 + Composition API 重构

**目标:** 完全 Vue3 原生，组件转 Composition API

**变更:**
- 移除 @vue/compat
- 修复 compat 警告对应的代码
- 组件按复杂度从低到高转为 `<script setup>`
- 清理废弃 API 调用
- 优化响应式系统使用

**组件重构优先级:**
1. 简单展示组件（无状态）
2. 基础表单组件
3. 业务逻辑组件
4. 复杂页面组件

**验证:**
- 无 compat 依赖运行正常
- 性能无退化
- 打包体积减小
- 所有测试通过

**预估时间:** 3-5天 | **风险:** 中

---

## 总体时间估算

| 阶段 | 内容 | 预估时间 | 风险等级 |
|------|------|----------|----------|
| 阶段1 | Webpack → Vite | 1-2天 | 中 |
| 阶段2 | Vue 2.6 → 2.7 | 0.5天 | 低 |
| 阶段3 | Vue 3 + compat | 2-3天 | 高 |
| 阶段4 | Vuex → Pinia | 1-2天 | 中 |
| 阶段5 | Element UI → Plus | 2-3天 | 中 |
| 阶段6 | 移除兼容层+重构 | 3-5天 | 中 |
| **总计** | | **9.5-15.5天** | |

---

## 风险与缓解

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| Electron IPC 通信变更 | 主进程与渲染进程通信中断 | 每阶段验证 IPC 功能 |
| 原生模块兼容性 | node_modules 中的 .node 文件失效 | 使用 electron-rebuild 重新编译 |
| Muya 子包构建 | muya/ 使用独立 webpack 配置 | 保持 muya 独立构建，逐步迁移 |
| 测试框架兼容 | Karma/Webpack 配置需更新 | 阶段1同步更新测试配置 |
| 样式/主题失效 | CSS 加载方式变更 | 验证所有主题和样式 |

---

## 回退策略

每个阶段完成后提交独立 git commit，如遇到问题可回退到上一稳定版本。

```bash
# 回退命令示例
git revert <commit-hash>
# 或
git checkout <previous-stable-tag>
```

---

## 成功标准

1. 所有 6 个阶段完成
2. 应用功能完整，无回归
3. 现有测试套件通过
4. 打包体积减小或持平
5. 开发服务器启动时间 < 5秒
6. 热更新响应时间 < 1秒
