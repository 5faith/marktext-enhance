# Main Process — Agent Guidelines

Electron main process. Node.js environment with full system access.

## Structure

```
src/main/
├── index.js          # Entry point
├── app/              # App class, WindowManager, Accessor
├── windows/          # Window creation (editor, setting)
├── menu/             # Application menus
├── keyboard/         # Platform keybindings (Darwin/Linux/Windows)
├── filesystem/       # File watching, markdown ops
├── preferences/      # Settings schema
├── dataCenter/       # electron-store persistence
└── utils/            # Helpers
```

## Where to Look

| Task | Location |
|------|----------|
| Create window | `windows/editor.js`, `windows/setting.js` |
| Menu actions | `menu/actions/*.js` |
| IPC handlers | `app/index.js` (search `ipcMain`) |
| Platform shortcuts | `keybindings*.js` |
| File operations | `filesystem/markdown.js`, `filesystem/watcher.js` |
| Native modules | Configured in `vite.config.js` external |

## Conventions

- **WindowManager**: Central window lifecycle management
- **Accessor**: Dependency injection pattern (`app/accessor.js`)
- **IPC**: Main→Renderer via `ipcMain.handle()`
- **Menus**: Actions in `menu/actions/`, templates in `menu/templates/`
- **Platform guards**: `isOsx`, `isLinux`, `isWindows` from `common/envPaths.js`

## Anti-Patterns

- NEVER create `BASE` window directly (abstract class)
- NEVER use `getMenuItemById` statically — request menu instance
- NEVER use `getPath('userData')` — use `AppPaths` instead
- NEVER import renderer code
- Avoid sync file operations in hot paths

## Notes

- **Electron 28 pinned** — upgrading breaks native modules
- **Native modules**: keytar, fontmanager-redux, native-keymap, ced, cld
- **Platform differences**: Menu bar (macOS), tray (all), keybindings vary
- **HACKs**: See `#1034/#1035` for file watcher debt
- **Globals**: `global.marktext` set in `index.js` for shared state
