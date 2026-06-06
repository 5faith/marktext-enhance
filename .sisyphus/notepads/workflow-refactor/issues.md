# Issues — Workflow Refactor

## Known Issues (from analysis)
1. 🔴 release.yml: Python after yarn install → **Task 1 will fix**
2. 🔴 release.yml: Linux checksum runs on macOS → **Task 1 will fix**
3. 🔴 release.yml: target input unused → **Task 1 will fix**
4. 🟡 build.yml: Windows cache commented out → **Task 2 will fix**
5. 🟡 release.yml: Missing cache id → **Task 1 will fix**
6. 🟡 release.yml: Imprecise `runner.os` conditions → **Task 1 will fix**
7. 🔵 Both: Redundant `continue-on-error: false` → **Tasks 1+2 will fix**
8. 🔵 build.yml: No workflow_dispatch inputs → **Task 2 will fix**
9. 🔵 build.yml: Commented env var → **Task 2 will fix**
10. 🔵 release.yml: Duplicate step names → **Task 1 will fix**

## F2: 代码质量审查发现 (2026-06-06)
11. 🟡 跨文件 ID 命名不一致: release.yml `cache-node-modules` vs build.yml `cacheNodeModules` → 风格问题
12. 🟠 macOS Electron cache 路径可能无效: 使用 `~/.cache/electron` 而 macOS 实际为 `~/Library/Caches/electron` → CI 每次重新下载 Electron
