const fs = require('fs');

const scriptPath = 'web/data/script.json';
const screenplayPath = 'screenplay/screenplay.md';
const data = JSON.parse(fs.readFileSync(scriptPath, 'utf8'));

const line = (speaker, text, extra = {}) => ({ speaker, text, ...extra });
const choice = (id, text, effects, nextScene, extra = {}) => ({ id, text, effects, nextScene, ...extra });
const scenes = () => data.chapters.flatMap(ch => ch.scenes);
const scene = id => scenes().find(sc => sc.id === id);
const chapter = id => data.chapters.find(ch => ch.id === id);
const setAllChoicesNext = (id, next) => {
  for (const item of scene(id).choices || []) item.nextScene = next;
};

const labels = { INTEL: '推理', DRAMA: '人心', ACTION: '行动', TECH: '技术', CLUE: '线索', ZHOU: '弦外', lin_ruolan: '若兰', chen_zixuan: '子轩', gu_laosan: '老三', xiao_cui: '小翠', bai_jinshu: '白锦书' };
const bodies = {
  intel: '沈默把细节压进案卷边缘，下一次推理会从这里回头。',
  drama: '这句话没有立刻改变局面，却改变了某个人看你的方式。',
  action: '行动让时间向前滚了一格，危险也跟着贴近。',
  tech: '机器的误差被修正了一点，频率里的暗门也露出一条缝。',
  special: '条件达成后才出现的暗线被触发，后续剧情会记住这次回声。'
};
function tone(item) {
  if (item.special) return 'special';
  const e = item.effects || {};
  if (e.TECH) return 'tech';
  if (e.ACTION) return 'action';
  if (e.DRAMA) return 'drama';
  return 'intel';
}
function feedback(item) {
  const t = tone(item);
  const detail = Object.entries(item.effects || {}).filter(([, v]) => v).map(([k, v]) => `${labels[k] || k}${v > 0 ? '+' : ''}${v}`).join(' / ') || '剧情推进';
  return { title: t === 'special' ? '隐藏脉冲' : '决策反馈', body: bodies[t], detail, tone: t };
}
function addFeedback(sc) {
  for (const item of sc.choices || []) item.feedback = feedback(item);
  return sc;
}

