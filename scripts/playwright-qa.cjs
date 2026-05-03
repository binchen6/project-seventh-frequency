/**
 * 《第七频率》全面 Playwright Debug & QA 脚本
 * 测试静态版 (index.html + jsp/game.html) 和 JSP 版 (game.jsp)
 * 
 * 检查项：
 * 1. 页面加载与渲染
 * 2. Console 错误与警告
 * 3. 404 资源请求
 * 4. 游戏流程（对话推进、选择交互）
 * 5. 响应式布局
 * 6. 性能指标
 * 7. 截图对比
 */

const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// ============ 配置 ============
const PROJECT_ROOT = path.resolve(__dirname, '../web');
const REPORT_DIR = path.resolve(__dirname, '../qa-report');
const SCREENSHOT_DIR = path.join(REPORT_DIR, 'screenshots');
const PORT = 18796;
const BASE_URL = `http://localhost:${PORT}`;

// 确保目录存在
[REPORT_DIR, SCREENSHOT_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// 收集所有问题
const issues = [];
const consoleLogs = [];
const networkErrors = [];

function logIssue(severity, category, message, details = '') {
  issues.push({ severity, category, message, details, timestamp: new Date().toISOString() });
  const icon = severity === 'error' ? '❌' : severity === 'warning' ? '⚠️' : 'ℹ️';
  console.log(`  ${icon} [${category}] ${message}${details ? ' | ' + details : ''}`);
}

// ============ 简易 HTTP 服务器 ============
function startServer() {
  const mimeTypes = {
    '.html': 'text/html',
    '.htm': 'text/html',
    '.jsp': 'text/html',  // JSP 作为纯文本返回（用于测试）
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.mp3': 'audio/mpeg',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.ico': 'image/x-icon'
  };

  const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    let pathname = decodeURIComponent(parsedUrl.pathname);
    if (pathname === '/') pathname = '/index.html';
    
    const filePath = path.join(PROJECT_ROOT, pathname);
    const ext = path.extname(filePath).toLowerCase();
    
    // 安全检查：防止目录遍历
    if (!filePath.startsWith(PROJECT_ROOT)) {
      res.writeHead(403); res.end('Forbidden'); return;
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        if (err.code === 'ENOENT') {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end(`Not Found: ${pathname}`);
        } else {
          res.writeHead(500); res.end('Server Error');
        }
        return;
      }
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
      res.end(data);
    });
  });

  return new Promise((resolve) => {
    server.listen(PORT, () => {
      console.log(`🌐 本地服务器启动: ${BASE_URL}`);
      resolve(server);
    });
  });
}

