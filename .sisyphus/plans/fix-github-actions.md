# 修复 GitHub Actions 版本问题

## TL;DR

> **快速摘要**：修复 GitHub Actions 工作流中已弃用的 actions/cache v2 版本，同时升级其他过时的 actions 和 runner 版本。
> 
> **交付物**：
> - 更新后的 `.github/workflows/build.yml`
> - 更新后的 `.github/workflows/release.yml`
> - 修复后的 CI/CD 工作流
> 
> **预计工作量**：快速（Quick）
> **并行执行**：是 - 3 波任务
> **关键路径**：Task 1-3 → Task 4 → Task 5 → Final Verification

---

## 上下文

### 原始请求
用户报告 GitHub Actions 构建失败，错误信息显示使用了已弃用的 `actions/cache: v2`。

### 问题分析
**build.yml** 和 **release.yml** 中存在以下问题：

| 问题 | 位置 | 数量 | 严重性 |
|------|------|------|--------|
| `actions/cache@v2` 已弃用 | 两个文件 | 12 处 | **高** - 导致构建失败 |
| `actions/checkout@v2` 过时 | 两个文件 | 4 处 | 中 - 使用 Node 16 运行时 |
| `actions/setup-node@v2` 过时 | 两个文件 | 4 处 | 中 - 使用 Node 16 运行时 |
| `macos-11` runner 已弃用 | 两个文件 | 2 处 | **高** - 2024年12月开始 brownout |
| `windows-latest` 即将迁移 | 两个文件 | 2 处 | 中 - 2025年9月迁移到 Windows 2025 |
| 双斜杠路径错误 | build.yml:66 | 1 处 | 低 - `.cache//electron-builder` |
| 缓存键命名不一致 | build.yml | 多处 | 低 - Windows 使用 `-v1` 后缀 |

### Metis 审查发现
- **关键遗漏**：`macos-11` 已在 brownout 期，必须立即升级
- **Node.js 14 已 EOL**：2023年4月结束支持（但用户未要求升级，暂不处理）
- **GabrielBB/xvfb-action@v1** 已归档：虽仍可用，但存在风险
- **缓存键冲突风险**：v4 向后兼容，但可能需要重新生成

---

## 工作目标

### 核心目标
升级所有已弃用的 GitHub Actions 版本和 runner，修复 CI/CD 构建失败问题。

### 具体交付物
- `.github/workflows/build.yml` - 所有 actions 升级到 v4
- `.github/workflows/release.yml` - 所有 actions 升级到 v4
- `macos-11` → `macos-13`
- 修复路径双斜杠问题
- 标准化缓存键命名

### 完成定义
- [ ] 所有 `actions/cache@v2` 替换为 `actions/cache@v4`
- [ ] 所有 `actions/checkout@v2` 替换为 `actions/checkout@v4`
- [ ] 所有 `actions/setup-node@v2` 替换为 `actions/setup-node@v4`
- [ ] 所有 `macos-11` 替换为 `macos-13`
- [ ] 双斜杠路径修复为单斜杠
- [ ] 缓存键命名标准化
- [ ] 工作流语法验证通过

### 必须包含
- 修复导致构建失败的 actions/cache v2
- 升级已弃用的 macos-11 runner
- 修复明显的路径错误

### 必须不包含（防护措施）
- **不升级 Node.js 版本**（保持 Node 14，除非用户明确要求）
- **不重构工作流结构**（保持作业名称、步骤名称和逻辑不变）
- **不更改构建命令**（yarn 脚本保持不变）
- **不添加新功能**（不扩展矩阵，不添加新 OS 目标）
- **不更改产物路径**（electron-builder 缓存路径保持不变）
- **不替换 GabrielBB/xvfb-action**（虽已归档，但用户未要求更换）

---

## 验证策略

> **零人工干预** - 所有验证由代理执行。不接受"用户手动测试"的验收标准。

### 测试决策
- **基础设施存在**：是 - GitHub Actions
- **自动化测试**：否 - 这是 CI/CD 配置更新
- **框架**：GitHub Actions 工作流语法验证
- **Agent 执行 QA**：每个任务包含具体的验证场景

