## 1. 内置词典文件

- [x] 1.1 复制 `resources/hunspell_dictionaries/en-US.bdic` 到 `static/dictionaries/en-US.bdic`
- [x] 1.2 验证词典文件存在且大小 > 8KB

## 2. 配置本地词典加载

- [x] 2.1 在 `editor.js` 中添加 `setSpellCheckerDictionaryDownloadURL` 配置，指向本地 `file://` 路径
- [ ] 2.2 测试离线环境下拼写检查器能正常初始化

## 3. 修改 SpellChecker 初始化逻辑

- [x] 3.1 修改 `_initSpellchecker()` 方法，添加错误处理，初始化失败时不崩溃
- [x] 3.2 修改 `getAvailableDictionaries()` 方法，扫描 `static/dictionaries/` 和 `userData/dictionaries/` 两个目录
- [x] 3.3 修改 `_switchLanguage()` 方法，添加词典文件存在性检查

## 4. 添加导入词典功能

- [ ] 4.1 在 `src/renderer/spellchecker/index.js` 中添加 `importDictionary()` 方法
- [ ] 4.2 实现词典文件验证逻辑（扩展名、文件大小）
- [ ] 4.3 实现词典文件复制到 `userData/dictionaries/` 目录
- [ ] 4.4 添加词典列表刷新功能

## 5. 更新偏好设置 UI

- [ ] 5.1 在 `src/renderer/prefComponents/spellchecker/index.vue` 中添加"导入词典"按钮
- [ ] 5.2 实现文件选择器，过滤 `.bdic` 格式
- [ ] 5.3 调用导入方法并处理成功/失败提示
- [ ] 5.4 导入成功后刷新语言选择下拉框

## 6. 测试验证

- [ ] 6.1 测试离线环境下拼写检查器正常工作
- [ ] 6.2 测试导入有效词典文件成功
- [ ] 6.3 测试导入无效文件显示错误提示
- [ ] 6.4 测试词典列表正确合并内置和用户词典
