# Node.js 22 + Electron 28 升级计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将项目从 Node.js 16 + Electron 15 升级到 Node.js 22 + Electron 28，确保构建、测试和打包正常运行。

**Architecture:** 升级 Electron 主要版本需要更新 package.json 依赖、修复破坏性 API 变更、更新 native modules 重建配置、调整 Webpack/Electron-builder 配置。Electron 28 基于 Chromium 120 + Node.js 20，与 Node.js 22 宿主环境兼容。

**Tech Stack:** Electron 28, Node.js 22, Vue 2, Webpack 5, electron-builder 24+, electron-rebuild

---

## 版本选择依据

| 组件 | 当前版本 | 目标版本 | 说明 |
|------|----------|----------|------|
| Node.js | 16.x | 22.x (LTS) | 当前 LTS，长期支持到 2027 |
| Electron | 15.4.0 | 28.x | Electron 28 支持 Node.js 20，与 Node.js 22 宿主兼容 |
| electron-builder | 22.14.13 | 24.13.3 | 需要 >=24 才支持 Electron 28 |
| electron-rebuild | 3.2.7 | 3.2.9+ | 保持兼容 |
| @electron/remote | 2.0.4 | 2.1.2 | 保持兼容 |
| node-abi | 3.5.0 | 3.56+ | 需要支持 Electron 28 的 ABI |

## Electron 28 主要破坏性变更

1. **contextIsolation 默认启用** - 需要检查安全配置
2. **nodeIntegration 默认禁用** - 需要显式启用或迁移到 preload
3. **remote 模块** - 需要 @electron/remote 正确配置
4. **native modules** - 需要针对 Electron 28 的 Node ABI (119) 重新编译
5. **electron-builder** - 配置格式有变化

## 文件映射

| 文件 | 操作 | 说明 |
|------|------|------|
| `package.json` | 修改 | 更新 electron, electron-builder, @electron/remote, node-abi 版本 |
| `yarn.lock` | 删除后重建 | 确保依赖解析正确 |
| `docs/dev/BUILD.md` | 修改 | 更新 Node.js 版本要求 |
| `.electron-vue/preinstall.js` | 修改 | 更新 Node.js 版本检查 |
| `AGENTS.md` | 修改 | 更新环境说明 |
| `src/main/app/window-manager.js` | 检查 | 检查 webPreferences 配置 |
| `src/main/index.js` | 检查 | 检查 app 初始化 |
| `test/unit/karma.conf.js` | 检查 | 检查 karma-electron 配置 |

---

### Task 1: 更新 package.json 依赖版本

**Files:**
- Modify: `D:\workspace\github-my\marktext-enhance\package.json`

- [ ] **Step 1: 更新 package.json 中的依赖版本**

修改 `package.json` 中的以下依赖：

```json
{
  "dependencies": {
    "@electron/remote": "^2.1.2"
  },
  "devDependencies": {
    "electron": "^28.3.3",
    "electron-builder": "^24.13.3",
    "electron-rebuild": "^3.2.9"
  },
  "resolutions": {
    "node-abi": "^3.56.0",
    "node-addon-api": "^7.0.0"
  }
}
```

完整修改：使用 Edit 工具替换以下字段：
- `dependencies["@electron/remote"]`: `"^2.0.4"` → `"^2.1.2"`
- `devDependencies["electron"]`: `"^15.4.0"` → `"^28.3.3"`
- `devDependencies["electron-builder"]`: `"^22.14.13"` → `"^24.13.3"`
- `devDependencies["electron-rebuild"]`: `"^3.2.7"` → `"^3.2.9"`
- `resolutions["node-abi"]`: `"^3.5.0"` → `"^3.56.0"`

- [ ] **Step 2: 验证 package.json 格式正确**

运行命令验证 JSON 格式：
```bash
node -e "JSON.parse(require('fs').readFileSync('package.json', 'utf8')); console.log('package.json valid')"
```
Expected: `package.json valid`

- [ ] **Step 3: 提交**

```bash
git add package.json
git commit -m "chore: update dependencies for Node.js 22 + Electron 28 upgrade"
```

---

