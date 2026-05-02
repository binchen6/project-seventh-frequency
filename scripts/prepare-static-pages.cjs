const fs = require('fs');
const path = require('path');

const pages = [
  ['web/jsp/game.jsp', 'web/jsp/game.html'],
  ['web/jsp/gallery.jsp', 'web/jsp/gallery.html']
];

for (const [src, dest] of pages) {
  let html = fs.readFileSync(src, 'utf8');
  html = html.replace(/^<%@[\s\S]*?%>\s*/, '');
  fs.writeFileSync(dest, html, 'utf8');
}

const indexPath = 'web/index.html';
let index = fs.readFileSync(indexPath, 'utf8');
index = index
  .replaceAll('jsp/game.jsp', 'jsp/game.html')
  .replaceAll('jsp/gallery.jsp', 'jsp/gallery.html');
fs.writeFileSync(indexPath, index, 'utf8');

console.log(JSON.stringify({
  generated: pages.map(([, dest]) => path.relative(process.cwd(), dest)),
  updated: indexPath
}, null, 2));