### QA 策略
每个任务必须包含 Agent 执行的 QA 场景：
- **工作流语法**：使用 `act --dry-run` 或类似工具验证 YAML 语法
- **版本验证**：使用 grep 确认所有旧版本已替换
- **路径验证**：确认文件路径和缓存键正确

---

## 执行策略

### 并行执行波次

```
Wave 1 (立即开始 - Actions 版本升级):
├── Task 1: 升级 actions/cache v2 → v4 [quick]
├── Task 2: 升级 actions/checkout v2 → v4 [quick]
└── Task 3: 升级 actions/setup-node v2 → v4 [quick]

Wave 2 (Wave 1 完成后 - Runner 升级和修复):
├── Task 4: 升级 macos-11 → macos-13 [quick]
└── Task 5: 修复路径和缓存键问题 [quick]

Wave FINAL (所有任务完成后 - 验证):
├── Task F1: 工作流语法验证 [quick]
├── Task F2: 版本一致性检查 [quick]
└── Task F3: 创建测试 PR 验证 [quick]
-> 呈现结果 -> 获取用户确认

关键路径：Task 1-3 → Task 4 → Task 5 → F1-F3 → 用户确认
并行加速：Wave 1 的 3 个任务可并行执行
最大并发：3 (Wave 1)
```

### 依赖矩阵

- **1-3**: - - 4, 5
- **4**: 1, 2, 3 - 5, F1-F3
- **5**: 4 - F1-F3
- **F1-F3**: 1-5 - 用户确认

### Agent 分配摘要

- **1**: **3** - T1-T3 → `quick`
- **2**: **2** - T4-T5 → `quick`
- **FINAL**: **3** - F1-F3 → `quick`

---

## TODOs

- [x] 1. 升级 actions/cache v2 → v4

  **What to do**:
  - 在 `.github/workflows/build.yml` 中，将 6 处 `actions/cache@v2` 替换为 `actions/cache@v4`
    - 第 49 行: Cache node_modules (Unix)
    - 第 58 行: Cache Electron (Unix)
    - 第 64 行: Cache Electron-Builder (Unix)
    - 第 117 行: Cache node_modules (Windows)
    - 第 126 行: Cache Electron (Windows)
    - 第 132 行: Cache Electron-Builder (Windows)
  - 在 `.github/workflows/release.yml` 中，将 6 处 `actions/cache@v2` 替换为 `actions/cache@v4`
    - 第 44 行: Cache node_modules (Unix)
    - 第 52 行: Cache Electron (Unix)
    - 第 58 行: Cache Electron-Builder (Unix)
    - 第 140 行: Cache node_modules (Windows)
    - 第 148 行: Cache Electron (Windows)
    - 第 154 行: Cache Electron-Builder (Windows)

  **Must NOT do**:
  - 不更改缓存路径
  - 不更改缓存键格式（除了 Task 5 的标准化）
  - 不添加或删除缓存步骤

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 简单的查找替换任务，无需复杂逻辑
  - **Skills**: []
    - 无需特殊技能

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (与 Task 2, 3 并行)
  - **Blocks**: Task 4, Task 5
  - **Blocked By**: None (可立即开始)

  **References**:
  - `build.yml:49,58,64,117,126,132` - 需要更新的 actions/cache 位置
  - `release.yml:44,52,58,140,148,154` - 需要更新的 actions/cache 位置
  - GitHub Docs: https://github.com/actions/cache - v4 迁移指南

  **Acceptance Criteria**:
  - [ ] `grep -c "actions/cache@v2" .github/workflows/*.yml` 返回 0
  - [ ] `grep -c "actions/cache@v4" .github/workflows/*.yml` 返回 12
  - [ ] 所有缓存路径保持不变

  **QA Scenarios**:
  ```
  Scenario: 验证所有 actions/cache 已升级
    Tool: Bash (grep)
    Preconditions: 工作流文件已修改
    Steps:
      1. 运行: grep -n "actions/cache@v2" .github/workflows/build.yml .github/workflows/release.yml
      2. 运行: grep -n "actions/cache@v4" .github/workflows/build.yml .github/workflows/release.yml
    Expected Result: 
      - 第一个命令无输出（返回空）
      - 第二个命令显示 12 行匹配
    Failure Indicators: 
      - 仍有 v2 残留
      - v4 数量不是 12
    Evidence: .sisyphus/evidence/task-1-cache-upgrade.txt
  ```

  **Evidence to Capture**:
  - [ ] grep 输出结果截图/文本

  **Commit**: YES
  - Message: `ci: upgrade actions/cache from v2 to v4`
  - Files: `.github/workflows/build.yml`, `.github/workflows/release.yml`

