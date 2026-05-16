# Muya — Agent Guidelines

Markdown editor core. Browser-only, no Electron/Node APIs.

## Structure

```
src/muya/
├── lib/
│   ├── index.js          # Entry: Muya class
│   ├── contentState/     # Document model
│   ├── parser/           # Markdown → AST (marked)
│   ├── renderers/          # AST → Snabbdom vnodes
│   ├── eventHandler/       # Input, keyboard, selection
│   ├── ui/                 # Float boxes, pickers, toolbar
│   ├── utils/              # Helpers
│   └── assets/             # Icons, fonts
├── themes/               # CSS themes
└── webpack.config.js     # Separate build
```

## Where to Look

| Task | Location |
|------|----------|
| Parse markdown | `lib/parser/` — marked custom renderer |
| Content model | `lib/contentState/` — blocks, lists, tables |
| Render to DOM | `lib/renderers/` — Snabbdom vnodes |
| Event handling | `lib/eventHandler/` — keyboard, mouse, input |
| UI widgets | `lib/ui/` — float, picker, toolbar, tablebar |
| Themes | `themes/` — CSS files |

## Conventions

- **Pure browser JS**: No Electron, no Node APIs
- **Virtual DOM**: Snabbdom for efficient updates
- **ContentState**: Central document model
- **Event-driven**: Events → ContentState updates → Re-render
- **Renderer pattern**: AST nodes → Snabbdom vnodes → DOM

## Anti-Patterns

- NEVER import Electron APIs
- NEVER import Node.js modules (fs, path, etc)
- NEVER use `process`, `require('electron')`
- NEVER assume Node environment

## Notes

- **Build**: `yarn build:muya` — separate Webpack build
- **Entry**: `lib/index.js` exports `Muya` class
- **Constraints**: Must work in pure browser (for future web version)
- **Syntax highlighting**: Prism.js integration
- **Diagrams**: sequence-diagram-snap.js (vendored)
- **Math**: KaTeX integration
- **Tables**: Custom table rendering with column resize
