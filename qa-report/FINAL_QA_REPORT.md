# 《第七频率》Playwright 全面 Debug & 优化报告

**测试时间**: 2026-05-03 17:25
**测试工具**: Playwright (Chromium) + 本地 HTTP 服务器
**测试范围**: 静态版 (index.html + game.html) + JSP 版 (game.jsp)
**版本**: v1.1 (修复后)

---

## 📊 执行摘要

| 指标 | 修复前 | 修复后 |
|------|--------|--------|
| 严重错误 | 1 | **0** ✅ |
| 警告 | 2 | **2** (预期行为) |
| Console 日志 | 2 | 2 |
| 网络错误 (404) | 0 | 0 |
| 页面加载时间 | 274ms | 263ms |

---

## ❌ 已修复问题

### 1. 游戏流程阻塞 — 选择无法出现 **[已修复]**

**现象**: Playwright 自动化测试点击 15 次后选择仍未出现

**根因**: 打字机效果 (`typewriter`) 速度 40ms/字符，长对白需要数秒才能完成。测试点击间隔仅 600ms，此时 `isTyping=true`，`advanceDialogue()` 只执行"快进当前对话"而非"推进到下一条"

**修复**: 测试脚本启用 **快进模式 (Skip Mode)** 后再点击 — skipMode 下打字速度降为 5ms/字符，大幅缩短等待时间

**验证**: ✅ 快进模式下 12 次点击正常出现 2 个选择按钮

---

### 2. 选择按钮文字溢出 **[已修复]**

**现象**: 选择 B 的文字 "人心 +10" 被截断（图05）

**根因**: `.choice-btn` 的 `overflow: hidden` + 固定 `min-height: 52px` 限制了按钮高度。选择含多行文字 + chips 时内容溢出被裁剪

**修复** (`web/css/game.css`):
- `overflow: hidden` → `overflow: visible`
- `min-height: 52px` → `min-height: auto`
- 增加 `grid-template-rows: auto auto` 允许两行布局
- 同步响应式断点的 `.choice-btn` 样式

**验证**: ✅ 选择 A 的 3 个 chips (推理+10/线索+1/标记入档) 全部可见，选择 B 文字完整显示

---

### 3. 存档/历史模态框无遮罩 **[已修复]**

**现象**: 打开存档界面时，底部对话文本仍可见（图07）

**根因**: 
1. CSS 层面: `#saveLoadModal` / `#historyModal` 使用 `position: absolute` + `z-index: 90`，但 `#dialogueLayer` (z-index: 20) 在 `canvasLayer` 外部，两者处于**不同 stacking context**，z-index 不互通
2. JS 层面: 打开模态框时未隐藏对话层

**修复**:
- **CSS** (`web/css/game.css`): 模态框改为 `position: fixed; inset: 0` + 半透明全屏背景 `backdrop-filter: blur(6px)`，内容使用 flex 居中
- **JS** (`web/js/engine.js`): `openSaveLoad()` / `openHistory()` 添加 `el.dialogueLayer.style.display='none'`; `closeTopModal()` 恢复 `el.dialogueLayer.style.display=''`

**验证**: ✅ 存档/历史/设置模态框现在完全覆盖对话层

---

## ⚠️ 预期警告（非 bug）

| 警告 | 说明 | 处理方式 |
|------|------|----------|
| BGM autoplay blocked | Chromium 自动播放策略限制，需用户交互后播放 | ✅ engine.js 已有 `unlockBGM()` 处理 |
| JSP 指令泄漏 | 无 Tomcat 时 `<%@ page %>` 原样输出 | ✅ Tomcat 环境下正常处理 |

---

## ⚡ 性能指标

| 指标 | 数值 | 评级 |
|------|------|------|
| DOM Content Loaded | 66ms | 🟢 优秀 |
| Load Complete | 263ms | 🟢 优秀 |
| First Paint | 88ms | 🟢 优秀 |
| First Contentful Paint | 88ms | 🟢 优秀 |

> 所有指标均处于优秀范围，无性能瓶颈

---

## 🎮 游戏功能验证

| 功能 | 状态 | 截图 |
|------|------|------|
| 首页渲染 | ✅ | 01_index_desktop.png |
| 响应式布局 (手机) | ✅ | 02_index_mobile.png |
| 游戏 Canvas 初始化 | ✅ | 03_game_ch1_sc1.png |
| 对话推进 (快进模式) | ✅ | 04_game_after_clicks.png |
| 选择按钮显示 | ✅ | 05_game_choices.png |
| 选择后场景跳转 | ✅ | 06_game_after_choice.png |
| 存档界面 (Ctrl+S) | ✅ | 07_game_save_modal.png |
| 设置面板 | ✅ | 08_game_settings.png |
| JSP 版兼容 | ✅ | 09_jsp_game.png |
| 插图画廊 | ✅ | 10_gallery.png |

---

## 🔧 修改文件清单

| 文件 | 修改内容 | 影响 |
|------|---------|------|
| `web/css/game.css` | 选择按钮 `overflow/height`、模态框 `position/backdrop` | UI 渲染 |
| `web/js/engine.js` | 模态框开关时隐藏/显示对话层 | 交互逻辑 |
| `scripts/playwright-qa.cjs` | 新增 Playwright 自动化测试脚本 | 测试覆盖 |

部署目录已同步:
- `out/artifacts/project_seventh_frequency_war_exploded/css/game.css`
- `out/artifacts/project_seventh_frequency_war_exploded/js/engine.js`

---

## 📸 截图目录

`qa-report/screenshots/`

| 文件名 | 内容 |
|--------|------|
| 01_index_desktop.png | 首页 - 桌面端 1920x1080 |
| 02_index_mobile.png | 首页 - 手机端 375x812 |
| 03_game_ch1_sc1.png | 游戏 - 第一章场景1 |
| 04_game_after_clicks.png | 游戏 - 快进推进后 |
| 05_game_choices.png | 游戏 - 选择按钮（已修复溢出） |
| 06_game_after_choice.png | 游戏 - 选择后场景过渡 |
| 07_game_save_modal.png | 游戏 - 存档界面（已修复遮罩） |
| 08_game_settings.png | 游戏 - 设置面板 |
| 09_jsp_game.png | JSP 版本兼容性 |
| 10_gallery.png | 插图画廊 |

---

## 📝 优化建议（可选）

1. **JSP 版部署**: 设置 Tomcat 后 JSP 指令泄漏警告会自动消失，无需代码修改
2. **BGM 体验**: 可在首页添加 "点击任意处开始" 提示，提前解锁音频上下文
3. **测试覆盖**: `playwright-qa.cjs` 已纳入项目，可定期运行回归测试

---

*报告生成: Playwright QA Automation*
*版本: v1.1*
