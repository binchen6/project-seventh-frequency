# 《第七频率》Debug 报告

> 日期：2026-05-02  
> 检查范围：project-seventh-frequency 完整项目

---

## 🔴 严重 Bug（已修复）

### 1. ch1 为空 → 游戏启动即崩溃
**问题**：ch1 只有 1 个空场景（ch1_sc1），dialogues = []。游戏启动后 `renderDialogue()` 发现无对话 → 调用 `nextScene()` → scene++ → 越界 → `showChapterEnd()`。玩家**看不到任何内容**就进入章节完成画面。

**修复**：重建 ch1 为 3 场景（验尸房 → 深夜决定 → 白锦书办公室），含 21 段对话 + 6 个 choices。

### 2. 所有章节首场景为空
**问题**：ch2-ch5 的首场景（ch2_sc1, ch3_sc1, ch4_sc1, ch5_sc1）dialogues = []，choices = []。玩家进入新章节后看到空白。

**修复**：为每个空场景填充基础对话（2-3 段）+ 2 个 choices。

### 3. 全项目 0 个 choices
**问题**：script.json 原版本 33 个场景，choices 总数 = 0。游戏无分支、无互动、无玩家 agency。

**修复**：重建 script.json：
- ch1: 6 choices
- ch2: 8 choices  
- ch3: 7 choices
- ch4: 8 choices
- ch5: 7 choices
- **合计 36 个 choices**

### 4. game.jsp 背景路径双重 `bg/`
**问题**：`loadBackground()` 拼接 `assets/bg/` + `bg/ch1_morgue.png` → `assets/bg/bg/ch1_morgue.png` (404)

**修复**：`loadBackground()` 改为 `src.startsWith('assets/') ? src : 'assets/bg/' + src`

### 5. engine.js `timestamp()` 命名冲突
**问题**：`update(dt)` 调用 `timestamp()` 全局函数，但 `loop(timestamp)` 参数名也是 `timestamp`。两者冲突导致打字机效果可能不更新。

**修复**：引入全局 `now` 变量，`loop()` 每帧更新 `now = timestamp`，所有时间相关方法统一使用 `now`。

### 6. engine.js `resize()` 累积 ctx.scale()
**问题**：每次 resize 调用 `ctx.scale()` 叠加，导致 Canvas 内容指数级缩小/放大。

**修复**：`resize()` 不再调用 `ctx.scale()`，仅计算缩放因子；`render()` 用 `setTransform()` 一次性应用。

### 7. 存档 key 不一致
**问题**：engine.js 用 `seventh_freq_save_*`，game.jsp 用 `sf_save_slot_*`。两套系统互不兼容。

**修复**：engine.js 统一改为 `sf_save_slot_*`。

### 8. index.html 链接错误
**问题**："继续游戏" 和 "插图画廊" 链接指向 `jsp/game.html` / `jsp/gallery.html`，但文件实际是 `.jsp`。

**修复**：改为 `jsp/game.jsp` / `jsp/gallery.jsp`。

### 9. `current_scene` 索引不一致
**问题**：`index.html` 新建游戏时存 `current_scene = 1`（1-indexed），但 `game.jsp` 用 0-indexed。导致读档时跳过第1场景。

**修复**：`index.html` 改为 `current_scene = 0`。

### 10. game.jsp 无 DPI 适配
**问题**：Canvas `width/height` 等于 CSS 像素尺寸，高分屏模糊。

**修复**：加入 `devicePixelRatio` 缩放：`canvas.width = clientWidth * dpr`，`ctx.scale(dpr, dpr)`。

### 11. game.jsp `makeChoice` effects 处理错误
**问题**：`effects` 中所有 key 都直接加到 `state.params`，无边界检查。负数效果会让 params 变成负值；affection key 被误加到 params。

**修复**：先检查 `state.params[key] !== undefined`，再检查 `state.affection[key] !== undefined`，分别应用 `Math.max(-100, Math.min(100, ...))` 和 `Math.max(0, Math.min(100, ...))`。

### 12. engine.js 角色名映射缺失
**问题**：`_resolveAssetPath` 用中文名拼路径（如 `assets/characters/沈默_neutral.png`），但文件名是拼音（`shenmo_neutral.png`）。

