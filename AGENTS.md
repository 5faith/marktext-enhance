# MarkText — Agent Guidelines

Next-gen WYSIWYG Markdown editor built with Electron 28 + Vue 3 + Vite 5.

> **Migration Note**: Migrated from Vue 2/Webpack to Vue 3/Vite. See [`docs/dev/VUE3_MIGRATION.md`](docs/dev/VUE3_MIGRATION.md).

---

## Quick Start

### Prerequisites

- **Node.js** >= 22
- **yarn** package manager
- **Python** 3.6+ and C++ build tools (for native modules)
- **Linux only**: `libx11-dev libxkbfile-dev libsecret-1-dev libfontconfig-dev`

### Installation

```bash
yarn install    # Slow first run: runs preinstall, rebuild, lint:fix hooks
```

### Development Commands

| Command | Description |
|---------|-------------|
| `yarn dev` | Start Vite dev server with hot-reload |
| `yarn build` | Production build + electron-builder package |
| `yarn build:bin` | Build + electron-builder --dir (faster, no full package) |
| `yarn build:dev` | Vite build in development mode |
| `yarn build:clean` | Clean dist directory |
| `yarn preview` | Preview production build |
| `yarn lint` / `yarn lint:fix` | Run ESLint on src/ and test/ |
| `yarn unit` | Unit tests (Karma + Mocha + Chai in Electron) |
| `yarn e2e` | E2E tests (Playwright, requires build first) |
| `yarn test` | Run all tests (unit + e2e) |
| `yarn test:specs` | CommonMark + GFM compliance tests |
| `yarn build:muya` | Build muya sub-package (Webpack) |

---

## Architecture

### Directory Structure

```
src/
├── common/      # Shared Node.js APIs (no Electron), usable from main/ and renderer/
├── main/        # Electron main process (entry: src/main/index.js)
├── renderer/    # Electron renderer (Vue 3 per window, entry: src/renderer/main.js)
└── muya/        # Markdown editor core (browser JS only, no Electron/Node APIs)
```

**Key Points:**
- Each editor window spawns its own renderer process
- Main ↔ renderer communication via IPC
- Built entry point: `./dist/electron/main.js`

### Technology Stack

| Component | Version | Notes |
|-----------|---------|-------|
| Electron | 28 | **Pinned** — native modules break on upgrade |
| Vue | 3.4+ | Composition API (`<script setup>`) for new components |
| Vue Router | 4 | - |
| Pinia | 2.0 | **Primary** state management (Vuex migration complete) |
| Element Plus | 2.0 | Primary UI library |
| Element UI | 2.15 | Legacy, compatibility only |
| Vite | 5 | Primary build tool |
| Webpack | 5.69 | Legacy, muya sub-package only |

### Build System

- **Primary**: Vite 5 (`vite.config.js`, `vite.test.config.js`)
- **Plugins**: `vite-plugin-electron` + `vite-plugin-electron-renderer`
- **Legacy**: `.electron-vue/` Webpack configs (muya only)
- **Packaging**: `electron-builder.yml` (standalone)
- **Config**: `asar: true` (native `.node` files unpacked), `cross-env` required for Windows

### State Management

- **Location**: `src/renderer/stores/`
- **Library**: Pinia 2.0
- **Status**: Vuex migration complete — all stores now use Pinia

### Muya Sub-package

- **Location**: `src/muya/`
- **Build**: `yarn build:muya` (uses own `webpack.config.js`)
- **Constraint**: **Must not** import Electron/Node.js APIs
- **ESLint**: Ignores `src/muya/dist/` and `src/muya/webpack.config.js`

---

## Development Standards

### Code Style

- **Indentation**: 2 spaces
- **Line endings**: LF
- **Semicolons**: No semicolons
- **ESLint**: `standard` + `eslint-plugin-vue`
- **Import aliases**:
  - `common/` — shared utilities
  - `@/` — renderer-specific
  - `muya/` — markdown core

### Testing

| Suite | Location | Framework | Config |
|-------|----------|-----------|--------|
| Unit | `test/unit/` | Karma + Mocha + Chai | `karma.conf.js` |
| E2E | `test/e2e/` | Playwright | `playwright.config.js` |
| Specs | `test/specs/` | CommonMark + GFM | - |

### Submission Guidelines

- **Branch**: Submit PRs to **`develop`** branch
- **Title format**: `fix: #<issue> <short message>`
- **Features**: Open a suggestion issue before implementing new features

---

## Important Notes

- `yarn install` is slow due to preinstall, rebuild, and lint:fix hooks
- Electron 28 is pinned — upgrading requires testing all native modules
- `package.json` has no `engines` field; Node >=22 requirement documented in `docs/dev/BUILD.md`
- `resolutions` field pins: `cld`, `node-abi`, `node-addon-api`, `turndown`, `snabbdom`

---

## Reference Documentation

| Document | Path | Description |
|----------|------|-------------|
| Build Guide | `docs/dev/BUILD.md` | Build instructions and troubleshooting |
| Architecture | `docs/dev/ARCHITECTURE.md` | System architecture details |
| Vue 3 Migration | `docs/dev/VUE3_MIGRATION.md` | Migration from Vue 2/Webpack |
| Debugging | `docs/dev/DEBUGGING.md` | Debugging techniques |
| Release | `docs/dev/RELEASE.md` | Release process |
| Release Hotfix | `docs/dev/RELEASE_HOTFIX.md` | Hotfix procedures |
| Code Docs | `docs/dev/code/README.md` | Code documentation |
| Contributing | `CONTRIBUTING.md` | Contribution guidelines |

### Module-Specific Guidelines

| Directory | Guidelines File | Purpose |
|-----------|-----------------|---------|
| `src/main/` | `src/main/AGENTS.md` | Electron main process |
| `src/renderer/` | `src/renderer/AGENTS.md` | Vue 3 renderer |
| `src/muya/` | `src/muya/AGENTS.md` | Markdown editor core |

### Knowledge Graph

- **Location**: `graphify-out/`
- **Report**: Read `graphify-out/GRAPH_REPORT.md` for architecture questions (god nodes, community structure)
- **Navigation**: If `graphify-out/wiki/index.md` exists, use it instead of raw files
- **Update**: Run `graphify update .` after modifying code
