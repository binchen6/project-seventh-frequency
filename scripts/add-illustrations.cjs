const fs = require('fs');
const path = require('path');

const scriptPath = 'web/data/script.json';
const galleryPath = 'web/jsp/gallery.jsp';
const outDir = 'web/assets/illustrations';
const data = JSON.parse(fs.readFileSync(scriptPath, 'utf8'));

const assets = [
  {
    file: 'ch1_sc4_dock_tip.svg',
    scene: 'ch1_sc4',
    index: 3,
    caption: '顾老三的线报 - 十六铺码头雾气里的黄铜货箱',
    chapter: '第一章',
    hint: '推进顾老三的码头线报',
    title: 'DOCK TIP',
    motif: 'dock'
  },
  {
    file: 'ch1_sc5_missing_body.svg',
    scene: 'ch1_sc5',
    index: 4,
    caption: '失踪的尸体 - 验尸房白布下只剩水痕与胶片',
    chapter: '第一章',
    hint: '回到验尸房追查失踪尸体',
    title: 'MISSING BODY',
    motif: 'morgue'
  },
  {
    file: 'ch1_sc6_suzhou_dawn.svg',
    scene: 'ch1_sc6',
    index: 4,
    caption: '黎明的苏州河 - 豆腐花热气与桥的隐喻',
    chapter: '第一章',
    hint: '抵达苏州河边的黎明抉择',
    title: 'DAWN BRIDGE',
    motif: 'river'
  },
  {
    file: 'ch2_sc6_sleepers_registry.svg',
    scene: 'ch2_sc6',
    index: 2,
    caption: '沉睡者名册 - 编号、照片与被记录的人心',
    chapter: '第二章',
    hint: '发现亚美公司的沉睡者名册',
    title: 'REGISTRY',
    motif: 'registry'
  },
  {
    file: 'ch2_sc7_glass_heartbeat.svg',
    scene: 'ch2_sc7',
    index: 2,
    caption: '玻璃后的心跳 - 白若雪隔离舱里的微弱回声',
    chapter: '第二章',
    hint: '抵达隔离廊并看见白若雪',
    title: 'HEARTBEAT',
    motif: 'heartbeat'
  },
  {
    file: 'ch2_sc8_tao_invitation.svg',
    scene: 'ch2_sc8',
    index: 1,
    caption: '陶启明的邀请 - 茶杯、烟盒与博览会时间',
    chapter: '第二章',
    hint: '听完陶启明的邀请',
    title: 'INVITATION',
    motif: 'office'
  },
  {
    file: 'ch3_sc7_rain_alliance.svg',
    scene: 'ch3_sc7',
    index: 14,
    caption: '雨中的同盟 - 安全屋桌前展开的烧焦图纸',
    chapter: '第三章',
    hint: '集结同盟制定反制计划',
    title: 'ALLIANCE',
    motif: 'alliance'
  },
  {
    file: 'ch3_sc8_suzhou_broadcast.svg',
    scene: 'ch3_sc8',
    index: 13,
    caption: '苏州河试播 - 第三条波形在示波器上成形',
    chapter: '第三章',
    hint: '完成苏州河旧仓库试播',
    title: 'TEST WAVE',
    motif: 'wave'
  },
  {
    file: 'ch3_sc9_silent_registry.svg',
    scene: 'ch3_sc9',
    index: 20,
    caption: '无声名单 - 编号后第一次写下名字',
    chapter: '第三章',
    hint: '给沉睡者发送姓名锚点',
    title: 'NAMES',
    motif: 'names'
  },
  {
    file: 'ch4_sc6_ruoxue_echo.svg',
    scene: 'ch4_sc6',
    index: 2,
    caption: '白若雪的回声 - 隔离舱里传来父亲二字',
    chapter: '第四章',
    hint: '触发白若雪的回声窗口',
    title: 'RUOXUE ECHO',
    motif: 'echo'
  },
  {
    file: 'ch4_sc8_blackout_minute.svg',
    scene: 'ch4_sc8',
    index: 1,
    caption: '停电一分钟 - 黑暗里偷来的五十秒',
    chapter: '第四章',
    hint: '经历主控室停电一分钟',
    title: 'BLACKOUT',
    motif: 'blackout'
  },
  {
    file: 'ch5_sc5_institute.svg',
    scene: 'ch5_sc5',
    index: 27,
    caption: '第七频率研究所 - 木牌上的两条规矩',
    chapter: '第五章',
    hint: '抵达弦和结局的研究所尾声',
    title: 'INSTITUTE',
    motif: 'institute'
  }
];