if (!scene('ch2_sc8')) {
  setAllChoicesNext('ch2_sc7', 'ch2_sc8');
  chapter('ch2').scenes.push(addFeedback({
    id: 'ch2_sc8',
    title: '陶启明的邀请',
    time: '1931.10.22 03:04',
    weather: '地下',
    location: '亚美公司会客室',
    bg: 'bg_office.jpg',
    bgm: 'bgm_suspense.mp3',
    dialogues: [
      line(null, '会客室比实验室更让人不安。实验室至少承认自己在切割和测量，会客室却摆着沙发、茶具和一幅山水画，仿佛刚才那些沉睡者只是楼下的噪声。'),
      line(null, '陶启明亲自给沈默倒茶。杯沿薄得像一片骨，茶水里浮着两根舒展不开的叶梗。'),
      line('陶启明', '沈先生，我年轻时也学过医。那时我相信医生是最接近神的人，因为你们被允许宣布结束。'),
      line('沈默', '我宣布的是结果，不是命令。'),
      line('陶启明', '可结果总有人不服。父亲不服，爱人不服，国家也不服。一个民族被打到快断气时，难道不该有人研究怎样让它重新醒来？'),
      line(null, '他说到国家时，语气很轻，像给毒药外面裹了一层糖衣。沈默见过这种说法，报纸社论里常有，巡捕房训话里也有。把具体的人挪开，剩下的大词就会显得干净。'),
      line('沈默', '名册上那个十七岁的男孩，也代表民族？'),
      line('陶启明', '他代表未来。'),
      line('沈默', '他姐姐只知道他叫阿生。'),
      line(null, '陶启明的手停在茶壶上方。停顿极短，却足够让沈默看见他眼底的不耐。'),
      line('陶启明', '人总要学会舍小名而取大名。'),
      line('沈默', '死人没有大名小名。他们只剩别人怎么记。'),
      line(null, '白锦书站在门边，像一件被雨淋湿又强行挂直的外套。陶启明不看他，却每句话都在敲他。'),
      line('陶启明', '白督察懂我。若雪若能醒来，牺牲就不是牺牲，是代价。'),
      line('白锦书', '别把若雪放进你的句子里。'),
      line(null, '这是白锦书今晚第一次顶撞陶启明。声音不大，却让会客室里的空气变了。'),
      line('陶启明', '你看，沈先生。父亲的爱最不稳定。它能让人高尚，也能让人背叛。'),
      line(null, '沈默看见桌上的烟盒。烟盒底下压着一张小纸，露出半截数字：24，19:30，主展馆。陶启明也许是故意让他看见，也许是太自信。两者都危险。'),
      line('陶启明', '我请你加入，不是因为我缺人。我只是觉得，你比他们更懂死人。等博览会之后，你会有一间真正的实验室。'),
      line('沈默', '里面躺着谁？'),
      line('陶启明', '先躺着过去。然后躺着未来。'),
      line(null, '茶凉了。沈默没有碰杯。他知道，自己接下来不管说什么，都只是为了活着走出这间屋。'),
      line(null, '门外传来三短一长的敲击声。不是巡捕房暗号，是陈子轩教过他的测试节拍。有人在外面，或者有一台机器替人敲门。')
    ],
    choices: [
      choice('ch2_c8_a', '「假意接受邀请，换取更多博览会情报。」', { INTEL: 10, DRAMA: 5 }, 'ch3_sc1', { flag: 'tao_invitation' }),
      choice('ch2_c8_b', '「盯住烟盒下的纸，记下主展馆时间。」', { INTEL: 10, CLUE: 1 }, 'ch3_sc1', { flag: 'expo_time_seen' }),
      choice('ch2_c8_c', '「回应白锦书，让他知道自己仍能拒绝陶启明。」', { DRAMA: 10, bai_jinshu: 10 }, 'ch3_sc1'),
      choice('ch2_c8_special_morse', '「按三短一长回敲，确认外面的信号源。」', { TECH: 5, CLUE: 2 }, 'ch3_sc1', {
        condition: { params: { TECH: { min: 30 } } },
        special: true,
        flag: 'answered_knock'
      })
    ]
  }));
}

if (!scene('ch3_sc9')) {
  setAllChoicesNext('ch3_sc8', 'ch3_sc9');
  chapter('ch3').scenes.push(addFeedback({
    id: 'ch3_sc9',
    title: '无声名单',
    time: '1931.10.23 04:18',
    weather: '黎明前',
    location: '旧仓库阁楼',
    bg: 'bg_radio_room.jpg',
    bgm: 'bgm_ambient.mp3',
    dialogues: [
      line(null, '试播结束后，没有人立刻睡觉。机器安静下来，人的心反而开始吵。'),
      line(null, '小翠把从名册上记下的编号写在账本背面，一行一行，字比平时慢得多。她写到C-21时停住，笔尖在纸上洇出一个黑点。'),
      line('小翠', '我弟弟原来最怕打针。小时候发烧，邻居大夫一进门，他就钻床底。现在倒好，被人贴满电极还没法骂人。'),
      line('顾老三', '等救出来，让他骂。骂我也行，我不还嘴。'),
      line('小翠', '你少占便宜。他骂人很贵的。'),
      line(null, '他们笑了一下，笑声刚出来就散。'),
      line(null, '林若兰拿过账本，把每个编号后面补上可能的状态：药物诱导、频率锁定、传输失败、可唤醒。她写得冷静，可写到一半，手背那道疤又红起来。'),
      line('林若兰', '不是所有人都能救回来。你们要先知道这一点。'),
      line('沈默', '知道，不等于接受。'),
      line('林若兰', '沈默，医学里有时候接受比治疗更难。'),
      line('沈默', '那是病人死后。现在他们还在说话。'),
      line(null, '陈子轩忽然抬头，指着收音机。喇叭里没有语音，只有很轻的电流声，但电流声按着某种节奏起伏。'),
      line('陈子轩', '像名单。不是读名字，是读编号。'),
      line(null, '他把节奏抄下来，和小翠账本上的编号对照。C-19，C-21，B-07，A-3。每个编号后面都有一段短促的空白，像有人在等回应。'),
      line('小翠', '他们听得见我们？'),
      line('林若兰', '也许不是听见，是共振。我们打开回声窗口后，他们的信号短暂漏出来了。'),
      line('沈默', '那就回他们。'),
      line('陈子轩', '回什么？'),
      line(null, '沈默看向账本。名字不全，编号太冷。可人活着，总该先被叫作人。'),
      line('沈默', '告诉他们，今晚有人来。'),
      line(null, '陈子轩调低功率。小翠把账本摊开，顾老三把仓库门关严，林若兰按住表盘。沈默对着话筒，一字一句地发出那段几乎听不见的消息。'),
      line('沈默', 'C-19，C-21，B-07，A-3。这里是上海。这里有人听见你们。等到今晚，不要跟着7830Hz走。跟着自己的名字走。'),
      line(null, '喇叭沉默很久。然后，电流里响起一串杂乱的短音。不是回答，更像一群人在黑暗里同时抬头。'),
      line(null, '小翠低下头，把阿生的名字写在C-21后面。她写得很重，纸背都凸起来。'),
      line('小翠', '这次不写编号了。')
    ],
    choices: [
      choice('ch3_c9_a', '「把无声名单做成救援优先序。」', { INTEL: 10, CLUE: 2 }, 'ch4_sc1', { flag: 'silent_registry' }),
      choice('ch3_c9_b', '「让小翠保管名单，她记得每个名字。」', { DRAMA: 5, xiao_cui: 15 }, 'ch4_sc1'),
      choice('ch3_c9_c', '「让陈子轩把回应频段写进原型机。」', { TECH: 10, chen_zixuan: 5 }, 'ch4_sc1'),
      choice('ch3_c9_special_names', '「逐个发送名字，而不是编号。」', { DRAMA: 10, CLUE: 1 }, 'ch4_sc1', {
        condition: { params: { DRAMA: { min: 35 }, CLUE: { min: 6 } } },
        special: true,
        flag: 'sent_names'
      })
    ]
  }));
}

