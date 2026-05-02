# 前言
这是一个用agent编写的视觉小说项目，文本、代码、音乐、插图、调试、功能完善等全由agent辅助完成，人工负责向agent提供思路。
流程：先用kimi code/mimo 2.5+Openclaw，完成剧本和脚本的编写，网页框架的搭建，图片/音频资源的生成通过Minimax api完成，最后使用codex对项目进行debug和完善。
使用openclaw时，让模型将任务拆分成多个子代理来完成，效率会高很多。
不得不说codex更适合用来写项目，缺点就是贵，他会写一个冒烟测试脚本来专门测试，写出的代码基本一次运行成功，但剧本方面还是kimi和mimo更出色。
时间一个下午，花费几十亿token搞定，账单就这么飞过去了😊

# 第七频率

一部以 1931 年上海法租界为舞台的民国科幻悬疑视觉小说。玩家扮演验尸官沈默，从一具“复活”的尸体开始，追查名为“第七频率”的意识实验。

项目是纯前端视觉小说引擎：HTML5 Canvas、Vanilla JavaScript、CSS、LocalStorage 和音频资源即可运行。Tomcat/JSP 入口仍保留，但 GitHub Pages 部署使用静态 HTML 入口。

## 当前内容

- 5 个章节，37 个可游玩场景
- 116 个剧情选择，其中 22 个为条件/特殊选项
- 26 张插图档案，按游玩进度解锁
- 自托管字体、背景音乐、存读档、历史记录、设置面板、音量控制和演出特效
- 正文约 33,000 字，单周目按阅读、选择、插图停顿估算约 2 小时

## 快速开始

需要 Node.js 18 或更高版本。项目没有运行时 npm 依赖。

```bash
npm run prepare:static
npm run serve
```

打开：

```text
http://127.0.0.1:4173/
```

常用命令：

```bash
npm run validate      # 生成静态入口并检查脚本图谱、资源引用和 JS 语法
npm run build:pages   # 构建 GitHub Pages 发布目录 dist/
npm run serve:dist    # 本地预览 dist/
npm run smoke         # Playwright 浏览器烟测，需要本机已安装 Playwright
npm run smoke:dist    # 对 dist/ 发布包做浏览器烟测
```

Windows PowerShell 如果拦截 `npm.ps1`，可使用：

```powershell
npm.cmd run build:pages
```

## GitHub Pages 部署

本项目已包含 GitHub Actions workflow：[.github/workflows/pages.yml](.github/workflows/pages.yml)。

1. 将仓库上传到 GitHub。
2. 在仓库 Settings → Pages 中，Source 选择 GitHub Actions。
3. 推送到 `main` 或 `master` 分支。
4. Actions 会执行 `npm run build:pages`，把干净的 `dist/` 发布到 GitHub Pages。

构建产物只包含静态可访问文件：

```text
dist/
├── index.html
├── jsp/
│   ├── game.html
│   └── gallery.html
├── assets/
├── css/
├── data/
└── js/
```

说明：

- GitHub Pages 使用 `web/jsp/game.html` 和 `web/jsp/gallery.html`。
- Tomcat 仍可使用 `web/jsp/game.jsp` 和 `web/jsp/gallery.jsp`。
- `.nojekyll` 已加入，避免 GitHub Pages/Jekyll 处理静态资源路径。

## Tomcat / IDEA 部署

如果需要按 Java Web 项目部署：

- Web 根目录：`web/`
- 欢迎页：`index.html`
- JSP 入口：`web/jsp/game.jsp`、`web/jsp/gallery.jsp`
- Web 配置：`web/WEB-INF/web.xml`

IDEA 配置参考：[IDEA_DEPLOY_GUIDE.md](IDEA_DEPLOY_GUIDE.md)。

## 项目结构

```text
project-seventh-frequency/
├── .github/workflows/pages.yml      # GitHub Pages 自动部署
├── package.json                     # 本地校验、构建、预览命令
├── README.md
├── screenplay/
│   └── screenplay.md                # 与 web/data/script.json 同步的完整剧本
├── scripts/
│   ├── build-pages.cjs              # 生成 dist/ 静态发布目录
│   ├── prepare-static-pages.cjs     # 从 JSP 生成 GitHub Pages 可用 HTML
│   ├── validate-project.cjs         # 校验剧情图谱、资源和画廊一致性
│   └── smoke-test.cjs               # Playwright 浏览器烟测
└── web/
    ├── index.html                   # 主菜单
    ├── jsp/
    │   ├── game.jsp                 # Tomcat 入口
    │   ├── game.html                # GitHub Pages 入口
    │   ├── gallery.jsp              # Tomcat 画廊入口
    │   └── gallery.html             # GitHub Pages 画廊入口
    ├── data/script.json             # 视觉小说剧情和分支数据
    ├── js/engine.js                 # 当前统一运行时
    ├── css/
    └── assets/
```

## 资源与数据

核心数据在 [web/data/script.json](web/data/script.json)：

- `chapters[].scenes[]`：场景、背景、音乐、对白
- `choices[]`：选择、数值影响、条件、反馈和跳转
- `dialogues[].illustration`：插图解锁触发点
- `echoes[]`：回响演出触发

插图画廊入口在 [web/jsp/gallery.html](web/jsp/gallery.html)，会同时读取：

- `sf_unlocked_illustrations`
- `sf_current_chapter`
- `sf_current_scene`

这些数据都存储在浏览器 LocalStorage 中，不依赖后端服务。

## 发布前检查清单

```bash
npm run build:pages
```

确认输出中包含：

- `ok: true`
- `scenes: 37`
- `choices: 116`
- `illustrations: 26`
- `estimatedReadingMinutes: 120`

然后可上传 GitHub。`dist/`、`out/`、`.idea/`、`web/out/` 已在 `.gitignore` 中排除，不建议提交。

## 技术栈

- HTML5 Canvas
- Vanilla JavaScript
- CSS3
- LocalStorage
- HTMLAudioElement / Web Audio 相关音频控制
- GitHub Actions + GitHub Pages
- 可选：Tomcat/JSP

## 许可

当前仓库未选择开源许可证。上传公开仓库前，如果希望他人可复用代码或素材，请补充 `LICENSE` 并确认字体、音乐、生成图像和其他素材的授权范围。
