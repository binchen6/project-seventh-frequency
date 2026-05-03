const fs = require('fs');
const html = fs.readFileSync('web/jsp/game.html', 'utf-8');

console.log('loginScreen:', html.includes('id="loginScreen"') ? 'YES' : 'NO');
console.log('game-container:', html.includes('id="game-container"') ? 'YES' : 'NO');
console.log('sceneLoader:', html.includes('id="sceneLoader"') ? 'YES' : 'NO');
console.log('storage.js:', html.includes('storage.js') ? 'YES' : 'NO');

const scripts = html.match(/<script[^>]*src=[^>]*>/g);
console.log('Scripts:', scripts);

// Check HTML structure around login screen
const loginIdx = html.indexOf('id="loginScreen"');
if (loginIdx > 0) {
  console.log('\n=== Login screen context ===');
  console.log(html.slice(Math.max(0, loginIdx - 200), loginIdx + 300));
}

// Check if login screen is inside body properly
const bodyIdx = html.indexOf('<body');
const loginScreenIdx = html.indexOf('loginScreen');
const gameContainerIdx = html.indexOf('game-container');
console.log('\nBody at:', bodyIdx);
console.log('loginScreen at:', loginScreenIdx);
console.log('game-container at:', gameContainerIdx);