function svg(title, motif) {
  const accent = motif === 'blackout' ? '#35d6c8' : '#d7b46a';
  const bg2 = motif === 'morgue' ? '#182027' : motif === 'river' ? '#12252a' : '#151310';
  const extra = motifShapes(motif, accent);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" role="img" aria-label="${title}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0b0908"/>
      <stop offset=".52" stop-color="${bg2}"/>
      <stop offset="1" stop-color="#24180f"/>
    </linearGradient>
    <radialGradient id="glow" cx=".5" cy=".46" r=".55">
      <stop offset="0" stop-color="${accent}" stop-opacity=".34"/>
      <stop offset=".45" stop-color="${accent}" stop-opacity=".09"/>
      <stop offset="1" stop-color="#000" stop-opacity="0"/>
    </radialGradient>
    <filter id="soft"><feGaussianBlur stdDeviation="10"/></filter>
  </defs>
  <rect width="1280" height="720" fill="url(#bg)"/>
  <rect x="28" y="28" width="1224" height="664" rx="6" fill="none" stroke="#d7b46a" stroke-opacity=".55" stroke-width="3"/>
  <rect x="52" y="52" width="1176" height="616" rx="4" fill="none" stroke="#35d6c8" stroke-opacity=".14" stroke-width="2"/>
  <path d="M84 604H1196M84 116H1196" stroke="#d7b46a" stroke-opacity=".22" stroke-width="2"/>
  <circle cx="640" cy="350" r="320" fill="url(#glow)"/>
  <g opacity=".26" stroke="#d7b46a" stroke-width="1.4">
    ${Array.from({ length: 18 }, (_, i) => `<path d="M${80 + i * 66} 92V628"/>`).join('')}
  </g>
  ${extra}
  <g font-family="Cinzel, Georgia, serif" text-anchor="middle">
    <text x="640" y="94" fill="#f4dfad" font-size="34" letter-spacing="7">${title}</text>
    <text x="640" y="636" fill="#8fe6df" font-size="18" letter-spacing="5">SEVENTH FREQUENCY ARCHIVE</text>
  </g>
  <rect width="1280" height="720" fill="#000" opacity=".12"/>
</svg>
`;
}

function motifShapes(motif, accent) {
  const commonWave = `<g fill="none" stroke="${accent}" stroke-width="4" stroke-linecap="round" opacity=".82">
    <path d="M246 380c64-86 128 86 192 0s128-86 192 0 128 86 192 0 128-86 192 0" />
    <path d="M286 430c52-54 104 54 156 0s104-54 156 0 104 54 156 0 104-54 156 0" opacity=".55"/>
  </g>`;
  const motifs = {
    dock: `<g transform="translate(230 190)">${commonWave}<path d="M80 330h680M120 286h170l58-70h230l58 70h150" fill="none" stroke="#d7b46a" stroke-width="10" stroke-linejoin="round"/><rect x="314" y="188" width="210" height="88" fill="#2f2116" stroke="#d7b46a" stroke-width="5"/><path d="M344 188v88M394 188v88M444 188v88M494 188v88" stroke="#d7b46a" stroke-opacity=".5" stroke-width="3"/></g>`,
    morgue: `<g transform="translate(302 154)"><rect x="90" y="154" width="500" height="188" rx="8" fill="#d9d4c6" opacity=".2" stroke="#e9d9b3" stroke-width="5"/><path d="M138 206c120 30 260 30 404 0v80c-138 40-270 40-404 0z" fill="#efe6d1" opacity=".34"/><path d="M338 120v300M220 418h240" stroke="${accent}" stroke-width="4"/><circle cx="340" cy="420" r="18" fill="${accent}"/><rect x="600" y="186" width="110" height="74" fill="#1d1713" stroke="#d7b46a" stroke-width="4"/></g>`,
    river: `<g transform="translate(210 172)"><path d="M80 332c130-64 260 64 390 0s260-64 390 0" fill="none" stroke="${accent}" stroke-width="8"/><path d="M126 238h240l72-88 72 88h250" fill="none" stroke="#d7b46a" stroke-width="8"/><path d="M176 238v126M706 238v126" stroke="#d7b46a" stroke-width="7"/><circle cx="438" cy="150" r="30" fill="${accent}" opacity=".7"/></g>`,
    registry: `<g transform="translate(285 130)"><rect x="0" y="0" width="710" height="442" rx="8" fill="#f3e2bb" opacity=".16" stroke="#d7b46a" stroke-width="5"/><g stroke="#d7b46a" stroke-opacity=".55" stroke-width="3">${[90,170,250,330].map(y => `<path d="M42 ${y}H668"/>`).join('')}</g><g fill="#d7b46a" opacity=".88">${[54,134,214,294].map((y,i)=>`<rect x="58" y="${y}" width="56" height="42"/><rect x="146" y="${y+8}" width="180" height="8"/><rect x="146" y="${y+26}" width="330" height="8"/><circle cx="602" cy="${y+21}" r="${14+i*2}"/>`).join('')}</g></g>`,
    heartbeat: `<g transform="translate(230 112)"><rect x="180" y="40" width="460" height="470" rx="32" fill="#83f1e8" opacity=".08" stroke="#8fe6df" stroke-width="5"/><path d="M410 130v300" stroke="#8fe6df" stroke-opacity=".32" stroke-width="3"/><path d="M110 310h180l38-70 56 144 54-104 34 30h244" fill="none" stroke="${accent}" stroke-width="8" stroke-linejoin="round"/><ellipse cx="410" cy="284" rx="76" ry="132" fill="#f4dfad" opacity=".13"/></g>`,
    office: `<g transform="translate(292 150)"><rect x="70" y="260" width="560" height="132" fill="#24170f" stroke="#d7b46a" stroke-width="6"/><ellipse cx="312" cy="240" rx="70" ry="24" fill="#b6884a" opacity=".5"/><path d="M252 236h120v46c0 28-120 28-120 0z" fill="#1b120d" stroke="#d7b46a" stroke-width="4"/><rect x="442" y="204" width="118" height="70" fill="#2a211a" stroke="#8fe6df" stroke-width="4"/><path d="M466 222h70M466 242h48" stroke="#8fe6df" stroke-width="4"/></g>`,
    alliance: `<g transform="translate(206 146)"><rect x="170" y="240" width="620" height="170" fill="#211710" stroke="#d7b46a" stroke-width="7"/><path d="M234 274l180-28 238 48-72 82-252-22z" fill="#e8d7ad" opacity=".24" stroke="#d7b46a" stroke-width="4"/><g fill="${accent}" opacity=".8">${[120,270,430,590,760].map(x=>`<circle cx="${x}" cy="206" r="38"/><path d="M${x-50} 374c22-72 78-72 100 0"/>`).join('')}</g></g>`,
    wave: `<g transform="translate(220 136)"><rect x="120" y="86" width="600" height="360" rx="18" fill="#0b1416" stroke="#8fe6df" stroke-width="5"/><path d="M168 284c60-112 120 112 180 0s120-112 180 0 120 112 180 0" fill="none" stroke="#d7b46a" stroke-width="7"/><path d="M168 322c72-42 144 42 216 0s144-42 216 0" fill="none" stroke="#8fe6df" stroke-width="5" opacity=".76"/><circle cx="408" cy="284" r="16" fill="#f4dfad"/></g>`,
    names: `<g transform="translate(304 126)"><rect x="0" y="0" width="672" height="460" fill="#efe1bd" opacity=".14" stroke="#d7b46a" stroke-width="5"/><path d="M86 118h500M86 188h500M86 258h500M86 328h500" stroke="#d7b46a" stroke-width="4" opacity=".55"/><g fill="#8fe6df">${[95,165,235,305].map((y,i)=>`<text x="110" y="${y}" font-family="monospace" font-size="34">C-${19+i*2}</text><path d="M280 ${y-10}h220" stroke="#8fe6df" stroke-width="6"/>`).join('')}</g><circle cx="552" cy="346" r="44" fill="${accent}" opacity=".65"/></g>`,
    echo: `<g transform="translate(254 110)"><rect x="266" y="62" width="300" height="470" rx="42" fill="#dff9f6" opacity=".09" stroke="#8fe6df" stroke-width="6"/><ellipse cx="416" cy="308" rx="80" ry="150" fill="#f4dfad" opacity=".12"/><circle cx="416" cy="254" r="42" fill="#f4dfad" opacity=".18"/><path d="M80 320c84-110 168 110 252 0M500 320c84-110 168 110 252 0" fill="none" stroke="${accent}" stroke-width="7" opacity=".75"/></g>`,
    blackout: `<g transform="translate(194 118)"><rect x="140" y="92" width="780" height="396" fill="#030404" stroke="#d7b46a" stroke-width="5"/><path d="M220 390h640" stroke="#8fe6df" stroke-width="6" opacity=".7"/><path d="M310 160l-60 128h96l-44 132 160-196h-98l54-64z" fill="${accent}" opacity=".88"/><g fill="#f4dfad" opacity=".52">${[560,650,740].map(x=>`<circle cx="${x}" cy="250" r="34"/><path d="M${x-42} 380c18-70 66-70 84 0"/>`).join('')}</g></g>`,
    institute: `<g transform="translate(238 120)"><path d="M110 432V176l300-104 300 104v256" fill="#19130f" stroke="#d7b46a" stroke-width="7"/><rect x="260" y="230" width="300" height="154" fill="#f2dfad" opacity=".18" stroke="#d7b46a" stroke-width="5"/><path d="M300 278h220M300 326h220" stroke="#8fe6df" stroke-width="8"/><circle cx="410" cy="160" r="34" fill="${accent}" opacity=".7"/><path d="M160 432h700" stroke="#d7b46a" stroke-width="8"/></g>`
  };
  return motifs[motif] || commonWave;
}

for (const item of assets) {
  fs.writeFileSync(path.join(outDir, item.file), svg(item.title, item.motif), 'utf8');
}

for (const item of assets) {
  const sc = data.chapters.flatMap(ch => ch.scenes).find(scene => scene.id === item.scene);
  if (!sc || !sc.dialogues?.[item.index]) throw new Error(`Missing target ${item.scene}[${item.index}]`);
  if (!sc.dialogues[item.index].illustration) {
    sc.dialogues[item.index].illustration = `assets/illustrations/${item.file}`;
  }
}
fs.writeFileSync(scriptPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');

let gallery = fs.readFileSync(galleryPath, 'utf8');
const existingSources = new Set([...gallery.matchAll(/src:'([^']+)'/g)].map(match => match[1]));
const existingScenes = new Set([...gallery.matchAll(/scene:'([^']+)'/g)].map(match => match[1]));
const newRows = assets
  .filter(item => !existingSources.has(`../assets/illustrations/${item.file}`) && !existingScenes.has(item.scene))
  .map(item => `{src:'../assets/illustrations/${item.file}',caption:'${item.caption}',chapter:'${item.chapter}',scene:'${item.scene}',hint:'${item.hint}'}`)
  .join(',\n');
gallery = gallery.replace(/const illustrations=\[[\s\S]*?\n\]/, match => {
  if (!newRows) return match;
  const body = match.replace(/^const illustrations=\[/, '').replace(/\n\]$/, '').trim();
  const rows = body ? `${body.replace(/,\s*$/, '')},\n${newRows}` : newRows;
  return `const illustrations=[\n${rows}\n]`;
});

const orderEntries = data.chapters.flatMap((ch, chIndex) => ch.scenes.map((scene, sceneIndex) => `${scene.id}:[${chIndex + 1},${sceneIndex}]`)).join(',');
gallery = gallery.replace(/const sceneOrder=\{[\s\S]*?\}/, `const sceneOrder={${orderEntries}}`);
fs.writeFileSync(galleryPath, gallery, 'utf8');

console.log(JSON.stringify({ added: assets.length, totalIllustrationRefs: data.chapters.flatMap(ch => ch.scenes).flatMap(sc => sc.dialogues || []).filter(d => d.illustration).length }, null, 2));
