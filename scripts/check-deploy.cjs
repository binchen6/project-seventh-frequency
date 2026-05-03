const https = require('https');

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { timeout: 10000 }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        fetch(res.headers.location).then(resolve).catch(reject);
        return;
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', reject);
  });
}

async function main() {
  try {
    const game = await fetch('https://binchen6.github.io/project-seventh-frequency/jsp/game.html');
    console.log('Status:', game.status);
    console.log('Size:', game.data.length);
    console.log('Has loginScreen:', game.data.includes('loginScreen'));
    console.log('Has storage.js:', game.data.includes('storage.js'));
    console.log('Has btnLogout:', game.data.includes('btnLogout'));
    
    // Check first 500 chars
    console.log('\nFirst 500 chars:');
    console.log(game.data.slice(0, 500));
    
    // Check for storage script tag
    const scriptMatch = game.data.match(/<script[^>]*src=[^>]*>/g);
    console.log('\nScript tags:', scriptMatch);
  } catch (e) {
    console.error('Error:', e.message);
  }
}

main();