### Task 2: 更新 Node.js 版本检查脚本

**Files:**
- Modify: `D:\workspace\github-my\marktext-enhance\.electron-vue\preinstall.js`
- Modify: `D:\workspace\github-my\marktext-enhance\docs\dev\BUILD.md`
- Modify: `D:\workspace\github-my\marktext-enhance\AGENTS.md`

- [ ] **Step 1: 更新 preinstall.js 版本检查**

修改 `.electron-vue/preinstall.js`：

```javascript
'use strict'

const nodeMajor = Number(process.versions.node.match(/^(\d+)\./)[1])
if (nodeMajor < 22) {
  console.error('[ERROR] Node.js v22 or above is required.\n')
  process.exit(1)
}

if (!/yarn\.js$/.test(process.env.npm_execpath)) {
  console.error('[ERROR] Please use yarn to install dependencies.\n')
  process.exit(1)
}
```

- [ ] **Step 2: 更新 BUILD.md 文档**

修改 `docs/dev/BUILD.md` 中的版本要求：

```markdown
- Node.js `>=v22` and yarn
```

- [ ] **Step 3: 更新 AGENTS.md 文档**

修改 `AGENTS.md` 中的 Environment 部分：

```markdown
## Environment

- Node.js **>=22** (LTS) and **yarn**
```

- [ ] **Step 4: 提交**

```bash
git add .electron-vue/preinstall.js docs/dev/BUILD.md AGENTS.md
git commit -m "docs: update Node.js version requirements to v22"
```

---

### Task 3: 检查并更新 Electron 主进程配置

**Files:**
- Read: `D:\workspace\github-my\marktext-enhance\src\main\app\window-manager.js`
- Read: `D:\workspace\github-my\marktext-enhance\src\main\index.js`

- [ ] **Step 1: 检查 window-manager.js 中的 webPreferences**

读取 `src/main/app/window-manager.js`，检查是否存在以下配置：

需要确保 `webPreferences` 中包含：
```javascript
webPreferences: {
  nodeIntegration: true,
  contextIsolation: false,
  // ... 其他配置
}
```

如果 `contextIsolation` 设置为 `true`，则需要改为 `false`（因为项目使用 @electron/remote 和 nodeIntegration）。

或者，如果项目需要更安全的配置，需要迁移到 preload 脚本模式（这是一个更大的改动，本次升级保持原有模式）。

- [ ] **Step 2: 检查 index.js 中的 app 初始化**

读取 `src/main/index.js`，检查是否有需要更新的 API 调用。Electron 28 中以下 API 有变化：
- `app.allowRendererProcessReuse` - 默认值变更，如果显式设置需要调整
- `systemPreferences` - 部分方法变更

- [ ] **Step 3: 根据检查结果进行必要修改**

根据 Step 1 和 Step 2 的检查结果，进行必要的代码调整。

- [ ] **Step 4: 提交**

```bash
git add src/main/app/window-manager.js src/main/index.js
git commit -m "fix: update electron main process config for v28"
```

---

### Task 4: 检查并更新测试配置

**Files:**
- Read: `D:\workspace\github-my\marktext-enhance\test\unit\karma.conf.js`
- Read: `D:\workspace\github-my\marktext-enhance\test\e2e\playwright.config.js`

- [ ] **Step 1: 检查 karma.conf.js**

读取 `test/unit/karma.conf.js`，检查 karma-electron 配置。确保：
- `electron` 路径指向正确的版本
- `webPreferences` 配置与主进程一致

- [ ] **Step 2: 检查 playwright.config.js**

读取 `test/e2e/playwright.config.js`，确认 Playwright 配置。Playwright 1.44 支持 Chromium 125，与 Electron 28 的 Chromium 120 基本兼容。

- [ ] **Step 3: 根据检查结果进行必要修改**

根据 Step 1 和 Step 2 的检查结果，进行必要的配置调整。

- [ ] **Step 4: 提交**

```bash
git add test/unit/karma.conf.js test/e2e/playwright.config.js
git commit -m "test: update test configs for Electron 28"
```

---

### Task 5: 清理并重新安装依赖

