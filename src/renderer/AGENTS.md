# Renderer Process — Agent Guidelines

Vue 3 renderer per window. Browser environment with Electron APIs via shims.

## Structure

```
src/renderer/
├── main.js           # Entry: createApp + Pinia + Router
├── bootstrap.js      # URL args, logger, path setup
├── stores/           # Pinia stores (11 total)
├── router/           # Vue Router 4
├── components/       # Vue components
├── pages/            # app.vue, preference.vue
├── commands/         # Command pattern (quick open, etc)
├── services/         # Notifications, print
├── shims/            # Node.js API stubs
├── util/             # Utilities
└── assets/           # Styles, themes, icons
```

## Where to Look

| Task | Location |
|------|----------|
| State management | `stores/*.js` — Pinia, not Vuex |
| Routes | `router/index.js` — `/editor`, `/preference` |
| Commands | `commands/*.js` — registered in `main.js` |
| IPC to main | `stores/listenForMain.js` |
| Node APIs | `shims/*.js` — fs, path, child_process stubs |
| Components | `components/*/` — 12 subdirs |

## Conventions

- **Composition API**: `<script setup>` for new components
- **Pinia**: Primary state — `stores/` (not `store/` which is legacy Vuex)
- **Commands**: Pattern for user actions (file encoding, quick open)
- **Shims**: Node APIs proxied through `shims/*.js`
- **Element Plus**: Primary UI library

## Anti-Patterns

- NEVER import Node.js modules directly — use `shims/`
- NEVER import Electron in components — use IPC via stores
- NEVER use Vuex — migrated to Pinia
- NEVER use Element UI — use Element Plus
- Avoid `document.execCommand` — deprecated, use Clipboard API

## Notes

- **Entry flow**: `index.html` → `main.js` → `bootstrap()` → Vue app
- **Window types**: Editor window (`/editor`), Preference window (`/preference`)
- **Shims required**: Vite renderer cannot access Node builtins directly
- **Store init**: All stores initialized in `main.js` with IPC listeners
- **Theme loading**: Dynamic import from `assets/themes/`
