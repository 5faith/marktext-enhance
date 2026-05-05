# MarkText — Agent Guidelines

MarkText is an Electron-based WYSIWYG Markdown editor built with Vue 2, Vuex, and Webpack.

## Environment

- Node.js **>=22** (LTS) and **yarn**
- Python 3.6+ and C++ build tools (for native modules: `keytar`, `fontmanager-redux`, `native-keymap`, `ced`)
- Linux extra deps: `libx11-dev libxkbfile-dev libsecret-1-dev libfontconfig-dev`

## Key Commands

```
yarn install              # install deps (runs preinstall + postinstall hooks)
yarn run dev              # start dev server with hot-reload (Electron app)
yarn run build            # production build + package for current OS
yarn run build:bin        # production build without full packaging (faster)
yarn run lint             # lint src/ and test/
yarn run lint:fix         # lint + auto-fix
yarn run unit             # run unit tests (Karma + Mocha + Chai via Electron)
yarn run e2e              # run e2e tests (Playwright)
yarn run test             # unit + e2e
yarn run test:specs       # CommonMark + GFM spec compliance tests
yarn run build:muya       # build the muya sub-package only
```

## Architecture

```
src/
  common/   — shared code (Node.js APIs only, no Electron). Usable from main/ and renderer/.
  main/     — Electron main process (entry: src/main/index.js → src/main/app/). IO, menus, windows, filesystem.
  renderer/ — Electron renderer process (entry: src/renderer/main.js). Vue 2 UI, Vuex store, Muya host.
  muya/     — Markdown editor core (pure browser JS). Block-based parsing, WYSIWYG rendering. No Electron/Node APIs.
```

- `src/main/index.js` — main process entry, initializes `App` instance
- `src/renderer/main.js` — renderer entry, bootstraps Vue per editor window
- Each editor window spawns its own renderer process
- Main ↔ renderer communication via IPC

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
- Electron 15.x is pinned — do not upgrade without testing native modules
- Webpack configs are in `.electron-vue/` (not root-level)
- `cross-env` is required for Windows-compatible env vars in scripts

## Reference Docs

- Build instructions: `docs/dev/BUILD.md`
- Architecture: `docs/dev/ARCHITECTURE.md`
- Contributing: `CONTRIBUTING.md`

## graphify

This project has a graphify knowledge graph at graphify-out/.

Rules:
- Before answering architecture or codebase questions, read graphify-out/GRAPH_REPORT.md for god nodes and community structure
- If graphify-out/wiki/index.md exists, navigate it instead of reading raw files
- After modifying code files in this session, run `graphify update .` to keep the graph current (AST-only, no API cost)
