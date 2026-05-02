/**
 * echoes.js — 《第七频率》回响系统
 * 蝴蝶效应可视化 · 金色涟漪动画 · 选择影响追踪
 */

class EchoSystem {
  constructor(engine) {
    this.engine = engine;
    this.activeEchoes = [];
    this.ripples = [];
    this.butterflies = [];
    this.history = [];

    // 动画常量
    this.RIPPLE_LIFETIME = 2400;
    this.RIPPLE_MAX_RADIUS = 600;
    this.BUTTERFLY_LIFETIME = 4000;
    this.colors = {
      gold: '#D4AF37',
      goldLight: '#F4E4BC',
      goldDark: '#996515',
      cyan: '#00F5FF',
      purple: '#BF00FF'
    };
  }

  /* ========== 外部触发接口 ========== */

  triggerEcho(data) {
    const echo = {
      id: `echo_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      type: data.type || 'ripple',
      message: data.message || '',
      params: data.params || {},
      echoId: data.echoId || null,
      sourceChoice: data.sourceChoice || null,
      timestamp: Date.now(),
      stage: 'birth' // birth -> grow -> fade
    };

    this.history.push(echo);
    this.activeEchoes.push(echo);

    // 根据类型创建视觉效果
    if (echo.type === 'ripple') {
      this._spawnRipple(echo);
    } else if (echo.type === 'butterfly') {
      this._spawnButterfly(echo);
    }

    console.log('[EchoSystem] Echo triggered:', echo.message);
    return echo;
  }

  /* ========== 涟漪效果 ========== */

  _spawnRipple(echo) {
    const cx = this.engine.canvasWidth / 2;
    const cy = this.engine.canvasHeight / 2;

    // 多层涟漪
    for (let i = 0; i < 3; i++) {
      this.ripples.push({
        x: cx + (Math.random() - 0.5) * 100,
        y: cy + (Math.random() - 0.5) * 100,
        radius: 0,
        maxRadius: this.RIPPLE_MAX_RADIUS * (0.6 + Math.random() * 0.4),
        width: 3 + i,
        alpha: 1,
        birthDelay: i * 300,
        bornAt: performance.now() + i * 300,
        speed: 0.15 + Math.random() * 0.1,
        echoId: echo.id
      });
    }
  }

  updateRipples(dt) {
    const now = performance.now();
    this.ripples = this.ripples.filter(r => {
      if (now < r.bornAt) return true;
      const age = now - r.bornAt;
      const progress = Math.min(age / this.RIPPLE_LIFETIME, 1);

      r.radius += r.speed * dt;
      r.alpha = 1 - Math.pow(progress, 2);

      return progress < 1;
    });
  }

  renderRipples(ctx) {
    const now = performance.now();
    this.ripples.forEach(r => {
      if (now < r.bornAt) return;
      ctx.save();
      ctx.strokeStyle = `rgba(212, 175, 55, ${r.alpha * 0.7})`;
      ctx.lineWidth = r.width;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      ctx.stroke();

      // 内环发光
      if (r.radius > 30) {
        ctx.strokeStyle = `rgba(244, 228, 188, ${r.alpha * 0.3})`;
        ctx.lineWidth = r.width * 2;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius - 15, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    });
  }

  /* ========== 蝴蝶效果 ========== */

  _spawnButterfly(echo) {
    const startX = this.engine.canvasWidth / 2;
    const startY = this.engine.canvasHeight / 2;

    for (let i = 0; i < 5; i++) {
      const angle = (Math.PI * 2 / 5) * i + Math.random() * 0.5;
      this.butterflies.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * (0.3 + Math.random() * 0.4),
        vy: Math.sin(angle) * (0.3 + Math.random() * 0.4),
        size: 12 + Math.random() * 8,
        wingPhase: Math.random() * Math.PI * 2,
        wingSpeed: 0.008 + Math.random() * 0.004,
        bornAt: performance.now(),
        lifetime: this.BUTTERFLY_LIFETIME + Math.random() * 2000,
        echoId: echo.id,
        color: i % 2 === 0 ? this.colors.gold : this.colors.cyan,
        trail: []
      });
    }
  }

  updateButterflies(dt) {
    const now = performance.now();
    this.butterflies = this.butterflies.filter(b => {
      const age = now - b.bornAt;
      const progress = age / b.lifetime;
      if (progress >= 1) return false;

      // 蝴蝶运动：正弦波动 + 随机扰动
      b.wingPhase += b.wingSpeed * dt;
      b.x += b.vx * dt + Math.sin(b.wingPhase * 2) * 0.5;
      b.y += b.vy * dt + Math.cos(b.wingPhase * 1.5) * 0.3;
      b.vx += (Math.random() - 0.5) * 0.02;
      b.vy += (Math.random() - 0.5) * 0.02;

      // 速度衰减
      b.vx *= 0.998;
      b.vy *= 0.998;

      // 轨迹
      b.trail.push({ x: b.x, y: b.y, alpha: 1 - progress });
      if (b.trail.length > 40) b.trail.shift();

      return true;
    });
  }

  renderButterflies(ctx) {
    const now = performance.now();
    this.butterflies.forEach(b => {
      const age = now - b.bornAt;
      const progress = age / b.lifetime;
      const alpha = 1 - Math.pow(progress, 3);
      const wingFlap = Math.sin(b.wingPhase);

      ctx.save();
      ctx.globalAlpha = alpha;

      // 轨迹
      if (b.trail.length > 1) {
        ctx.beginPath();
        ctx.moveTo(b.trail[0].x, b.trail[0].y);
        for (let i = 1; i < b.trail.length; i++) {
          ctx.lineTo(b.trail[i].x, b.trail[i].y);
        }
        ctx.strokeStyle = b.color;
        ctx.lineWidth = 1;
        ctx.globalAlpha = alpha * 0.3;
        ctx.stroke();
      }

      // 蝴蝶本体
      ctx.translate(b.x, b.y);
      ctx.fillStyle = b.color;

      // 左翼
      ctx.save();
      ctx.scale(Math.abs(wingFlap), 1);
      ctx.beginPath();
      ctx.ellipse(-b.size * 0.4, 0, b.size * 0.5, b.size * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 右翼
      ctx.save();
      ctx.scale(Math.abs(wingFlap), 1);
      ctx.beginPath();
      ctx.ellipse(b.size * 0.4, 0, b.size * 0.5, b.size * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 身体
      ctx.fillStyle = this.colors.goldDark;
      ctx.beginPath();
      ctx.ellipse(0, 0, b.size * 0.12, b.size * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });
  }

  /* ========== 主循环接口 ========== */

  update(dt) {
    this.updateRipples(dt);
    this.updateButterflies(dt);

    // 清理过期回响
    const now = Date.now();
    this.activeEchoes = this.activeEchoes.filter(e => {
      const age = now - e.timestamp;
      return age < 10000; // 10秒后移出 active
    });
  }

  render(ctx) {
    // 在场景之上、UI 之下渲染
    this.renderRipples(ctx);
    this.renderButterflies(ctx);
  }

  /* ========== 回响面板数据 ========== */

  getHistory() {
    return this.history.map(h => ({
      id: h.id,
      type: h.type,
      message: h.message,
      time: new Date(h.timestamp).toLocaleString('zh-CN'),
      echoId: h.echoId
    }));
  }

  getActiveEchoes() {
    return this.activeEchoes;
  }

  clear() {
    this.activeEchoes = [];
    this.ripples = [];
    this.butterflies = [];
  }

  /* ========== 统计 ========== */

  getStats() {
    const total = this.history.length;
    const ripples = this.history.filter(h => h.type === 'ripple').length;
    const butterflies = this.history.filter(h => h.type === 'butterfly').length;
    return { total, ripples, butterflies };
  }
}

// 暴露全局
window.EchoSystem = EchoSystem;
