# 《第七频率》Web 应用架构文档

> 技术栈：JSP + HTML5 Canvas + Web Audio API + Vanilla JS
> 服务器：Tomcat 9.0.41
> 设计风格：Art Deco故障风

---

## 当前状态（2026-05-02 更新）

项目已合并为**单一运行引擎**：

| 入口 | 引擎 | 状态 | 说明 |
|------|------|------|------|
| `jsp/game.jsp` | `js/engine.js` | ✅ 当前唯一运行版本 | Canvas背景 + DOM对话/选择/UI，已通过浏览器冒烟测试 |
| `jsp/game-engine.jsp` | 跳转别名 | ✅ 兼容旧链接 | 自动跳转到 `game.jsp`，不再维护第二套实验引擎 |
| `jsp/index.jsp` | 跳转别名 | ✅ 兼容旧链接 | 自动返回 `index.html` 主菜单 |

### 最新优化

1. ✅ 游戏页 CSS 外置到 `css/game.css`，`game.jsp` 只保留结构和脚本入口
2. ✅ 引擎缓存章节索引、DOM 节点和背景图，减少重复查询与重复图片加载
3. ✅ 下一场景背景预加载，降低选择跳转后的空白等待
4. ✅ resize 使用 `requestAnimationFrame` 合帧，避免窗口变化时重复重绘
5. ✅ 角色立绘按实际素材表兜底，不再为不存在的表情差分发起无效请求

### 合并结果

1. ✅ `game-core.js` 的稳定运行逻辑合并进 `engine.js`
2. ✅ `game.jsp` 只加载 `engine.js`
3. ✅ `game-core.js` 保留为兼容壳，旧页面引用不会立刻坏掉
4. ✅ `game-engine.jsp` 改为统一入口别名，消除双引擎不同步风险
5. ✅ 新增 `scripts/smoke-test.cjs`，覆盖入口、剧本加载、选择跳转和旧入口别名

---

## 一、技术架构

### 整体结构

```
project-seventh-frequency/web/
│
├── jsp/                          ← JSP入口页面
│   ├── index.jsp                 兼容别名：跳转到 index.html
│   ├── game.jsp                  游戏主页面（Canvas）
│   ├── game-engine.jsp           兼容别名：跳转到 game.jsp
│   └── gallery.jsp               插图画廊
│
├── css/
│   ├── main.css                  主样式 + Art Deco变量
│   ├── animations.css            动画关键帧（glitch/涟漪/闪烁）
│   ├── components.css            UI组件（按钮/选择框/对话框）
│   └── responsive.css            响应式适配
│
├── js/
│   ├── engine.js                 ← 统一视觉小说引擎
│   ├── game-core.js              旧入口兼容壳
│   ├── audio.js                  Web Audio API（预留）
│   ├── scenes.js                 场景加载器（预留/工具）
│   ├── puzzles.js                解谜系统（预留）
│   ├── echoes.js                 回响系统（预留）
│   └── ui.js                     UI控制器（预留）
│
├── data/
│   └── script.json               完整剧本数据（JSON格式）
│
├── assets/
│   ├── bg/                       场景背景图（由子代理生成/AI生成）
│   ├── characters/               角色立绘（6人×4表情差分）
│   ├── ui/                       UI元素（Art Deco边框/图标）
│   ├── audio/                    BGM/音效
│   └── illustrations/            10张已生成插图
│
├── WEB-INF/
│   └── web.xml                   Tomcat配置
│
└── index.html                    ← 纯前端备用入口（无Tomcat时直接运行）
```

---

## 二、JSP 页面设计

### index.html — 首页/章节选择

**功能**：
- 项目标题动画（Art Deco故障风）
- 5章选择（未解锁章节灰色锁定）
- 继续游戏（读取LocalStorage存档）
- 设置（BGM开关/字体大小/全屏）
- 插图画廊入口

**设计**：
- 深色背景 + 金色几何纹样边框
- 标题使用「站酷庆科黄油体」装饰字体
- 章节卡片：Art Deco对称图案 + 场景缩略图
- 故障效果：标题偶尔glitch闪烁（CSS animation）

### game.jsp — 游戏主页面

**功能**：
- 全屏Canvas渲染层
- 底部控制栏（存档/读档/设置/历史/自动）
- 响应式：横屏（桌面）+ 竖屏（手机）

**布局**：
```
┌─────────────────────────────────────┐
│  [Canvas渲染层: 场景+角色+对话]      │
│                                     │
├─────────────────────────────────────┤
│  [选择按钮区 - 横屏:底部 / 竖屏:中部] │
├─────────────────────────────────────┤
│  [控制栏: 存档/读档/设置/历史/自动]  │
└─────────────────────────────────────┘
```

---

## 三、核心引擎设计

### engine.js — 视觉小说引擎

