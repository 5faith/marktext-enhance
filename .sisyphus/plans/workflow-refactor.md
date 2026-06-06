# GitHub Actions Workflow 重构

## TL;DR

> **Quick Summary**: 修复 `build.yml` 和 `release.yml` 中的 10 个问题（含 3 个会导致 CI 失败的严重 bug），同时按用户决策增强 `target` 参数、Windows cache 优化和 `workflow_dispatch` 输入。
>
> **Deliverables**:
> - 重构后的 `.github/workflows/release.yml`（unix matrix 拆分为独立 linux/macos job，所有问题修复）
> - 重构后的 `.github/workflows/build.yml`（Windows cache 修复、workflow_dispatch 增强、清理）
>
> **Estimated Effort**: Quick (~15-20 分钟执行)
> **Parallel Execution**: YES - 2 waves
> **Critical Path**: Task 1/2（并行）→ F1-F4（审查）

---

## Context

### Original Request
用户升级了项目框架（Vue 2→Vue 3, Webpack→Vite），想重新整理 GitHub Actions workflow 构建流程，基于之前的完整分析结果修改 `build.yml` 和 `release.yml`。

### Interview Summary
**Key Discussions**:
- **target 参数**: 使其真正生效，在 jobs 中添加条件判断实现按需构建
- **Windows cache**: 修复根因并恢复 cache-hit 优化（当前被注释掉导致每次全量安装）
- **build.yml workflow_dispatch**: 添加平台选择参数（与 release.yml 保持一致）

**Architecture Decision**: 将 release.yml 的 unix matrix job (`os: [macos-15, ubuntu-latest]`) 拆分为独立的 `linux` 和 `macos` job。这消除了 matrix 内的 OS 条件分支问题，也使 `target` 过滤更清晰。

### Research Findings
- **项目结构**: 仅 2 个 workflow 文件，无子 workflow 或 composite action
- **Job 结构**: 每个文件只有 `unix`（matrix）和 `windows` 两个 job，无 `create-release` 或 `PACKAGE_VERSION` 依赖
- **Python 依赖**: 原生模块（ced, cld, keytar, native-keymap, fontmanager-redux, keyboard-layout）通过 node-gyp 编译，依赖 Python 3.11
- **build.yml Python 顺序正确**: 只有 release.yml 的 Python 在 yarn install 之后

### Metis Review
**关键发现**:
- `target` 参数在 tag push 触发时 `inputs.target` 为 undefined → 需添加 `github.event_name != 'workflow_dispatch'` 回退逻辑
- Windows cache 根因需确保 `electron-rebuild` 在 cache 恢复后始终执行（当前已如此，只需恢复 cache-hit 条件）
- 拆分后 checksum 生成需按平台使用正确工具（Linux: sha256sum, macOS: shasum -a 256, Windows: Get-FileHash）
- 本项目无 `create-release` / `PACKAGE_VERSION` 依赖链（Metis 基于常见模板假设，实际不适用）

---

## Work Objectives

### Core Objective
修复 `build.yml` 和 `release.yml` 中所有已识别问题，同时实现用户决策的三项增强。

### Concrete Deliverables
- `.github/workflows/release.yml` — 完全重构（拆分 matrix、修复 bug、target 生效、清理）
- `.github/workflows/build.yml` — 增强（Windows cache 修复、workflow_dispatch 输入、清理）

### Definition of Done
- [ ] 所有 10 个问题已修复（可通过 grep/yq 静态验证）
- [ ] `release.yml` 的 `target` 参数在 jobs 中实际生效
- [ ] `build.yml` 的 `workflow_dispatch` 有平台选择输入
- [ ] 两个文件通过 YAML 语法校验

### Must Have
- Python 在所有 job 中都在 `yarn install` 之前安装
- checksum 步骤使用正确的平台工具（sha256sum / shasum / Get-FileHash）
- `target` 输入在 `workflow_dispatch` 时生效，tag push 时默认全平台构建
- Windows job 恢复 cache-hit 条件优化
- 拆分后的 linux/macos job 各自正确处理平台专属步骤

