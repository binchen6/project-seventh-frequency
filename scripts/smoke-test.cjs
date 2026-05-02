const http = require('http');
const fs = require('fs');
const path = require('path');

let chromium;
try {
  ({ chromium } = require('playwright'));
} catch (err) {
  console.error('Playwright is required for this smoke test.');
  console.error('Set NODE_PATH to the bundled node_modules path, or install playwright locally.');
  console.error(err.message);
  process.exit(1);
}

const root = path.resolve(__dirname, '..', process.env.SF_SMOKE_ROOT || process.argv[2] || 'web');
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.jsp': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.mp3': 'audio/mpeg',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.xml': 'application/xml; charset=utf-8'
};

function findBrowserExecutable() {
  const candidates = [
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
  ].filter(Boolean);
  return candidates.find(file => fs.existsSync(file)) || null;
}

function createServer() {
  return http.createServer((req, res) => {
    const requestUrl = new URL(req.url, 'http://127.0.0.1');
    let pathname = decodeURIComponent(requestUrl.pathname);
    if (pathname === '/') pathname = '/index.html';

    const filePath = path.normalize(path.join(root, pathname));
    if (!filePath.startsWith(root)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(`Not found: ${pathname}`);
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      res.setHeader('Content-Type', mime[ext] || 'application/octet-stream');
      if (ext === '.jsp') data = Buffer.from(data.toString('utf8').replace(/^<%@[^%]*%>\s*/, ''), 'utf8');
      res.end(data);
    });
  });
}

async function listen(server) {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  return `http://127.0.0.1:${port}`;
}

