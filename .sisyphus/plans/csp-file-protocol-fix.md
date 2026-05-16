# CSP file: 协议修复计划

## 问题描述

生产环境和开发环境中，CSP 策略阻止了 `file://` URL 的访问，导致：
- `@electron/remote` 模块加载警告
- Source map 支持失败
- 可能的资源加载问题

## 根本原因

`index.html` 中的 CSP 策略缺少 `file:` 协议声明：
```html
connect-src * 'self' http://localhost:* ws://localhost:*
```

虽然包含 `*` 通配符，但在 Electron/Chromium 中，`*` **不匹配 `file:` 协议**。

## 解决方案

修改 `index.html` 第 6 行，在相关 CSP 指令中添加 `file:`：

### 修改前
```html
<meta http-equiv="Content-Security-Policy" content="default-src * 'self' 'unsafe-inline' 'unsafe-eval' data: blob:; script-src * 'self' 'unsafe-inline' 'unsafe-eval' data: blob:; style-src * 'self' 'unsafe-inline' data: blob:; font-src * 'self' data: blob:; img-src * 'self' data: blob:; connect-src * 'self' http://localhost:* ws://localhost:*;">
```

### 修改后
```html
<meta http-equiv="Content-Security-Policy" content="default-src * 'self' 'unsafe-inline' 'unsafe-eval' data: blob: file:; script-src * 'self' 'unsafe-inline' 'unsafe-eval' data: blob:; style-src * 'self' 'unsafe-inline' data: blob:; font-src * 'self' data: blob: file:; img-src * 'self' data: blob: file:; connect-src * 'self' http://localhost:* ws://localhost:* file:;">
```

## 改动说明

1. **`default-src`**: 添加 `file:` - 作为其他指令的 fallback
2. **`font-src`**: 添加 `file:` - 允许加载本地字体文件
3. **`img-src`**: 添加 `file:` - 允许加载本地图片
4. **`connect-src`**: 添加 `file:` - 允许 fetch/XHR 请求 file:// URL

## 验证步骤

1. **开发环境**：
   - 重启 `yarn dev`
   - 检查控制台是否还有 CSP 警告
   - 验证 `@electron/remote` 功能正常

2. **生产环境**：
   - 运行 `yarn build`
   - 启动构建后的应用
   - 检查控制台无 CSP 错误
   - 验证所有功能正常

## 风险评估

- **风险等级**: 低
- **影响范围**: 仅 CSP 策略，不影响业务逻辑
- **回滚方案**: 恢复原始 CSP 配置即可

## 执行命令

```bash
# 1. 修改 index.html（手动或使用 sed）
# 2. 验证开发环境
yarn dev

# 3. 构建生产环境
yarn build

# 4. 测试生产构建
# Windows: ./build/win-unpacked/marktext.exe
# macOS: ./build/mac/marktext.app
# Linux: ./build/linux-unpacked/marktext
```