### Must NOT Have (Guardrails)
- **不修改** artifact 命名规则
- **不修改** yarn cache key 计算公式
- **不修改** `electron-builder.yml` 或 `package.json`
- **不修改** `MARKTEXT_EXIT_ON_ERROR: 1` 行为
- **不修改** signing/notarization 相关步骤
- **不升级** action 版本（checkout@v4, setup-node@v4, setup-python@v5 等保持不变）
- **不创建** 新 workflow 文件或 composite action
- **不添加** 新功能（Slack 通知、新平台、新测试套件等）

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — 所有验证为 Agent 静态检查。

### Test Decision
- **Infrastructure exists**: NO（workflow 文件无传统测试框架）
- **Automated tests**: None
- **Framework**: N/A（使用 yq + grep 做 YAML 结构验证）
- **QA 方式**: Agent 执行的静态分析 — YAML 语法校验 + 逻辑审查

### QA Policy
每项验收通过以下方式验证：
- **YAML 语法**: `yq eval '.' <file>` 无错误返回
- **条件逻辑**: grep 检查 `if:` 条件表达式正确性
- **步骤顺序**: grep 行号对比确认 `setup-python` 在 `yarn install` 之前
- **结构完整性**: 检查 job 名称、`needs` 引用、matrix 是否已移除

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (并行 — 两个文件独立):
├── Task 1: release.yml — 拆分 matrix + 修复全部问题 [deep]
└── Task 2: build.yml — 修复 Windows cache + 增强 + 清理 [deep]

Wave FINAL (4 个审查 agent 并行):
├── Task F1: 计划合规审计 (oracle)
├── Task F2: 代码质量审查 (unspecified-high)
├── Task F3: QA 场景验证 (unspecified-high)
└── Task F4: 范围保真度检查 (deep)

