/**
 * puzzles.js - 《第七频率》三大解谜游戏系统
 *
 * 解谜1：频率匹配（滑块调7830Hz + 波形反馈）
 * 解谜2：摩尔斯电码（滴答按钮输入SOS）
 * 解谜3：声波拼图（拖动碎片拼反相波）
 *
 * 设计约束：
 * - 解谜UI绝对定位覆盖Canvas（z-index: 100）
 * - 解谜期间暂停剧情
 * - 支持移动端触摸
 */

// ==================== 解谜管理器 ====================

const PuzzleManager = (() => {
  let container = null;
  let currentPuzzle = null;
  let onSuccessCallback = null;
  let onFailCallback = null;

  function init() {
    if (container) return;
    container = document.createElement('div');
    container.id = 'puzzle-container';
    container.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:100;display:none;justify-content:center;align-items:center;background:rgba(10,8,6,0.92);backdrop-filter:blur(4px);';
    document.body.appendChild(container);
    ['touchstart','touchmove','touchend'].forEach(ev => {
      container.addEventListener(ev, e => e.stopPropagation(), { passive: false });
    });
  }

  function showPuzzle(type, onSuccess, onFail) {
    init();
    if (typeof window.engine !== 'undefined' && window.engine.pause) window.engine.pause();
    container.innerHTML = '';
    container.style.display = 'flex';
    onSuccessCallback = onSuccess || (() => {});
    onFailCallback = onFail || (() => {});

    switch (type) {
      case 'frequency': currentPuzzle = new FrequencyMatchPuzzle(container); break;
      case 'morse': currentPuzzle = new MorseCodePuzzle(container); break;
      case 'wave-puzzle': currentPuzzle = new WavePuzzle(container); break;
      default: console.error('[Puzzle] 未知类型:', type); hidePuzzle(); return;
    }
    currentPuzzle.start();
  }

  function hidePuzzle() {
    if (currentPuzzle) { currentPuzzle.destroy(); currentPuzzle = null; }
    if (container) { container.style.display = 'none'; container.innerHTML = ''; }
    if (typeof window.engine !== 'undefined' && window.engine.resume) window.engine.resume();
    onSuccessCallback = null;
    onFailCallback = null;
  }

  function succeed() {
    AudioSystem.playSuccessSound();
    if (onSuccessCallback) onSuccessCallback();
    setTimeout(hidePuzzle, 500);
  }

  function fail() {
    if (onFailCallback) onFailCallback();
    hidePuzzle();
  }

  return { init, showPuzzle, hidePuzzle, succeed, fail };
})();

// ==================== 解谜1：频率匹配 ====================

class FrequencyMatchPuzzle {
  constructor(container) {
    this.container = container;
    this.targetFreq = 7830;
    this.tolerance = 30;
    this.currentFreq = 5000;
    this.minFreq = 2000;
    this.maxFreq = 12000;
    this.isRunning = false;
    this.animFrame = null;
    this.ui = {};
  }

  start() {
    this._buildUI();
    this._bindEvents();
    this.isRunning = true;
    AudioSystem.init();
    AudioSystem.playFrequency(this.currentFreq, 0.2);
    this._startWaveformLoop();
  }

