const fs = require('fs');

let jsp = fs.readFileSync('web/jsp/game.jsp', 'utf-8');

// 1. Add storage.js before engine.js
if (!jsp.includes('storage.js')) {
  jsp = jsp.replace(
    '<script src="../js/engine.js"></script>',
    '<script src="../js/storage.js"></script>\n<script src="../js/engine.js"></script>'
  );
  console.log('1. Added storage.js');
}

// 2. Add login screen after <body>
if (!jsp.includes('loginScreen')) {
  const loginHTML = [
    '',
    '<!-- Login Screen -->',
    '<div id="loginScreen" style="display:none">',
    '  <div class="login-card">',
    '    <div class="login-subtitle">第 七 频 率</div>',
    '    <h1 class="login-title">频率档案室</h1>',
    '    <p class="login-desc">输入你的频率ID，同步你的案卷记录。<br>新频率将自动创建。</p>',
    '    <input type="text" id="loginUserId" class="login-input" placeholder="频率ID（任意字母/数字组合）" maxlength="32" autocomplete="off">',
    '    <button id="loginBtn" class="login-btn">进入档案室</button>',
    '    <div id="loginStatus" class="login-status"></div>',
    '  </div>',
    '</div>',
    ''
  ].join('\n');
  jsp = jsp.replace('<body>\n', '<body>\n' + loginHTML);
  console.log('2. Added login screen');
}

// 3. Add logout button in settings modal (after applySettings button)
if (!jsp.includes('btnLogout')) {
  const logoutBtn = '\n<button class="ctrl-btn" id="btnLogout" style="margin-top:12px;opacity:.55;font-size:.78rem">🔄 切换频率</button>';
  jsp = jsp.replace(
    '<button class="ctrl-btn" id="applySettings">完成</button>',
    '<button class="ctrl-btn" id="applySettings">完成</button>' + logoutBtn
  );
  console.log('3. Added logout button');
}

fs.writeFileSync('web/jsp/game.jsp', jsp, 'utf-8');

// Regenerate game.html (strip JSP directive)
let html = jsp.replace(/^<%@[\s\S]*?%>\s*/, '');
fs.writeFileSync('web/jsp/game.html', html, 'utf-8');

// Verify
console.log('\nVerify:');
console.log('  loginScreen:', html.includes('loginScreen'));
console.log('  storage.js:', html.includes('storage.js'));
console.log('  btnLogout:', html.includes('btnLogout'));