if (!scene('ch4_sc8')) {
  setAllChoicesNext('ch4_sc7', 'ch4_sc8');
  chapter('ch4').scenes.push(addFeedback({
    id: 'ch4_sc8',
    title: '停电一分钟',
    time: '1931.10.24 19:41',
    weather: '地下',
    location: '主控室',
    bg: 'bg_lab.jpg',
    bgm: 'bgm_action.mp3',
    dialogues: [
      line(null, '主控室门打开后，林若兰做了一个所有人都没预料到的决定。她拉下了总闸。'),
      line(null, '展馆停电一分钟。上方大厅骤然陷入黑暗，惊呼声像潮水一样压下来。地下的机器也短暂失明，只剩备用电容一闪一闪。'),
      line('陈子轩', '若兰姐！总闸会让抵消波也断掉！'),
      line('林若兰', '所以只有一分钟。机器重启要六十秒，人反应过来要十秒。我们偷中间那五十秒。'),
      line(null, '黑暗里，陶启明笑了。'),
      line('陶启明', '我教过你。停电不是终止，是重启。'),
      line('林若兰', '你也教过我，重启时系统最脆。'),
      line(null, '她把手电咬在嘴里，跪到控制台下方拆线。陈子轩立刻跟上，沈默守在门边，白锦书把枪口压低，不再对着人，而是对着那只备用电容箱。'),
      line(null, '上方大厅没有灯，小翠的声音却从扩音系统残余的线路里传来。她开始唱歌。没有乐队，只有她一个人，唱得很稳。'),
      line('小翠', '她在拖住人群。'),
      line('顾老三', '也在拖住她自己。她怕黑。'),
      line(null, '沈默不知道顾老三怎么知道的。也许码头上的人就是这样，用玩笑记住别人的害怕。'),
      line(null, '三十秒。陈子轩找到备用触发线，线皮是红色的，和设计图不一样。'),
      line('陈子轩', '他改过！剪红线会直接触发唤醒。'),
      line('林若兰', '那就不剪。桥接过去，让它以为自己已经触发。'),
      line('沈默', '骗机器？'),
      line('林若兰', '机器比人好骗。它至少相信规则。'),
      line(null, '四十秒。陶启明忽然冲向白若雪的隔离舱。白锦书举枪，却没开。那一瞬间，沈默知道他不是犹豫杀陶启明，而是怕枪声惊动女儿。'),
      line(null, '沈默扑过去，把陶启明按在地上。陶启明的手指已经碰到舱门边缘，指甲在金属上划出刺耳的声响。'),
      line('陶启明', '你们救不了所有人！'),
      line('沈默', '那就从不让你继续害人开始。'),
      line(null, '五十五秒。林若兰完成桥接，陈子轩推上辅助电源。抵消波没有完全恢复，却在黑暗里亮起一条窄窄的通路。'),
      line(null, '六十秒。展馆重新亮起。掌声、哭声、咒骂声从上方混在一起。很多人以为这只是博览会的演出事故。只有地下的人知道，他们刚从一场集体死亡里抢回一分钟。'),
      line(null, '而这一分钟，足够把陶启明逼进最后的真相。')
    ],
    choices: [
      choice('ch4_c8_a', '「保护林若兰完成桥接。」', { ACTION: 10, lin_ruolan: 10 }, 'ch5_sc1'),
      choice('ch4_c8_b', '「协助陈子轩保存重启日志。」', { TECH: 10, CLUE: 1 }, 'ch5_sc1'),
      choice('ch4_c8_c', '「让白锦书守住隔离舱，不再守住陶启明。」', { DRAMA: 10, bai_jinshu: 10 }, 'ch5_sc1'),
      choice('ch4_c8_special_blackout', '「利用停电的一分钟，发送沉睡者姓名锚点。」', { TECH: 5, DRAMA: 5, CLUE: 2 }, 'ch5_sc1', {
        condition: { flag: 'sent_names' },
        special: true,
        flag: 'blackout_names'
      })
    ]
  }));
}

