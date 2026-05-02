/**
 * audio.js — 《第七频率》Web Audio API 音频系统
 * 
 * 功能：
 * - BGM 播放（基于 AudioBuffer，支持交叉淡入淡出）
 * - 音效播放
 * - 7830Hz 实时生成（OscillatorNode）
 * - 摩尔斯电码播放（实时生成短/长音）
 * - 波形可视化（AnalyserNode → Canvas）
 * 
 * 设计约束：
 * - Web Audio API（非 HTMLAudioElement）
 * - 支持移动端触摸
 * - 自动处理 AudioContext 的 resume 状态
 */

// ========== 全局音频管理器 ==========

const AudioSystem = (() => {
  let ctx = null;
  let masterGain = null;
  let analyser = null;
  let bgmGain = null;
  let sfxGain = null;
  let puzzleGain = null;

  // 正在播放的节点引用
  let currentBgmSource = null;
  let currentOscillator = null;
  let currentBgmBuffer = null;

  // 全局音量
  let masterVolume = 0.7;
  let bgmVolume = 0.5;
  let sfxVolume = 0.8;

  // 频谱可视化数据
  let frequencyData = null;
  let timeDomainData = null;

  // 摩尔斯电码映射
  const MORSE_CODE = {
    'A': '.-',    'B': '-...',  'C': '-.-.',  'D': '-..',
    'E': '.',     'F': '..-.',  'G': '--.',   'H': '....',
    'I': '..',    'J': '.---',  'K': '-.-',   'L': '.-..',
    'M': '--',    'N': '-.',    'O': '---',   'P': '.--.',
    'Q': '--.-',  'R': '.-.',   'S': '...',   'T': '-',
    'U': '..-',   'V': '...-',  'W': '.--',   'X': '-..-',
    'Y': '-.--',  'Z': '--..',
    '0': '-----', '1': '.----', '2': '..---', '3': '...--',
    '4': '....-', '5': '.....', '6': '-....', '7': '--...',
    '8': '---..', '9': '----.',
    ' ': '/'
  };

  // ========== 初始化 ==========

  function init() {
    if (ctx) return ctx;

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      console.warn('[Audio] Web Audio API 不受支持');
      return null;
    }

    ctx = new AudioContextClass();

    // 主增益节点
    masterGain = ctx.createGain();
    masterGain.gain.value = masterVolume;
    masterGain.connect(ctx.destination);

    // 分析器节点（用于波形可视化）
    analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.8;

    // 各子系统的增益节点
    bgmGain = ctx.createGain();
    bgmGain.gain.value = bgmVolume;
    bgmGain.connect(masterGain);

    sfxGain = ctx.createGain();
    sfxGain.gain.value = sfxVolume;
    sfxGain.connect(masterGain);

    puzzleGain = ctx.createGain();
    puzzleGain.gain.value = sfxVolume;
    puzzleGain.connect(masterGain);

    // 分析器不直接接音频链路（用 clone 获取数据）
    // 各子系统按需连接 analyser 的 clone

    // 频率和时间域数据缓存
    const bufferLength = analyser.frequencyBinCount;
    frequencyData = new Uint8Array(bufferLength);
    timeDomainData = new Uint8Array(bufferLength);

    // 移动端：监听用户交互来 resume context
    document.addEventListener('touchstart', _resumeOnInteraction, { once: true });
    document.addEventListener('click', _resumeOnInteraction, { once: true });

    console.log('[Audio] AudioSystem 已初始化');
    return ctx;
  }

  function _resumeOnInteraction() {
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().then(() => {
        console.log('[Audio] AudioContext 已恢复');
      });
    }
  }

  // ========== BGM 播放 ==========

  /**
   * 加载音频文件为 AudioBuffer
   * @param {string} url - 音频文件路径
   * @returns {Promise<AudioBuffer>}
   */
  async function loadAudioBuffer(url) {
    if (!ctx) init();
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      return audioBuffer;
    } catch (err) {
      console.error(`[Audio] 加载音频失败: ${url}`, err);
      return null;
    }
  }

  /**
   * 播放 BGM
   * @param {AudioBuffer|string} bufferOrUrl - AudioBuffer 或 URL
   * @param {boolean} loop - 是否循环
   * @param {number} fadeDuration - 淡入时长（秒）
   */
  async function playBgm(bufferOrUrl, loop = true, fadeDuration = 1.5) {
    if (!ctx) init();

    // 停止当前 BGM
    stopBgm(fadeDuration);

    let buffer;
    if (typeof bufferOrUrl === 'string') {
      buffer = await loadAudioBuffer(bufferOrUrl);
    } else {
      buffer = bufferOrUrl;
    }

    if (!buffer) {
      console.warn('[Audio] 无法播放 BGM：无效的音频数据');
      return;
    }

    currentBgmBuffer = buffer;

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = loop;
    source.connect(bgmGain);
    source.start(0);

    currentBgmSource = source;

    // 淡入
    const now = ctx.currentTime;
    bgmGain.gain.cancelScheduledValues(now);
    bgmGain.gain.setValueAtTime(0, now);
    bgmGain.gain.linearRampToValueAtTime(bgmVolume, now + fadeDuration);

    console.log('[Audio] BGM 开始播放');

    // 清理引用（播放结束时）
    source.onended = () => {
      if (currentBgmSource === source) {
        currentBgmSource = null;
      }
    };
  }

  /**
   * 停止 BGM（可选淡出）
   * @param {number} fadeDuration - 淡出时长（秒）
   */
  function stopBgm(fadeDuration = 1.0) {
    if (!ctx || !currentBgmSource) return;

    const now = ctx.currentTime;
    bgmGain.gain.cancelScheduledValues(now);

    if (fadeDuration > 0) {
      bgmGain.gain.setValueAtTime(bgmGain.gain.value, now);
      bgmGain.gain.linearRampToValueAtTime(0, now + fadeDuration);

      setTimeout(() => {
        if (currentBgmSource) {
          try { currentBgmSource.stop(); } catch (e) {}
          currentBgmSource = null;
        }
      }, fadeDuration * 1000);
    } else {
      try { currentBgmSource.stop(); } catch (e) {}
      currentBgmSource = null;
      bgmGain.gain.setValueAtTime(0, now);
    }
  }

  // ========== 音效播放 ==========

  /**
   * 播放一次性音效
   * @param {AudioBuffer|string} bufferOrUrl - AudioBuffer 或 URL
   * @param {number} volume - 音量（0~1）
   */
  async function playSfx(bufferOrUrl, volume = 1.0) {
    if (!ctx) init();

    let buffer;
    if (typeof bufferOrUrl === 'string') {
      buffer = await loadAudioBuffer(bufferOrUrl);
    } else {
      buffer = bufferOrUrl;
    }

    if (!buffer) return;

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const gain = ctx.createGain();
    gain.gain.value = volume * sfxVolume;

    source.connect(gain);
    gain.connect(sfxGain);
    source.start(0);

    source.onended = () => {
      gain.disconnect();
    };
  }

  // 预置音效（用 OscillatorNode 实时生成）

  /**
   * 播放"滴"声（短促高频音）
   * @param {number} duration - 时长（秒，默认0.08）
   * @param {number} frequency - 频率（默认800Hz）
   */
  function playDotSound(duration = 0.08, frequency = 800) {
    if (!ctx) init();
    _playTone(frequency, duration, puzzleGain);
  }

  /**
   * 播放"答"声（长音）
   * @param {number} duration - 时长（秒，默认0.24）
   * @param {number} frequency - 频率（默认800Hz）
   */
  function playDashSound(duration = 0.24, frequency = 800) {
    if (!ctx) init();
    _playTone(frequency, duration, puzzleGain);
  }

  /**
   * 播放按键/选择音效
   */
  function playClickSound() {
    if (!ctx) init();
    _playTone(1200, 0.05, sfxGain, 'square');
  }

  /**
   * 播放成功音效（和谐和弦）
   */
  function playSuccessSound() {
    if (!ctx) init();
    const notes = [523.25, 659.25, 783.99]; // C5 E5 G5
    const now = ctx.currentTime;
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.3 * sfxVolume, now + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.5);
      osc.connect(gain);
      gain.connect(sfxGain);
      osc.start(now + i * 0.05);
      osc.stop(now + i * 0.05 + 0.5);
    });
  }

  /**
   * 播放失败音效（不和谐）
   */
  function playFailSound() {
    if (!ctx) init();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.3);
    osc.type = 'sawtooth';
    gain.gain.setValueAtTime(0.3 * sfxVolume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(sfxGain);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  }

  // ========== 频率实时生成 ==========

  /**
   * 播放指定频率的持续正弦波
   * @param {number} frequency - 频率（Hz）
   * @param {number} volume - 音量（0~1）
   * @returns {OscillatorNode|null} - 返回 Oscillator 引用，用于后续停止
   */
  function playFrequency(frequency, volume = 0.3) {
    if (!ctx) init();

    // 如果有正在播放的同一类振荡器，先停掉
    if (currentOscillator) {
      try { currentOscillator.stop(); } catch (e) {}
      currentOscillator = null;
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = frequency;

    gain.gain.value = volume;

    // 连接到 puzzleGain 和分析器
    osc.connect(gain);
    gain.connect(puzzleGain);
    gain.connect(analyser);

    osc.start();
    currentOscillator = osc;

    return osc;
  }

  /**
   * 停止当前频率播放
   */
  function stopFrequency() {
    if (currentOscillator) {
      try { currentOscillator.stop(); } catch (e) {}
      currentOscillator = null;
    }
  }

  /**
   * 调整当前频率
   * @param {number} frequency - 新频率（Hz）
   */
  function setFrequency(frequency) {
    if (currentOscillator) {
      currentOscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
    }
  }

  /**
   * 调整当前频率的音量
   * @param {number} volume - 音量（0~1）
   */
  function setFrequencyVolume(volume) {
    if (currentOscillator) {
      // 通过增益节点的父节点调整，但这里简单处理：
      // 重新建立连接会比较复杂，暂时重新生成
      const freq = currentOscillator.frequency.value;
      stopFrequency();
      playFrequency(freq, volume);
    }
  }

  // ========== 摩尔斯电码播放 ==========

  /**
   * 播放摩尔斯电码序列
   * @param {string} sequence - 摩尔斯序列，如 "... --- ..."
   * @param {number} dotDuration - "滴"时长（秒，默认0.15）
   * @param {number} frequency - 音频频率（Hz，默认800）
   * @returns {Promise} - 播放完成时 resolve
   */
  function playMorseSequence(sequence, dotDuration = 0.15, frequency = 800) {
    if (!ctx) init();

    return new Promise((resolve) => {
      const now = ctx.currentTime;
      let timeOffset = 0;

      // 摩尔斯间隔规则：
      // "滴" = 1 单位
      // "答" = 3 单位
      // 符号间间隔 = 1 单位
      // 字母间间隔 = 3 单位
      // 单词间间隔 = 7 单位

      const chars = sequence.split('');
      const totalTime = _calculateMorseDuration(sequence, dotDuration);

      chars.forEach((char) => {
        if (char === '.') {
          _scheduleTone(now + timeOffset, frequency, dotDuration, puzzleGain);
          timeOffset += dotDuration + dotDuration; // 音 + 符号间隔
        } else if (char === '-') {
          _scheduleTone(now + timeOffset, frequency, dotDuration * 3, puzzleGain);
          timeOffset += dotDuration * 3 + dotDuration; // 音 + 符号间隔
        } else if (char === ' ') {
          // 空格 = 额外增加 2 单位（前面已有1单位）
          timeOffset += dotDuration * 2;
        } else if (char === '/') {
          // 单词分隔 = 额外增加 4 单位（前面已有3单位）
          timeOffset += dotDuration * 4;
        }
      });

      // 播放完成后 resolve
      setTimeout(() => {
        resolve();
      }, totalTime * 1000 + 200);
    });
  }

  /**
   * 将文本转换为摩尔斯序列
   * @param {string} text - 要转换的文本
   * @returns {string} - 摩尔斯序列
   */
  function textToMorse(text) {
    return text.toUpperCase()
      .split('')
      .map(char => MORSE_CODE[char] || '')
      .join(' ');
  }

  /**
   * 计算摩尔斯序列播放时长
   */
  function _calculateMorseDuration(sequence, dotDuration) {
    let total = 0;
    const chars = sequence.split('');
    chars.forEach((char) => {
      if (char === '.') {
        total += dotDuration + dotDuration;
      } else if (char === '-') {
        total += dotDuration * 3 + dotDuration;
      } else if (char === ' ') {
        total += dotDuration * 2;
      } else if (char === '/') {
        total += dotDuration * 4;
      }
    });
    return total;
  }

  // ========== 波形可视化 ==========

  /**
   * 将分析器连接到指定音频节点
   * @param {AudioNode} node - 要分析的音频节点
   */
  function connectAnalyser(node) {
    if (!ctx || !analyser) return;
    node.connect(analyser);
  }

  /**
   * 获取当前频率域数据（FFT）
   * @returns {Uint8Array|null}
   */
  function getFrequencyData() {
    if (!analyser) return null;
    analyser.getByteFrequencyData(frequencyData);
    return frequencyData;
  }

  /**
   * 获取当前时域数据（波形）
   * @returns {Uint8Array|null}
   */
  function getTimeDomainData() {
    if (!analyser) return null;
    analyser.getByteTimeDomainData(timeDomainData);
    return timeDomainData;
  }

  /**
   * 获取分析器的 bufferLength
   */
  function getAnalyserBufferLength() {
    if (!analyser) return 0;
    return analyser.frequencyBinCount;
  }

  /**
   * 绘制波形到 Canvas
   * @param {CanvasRenderingContext2D} ctx2d - Canvas 2D 上下文
   * @param {number} width - 画布宽度
   * @param {number} height - 画布高度
   * @param {string} color - 波形颜色
   */
  function drawWaveform(ctx2d, width, height, color = '#D4AF37') {
    if (!analyser) return;

    const data = getTimeDomainData();
    if (!data) return;

    ctx2d.save();
    ctx2d.clearRect(0, 0, width, height);

    ctx2d.lineWidth = 2;
    ctx2d.strokeStyle = color;
    ctx2d.beginPath();

    const sliceWidth = width / data.length;
    let x = 0;

    for (let i = 0; i < data.length; i++) {
      const v = data[i] / 128.0; // 128 是中值
      const y = (v * height) / 2;

      if (i === 0) {
        ctx2d.moveTo(x, y);
      } else {
        ctx2d.lineTo(x, y);
      }

      x += sliceWidth;
    }

    ctx2d.lineTo(width, height / 2);
    ctx2d.stroke();

    // 绘制中心线
    ctx2d.strokeStyle = 'rgba(212, 175, 55, 0.3)';
    ctx2d.lineWidth = 1;
    ctx2d.beginPath();
    ctx2d.moveTo(0, height / 2);
    ctx2d.lineTo(width, height / 2);
    ctx2d.stroke();

    ctx2d.restore();
  }

  /**
   * 绘制频谱到 Canvas
   * @param {CanvasRenderingContext2D} ctx2d - Canvas 2D 上下文
   * @param {number} width - 画布宽度
   * @param {number} height - 画布高度
   * @param {string} color - 频谱颜色
   */
  function drawSpectrum(ctx2d, width, height, color = '#00F5FF') {
    if (!analyser) return;

    const data = getFrequencyData();
    if (!data) return;

    ctx2d.save();
    ctx2d.clearRect(0, 0, width, height);

    const barWidth = (width / data.length) * 2.5;
    let x = 0;

    for (let i = 0; i < data.length; i++) {
      const barHeight = (data[i] / 255.0) * height * 0.8;

      ctx2d.fillStyle = color;
      ctx2d.globalAlpha = 0.7 + (data[i] / 255.0) * 0.3;
      ctx2d.fillRect(x, height - barHeight, barWidth, barHeight);

      x += barWidth + 1;

      if (x > width) break;
    }

    ctx2d.restore();
  }

  // ========== 内部辅助函数 ==========

  function _playTone(frequency, duration, targetGain, type = 'sine') {
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(targetGain);
    osc.start();
    osc.stop(ctx.currentTime + duration);
    osc.onended = () => { gain.disconnect(); };
  }

  function _scheduleTone(startTime, frequency, duration, targetGain) {
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(0.4 * sfxVolume, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    osc.connect(gain);
    gain.connect(targetGain);
    osc.start(startTime);
    osc.stop(startTime + duration);
    osc.onended = () => { gain.disconnect(); };
  }

  // ========== 音量控制 ==========

  function setMasterVolume(vol) {
    masterVolume = Math.max(0, Math.min(1, vol));
    if (masterGain) {
      masterGain.gain.setValueAtTime(masterVolume, ctx.currentTime);
    }
  }

  function setBgmVolume(vol) {
    bgmVolume = Math.max(0, Math.min(1, vol));
    if (bgmGain) {
      bgmGain.gain.setValueAtTime(bgmVolume, ctx.currentTime);
    }
  }

  function setSfxVolume(vol) {
    sfxVolume = Math.max(0, Math.min(1, vol));
    if (sfxGain) {
      sfxGain.gain.setValueAtTime(sfxVolume, ctx.currentTime);
    }
  }

  function mute() {
    if (masterGain) {
      masterGain.gain.setValueAtTime(0, ctx.currentTime);
    }
  }

  function unmute() {
    if (masterGain) {
      masterGain.gain.setValueAtTime(masterVolume, ctx.currentTime);
    }
  }

  // ========== 公共 API ==========

  return {
    // 初始化
    init,
    getContext: () => ctx,

    // BGM
    loadAudioBuffer,
    playBgm,
    stopBgm,
    getCurrentBgm: () => currentBgmBuffer,

    // 音效
    playSfx,
    playClickSound,
    playSuccessSound,
    playFailSound,
    playDotSound,
    playDashSound,

    // 频率
    playFrequency,
    stopFrequency,
    setFrequency,
    setFrequencyVolume,

    // 摩尔斯
    playMorseSequence,
    textToMorse,

    // 可视化
    connectAnalyser,
    getFrequencyData,
    getTimeDomainData,
    getAnalyserBufferLength,
    drawWaveform,
    drawSpectrum,

    // 音量
    setMasterVolume,
    setBgmVolume,
    setSfxVolume,
    mute,
    unmute,

    // 常量
    MORSE_CODE,
    TARGET_FREQUENCY: 7830
  };
})();

// 自动初始化（页面加载后）
if (typeof window !== 'undefined') {
  window.AudioSystem = AudioSystem;
  // 延迟初始化，等待用户交互（某些浏览器要求）
  document.addEventListener('DOMContentLoaded', () => {
    console.log('[Audio] 等待用户交互以初始化 AudioContext...');
  });
}
