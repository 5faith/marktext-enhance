# Decisions — Workflow Refactor

## Architecture
- **release.yml 拆分 unix matrix → linux/macos 独立 job**: 消除 OS 条件分支，target 过滤更清晰
- **build.yml 保留 unix matrix**: 只需在 `if` 中加 `matrix.os` 条件判断即可

## Target Filtering
- **回退策略**: `github.event_name != 'workflow_dispatch'` → tag push 时自动全量构建
- **条件模式**: 每个 job 有自己的 `if:`，检查 `inputs.target` 与自身平台匹配

## Windows Cache
- **根因**: cache 恢复后原生 `.node` 文件可能过期 → 始终运行 electron-rebuild
- **修复**: 恢复 `cache-hit` 条件用于跳过 `yarn install`，但 electron-rebuild 不受条件保护