  _buildUI() {
    const w = document.createElement('div');
    w.className = 'puzzle-frequency';
    w.style.cssText = 'width:90%;max-width:600px;padding:24px;background:linear-gradient(135deg,#1a1510,#2a2018);border:2px solid #D4AF37;border-radius:8px;box-shadow:0 0 40px rgba(212,175,55,0.2);font-family:"MiSans","Microsoft YaHei","PingFang SC",sans-serif;color:#E8DCC8;position:relative;';
    w.innerHTML = `
      <div style="text-align:center;margin-bottom:16px;">
        <h2 style="margin:0;font-size:1.5em;color:#D4AF37;letter-spacing:4px;">频率匹配</h2>
        <p style="margin:8px 0 0;font-size:0.85em;opacity:0.7;">调整频率至 <strong style="color:#00F5FF;">7830 Hz</strong></p>
      </div>
      <canvas id="freq-waveform" style="width:100%;height:160px;background:rgba(0,0,0,0.4);border:1px solid rgba(212,175,55,0.3);border-radius:4px;margin-bottom:16px;"></canvas>
      <div style="margin-bottom:16px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:4px;font-size:0.75em;opacity:0.6;">
          <span>${this.minFreq} Hz</span>
          <span id="freq-display" style="font-size:1.2em;color:#00F5FF;font-weight:bold;">${this.currentFreq} Hz</span>
          <span>${this.maxFreq} Hz</span>
        </div>
        <input type="range" id="freq-slider" min="${this.minFreq}" max="${this.maxFreq}" value="${this.currentFreq}"
          style="width:100%;cursor:pointer;accent-color:#D4AF37;">
      </div>
      <div id="freq-feedback" style="text-align:center;margin-bottom:16px;font-size:0.9em;min-height:1.4em;">
        <span style="opacity:0.5;">波形紊乱……</span>
      </div>
      <div style="display:flex;gap:12px;justify-content:center;">
        <button id="freq-confirm" style="padding:10px 32px;background:#D4AF37;color:#1a1510;border:none;border-radius:4px;cursor:pointer;font-weight:bold;">确认频率</button>
        <button id="freq-hint" style="padding:10px 24px;background:transparent;color:#D4AF37;border:1px solid #D4AF37;border-radius:4px;cursor:pointer;">提示</button>
        <button id="freq-close" style="padding:10px 24px;background:transparent;color:#888;border:1px solid #888;border-radius:4px;cursor:pointer;">放弃</button>
      </div>`;
    this.container.appendChild(w);
    this.ui = {
      canvas: document.getElementById('freq-waveform'),
      slider: document.getElementById('freq-slider'),
      display: document.getElementById('freq-display'),
      feedback: document.getElementById('freq-feedback'),
      confirmBtn: document.getElementById('freq-confirm'),
      hintBtn: document.getElementById('freq-hint'),
      closeBtn: document.getElementById('freq-close')
    };
    const dpr = window.devicePixelRatio || 1;
    const c = this.ui.canvas;
    const r = c.getBoundingClientRect();
    c.width = r.width * dpr; c.height = r.height * dpr;
  }

  _bindEvents() {
    this.ui.slider.addEventListener('input', e => {
      this.currentFreq = parseInt(e.target.value);
      this.ui.display.textContent = this.currentFreq + ' Hz';
      AudioSystem.setFrequency(this.currentFreq);
      this._updateFeedback();
    });
    this.ui.slider.addEventListener('touchstart', () => {
      if (AudioSystem.getContext()?.state === 'suspended') AudioSystem.getContext().resume();
    }, { passive: true });

    this.ui.confirmBtn.addEventListener('click', () => {
      const diff = Math.abs(this.currentFreq - this.targetFreq);
      if (diff <= this.tolerance) {
        this.ui.feedback.innerHTML = '<span style="color:#D4AF37;">✦ 频率锁定！信号稳定 ✦</span>';
        AudioSystem.playSuccessSound();
        PuzzleManager.succeed();
      } else {
        this.ui.feedback.innerHTML = `<span style="color:#ff6b6b;">频率偏差 ${diff} Hz，再试试……</span>`;
        AudioSystem.playFailSound();
        this._shakeUI();
      }
    });

    this.ui.hintBtn.addEventListener('click', () => {
      const diff = this.targetFreq - this.currentFreq;
      const hint = diff > 0 ? `需要调高 ${diff} Hz` : `需要调低 ${Math.abs(diff)} Hz`;
      this.ui.feedback.innerHTML = `<span style="color:#D4AF37;">提示：${hint}</span>`;
    });

    this.ui.closeBtn.addEventListener('click', () => {
      AudioSystem.stopFrequency();
      PuzzleManager.fail();
    });

    [this.ui.confirmBtn, this.ui.hintBtn, this.ui.closeBtn].forEach(btn => {
      btn.addEventListener('touchstart', () => { btn.style.transform = 'scale(0.95)'; }, { passive: true });
      btn.addEventListener('touchend', () => { btn.style.transform = 'scale(1)'; }, { passive: true });
    });
  }

  _updateFeedback() {
    const diff = Math.abs(this.currentFreq - this.targetFreq);
    const ratio = Math.max(0, 1 - diff / 2000);
    let text, color;
    if (diff <= this.tolerance) { text = '✦ 波形稳定！信号锁定 ✦'; color = '#D4AF37'; }
    else if (ratio > 0.7) { text = '波形逐渐平稳……'; color = '#66d9a8'; }
    else if (ratio > 0.4) { text = '波形有节奏地波动'; color = '#e8dcc8'; }
    else if (ratio > 0.2) { text = '波形剧烈抖动'; color = '#e8a87c'; }
    else { text = '波形紊乱……'; color = '#ff6b6b'; }
    this.ui.feedback.innerHTML = `<span style="color:${color};transition:color 0.3s;">${text}</span>`;
  }