- [x] 2. 升级 actions/checkout v2 → v4

  **What to do**:
  - 在 `.github/workflows/build.yml` 中，将 2 处 `actions/checkout@v2` 替换为 `actions/checkout@v4`
    - 第 31 行: Unix job
    - 第 98 行: Windows job
  - 在 `.github/workflows/release.yml` 中，将 2 处 `actions/checkout@v2` 替换为 `actions/checkout@v4`
    - 第 26 行: Unix job
    - 第 121 行: Windows job

  **Must NOT do**:
  - 不更改 checkout 配置（如 fetch-depth 等）
  - 不添加或删除 checkout 步骤

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (与 Task 1, 3 并行)
  - **Blocks**: Task 4, Task 5
  - **Blocked By**: None

  **References**:
  - `build.yml:31,98` - checkout 位置
  - `release.yml:26,121` - checkout 位置

  **Acceptance Criteria**:
  - [ ] `grep -c "actions/checkout@v2" .github/workflows/*.yml` 返回 0
  - [ ] `grep -c "actions/checkout@v4" .github/workflows/*.yml` 返回 4

  **QA Scenarios**:
  ```
  Scenario: 验证所有 actions/checkout 已升级
    Tool: Bash (grep)
    Steps:
      1. 运行: grep -n "actions/checkout@v2" .github/workflows/*.yml
      2. 运行: grep -n "actions/checkout@v4" .github/workflows/*.yml
    Expected Result: 
      - v2 无匹配
      - v4 有 4 处匹配
    Evidence: .sisyphus/evidence/task-2-checkout-upgrade.txt
  ```

  **Commit**: YES (与 Task 1 合并)
  - Message: `ci: upgrade actions/checkout from v2 to v4`
  - Files: `.github/workflows/build.yml`, `.github/workflows/release.yml`

- [x] 3. 升级 actions/setup-node v2 → v4

  **What to do**:
  - 在 `.github/workflows/build.yml` 中，将 2 处 `actions/setup-node@v2` 替换为 `actions/setup-node@v4`
    - 第 34 行: Unix job
    - 第 101 行: Windows job
  - 在 `.github/workflows/release.yml` 中，将 2 处 `actions/setup-node@v2` 替换为 `actions/setup-node@v4`
    - 第 29 行: Unix job
    - 第 124 行: Windows job
  - **注意**：保持 Node 版本为 14（用户未要求升级）

  **Must NOT do**:
  - **不升级 Node.js 版本**（保持 node-version: 14）
  - 不更改 cache 配置

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (与 Task 1, 2 并行)
  - **Blocks**: Task 4, Task 5
  - **Blocked By**: None

  **References**:
  - `build.yml:34,101` - setup-node 位置
  - `release.yml:29,124` - setup-node 位置

  **Acceptance Criteria**:
  - [ ] `grep -c "actions/setup-node@v2" .github/workflows/*.yml` 返回 0
  - [ ] `grep -c "actions/setup-node@v4" .github/workflows/*.yml` 返回 4
  - [ ] Node 版本仍为 14（检查 node-version: 14 存在）

  **QA Scenarios**:
  ```
  Scenario: 验证所有 actions/setup-node 已升级且 Node 版本未变
    Tool: Bash (grep)
    Steps:
      1. 运行: grep -n "actions/setup-node@v2" .github/workflows/*.yml
      2. 运行: grep -n "actions/setup-node@v4" .github/workflows/*.yml
      3. 运行: grep -n "node-version: 14" .github/workflows/*.yml
    Expected Result: 
      - v2 无匹配
      - v4 有 4 处匹配
      - node-version: 14 仍有 4 处匹配
    Evidence: .sisyphus/evidence/task-3-setup-node-upgrade.txt
  ```

  **Commit**: YES (与 Task 1-2 合并)
  - Message: `ci: upgrade actions/setup-node from v2 to v4`
  - Files: `.github/workflows/build.yml`, `.github/workflows/release.yml`

