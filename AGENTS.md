# MarkText — Agent Guide

## Project overview

Electron + Vue 2 WYSIWYG markdown editor (v0.17.1). Package manager: **yarn** (enforced by `.electron-vue/preinstall.js`).

## Required environment

- **Node.js >=16, <17** — CI uses Node 16; `preinstall.js` rejects <14 but BUILD.md requires >=16 <17
- **Python 3.6+** and C++ build tools (for node-gyp native modules)
- **Linux extra deps**: `libx11-dev libxkbfile-dev libsecret-1-dev libfontconfig-dev`

## Commands

| Command                  | What it does                                                          |
| ------------------------ | --------------------------------------------------------------------- |
| `yarn install`           | Install deps (runs preinstall → postinstall → lint:fix automatically) |
| `yarn dev`               | Dev mode with hot reload (webpack-dev-server on :9091 + Electron)     |
| `yarn build`             | Full production build + electron-builder packaging                    |
| `yarn build:bin`         | Build binary only (faster, no packaging)                              |
| `yarn build:clean`       | Clean dist/electron                                                   |
| `yarn lint`              | ESLint on src + test                                                  |
| `yarn lint:fix`          | ESLint with auto-fix                                                  |
| `yarn unit`              | Unit tests (Karma + Mocha + Chai in Electron)                         |
| `yarn e2e`               | E2E tests (Playwright, single worker, headed)                         |
| `yarn test`              | Run unit + e2e                                                        |
| `yarn test:specs`        | CommonMark + GFM spec compliance tests                                |
| `yarn validate-licenses` | Validate third-party licenses                                         |

**CI order** (`.github/workflows/build.yml`): `lint` → `validate-licenses` → `test` → `build:bin`

## Architecture

```
src/
  main/        — Electron main process (IO, native dialogs, window control)
  renderer/    — Electron renderer process (Vue 2 UI, Vuex store, Muya host)
  muya/        — Pure JS editor core (NO Electron/Node APIs allowed)
  common/      — Shared code (Node.js APIs only, no Electron)
```

- **Main entry**: `src/main/index.js` → builds to `dist/electron/main.js`
- **Renderer entry**: `src/renderer/main.js`
- **Muya** is a self-contained sub-project with its own webpack config; build with `yarn build:muya`
- Main ↔ Renderer communicate via IPC

## Webpack config

- `.electron-vue/webpack.main.config.js` — main process
- `.electron-vue/webpack.renderer.config.js` — renderer process
- Dev server runs on `127.0.0.1:9091`

## Style conventions

- 2-space indent, **no semicolons** (`.eslintrc.js`)
- ESLint extends `standard` + `plugin:vue/base`
- JSDoc for documentation
- PRs target `develop` branch, rebase onto `develop`

## Testing notes

- **Unit tests**: Karma launches a custom Electron browser with `nodeIntegration: true`, `contextIsolation: false`, `sandbox: false`. Config in `test/unit/karma.conf.js`. Requires `dist/electron/` directory to exist before running.
- **E2E tests**: Playwright with `workers: 1`, headed mode. Config in `test/e2e/playwright.config.js`. Set `MARKTEXT_EXIT_ON_ERROR=1` for CI.
- **Spec tests**: `test/specs/` — run CommonMark and GFM compliance with `yarn test:specs`
- Linux CI runs tests under xvfb (`DISPLAY=:99.0`)

## Post-install quirks

- `postinstall.js` applies workarounds for:
  - Windows: replaces `windows-release` index.js to fix slow startup
  - macOS: disables `prebuild-install` for keytar to force rebuild from source
- `yarn install` also runs `electron-rebuild` and `lint:fix` automatically

## Build output

- Build artifacts go to `build/`
- Bundled code goes to `dist/electron/`
- `electron-builder.yml` configures packaging for all platforms

## Key files to read for context

- `docs/dev/ARCHITECTURE.md` — detailed architecture
- `docs/dev/BUILD.md` — build instructions
- `docs/dev/code/README.md` — internal code documentation
- `CONTRIBUTING.md` — contribution guidelines and style guide

## 文档规范

1. 每次进行修改需要明确计划, 把最终计划更新到[02plan.md](doc/02plan.md)
2. 修改完成后,需要更新[03update.md](doc/03update.md), 按照日期填写大概修改内容

## 四条原则详解

### 1. 编码前先思考

**不要假设。不要掩饰困惑。明确呈现权衡。**

LLM 经常会默默选定一种解释并直接开始做。这条原则要求显式推理：

- **明确写出假设**，如果不确定，就提问而不是猜
- **给出多种解释**，存在歧义时不要默默选一个
- **必要时提出异议**，如果有更简单的方法，就说出来
- **困惑时停下来**，指出哪里不清楚，并请求澄清

### 2. 简单优先

**只写解决问题所需的最少代码。不做任何预设性扩展。**

用来对抗过度工程化的倾向：

- 不加入超出需求的功能
- 不为一次性代码做抽象
- 不加入未被要求的“灵活性”或“可配置性”
- 不为不可能发生的场景写错误处理
- 如果 200 行可以缩到 50 行，那就重写

**检验标准：** 一个资深工程师会认为这太复杂了吗？如果会，就继续简化。

### 3. 外科手术式修改

**只改必须改的内容。只清理你自己造成的问题。**

编辑现有代码时：

- 不要“顺手优化”相邻代码、注释或格式
- 不要重构没有坏掉的部分
- 保持现有风格，即使你个人会写成别的样子
- 如果发现无关的死代码，可以指出，但不要删除

当你的改动产生遗留项时：

- 删除那些因你的修改而变成未使用的 import、变量或函数
- 不要删除原本就存在的死代码，除非被明确要求

**检验标准：** 每一行改动都应当能直接追溯到用户请求。

### 4. 目标驱动执行

**先定义成功标准，再循环推进，直到验证通过。**

把命令式任务转换成可验证的目标：

| 不要只是……     | 而要转换为……                       |
| -------------- | ---------------------------------- |
| “添加校验”     | “先为非法输入写测试，再让测试通过” |
| “修复这个 bug” | “先写能复现它的测试，再让测试通过” |
| “重构 X”       | “确保改动前后测试都通过”           |

对于多步骤任务，先给出简短计划：

```
1. [步骤] → 验证：[检查项]
2. [步骤] → 验证：[检查项]
3. [步骤] → 验证：[检查项]
```
