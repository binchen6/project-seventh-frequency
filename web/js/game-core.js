// Compatibility shim for older pages that still include game-core.js.
// The unified runtime now lives in engine.js.
(function loadUnifiedEngine() {
  if (window.engine || window.SeventhFrequencyEngine) return;
  var current = document.currentScript;
  var script = document.createElement('script');
  script.src = current ? current.src.replace(/game-core\.js(?:\?.*)?$/, 'engine.js') : 'engine.js';
  script.defer = false;
  (current && current.parentNode ? current.parentNode : document.head).appendChild(script);
})();