function regenerateScreenplay() {
  const dialogueChars = scenes().flatMap(sc => sc.dialogues || []).reduce((sum, item) => sum + item.text.length, 0);
  const choiceCount = scenes().flatMap(sc => sc.choices || []).length;
  const specialCount = scenes().flatMap(sc => sc.choices || []).filter(item => item.condition || item.special).length;
  const out = [];
  out.push('# 第七频率 —— 视觉小说完整剧本');
  out.push('');
  out.push('> 本剧本文档由 `web/data/script.json` 同步生成，网页脚本为可游玩的权威数据源。');
  out.push(`> 当前对白约 ${dialogueChars} 字，选择 ${choiceCount} 个，条件/特殊选项 ${specialCount} 个。按视觉小说 280 字/分钟估算，正文阅读约 ${Math.round(dialogueChars / 280)} 分钟；结合选择、回看、存读档、插图和演出停顿，单周目目标时长超过 2 小时。`);
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
        const speaker = d.speaker || '旁白';
        const ill = d.illustration ? ` [插图：${d.illustration}]` : '';
        out.push(`**${speaker}**${ill}：${d.text}`);
        out.push('');
      }
      if (sc.choices && sc.choices.length) {
        out.push('**选择**');
        for (const item of sc.choices) {
          const conditions = item.condition ? ` 条件：${JSON.stringify(item.condition)}` : '';
          const effects = item.effects ? ` 数值：${JSON.stringify(item.effects)}` : '';
          const flag = item.flag ? ` 标记：${item.flag}` : '';
          out.push(`- ${item.text} -> ${item.nextScene || '下一场'}${effects}${conditions}${flag}`);
          if (item.feedback) out.push(`  反馈：${item.feedback.title}，${item.feedback.body}（${item.feedback.detail}）`);
        }
        out.push('');
      }
    }
  }
  fs.writeFileSync(screenplayPath, `${out.join('\n')}\n`, 'utf8');
  return { dialogueChars, choiceCount, specialCount };
}

fs.writeFileSync(scriptPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
const metrics = regenerateScreenplay();
console.log(JSON.stringify({
  scenes: scenes().length,
  choices: metrics.choiceCount,
  specialChoices: metrics.specialCount,
  dialogueChars: metrics.dialogueChars,
  estimatedReadingMinutes: Math.round(metrics.dialogueChars / 280)
}, null, 2));