**Files:**
- Delete: `D:\workspace\github-my\marktext-enhance\node_modules`
- Delete: `D:\workspace\github-my\marktext-enhance\yarn.lock`

- [ ] **Step 1: 删除旧的 node_modules 和 yarn.lock**

```bash
rm -rf node_modules yarn.lock
```

- [ ] **Step 2: 使用 yarn 重新安装依赖**

```bash
yarn install
```

Expected: 安装成功，postinstall 脚本运行完成。

注意：此步骤会运行 `electron-rebuild` 重新编译 native modules。如果编译失败，需要单独处理。

- [ ] **Step 3: 如果 electron-rebuild 失败，手动重建**

如果 Step 2 中 electron-rebuild 失败，手动运行：

```bash
npx electron-rebuild -f -w keytar -w fontmanager-redux -w native-keymap -w ced
```

- [ ] **Step 4: 验证安装结果**

```bash
npx electron --version
```

Expected: `v28.x.x`

- [ ] **Step 5: 提交**

```bash
git add yarn.lock
git commit -m "chore: rebuild native modules for Electron 28"
```

---

### Task 6: 验证构建

**Files:**
- 无文件修改

- [ ] **Step 1: 运行 lint 检查**

```bash
yarn run lint
```

Expected: 无错误输出。

- [ ] **Step 2: 运行 lint:fix 自动修复**

如果有 lint 错误，先运行修复：

```bash
yarn run lint:fix
```

- [ ] **Step 3: 运行开发模式**

```bash
yarn run dev
```

Expected: Electron 窗口正常启动，无控制台错误。

- [ ] **Step 4: 运行生产构建**

```bash
yarn run build:bin
```

Expected: 构建成功，输出在 `dist/electron/` 目录。

- [ ] **Step 5: 提交**

```bash
git add .
git commit -m "build: verify build succeeds with Electron 28"
```

---

### Task 7: 运行测试验证

**Files:**
- 无文件修改

- [ ] **Step 1: 运行单元测试**

```bash
yarn run unit
```

Expected: 所有单元测试通过。

- [ ] **Step 2: 运行 E2E 测试**

```bash
yarn run e2e
```

Expected: 所有 E2E 测试通过。

- [ ] **Step 3: 运行 Spec 测试**

```bash
yarn run test:specs
```

Expected: CommonMark 和 GFM 规范测试通过。

- [ ] **Step 4: 修复测试失败（如有）**

根据 Step 1-3 的结果，修复任何测试失败。

- [ ] **Step 5: 提交**

```bash
git add .
git commit -m "test: verify all tests pass with Electron 28"
```

---

### Task 8: 完整打包验证（可选）

**Files:**
- 无文件修改

- [ ] **Step 1: 运行完整打包**

```bash
yarn run build
```

Expected: 打包成功，输出在 `build/` 目录。

- [ ] **Step 2: 测试打包后的应用**

Windows:
```bash
.\build\marktext-setup.exe
```

macOS:
```bash
open ./build/marktext-x64-mac.dmg
```

Linux:
```bash
./build/marktext-x64.AppImage
```

- [ ] **Step 3: 提交**

```bash
git add .
git commit -m "release: verify full package build with Electron 28"
```

---

## 风险和缓解措施

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| Native modules 编译失败 | 高 | 使用 electron-rebuild 手动重建，或更新模块版本 |
| contextIsolation 破坏 | 中 | 保持 nodeIntegration=true, contextIsolation=false |
| electron-builder 配置不兼容 | 中 | 升级到 24.x，检查配置格式 |
| Vue 2 兼容性 | 低 | Vue 2 与 Electron 28 无已知冲突 |
| 第三方依赖不兼容 Node.js 22 | 中 | 检查 resolutions，更新不兼容包 |

## 验证清单

- [ ] `yarn install` 成功
- [ ] `yarn run lint` 通过
- [ ] `yarn run dev` 正常启动
- [ ] `yarn run build:bin` 成功
- [ ] `yarn run unit` 通过
- [ ] `yarn run e2e` 通过
- [ ] `yarn run test:specs` 通过
- [ ] `yarn run build` 成功（可选）