- [x] 4. 升级 macos-11 → macos-13

  **What to do**:
  - 在 `.github/workflows/build.yml` 第 21 行，将 `macos-11` 替换为 `macos-13`
  - 在 `.github/workflows/release.yml` 第 16 行，将 `macos-11` 替换为 `macos-13`
  - **原因**：macos-11 已于 2024年12月进入 brownout 期，即将完全移除

  **Must NOT do**:
  - 不升级到 macos-12（也已弃用）
  - 不更改其他 runner（ubuntu-latest, windows-latest）

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 (顺序执行)
  - **Blocks**: Task 5
  - **Blocked By**: Task 1, Task 2, Task 3

  **References**:
  - `build.yml:21` - macos-11 位置
  - `release.yml:16` - macos-11 位置
  - GitHub Blog: https://github.blog/changelog/2024-05-20-github-actions-macos-13-and-14-now-available/

  **Acceptance Criteria**:
  - [ ] `grep -c "macos-11" .github/workflows/*.yml` 返回 0
  - [ ] `grep -c "macos-13" .github/workflows/*.yml` 返回 2

  **QA Scenarios**:
  ```
  Scenario: 验证 macos runner 已升级
    Tool: Bash (grep)
    Steps:
      1. 运行: grep -n "macos-11" .github/workflows/*.yml
      2. 运行: grep -n "macos-13" .github/workflows/*.yml
    Expected Result: 
      - macos-11 无匹配
      - macos-13 有 2 处匹配（分别在 build.yml 和 release.yml）
    Evidence: .sisyphus/evidence/task-4-macos-upgrade.txt
  ```

  **Commit**: YES
  - Message: `ci: upgrade macos runner from 11 to 13`
  - Files: `.github/workflows/build.yml`, `.github/workflows/release.yml`

- [x] 5. 修复路径和缓存键问题

  **What to do**:
  - **修复双斜杠**：在 `build.yml` 第 66 行，将 `.cache//electron-builder` 改为 `.cache/electron-builder`
  - **标准化缓存键**：在 `build.yml` Windows job 中，移除 `node_modules` 缓存键中的不一致 `-v1` 后缀
    - 第 121 行: 将 `${{ runner.os }}-node_modules-cache-v1-...` 改为 `${{ runner.os }}-node_modules-cache-...`
    - 第 123 行: 将 `${{ runner.os }}-node_modules-cache-v1-` 改为 `${{ runner.os }}-node_modules-cache-`

  **Must NOT do**:
  - 不更改缓存路径（只修复双斜杠）
  - 不添加新的缓存键格式

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 (与 Task 4 顺序执行)
  - **Blocks**: Final Verification
  - **Blocked By**: Task 4

  **References**:
  - `build.yml:66` - 双斜杠位置
  - `build.yml:121,123` - 缓存键位置

  **Acceptance Criteria**:
  - [ ] `grep "\.cache//" .github/workflows/*.yml` 返回空
  - [ ] Unix 和 Windows 的 node_modules 缓存键格式一致（都不带 `-v1` 后缀）

  **QA Scenarios**:
  ```
  Scenario: 验证双斜杠已修复
    Tool: Bash (grep)
    Steps:
      1. 运行: grep "\.cache//" .github/workflows/*.yml
    Expected Result: 无输出
    Evidence: .sisyphus/evidence/task-5-path-fix.txt

  Scenario: 验证缓存键已标准化
    Tool: Bash (grep)
    Steps:
      1. 运行: grep "node_modules-cache-v1" .github/workflows/*.yml
      2. 运行: grep "node_modules-cache-" .github/workflows/*.yml
    Expected Result: 
      - 第一个命令无输出（没有 -v1 后缀）
      - 第二个命令显示缓存键（Unix 和 Windows 都使用相同格式）
    Evidence: .sisyphus/evidence/task-5-cache-key-fix.txt
  ```

  **Commit**: YES
  - Message: `ci: fix double slash in cache path and standardize cache keys`
  - Files: `.github/workflows/build.yml`