async function assertGamePage(page, baseUrl, route = '/jsp/game.html?chapter=1') {
  const errors = [];
  page.on('pageerror', err => errors.push(err.message));
  page.on('console', msg => {
    if (msg.type() === 'error' && !msg.text().startsWith('Failed to load resource:')) errors.push(msg.text());
  });

  const badResponses = [];
  const recentRequests = [];
  page.on('request', req => {
    recentRequests.push(req.url());
    if (recentRequests.length > 30) recentRequests.shift();
  });
  page.on('response', res => {
    if (res.status() >= 400) badResponses.push(`${res.status()} ${res.url()}`);
  });
  page.on('requestfailed', req => {
    const errorText = req.failure()?.errorText || '';
    if (errorText !== 'net::ERR_ABORTED') badResponses.push(`FAILED ${req.url()} ${errorText}`);
  });

  await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('#sceneLoader.hidden', { timeout: 5000 });
  await page.waitForFunction(() => document.getElementById('dialogueText')?.textContent.length > 0, null, { timeout: 5000 });

  const firstState = await page.evaluate(() => ({
    dialogue: document.getElementById('dialogueText').textContent,
    loaderHidden: document.getElementById('sceneLoader').classList.contains('hidden'),
    hasUnifiedEngine: Boolean(window.SeventhFrequencyEngine && window.engine),
    hasExternalCss: [...document.styleSheets].some(sheet => sheet.href && sheet.href.includes('/css/game.css')),
    inlineStyleBlocks: document.querySelectorAll('style').length,
    hudTitle: document.getElementById('hudTitle')?.textContent,
    hudObjective: document.getElementById('hudObjective')?.textContent,
    signalRows: document.querySelectorAll('#signalGrid .signal-row').length,
    chapterCardReady: Boolean(document.getElementById('chapterCard')),
    settingsFabReady: Boolean(document.getElementById('btnSettings') && document.getElementById('settingsModal')),
    bottomSettingsButtons: [...document.querySelectorAll('#controlBar .ctrl-btn')].filter(btn => btn.id === 'btnSettings').length,
    controlIds: [...document.querySelectorAll('#controlBar .ctrl-btn')].map(btn => btn.id),
    controlKeyCount: document.querySelectorAll('#controlBar .ctrl-key').length,
    autoPressed: document.getElementById('btnAuto')?.getAttribute('aria-pressed'),
    skipPressed: document.getElementById('btnSkip')?.getAttribute('aria-pressed'),
    fontFamilies: [...document.fonts].map(font => font.family),
    bodyFont: getComputedStyle(document.body).fontFamily,
    defaultBgmVolume: window.SeventhFrequencyEngine.settings.bgmVolume,
    defaultBgmOutput: window.SeventhFrequencyEngine.getBgmVolume(),
    defaultBgmLabel: document.getElementById('bgmVolumeValue')?.textContent,
    defaultFontScale: window.SeventhFrequencyEngine.settings.fontScale,
    defaultFontScaleLabel: document.getElementById('fontScaleValue')?.textContent
  }));
  if (!firstState.loaderHidden) throw new Error('Scene loader did not hide.');
  if (!firstState.hasUnifiedEngine) throw new Error('Unified engine API was not exposed.');
  if (!firstState.hasExternalCss || firstState.inlineStyleBlocks !== 0) throw new Error('Game CSS is not externalized cleanly.');
  if (!firstState.dialogue.includes('验尸房')) throw new Error(`Unexpected opening dialogue: ${firstState.dialogue}`);
  if (!firstState.hudTitle || !firstState.hudObjective || firstState.signalRows !== 6 || !firstState.chapterCardReady) {
    throw new Error(`Story presentation HUD did not initialize: ${JSON.stringify(firstState)}`);
  }
  if (!firstState.settingsFabReady || firstState.bottomSettingsButtons !== 0) {
    throw new Error(`Settings UI was not moved into the scene layer: ${JSON.stringify(firstState)}`);
  }
  if (firstState.controlIds.join(',') !== 'btnSave,btnLoad,btnHistory,btnAuto,btnSkip,btnBack' || firstState.controlKeyCount !== 6 || firstState.autoPressed !== 'false' || firstState.skipPressed !== 'false') {
    throw new Error(`Bottom toolbar did not initialize correctly: ${JSON.stringify(firstState)}`);
  }
  if (!firstState.fontFamilies.includes('MiSans') || !firstState.fontFamilies.includes('JetBrains Mono') || !firstState.bodyFont.includes('MiSans')) {
    throw new Error(`Self-hosted fonts did not initialize: ${JSON.stringify(firstState)}`);
  }
  if (firstState.defaultBgmVolume !== 22 || firstState.defaultBgmOutput > 0.1 || firstState.defaultBgmLabel !== '22%' || firstState.defaultFontScale !== 100 || firstState.defaultFontScaleLabel !== '100%') {
    throw new Error(`BGM default volume is not lowered: ${JSON.stringify(firstState)}`);
  }

  await page.locator('#btnSettings').click();
  await page.waitForSelector('#settingsModal.active', { timeout: 5000 });
  await page.locator('#bgmVolume').evaluate(el => {
    el.value = '23';
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await page.locator('#typingSpeed').evaluate(el => {
    el.value = '18';
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await page.locator('#fontScale').evaluate(el => {
    el.value = '260';
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await page.locator('#autoDelay').evaluate(el => {
    el.value = '1300';
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await page.locator('#muteBgm').check();
  await page.locator('#reduceEffects').check();
  const settingsState = await page.evaluate(() => ({
    settings: window.SeventhFrequencyEngine.settings,
    saved: JSON.parse(localStorage.getItem('sf_settings')),
    reduceClass: document.body.classList.contains('reduce-effects'),
    modalOpen: document.getElementById('settingsModal').classList.contains('active')
  }));
  if (settingsState.settings.bgmVolume !== 23 || settingsState.settings.typingSpeed !== 18 || settingsState.settings.fontScale !== 260 || settingsState.settings.autoDelay !== 1300 || !settingsState.settings.muteBgm || !settingsState.reduceClass || !settingsState.saved.reduceEffects || settingsState.saved.fontScale !== 260 || !settingsState.modalOpen) {
    throw new Error(`Settings controls did not apply: ${JSON.stringify(settingsState)}`);
  }
  await page.locator('#applySettings').click();
  await page.waitForFunction(() => !document.getElementById('settingsModal').classList.contains('active'), null, { timeout: 5000 });
  await page.evaluate(() => window.SeventhFrequencyEngine.applyGameSettings({ reduceEffects: false, muteBgm: false }));
  const loweredBgmState = await page.evaluate(() => ({
    sliderVolume: window.SeventhFrequencyEngine.settings.bgmVolume,
    outputVolume: window.SeventhFrequencyEngine.getBgmVolume()
  }));
  if (loweredBgmState.sliderVolume !== 23 || loweredBgmState.outputVolume <= 0 || loweredBgmState.outputVolume > 0.11) {
    throw new Error(`BGM output gain was not lowered or persisted: ${JSON.stringify(loweredBgmState)}`);
  }

  const scriptCoverage = await page.evaluate(() => {
    const scenes = window.SeventhFrequencyEngine.script.chapters.flatMap(ch => ch.scenes);
    const choices = scenes.flatMap(sc => sc.choices || []);
    return {
      totalChoices: choices.length,
      missingFeedback: choices.filter(choice => !choice.feedback).map(choice => choice.id),
      specialChoices: choices.filter(choice => choice.special && choice.condition).length,
      newIllustrations: scenes.flatMap(sc => sc.dialogues || []).filter(d => String(d.illustration || '').endsWith('.svg')).map(d => d.illustration)
    };
  });
  if (scriptCoverage.missingFeedback.length || scriptCoverage.specialChoices < 6 || scriptCoverage.newIllustrations.length < 4) {
    throw new Error(`Story enrichment coverage is incomplete: ${JSON.stringify(scriptCoverage)}`);
  }

  await page.keyboard.press('KeyA');
  await page.waitForFunction(() => document.getElementById('btnAuto').classList.contains('is-active'), null, { timeout: 5000 });
  await page.keyboard.press('KeyK');
  await page.waitForFunction(() => document.getElementById('btnSkip').classList.contains('is-active') && !document.getElementById('btnAuto').classList.contains('is-active'), null, { timeout: 5000 });
  const modeState = await page.evaluate(() => ({
    autoPressed: document.getElementById('btnAuto').getAttribute('aria-pressed'),
    skipPressed: document.getElementById('btnSkip').getAttribute('aria-pressed')
  }));
  if (modeState.autoPressed !== 'false' || modeState.skipPressed !== 'true') throw new Error(`Mode toolbar state did not sync: ${JSON.stringify(modeState)}`);
  await page.evaluate(() => window.engine.pause());
  await page.waitForFunction(() => !document.getElementById('btnSkip').classList.contains('is-active'), null, { timeout: 5000 });

  await page.keyboard.press('Control+S');
  await page.waitForSelector('#saveLoadModal.active', { timeout: 5000 });
  await page.locator('#slotsGrid .slot-btn').first().click();
  const savedSlot = await page.evaluate(() => JSON.parse(localStorage.getItem('sf_save_slot_1')));
  if (!savedSlot || savedSlot.chapter !== 1 || !savedSlot.timestamp) throw new Error(`Shortcut save did not write slot data: ${JSON.stringify(savedSlot)}`);
  await page.keyboard.press('Control+L');
  await page.waitForSelector('#saveLoadModal.active', { timeout: 5000 });
  const loadSlotState = await page.evaluate(() => ({
    hasData: document.querySelector('#slotsGrid .slot-btn')?.classList.contains('has-data'),
    text: document.querySelector('#slotsGrid .slot-btn')?.textContent || ''
  }));
  if (!loadSlotState.hasData || !loadSlotState.text.includes('Ch1')) throw new Error(`Load slot did not show saved metadata: ${JSON.stringify(loadSlotState)}`);
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !document.getElementById('saveLoadModal').classList.contains('active'), null, { timeout: 5000 });

  await page.evaluate(() => { window.SeventhFrequencyEngine.state.history = []; });
  await page.keyboard.press('KeyH');
  await page.waitForSelector('#historyModal.active', { timeout: 5000 });
  const historyEmpty = await page.evaluate(() => Boolean(document.querySelector('#historyContent .history-empty')));
  if (!historyEmpty) throw new Error('History modal did not render an empty state.');
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !document.getElementById('historyModal').classList.contains('active'), null, { timeout: 5000 });

  for (let i = 0; i < 20; i++) {
    if (await page.locator('#choicesLayer.active .choice-btn').count()) break;
    await page.locator('#dialogueBox').click();
    await page.waitForTimeout(80);
  }

  const choiceCount = await page.locator('#choicesLayer.active .choice-btn').count();
  if (choiceCount < 2) throw new Error(`Expected at least 2 choices, got ${choiceCount}.`);

  await page.locator('#choicesLayer.active .choice-btn').first().click();
  await page.waitForSelector('#sceneLoader.hidden', { timeout: 5000 });
  await page.waitForTimeout(200);

  const afterChoice = await page.evaluate(() => ({
    dialogue: document.getElementById('dialogueText').textContent,
    toastCount: document.querySelectorAll('#storyToast .toast-card').length,
    feedbackText: [...document.querySelectorAll('#storyToast .toast-card')].map(el => el.textContent).join(' '),
    feedbackDetailCount: document.querySelectorAll('#storyToast .toast-detail').length,
    clueValue: window.SeventhFrequencyEngine.state.params.CLUE,
    hudTitle: document.getElementById('hudTitle')?.textContent,
    savedChapter: JSON.parse(localStorage.getItem('sf_current_chapter')),
    savedScene: JSON.parse(localStorage.getItem('sf_current_scene')),
    savedDialogue: JSON.parse(localStorage.getItem('sf_current_dialogue'))
  }));
  if (!afterChoice.dialogue.includes('玻璃珠')) throw new Error(`Choice did not advance to scene 2: ${afterChoice.dialogue}`);
  if (afterChoice.toastCount < 1 || afterChoice.feedbackDetailCount < 1 || !afterChoice.feedbackText.includes('+10') || afterChoice.clueValue < 1 || !afterChoice.hudTitle) throw new Error(`Choice feedback did not render: ${JSON.stringify(afterChoice)}`);
  if (afterChoice.savedChapter !== 1 || afterChoice.savedScene !== 1 || afterChoice.savedDialogue !== 0) throw new Error(`Choice progress saved the wrong position: ${JSON.stringify(afterChoice)}`);

  await page.keyboard.press('Control+S');
  await page.waitForSelector('#saveLoadModal.active', { timeout: 5000 });
  await page.locator('#slotsGrid .slot-btn').nth(1).click();
  await page.evaluate(async () => {
    const engine = window.SeventhFrequencyEngine;
    engine.state.params.CLUE = 0;
    await engine.loadScene(1, 0);
    engine.saveProgress();
  });
  await page.keyboard.press('Control+L');
  await page.waitForSelector('#saveLoadModal.active', { timeout: 5000 });
  await page.locator('#slotsGrid .slot-btn').nth(1).click();
  await page.waitForSelector('#sceneLoader.hidden', { timeout: 5000 });
  await page.waitForTimeout(200);
  const loadedSlotProgress = await page.evaluate(() => ({
    chapter: window.SeventhFrequencyEngine.state.chapter,
    scene: window.SeventhFrequencyEngine.state.scene,
    dialogueIndex: window.SeventhFrequencyEngine.state.dialogueIndex,
    clueValue: window.SeventhFrequencyEngine.state.params.CLUE,
    savedChapter: JSON.parse(localStorage.getItem('sf_current_chapter')),
    savedScene: JSON.parse(localStorage.getItem('sf_current_scene')),
    savedDialogue: JSON.parse(localStorage.getItem('sf_current_dialogue')),
    dialogue: document.getElementById('dialogueText').textContent
  }));
  if (loadedSlotProgress.chapter !== 1 || loadedSlotProgress.scene !== 1 || loadedSlotProgress.dialogueIndex !== 0 || loadedSlotProgress.clueValue < 1 || loadedSlotProgress.savedChapter !== 1 || loadedSlotProgress.savedScene !== 1 || loadedSlotProgress.savedDialogue !== 0) {
    throw new Error(`Save slot load did not restore scene progress and stats together: ${JSON.stringify(loadedSlotProgress)}`);
  }

  await page.goto(`${baseUrl}/jsp/game.html?chapter=1`, { waitUntil: 'networkidle' });
  await page.waitForSelector('#sceneLoader.hidden', { timeout: 5000 });
  await page.waitForFunction(() => window.SeventhFrequencyEngine?.script, null, { timeout: 5000 });
  await page.evaluate(async () => {
    const engine = window.SeventhFrequencyEngine;
    engine.state.params.INTEL = 20;
    await engine.loadScene(2, 1);
    engine.state.isTyping = false;
    engine.state.dialogueIndex = engine.state.sceneData.dialogues.length - 1;
    engine.advanceDialogue();
  });
  await page.waitForSelector('#sceneLoader.hidden', { timeout: 5000 });
  await page.waitForSelector('#choicesLayer.active .choice-btn', { timeout: 5000 });
  const specialChoiceState = await page.evaluate(() => ({
    specialChoices: document.querySelectorAll('#choicesLayer.active .special-choice').length,
    text: document.getElementById('choicesLayer')?.textContent || ''
  }));
  if (specialChoiceState.specialChoices < 1) {
    throw new Error(`Threshold special choice did not appear: ${JSON.stringify(specialChoiceState)}`);
  }

  await page.evaluate(() => window.SeventhFrequencyEngine.loadScene(4, 4));
  await page.waitForSelector('#sceneLoader.hidden', { timeout: 5000 });
  await page.waitForTimeout(650);
  const frequencyGlitchActive = await page.evaluate(() => document.getElementById('glitchOverlay').classList.contains('active'));
  if (!frequencyGlitchActive) throw new Error('Frequency duel scene did not trigger the glitch effect.');

  if (errors.length || badResponses.length) {
    throw new Error([
      errors.length ? `Browser errors:\n${errors.join('\n')}` : '',
      badResponses.length ? `HTTP errors:\n${badResponses.join('\n')}` : '',
      `Recent requests:\n${recentRequests.join('\n')}`
    ].filter(Boolean).join('\n\n'));
  }
}

async function assertMenuLinks(page, baseUrl) {
  await page.goto(`${baseUrl}/index.html`, { waitUntil: 'networkidle' });
  const links = await page.evaluate(() => [...document.querySelectorAll('a[href]')].map(link => link.getAttribute('href')));
  if (!links.includes('jsp/game.html?chapter=continue') || !links.includes('jsp/gallery.html')) {
    throw new Error(`Static menu links are not GitHub Pages friendly: ${JSON.stringify(links)}`);
  }
}

async function assertGalleryLocks(page, baseUrl) {
  await page.goto(`${baseUrl}/jsp/gallery.html`, { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForSelector('#galleryGrid .illust-card', { timeout: 5000 });

  const emptyState = await page.evaluate(() => ({
    total: document.querySelectorAll('#galleryGrid .illust-card').length,
    locked: document.querySelectorAll('#galleryGrid .illust-card.locked').length,
    unlocked: document.querySelectorAll('#galleryGrid .illust-card.unlocked').length,
    lockedText: document.querySelector('#galleryGrid .illust-card.locked')?.textContent || ''
  }));
  if (emptyState.total !== 26 || emptyState.locked !== 26 || emptyState.unlocked !== 0 || !emptyState.lockedText.includes('待解锁')) {
    throw new Error(`Gallery empty lock state is wrong: ${JSON.stringify(emptyState)}`);
  }

  await page.evaluate(() => {
    localStorage.setItem('sf_unlocked_illustrations', JSON.stringify(['../assets/illustrations/ch1_sc1_morgue.png']));
    localStorage.setItem('sf_current_chapter', JSON.stringify(2));
    localStorage.setItem('sf_current_scene', JSON.stringify(4));
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForSelector('#galleryGrid .illust-card', { timeout: 5000 });

  const progressedState = await page.evaluate(() => ({
    unlocked: document.querySelectorAll('#galleryGrid .illust-card.unlocked').length,
    locked: document.querySelectorAll('#galleryGrid .illust-card.locked').length,
    realImages: document.querySelectorAll('#galleryGrid .illust-card.unlocked img.illust-img').length,
    lockedImages: document.querySelectorAll('#galleryGrid .illust-card.locked img.illust-img').length,
    progressText: document.getElementById('unlockCount')?.textContent
  }));
  if (progressedState.unlocked < 4 || progressedState.locked < 1 || progressedState.realImages !== progressedState.unlocked || progressedState.lockedImages !== 0) {
    throw new Error(`Gallery progressed lock state is wrong: ${JSON.stringify(progressedState)}`);
  }
}

async function assertLegacyEngineAlias(page, baseUrl) {
  if (!fs.existsSync(path.join(root, 'jsp', 'game-engine.jsp'))) return;
  await page.goto(`${baseUrl}/jsp/game-engine.jsp?chapter=1`, { waitUntil: 'networkidle' });
  await page.waitForURL(`${baseUrl}/jsp/game.jsp?chapter=1`, { timeout: 5000 });
  await page.waitForSelector('#sceneLoader.hidden', { timeout: 5000 });
  const hasUnifiedEngine = await page.evaluate(() => Boolean(window.SeventhFrequencyEngine && window.engine));
  if (!hasUnifiedEngine) throw new Error('Unified engine API was not exposed after legacy alias redirect.');
}

(async () => {
  const server = createServer();
  const baseUrl = await listen(server);
  const executablePath = findBrowserExecutable();
  const launchOptions = executablePath ? { headless: true, executablePath } : { headless: true };
  const browser = await chromium.launch(launchOptions);

  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    await assertMenuLinks(page, baseUrl);
    await assertGalleryLocks(page, baseUrl);
    await assertGamePage(page, baseUrl);
    await assertLegacyEngineAlias(page, baseUrl);
    console.log(`Smoke test passed: ${baseUrl}`);
  } finally {
    await browser.close();
    server.close();
  }
})().catch(err => {
  console.error(err.stack || err.message);
  process.exit(1);
});
