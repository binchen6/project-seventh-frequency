const fs = require('fs');
const path = require('path');
const root = 'project-seventh-frequency/dist';
const html = fs.readFileSync(path.join(root, 'jsp/game.html'), 'utf8');

const refs = [...html.matchAll(/(?:src|href)=["']([^"']+)["']/g)].map(m => m[1]);
console.log('References in game.html:');
refs.forEach(r => {
  const absPath = path.join(root, 'jsp', r).replace(/\\/g, '/');
  const relPath = path.relative(root, absPath).replace(/\\/g, '/');
  const exists = fs.existsSync(path.join(root, relPath));
  console.log('  ' + r + ' -> ' + relPath + ' ' + (exists ? 'EXISTS' : 'MISSING'));
});