// ============ Playwright 测试 ============
async function runTests() {
  console.log('\n🔧 启动 Playwright Chromium...');
  const browser = await chromium.launch({ headless: true });
  
  // ========== 测试 1: 首页 index.html ==========
  console.log('\n📄 测试 1: 首页 (index.html)');
  const page1 = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  
  // 监听 console
  page1.on('console', msg => {
    const text = msg.text();
    const type = msg.type();
    consoleLogs.push({ page: 'index', type, text });
    if (type === 'error') logIssue('error', 'Console', `首页 JS 错误`, text);
    else if (type === 'warning') logIssue('warning', 'Console', `首页警告`, text);
  });
  
  // 监听网络请求
  page1.on('response', response => {
    const status = response.status();
    const reqUrl = response.url();
    if (status >= 400) {
      networkErrors.push({ page: 'index', url: reqUrl, status });
      logIssue('error', 'Network', `资源加载失败 [${status}]`, reqUrl.replace(BASE_URL, ''));
    }
  });

  await page1.goto(`${BASE_URL}/`, { waitUntil: 'networkidle', timeout: 30000 });
  await page1.waitForTimeout(2000);  // 等待动画
  
  // 检查关键元素
  const titleExists = await page1.locator('h1.main-title').isVisible().catch(() => false);
  if (!titleExists) logIssue('error', 'UI', '首页标题未显示');
  
  const chaptersGrid = await page1.locator('#chaptersGrid').isVisible().catch(() => false);
  if (!chaptersGrid) logIssue('error', 'UI', '章节网格未显示');
  
  // 检查章节卡片数量
  const chapterCards = await page1.locator('.chapter-card').count();
  if (chapterCards !== 5) logIssue('warning', 'UI', `章节卡片数量异常: ${chapterCards} (期望 5)`);
  
  // 检查第一个章节是否解锁
  const firstCardLocked = await page1.locator('.chapter-card').first().evaluate(el => el.classList.contains('locked')).catch(() => false);
  if (firstCardLocked) logIssue('warning', 'UI', '第一章节被锁定（首次访问不应锁定）');
  
  await page1.screenshot({ path: path.join(SCREENSHOT_DIR, '01_index_desktop.png'), fullPage: false });
  
  // 响应式测试 - 手机
  await page1.setViewportSize({ width: 375, height: 812 });
  await page1.reload({ waitUntil: 'networkidle' });
  await page1.waitForTimeout(1500);
  await page1.screenshot({ path: path.join(SCREENSHOT_DIR, '02_index_mobile.png'), fullPage: false });
  
  // 检查手机布局
  const mobileGrid = await page1.locator('.chapters-grid').evaluate(el => {
    const style = window.getComputedStyle(el);
    return style.gridTemplateColumns;
  });
  console.log(`  📱 手机布局: grid-template-columns = ${mobileGrid}`);
  
  await page1.close();

  // ========== 测试 2: 游戏页 game.html (静态版) ==========
  console.log('\n🎮 测试 2: 游戏页 (jsp/game.html?chapter=1)');
  const page2 = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  
  page2.on('console', msg => {
    const text = msg.text();
    const type = msg.type();
    consoleLogs.push({ page: 'game', type, text });
    if (type === 'error') logIssue('error', 'Console', `游戏页 JS 错误`, text);
    else if (type === 'warning') logIssue('warning', 'Console', `游戏页警告`, text);
  });
  
  page2.on('response', response => {
    const status = response.status();
    const reqUrl = response.url();
    if (status >= 400) {
      networkErrors.push({ page: 'game', url: reqUrl, status });
      logIssue('error', 'Network', `资源加载失败 [${status}]`, reqUrl.replace(BASE_URL, ''));
    }
  });

  await page2.goto(`${BASE_URL}/jsp/game.html?chapter=1`, { waitUntil: 'networkidle', timeout: 30000 });
  
  // 等待剧本加载
  await page2.waitForTimeout(3000);
  
  // 检查 Canvas 是否存在
  const canvasExists = await page2.locator('#gameCanvas').isVisible().catch(() => false);
  if (!canvasExists) logIssue('error', 'UI', '游戏 Canvas 未显示');
  
  // 检查加载动画是否消失
  const loaderHidden = await page2.locator('#sceneLoader').evaluate(el => el.classList.contains('hidden')).catch(() => false);
  if (!loaderHidden) logIssue('warning', 'UI', '场景加载动画未消失（可能剧本加载失败）');
  
  // 检查 HUD 元素
  const hudExists = await page2.locator('#sceneHud').isVisible().catch(() => false);
  if (!hudExists) logIssue('error', 'UI', 'HUD 未显示');
  
  // 检查对话层
  const dialogueExists = await page2.locator('#dialogueLayer').isVisible().catch(() => false);
  if (!dialogueExists) logIssue('error', 'UI', '对话层未显示');
  
  await page2.screenshot({ path: path.join(SCREENSHOT_DIR, '03_game_ch1_sc1.png') });
  
  // 测试游戏交互：开启快进模式后快速推进
  console.log('  🖱️ 测试对话推进（启用快进模式）...');
  
  // 先开启快进模式
  await page2.locator('#btnSkip').click();
  await page2.waitForTimeout(300);
  
  const dialogueBox = page2.locator('#dialogueBox');
  
  // 快速点击推进（skipMode 下打字速度 5ms/字符，大幅加快）
  for (let i = 0; i < 12; i++) {
    await dialogueBox.click();
    await page2.waitForTimeout(400);
  }
  
  await page2.screenshot({ path: path.join(SCREENSHOT_DIR, '04_game_after_clicks.png') });
  
  // 检查当前说话人和对话索引
  const speakerText = await page2.locator('#speakerName').textContent().catch(() => '');
  const dialogueText = await page2.locator('#dialogueText').textContent().catch(() => '');
  console.log(`  📝 当前说话人: "${speakerText}" | 对话: "${dialogueText.substring(0, 30)}..."`);
  
  // 继续推进到选择出现（最多再点5次）
  console.log('  🖱️ 继续推进到选择出现...');
  let choiceAppeared = false;
  for (let i = 0; i < 5; i++) {
    await dialogueBox.click();
    await page2.waitForTimeout(400);
    
    const choicesVisible = await page2.locator('#choicesLayer').evaluate(el => el.classList.contains('active')).catch(() => false);
    if (choicesVisible) {
      choiceAppeared = true;
      break;
    }
  }
  
  if (!choiceAppeared) {
    logIssue('error', 'Gameplay', '点击 15 次后选择仍未出现');
  } else {
    console.log('  ✅ 选择已出现');
    
    // 检查选择按钮数量
    const choiceCount = await page2.locator('.choice-btn').count();
    console.log(`  🎯 选择按钮数量: ${choiceCount}`);
    
    if (choiceCount === 0) logIssue('error', 'Gameplay', '选择层激活但无按钮');
    
    await page2.screenshot({ path: path.join(SCREENSHOT_DIR, '05_game_choices.png') });
    
    // 测试点击第一个选择
    const firstChoice = page2.locator('.choice-btn').first();
    const choiceText = await firstChoice.textContent().catch(() => '');
    console.log(`  🖱️ 点击选择: "${choiceText.substring(0, 50)}..."`);
    
    await firstChoice.click();
    await page2.waitForTimeout(2000);
    
    await page2.screenshot({ path: path.join(SCREENSHOT_DIR, '06_game_after_choice.png') });
  }
  
  // 检查信号面板
  const signalPanelExists = await page2.locator('#signalPanel').isVisible().catch(() => false);
  if (!signalPanelExists) logIssue('warning', 'UI', '信号面板未显示');
  
  // 检查存档功能
  await page2.keyboard.down('Control');
  await page2.keyboard.press('s');
  await page2.keyboard.up('Control');
  await page2.waitForTimeout(500);
  
  const saveModalVisible = await page2.locator('#saveLoadModal').evaluate(el => el.classList.contains('active')).catch(() => false);
  if (!saveModalVisible) logIssue('warning', 'UI', 'Ctrl+S 存档快捷键未触发存档界面');
  
  await page2.screenshot({ path: path.join(SCREENSHOT_DIR, '07_game_save_modal.png') });
  
  // 关闭存档界面
  await page2.locator('#closeSaveLoad').click().catch(() => {});
  await page2.waitForTimeout(300);
  
  // 测试设置面板
  await page2.locator('#btnSettings').click();
  await page2.waitForTimeout(500);
  
  const settingsVisible = await page2.locator('#settingsModal').evaluate(el => el.classList.contains('active')).catch(() => false);
  if (!settingsVisible) logIssue('warning', 'UI', '设置按钮未打开设置面板');
  
  await page2.screenshot({ path: path.join(SCREENSHOT_DIR, '08_game_settings.png') });
  
  await page2.close();

  // ========== 测试 3: JSP 版本兼容性 ==========
  console.log('\n📄 测试 3: JSP 版本 (jsp/game.jsp)');
  const page3 = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  
  page3.on('console', msg => {
    const text = msg.text();
    const type = msg.type();
    consoleLogs.push({ page: 'jsp', type, text });
    if (type === 'error') logIssue('error', 'Console', `JSP页 JS 错误`, text);
  });
  
  page3.on('response', response => {
    const status = response.status();
    const reqUrl = response.url();
    if (status >= 400) {
      networkErrors.push({ page: 'jsp', url: reqUrl, status });
      logIssue('error', 'Network', `JSP资源加载失败 [${status}]`, reqUrl.replace(BASE_URL, ''));
    }
  });

  // JSP 文件作为纯 HTML 测试（因为没开 Tomcat）
  await page3.goto(`${BASE_URL}/jsp/game.jsp?chapter=1`, { waitUntil: 'networkidle', timeout: 30000 });
  await page3.waitForTimeout(3000);
  
  // 检查 JSP 指令是否泄漏到页面（如果没有 Tomcat 处理的话）
  const bodyText = await page3.locator('body').textContent().catch(() => '');
  if (bodyText.includes('<%@')) {
    logIssue('warning', 'JSP', 'JSP 指令未处理，页面首行显示 `<%@ page %>`', '需要 Tomcat 环境才能正确渲染');
  }
  
  // 检查 JSP 版是否也能加载游戏
  const jspCanvasExists = await page3.locator('#gameCanvas').isVisible().catch(() => false);
  if (!jspCanvasExists) logIssue('error', 'JSP', 'JSP 版游戏 Canvas 未显示');
  
  await page3.screenshot({ path: path.join(SCREENSHOT_DIR, '09_jsp_game.png') });
  
  await page3.close();

  // ========== 测试 4: 画廊页 ==========
  console.log('\n🖼️ 测试 4: 插图画廊 (jsp/gallery.html)');
  const page4 = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  
  page4.on('console', msg => {
    if (msg.type() === 'error') {
      consoleLogs.push({ page: 'gallery', type: msg.type(), text: msg.text() });
      logIssue('error', 'Console', `画廊 JS 错误`, msg.text());
    }
  });
  
  page4.on('response', response => {
    if (response.status() >= 400) {
      networkErrors.push({ page: 'gallery', url: response.url(), status: response.status() });
      logIssue('error', 'Network', `画廊资源加载失败 [${response.status()}]`, response.url().replace(BASE_URL, ''));
    }
  });

  await page4.goto(`${BASE_URL}/jsp/gallery.html`, { waitUntil: 'networkidle', timeout: 30000 });
  await page4.waitForTimeout(1500);
  
  await page4.screenshot({ path: path.join(SCREENSHOT_DIR, '10_gallery.png') });
  
  await page4.close();

  // ========== 测试 5: 性能测试 ==========
  console.log('\n⚡ 测试 5: 性能指标');
  const page5 = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  
  // 使用 Performance API 获取加载时间
  await page5.goto(`${BASE_URL}/jsp/game.html?chapter=1`, { waitUntil: 'networkidle', timeout: 30000 });
  
  const perfMetrics = await page5.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0];
    return {
      domContentLoaded: nav?.domContentLoadedEventEnd - nav?.startTime,
      loadComplete: nav?.loadEventEnd - nav?.startTime,
      firstPaint: performance.getEntriesByType('paint').find(p => p.name === 'first-paint')?.startTime,
      firstContentfulPaint: performance.getEntriesByType('paint').find(p => p.name === 'first-contentful-paint')?.startTime
    };
  });
  
  console.log(`  ⏱️ DOM Content Loaded: ${perfMetrics.domContentLoaded?.toFixed(0)}ms`);
  console.log(`  ⏱️ Load Complete: ${perfMetrics.loadComplete?.toFixed(0)}ms`);
  console.log(`  ⏱️ First Paint: ${perfMetrics.firstPaint?.toFixed(0)}ms`);
  console.log(`  ⏱️ First Contentful Paint: ${perfMetrics.firstContentfulPaint?.toFixed(0)}ms`);
  
  if (perfMetrics.loadComplete > 5000) logIssue('warning', 'Performance', `页面加载过慢: ${perfMetrics.loadComplete?.toFixed(0)}ms`, '建议优化资源大小或启用缓存');
  
  await page5.close();

  await browser.close();
  
  return { perfMetrics };
}

