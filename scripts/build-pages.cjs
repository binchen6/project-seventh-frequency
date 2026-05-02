const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = process.cwd();
const dist = path.join(root, 'dist');

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

function removeDir(target) {
  if (fs.existsSync(target)) fs.rmSync(target, { recursive: true, force: true });
}

const prep = spawnSync(process.execPath, ['scripts/prepare-static-pages.cjs'], { stdio: 'inherit' });
if (prep.status !== 0) process.exit(prep.status);

removeDir(dist);
fs.mkdirSync(dist, { recursive: true });

for (const entry of ['assets', 'data']) {
  copyRecursive(path.join(root, 'web', entry), path.join(dist, entry));
}

for (const file of ['fonts.css', 'game.css']) {
  copyRecursive(path.join(root, 'web', 'css', file), path.join(dist, 'css', file));
}

copyRecursive(path.join(root, 'web', 'js', 'engine.js'), path.join(dist, 'js', 'engine.js'));
copyRecursive(path.join(root, 'web', 'index.html'), path.join(dist, 'index.html'));
copyRecursive(path.join(root, 'web', 'jsp', 'game.html'), path.join(dist, 'jsp', 'game.html'));
copyRecursive(path.join(root, 'web', 'jsp', 'gallery.html'), path.join(dist, 'jsp', 'gallery.html'));

fs.writeFileSync(path.join(dist, '.nojekyll'), '', 'utf8');

console.log(JSON.stringify({
  output: 'dist',
  files: countFiles(dist)
}, null, 2));

function countFiles(dir) {
  let count = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) count += countFiles(full);
    else count += 1;
  }
  return count;
}