**修复**：加入 `charNameMap` 映射中文名→拼音。

### 13. engine.js 缺少 CLUE/ZHOU 参数
**问题**：params 只有 INTEL/DRAMA/ACTION/TECH，但 script.json 有 CLUE/ZHOU。

**修复**：params 扩展为 6 维度，加入 CLUE 和 ZHOU。

### 14. game.jsp 无 BGM 播放
**问题**：scene 数据有 `bgm` 字段，但 `loadScene()` 完全忽略。

**修复**：加入 `playBGM()` / `stopBGM()` 函数，`loadScene()` 在加载背景后播放 BGM。

---

## 🟡 结构问题（已优化 / 需注意）

### 15. 两套并行引擎体系
**现状**：
- `engine.js` + `scenes.js` + `audio.js` + `echoes.js` + `ui.js` = 一套模块化引擎（**未被任何页面加载**）
- `game.jsp` 内联了完整引擎 = 另一套（**实际运行**）

**优化**：暂不删除模块化引擎文件（未来可迁移），但 `game.jsp` 的 inline 引擎已修复所有 runtime bug。

### 16. echoes 数据缺失
**现状**：script.json 无 echoes 定义，`checkEchoes()` 永不为真。

**建议**：后续根据剧本加入 echoes 配置（如隐藏线索触发金色涟漪）。

### 17. CSS 文件未加载
**现状**：`css/main.css`, `css/animations.css` 等文件存在，但 `game.jsp` 使用内联 CSS。

**建议**：若未来需要统一主题管理，可将内联 CSS 提取到外部文件。

---

## 🟢 当前状态

| 检查项 | 状态 |
|--------|------|
| JSON 有效性 | ✅ 通过 |
| 场景链接完整性 | ✅ 全部有效 |
| 空场景 | ✅ 已清除 |
| choices 总数 | ✅ 36 个 |
| ch1 可玩性 | ✅ 3 场景完整流程 |
| 代码 runtime bugs | ✅ 全部修复 |
| Echoes 数据 | ✅ 6 个回响事件已配置 |
| CSS 外部化 | ✅ game.css 已提取 |
| 模块化引擎 | ✅ 原型 game-engine.jsp 已创建 |
---

## 📋 修改文件清单

1. `web/index.html` — 修复链接、current_scene 索引
2. `web/jsp/game.jsp` — 修复背景路径、DPI、BGM、makeChoice、存档
3. `web/js/engine.js` — 修复 timestamp、resize、params、角色映射、存档 key
4. `web/data/script.json` — 重建：填充空场景、添加 36 个 choices

---

*报告生成：2026-05-02 15:55*


### ✅ 剩余待办已完成

1. ✅ **Echoes 数据**：script.json 添加 6 个回响事件
2. ✅ **CSS 外部化**：game.jsp 内联 CSS 提取到 css/game.css，game.jsp 改为加载外部 CSS
3. ✅ **模块化引擎**：创建 game-engine.jsp 原型 + js/README.md + 更新 index.jsp 为引擎选择页

---

## 📋 完整修改文件清单（10 个文件）

| # | 文件 | 操作 | 说明 |
|---|------|------|------|
| 1 | web/index.html | 修改 | 修复链接、current_scene 索引 |
| 2 | web/jsp/game.jsp | 修改 | 修复背景路径、DPI、BGM、makeChoice、存档、加载外部 CSS |
| 3 | web/js/engine.js | 修改 | 修复 timestamp、resize、params、角色映射、存档 key |
| 4 | web/data/script.json | 重建 | 填充空场景、36 个 choices、6 个 echoes |
| 5 | web/css/game.css | 新建 | 从 game.jsp 提取的内联 CSS |
| 6 | web/jsp/game-engine.jsp | 新建 | 模块化引擎原型入口 |
| 7 | web/jsp/index.jsp | 更新 | 引擎选择页面 |
| 8 | web/js/README.md | 新建 | 模块化引擎说明文档 |
| 9 | web/ARCHITECTURE.md | 更新 | 双引擎体系说明 |
| 10 | DEBUG_REPORT.md | 新建 | 完整 bug 修复报告 |
