// storage.js — Multi-user Storage Manager (localStorage + IndexedDB)
// get/set are synchronous (localStorage). IndexedDB persists in background.

class StorageManager {
  constructor() {
    this.PREFIX = 'sf_';
    this.userId = null;
    this.db = null;
    this.DB_NAME = 'SeventhFrequencyDB';
    this.DB_VERSION = 1;
    this.MAX_STORAGE = 300 * 1024 * 1024;
  }

  // ── Initialization ─────────────────────────────────────────

  async init() {
    // Try IndexedDB (non-blocking, optional)
    try {
      this.db = await new Promise((resolve) => {
        const req = indexedDB.open(this.DB_NAME, this.DB_VERSION);
        req.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains('users')) db.createObjectStore('users', { keyPath: 'id' });
          if (!db.objectStoreNames.contains('saves')) {
            const s = db.createObjectStore('saves', { keyPath: ['userId', 'key'] });
            s.createIndex('userId', 'userId', { unique: false });
          }
        };
        req.onsuccess = (e) => resolve(e.target.result);
        req.onerror = () => resolve(null);
        setTimeout(() => resolve(null), 3000); // 3s timeout
      });
    } catch (e) { this.db = null; }
    return true;
  }

  // ── Login / Logout (localStorage-first, IndexedDB background) ─

  async login(userId) {
    userId = (userId || '').trim();
    if (!userId) return false;
    this.userId = userId;
    localStorage.setItem(this.PREFIX + 'last_user', userId);
    // Background: register in IndexedDB
    if (this.db) {
      try {
        const tx = this.db.transaction('users', 'readwrite');
        tx.objectStore('users').put({ id: userId, createdAt: Date.now(), lastAccess: Date.now() });
      } catch (e) {}
    }
    return true;
  }

  async logout() {
    if (this.userId && this.db) {
      try {
        const tx = this.db.transaction('users', 'readwrite');
        const user = await new Promise(r => { const req = tx.objectStore('users').get(this.userId); req.onsuccess = () => r(req.result); req.onerror = () => r(null); });
        if (user) { user.lastAccess = Date.now(); tx.objectStore('users').put(user); }
      } catch (e) {}
    }
    this.userId = null;
  }

  async autoLogin() {
    const last = localStorage.getItem(this.PREFIX + 'last_user');
    if (last) { this.userId = last; return true; }
    return false;
  }

  // ── Data Access (synchronous, per-user localStorage) ───────

  _userKey(key) {
    return this.PREFIX + (this.userId ? this.userId + ':' : '') + key;
  }

  get(key, defaultValue) {
    try {
      const val = JSON.parse(localStorage.getItem(this._userKey(key)));
      return val !== null ? val : defaultValue;
    } catch (e) { return defaultValue; }
  }

  set(key, value) {
    try { localStorage.setItem(this._userKey(key), JSON.stringify(value)); } catch (e) {}
  }

  forceSave() { return Promise.resolve(); }

  // ── User Management ────────────────────────────────────────

  async userExists(userId) {
    if (!this.db) return false;
    try {
      const user = await new Promise(r => {
        const req = this.db.transaction('users', 'readonly').objectStore('users').get(userId.trim());
        req.onsuccess = () => r(req.result);
        req.onerror = () => r(null);
      });
      return !!user;
    } catch (e) { return false; }
  }

  async cleanup() {
    if (!this.db) return { removed: 0 };
    try {
      const users = await new Promise(r => {
        const req = this.db.transaction('users', 'readonly').objectStore('users').getAll();
        req.onsuccess = () => r(req.result || []);
        req.onerror = () => r([]);
      });
      users.sort((a, b) => (a.lastAccess || 0) - (b.lastAccess || 0));
      let removed = 0;
      for (const u of users.slice(0, Math.max(0, users.length - 50))) {
        if (u.id === this.userId) continue;
        try {
          const tx = this.db.transaction(['users', 'saves'], 'readwrite');
          tx.objectStore('users').delete(u.id);
          const idx = tx.objectStore('saves').index('userId');
          const cursor = idx.openCursor(u.id);
          cursor.onsuccess = (e) => { const c = e.target.result; if (c) { c.delete(); c.continue(); } };
          removed++;
        } catch (e) {}
      }
      return { removed };
    } catch (e) { return { removed: 0 }; }
  }

  destroy() { if (this.db) { this.db.close(); this.db = null; } }
}

window.StorageManager = StorageManager;