  _startWaveformLoop() {
    const canvas = this.ui.canvas;
    const ctx2d = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    ctx2d.scale(dpr, dpr);
    const rect = canvas.getBoundingClientRect();
    const W = rect.width, H = rect.height;

    const loop = () => {
      if (!this.isRunning) return;
      const diff = Math.abs(this.currentFreq - this.targetFreq);
      const ratio = Math.max(0, 1 - diff / 2000);
      let waveColor = diff <= this.tolerance ? '#D4AF37' : (ratio > 0.5 ? '#66d9a8' : '#ff6b6b');

      ctx2d.save();
      ctx2d.clearRect(0, 0, W, H);
      ctx2d.strokeStyle = 'rgba(212,175,55,0.1)'; ctx2d.lineWidth = 1;
      for (let x = 0; x < W; x += 40) { ctx2d.beginPath(); ctx2d.moveTo(x,0); ctx2d.lineTo(x,H); ctx2d.stroke(); }
      for (let y = 0; y < H; y += 40) { ctx2d.beginPath(); ctx2d.moveTo(0,y); ctx2d.lineTo(W,y); ctx2d.stroke(); }

      const data = AudioSystem.getTimeDomainData();
      if (data) {
        ctx2d.strokeStyle = waveColor; ctx2d.lineWidth = 2 + ratio * 2; ctx2d.beginPath();
        const sliceWidth = W / data.length; let x = 0;
        const jitter = (1 - ratio) * 5;
        for (let i = 0; i < data.length; i++) {
          const v = (data[i] / 128.0) + (Math.random() - 0.5) * jitter * 0.1;
          const y = (v * H) / 2;
          i === 0 ? ctx2d.moveTo(x, y) : ctx2d.lineTo(x, y);
          x += sliceWidth;
        }
        ctx2d.stroke();

        const targetX = ((this.targetFreq - this.minFreq) / (this.maxFreq - this.minFreq)) * W;
        ctx2d.strokeStyle = 'rgba(0,245,255,0.4)'; ctx2d.setLineDash([5,5]); ctx2d.lineWidth = 1;
        ctx2d.beginPath(); ctx2d.moveTo(targetX,0); ctx2d.lineTo(targetX,H); ctx2d.stroke(); ctx2d.setLineDash([]);

        const currentX = ((this.currentFreq - this.minFreq) / (this.maxFreq - this.minFreq)) * W;
        ctx2d.strokeStyle = waveColor; ctx2d.lineWidth = 1;
        ctx2d.beginPath(); ctx2d.moveTo(currentX, H/2-10); ctx2d.lineTo(currentX-5, H/2-15); ctx2d.lineTo(currentX+5, H/2-15); ctx2d.closePath(); ctx2d.stroke();
      }
      ctx2d.restore();
      this.animFrame = requestAnimationFrame(loop);
    };
    loop();
  }

  _shakeUI() {
    const wrapper = this.container.querySelector('.puzzle-frequency');
    if (!wrapper) return;
    wrapper.style.animation = 'none'; wrapper.offsetHeight;
    wrapper.style.animation = 'shake 0.4s ease-in-out';
  }

  destroy() {
    this.isRunning = false;
    if (this.animFrame) { cancelAnimationFrame(this.animFrame); this.animFrame = null; }
    AudioSystem.stopFrequency();
  }
}

// ==================== 解谜2：摩尔斯电码 ====================

class MorseCodePuzzle {
  constructor(container) {
    this.container = container;
    this.targetSequence = '... --- ...';
    this.userSequence = '';
    this.dotDuration = 0.15;
    this.isRunning = false;
    this.lastInputTime = 0;
    this.charBuffer = '';
    this.ui = {};
  }

  start() {
    this._buildUI();
    this._bindEvents();
    this.isRunning = true;
    AudioSystem.init();
  }