Critical Path: Task 1 → F1-F4
Parallel Speedup: ~50% (2 个实现任务并行)
Max Concurrent: 2 (Wave 1) + 4 (Wave FINAL)
```

### Dependency Matrix

- **1**: - - F1-F4, 2（与 Task 2 无依赖，可并行）
- **2**: - - F1-F4, 1（与 Task 1 无依赖，可并行）
- **F1-F4**: 1, 2 - - 4

### Agent Dispatch Summary

- **Wave 1**: **2** — T1 → `deep`, T2 → `deep`
- **Wave FINAL**: **4** — F1 → `oracle`, F2 → `unspecified-high`, F3 → `unspecified-high`, F4 → `deep`

---

## TODOs

- [x] 1. **release.yml — 拆分 unix matrix + 修复所有问题**

  **What to do**:
  - [ ] **拆分 matrix**: 将 `unix` job 的 `strategy.matrix.os: [macos-15, ubuntu-latest]` 拆为两个独立 job: `linux`（`runs-on: ubuntu-latest`）和 `macos`（`runs-on: macos-15`）
  - [ ] **移除冗余 `runner.os` 条件**: 拆分后每个 job 天然对应一个 OS，删除不再需要的 `if: runner.os == 'Linux'` / `if: runner.os != 'Windows'` 等条件
  - [ ] **保留平台专属步骤**:
    - Linux job: 保留 `apt-get install`（含 `rpm` 用于 .rpm 打包）、`strip ripgrep`
    - macOS job: 无需 apt-get、无需 strip ripgrep
    - 两个 job 都保留: Python setup、yarn install、patch C++20、electron-rebuild、lint、test、build
  - [ ] **修复 Python 顺序** (#1): 确保 `actions/setup-python@v5` 步骤在 `yarn install` **之前**（当前 release.yml 的 Python 在 yarn install 之后，是 bug）
  - [ ] **修复 checksum 步骤** (#2, #10): 
    - Linux job 的 checksum 步骤命名为 `"Calculate Linux checksums"`，使用 `sha256sum`，检查 `build/marktext-x64.tar.gz`、`build/marktext-x86_64.AppImage`、`build/marktext-*.deb`、`build/marktext-*.rpm`（不再有 `if` 条件，它只在 Linux job 中）
    - macOS job 的 checksum 步骤命名为 `"Calculate macOS checksums"`，使用 `shasum -a 256`，检查 `build/marktext-arm64-mac.zip`、`build/marktext-x64-mac.zip`、`build/marktext-arm64.dmg`、`build/marktext-x64.dmg`
  - [ ] **实现 `target` 输入生效** (#3): 为 `linux`、`macos`、`windows` 三个 job 添加 `if:` 条件:
    ```yaml
    if: |
      github.event_name != 'workflow_dispatch' ||
      inputs.target == 'all' ||
      inputs.target == 'linux'   # 各 job 对应自己的平台
    ```
    - tag push 时无 `inputs.target` → 条件第一部分为 true → 所有平台都构建
    - workflow_dispatch 时根据 `target` 值过滤
  - [ ] **修复 `runner.os` 条件精度** (#6): 拆分后确认无残留的 `runner.os != 'Windows'` 等取反条件（每个 job 天然 OS 确定）
  - [ ] **添加 cache 步骤 id** (#5): Linux 和 macOS job 的 `actions/cache@v4`（node_modules）都添加 `id: cache-node-modules`
  - [ ] **删除 `continue-on-error: false`** (#7): 从 Linux 和 macOS job 中移除（GitHub Actions 默认就是 false）
  - [ ] **删除 `strategy.matrix`**: 拆分后不再需要 matrix 配置

  **Must NOT do**:
  - 不要修改 artifact 命名（保持 `electron-builder.yml` 中的 `artifactName` 不变）
  - 不要修改 signing/notarization 相关步骤
  - 不要改变 `yarn install`、`yarn run lint`、`yarn run test` 的调用方式
  - 不要修改 `DISPLAY: ":99.0"` 等 Linux 专属 env var（仅在 Linux job 中保留）
  - 不要升级任何 action 版本

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: 需要仔细处理 YAML 结构重构，确保步骤顺序和条件逻辑完全正确，涉及多平台差异
  - **Skills**: [`git-master`]
    - `git-master`: 用于后续原子提交

  **Parallelization**:
  - **Can Run In Parallel**: YES（与 Task 2 并行）
  - **Parallel Group**: Wave 1（with Task 2）
  - **Blocks**: Task F1, F2, F3, F4
  - **Blocked By**: None

  **References**:
  - `D:\workspace\github-my\marktext-enhance\.github\workflows\release.yml` — 当前文件（重构对象）
  - `D:\workspace\github-my\marktext-enhance\electron-builder.yml:81-89` — macOS artifact 命名规则 (`marktext-${arch}-mac.${ext}`)
  - `D:\workspace\github-my\marktext-enhance\electron-builder.yml:119-140` — Linux artifact 命名规则 (`marktext-${arch}.${ext}`)
  - `D:\workspace\github-my\marktext-enhance\electron-builder.yml:100-111` — Windows artifact 命名规则 (`marktext-${arch}-win.${ext}`)
  - `D:\workspace\github-my\marktext-enhance\package.json:10-12` — release 脚本: `release:linux`, `release:mac`, `release:win`

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: 拆分后 Linux job 独立构建
    Tool: Bash (静态验证 — yq + grep)
    Preconditions: release.yml 已修改
    Steps:
      1. yq eval '.jobs.linux.runs-on' release.yml → 输出 "ubuntu-latest"
      2. yq eval '.jobs.macos.runs-on' release.yml → 输出 "macos-15"
      3. grep -c "strategy:" release.yml → 输出 0（matrix 已移除）
      4. grep "runner.os" release.yml → 无输出（无残留 OS 条件）
      5. grep -n "setup-python" release.yml && grep -n "yarn install" release.yml → setup-python 行号 < yarn install 行号
    Expected Result: 结构验证全部通过
    Failure Indicators: matrix 残留、runner.os 条件残留、Python 顺序错误
    Evidence: .sisyphus/evidence/task-1-structure-validation.txt

  Scenario: target=linux 时只有 Linux job 执行
    Tool: Bash (静态验证 — yq)
    Preconditions: release.yml 已修改
    Steps:
      1. yq eval '.jobs.linux.if' release.yml → 包含 "inputs.target == 'linux'" 和 "github.event_name != 'workflow_dispatch'"
      2. yq eval '.jobs.macos.if' release.yml → 包含 "inputs.target == 'mac'" 和 "github.event_name != 'workflow_dispatch'"
      3. yq eval '.jobs.windows.if' release.yml → 包含 "inputs.target == 'win'" 和 "github.event_name != 'workflow_dispatch'"
    Expected Result: 三个 job 都有正确的 if 条件
    Failure Indicators: 缺少 if 条件、条件中平台名称不匹配
    Evidence: .sisyphus/evidence/task-1-target-condition.txt

  Scenario: checksum 步骤使用正确的平台工具
    Tool: Bash (静态验证 — grep)
    Preconditions: release.yml 已修改
    Steps:
      1. grep -A5 "Calculate Linux checksums" release.yml → 包含 "sha256sum"
      2. grep -A5 "Calculate macOS checksums" release.yml → 包含 "shasum -a 256"
      3. grep "Calculate checksums" release.yml | sort | uniq -d → 无输出（无重复步骤名）
    Expected Result: Linux 用 sha256sum，macOS 用 shasum，无重复名称
    Failure Indicators: sha256sum 出现在 macOS job、shasum 出现在 Linux job、步骤名称重复
    Evidence: .sisyphus/evidence/task-1-checksum-validation.txt
  ```

  **Evidence to Capture**:
  - [ ] `task-1-structure-validation.txt` — 结构验证输出
  - [ ] `task-1-target-condition.txt` — target 条件验证输出
  - [ ] `task-1-checksum-validation.txt` — checksum 验证输出

  **Commit**: YES
  - Message: `ci: refactor release.yml — split unix matrix, fix Python ordering, implement target filtering`
  - Files: `.github/workflows/release.yml`
  - Pre-commit: `yq eval '.' .github/workflows/release.yml`（YAML 语法校验）

