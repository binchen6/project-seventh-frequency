const fs = require('fs');
const data = JSON.parse(fs.readFileSync('web/data/script.json', 'utf8'));
const scenes = data.chapters.flatMap(ch => ch.scenes);
const sc = scenes.find(item => item.id === 'ch5_sc2');
const add = [
  { speaker: null, text: '在按下任何按钮之前，沈默让每个人都说一句话。不是投票，也不是分担责任。他只是忽然觉得，如果这是最后一次选择，沉默会让机器赢得太轻易。' },
  { speaker: '陈子轩', text: '我选能让人以后还有选择的那个。哪怕它最难，哪怕我现在手还在抖。' },
  { speaker: '小翠', text: '我不懂你们那些频率。我只知道，阿生要是醒来，他肯定不愿意别人替他把一辈子都安排好。' },
  { speaker: '顾老三', text: '我这种人没资格讲大道理。可码头上有句话，过桥可以欠钱，不能欠命。欠钱能还，欠命还不起。' },
  { speaker: '白锦书', text: '我想救若雪。这个念头害了很多人。沈默，如果你最后要拦住我，就拦。别再给我体面。' },
  { speaker: '林若兰', text: '方案没有干净的。可我们至少可以把每一个风险说出来，而不是像陶启明那样，把风险藏在伟大的词后面。' },
  { speaker: '白若雪', text: '如果我还能算一个人，就让我承担我自己的那一份。别让我醒来之后，发现所有人都替我撒过谎。' },
  { speaker: null, text: '这些话一一落下，主控室里反而安静了。陶启明第一次显得多余。他一直试图替所有人解释生命，可当每个人开始说自己的话，他那套宏大的语言就失去了位置。' },
  { speaker: null, text: '沈默把手放到键盘上。现在，选择仍然沉重，却不再孤单。' },
  { speaker: null, text: '他把三个方案又看了一遍。彻底摧毁像一把干净的刀，快，准，也会切掉许多无法重来的东西。选择性剥离像在暴雨里拆一只怀表，手稳也未必能保证齿轮还认得彼此。记忆共振则像让一个活人站到桥中央，替两岸承受水声。' },
  { speaker: null, text: '没有哪条路通向纯粹的胜利。可沈默终于明白，真正的选择不是找一条没有代价的路，而是在代价面前不撒谎。' },
  { speaker: null, text: '他想起验尸房第一夜，自己在报告上写下「死因：溺水」。那时他以为文字能把死亡固定住，后来才知道，真正会固定人的不是死亡，是别人替你写好的解释。陶启明替沉睡者写了解释，白锦书替若雪写了解释，甚至沈默自己，也曾经想替死人把话说完。' },
  { speaker: null, text: '现在他不能再那样做。无论选择哪一项，都必须留下缺口，让活下来的人有权继续补写。这个缺口也许会疼，也许会让后来的日子变得不整齐，可人本来就不是整齐的实验记录。' },
  { speaker: null, text: '主控室的灯又闪了一下。远处展馆大厅里，有人还在哭，有人在喊亲人的名字，也有人因为惊吓过度而笑。那些声音穿过墙，混成一段不合拍的背景音。沈默听着它们，忽然觉得这才是世界本来的频率：杂乱、脆弱、互相干扰，却仍然活着。' },
  { speaker: null, text: '他曾经厌恶这种杂乱。验尸房里的编号、刀具、报告，让一切看起来都有位置。可今晚他终于承认，活人的位置不是被安排出来的，是在一次次争执、误会、原谅和拒绝里慢慢挤出来的。机器想删掉这些噪声，只留下纯净波形；而沈默要保住的，恰恰是这些噪声。' }
];
for (const item of add) {
  if (!sc.dialogues.some(existing => existing.text === item.text)) sc.dialogues.push(item);
}

function writeScreenplay() {
  const dialogueChars = scenes.flatMap(item => item.dialogues || []).reduce((sum, item) => sum + item.text.length, 0);
  const choices = scenes.flatMap(item => item.choices || []);
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
    for (const scene of ch.scenes) {
      out.push(`## ${scene.id}：${scene.title}`);
      out.push(`- 场景：${[scene.time, scene.weather, scene.location].filter(Boolean).join(' / ')}`);
      if (scene.bg || scene.bgm) out.push(`- 演出：背景 ${scene.bg || '无'}；音乐 ${scene.bgm || '无'}`);
      out.push('');
      for (const d of scene.dialogues || []) {
        const speaker = d.speaker || '旁白';
        const ill = d.illustration ? ` [插图：${d.illustration}]` : '';
        out.push(`**${speaker}**${ill}：${d.text}`);
        out.push('');
      }
      if (scene.choices && scene.choices.length) {
        out.push('**选择**');
        for (const c of scene.choices) {
          const effects = c.effects ? ` 数值：${JSON.stringify(c.effects)}` : '';
          const condition = c.condition ? ` 条件：${JSON.stringify(c.condition)}` : '';
          const flag = c.flag ? ` 标记：${c.flag}` : '';
          out.push(`- ${c.text} -> ${c.nextScene || '下一场'}${effects}${condition}${flag}`);
          if (c.feedback) out.push(`  反馈：${c.feedback.title}，${c.feedback.body}（${c.feedback.detail}）`);
        }
        out.push('');
      }
    }
  }
  fs.writeFileSync('screenplay/screenplay.md', `${out.join('\n')}\n`, 'utf8');
  return dialogueChars;
}

fs.writeFileSync('web/data/script.json', `${JSON.stringify(data, null, 2)}\n`, 'utf8');
const dialogueChars = writeScreenplay();
console.log(JSON.stringify({ dialogueChars, estimatedReadingMinutes: Math.round(dialogueChars / 280) }, null, 2));