  _buildUI() {
    const w = document.createElement('div');
    w.className = 'puzzle-morse';
    w.style.cssText = 'width:90%;max-width:500px;padding:24px;background:linear-gradient(135deg,#1a1510,#2a2018);border:2px solid #D4AF37;border-radius:8px;box-shadow:0 0 40px rgba(212,175,55,0.2);font-family:"MiSans","Microsoft YaHei","PingFang SC",sans-serif;color:#E8DCC8;position:relative;user-select:none;';
    w.innerHTML = `
      <div style="text-align:center;margin-bottom:16px;">
        <h2 style="margin:0;font-size:1.5em;color:#D4AF37;letter-spacing:4px;">摩尔斯电码</h2>
        <p style="margin:8px 0 0;font-size:0.85em;opacity:0.7;">发送求救信号：<strong style="color:#00F5FF;">SOS</strong></p>
      </div>
      <div style="background:rgba(0,0,0,0.4);border:1px solid rgba(212,175,55,0.3);border-radius:4px;padding:16px;margin-bottom:16px;min-height:60px;">
        <div style="font-size:0.75em;opacity:0.5;margin-bottom:4px;">输入序列：</div>
        <div id="morse-input" style="font-family:'Courier New',monospace;font-size:1.4em;color:#00F5FF;letter-spacing:2px;word-break:break-all;min-height:1.6em;">
          <span style="opacity:0.3;">等待输入...</span>
        </div>
      </div>
      <div id="morse-decode" style="text-align:center;margin-bottom:16px;font-size:1.2em;min-height:1.4em;"><span style="opacity:0.5;">—</span></div>
      <div style="display:flex;gap:16px;justify-content:center;margin-bottom:16px;">
        <button id="morse-dot" style="width:100px;height:100px;border-radius:50%;border:2px solid #D4AF37;background:rgba(212,175,55,0.1);color:#D4AF37;font-size:1.5em;font-weight:bold;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;touch-action:manipulation;">
          <span style="font-size:1.2em;">●</span><span style="font-size:0.6em;opacity:0.7;">滴</span>
        </button>
        <button id="morse-dash" style="width:100px;height:100px;border-radius:50%;border:2px solid #D4AF37;background:rgba(212,175,55,0.1);color:#D4AF37;font-size:1.5em;font-weight:bold;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;touch-action:manipulation;">
          <span style="font-size:1.2em;">▬</span><span style="font-size:0.6em;opacity:0.7;">答</span>
        </button>
      </div>
      <div style="display:flex;gap:8px;justify-content:center;margin-bottom:12px;">
        <button id="morse-play-ref" style="padding:6px 16px;font-size:0.8em;background:#D4AF37;color:#1a1510;border:none;border-radius:4px;cursor:pointer;">播放参考</button>
        <button id="morse-clear" style="padding:6px 16px;font-size:0.8em;background:transparent;color:#D4AF37;border:1px solid #D4AF37;border-radius:4px;cursor:pointer;">清除</button>
      </div>
      <div style="display:flex;gap:12px;justify-content:center;">
        <button id="morse-confirm" style="padding:10px 32px;background:#D4AF37;color:#1a1510;border:none;border-radius:4px;cursor:pointer;font-weight:bold;">发送信号</button>
        <button id="morse-close" style="padding:10px 24px;background:transparent;color:#888;border:1px solid #888;border-radius:4px;cursor:pointer;">放弃</button>
      </div>`;
    this.container.appendChild(w);
    this.ui = {
      input: document.getElementById('morse-input'),
      decode: document.getElementById('morse-decode'),
      dotBtn: document.getElementById('morse-dot'),
      dashBtn: document.getElementById('morse-dash'),
      playRefBtn: document.getElementById('morse-play-ref'),
      clearBtn: document.getElementById('morse-clear'),
      confirmBtn: document.getElementById('morse-confirm'),
      closeBtn: document.getElementById('morse-close')
    };
  }

  _bindEvents() {
    this._bindMorseBtn(this.ui.dotBtn, '.', this.dotDuration);
    this._bindMorseBtn(this.ui.dashBtn, '-', this.dotDuration * 3);

    this.ui.playRefBtn.addEventListener('click', async () => {
      this.ui.playRefBtn.disabled = true; this.ui.playRefBtn.textContent = '播放中...';
      await AudioSystem.playMorseSequence(this.targetSequence, this.dotDuration, 800);
      this.ui.playRefBtn.disabled = false; this.ui.playRefBtn.textContent = '播放参考';
    });

    this.ui.clearBtn.addEventListener('click', () => {
      this.userSequence = ''; this.charBuffer = ''; this._updateDisplay();
    });

    this.ui.confirmBtn.addEventListener('click', () => {
      const normalized = this.userSequence.trim().replace(/\s+/g, ' ');
      if (normalized === this.targetSequence.trim()) {
        this.ui.decode.innerHTML = '<span style="color:#D4AF37;">✦ 求救信号已发出！ ✦</span>';
        AudioSystem.playSuccessSound();
        PuzzleManager.succeed();
      } else {
        this.ui.decode.innerHTML = '<span style="color:#ff6b6b;">信号不匹配，请重试</span>';
        AudioSystem.playFailSound();
        this._shakeUI();
      }
    });

    this.ui.closeBtn.addEventListener('click', () => PuzzleManager.fail());
  }

