# Learnings — Workflow Refactor

## Conventions
- YAML 缩进: 2 spaces
- GitHub Actions `if:` 条件使用 `|` 多行语法
- `name:` 格式: 英文短描述，首字母大写
- cache key 格式: `${{ runner.os }}-{cache-name}-${{ hashFiles(...) }}`

## Patterns
- GitHub Actions 的 `continue-on-error: false` 是默认值，显式声明冗余
- `runner.os` 值为 `Linux`/`macOS`/`Windows`（首字母大写）
- `inputs.target` 仅在 `workflow_dispatch` 事件时有值，tag push 时为 undefined
- Windows 上 `${{ env.LOCALAPPDATA }}` 用于 Electron cache 路径
- Unix 上 `${{ env.HOME }}` 用于 Electron cache 路径

## Gotchas
- release.yml 的 Python 在 yarn install **之后** → 原生模块编译缺少 Python
- release.yml checksum 步骤 `if: runner.os != 'Windows'` 会在 macOS 上错误执行
- Windows 的 backslash 路径: `${{ github.workspace }}\yarn.lock`
- sha256sum 是 Linux 命令，macOS 使用 shasum -a 256

## release.yml Rewrite (2026-06-06)
- Split 3-way: linux (ubuntu-latest), macos (macos-15), windows (windows-latest) — no matrix
- `runner.os` 仅用于 cache key 命名（`${{ runner.os }}-cache-name-...`），不作为 `if:` 条件
- `inputs.target` + `github.event_name != 'workflow_dispatch'` 回退 → tag push 全量构建
- Python setup 必须在 yarn install 之前（所有 job），否则原生模块编译缺 Python
- 所有 cache steps 添加 `id: cache-node-modules`
- 移除所有 `continue-on-error: false`（GitHub Actions 默认值）
- Checksum 步骤名唯一化：Linux/macOS/Windows checksums
- macOS 不需要 apt-get deps、strip ripgrep、DISPLAY
- Windows checksum 使用 `Get-FileHash -Algorithm SHA256` + pwsh shell
- Windows cache 路径使用 backslash: `${{ github.workspace }}\node_modules`
- YAML 验证通过（js-yaml parse OK，3 jobs，0 matrix，0 runner.os 条件）

## build.yml 编辑记录 (2026-06-06)

### 已完成的修改
1. **Windows cache-hit 恢复** — 第183行 `if: ${{ steps.cacheNodeModules.outputs.cache-hit != 'true' }}` 取消注释
2. **workflow_dispatch inputs** — 添加 `target` choice 参数 (linux/mac/win/all)
3. **job-level if: 过滤** — unix/windows 两个 job 都添加了 `github.event_name != 'workflow_dispatch' || inputs.target == 'all' || ...` 条件
4. **移除冗余 continue-on-error: false** — 两个 job 均删除（默认值）
5. **移除注释死代码** — 两个 job 的 `# MARKTEXT_IS_STABLE: 1` 均已删除

### 关键决策
- Windows `id: cacheNodeModules` 已存在（原始文件就已设置），无需额外修改
- `if:` 条件放在 `runs-on:` 之前，符合 GitHub Actions 规范
- unix job 的 if 条件中使用 `matrix.os == 'ubuntu-latest'` / `matrix.os == 'macos-15'` 精确匹配
- 验证使用 Python `yaml.safe_load()` 替代 yq（yq 未安装）

## F2: 代码质量审查 (2026-06-06)

### 检查结果
- **YAML 语法**: release.yml ✅ / build.yml ✅ (Python yaml.safe_load)
- **Step Names**: 69 个 step，0 重复 (各 job 内唯一)
- **ID 属性**: release.yml 精确 3 个 `id: cache-node-modules`，Electron/Electron-Builder cache 均无 id ✅
- **条件表达式**: 10 条条件，全部含 `github.event_name != 'workflow_dispatch'` fallback，无语法错误 ✅

### 发现
- release.yml 与 build.yml 的 node_modules cache id 命名不一致：`cache-node-modules` vs `cacheNodeModules`
- macOS job 的 Electron cache 路径使用 `${{ env.HOME }}/.cache/electron`，实际 `@electron/get` 在 macOS 上的路径为 `~/Library/Caches/electron`，缓存可能无效