---

- [x] 2. **build.yml — 修复 Windows cache + 增强 workflow_dispatch + 清理**

  **What to do**:
  - [ ] **修复 Windows cache 优化** (#4): 
    - 当前 Windows job 第 166-169 行 `yarn install` 被无条件执行（cache-hit 检查被注释掉）
    - 根因分析：注释说 "Windows worker fail sometimes because a module cannot be found" — 这是因为 cache 恢复后原生 `.node` 文件可能过期/缺失
    - 修复方案：恢复 `if: ${{ steps.cacheNodeModules.outputs.cache-hit != 'true' }}` 条件，但确保 Windows job 的 `electron-rebuild` 步骤（第 171-172 行）**始终执行**（当前已如此，无需改动）
    - 步骤操作：
      1. 为 Windows job 的 cache 步骤添加 `id: cacheNodeModules`（当前缺少 id，参考 unix job 的 cache 步骤）
      2. 取消注释 Windows job `yarn install` 步骤的 `if: ${{ steps.cacheNodeModules.outputs.cache-hit != 'true' }}`
  - [ ] **添加 workflow_dispatch 平台选择** (#8):
    - 在 `build.yml` 的 `workflow_dispatch:` 下添加 `inputs:` 段
    - 添加 `target` 参数：`type: choice`，`options: [linux, mac, win, all]`，`default: 'all'`
    - 为 `unix` job（matrix）添加 `if:` 条件 — 需要同时利用 `matrix.os` 和 `inputs.target`:
      ```yaml
      if: |
        github.event_name != 'workflow_dispatch' ||
        inputs.target == 'all' ||
        (inputs.target == 'linux' && matrix.os == 'ubuntu-latest') ||
        (inputs.target == 'mac' && matrix.os == 'macos-15')
      ```
    - 为 `windows` job 添加 `if:` 条件:
      ```yaml
      if: |
        github.event_name != 'workflow_dispatch' ||
        inputs.target == 'all' ||
        inputs.target == 'win'
      ```
  - [ ] **删除 `continue-on-error: false`** (#7): 从 `unix`（第 20 行）和 `windows`（第 118 行）job 中移除
  - [ ] **清理注释的 env var** (#9): 删除 `unix` job 中注释掉的 `# MARKTEXT_IS_STABLE: 1`（第 29 行），删除 `windows` job 中注释掉的 `# MARKTEXT_IS_STABLE: 1`（第 122 行）

  **Must NOT do**:
  - 不要拆分 build.yml 的 unix matrix（保持 matrix 结构，只在条件判断中处理平台过滤）
  - 不要修改 Python 顺序（build.yml 的 Python 顺序已经正确: 在 yarn install 之前）
  - 不要修改 `apt-get` 安装的包列表（build.yml 不需要 `rpm`，是对的）
  - 不要添加 checksum 步骤（build.yml 不需要，只管 CI 构建验证）
  - 不要修改任何其他 env var 的值

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: 涉及条件逻辑修改和 cache 行为分析，需要仔细处理
  - **Skills**: [`git-master`]
    - `git-master`: 用于后续原子提交

  **Parallelization**:
  - **Can Run In Parallel**: YES（与 Task 1 并行）
  - **Parallel Group**: Wave 1（with Task 1）
  - **Blocks**: Task F1, F2, F3, F4
  - **Blocked By**: None

  **References**:
  - `D:\workspace\github-my\marktext-enhance\.github\workflows\build.yml` — 当前文件（修改对象）
  - `D:\workspace\github-my\marktext-enhance\.github\workflows\build.yml:51-58` — unix job cache 步骤（参考正确的 cache id 和条件模式）
  - `D:\workspace\github-my\marktext-enhance\.github\workflows\build.yml:137-144` — Windows job cache 步骤（需要添加 id）
  - `D:\workspace\github-my\marktext-enhance\.github\workflows\build.yml:166-172` — Windows job install + rebuild 步骤（恢复 cache-hit 条件）

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: Windows job 恢复 cache-hit 优化
    Tool: Bash (静态验证 — grep)
    Preconditions: build.yml 已修改
    Steps:
      1. grep -A5 "Cache node_modules" build.yml（windows 段）→ 包含 "id: cacheNodeModules"
      2. grep -A2 "Install dependencies" build.yml（windows 段）→ 包含 "if:" 和 "cache-hit"
      3. grep -A5 "Rebuild native" build.yml（windows 段）→ 无 cache-hit 条件（始终执行）
    Expected Result: cache id 存在、cache-hit 条件已恢复、electron-rebuild 无保护条件
    Failure Indicators: cache id 缺失、cache-hit 仍被注释、electron-rebuild 被放入条件块
    Evidence: .sisyphus/evidence/task-2-cache-fix.txt

  Scenario: workflow_dispatch 输入参数存在且正确
    Tool: Bash (静态验证 — yq)
    Preconditions: build.yml 已修改
    Steps:
      1. yq eval '.on.workflow_dispatch.inputs.target.type' build.yml → "choice"
      2. yq eval '.on.workflow_dispatch.inputs.target.default' build.yml → "all"
      3. yq eval '.on.workflow_dispatch.inputs.target.options' build.yml → ["linux", "mac", "win", "all"]
      4. yq eval '.jobs.unix.if' build.yml → 包含 "matrix.os" 和 "inputs.target"
      5. yq eval '.jobs.windows.if' build.yml → 包含 "inputs.target"
    Expected Result: workflow_dispatch 有 target 参数，jobs 有条件判断
    Failure Indicators: 无 inputs 段、jobs 无 if 条件
    Evidence: .sisyphus/evidence/task-2-dispatch-inputs.txt

  Scenario: 已清理 continue-on-error 和注释 env var
    Tool: Bash (静态验证 — grep)
    Preconditions: build.yml 已修改
    Steps:
      1. grep "continue-on-error" build.yml → 无输出（已移除）
      2. grep "# MARKTEXT_IS_STABLE" build.yml → 无输出（已移除）
    Expected Result: 无冗余配置和死代码
    Failure Indicators: continue-on-error 残留、注释的 env var 残留
    Evidence: .sisyphus/evidence/task-2-cleanup.txt
  ```

  **Evidence to Capture**:
  - [ ] `task-2-cache-fix.txt` — cache 修复验证输出
  - [ ] `task-2-dispatch-inputs.txt` — workflow_dispatch 参数验证输出
  - [ ] `task-2-cleanup.txt` — 清理验证输出

  **Commit**: YES
  - Message: `ci: enhance build.yml — fix Windows cache, add workflow_dispatch inputs, cleanup`
  - Files: `.github/workflows/build.yml`
  - Pre-commit: `yq eval '.' .github/workflows/build.yml`（YAML 语法校验）

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

> 4 个审查 agent 并行运行。ALL must APPROVE。向用户展示汇总结果并获取明确 "okay" 后才能完成。
>
> **在获得用户批准前，不要标记 F1-F4 为完成。**

- [x] F1. **计划合规审计** — `oracle`
  从头到尾阅读计划。对每个 "Must Have"：验证实现是否存在（grep/yq 检查文件）。对每个 "Must NOT Have"：搜索禁止模式 — 发现则用 `file:line` 标记拒绝。检查 `.sisyphus/evidence/` 中的证据文件是否存在。对比交付物与计划。
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [x] F2. **代码质量审查** — `unspecified-high`
  对两个文件运行 `yq eval '.'` 验证 YAML 语法。检查：重复的步骤名称、缺少的 `id` 属性、语法错误风险（如未闭合的引号）、条件表达式可读性。
  Output: `YAML Syntax [PASS/FAIL] | Step Names [N clean/N dupes] | Conditions [N clean/N issues] | VERDICT`

- [x] F3. **QA 场景验证** — `unspecified-high`
  从干净状态开始。执行 **每个** Task 的 **每个** QA 场景 — 按精确步骤执行，捕获证据。测试跨文件一致性（两个文件的 `target` 参数行为一致）。保存到 `.sisyphus/evidence/final-qa/`。
  Output: `Scenarios [N/N pass] | Cross-file [CONSISTENT/INCONSISTENT] | VERDICT`

- [x] F4. **范围保真度检查** — `deep`
  对每个 Task：阅读 "What to do"，阅读实际 diff（`git diff`）。验证 1:1 — spec 中的一切都被构建（无遗漏），spec 之外的没有被构建（无 scope creep）。检查 "Must NOT do" 合规性。检测跨任务污染。标记未记录的变更。
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

| Task | Message | Files |
|------|---------|-------|
| 1 | `ci: refactor release.yml — split unix matrix, fix Python ordering, implement target filtering` | `.github/workflows/release.yml` |
| 2 | `ci: enhance build.yml — fix Windows cache, add workflow_dispatch inputs, cleanup` | `.github/workflows/build.yml` |

---

## Success Criteria

### 验证命令
```bash
# YAML 语法检查
yq eval '.' .github/workflows/build.yml
yq eval '.' .github/workflows/release.yml

# 问题回归检查
grep "runner.os != 'Windows'" .github/workflows/release.yml    # 预期: 无输出
grep "continue-on-error" .github/workflows/*.yml                # 预期: 无输出
grep "# MARKTEXT_IS_STABLE" .github/workflows/build.yml        # 预期: 无输出
grep -c "sha256sum" .github/workflows/release.yml              # 预期: 1 (仅 Linux job)
grep -c "shasum -a 256" .github/workflows/release.yml          # 预期: 1 (仅 macOS job)
```

### 最终检查清单
- [ ] 所有 10 个问题已修复（可通过上述命令验证）
- [ ] `release.yml` 无 matrix（已拆分为独立的 linux/macos job）
- [ ] `target` 参数在 release.yml 中实际控制 job 执行
- [ ] `build.yml` workflow_dispatch 有平台选择输入
- [ ] Windows job 恢复了 cache-hit 优化
- [ ] Python 在所有 job 中都在 yarn install 之前
- [ ] checksum 步骤使用正确的平台工具
- [ ] 无冗余 `continue-on-error: false`
- [ ] 无注释掉的 env var
- [ ] 两个文件 YAML 语法通过 `yq` 校验