  _bindMorseBtn(btn, symbol, duration) {
    const handlePress = () => {
      const now = Date.now();
      if (this.lastInputTime > 0) {
        const gap = (now - this.lastInputTime) / 1000;
        if (gap > this.dotDuration * 3 && this.charBuffer.length > 0) {
          this.userSequence += (this.userSequence.length > 0 ? ' ' : '') + this.charBuffer;
          this.charBuffer = '';
        } else if (gap > this.dotDuration * 7 && this.userSequence.length > 0) {
          this.userSequence += ' / ';
        }
      }
      this.charBuffer += symbol; this.lastInputTime = now;
      symbol === '.' ? AudioSystem.playDotSound(duration, 800) : AudioSystem.playDashSound(duration, 800);
      this._updateDisplay();
      btn.style.background = 'rgba(212,175,55,0.4)';
      setTimeout(() => { btn.style.background = 'rgba(212,175,55,0.1)'; }, 150);
    };
    btn.addEventListener('mousedown', handlePress);
    btn.addEventListener('touchstart', (e) => { e.preventDefault(); handlePress(); }, { passive: false });
    btn.addEventListener('touchstart', () => { btn.style.transform = 'scale(0.92)'; }, { passive: true });
    btn.addEventListener('touchend', () => { btn.style.transform = 'scale(1)'; }, { passive: true });
  }

  _updateDisplay() {
    const display = this.charBuffer.length > 0
      ? this.userSequence + (this.userSequence.length > 0 ? ' ' : '') + this.charBuffer
      : this.userSequence;
    this.ui.input.innerHTML = display.length === 0 ? '<span style="opacity:0.3;">等待输入...</span>' : display;
    this._decodeMorse(display);
  }

  _decodeMorse(sequence) {
    if (!sequence || sequence.trim().length === 0) {
      this.ui.decode.innerHTML = '<span style="opacity:0.5;">—</span>'; return;
    }
    const words = sequence.split(' / ');
    const decoded = words.map(word => {
      return word.split(' ').map(char => {
        for (const [letter, code] of Object.entries(AudioSystem.MORSE_CODE)) {
          if (code === char) return letter;
        }
        return '?';
      }).join('');
    }).join(' ');
    this.ui.decode.innerHTML = `<span style="opacity:0.8;">解码：${decoded}</span>`;
  }

  _shakeUI() {
    const wrapper = this.container.querySelector('.puzzle-morse');
    if (!wrapper) return;
    wrapper.style.animation = 'none'; wrapper.offsetHeight;
    wrapper.style.animation = 'shake 0.4s ease-in-out';
  }

  destroy() {
    this.isRunning = false;
  }
}

// ==================== 解谜3：声波拼图 ====================

class WavePuzzle {
  constructor(container) {
    this.container = container;
    this.isRunning = false;
    this.pieces = [];
    this.slots = [];
    this.draggedPiece = null;
    this.dragOffset = { x: 0, y: 0 };
    this.isCompleted = false;
    this.gridCols = 4;
    this.gridRows = 3;
    this.pieceWidth = 0;
    this.pieceHeight = 0;
    this.waveColors = { data: '#ff4444', fragment: '#888888', matched: '#D4AF37' };
    this.ui = {};
    this.animFrame = null;
  }

  start() {
    this._buildUI();
    this._initPuzzle();
    this._bindEvents();
    this.isRunning = true;
    this._startRenderLoop();
  }

