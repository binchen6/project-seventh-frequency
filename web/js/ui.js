/**
 * ui.js — 《第七频率》UI交互控制器
 * 存档/读档 · 历史记录 · 自动播放 · 设置面板
 */

class UIController {
  constructor(engine) {
    this.engine = engine;
    this.visible = false;
    this.currentPanel = null;

    // DOM 容器
    this.container = null;
    this.overlay = null;
    this.panels = {};

    // 自动播放
    this.autoPlay = false;
    this.autoDelay = 2500;
    this.autoTimer = null;

    // 设置
    this.settings = {
      bgmVolume: 0.7,
      sfxVolume: 0.8,
      textSpeed: 50,
      fontSize: 'normal',
      autoDelay: 2500,
      fullscreen: false
    };

    // BGM
    this.currentBGM = null;
    this.bgmAudio = null;

    this._buildDOM();
    this._bindEvents();
    this._loadSettings();
  }

  /* ========== DOM 构建 ========== */

  _buildDOM() {
    this.container = document.createElement('div');
    this.container.id = 'seventh-ui-container';
    this.container.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      pointer-events: none; z-index: 100; font-family: "MiSans","Microsoft YaHei","PingFang SC",sans-serif;
    `;

    // 遮罩层
    this.overlay = document.createElement('div');
    this.overlay.style.cssText = `
      position: absolute; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.6); opacity: 0; transition: opacity 0.3s;
      pointer-events: none;
    `;
    this.container.appendChild(this.overlay);

    // 底部控制栏
    this._buildControlBar();

    // 面板
    this._buildSavePanel();
    this._buildLoadPanel();
    this._buildHistoryPanel();
    this._buildSettingsPanel();

    document.body.appendChild(this.container);
  }

  _buildControlBar() {
    const bar = document.createElement('div');
    bar.id = 'seventh-control-bar';
    bar.style.cssText = `
      position: absolute; bottom: 0; left: 0; width: 100%; height: 48px;
      display: flex; justify-content: center; align-items: center; gap: 12px;
      background: rgba(10,8,6,0.85); border-top: 1px solid #D4AF37;
      pointer-events: auto; transition: transform 0.3s;
    `;

    const buttons = [
      { id: 'btn-save', text: '存档', icon: '💾', action: () => this.showPanel('save') },
      { id: 'btn-load', text: '读档', icon: '📂', action: () => this.showPanel('load') },
      { id: 'btn-history', text: '历史', icon: '📜', action: () => this.showPanel('history') },
      { id: 'btn-auto', text: '自动', icon: '▶', action: () => this.toggleAutoPlay() },
      { id: 'btn-settings', text: '设置', icon: '⚙', action: () => this.showPanel('settings') }
    ];

    buttons.forEach(b => {
      const btn = document.createElement('button');
      btn.id = b.id;
      btn.innerHTML = `${b.icon}<span style="margin-left:4px">${b.text}</span>`;
      btn.style.cssText = `
        background: transparent; color: #E8DCC8; border: 1px solid rgba(212,175,55,0.4);
        padding: 4px 14px; border-radius: 2px; cursor: pointer;
        font-family: inherit; font-size: 14px; transition: all 0.2s;
        display: flex; align-items: center;
      `;
      btn.addEventListener('mouseenter', () => {
        btn.style.borderColor = '#D4AF37';
        btn.style.background = 'rgba(212,175,55,0.1)';
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.borderColor = 'rgba(212,175,55,0.4)';
        btn.style.background = 'transparent';
      });
      btn.addEventListener('click', b.action);
      bar.appendChild(btn);
    });

    this.container.appendChild(bar);
    this.controlBar = bar;
  }

  _buildPanelBase(id, title) {
    const panel = document.createElement('div');
    panel.id = `panel-${id}`;
    panel.style.cssText = `
      position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) scale(0.95);
      width: 720px; max-width: 90vw; max-height: 80vh;
      background: rgba(16, 12, 8, 0.96); border: 2px solid #D4AF37;
      border-radius: 4px; padding: 24px; display: none;
      flex-direction: column; pointer-events: auto;
      opacity: 0; transition: all 0.3s; overflow: hidden;
      box-shadow: 0 0 40px rgba(212,175,55,0.15);
    `;

    // 标题栏
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex; justify-content: space-between; align-items: center;
      border-bottom: 1px solid rgba(212,175,55,0.3); padding-bottom: 12px; margin-bottom: 16px;
    `;
    const h2 = document.createElement('h2');
    h2.textContent = title;
    h2.style.cssText = 'margin:0; color:#D4AF37; font-size:20px; font-weight:normal;';
    const close = document.createElement('button');
    close.innerHTML = '✕';
    close.style.cssText = `
      background:none; border:none; color:#E8DCC8; font-size:18px; cursor:pointer;
      width:32px; height:32px; line-height:32px; text-align:center;
    `;
    close.addEventListener('click', () => this.hidePanel());
    close.addEventListener('mouseenter', () => close.style.color = '#D4AF37');
    close.addEventListener('mouseleave', () => close.style.color = '#E8DCC8');
    header.appendChild(h2);
    header.appendChild(close);
    panel.appendChild(header);

    // 内容区
    const body = document.createElement('div');
    body.id = `panel-${id}-body`;
    body.style.cssText = 'flex:1; overflow-y:auto; min-height:200px;';
    panel.appendChild(body);

    this.container.appendChild(panel);
    this.panels[id] = panel;
    return { panel, body };
  }

  _buildSavePanel() {
    const { panel, body } = this._buildPanelBase('save', '存档');
    body.id = 'save-list';
    body.style.cssText += 'display:grid; grid-template-columns: repeat(2, 1fr); gap:12px;';
    this._renderSaveSlots(body, true);
  }

  _buildLoadPanel() {
    const { panel, body } = this._buildPanelBase('load', '读档');
    body.id = 'load-list';
    body.style.cssText += 'display:grid; grid-template-columns: repeat(2, 1fr); gap:12px;';
    this._renderSaveSlots(body, false);
  }

  _renderSaveSlots(container, isSave) {
    container.innerHTML = '';
    const slots = this.engine.getSaveSlots();
    const slotMap = new Map(slots.map(s => [s.slot, s]));

    for (let i = 0; i < 10; i++) {
      const slot = slotMap.get(i);
      const card = document.createElement('div');
      card.style.cssText = `
        border: 1px solid rgba(212,175,55,${slot ? 0.6 : 0.2});
        padding: 12px; border-radius: 2px; cursor: pointer;
        background: ${slot ? 'rgba(212,175,55,0.05)' : 'transparent'};
        transition: all 0.2s; min-height: 80px;
      `;

      if (slot) {
        card.innerHTML = `
          <div style="color:#D4AF37; font-size:14px; margin-bottom:4px;">
            存档 ${i + 1} — ${slot.date || '未知时间'}
          </div>
          <div style="color:#E8DCC8; font-size:12px; opacity:0.8;">
            章节: ${slot.chapter || '?'} | 场景: ${slot.sceneId || '?'}
          </div>
          <div style="color:#8B7355; font-size:11px; margin-top:4px;">
            智力${slot.params?.INTEL || 0} · 戏剧${slot.params?.DRAMA || 0} · 动作${slot.params?.ACTION || 0} · 技术${slot.params?.TECH || 0}
          </div>
        `;
      } else {
        card.innerHTML = `
          <div style="color:#8B7355; font-size:14px; text-align:center; padding-top:20px;">
            存档 ${i + 1} — 空
          </div>
        `;
      }

      card.addEventListener('mouseenter', () => {
        card.style.borderColor = '#D4AF37';
        card.style.background = 'rgba(212,175,55,0.1)';
      });
      card.addEventListener('mouseleave', () => {
        card.style.borderColor = `rgba(212,175,55,${slot ? 0.6 : 0.2})`;
        card.style.background = slot ? 'rgba(212,175,55,0.05)' : 'transparent';
      });
      card.addEventListener('click', () => {
        if (isSave) {
          if (this.engine.save(i)) {
            this._renderSaveSlots(container, true);
            this._showToast('存档成功');
          }
        } else {
          if (slot) {
            this.engine.load(i);
            this.hidePanel();
            this._showToast('读档成功');
          }
        }
      });

      // 右键删除存档
      if (!isSave && slot) {
        card.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          if (confirm(`确定删除存档 ${i + 1} 吗？`)) {
            this.engine.deleteSave(i);
            this._renderSaveSlots(container, false);
            this._showToast('存档已删除');
          }
        });
      }

      container.appendChild(card);
    }
  }

  _buildHistoryPanel() {
    const { panel, body } = this._buildPanelBase('history', '历史记录');
    body.id = 'history-list';
    this._renderHistory(body);
  }

  _renderHistory(container) {
    container.innerHTML = '';
    const history = this.engine.history || [];
    if (history.length === 0) {
      container.innerHTML = '<div style="color:#8B7355; text-align:center; padding:40px;">暂无历史记录</div>';
      return;
    }

    history.forEach((entry, idx) => {
      const row = document.createElement('div');
      row.style.cssText = `
        padding: 10px 0; border-bottom: 1px solid rgba(212,175,55,0.1);
        color: #E8DCC8; font-size: 14px; line-height: 1.6;
      `;
      if (entry.type === 'choice') {
        row.innerHTML = `
          <span style="color:#D4AF37;">[选择]</span>
          <span style="color:#F4E4BC;">${entry.text || entry.choiceId}</span>
          <span style="color:#8B7355; font-size:12px; float:right;">
            ${entry.time ? new Date(entry.time).toLocaleTimeString('zh-CN') : ''}
          </span>
        `;
      } else {
        row.innerHTML = `
          <span style="color:#D4AF37;">${entry.speaker || '旁白'}</span>
          <span style="color:#8B7355;"> — </span>
          <span>${entry.text}</span>
        `;
      }
      container.appendChild(row);
    });
  }

  _buildSettingsPanel() {
    const { panel, body } = this._buildPanelBase('settings', '设置');
    body.style.cssText += 'display:flex; flex-direction:column; gap:16px;';

    const createSlider = (label, min, max, value, onChange) => {
      const wrap = document.createElement('div');
      wrap.style.cssText = 'display:flex; align-items:center; gap:12px;';
      const lbl = document.createElement('label');
      lbl.textContent = label;
      lbl.style.cssText = 'color:#D4AF37; width:80px; font-size:14px;';
      const input = document.createElement('input');
      input.type = 'range';
      input.min = min;
      input.max = max;
      input.value = value;
      input.style.cssText = 'flex:1; accent-color:#D4AF37;';
      const val = document.createElement('span');
      val.textContent = value;
      val.style.cssText = 'color:#E8DCC8; width:40px; text-align:right; font-size:14px;';
      input.addEventListener('input', () => {
        val.textContent = input.value;
        onChange(parseFloat(input.value));
      });
      wrap.appendChild(lbl);
      wrap.appendChild(input);
      wrap.appendChild(val);
      return wrap;
    };

    // BGM 音量
    body.appendChild(createSlider('BGM音量', 0, 100, this.settings.bgmVolume * 100, (v) => {
      this.settings.bgmVolume = v / 100;
      if (this.bgmAudio) this.bgmAudio.volume = this.settings.bgmVolume;
      this._saveSettings();
    }));

    // 音效音量
    body.appendChild(createSlider('音效音量', 0, 100, this.settings.sfxVolume * 100, (v) => {
      this.settings.sfxVolume = v / 100;
      this._saveSettings();
    }));

    // 文字速度
    body.appendChild(createSlider('文字速度', 10, 200, this.settings.textSpeed, (v) => {
      this.settings.textSpeed = v;
      if (this.engine) this.engine.typewriter.speed = v;
      this._saveSettings();
    }));

    // 自动播放延迟
    body.appendChild(createSlider('自动延迟', 500, 5000, this.settings.autoDelay, (v) => {
      this.settings.autoDelay = v;
      this.autoDelay = v;
      this._saveSettings();
    }));

    // 全屏按钮
    const fsWrap = document.createElement('div');
    fsWrap.style.cssText = 'display:flex; align-items:center; gap:12px;';
    const fsLbl = document.createElement('label');
    fsLbl.textContent = '全屏模式';
    fsLbl.style.cssText = 'color:#D4AF37; width:80px; font-size:14px;';
    const fsBtn = document.createElement('button');
    fsBtn.textContent = this.settings.fullscreen ? '退出全屏' : '进入全屏';
    fsBtn.style.cssText = `
      background:rgba(212,175,55,0.1); color:#E8DCC8; border:1px solid #D4AF37;
      padding:6px 16px; cursor:pointer; font-family:inherit; border-radius:2px;
    `;
    fsBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
        this.settings.fullscreen = true;
        fsBtn.textContent = '退出全屏';
      } else {
        document.exitFullscreen();
        this.settings.fullscreen = false;
        fsBtn.textContent = '进入全屏';
      }
      this._saveSettings();
    });
    fsWrap.appendChild(fsLbl);
    fsWrap.appendChild(fsBtn);
    body.appendChild(fsWrap);

    // 重置
    const resetBtn = document.createElement('button');
    resetBtn.textContent = '重置所有设置';
    resetBtn.style.cssText = `
      background:rgba(139,0,0,0.2); color:#E8DCC8; border:1px solid rgba(139,0,0,0.5);
      padding:8px; cursor:pointer; font-family:inherit; border-radius:2px; margin-top:8px;
    `;
    resetBtn.addEventListener('click', () => {
      if (confirm('确定重置所有设置吗？')) {
        localStorage.removeItem('seventh_freq_settings');
        location.reload();
      }
    });
    body.appendChild(resetBtn);
  }

  /* ========== 面板控制 ========== */

  showPanel(name) {
    this.hidePanel();
    this.currentPanel = name;
    this.overlay.style.opacity = '1';
    this.overlay.style.pointerEvents = 'auto';

    const panel = this.panels[name];
    if (panel) {
      panel.style.display = 'flex';
      // 强制回流
      panel.offsetHeight;
      panel.style.opacity = '1';
      panel.style.transform = 'translate(-50%, -50%) scale(1)';
    }

    // 刷新数据
    if (name === 'save') {
      this._renderSaveSlots(document.getElementById('save-list'), true);
    } else if (name === 'load') {
      this._renderSaveSlots(document.getElementById('load-list'), false);
    } else if (name === 'history') {
      this._renderHistory(document.getElementById('history-list'));
    }
  }

  hidePanel() {
    this.overlay.style.opacity = '0';
    this.overlay.style.pointerEvents = 'none';
    Object.values(this.panels).forEach(p => {
      p.style.opacity = '0';
      p.style.transform = 'translate(-50%, -50%) scale(0.95)';
      setTimeout(() => {
        if (p.style.opacity === '0') p.style.display = 'none';
      }, 300);
    });
    this.currentPanel = null;
  }

  /* ========== 自动播放 ========== */

  toggleAutoPlay() {
    this.autoPlay = !this.autoPlay;
    const btn = document.getElementById('btn-auto');
    if (btn) {
      if (this.autoPlay) {
        btn.style.background = 'rgba(212,175,55,0.3)';
        btn.style.borderColor = '#D4AF37';
        btn.innerHTML = '⏸<span style="margin-left:4px">自动中</span>';
        this._startAutoTimer();
      } else {
        btn.style.background = 'transparent';
        btn.style.borderColor = 'rgba(212,175,55,0.4)';
        btn.innerHTML = '▶<span style="margin-left:4px">自动</span>';
        this._stopAutoTimer();
      }
    }
  }

  _startAutoTimer() {
    this._stopAutoTimer();
    const tick = () => {
      if (!this.autoPlay || !this.engine) return;
      if (this.engine.isChoicePending) {
        this._stopAutoTimer();
        return;
      }
      if (this.engine.typewriter.complete) {
        this.engine.advanceDialogue();
      }
      this.autoTimer = setTimeout(tick, this.autoDelay);
    };
    this.autoTimer = setTimeout(tick, this.autoDelay);
  }

  _stopAutoTimer() {
    if (this.autoTimer) {
      clearTimeout(this.autoTimer);
      this.autoTimer = null;
    }
  }

  /* ========== BGM ========== */

  playBGM(src) {
    if (this.bgmAudio) {
      this.bgmAudio.pause();
      this.bgmAudio = null;
    }
    if (!src) return;

    this.currentBGM = src;
    this.bgmAudio = new Audio(src);
    this.bgmAudio.loop = true;
    this.bgmAudio.volume = this.settings.bgmVolume;
    this.bgmAudio.play().catch(() => {
      console.warn('[UI] BGM autoplay blocked');
    });
  }

  stopBGM() {
    if (this.bgmAudio) {
      this.bgmAudio.pause();
      this.bgmAudio = null;
    }
  }

  /* ========== 设置持久化 ========== */

  _saveSettings() {
    try {
      localStorage.setItem('seventh_freq_settings', JSON.stringify(this.settings));
    } catch (e) {
      console.warn('[UI] Failed to save settings:', e);
    }
  }

  _loadSettings() {
    try {
      const raw = localStorage.getItem('seventh_freq_settings');
      if (raw) {
        this.settings = { ...this.settings, ...JSON.parse(raw) };
      }
    } catch (e) {
      console.warn('[UI] Failed to load settings:', e);
    }
  }

  /* ========== 事件绑定 ========== */

  _bindEvents() {
    // 键盘
    document.addEventListener('keydown', (e) => {
      if (this.currentPanel) {
        if (e.key === 'Escape') this.hidePanel();
        return;
      }
      switch (e.key) {
        case ' ': case 'Enter':
          e.preventDefault();
          this.engine?.click();
          break;
        case 'Escape':
          this.showPanel('settings');
          break;
        case 's':
          if (e.ctrlKey) { e.preventDefault(); this.showPanel('save'); }
          break;
        case 'l':
          if (e.ctrlKey) { e.preventDefault(); this.showPanel('load'); }
          break;
        case 'h':
          if (e.ctrlKey) { e.preventDefault(); this.showPanel('history'); }
          break;
        case 'a':
          if (e.ctrlKey) { e.preventDefault(); this.toggleAutoPlay(); }
          break;
      }
    });

    // 点击遮罩关闭面板
    this.overlay.addEventListener('click', () => this.hidePanel());
  }

  /* ========== 工具 ========== */

  _showToast(msg) {
    const toast = document.createElement('div');
    toast.textContent = msg;
    toast.style.cssText = `
      position: fixed; bottom: 64px; left: 50%; transform: translateX(-50%);
      background: rgba(16,12,8,0.9); color: #D4AF37; border: 1px solid #D4AF37;
      padding: 8px 20px; border-radius: 2px; font-size: 14px;
      pointer-events: none; z-index: 200; opacity: 0; transition: opacity 0.3s;
    `;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.style.opacity = '1');
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 1500);
  }

  showControlBar() {
    if (this.controlBar) this.controlBar.style.transform = 'translateY(0)';
  }

  hideControlBar() {
    if (this.controlBar) this.controlBar.style.transform = 'translateY(100%)';
  }

  destroy() {
    this._stopAutoTimer();
    if (this.bgmAudio) this.bgmAudio.pause();
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }
}

// 暴露全局
window.UIController = UIController;