```javascript
window.SeventhFrequencyEngine = {
  state,
  loadScene,
  nextScene,
  advanceDialogue,
  makeChoice,
  saveProgress,
  playBGM,
  stopBGM
};
```

### 场景数据格式 (script.json)

```json
{
  "chapters": [
    {
      "id": "ch1",
      "title": "亡者归来",
      "scenes": [
        {
          "id": "ch1_sc1",
          "bg": "morgue.jpg",
          "bgm": "morgue_cello.mp3",
          "dialogues": [
            {
              "text": "验尸房里弥漫着福尔马林和旧木头混合的气味。",
              "speaker": null,
              "expression": null
            },
            {
              "text": "三天？不像。最多……十二小时。",
              "speaker": "沈默",
              "expression": "thinking",
              "illustration": "assets/illustrations/ch1_sc1_morgue.png"
            }
          ],
          "choices": [
            {
              "id": "ch1_c1_a",
              "text": "「这颗珠子……不是普通东西。先收起来。」",
              "effects": {"INTEL": 10, "CLUE": 1},
              "nextScene": "ch1_sc2"
            }
          ]
        }
      ]
    }
  ]
}
```

---

## 四、Art Deco故障风设计规范

### CSS变量系统

```css
:root {
  /* 基础民国色调 */
  --sepia-base: #C4A77D;
  --sepia-dark: #8B7355;
  --sepia-light: #E8DCC8;
  
  /* Art Deco金色 */
  --deco-gold: #D4AF37;
  --deco-gold-light: #F4E4BC;
  --deco-gold-dark: #996515;
  
  /* 科幻霓虹色 */
  --neon-cyan: #00F5FF;
  --neon-purple: #BF00FF;
  
  /* 路线色 */
  --route-drama: #8B0000;
  --route-action: #191970;
  --route-tech: #006400;
  --route-hidden: #FFD700;
}
```

### 视觉元素

| 元素 | 设计 |
|------|------|
| **场景背景** | sepia老照片质感 + 偶尔glitch条纹 |
| **角色立绘** | 轻微呼吸动画（CSS @keyframes，振幅3px，周期4秒） |
| **对话气泡** | Art Deco几何边框 + 金色装饰角 |
| **选择按钮** | 半透明黑底 + 金色hover边框 + 悬停时轻微放大 |
| **回响涟漪** | 金色SVG圆形扩散动画 |
| **Glitch效果** | CSS clip-path动态切割 + transform: skew() |

### 字体组合

- **标题**：「站酷庆科黄油体」/ 英文：Playfair Display（Art Deco装饰感）
- **正文**：「思源宋体」/ 英文：Noto Serif（可读性）
- **UI**：「方正姚体」/ 英文：Josefin Sans（几何感）

---

## 五、三大解谜游戏

### 解谜1：频率匹配（第二章）

- **UI**：滑块 + 波形显示
- **音频**：Web Audio API实时生成频率，接近7830时音量增大
- **视觉**：波形稳定 vs 紊乱，屏幕glitch效果

### 解谜2：摩尔斯电码（第三章）

- **UI**：「滴」「答」按钮 + 输入序列显示
- **音频**：实时播放摩尔斯音（短音/长音）
- **成功**：触发林若兰救援

### 解谜3：声波拼图（第五章）

- **UI**：拖动碎片拼接波形
- **视觉**：红色（陶启明数据）+ 灰色（碎片）→ 形成反相波
- **成功**：解锁「选择性剥离」方案

---

## 六、子代理分工

| 子代理 | 任务 | 交付物 |
|--------|------|--------|
| **子代理A** | 后端JSP + 数据层 | index.jsp, game.jsp, web.xml, script.json |
| **子代理B** | 核心引擎 | engine.js, scenes.js, echoes.js |
| **子代理C** | 解谜+音频 | puzzles.js, audio.js |
| **子代理D** | UI设计 | main.css, animations.css, components.css, responsive.css |

### 协作接口

1. **script.json** 是核心数据源，所有子代理共用
2. **engine.js** 提供 `showPuzzle(type)` 接口供 puzzles.js 调用
3. **audio.js** 提供 `playFrequency(freq, duration)` 接口供 puzzles.js 调用
4. **ui.js** 提供 `showChoiceButtons(choices)` 接口供 engine.js 调用

---

## 七、部署

### Tomcat部署

```
1. 将 web/ 目录复制到 Tomcat/webapps/seventh-frequency/
2. 启动 Tomcat: C:\Program Files\Java\jsp\JavaEE\apache-tomcat-9.0.41\bin\startup.bat
3. 访问: http://localhost:8080/seventh-frequency/
```

### 纯前端部署（备用）

```
1. index.html 是 index.jsp 的纯前端版本
2. 直接用浏览器打开 index.html 即可运行
3. 所有数据通过 fetch() 从 data/script.json 加载
```

---

*架构文档 v1.0 — 2026年5月2日*