// ============ 生成报告 ============
function generateReport(perfMetrics) {
  const now = new Date();
  const reportPath = path.join(REPORT_DIR, `qa-report-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}.md`);
  
  const errors = issues.filter(i => i.severity === 'error');
  const warnings = issues.filter(i => i.severity === 'warning');
  const infos = issues.filter(i => i.severity === 'info');
  
  const report = `# 《第七频率》Playwright QA 报告

**测试时间**: ${now.toLocaleString('zh-CN')}
**测试范围**: 静态版 (index.html + game.html) + JSP 版 (game.jsp)
**测试环境**: Chromium (Playwright) + 本地 HTTP 服务器

---

## 📊 摘要

| 指标 | 数值 |
|------|------|
| 严重错误 | ${errors.length} |
| 警告 | ${warnings.length} |
| 信息 | ${infos.length} |
| Console 日志 | ${consoleLogs.length} |
| 网络错误 | ${networkErrors.length} |

---

## ⚡ 性能指标

| 指标 | 数值 |
|------|------|
| DOM Content Loaded | ${perfMetrics.domContentLoaded?.toFixed(0) || 'N/A'} ms |
| Load Complete | ${perfMetrics.loadComplete?.toFixed(0) || 'N/A'} ms |
| First Paint | ${perfMetrics.firstPaint?.toFixed(0) || 'N/A'} ms |
| First Contentful Paint | ${perfMetrics.firstContentfulPaint?.toFixed(0) || 'N/A'} ms |

---

## ❌ 严重错误 (${errors.length})

${errors.length > 0 ? errors.map(e => `- **${e.category}**: ${e.message}${e.details ? ' | ' + e.details : ''}`).join('\n') : '✅ 无严重错误'}

---

## ⚠️ 警告 (${warnings.length})

${warnings.length > 0 ? warnings.map(w => `- **${w.category}**: ${w.message}${w.details ? ' | ' + w.details : ''}`).join('\n') : '✅ 无警告'}

---

## 📝 Console 日志

${consoleLogs.map(l => `- [${l.page}] [${l.type}] ${l.text.substring(0, 200)}${l.text.length > 200 ? '...' : ''}`).join('\n') || '无日志'}

---

## 🌐 网络错误

${networkErrors.map(n => `- [${n.page}] [${n.status}] ${n.url}`).join('\n') || '无网络错误'}

---

## 📸 截图

截图保存在: \`qa-report/screenshots/\`

| 文件名 | 说明 |
|--------|------|
| 01_index_desktop.png | 首页 - 桌面端 |
| 02_index_mobile.png | 首页 - 手机端 |
| 03_game_ch1_sc1.png | 游戏 - 第一章场景1 |
| 04_game_after_clicks.png | 游戏 - 快进推进后 |
| 05_game_choices.png | 游戏 - 选择出现 |
| 06_game_after_choice.png | 游戏 - 选择后 |
| 07_game_save_modal.png | 游戏 - 存档界面 |
| 08_game_settings.png | 游戏 - 设置面板 |
| 09_jsp_game.png | JSP版游戏 |
| 10_gallery.png | 插图画廊 |

---

*报告生成: Playwright QA Script*
`;

  fs.writeFileSync(reportPath, report, 'utf-8');
  console.log(`\n📋 QA 报告已生成: ${reportPath}`);
  return reportPath;
}

// ============ 主程序 ============
async function main() {
  console.log('🎮 《第七频率》Playwright 全面 Debug & QA');
  console.log('=' .repeat(50));
  
  const server = await startServer();
  
  try {
    const { perfMetrics } = await runTests();
    const reportPath = generateReport(perfMetrics);
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ 测试完成!');
    console.log(`📋 报告: ${reportPath}`);
    console.log(`📸 截图: ${SCREENSHOT_DIR}`);
    
    const errors = issues.filter(i => i.severity === 'error');
    const warnings = issues.filter(i => i.severity === 'warning');
    
    if (errors.length === 0 && warnings.length === 0) {
      console.log('🎉 所有测试通过，无问题!');
    } else {
      console.log(`⚠️ 发现问题: ${errors.length} 错误, ${warnings.length} 警告`);
      if (errors.length > 0) {
        console.log('\n需要修复的问题:');
        errors.forEach(e => console.log(`  ❌ ${e.category}: ${e.message}`));
      }
    }
    
  } catch (e) {
    console.error('❌ 测试失败:', e);
    process.exitCode = 1;
  } finally {
    server.close();
    console.log('\n🌐 服务器已关闭');
  }
}

main().catch(console.error);
