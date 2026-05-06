# 字数悬浮窗显示修复计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修复 MarkText 标题栏字数统计悬浮窗不显示的问题，实现鼠标悬停时显示 Words、Characters、Paragraphs 详情

**Architecture:** 在 Vue 3 Composition API 的 `titleBar/index.vue` 组件中补全悬浮窗的状态管理、事件处理和CSS样式。使用 `ref` 创建 `showPopup` 响应式变量，在鼠标事件中更新状态，添加必要的CSS样式实现悬浮窗的定位和动画。

**Tech Stack:** Vue 3 (Composition API), Vite, Electron

---

## 文件清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/renderer/components/titleBar/index.vue` | Modify | 补全 showPopup 状态、鼠标事件处理、CSS样式 |

---

## 问题根因

**Phase 1 已完成 - 根因分析:**

1. **`showPopup` 硬编码返回 `false`** (第245-248行)
   - 导致 `v-show="showPopup"` 永远为 false，悬浮窗不显示

2. **鼠标事件处理方法为空** (第237-243行)
   - `handleWordCountMouseEnter()` 和 `handleWordCountMouseLeave()` 没有实现

3. **CSS样式缺失** 
   - `.word-count-popup` 样式完全没有定义
   - `.popup-fade` 过渡动画未定义
   - `.popup-align-left` 对齐样式未定义

---

### Task 1: 修复状态管理和事件处理

**Files:**
- Modify: `src/renderer/components/titleBar/index.vue:145-253`

- [ ] **Step 1: 添加 showPopup 响应式变量**

在 `titleBar/index.vue` 第145行之后添加：

```javascript
// State
const isOsxRef = ref(isOsx)
const isFullScreen = ref(getCurrentWindow().isFullScreen())
const isMaximized = ref(getCurrentWindow().isMaximized())
const show = ref('word')
const showPopup = ref(false)  // <-- 新增这一行
```

- [ ] **Step 2: 修改 showPopup computed 为直接使用 ref**

将第245-248行：

```javascript
const showPopup = computed(() => {
  // Logic to show popup
  return false
})
```

修改为：

```javascript
// showPopup 现在是 ref，不需要 computed
```

(直接删除这个 computed，因为我们已经在 State 中声明了 `showPopup = ref(false)`)

- [ ] **Step 3: 实现鼠标事件处理方法**

将第237-243行：

```javascript
const handleWordCountMouseEnter = () => {
  // Handle mouse enter
}

const handleWordCountMouseLeave = () => {
  // Handle mouse leave
}
```

修改为：

```javascript
const handleWordCountMouseEnter = () => {
  showPopup.value = true
  // 触发 popupAlignLeft 的重新计算
  nextTick(() => {
    if (wordCountPopup.value && wordCountBtn.value) {
      const popupRect = wordCountPopup.value.getBoundingClientRect()
      const btnRect = wordCountBtn.value.getBoundingClientRect()
      // 如果悬浮窗右侧超出视口，则向左对齐
      if (popupRect.right > window.innerWidth) {
        popupAlignLeftOverride.value = true
      } else {
        popupAlignLeftOverride.value = false
      }
    }
  })
}

const handleWordCountMouseLeave = () => {
  showPopup.value = false
  popupAlignLeftOverride.value = false
}
```

- [ ] **Step 4: 修改 popupAlignLeft 为响应式变量**

将第250-253行：

```javascript
const popupAlignLeft = computed(() => {
  // Logic to align popup left
  return false
})
```

修改为：

```javascript
const popupAlignLeftOverride = ref(false)
const popupAlignLeft = computed(() => popupAlignLeftOverride.value)
```

- [ ] **Step 5: 导入 nextTick**

修改第108行，导入 `nextTick`：

```javascript
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
```

---

### Task 2: 添加悬浮窗CSS样式

**Files:**
- Modify: `src/renderer/components/titleBar/index.vue:452-465`

- [ ] **Step 1: 在 scoped style 末尾添加悬浮窗样式**

在第451行（`</style>` 之前）添加：

```css
  .word-count-popup {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 4px;
    padding: 6px 10px;
    background: var(--floatBgColor);
    color: var(--floatFontColor);
    border-radius: 4px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    font-size: 13px;
    line-height: 1.4;
    white-space: nowrap;
    z-index: 100;
    pointer-events: none;
  }

  .word-count-popup.popup-align-left {
    right: auto;
    left: 0;
  }

  /* 悬浮窗弹出/淡出动画 */
  .popup-fade-enter-active,
  .popup-fade-leave-active {
    transition: opacity 0.2s ease;
  }

  .popup-fade-enter-from,
  .popup-fade-leave-to {
    opacity: 0;
  }
```

- [ ] **Step 2: 确保 word-count-wrapper 有相对定位**

检查第394-411行的 `.word-count` 样式，确保其父级 `.word-count-wrapper` 有定位。

在第411行后添加：

```css
  .word-count-wrapper {
    position: relative;
    display: inline-flex;
    align-items: center;
  }
```

---

### Task 3: 验证修复

- [ ] **Step 1: 启动开发服务器**

```bash
yarn dev
```

- [ ] **Step 2: 验证悬浮窗显示**

1. 打开任意 Markdown 文件
2. 将鼠标悬停在右上角的字数统计上（如 `W 123`）
3. **预期**: 显示包含 `Words: xxx`、`Characters: xxx`、`Paragraphs: xxx` 的悬浮窗
4. 鼠标移开时，悬浮窗应淡出隐藏
5. 点击字数统计应能正常切换显示类型（W/C/P/A）

---

### Task 4: 提交代码

- [ ] **Step 1: 提交修改**

```bash
git add src/renderer/components/titleBar/index.vue
git commit -m "fix: 修复字数统计悬浮窗不显示的问题"
```

提交信息说明：
- 添加 `showPopup` ref 状态管理
- 实现 `handleWordCountMouseEnter` 和 `handleWordCountMouseLeave` 事件处理
- 添加悬浮窗CSS样式（背景、定位、阴影、动画）
- 添加 `.word-count-wrapper` 相对定位以支持悬浮窗定位

---

## 验收标准

1. ✅ 鼠标悬停字数统计时，悬浮窗显示包含 Words、Characters、Paragraphs
2. ✅ 鼠标离开时，悬浮窗通过淡出动画隐藏
3. ✅ 悬浮窗样式正确（背景色、阴影、圆角）
4. ✅ 悬浮窗不会超出视口边界（自动左对齐）
5. ✅ 点击切换功能（W/C/P/A）仍然正常工作
6. ✅ ESLint 检查通过：`yarn lint`

---

## 注意事项

1. **CSS变量**: 使用现有主题变量 `var(--floatBgColor)` 和 `var(--floatFontColor)`，如果这些变量不存在，需要检查主题系统定义
2. **定位**: 悬浮窗使用 `position: absolute` 相对于 `.word-count-wrapper` 定位
3. **过渡动画**: 使用 Vue 3 的 `<transition>` 组件，需要定义 `.popup-fade-enter-*` 和 `.popup-fade-leave-*` 类
4. **对齐逻辑**: 当悬浮窗可能超出右侧视口时，添加 `.popup-align-left` 类使其向左对齐
