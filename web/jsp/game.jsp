<%@ page contentType="text/html; charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>第七频率 — 游戏</title>
<link rel="stylesheet" href="../css/fonts.css">
<link rel="stylesheet" href="../css/game.css">
</head>
<body>

<!-- Login Screen -->
<div id="loginScreen" style="display:none">
  <div class="login-card">
    <div class="login-subtitle">第 七 频 率</div>
    <h1 class="login-title">频率档案室</h1>
    <p class="login-desc">输入你的频率ID，同步你的案卷记录。<br>新频率将自动创建。</p>
    <input type="text" id="loginUserId" class="login-input" placeholder="频率ID（任意字母/数字组合）" maxlength="32" autocomplete="off">
    <button id="loginBtn" class="login-btn">进入档案室</button>
    <div id="loginStatus" class="login-status"></div>
  </div>
</div>
<div id="gameContainer">
<div id="canvasLayer">
<canvas id="gameCanvas"></canvas>
<div class="scene-loader" id="sceneLoader"><div class="loader-spinner"></div></div>
<div id="transitionOverlay" class="transition-overlay">
<div class="transition-text" id="transitionText"></div>
<div class="transition-line"></div>
</div>
<div id="glitchOverlay"></div>
<div id="characterLayer"></div>
<section class="scene-hud" id="sceneHud" aria-live="polite">
<div class="hud-kicker" id="hudKicker">CASE FILE</div>
<div class="hud-title" id="hudTitle">第七频率</div>
<div class="hud-meta">
<span id="hudTime">1931</span>
<span id="hudLocation">上海</span>
</div>
<div class="hud-objective" id="hudObjective">等待案卷载入</div>
</section>
<aside class="signal-panel" id="signalPanel" aria-label="调查状态">
<div class="signal-head">
<span>7830Hz</span>
<b id="signalStrength">00</b>
</div>
<div class="signal-grid" id="signalGrid"></div>
</aside>
<button class="settings-fab" id="btnSettings" aria-label="设置" title="设置">⚙</button>
<div class="chapter-card" id="chapterCard" aria-live="polite">
<div class="chapter-card-kicker" id="chapterCardKicker">CHAPTER</div>
<div class="chapter-card-title" id="chapterCardTitle"></div>
<div class="chapter-card-line" id="chapterCardLine"></div>
</div>
<div class="story-toast" id="storyToast" aria-live="polite"></div>
<div id="illustrationLayer">
<button class="illustration-close" id="illustClose">×</button>
<img id="illustrationImg" src="" alt="插图">
<div class="illustration-caption" id="illustCaption"></div>
</div>
<div id="historyModal">
<div class="history-title">— 历史记录 —</div>
<div id="historyContent"></div>
<div style="text-align:center;margin-top:16px"><button class="ctrl-btn" id="closeHistory">关闭</button></div>
</div>
<div id="saveLoadModal">
<div class="history-title" id="saveLoadTitle">— 存档 —</div>
<div class="slots-grid" id="slotsGrid"></div>
<div style="text-align:center;margin-top:16px"><button class="ctrl-btn" id="closeSaveLoad">关闭</button></div>
</div>
<div id="settingsModal" class="settings-modal" role="dialog" aria-modal="true" aria-labelledby="settingsTitle">
<div class="settings-panel">
<div class="settings-head">
<div>
<div class="settings-kicker">RECEIVER CONTROL</div>
<div class="settings-title" id="settingsTitle">设置</div>
</div>
<button class="settings-close" id="closeSettings" aria-label="关闭设置">×</button>
</div>
<div class="settings-body">
<label class="setting-row" for="bgmVolume">
<span>
<b>背景音乐</b>
<small>调整 BGM 音量</small>
</span>
<output id="bgmVolumeValue">22%</output>
<input id="bgmVolume" type="range" min="0" max="100" step="1">
</label>
<label class="setting-row" for="typingSpeed">
<span>
<b>文字速度</b>
<small>数值越大，显示越慢</small>
</span>
<output id="typingSpeedValue">40ms</output>
<input id="typingSpeed" type="range" min="8" max="80" step="1">
</label>
<label class="setting-row" for="fontScale">
<span>
<b>对白字号</b>
<small>放大对白文字，超大字号时对白框可滚动</small>
</span>
<output id="fontScaleValue">100%</output>
<input id="fontScale" type="range" min="80" max="260" step="5">
</label>
<label class="setting-row" for="autoDelay">
<span>
<b>自动播放间隔</b>
<small>自动模式下每句停留时间</small>
</span>
<output id="autoDelayValue">2.0s</output>
<input id="autoDelay" type="range" min="800" max="5000" step="100">
</label>
<label class="setting-toggle" for="muteBgm">
<span>
<b>静音 BGM</b>
<small>保留音量设置，只临时关闭音乐</small>
</span>
<input id="muteBgm" type="checkbox">
</label>
<label class="setting-toggle" for="reduceEffects">
<span>
<b>降低干扰动效</b>
<small>减少故障线条和角色呼吸动画</small>
</span>
<input id="reduceEffects" type="checkbox">
</label>
</div>
<div class="settings-actions">
<button class="ctrl-btn" id="resetSettings">恢复默认</button>
<button class="ctrl-btn" id="applySettings">完成</button>
<button class="ctrl-btn" id="btnLogout" style="margin-top:12px;opacity:.55;font-size:.78rem">🔄 切换频率</button>
</div>
</div>
</div>
<div class="chapter-end" id="chapterEnd">
<div class="chapter-end-title" id="chapterEndTitle">章节完成</div>
<div class="chapter-end-sub">您的选择将影响后续剧情</div>
<button class="ctrl-btn" id="nextChapterBtn" style="font-size:1rem;padding:12px 32px">继续</button>
</div>
</div>
<div id="choicesLayer"></div>
<div id="dialogueLayer">
<div class="dialogue-box" id="dialogueBox">
<div class="speaker-name" id="speakerName"></div>
<div class="dialogue-text" id="dialogueText"></div>
<div class="next-indicator" id="nextIndicator">▼ 点击继续</div>
</div>
</div>
<div id="controlBar" role="toolbar" aria-label="游戏控制">
<button class="ctrl-btn" id="btnSave" title="存档 Ctrl+S" aria-label="存档"><span class="ctrl-icon">▣</span><span class="ctrl-label">存档</span><span class="ctrl-key">Ctrl+S</span></button>
<button class="ctrl-btn" id="btnLoad" title="读档 Ctrl+L" aria-label="读档"><span class="ctrl-icon">▤</span><span class="ctrl-label">读档</span><span class="ctrl-key">Ctrl+L</span></button>
<button class="ctrl-btn" id="btnHistory" title="历史 H" aria-label="历史"><span class="ctrl-icon">≡</span><span class="ctrl-label">历史</span><span class="ctrl-key">H</span></button>
<button class="ctrl-btn mode-btn" id="btnAuto" title="自动 A" aria-label="自动" aria-pressed="false"><span class="ctrl-icon">▶</span><span class="ctrl-label">自动</span><span class="ctrl-key">A</span></button>
<button class="ctrl-btn mode-btn" id="btnSkip" title="快进 K" aria-label="快进" aria-pressed="false"><span class="ctrl-icon">»</span><span class="ctrl-label">快进</span><span class="ctrl-key">K</span></button>
<button class="ctrl-btn danger-btn" id="btnBack" title="返回主菜单 Esc" aria-label="返回主菜单"><span class="ctrl-icon">↩</span><span class="ctrl-label">返回</span><span class="ctrl-key">Esc</span></button>
</div>
</div>
<script src="../js/storage.js"></script>
  <script src="../js/engine.js"></script>
</body>
</html>
