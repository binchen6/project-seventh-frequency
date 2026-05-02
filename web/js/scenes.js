/**
 * scenes.js — 《第七频率》场景数据加载与解析
 * fetch script.json · 预加载资源 · 场景管理
 */

class SceneLoader {
  constructor(basePath = 'data/') {
    this.basePath = basePath;
    this.assetBase = window.SF_ASSET_BASE || '';
    this.script = null;
    this.chapters = [];
    this.scenes = new Map();
    this.loaded = false;
    this.loadingPromise = null;

    // 资源缓存
    this.imageCache = new Map();
    this.audioCache = new Map();

    // 加载队列
    this.pendingLoads = new Set();
  }

  /* ========== 剧本加载 ========== */

  async loadScript() {
    if (this.loadingPromise) return this.loadingPromise;
    this.loadingPromise = this._doLoadScript();
    return this.loadingPromise;
  }

  async _doLoadScript() {
    try {
      const resp = await fetch(`${this.basePath}script.json`);
      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
      }
      this.script = await resp.json();
      this._indexScenes();
      this.loaded = true;
      console.log('[SceneLoader] Script loaded,', this.scenes.size, 'scenes indexed');
      return this.script;
    } catch (err) {
      console.error('[SceneLoader] Failed to load script:', err);
      // 后备：返回空结构
      this.script = { chapters: [] };
      this.loaded = false;
      return this.script;
    }
  }

  _indexScenes() {
    this.scenes.clear();
    this.chapters = [];
    if (!this.script || !this.script.chapters) return;

    this.script.chapters.forEach(ch => {
      this.chapters.push({
        id: ch.id,
        title: ch.title,
        sceneCount: ch.scenes ? ch.scenes.length : 0
      });
      if (ch.scenes) {
        ch.scenes.forEach(sc => {
          this.scenes.set(sc.id, sc);
        });
      }
    });
  }

  /* ========== 场景查询 ========== */

  async getScene(sceneId) {
    if (!this.loaded) await this.loadScript();
    return this.scenes.get(sceneId) || null;
  }

  getChapterScenes(chapterId) {
    const ch = this.script?.chapters?.find(c => c.id === chapterId);
    return ch?.scenes || [];
  }

  getFirstSceneOfChapter(chapterId) {
    const scenes = this.getChapterScenes(chapterId);
    return scenes[0] || null;
  }

  getAllChapters() {
    return this.chapters;
  }

  /* ========== 资源预加载 ========== */

  async preloadChapter(chapterId) {
    const scenes = this.getChapterScenes(chapterId);
    const resources = new Set();

    scenes.forEach(sc => {
      if (sc.bg) resources.add({ type: 'image', path: this._resolveImagePath(sc.bg) });
      if (sc.bgm) resources.add({ type: 'audio', path: this._resolveAudioPath(sc.bgm) });

      sc.dialogues?.forEach(d => {
        if (d.illustration) resources.add({ type: 'image', path: d.illustration });
        if (d.speaker && d.expression) {
          resources.add({
            type: 'image',
            path: `${this.assetBase}assets/characters/${this._sanitizeName(d.speaker)}_${d.expression}.png`
          });
        }
      });
    });

    const items = Array.from(resources);
    const batchSize = 6;
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      await Promise.all(batch.map(r => this._preloadResource(r)));
    }

    console.log('[SceneLoader] Preloaded chapter', chapterId, resources.size, 'resources');
  }

  async preloadScene(sceneId) {
    const scene = await this.getScene(sceneId);
    if (!scene) return;

    const resources = [];
    if (scene.bg) resources.push({ type: 'image', path: this._resolveImagePath(scene.bg) });
    if (scene.bgm) resources.push({ type: 'audio', path: this._resolveAudioPath(scene.bgm) });

    scene.dialogues?.forEach(d => {
      if (d.illustration) resources.push({ type: 'image', path: d.illustration });
      if (d.speaker && d.expression) {
        resources.push({
          type: 'image',
          path: `${this.assetBase}assets/characters/${this._sanitizeName(d.speaker)}_${d.expression}.png`
        });
      }
    });

    await Promise.all(resources.map(r => this._preloadResource(r)));
  }

  async _preloadResource(resource) {
    const { type, path } = resource;
    if (type === 'image') {
      await this._loadImage(path);
    } else if (type === 'audio') {
      await this._loadAudio(path);
    }
  }

  _loadImage(src) {
    if (this.imageCache.has(src)) return this.imageCache.get(src);
    const p = new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        this.imageCache.set(src, img);
        resolve(img);
      };
      img.onerror = () => {
        console.warn('[SceneLoader] Image not found:', src);
        resolve(null);
      };
      img.src = src;
    });
    this.imageCache.set(src, p);
    return p;
  }

  _loadAudio(src) {
    if (this.audioCache.has(src)) return this.audioCache.get(src);
    const p = new Promise((resolve) => {
      const audio = new Audio();
      audio.addEventListener('canplaythrough', () => {
        this.audioCache.set(src, audio);
        resolve(audio);
      }, { once: true });
      audio.addEventListener('error', () => {
        console.warn('[SceneLoader] Audio not found:', src);
        resolve(null);
      }, { once: true });
      audio.src = src;
    });
    this.audioCache.set(src, p);
    return p;
  }

  /* ========== 资源路径解析 ========== */

  _resolveImagePath(key) {
    if (key.startsWith('http')) return key;
    if (key.startsWith('assets/')) return this.assetBase + key;
    return `${this.assetBase}assets/bg/${key}`;
  }

  _resolveAudioPath(key) {
    if (key.startsWith('http')) return key;
    if (key.startsWith('assets/')) return this.assetBase + key;
    return `${this.assetBase}assets/audio/${key}`;
  }

  _sanitizeName(name) {
    return name.toLowerCase().replace(/\s+/g, '_');
  }

  getImage(src) {
    return this.imageCache.get(src) || null;
  }

  getAudio(src) {
    return this.audioCache.get(src) || null;
  }

  /* ========== 场景跳转 ========== */

  resolveNextScene(currentSceneId, choiceId) {
    const scene = this.scenes.get(currentSceneId);
    if (!scene || !scene.choices) return null;
    const choice = scene.choices.find(c => c.id === choiceId);
    return choice?.nextScene || null;
  }

  /* ========== 调试工具 ========== */

  dumpSceneTree() {
    console.group('Scene Tree');
    this.chapters.forEach(ch => {
      console.group(`Chapter ${ch.id}: ${ch.title}`);
      const scenes = this.getChapterScenes(ch.id);
      scenes.forEach(sc => {
        console.log(`  Scene ${sc.id}: ${sc.dialogues?.length || 0} dialogues`);
      });
      console.groupEnd();
    });
    console.groupEnd();
  }
}

// 暴露全局
window.SceneLoader = SceneLoader;