  _buildUI() {
    const w = document.createElement('div');
    w.className = 'puzzle-wave';
    w.style.cssText = 'width:95%;max-width:700px;padding:20px;background:linear-gradient(135deg,#1a1510,#2a2018);border:2px solid #D4AF37;border-radius:8px;box-shadow:0 0 40px rgba(212,175,55,0.2);font-family:"MiSans","Microsoft YaHei","PingFang SC",sans-serif;color:#E8DCC8;position:relative;user-select:none;touch-action:none;';
    w.innerHTML = `
      <div style="text-align:center;margin-bottom:12px;">
        <h2 style="margin:0;font-size:1.5em;color:#D4AF37;letter-spacing:4px;">声波拼图</h2>
        <p style="margin:6px 0 0;font-size:0.85em;opacity:0.7;">拖动碎片拼接<strong style="color:#ff4444;">反相波形</strong></p>
      </div>
      <div id="wave-board" style="position:relative;width:100%;height:300px;background:rgba(0,0,0,0.5);border:1px solid rgba(212,175,55,0.3);border-radius:4px;margin-bottom:16px;overflow:hidden;"></div>
      <div id="wave-pieces" style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;min-height:80px;padding:8px;background:rgba(0,0,0,0.3);border-radius:4px;margin-bottom:12px;"></div>
      <div style="display:flex;gap:12px;justify-content:center;">
        <button id="wave-confirm" style="padding:10px 32px;background:#D4AF37;color:#1a1510;border:none;border-radius:4px;cursor:pointer;font-weight:bold;">确认拼接</button>
        <button id="wave-reset" style="padding:10px 24px;background:transparent;color:#D4AF37;border:1px solid #D4AF37;border-radius:4px;cursor:pointer;">重置</button>
        <button id="wave-close" style="padding:10px 24px;background:transparent;color:#888;border:1px solid #888;border-radius:4px;cursor:pointer;">放弃</button>
      </div>`;
    this.container.appendChild(w);
    this.ui = {
      board: document.getElementById('wave-board'),
      piecesArea: document.getElementById('wave-pieces'),
      confirmBtn: document.getElementById('wave-confirm'),
      resetBtn: document.getElementById('wave-reset'),
      closeBtn: document.getElementById('wave-close')
    };
  }

  _initPuzzle() {
    const board = this.ui.board;
    const rect = board.getBoundingClientRect();
    const W = rect.width, H = rect.height;
    this.pieceWidth = W / this.gridCols;
    this.pieceHeight = H / this.gridRows;

    // 生成目标波形（反相波：正弦波 + 噪声 + 脉冲）
    const targetWave = this._generateTargetWave();

    // 创建槽位
    this.slots = [];
    for (let r = 0; r < this.gridRows; r++) {
      for (let c = 0; c < this.gridCols; c++) {
        const slot = document.createElement('div');
        slot.style.cssText = `position:absolute;left:${c * this.pieceWidth}px;top:${r * this.pieceHeight}px;width:${this.pieceWidth}px;height:${this.pieceHeight}px;border:1px dashed rgba(212,175,55,0.2);box-sizing:border-box;`;
        slot.dataset.row = r; slot.dataset.col = c;
        board.appendChild(slot);
        this.slots.push({ el: slot, row: r, col: c, filled: false, piece: null });
      }
    }

    // 创建碎片（每个碎片是一段波形）
    this.pieces = [];
    const pieceData = [];
    for (let r = 0; r < this.gridRows; r++) {
      for (let c = 0; c < this.gridCols; c++) {
        const waveSegment = this._extractWaveSegment(targetWave, r, c);
        pieceData.push({ row: r, col: c, wave: waveSegment, placed: false });
      }
    }

    // 打乱碎片
    const shuffled = this._shuffleArray([...pieceData]);

    shuffled.forEach((pd, idx) => {
      const piece = document.createElement('canvas');
      piece.width = this.pieceWidth;
      piece.height = this.pieceHeight;
      piece.style.cssText = `width:${this.pieceWidth}px;height:${this.pieceHeight}px;cursor:grab;border:1px solid rgba(212,175,55,0.3);border-radius:2px;background:rgba(0,0,0,0.4);touch-action:none;`;
      piece.dataset.correctRow = pd.row;
      piece.dataset.correctCol = pd.col;
      piece.dataset.placed = 'false';
      this._drawWaveSegment(piece, pd.wave);
      this.ui.piecesArea.appendChild(piece);
      this.pieces.push({ el: piece, data: pd, inSlot: false, slotIdx: -1 });
    });
  }

  _generateTargetWave() {
    const points = [];
    const totalPoints = this.gridCols * 20; // 每列20个采样点
    for (let i = 0; i < totalPoints; i++) {
      const t = i / totalPoints;
      // 反相波：正弦波 + 反向脉冲 + 噪声
      let v = Math.sin(t * Math.PI * 4) * 0.5;
      v += Math.sin(t * Math.PI * 12) * 0.3;
      // 中间段反向
      if (t > 0.3 && t < 0.7) v = -v;
      // 添加脉冲
      if (Math.abs(t - 0.5) < 0.05) v += 0.8;
      points.push(v);
    }
    return points;
  }

