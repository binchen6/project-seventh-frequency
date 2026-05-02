const fs = require('fs');
const path = require('path');

function fail(message, details) {
  console.error(message);
  if (details) console.error(JSON.stringify(details, null, 2));
  process.exit(1);
}

function exists(projectPath) {
  return fs.existsSync(path.join(process.cwd(), projectPath));
}

const script = JSON.parse(fs.readFileSync('web/data/script.json', 'utf8'));
const scenes = script.chapters.flatMap(ch => ch.scenes.map((scene, index) => ({ ...scene, chapterId: ch.id, sceneIndex: index })));
const sceneIds = new Set(scenes.map(scene => scene.id));
const choices = scenes.flatMap(scene => (scene.choices || []).map(choice => ({ ...choice, sceneId: scene.id })));

const badNext = choices.filter(choice => choice.nextScene && !sceneIds.has(choice.nextScene));
if (badNext.length) fail('Invalid nextScene references found.', badNext);

const missingFeedback = choices.filter(choice => !choice.feedback || !choice.feedback.title || !choice.feedback.body);
if (missingFeedback.length) fail('Choices missing feedback copy.', missingFeedback.map(choice => choice.id));

const corruptText = [];
for (const scene of scenes) {
  for (const dialogue of scene.dialogues || []) {
    if (/[?]{5,}/.test(dialogue.text || '')) corruptText.push({ scene: scene.id, text: dialogue.text });
  }
  for (const choice of scene.choices || []) {
    if (/[?]{5,}/.test(choice.text || '') || /[?]{5,}/.test(JSON.stringify(choice.feedback || {}))) {
      corruptText.push({ scene: scene.id, choice: choice.id });
    }
  }
}
if (corruptText.length) fail('Corrupt placeholder text remains in script.', corruptText.slice(0, 20));

const assetRefs = [];
for (const scene of scenes) {
  if (scene.bg) assetRefs.push(scene.bg);
  if (scene.bgm) assetRefs.push(`assets/audio/${scene.bgm}`);
  for (const dialogue of scene.dialogues || []) {
    if (dialogue.illustration) assetRefs.push(dialogue.illustration);
  }
}
const missingAssets = assetRefs
  .map(ref => ref.startsWith('assets/') ? `web/${ref}` : `web/assets/${ref}`)
  .filter(ref => !exists(ref));
if (missingAssets.length) fail('Missing referenced assets.', missingAssets);

const gallery = fs.readFileSync('web/jsp/gallery.jsp', 'utf8');
const galleryItems = (gallery.match(/src:'\.\.\/assets\/illustrations/g) || []).length;
const uniqueIllustrations = new Set(scenes.flatMap(scene => (scene.dialogues || []).map(dialogue => dialogue.illustration).filter(Boolean)));
const galleryIllustrations = [...uniqueIllustrations].filter(src => !src.includes('introspection') && !src.includes('reasoning'));
if (galleryItems !== galleryIllustrations.length) {
  fail('Gallery item count does not match unique script illustration count.', {
    galleryItems,
    uniqueScriptIllustrations: uniqueIllustrations.size,
    galleryFiltered: galleryIllustrations.length,
    note: 'Transition-only illustrations (introspection/reasoning) are excluded from gallery'
  });
}

for (const required of ['web/index.html', 'web/jsp/game.html', 'web/jsp/gallery.html']) {
  if (!exists(required)) fail(`Static entry is missing: ${required}`);
}

const dialogueChars = scenes.flatMap(scene => scene.dialogues || []).reduce((sum, dialogue) => sum + (dialogue.text || '').length, 0);
console.log(JSON.stringify({
  ok: true,
  chapters: script.chapters.length,
  scenes: scenes.length,
  choices: choices.length,
  specialChoices: choices.filter(choice => choice.special || choice.condition).length,
  illustrations: uniqueIllustrations.size,
  dialogueChars,
  estimatedReadingMinutes: Math.round(dialogueChars / 280)
}, null, 2));