---

## Final Verification Wave

- [ ] F1. **工作流语法验证** — `quick`
  使用 `act --dry-run` 或在线 YAML 验证器检查两个工作流文件的语法正确性。
  **Acceptance Criteria**:
  - [ ] `act -j unix --dry-run` 无语法错误
  - [ ] `act -j windows --dry-run` 无语法错误
  **Evidence**: `.sisyphus/evidence/final-syntax-check.txt`

- [ ] F2. **版本一致性检查** — `quick`
  验证所有 actions 版本已正确升级。
  **Acceptance Criteria**:
  - [ ] 无 `actions/*@v2` 残留
  - [ ] 所有 cache 为 v4
  - [ ] 所有 checkout 为 v4
  - [ ] 所有 setup-node 为 v4
  - [ ] macos-13 已配置
  **Evidence**: `.sisyphus/evidence/final-version-check.txt`

- [ ] F3. **创建测试 PR 验证** — `quick`
  提交更改到分支，创建 PR，验证 GitHub Actions 能够成功启动。
  **Acceptance Criteria**:
  - [ ] PR 创建成功
  - [ ] GitHub Actions 工作流能够启动（不因为语法错误而立即失败）
  **Evidence**: PR 链接和工作流运行截图

---

## Commit Strategy

### Commit 1: Actions 版本升级（Task 1-3）
```
ci: upgrade GitHub Actions to v4

- Upgrade actions/cache from v2 to v4 (12 occurrences)
- Upgrade actions/checkout from v2 to v4 (4 occurrences)
- Upgrade actions/setup-node from v2 to v4 (4 occurrences)

Fixes deprecated actions/cache v2 which causes build failures.
```
**Files**: `.github/workflows/build.yml`, `.github/workflows/release.yml`

### Commit 2: Runner 升级（Task 4）
```
ci: upgrade macos runner from 11 to 13

macos-11 is deprecated and in brownout period.
Upgrade to macos-13 for continued support.
```
**Files**: `.github/workflows/build.yml`, `.github/workflows/release.yml`

### Commit 3: 路径和缓存键修复（Task 5）
```
ci: fix cache path and standardize cache keys

- Fix double slash in electron-builder cache path
- Standardize node_modules cache key naming between Unix and Windows
```
**Files**: `.github/workflows/build.yml`

---

## Success Criteria

### 验证命令
```bash
# 验证无 v2 actions 残留
grep -c "actions/.*@v2" .github/workflows/*.yml
# Expected: 0

# 验证所有 cache 为 v4
grep -c "actions/cache@v4" .github/workflows/*.yml
# Expected: 12

# 验证所有 checkout 为 v4
grep -c "actions/checkout@v4" .github/workflows/*.yml
# Expected: 4

# 验证所有 setup-node 为 v4
grep -c "actions/setup-node@v4" .github/workflows/*.yml
# Expected: 4

# 验证 macos-13
grep -c "macos-13" .github/workflows/*.yml
# Expected: 2

# 验证无双斜杠
grep "\.cache//" .github/workflows/*.yml
# Expected: 无输出
```

### 最终检查清单
- [ ] 所有 "Must Have" 已满足
- [ ] 所有 "Must NOT Have" 未违反
- [ ] 所有工作流语法正确
- [ ] GitHub Actions 能够成功启动
