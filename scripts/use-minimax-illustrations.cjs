const fs = require('fs');

const scriptPath = 'web/data/script.json';
const galleryPath = 'web/jsp/gallery.jsp';
const screenplayPath = 'screenplay/screenplay.md';

const replacements = {
  'assets/illustrations/ch1_sc4_dock_tip.svg': 'assets/illustrations/minimax/ch1_sc4_dock_tip.png',
  'assets/illustrations/ch1_sc5_missing_body.svg': 'assets/illustrations/minimax/ch1_sc5_missing_body.png',
  'assets/illustrations/ch2_sc6_sleepers_registry.svg': 'assets/illustrations/minimax/ch2_sc6_sleepers_registry.png',
  'assets/illustrations/ch2_sc7_glass_heartbeat.svg': 'assets/illustrations/minimax/ch2_sc7_glass_heartbeat.png',
  'assets/illustrations/ch3_sc7_rain_alliance.svg': 'assets/illustrations/minimax/ch3_sc7_rain_alliance.png',
  'assets/illustrations/ch3_sc8_suzhou_broadcast.svg': 'assets/illustrations/minimax/ch3_sc8_suzhou_broadcast.png',
  'assets/illustrations/ch4_sc6_ruoxue_echo.svg': 'assets/illustrations/minimax/ch4_sc6_ruoxue_echo.png',
  'assets/illustrations/ch4_sc8_blackout_minute.svg': 'assets/illustrations/minimax/ch4_sc8_blackout_minute.png'
};

const data = JSON.parse(fs.readFileSync(scriptPath, 'utf8'));
for (const sc of data.chapters.flatMap(ch => ch.scenes)) {
  for (const d of sc.dialogues || []) {
    if (replacements[d.illustration]) d.illustration = replacements[d.illustration];
  }
}
fs.writeFileSync(scriptPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');

let gallery = fs.readFileSync(galleryPath, 'utf8');
for (const [from, to] of Object.entries(replacements)) {
  gallery = gallery.replaceAll(`../${from}`, `../${to}`);
}
fs.writeFileSync(galleryPath, gallery, 'utf8');

function regenerateScreenplay() {
  const scenes = data.chapters.flatMap(ch => ch.scenes);
  const dialogueChars = scenes.flatMap(sc => sc.dialogues || []).reduce((sum, item) => sum + item.text.length, 0);
  const choices = scenes.flatMap(sc => sc.choices || []);
  const out = [];
  out.push('# 第七频率 —— 视觉小说完整剧本');
  out.push('');
  out.push('> 本剧本文档由 `web/data/script.json` 同步生成，网页脚本为可游玩的权威数据源。');
  out.push(`> 当前对白约 ${dialogueChars} 字，选择 ${choices.length} 个，条件/特殊选项 ${choices.filter(item => item.condition || item.special).length} 个。按视觉小说 280 字/分钟估算，正文阅读约 ${Math.round(dialogueChars / 280)} 分钟；结合选择、回看、存读档、插图和演出停顿，单周目目标时长超过 2 小时。`);
  out.push('');
  for (const ch of data.chapters) {
    out.push(`# ${ch.id.toUpperCase()}：${ch.title}`);
    if (ch.date || ch.location) out.push(`- 时间/地点：${[ch.date, ch.location].filter(Boolean).join(' / ')}`);
    out.push('');
    for (const sc of ch.scenes) {
      out.push(`## ${sc.id}：${sc.title}`);
      out.push(`- 场景：${[sc.time, sc.weather, sc.location].filter(Boolean).join(' / ')}`);
      if (sc.bg || sc.bgm) out.push(`- 演出：背景 ${sc.bg || '无'}；音乐 ${sc.bgm || '无'}`);
      out.push('');
      for (const d of sc.dialogues || []) {
        out.push(`**${d.speaker || '旁白'}**${d.illustration ? ` [插图：${d.illustration}]` : ''}：${d.text}`);
        out.push('');
      }
      if (sc.choices && sc.choices.length) {
        out.push('**选择**');
        for (const c of sc.choices) {
          out.push(`- ${c.text} -> ${c.nextScene || '下一场'}${c.effects ? ` 数值：${JSON.stringify(c.effects)}` : ''}${c.condition ? ` 条件：${JSON.stringify(c.condition)}` : ''}${c.flag ? ` 标记：${c.flag}` : ''}`);
          if (c.feedback) out.push(`  反馈：${c.feedback.title}，${c.feedback.body}（${c.feedback.detail}）`);
        }
        out.push('');
      }
    }
  }
  fs.writeFileSync(screenplayPath, `${out.join('\n')}\n`, 'utf8');
}

regenerateScreenplay();

console.log(JSON.stringify({ replaced: Object.keys(replacements).length }, null, 2));
