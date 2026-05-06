# MarkText — Agent Guidelines

Next-gen WYSIWYG Markdown editor. Electron 28 + Vue 3 + Vite 5.

> **Migration note**: Migrated from Vue 2/Webpack to Vue 3/Vite. See `docs/dev/VUE3_MIGRATION.md`.

## Environment

- Node.js **>=22** + yarn
- Python 3.6+ and C++ build tools (native modules: `keytar`, `fontmanager-redux`, `native-keymap`, `ced`)
- Linux: `libx11-dev libxkbfile-dev libsecret-1-dev libfontconfig-dev`

## Key Commands

```
yarn install              # preinstall + postinstall hooks (electron-rebuild + lint:fix → slow first run)
yarn dev                  # Vite dev server with hot-reload
yarn build                # Vite build + electron-builder package
yarn build:bin            # Vite build + electron-builder --dir (faster, no full package)
yarn build:dev            # Vite build in development mode
yarn build:clean          # rimraf dist
yarn preview              # vite preview
yarn lint / lint:fix      # eslint src/ test/
yarn unit                 # Karma + Mocha + Chai (runs in Electron)
yarn e2e                  # Playwright (requires build first)
yarn test                 # unit + e2e
yarn test:specs           # CommonMark + GFM compliance
yarn build:muya           # Webpack (muya sub-package only)
```

## Architecture

```
src/
  common/   — shared (Node.js APIs, no Electron). Usable from main/ and renderer/.
  main/     — Electron main process (src/main/index.js → App instance)
  renderer/ — Electron renderer (src/renderer/main.js → Vue 3 per window)
  muya/     — Markdown editor core (browser JS only, no Electron/Node APIs)
```

- Each editor window spawns its own renderer process
- Main ↔ renderer via IPC
- Entry: `./dist/electron/main.js` (built output)

## Tech Stack

| Component | Version | Notes |
|-----------|---------|-------|
| Electron | 28 | **Do not upgrade** without testing native modules |
| Vue | 3.4+ | Migrated from Vue 2 |
| Vue Router | 4 | Upgraded from 3 |
| Pinia | 2.0 | **Primary** state management |
| Vuex | 4 | Legacy, still in use |
| Element Plus | 2.0 | Primary UI library |
| Element UI | 2.15 | Legacy, compatibility only |
| Vite | 5 | Primary build tool |
| Webpack | 5.69 | Legacy, muya sub-package only |

## Build System

- **Vite 5** is primary (`vite.config.js`, `vite.test.config.js`)
- Uses `vite-plugin-electron` + `vite-plugin-electron-renderer`
- `.electron-vue/` Webpack configs are **legacy**, kept only for muya
- Packaging: `electron-builder.yml` (standalone)
- `asar: true` — native `.node` files are unpacked
- `cross-env` required for Windows env vars

## State Management (Mid-Migration)

- `src/renderer/stores/` — **Pinia** (new, preferred)
- `src/renderer/store/` — **Vuex** (legacy, still active)
- Both coexist; new code should use Pinia

## Muya Sub-package

- `src/muya/` with own `webpack.config.js`
- **Must not** import Electron/Node.js APIs
- Build: `yarn build:muya`
- ESLint ignores `src/muya/dist/` and `src/muya/webpack.config.js`

## Code Style

- 2-space indent, LF endings, **no semicolons**
- ESLint: `standard` + `eslint-plugin-vue`
- Alias imports: `common/`, `@/` (renderer), `muya/`
- Composition API (`<script setup>`) for new components

## Testing

| Suite | Location | Config |
|-------|----------|--------|
| Unit | `test/unit/` | `karma.conf.js` (Karma + Electron) |
| E2E | `test/e2e/` | `playwright.config.js` |
| Specs | `test/specs/` | CommonMark + GFM compliance |

## Gotchas

- `yarn install` is slow: runs `preinstall`, `rebuild`, `lint:fix` hooks
- Electron 28 is pinned — native modules break on version change
- `package.json` has no `engines` field; Node >=22 documented in `docs/dev/BUILD.md`
- Project mid-migration: Pinia + Vuex coexist
- `resolutions` in package.json pins `cld`, `node-abi`, `node-addon-api`, `turndown`, `snabbdom`

## Conventions

- PRs → **`develop`** branch
- PR title format: `fix: #<issue> <short message>`
- Open suggestion issue before new features

## Reference Docs

| Doc | Path |
|-----|------|
| Build | `docs/dev/BUILD.md` |
| Architecture | `docs/dev/ARCHITECTURE.md` |
| Vue 3 migration | `docs/dev/VUE3_MIGRATION.md` |
| Debugging | `docs/dev/DEBUGGING.md` |
| Release | `docs/dev/RELEASE.md` |
| Release hotfix | `docs/dev/RELEASE_HOTFIX.md` |
| Code docs | `docs/dev/code/README.md` |
| Contributing | `CONTRIBUTING.md` |

## graphify

Knowledge graph at `graphify-out/`.

- Read `graphify-out/GRAPH_REPORT.md` for architecture questions (god nodes, community structure)
- If `graphify-out/wiki/index.md` exists, navigate it instead of raw files
- After modifying code: run `graphify update .`
