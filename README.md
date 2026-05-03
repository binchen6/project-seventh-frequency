# 第七频率

> 一部以 1931 年上海法租界为舞台的民国科幻悬疑视觉小说。玩家扮演验尸官沈默，从一具「复活」的尸体开始，追查名为「第七频率」的意识实验。

**在线游玩**：[https://binchen6.github.io/project-seventh-frequency/](https://binchen6.github.io/project-seventh-frequency/)

---

## 内容规格

| 指标 | 数值 |
|------|------|
| 章节 | 5 |
| 场景 | 37 |
| 剧情选择 | 126 |
| 条件/特殊选择 | 28 |
| 插图 | 28（minimax生成为主，含 8 张豆包 AI 生成） |
| 正文字数 | ~38,000 字 |
| 单周目时长 | ~2 小时 |
| 角色 | 12（含立绘） |
| 背景音乐 | 4 首 |

---

## 技术栈

| 层 | 技术 |
|----|------|
| 渲染 | HTML5 Canvas 2D + CSS 层叠 DOM |
| 引擎 | Vanilla JavaScript（单文件 `engine.js`，~1,200 行） |
| 存储 | localStorage（主存储）+ IndexedDB（后台持久化 + 用户元数据） |
| 音频 | HTMLAudioElement |
| 构建 | Node.js 脚本（无打包工具） |
| 测试 | Playwright 浏览器冒烟测试 |
| 部署 | GitHub Actions → GitHub Pages |
| 可选后端 | Tomcat 9 + JSP |

---

## 核心系统

### 1. 视觉小说引擎（`engine.js`）

单文件引擎，功能包括：

- **场景渲染**：Canvas 背景图（`drawBackground`）+ CSS 层叠 UI（对话、选择、角色立绘、插图、HUD）
- **打字机效果**：`typewriter()`，支持快进/自动模式
- **分支选择**：条件过滤（`conditionMet`）、属性影响（`effects`/`affection`）、反馈弹窗（`showChoiceFeedback`）
- **插图系统**：全屏覆盖层，**点击关闭**（`closeIllustration`），自动解锁画廊
- **特效**：Glitch 条纹（`triggerGlitch`）、Echo 涟漪（`showEchoRipple`）、章节转场（`playSpecialTransition`）
- **HUD**：实时信号面板（INTEL/DRAMA/ACTION/TECH/CLUE/ZHOU 六维属性条）
- **存读档**：9 个槽位，存完整游戏状态（章节/场景/对话/属性/好感/标记/历史）
- **设置面板**：BGM 音量、打字速度、字体缩放、自动延迟、静音、减少特效
- **快捷键**：`Ctrl+S` 存档、`Ctrl+L` 读档、`H` 历史、`A` 自动、`K` 快进、`Esc` 返回/关闭模态框

### 2. 多用户存档系统（`storage.js`）

```
StorageManager
├── localStorage（同步主存储）
│   └── sf_{userId}:{key} — 每用户独立命名空间
└── IndexedDB（后台持久化）
    └── users + saves — 300MB 自动清理旧用户
```

**API**（同步兼容 `engine.js` 中 24 处调用）：

```javascript
Storage.get(key, defaultValue)     // 同步读取
Storage.set(key, value)            // 同步写入
Storage.forceSave()                // 同步（已 resolve）
Storage.init()                       // async，3 秒 IndexedDB 超时兜底
Storage.login(userId)              // async，创建/切换用户
Storage.logout()                     // async
Storage.autoLogin()                  // async，读取 sf_last_user
Storage.userExists(userId)           // async
Storage.cleanup()                    // async，清理 300MB+ 旧用户
```

**登录流程**：
1. 首次访问 → 显示「频率档案室」登录界面
2. 输入任意 ID → 自动创建用户空间
3. 再次访问 → 自动登录（或点击「切换频率」退出）
4. URL 参数 `?uid=xxx` → 跳过登录界面（用于书签/测试）

**防御性回退**：若 CDN 缓存导致旧 HTML 加载新 JS（`StorageManager` 未定义），`engine.js` 自动降级为 localStorage 直连对象，游戏仍可运行。

### 3. 剧情数据（`script.json`）

```json
{
  "chapters": [{
    "id": "ch1", "title": "亡者归来",
    "scenes": [{
      "id": "ch1_sc1", "title": "验尸房",
      "bg": "assets/bg/ch1_morgue.png",
      "bgm": "bgm_ambient.mp3",
      "dialogues": [{"text": "...", "speaker": "沈默", "expression": "thinking"}],
      "choices": [{
        "text": "检查死者口腔",
        "effects": {"INTEL": 5, "CLUE": 1},
        "condition": {"params": {"INTEL": {"min": 10}}},
        "feedback": {"title": "线索入档", "body": "你发现了一颗玻璃珠...", "tone": "clue"},
        "nextScene": "ch1_sc2"
      }]
    }]
  }],
  "echoes": [{"chapter": 1, "scene": 2, "condition": {"flag": "found_glass_bead"}, "title": "玻璃珠的低语", "message": "..."}]
}
```

**数据结构**：
- `chapters[].scenes[].dialogues[]`：对白（`text`/`speaker`/`expression`/`illustration`/`illustrationDuration`）
- `choices[]`：选择分支（`text`/`effects`/`affection`/`condition`/`flag`/`feedback`/`nextScene`/`transition`/`special`）
- `echoes[]`：条件触发的回响演出（场景穿透提示）
- **属性系统**：INTEL（推理）、DRAMA（人心）、ACTION（行动）、TECH（技术）、CLUE（线索）、ZHOU（弦外）
- **好感系统**：林若兰、陈子轩、顾老三、小翠、白锦书

### 4. 插图系统

| 来源 | 数量 | 说明 |
|------|------|------|
| 豆包 Seedream 5.0 | 8 张 | AI 生成 PNG，2K 分辨率 |
| Minimax image 1.0 | 20 张 | AI 生成 PNG，1080p 分辨率|
| 总计 | 28 张 | 按游玩进度解锁画廊 |

**交互**：插图显示后 **手动点击关闭**（点击插图层任意位置或关闭按钮），不再自动消失。

---

## 构建与验证

```bash
# 生成静态入口（从 JSP → HTML）
npm run prepare:static

# 校验：JS 语法 + 剧情图谱 + 资源引用 + 画廊一致性
npm run validate

# 构建发布目录 dist/
npm run build:pages

# 本地预览
npm run serve          # 预览 web/（开发）
npm run serve:dist     # 预览 dist/（发布前）

# Playwright 冒烟测试
npm run smoke          # 测试 web/
npm run smoke:dist     # 测试 dist/
```

### 校验清单（`validate-project.cjs`）

- [x] 所有 `nextScene` 引用指向有效场景 ID
- [x] 所有选择包含 `feedback.title` + `feedback.body`
- [x] 无占位符文本残留（`?????` 模式检测）
- [x] 所有引用的资源文件存在（背景、BGM、插图）
- [x] 画廊数量与剧本插图数量一致
- [x] 静态入口文件存在（`index.html`、`game.html`、`gallery.html`）

### Playwright 冒烟测试（`smoke-test.cjs`）

启动本地 HTTP 服务器，用 Playwright 测试：

1. 游戏页加载（无 JS 错误、无 404 资源）
2. 第一章完整流程（对话推进、选择点击、分支跳转）
3. 控制台错误监控
4. 响应式布局检查
5. 性能指标（LCP < 2.5s）
6. 截图留存（`test-artifacts/`）

---

## 部署

### GitHub Pages（推荐）

1. 仓库 Settings → Pages → Source 选择 **GitHub Actions**
2. 推送 `main` 分支
3. `.github/workflows/pages.yml` 自动执行：
   - `npm run build:pages` → 生成 `dist/`
   - `actions/upload-pages-artifact` → 上传 artifact
   - `actions/deploy-pages` → 部署到 GitHub Pages

构建产物（`dist/`）：
```
dist/
├── index.html              # 主菜单
├── jsp/
│   ├── game.html           # 游戏入口
│   └── gallery.html        # 画廊入口
├── assets/
│   ├── audio/              # BGM
│   ├── bg/                 # 场景背景
│   ├── characters/         # 角色立绘
│   ├── fonts/              # 自托管字体
│   └── illustrations/      # 插图（PNG）
├── css/                    # 样式
├── data/
│   └── script.json         # 完整剧本
├── js/
│   ├── engine.js           # 游戏引擎
│   └── storage.js          # 存档系统
└── .nojekyll               # 禁用 Jekyll 处理
```

**缓存策略**：HTML 添加 `Cache-Control: no-cache` meta 标签，JS/CSS 使用 `?v=2` cache-busting。

### Tomcat / IDEA（可选）

- Web 根目录：`web/`
- 欢迎页：`index.html`
- JSP 入口：`web/jsp/game.jsp`、`web/jsp/gallery.jsp`
- 配置参考：[IDEA_DEPLOY_GUIDE.md](IDEA_DEPLOY_GUIDE.md)

---

## 项目结构

```
project-seventh-frequency/
├── .github/workflows/pages.yml       # GitHub Pages 自动部署
├── package.json                       # 构建/校验/测试命令
├── README.md
│
├── screenplay/
│   └── screenplay.md                  # 完整剧本（与 script.json 同步）
│
├── scripts/                           # 构建与校验工具
│   ├── build-pages.cjs               # 生成 dist/ 发布目录
│   ├── prepare-static-pages.cjs        # JSP → HTML 转换
│   ├── validate-project.cjs            # 剧情/资源/语法校验
│   ├── smoke-test.cjs                  # Playwright 浏览器冒烟测试
│   ├── serve-web.cjs                   # 本地 HTTP 服务器
│   ├── optimize-engine-briefs.cjs      # 引擎摘要优化
│   ├── fix-5-story-issues.cjs        # 剧情修复脚本（一次性）
│   ├── add-feedback.cjs                # 批量添加选择反馈
│   ├── add-login-ui.cjs                # 登录界面注入
│   └── check-deploy.cjs                # 部署内容检查
│
├── web/                               # 开发源码（Tomcat 根目录）
│   ├── index.html                      # 主菜单（章节选择、设置、画廊）
│   ├── jsp/
│   │   ├── game.jsp                    # 游戏入口（Tomcat）
│   │   ├── game.html                   # 游戏入口（GitHub Pages，由 prepare-static-pages.cjs 生成）
│   │   ├── gallery.jsp                 # 画廊入口（Tomcat）
│   │   └── gallery.html                # 画廊入口（GitHub Pages）
│   ├── data/script.json                # 剧情数据（5 章 37 场景）
│   ├── js/
│   │   ├── engine.js                   # 游戏引擎（渲染/分支/特效/存读档）
│   │   └── storage.js                  # 多用户存档系统（localStorage + IndexedDB）
│   └── css/
│       ├── style.css                   # 主菜单样式
│       ├── game.css                    # 游戏页样式
│       ├── fonts.css                   # 字体加载
│       └── gallery.css                 # 画廊样式
│
└── assets/                            # 静态资源（构建时同步到 web/assets/）
    ├── audio/                          # BGM（4 首 MP3）
    ├── bg/                             # 场景背景（18 张 PNG）
    ├── characters/                     # 角色立绘（16 张 PNG）
    ├── fonts/                          # 自托管字体（Cinzel、JetBrains Mono、ZCOOL QingKe）
    └── illustrations/                    # 插图（28 张 PNG，8 张 AI 生成）
```

---

## 开发流程

本项目由 AI Agent 辅助完成，人工提供思路与决策：

1. **剧本**：Kimi Code / Mimo 2.5 生成剧情结构和对话
2. **代码**：Codex 编写引擎和构建脚本，一次运行成功率极高
3. **图像**：Doubao Seedream 5.0 生成 8 张关键场景插图（2K 分辨率）
4. **调试**：OpenClaw 多子代理并行处理（效率提升显著）
5. **QA**：Playwright 冒烟测试自动发现 4 个 UI bug（选择溢出、模态框无遮罩、弹窗恢复、打字机阻塞）

---

## 许可

当前仓库未选择开源许可证。上传公开仓库前，如需他人复用代码或素材，请补充 `LICENSE` 并确认字体、音乐、生成图像等素材的授权范围。
