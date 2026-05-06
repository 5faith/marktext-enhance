# MarkText — Agent Guidelines

MarkText is an Electron-based WYSIWYG Markdown editor built with Vue 3, Vite, and Electron.

> **Note**: This project has undergone a major migration from Vue 2/Webpack to Vue 3/Vite.
> See `docs/dev/VUE3_MIGRATION.md` for migration details.

## Environment

- Node.js **>=22** (LTS) and **yarn**
- Python 3.6+ and C++ build tools (for native modules)
- Linux extra deps: `libx11-dev libxkbfile-dev libsecret-1-dev libfontconfig-dev`

## Key Commands

```
yarn install              # install deps (runs preinstall + postinstall hooks)
yarn run dev              # start dev server with Vite hot-reload (Electron app)
yarn run build            # production build + package (Vite + electron-builder)
yarn run build:bin        # production build without full packaging (faster)
yarn run build:dev        # Vite build in development mode
yarn run build:clean      # clean dist/ directory
yarn run preview          # preview production build with Vite
yarn run lint             # lint src/ and test/
yarn run lint:fix         # lint + auto-fix
yarn run unit             # run unit tests (Karma + Mocha + Chai via Electron)
yarn run e2e              # run e2e tests (Playwright)
yarn run test             # unit + e2e
yarn run test:specs       # CommonMark + GFM spec compliance tests
yarn run build:muya       # build the muya sub-package only (Webpack)
yarn run deobfuscateStackTrace  # deobfuscate production stack traces
yarn run validate-licenses      # validate dependency licenses
```

## Architecture

```
src/
  common/   — shared code (Node.js APIs only, no Electron). Usable from main/ and renderer/.
  main/     — Electron main process. IO, menus, windows, filesystem.
  renderer/ — Electron renderer process. Vue 3 UI, Pinia/Vuex stores, Muya host.
  muya/     — Markdown editor core (pure browser JS). Block-based parsing, WYSIWYG rendering. No Electron/Node APIs.
```

- `src/main/index.js` — main process entry, initializes `App` instance
- `src/renderer/main.js` — renderer entry, bootstraps Vue 3 per editor window
- Each editor window spawns its own renderer process
- Main ↔ renderer communication via IPC

### renderer/ Subdirectories

```
src/renderer/
  stores/     — Pinia stores (new state management)
  store/      — Vuex stores (legacy, still in use during migration)
  router/     — Vue Router 4 configuration
  pages/      — Page-level components
  prefComponents/ — Preference UI components
  shims/      — Vite module shims
```

## Tech Stack

| Component | Version | Notes |
|-----------|---------|-------|
| Electron | 28 | Upgraded from 15.x |
| Vue | 3.4+ | Migrated from Vue 2 |
| Vue Router | 4 | Upgraded from Vue Router 3 |
| Pinia | 2.0 | New primary state management |
| Vuex | 4 | Legacy, still in use (migration in progress) |
| Element Plus | 2.0 | Replaces Element UI |
| Element UI | 2.15 | Legacy, retained for compatibility |
| Vite | 5 | Primary build tool (replaced Webpack) |
| Webpack | 5.69 | Legacy, only used for muya sub-package |

## Build System

- **Primary**: Vite 5 with `vite-plugin-electron` and `vite-plugin-electron-renderer`
- **Config**: `vite.config.js` (main), `vite.test.config.js` (testing)
- **Legacy**: `.electron-vue/` contains old Webpack configs (kept for muya build)
- **Packaging**: `electron-builder.yml` (standalone config)

## Muya Sub-package

- Located at `src/muya/` with its own `webpack.config.js`
- Build with `yarn run build:muya`
- Must **not** import Electron or Node.js APIs — browser-only code
- ESLint ignores `src/muya/dist/` and `src/muya/webpack.config.js`

## Code Style

- 2-space indent, LF line endings, no semicolons
- ESLint extends `standard` + `eslint-plugin-vue`
- JSDoc for documentation
- Alias imports: `common/`, `@/` (renderer), `muya/`
- Composition API (`<script setup>`) preferred for new components

## Branch / PR Conventions

- PRs target the **`develop`** branch
- PR title format for bug fixes: `fix: #<issue> <short message>`
- Open a suggestion issue before adding new features
- All CI must pass before merge

## Testing

- Unit tests: `test/unit/` — Karma config in `test/unit/karma.conf.js`
- E2E tests: `test/e2e/` — Playwright config in `test/e2e/playwright.config.js`
- Spec tests: `test/specs/` — CommonMark and GFM compliance

## Build Artifacts

- Output directory: `build/`
- Packaged files: `dist/electron/`
- `asar: true` — native `.node` files are unpacked

## Gotchas

- `postinstall` hook runs `rebuild` (electron-rebuild) and `lint:fix` — first `yarn install` takes time
- Electron 28 is pinned — do not upgrade without testing native modules
- Vite is the primary build tool; Webpack configs in `.electron-vue/` are legacy
- `cross-env` is required for Windows-compatible env vars in scripts
- Project is in **mid-migration**: both Pinia (`stores/`) and Vuex (`store/`) coexist
- `package.json` does not declare `engines` field; Node >=22 is documented in `docs/dev/BUILD.md`

## Reference Docs

- Build instructions: `docs/dev/BUILD.md`
- Architecture: `docs/dev/ARCHITECTURE.md`
- Vue 3 migration: `docs/dev/VUE3_MIGRATION.md`
- Debugging: `docs/dev/DEBUGGING.md`
- Release: `docs/dev/RELEASE.md`
- Release hotfix: `docs/dev/RELEASE_HOTFIX.md`
- Code docs: `docs/dev/code/README.md`
- Contributing: `CONTRIBUTING.md`

## graphify

This project has a graphify knowledge graph at graphify-out/.

Rules:
- Before answering architecture or codebase questions, read graphify-out/GRAPH_REPORT.md for god nodes and community structure
- If graphify-out/wiki/index.md exists, navigate it instead of reading raw files
- After modifying code files in this session, run `graphify update .` to keep the graph current (AST-only, no API cost)
