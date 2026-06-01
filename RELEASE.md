# Release Guide

## 发布新版本步骤

### 1. 修改版本号

编辑 `package.json`，修改 `version` 字段：

```json
{
  "version": "x.y.z"
}
```

### 2. 提交代码

```bash
git add package.json
git commit -m "chore: release v1.0.1"
```

### 3. 推送到 release 分支触发构建

```bash
git push origin release-v1.0.0
```

push 到 `release-v*` 分支会自动触发 GitHub Actions Release workflow，构建 3 个平台的产物并发布到 GitHub Release。

### 手动触发

也可以在 GitHub Actions 页面使用 `workflow_dispatch` 手动触发，选择构建目标（linux/mac/win/all）。

---

## 需要修改的文件

| 文件 | 修改内容 | 示例 |
|------|----------|------|
| `package.json` | `version` 字段 | `"version": "1.0.1"` |

**注意：** electron-builder 从 `package.json` 的 `version` 字段读取版本号，修改此文件即可控制发布版本。

---

## Release Workflow 说明

- **触发条件：** push 到 `release-v*` 分支
- **构建平台：** Linux (AppImage/deb/rpm/tar.gz)、macOS (dmg/zip)、Windows (nsis/zip)
- **发布方式：** `--publish always`，自动创建 GitHub Release 并上传产物
- **产物输出：** `build/` 目录

## 版本号命名

遵循 [Semver](https://semver.org/) 规范：`MAJOR.MINOR.PATCH`

- **MAJOR:** 不兼容的 API 修改
- **MINOR:** 向下兼容的功能性新增
- **PATCH:** 向下兼容的问题修正
