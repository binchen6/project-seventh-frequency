const fs = require('fs');

const scriptPath = 'web/data/script.json';
const screenplayPath = 'screenplay/screenplay.md';
const data = JSON.parse(fs.readFileSync(scriptPath, 'utf8'));
const scenes = () => data.chapters.flatMap(ch => ch.scenes);
const scene = id => scenes().find(sc => sc.id === id);
const line = (speaker, text, extra = {}) => ({ speaker, text, ...extra });

const additions = {
  ch5_sc3: [
    line(null, '弦断后的第七天，巡捕房把所有能找到的亚美公司档案封存。封条贴上去时很响，像给一段时代盖棺。沈默站在门口，看他们把名册、图纸、烧坏的真空管一箱一箱搬走。'),
    line(null, '小翠没有来。她托顾老三带来一张纸，上面只有阿生两个字。顾老三说她在纺织厂上夜班，机器太吵，刚好听不见自己哭。'),
    line('顾老三', '她让我问你，C-21那一栏，能不能别写失败。'),
    line('沈默', '写失踪。'),
    line('顾老三', '失踪也不好听。'),
    line('沈默', '可失踪的人还有回家的路。'),
    line(null, '后来沈默把那张纸夹进诊所的账本。有人赊药，他就在阿生名字下面添一笔。账本越来越厚，那个名字却一直留在第一页。'),
    line(null, '白若雪恢复得很慢。她学走路，学认字，学重新使用筷子。白锦书每天陪她，从一个威严的督察变成一个笨拙的父亲。沈默偶尔去复诊，听见若雪问：「爸爸，你以前是不是很凶？」白锦书说：「是。」若雪又问：「那你以后还凶吗？」白锦书沉默很久，说：「尽量不了。」'),
    line(null, '这一句尽量，沈默记了很久。人能给出的保证，有时也只能到尽量为止。'),
    line(null, '冬天真正来临时，苏州河上的雾比往年浓。沈默的诊所开到很晚，门口挂着一只小灯泡。灯泡不亮堂，只够照清门牌，但夜里有人发烧、咳血、被码头货箱砸伤，总能顺着那点光找来。'),
    line(null, '他不再碰第七频率。可每逢雨夜，收音机会自己飘出一点杂音。他知道那也许只是潮气，也许是线路老化。可他仍会停下笔，听一会儿。'),
    line(null, '如果声音下面还有声音，至少这一次，他愿意慢慢听。')
  ],
  ch5_sc4: [
    line(null, '弦鸣后的上海没有立刻变好。报纸只说万国博览会发生电力事故，亚美公司因违规试验被查封。真正的名单被白锦书藏起来，副本交给沈默。'),
    line(null, '白若雪醒来后，记忆像多层唱片。有时她能清楚说出大学宿舍窗外的树，有时又会突然背出陶启明二十年前的实验参数。她讨厌这种失控，却没有逃避。'),
    line('白若雪', '如果这些记忆留在我这里，那我就要知道它们害过谁。'),
    line(null, '她和沈默一起整理沉睡者名册。每找到一个幸存者，她就在名字旁边画一个小点。每确认一个无法唤醒的人，她画一条横线。小点和横线越来越多，纸面像一张陌生星图。'),
    line(null, '陶启明在狱中写了三封信。第一封给白若雪，第二封给林若兰，第三封没有收信人。白若雪只读了第一封的开头，便把信折回去。'),
    line('白若雪', '他说他爱真理。可真理不需要别人被绑在手术台上替它证明。'),
    line(null, '林若兰读完第二封，把信烧了。火苗很小，她盯着它看了很久。沈默没有问内容。她最后只说：「他到死都觉得自己孤独得有道理。」'),
    line(null, '陈子轩后来把选择性剥离的算法改成医疗设备，用来帮助战争伤员恢复创伤后的语言能力。每次有人问他灵感来自哪里，他都说：「来自一次差点毁掉上海的错误。」'),
    line(null, '沈默偶尔收到白若雪的信。信里有时夹着一张图纸，有时是一片异国树叶。她说自己还会梦见陶启明的实验室，但醒来后会先确认自己的手，再确认窗外的天。'),
    line(null, '弦鸣不是胜利的声音，更像受伤的弦还在坚持震动。它提醒活下来的人：被救回来的生命，也需要很久很久，才能真正回到自己身上。')
  ],
  ch5_sc5: [
    line(null, '弦和之后，研究所第一条规矩写在门口：任何实验，必须由受试者本人签字。第二条规矩是小翠加的：看不懂字的人，要念给他听，念到他真的懂。'),
    line(null, '这两条规矩让很多赞助人皱眉。有人说你们太慢，有人说科学不能被情绪拖住。林若兰每次都回答：太快的科学，容易把人甩下去。'),
    line(null, '白若雪加入研究所时，带来一只小箱子。里面是她三年沉睡前的课堂笔记，纸页已经发黄。她把笔记摊在桌上，说要从头补起。陈子轩想安慰她，她反倒先笑。'),
    line('白若雪', '别露出那种表情。你们只是比我多过了三年，又不是多活了一辈子。'),
    line(null, '顾老三负责接送病人。他的黄包车后面加了软垫，车铃坏了也不修，说这样病人不会被吓到。小翠管账，账本分三栏：能付、暂欠、以后再说。第三栏永远最长。'),
    line(null, '周老板偶尔来送豆腐花，从不进实验室。他坐在门口晒太阳，看年轻人抱着线圈跑来跑去，嘴上嫌吵，眼里却有一点藏不住的安静。'),
    line(null, '林若兰脑中的陶启明碎片并非完全沉默。有时她会在推导公式时写出不属于自己的笔迹。她不再害怕，只把那一页撕下来，夹进锁着的档案袋。'),
    line('林若兰', '我们不否认阴影。我们只是不给它钥匙。'),
    line(null, '1937年撤离时，研究所只带走三样东西：原型机、名册、门口那块写着两条规矩的木牌。沈默背着木牌走了很久，雨水把字泡得发胀，他就停下来重新描一遍。'),
    line(null, '多年后，弦和问父亲，为什么那块旧木牌一直挂在家里。沈默想了想，说：「因为我们当年差点忘了，人不是为了证明什么才活着。」'),
    line(null, '弦和没有完全懂。但她记住了。很多重要的事，都是先记住，很多年后才懂。')
  ],
  ch5_sc6: [
    line(null, '弦外的真相没有改变已经发生的事，却改变了沈默回忆父亲的方式。过去那些沉默、那些修了一半就锁起来的机器、那些不许他靠近的抽屉，忽然都有了声音。'),
    line(null, '他回到旧屋，在阁楼梁上找到一只铁盒。盒子生锈，锁却很新。沈默用父亲教过他的办法撬开，里面没有公式，只有一叠病历和一封没寄出的信。'),
    line(null, '信是沈怀瑾写给周老板的。字迹稳，末尾却有一处墨点，像写信的人停笔太久。'),
    line('沈怀瑾', '频率若被当作桥，就要有人守桥。若被当作武器，就要有人拆桥。我怕默儿继承我的手，也怕他继承我的错。'),
    line(null, '沈默读到这里，才明白父亲并非不信任他，而是太清楚这项发现会怎样改变一个人看世界的方式。能听见第二层声音的人，很容易以为自己有资格替所有沉默的人说话。'),
    line(null, '周老板后来承认，那颗玻璃珠不是偶然落到死者舌下。那是沈怀瑾当年留下的共振珠，一共七颗。陶启明偷走六颗，最后一颗辗转到了那个无线电工手里。'),
    line('周老板', '他不是第一个死的人。但他是第一个想把桥还回来的人。'),
    line(null, '沈默把铁盒合上，没有把信带走。他只取出一张父亲年轻时画的桥。桥下不是河，是一排波形。桥两端写着两个字：生者，亡者。'),
    line(null, '隐藏结局之后，故事并没有结束。第七频率真正的源头被打开，陶启明只是其中一个背叛者。还有六颗珠子，六段被偷走的频率，六个可能已经藏进上海的人。'),
    line(null, '沈默走出旧屋时，天色很晚。弄堂里有人收衣服，有人骂孩子，有人把收音机调到戏曲频道。所有声音混在一起，平凡得几乎奢侈。'),
    line(null, '他把父亲那张桥图折好，放进口袋。桥是危险的，但总有人要过河。下一次，他不会只带一把解剖刀。')
  ]
};

for (const [id, lines] of Object.entries(additions)) {
  const target = scene(id);
  if (!target) throw new Error(`Missing scene ${id}`);
  if (!target.dialogues.some(item => item.text === lines[0].text)) target.dialogues.push(...lines);
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