  _extractWaveSegment(wave, row, col) {
    const segLen = 20;
    const start = col * segLen;
    return wave.slice(start, start + segLen);
  }

  _shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  _drawWaveSegment(canvas, waveData) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // 背景
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(0, 0, W, H);

    // 绘制波形
    ctx.strokeStyle = '#ff4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const step = W / (waveData.length - 1);
    for (let i = 0; i < waveData.length; i++) {
      const x = i * step;
      const y = H / 2 - waveData[i] * (H * 0.4);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    // 中心线
    ctx.strokeStyle = 'rgba(212,175,55,0.2)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(0, H / 2);
    ctx.lineTo(W, H / 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  _bindEvents() {
    // 鼠标拖拽
    this.ui.piecesArea.addEventListener('mousedown', (e) => this._onDragStart(e, e.clientX, e.clientY));
    document.addEventListener('mousemove', (e) => this._onDragMove(e.clientX, e.clientY));
    document.addEventListener('mouseup', () => this._onDragEnd());

    // 触摸拖拽
    this.ui.piecesArea.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        e.preventDefault();
        this._onDragStart(e, e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: false });
    document.addEventListener('touchmove', (e) => {
      if (this.draggedPiece && e.touches.length === 1) {
        e.preventDefault();
        this._onDragMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: false });
    document.addEventListener('touchend', () => this._onDragEnd());

    // 按钮事件
    this.ui.confirmBtn.addEventListener('click', () => {
      if (this._checkWin()) {
        AudioSystem.playSuccessSound();
        this.isCompleted = true;
        PuzzleManager.succeed();
      } else {
        AudioSystem.playFailSound();
        this._shakeUI();
      }
    });

    this.ui.resetBtn.addEventListener('click', () => this._resetPuzzle());
    this.ui.closeBtn.addEventListener('click', () => PuzzleManager.fail());
  }

  _onDragStart(e, clientX, clientY) {
    const target = e.target.closest('canvas');
    if (!target) return;

    const pieceObj = this.pieces.find(p => p.el === target);
    if (!pieceObj || pieceObj.inSlot) return;

    this.draggedPiece = pieceObj;
    const rect = target.getBoundingClientRect();
    this.dragOffset = { x: clientX - rect.left, y: clientY - rect.top };

    target.style.position = 'fixed';
    target.style.zIndex = '101';
    target.style.cursor = 'grabbing';
    this._movePieceTo(clientX, clientY);
  }

  _onDragMove(clientX, clientY) {
    if (!this.draggedPiece) return;
    this._movePieceTo(clientX, clientY);
  }

  _movePieceTo(clientX, clientY) {
    const p = this.draggedPiece.el;
    p.style.left = (clientX - this.dragOffset.x) + 'px';
    p.style.top = (clientY - this.dragOffset.y) + 'px';
  }

  _onDragEnd() {
    if (!this.draggedPiece) return;

    const pieceObj = this.draggedPiece;
    const piece = pieceObj.el;
    const boardRect = this.ui.board.getBoundingClientRect();
    const pieceRect = piece.getBoundingClientRect();

    // 检查是否在board区域内
    if (pieceRect.left >= boardRect.left && pieceRect.right <= boardRect.right &&
        pieceRect.top >= boardRect.top && pieceRect.bottom <= boardRect.bottom) {

      // 找到最近的槽位
      const centerX = pieceRect.left + pieceRect.width / 2;
      const centerY = pieceRect.top + pieceRect.height / 2;
      let bestSlot = -1;
      let bestDist = Infinity;

      this.slots.forEach((slot, idx) => {
        if (slot.filled && slot.piece !== pieceObj) return;
        const slotRect = slot.el.getBoundingClientRect();
        const slotCX = slotRect.left + slotRect.width / 2;
        const slotCY = slotRect.top + slotRect.height / 2;
        const dist = Math.hypot(centerX - slotCX, centerY - slotCY);
        if (dist < bestDist) {
          bestDist = dist;
          bestSlot = idx;
        }
      });

      if (bestSlot >= 0 && bestDist < this.pieceWidth * 0.6) {
        // 放入槽位
        const slot = this.slots[bestSlot];
        if (slot.filled && slot.piece !== pieceObj) {
          // 槽位已被占用，交换或退回
          this._returnPieceToPool(pieceObj);
        } else {
          // 从原槽位移除
          if (pieceObj.inSlot) {
            this.slots[pieceObj.slotIdx].filled = false;
            this.slots[pieceObj.slotIdx].piece = null;
          }
          // 放入新槽位
          piece.style.position = 'absolute';
          piece.style.left = '0px';
          piece.style.top = '0px';
          piece.style.zIndex = '';
          piece.style.cursor = 'grab';
          slot.el.appendChild(piece);
          slot.filled = true;
          slot.piece = pieceObj;
          pieceObj.inSlot = true;
          pieceObj.slotIdx = bestSlot;

          // 检查是否匹配正确
          const correctRow = parseInt(piece.dataset.correctRow);
          const correctCol = parseInt(piece.dataset.correctCol);
          const slotRow = slot.row;
          const slotCol = slot.col;
          if (correctRow === slotRow && correctCol === slotCol) {
            piece.dataset.placed = 'true';
            piece.style.borderColor = '#D4AF37';
            piece.style.boxShadow = '0 0 10px rgba(212,175,55,0.5)';
          }
        }
      } else {
        this._returnPieceToPool(pieceObj);
      }
    } else {
      this._returnPieceToPool(pieceObj);
    }

    this.draggedPiece = null;
  }

  _returnPieceToPool(pieceObj) {
    const piece = pieceObj.el;
    if (pieceObj.inSlot) {
      const slot = this.slots[pieceObj.slotIdx];
      slot.filled = false;
      slot.piece = null;
      pieceObj.inSlot = false;
      pieceObj.slotIdx = -1;
    }
    piece.style.position = '';
    piece.style.left = '';
    piece.style.top = '';
    piece.style.zIndex = '';
    piece.style.cursor = 'grab';
    piece.style.borderColor = 'rgba(212,175,55,0.3)';
    piece.style.boxShadow = 'none';
    piece.dataset.placed = 'false';
    this.ui.piecesArea.appendChild(piece);
  }

  _resetPuzzle() {
    this.pieces.forEach(p => {
      p.inSlot = false;
      p.slotIdx = -1;
      p.el.dataset.placed = 'false';
      p.el.style.borderColor = 'rgba(212,175,55,0.3)';
      p.el.style.boxShadow = 'none';
      this.ui.piecesArea.appendChild(p.el);
      p.el.style.position = '';
      p.el.style.left = '';
      p.el.style.top = '';
      p.el.style.zIndex = '';
    });
    this.slots.forEach(s => { s.filled = false; s.piece = null; });
    this.isCompleted = false;
  }

  _checkWin() {
    let correctCount = 0;
    this.pieces.forEach(p => {
      if (p.inSlot) {
        const slot = this.slots[p.slotIdx];
        const correctRow = parseInt(p.el.dataset.correctRow);
        const correctCol = parseInt(p.el.dataset.correctCol);
        if (correctRow === slot.row && correctCol === slot.col) correctCount++;
      }
    });
    return correctCount === this.pieces.length;
  }

  _shakeUI() {
    const wrapper = this.container.querySelector('.puzzle-wave');
    if (!wrapper) return;
    wrapper.style.animation = 'none'; wrapper.offsetHeight;
    wrapper.style.animation = 'shake 0.4s ease-in-out';
  }

  _startRenderLoop() {
    const board = this.ui.board;
    const ctx = board.getContext ? board.getContext('2d') : null;

    const loop = () => {
      if (!this.isRunning) return;
      // 持续绘制board背景效果
      if (ctx) {
        const rect = board.getBoundingClientRect();
        board.width = rect.width;
        board.height = rect.height;
        ctx.clearRect(0, 0, board.width, board.height);

        // 绘制网格
        ctx.strokeStyle = 'rgba(212,175,55,0.08)';
        ctx.lineWidth = 1;
        for (let x = 0; x < board.width; x += this.pieceWidth) {
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, board.height); ctx.stroke();
        }
        for (let y = 0; y < board.height; y += this.pieceHeight) {
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(board.width, y); ctx.stroke();
        }
      }
      this.animFrame = requestAnimationFrame(loop);
    };
    loop();
  }

  destroy() {
    this.isRunning = false;
    if (this.animFrame) { cancelAnimationFrame(this.animFrame); this.animFrame = null; }
  }
}

