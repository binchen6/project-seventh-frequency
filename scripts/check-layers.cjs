const fs = require('fs');

// Read files
const html = fs.readFileSync('web/jsp/game.html', 'utf-8');
const css = fs.readFileSync('web/css/game.css', 'utf-8');
const engine = fs.readFileSync('web/js/engine.js', 'utf-8');

// 1. Extract layer/modal structure from HTML
console.log('=== HTML 层级结构 ===');
const layerRe = /id=["']([^"']*(?:layer|Layer|modal|Modal|overlay|Overlay|hint|Hint|toast|Toast|choices|Choices)[^"']*)["']/gi;
let m;
while ((m = layerRe.exec(html)) !== null) {
  console.log('  ' + m[1]);
}

// 2. Extract z-index from CSS
console.log('\n=== CSS z-index ===');
const zRe = /([^{}]+)\{[^}]*z-index\s*:\s*(\d+)[^}]*/gi;
while ((m = zRe.exec(css)) !== null) {
  const selector = m[1].trim().split('\n').pop().trim();
  console.log('  z-index:' + m[2] + ' -> ' + selector.slice(0,60));
}

// 3. Check illustration show/hide logic in engine
console.log('\n=== 插图显示/隐藏逻辑 ===');
const illuShow = engine.match(/illustration[\s\S]{0,300}(show|display|visible|block|active)/gi);
if (illuShow) {
  illuShow.slice(0,5).forEach(m => console.log(m.slice(0,200)));
}

// 4. Check how choices are shown
console.log('\n=== 选择显示逻辑 ===');
const choicesShow = engine.match(/showChoices[\s\S]{0,500}/);
if (choicesShow) console.log(choicesShow[0].slice(0,400));

// 5. Check illustration hide/dismiss logic
console.log('\n=== 插图自动隐藏逻辑 ===');
const illuHide = engine.match(/(illustration|illust)[\s\S]{0,200}(hide|dismiss|click|timeout|remove|fade)/gi);
if (illuHide) {
  illuHide.slice(0,5).forEach(m => console.log(m.slice(0,200)));
}

// 6. Check if illustrations overlay choices
console.log('\n=== 插图与选择的层叠 ===');
const illuClick = engine.match(/(illustrationLayer|illustCaption)[\s\S]{0,200}(click|dismiss|next|advance)/gi);
if (illuClick) {
  illuClick.slice(0,5).forEach(m => console.log(m.slice(0,200)));
}
