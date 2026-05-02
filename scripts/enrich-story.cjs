const fs = require('fs');

const scriptPath = 'web/data/script.json';
const screenplayPath = 'screenplay/screenplay.md';

const data = JSON.parse(fs.readFileSync(scriptPath, 'utf8'));

const scene = id => {
  for (const chapter of data.chapters) {
    const found = chapter.scenes.find(item => item.id === id);
    if (found) return found;
  }
  throw new Error(`Scene not found: ${id}`);
};

const chapter = id => {
  const found = data.chapters.find(item => item.id === id);
  if (!found) throw new Error(`Chapter not found: ${id}`);
  return found;
};

const line = (speaker, text, extra = {}) => ({ speaker, text, ...extra });
const choice = (id, text, effects, nextScene, extra = {}) => ({
  id,
  text,
  effects,
  nextScene,
  ...extra
});

const effectLabels = {
  INTEL: '推理',
  DRAMA: '人心',
  ACTION: '行动',
  TECH: '技术',
  CLUE: '线索',
  ZHOU: '弦外',
  lin_ruolan: '若兰',
  chen_zixuan: '子轩',
  gu_laosan: '老三',
  xiao_cui: '小翠',
  bai_jinshu: '白锦书'
};

const toneTitles = {
  intel: '推理入档',
  drama: '人心回响',
  action: '行动推进',
  tech: '技术校准',
  clue: '线索入档',
  special: '隐藏脉冲',
  lin_ruolan: '若兰记住了',
  chen_zixuan: '子轩记住了',
  gu_laosan: '老三记住了',
  xiao_cui: '小翠记住了',
  bai_jinshu: '白锦书记住了',
  zhou: '弦外回声'
};

const toneBodies = {
  intel: '沈默把这个判断压进案卷边角，后面的推理会沿着这条线继续收束。',
  drama: '一句话改变了在场人的距离，有些信任不是当场开口，却会在后面回头。',
  action: '你把局面往前推了一步，风险也随脚步声一起靠近。',
  tech: '频率、线路和误差被重新校准，下一次面对机器时会多一点把握。',
  clue: '新的细节被写入案卷，等到真相合拢时，它会露出该有的位置。',
  special: '只有在当前数值足够时才会出现的选择被触发，故事的暗线向前亮了一瞬。',
  lin_ruolan: '林若兰没有立刻回应，但她把这句话收进了心里。',
  chen_zixuan: '陈子轩的眼神稳了一些，他开始相信自己不是被卷进来，而是在选择留下。',
  gu_laosan: '顾老三嘴上不认，手里的烟却停了一下。他欠下的人情又重了些。',
  xiao_cui: '小翠用玩笑遮住了认真，可她已经决定多递一条路给你。',
  bai_jinshu: '白锦书的沉默比回答更重，他开始重新衡量你站在何处。',
  zhou: '周老板藏了很久的旧账，被你敲出一声极轻的回音。'
};

function inferTone(item) {
  if (item.special) return 'special';
  const effects = { ...(item.effects || {}), ...(item.affection || {}) };
  const keys = Object.keys(effects);
  const affection = keys.find(key => ['lin_ruolan', 'chen_zixuan', 'gu_laosan', 'xiao_cui', 'bai_jinshu'].includes(key) && effects[key] > 0);
  if (affection) return affection;
  if (effects.TECH) return 'tech';
  if (effects.ACTION) return 'action';
  if (effects.DRAMA) return 'drama';
  if (effects.CLUE) return 'clue';
  if (effects.ZHOU) return 'zhou';
  return 'intel';
}

function makeFeedback(item) {
  const tone = inferTone(item);
  const effects = { ...(item.effects || {}), ...(item.affection || {}) };
  const detail = Object.entries(effects)
    .filter(([, value]) => Number(value) !== 0)
    .map(([key, value]) => `${effectLabels[key] || key}${value > 0 ? '+' : ''}${value}`)
    .join(' / ');
  return {
    title: toneTitles[tone] || '决策反馈',
    body: toneBodies[tone] || '选择已经写入案卷，后续分支会记住这次判断。',
    detail: detail || (item.flag ? `标记：${item.flag}` : '剧情推进'),
    tone
  };
}

function setAllChoicesNext(sceneId, nextScene) {
  const target = scene(sceneId);
  for (const item of target.choices || []) item.nextScene = nextScene;
}

function replaceBadLines() {
  scene('ch1_sc3').dialogues[1] = line(null, '清晨的巡捕房还没完全醒，走廊里只有擦地水和廉价烟草的味道。白锦书的门半掩着，里面的台灯亮了一夜。', {
    illustration: 'assets/illustrations/ch1_sc3_shikumen.svg'
  });
  scene('ch2_sc2').dialogues[2] = line(null, '那只接收器像一颗被拆开的心脏，线圈和真空管一起发热。7830Hz的细线在示波器上跳动，像有人在黑暗里敲门。', {
    illustration: 'assets/illustrations/ch2_sc2_receiver.svg'
  });
  scene('ch3_sc3').dialogues[1] = line(null, '十六铺码头雾气很重，煤油灯被风吹得一明一暗。顾老三被两个打手按在货箱后面，嘴角裂着血，鞋跟还死死踩着一张湿透的纸。', {
    illustration: 'assets/illustrations/ch3_sc3_dock.png'
  });
  scene('ch4_sc4').dialogues[2] = line(null, '机房外廊贴着白瓷砖，瓷缝里积着灰。墙那边传来低频嗡鸣，像整座展馆都在屏住呼吸。', {
    illustration: 'assets/illustrations/ch4_sc4_transmitter.svg'
  });
  scene('ch5_sc1').dialogues[1] = line(null, '隔离舱里没有哭声，只有仪表针细细颤动。白若雪的名字贴在玻璃下角，墨迹被消毒水泡淡，像快要从世界上褪掉。', {
    illustration: 'assets/illustrations/ch5_sc1_false_death.svg'
  });
}

function repairSpecialChoices() {
  const changes = {
    ch2_c2_special_intel: '「把A-7的脉冲矩阵重排。7830Hz不是频率，是坐标。」',
    ch2_c5_special_tech: '「先稳住接收腔，别让7830Hz反向灼伤神经。」',
    ch3_c3_special_action: '「从码头水线撤退，借货船的汽笛压住枪声。」',
    ch3_c4_special_clue: '「把她说的三年前事故，和唱片第二层音轨对上。」',
    ch4_c2_special_drama: '「把若雪的录音放给白锦书听。」',
    ch4_c5_special_tech: '「用跳频抵消7830Hz，切断备用发射器的同步。」',
    ch5_c2_special_drama: '「把真相公开，让白若雪自己成为证词。」',
    ch5_c2_special_action: '「冲进核心室，手动拔掉陶启明的主控。」',
    ch5_c2_special_tech: '「重写最后一段回声，把陶启明的数据导入空白唱片。」'
  };
  for (const chapterData of data.chapters) {
    for (const sceneData of chapterData.scenes) {
      for (const item of sceneData.choices || []) {
        if (changes[item.id]) item.text = changes[item.id];
      }
    }
  }
}

function addNewScenes() {
  setAllChoicesNext('ch1_sc3', 'ch1_sc4');
  chapter('ch1').scenes.push({
    id: 'ch1_sc4',
    title: '顾老三的线报',
    time: '1931.10.19 11:20',
    weather: '阴',
    location: '十六铺码头',
    bg: 'bg_street.jpg',
    bgm: 'bgm_ambient.mp3',
    dialogues: [
      line(null, '白锦书让他把珠子扔进苏州河。沈默走出巡捕房，却没有往河边去。他先去了十六铺。'),
      line(null, '码头上午最吵。汽笛、挑夫的号子、洋行伙计的骂声混在一起，像一张被水泡软的报纸，什么字都看不清。'),
      line(null, '顾老三蹲在茶棚后面剥花生，黄包车靠在墙上，车把手缠着红布。看见沈默，他先笑，笑到一半又收住。'),
      line('顾老三', '沈先生，您这张脸，一看就是昨晚没睡。验尸房又闹鬼了？'),
      line('沈默', '我找一个人。搞无线电，住霞飞路石库门。昨夜从苏州河里捞上来。'),
      line('顾老三', '死人啊。死人最麻烦，欠账不用还，话还得活人替他说。'),
      line(null, '他把花生壳吹到地上，压低声音。'),
      line('顾老三', '三天前有人问过同一个人。灰西装，皮鞋擦得能照见脸，给钱不讲价。问他有没有一台改过的留声机。'),
      line('沈默', '那人去了哪里？'),
      line('顾老三', '去了法租界。坐的是亚美公司的车。车牌我没看清，但车尾有一道刮痕，像被铁链抽过。'),
      line(null, '沈默把玻璃珠放在掌心。阴天里，它没有发亮，却比任何证物都更冷。'),
      line('顾老三', '这玩意儿别让我看。我顾老三眼睛小，装不下这么大的祸。'),
      line('沈默', '你已经看见了。'),
      line('顾老三', '那就算我倒霉。沈先生，码头上最近有人送木箱，箱子里不是鸦片也不是枪，是一排一排的黄铜管。收货人写的是「医疗器械」。'),
      line('沈默', '医疗器械送去哪里？'),
      line('顾老三', '亚美公司后巷。半夜卸货，白天没影。还有个卖豆腐花的周老板，老在那条巷口摆摊。他什么都不问，可什么都听得见。'),
      line(null, '沈默记下这些名字。顾老三忽然伸手，把他的袖口往下拽了拽，盖住腕上被福尔马林泡白的皮肤。'),
      line('顾老三', '您别穿着验尸房的味道到处跑。上海人怕死人，但更怕知道死人为什么死。'),
      line(null, '码头风吹过来，带着河水的腥气。沈默第一次觉得，苏州河不是在流，它是在藏东西。')
    ],
    choices: [
      choice('ch1_c4_a', '「盯住亚美公司的车，别靠太近。」', { ACTION: 5, CLUE: 1, gu_laosan: 10 }, 'ch1_sc5', { flag: 'dock_tail' }),
      choice('ch1_c4_b', '「带我去见周老板。现在。」', { INTEL: 5, ZHOU: 5, CLUE: 1 }, 'ch1_sc5', { flag: 'zhou_named' }),
      choice('ch1_c4_c', '「这件事到此为止，你别再插手。」', { DRAMA: 5, gu_laosan: 5 }, 'ch1_sc5'),
      choice('ch1_c4_special_clue', '「你说的黄铜管，内径是不是七分三厘？」', { TECH: 5, CLUE: 1 }, 'ch1_sc5', {
        condition: { params: { CLUE: { min: 2 } } },
        special: true,
        flag: 'brass_tube_size'
      })
    ]
  });

  chapter('ch1').scenes.push({
    id: 'ch1_sc5',
    title: '回验尸房',
    time: '1931.10.19 18:45',
    weather: '小雨',
    location: '巡捕房验尸房',
    bg: 'bg_morgue.jpg',
    bgm: 'bgm_suspense.mp3',
    dialogues: [
      line(null, '傍晚，沈默回到验尸房。门锁没有被撬，窗也关得好好的，可解剖台上的白布低了一截。'),
      line(null, '那具无名男尸不见了。留下的只有一滩淡褐色的水，沿着瓷砖缝慢慢爬，像尸体自己走过的路。'),
      line('沈默', '不可能。巡捕房的尸体，要有两个人签字才能移走。'),
      line(null, '他翻开出入登记，今天下午四点十五分，签名栏上写着「白锦书」。字迹像，却太干净。真正的白锦书签字时会压重最后一笔。'),
      line(null, '停尸柜里传来细响。沈默拉开柜门，冷气扑到脸上。里面没有尸体，只有一只湿纸袋。'),
      line(null, '纸袋里是一卷胶片。胶片边缘被水咬坏，中间却还能看见几帧影像：一个女人躺在椅子上，太阳穴贴着电极，身后站着陶启明。'),
      line('沈默', '陶启明。'),
      line(null, '名字从他嘴里出来时，验尸房的灯泡忽然闪了一下。电流不稳，还是有什么频率穿过了墙？'),
      line(null, '沈默把玻璃珠放到解剖台上。珠子滚了半圈，在胶片旁停住。那一瞬间，他听见极轻的哭声。'),
      line('男尸', '别听第一层……听下面……'),
      line(null, '声音消失得很快，快到像幻觉。沈默却已经打开了记录仪，把听见的每一个字写下来。'),
      line(null, '他重新检查白布，发现布角上有一点黑色粉末。不是煤灰，是唱片磨损后落下的虫胶粉。'),
      line('沈默', '尸体不是被偷走的。有人把它当唱片一样带走了。'),
      line(null, '门外传来脚步声。两个巡捕经过，谈笑着说晚上去百乐门。沈默站在阴影里，没有出声。'),
      line(null, '他意识到，从这一刻起，验尸房也不安全了。死人会被搬走，记录会被改写，连灯光都可能替别人说话。')
    ],
    choices: [
      choice('ch1_c5_a', '「把胶片藏进病历夹，先不交给巡捕房。」', { INTEL: 10, CLUE: 1 }, 'ch1_sc6', { flag: 'kept_film' }),
      choice('ch1_c5_b', '「立刻去白锦书办公室，逼他解释签名。」', { DRAMA: 10, bai_jinshu: -5 }, 'ch1_sc6'),
      choice('ch1_c5_c', '「先找陈子轩，胶片里的设备需要懂行的人看。」', { TECH: 10, chen_zixuan: 5 }, 'ch1_sc6'),
      choice('ch1_c5_special_bead', '「把玻璃珠贴近死者留下的水痕，听第二层声音。」', { CLUE: 2, ZHOU: 5 }, 'ch1_sc6', {
        condition: { flag: 'kept_bead' },
        special: true,
        flag: 'heard_second_layer'
      })
    ]
  });

  chapter('ch1').scenes.push({
    id: 'ch1_sc6',
    title: '黎明的决定',
    time: '1931.10.20 05:10',
    weather: '雨停',
    location: '苏州河边',
    bg: 'bg_street.jpg',
    bgm: 'bgm_main.mp3',
    dialogues: [
      line(null, '天快亮时，沈默站在苏州河边。河面浮着油光，岸边的石阶被雨洗得发亮。'),
      line(null, '他把昨夜到现在的线索按时间排开：男尸、玻璃珠、第七频率、亚美公司、失踪的尸体、胶片里的女人。每一件事都像钉子，钉在同一块看不见的木板上。'),
      line(null, '周老板的豆腐花摊在巷口冒热气。老人把一碗豆腐花推到他面前，像早知道他会来。'),
      line('周老板', '死人说话，活人就睡不着。沈先生，吃点热的。'),
      line('沈默', '顾老三说您听见过亚美公司的货。'),
      line('周老板', '我耳朵不好，只听见木箱落地。咚，咚，咚。像给人封棺。'),
      line(null, '他没有看沈默，只盯着锅里的白汽。'),
      line('周老板', '有些机器不是为了救人造的。造它的人一开始也许这么想，后来就不一定了。'),
      line('沈默', '您知道第七频率？'),
      line(null, '周老板舀豆腐花的手停了一下。勺子碰到锅沿，清脆一声。'),
      line('周老板', '我只知道，频率是桥。桥能让人过去，也能让人掉下去。'),
      line(null, '沈默抬头。东方发白，码头上的轮廓一点点显出来，像城市正在被某只手重新描线。'),
      line(null, '他明白自己已经不能只做验尸官。验尸官负责给死者定案，可这件事里，死者还没讲完。'),
      line('沈默', '我会查下去。'),
      line('周老板', '那就别只查死人。去查活人最怕被谁听见。'),
      line(null, '沈默把没吃完的豆腐花放下，热气湿了他的眼镜。他在心里做了一个决定：先找唱片，再找发射器。让声音自己开口。')
    ],
    choices: [
      choice('ch1_c6_a', '「先去死者阁楼，找唱片和笔记。」', { INTEL: 10, CLUE: 1 }, 'ch2_sc1'),
      choice('ch1_c6_b', '「先去亚美公司外围踩点，确认货箱去向。」', { ACTION: 5, TECH: 5 }, 'ch2_sc1'),
      choice('ch1_c6_c', '「记下周老板的话，频率是桥，不是答案。」', { ZHOU: 10, DRAMA: 5 }, 'ch2_sc1', { flag: 'bridge_not_weapon' }),
      choice('ch1_c6_special_zhou', '「问周老板：二十年前，谁先造了这座桥？」', { ZHOU: 10, CLUE: 1 }, 'ch2_sc1', {
        condition: { params: { ZHOU: { min: 5 } } },
        special: true,
        flag: 'asked_old_bridge'
      })
    ]
  });

  setAllChoicesNext('ch2_sc5', 'ch2_sc6');
  chapter('ch2').scenes.push({
    id: 'ch2_sc6',
    title: '沉睡者名册',
    time: '1931.10.22 02:44',
    weather: '无风',
    location: '亚美公司监视室',
    bg: 'bg_lab.jpg',
    bgm: 'bgm_suspense.mp3',
    dialogues: [
      line(null, '白锦书没有立刻逮捕沈默。陶启明也没有。他们把他带到实验室旁边的一间监视室，像请一位客人参观成果。'),
      line(null, '墙上挂满玻璃板，每块玻璃板后面都有一张照片：码头工人、女学生、账房先生、失踪的舞女。照片下面写着编号和状态。'),
      line(null, '状态栏里最多的两个字是：沉睡。'),
      line('陶启明', '沈先生，您每天解剖死人，应该比谁都明白死亡的浪费。一个人的记忆、经验、爱恨，一断气就全没了。太可惜。'),
      line('沈默', '所以你把活人变成标本？'),
      line('陶启明', '我保存他们。保存，是文明的第一步。'),
      line(null, '沈默看见一张照片，手指顿住。那是小翠提过的买药人，照片旁边写着「C-19，传输失败」。'),
      line(null, '再往下，是一个少年。眉眼和小翠有三分像。编号「C-21」，状态「待唤醒」。'),
      line('沈默', '小翠的弟弟？'),
      line('陶启明', '你看，人情总会让聪明人变慢。'),
      line(null, '白锦书站在门口，脸色灰得像墙。他没有看那些照片，只盯着地面。'),
      line('沈默', '白督察，你知道这里有多少人？'),
      line('白锦书', '我知道。'),
      line('沈默', '那你也知道，他们不是若雪的药。'),
      line(null, '白锦书的肩膀颤了一下。陶启明轻轻咳嗽，监视室里的灯随之暗了一度。'),
      line('陶启明', '名册只是过渡。10月24日之后，沉睡者会一起醒来。上海会看见奇迹。'),
      line(null, '沈默忽然明白，万国博览会不是展示地点。那是观众席。')
    ],
    choices: [
      choice('ch2_c6_a', '「把名册页码记下来，先保住证据。」', { INTEL: 10, CLUE: 2 }, 'ch2_sc7', { flag: 'memorized_registry' }),
      choice('ch2_c6_b', '「白锦书，看着这些照片，再说你是在救女儿。」', { DRAMA: 10, bai_jinshu: 10 }, 'ch2_sc7'),
      choice('ch2_c6_c', '「陶启明，传输失败的数据在哪里？」', { TECH: 10, CLUE: 1 }, 'ch2_sc7'),
      choice('ch2_c6_special_bai', '「若雪不会愿意用这些人替她醒来。」', { DRAMA: 5, bai_jinshu: 15, CLUE: 1 }, 'ch2_sc7', {
        condition: { affection: { bai_jinshu: { min: 40 } } },
        special: true,
        flag: 'bai_shaken_by_registry'
      })
    ]
  });

  chapter('ch2').scenes.push({
    id: 'ch2_sc7',
    title: '玻璃后的心跳',
    time: '1931.10.22 02:52',
    weather: '地下',
    location: '亚美公司隔离廊',
    bg: 'bg_lab.jpg',
    bgm: 'bgm_suspense.mp3',
    dialogues: [
      line(null, '监视室另一侧是一条玻璃长廊。长廊尽头，有一扇厚重的门。门后传来规律的电子音，一下一下，像替某个人数着心跳。'),
      line(null, '陶启明隔着玻璃指给沈默看。白若雪躺在舱内，脸色苍白，胸口几乎没有起伏。'),
      line('陶启明', '三年前，她死过一次。医学宣布结束，我不接受。'),
      line('沈默', '你不接受死亡，就让更多人替她承担。'),
      line('陶启明', '你误会了。真正的实验不是她，是世界。人类总有一天要学会把意识从肉体里解放出来。'),
      line(null, '沈默盯着那台仪器。表盘上有两组刻度，一组是7830Hz，另一组被胶布盖住，只露出一个「7」。'),
      line(null, '陈子轩曾说过，所有无线电系统都有备用频段。陶启明这样的人，不会只留一条路。'),
      line('白锦书', '沈默，别再看了。'),
      line('沈默', '您怕我看见什么？'),
      line(null, '白锦书没有回答。陶启明却笑了。'),
      line('陶启明', '怕你看见希望。希望比恐惧难处理得多。'),
      line(null, '长廊尽头的灯忽然跳动。白若雪的手指在玻璃内轻轻动了一下。不是苏醒，更像被什么声音牵了一下。'),
      line('沈默', '她听得见。'),
      line('陶启明', '当然。沉睡不是死亡。她只是住在另一个频率里。'),
      line(null, '沈默记住了这句话。住在另一个频率里。若雪如此，男尸或许也如此，那些名册上的人也如此。'),
      line(null, '他终于明白自己要做的不是破案，而是把人从错误的频率里叫回来。')
    ],
    choices: [
      choice('ch2_c7_a', '「盯住那组被遮住的备用刻度。」', { INTEL: 10, CLUE: 1 }, 'ch3_sc1', { flag: 'saw_backup_band' }),
      choice('ch2_c7_b', '「记录白若雪手指抽动的节奏。」', { TECH: 10, CLUE: 1 }, 'ch3_sc1', { flag: 'ruoxue_tap' }),
      choice('ch2_c7_c', '「看向白锦书，不再逼问。」', { DRAMA: 5, bai_jinshu: 10 }, 'ch3_sc1'),
      choice('ch2_c7_special_tech', '「把抽动节奏换算成摩尔斯码。」', { TECH: 5, CLUE: 2 }, 'ch3_sc1', {
        condition: { params: { TECH: { min: 25 } } },
        special: true,
        flag: 'ruoxue_morse'
      })
    ]
  });

  setAllChoicesNext('ch3_sc6', 'ch3_sc7');
  chapter('ch3').scenes.push({
    id: 'ch3_sc7',
    title: '雨中的同盟',
    time: '1931.10.22 21:05',
    weather: '大雨',
    location: '石库门安全屋',
    bg: 'bg_street.jpg',
    bgm: 'bgm_ambient.mp3',
    dialogues: [
      line(null, '仓库的火在雨里还亮着。几个人躲进石库门安全屋时，衣服都湿透了，屋里只有一盏煤油灯。'),
      line(null, '陈子轩把烧焦的收音机放在桌上，手一直抖。他不是怕死，他怕自己刚刚造出的东西差一点害死人。'),
      line('陈子轩', '如果抵消波算错半拍，整条街都会听见7830Hz。沈大哥，我真的能做这个吗？'),
      line('沈默', '你已经做了。现在要做得更准。'),
      line(null, '林若兰靠在窗边，手背的旧疤被雨水泡得发白。她看着外面，不知在看火，还是看三年前的实验室。'),
      line('林若兰', '陶启明不会停。他会把所有失败都当成下一次实验的理由。'),
      line('顾老三', '我听明白了。就是老疯子要在博览会上放一支没人听得见的曲子，听见的人都倒霉。'),
      line('小翠', '那我弟弟呢？名册上如果真有他，我要见他。活的，醒的。'),
      line(null, '没人立刻回答。屋顶漏水，一滴一滴落在盆里，敲出不规则的拍子。'),
      line('沈默', '我们要先阻止博览会。然后找名册，把沉睡者一个个找回来。'),
      line('小翠', '听起来像漂亮话。'),
      line('沈默', '是。可今晚我们只剩漂亮话和这台破收音机。'),
      line(null, '小翠看了他半晌，忽然笑了一下。'),
      line('小翠', '那就把漂亮话说到底。'),
      line(null, '林若兰展开一张被火燎黑边的设计图。陈子轩拿铅笔，顾老三按住纸角，小翠把账本翻到空白页。'),
      line(null, '沈默看着他们围在桌前，忽然觉得这间潮湿的小屋比巡捕房更像一个真正的指挥部。'),
      line('林若兰', '要打断7830Hz，需要三件事：入口、原型机、白锦书的通行权限。少一样，我们都会死在展馆里。'),
      line('顾老三', '入口我来找。上海地面上走不通，就从地底下走。'),
      line('陈子轩', '原型机我修。给我十二小时。十小时也行，别催。'),
      line('小翠', '通行证我想办法。百乐门里最不缺的就是把自己当大人物的人。')
    ],
    choices: [
      choice('ch3_c7_a', '「先稳住子轩，他的手不能再抖。」', { chen_zixuan: 15, DRAMA: 5 }, 'ch3_sc8'),
      choice('ch3_c7_b', '「让若兰重画备用频段，不能只防7830Hz。」', { TECH: 10, lin_ruolan: 10 }, 'ch3_sc8'),
      choice('ch3_c7_c', '「把顾老三和小翠的线合在一起，查地下入口。」', { ACTION: 10, gu_laosan: 5, xiao_cui: 5 }, 'ch3_sc8'),
      choice('ch3_c7_special_lin', '「若兰，三年前你没能救下若雪，不代表今晚也会失败。」', { DRAMA: 5, lin_ruolan: 15, TECH: 5 }, 'ch3_sc8', {
        condition: { affection: { lin_ruolan: { min: 45 } } },
        special: true,
        flag: 'lin_resolved'
      })
    ]
  });

  chapter('ch3').scenes.push({
    id: 'ch3_sc8',
    title: '苏州河试播',
    time: '1931.10.23 02:30',
    weather: '雨后',
    location: '苏州河旧仓库',
    bg: 'bg_radio_room.jpg',
    bgm: 'bgm_main.mp3',
    dialogues: [
      line(null, '凌晨两点半，苏州河边的旧仓库亮着一盏灯。陈子轩把原型机接上电源，整个人像被螺丝钉固定在椅子上。'),
      line(null, '机器发出第一声低鸣时，窗玻璃抖了一下。林若兰立刻按住表盘，低声报数。'),
      line('林若兰', '7829.4，7829.8，7830.1。别过线。'),
      line('陈子轩', '我知道，我知道。它太灵了，像马一样，一碰缰绳就要跑。'),
      line('沈默', '让它跑，但别让它咬人。'),
      line(null, '顾老三站在门口望风，小翠坐在木箱上，手里攥着一张从百乐门弄来的通行证。白锦书的名字还没有写上去。'),
      line(null, '试播开始。抵消波从小喇叭里放出，人耳几乎听不见，只有胸口能感觉到一点闷。'),
      line(null, '沈默闭上眼。他想起男尸舌下的玻璃珠，想起白若雪的手指，想起名册上那些被归成编号的人。'),
      line('男尸', '听下面。'),
      line(null, '声音又来了。这一次不是从玻璃珠里，而是从原型机的噪声里。'),
      line('沈默', '停。把唱片A-7叠上去。'),
      line('陈子轩', '叠？会糊成一团的。'),
      line('沈默', '陶启明错在以为覆盖就是保存。我们试试叠加。'),
      line(null, '唱针落下。示波器上，两条波形先是互相撕扯，随后奇异地贴合出第三条线。那条线很细，却稳。'),
      line('林若兰', '这是……回声窗口。'),
      line('陈子轩', '如果展馆里能打开这个窗口，沉睡者也许不会被强制唤醒，而是短暂恢复自己的频率。'),
      line('小翠', '短暂是多短？够一个人说句话吗？'),
      line(null, '没有人敢回答。但小翠已经把通行证放在桌上，推到沈默面前。'),
      line('小翠', '够说一句也好。人活一回，总得有一句话是自己的。'),
      line(null, '沈默把通行证收好。窗外雨停了，苏州河黑得像一张还没有刻完的唱片。')
    ],
    choices: [
      choice('ch3_c8_a', '「保存回声窗口参数，优先保护沉睡者意识。」', { TECH: 10, CLUE: 1 }, 'ch4_sc1', { flag: 'echo_window' }),
      choice('ch3_c8_b', '「把通行证交给白锦书，这是逼他站队的机会。」', { DRAMA: 10, bai_jinshu: 5 }, 'ch4_sc1'),
      choice('ch3_c8_c', '「让顾老三提前探路，试播数据我们路上再算。」', { ACTION: 10, gu_laosan: 5 }, 'ch4_sc1'),
      choice('ch3_c8_special_zixuan', '「子轩，第三条线不是噪声，是若雪给你的校准。」', { TECH: 5, chen_zixuan: 15, CLUE: 1 }, 'ch4_sc1', {
        condition: { affection: { chen_zixuan: { min: 45 } } },
        special: true,
        flag: 'zixuan_third_wave'
      })
    ]
  });

  setAllChoicesNext('ch4_sc5', 'ch4_sc6');
  chapter('ch4').scenes.push({
    id: 'ch4_sc6',
    title: '白若雪的回声',
    time: '1931.10.24 19:36',
    weather: '地下',
    location: '展馆隔离舱',
    bg: 'bg_lab.jpg',
    bgm: 'bgm_suspense.mp3',
    dialogues: [
      line(null, '抵消波压住主发射器后，地下层短暂安静下来。那种安静不自然，像所有人都同时忘了呼吸。'),
      line(null, '白若雪的隔离舱忽然亮起。不是陶启明按的按钮，是她自己的脑电波撞开了回声窗口。'),
      line('白若雪', '爸爸。'),
      line(null, '声音从扬声器里传出来，轻得像纸。白锦书僵在原地，手里的枪慢慢垂下去。'),
      line('白锦书', '若雪？'),
      line('白若雪', '别让他替我选。'),
      line(null, '陶启明脸色骤变，扑向控制台。林若兰挡在他面前，陈子轩的手已经扣住了备用开关。'),
      line('陶启明', '那不是她！那只是残留波形，是濒死神经的随机放电！'),
      line('沈默', '随机放电不会叫爸爸。'),
      line(null, '白若雪的声音断断续续，每个字都像从水底捞上来。'),
      line('白若雪', '我听见很多人。他们在黑处说话。有人想回家，有人只想知道自己叫什么。'),
      line('小翠', '有没有一个叫阿生的？十七岁，左耳缺一小块。'),
      line(null, '扬声器里沉默了两秒。'),
      line('白若雪', '他说，姐姐唱歌的时候，别喝冷酒。'),
      line(null, '小翠捂住嘴，没有哭出声。'),
      line('白若雪', '沈先生，桥快断了。陶教授把自己也放进来了。他不是要救我，他要借我醒过来。'),
      line(null, '陶启明的眼神第一次显出恐惧。不是阴谋败露的恐惧，而是一个信徒忽然发现神像会说「不」。'),
      line('白若雪', '还有三分钟。三分钟后，备用频段会接管。到那时，他会从每一个沉睡者身上醒来。'),
      line(null, '三分钟。上海所有喧闹都退到很远的地方，只剩仪表针一点点爬向红线。')
    ],
    choices: [
      choice('ch4_c6_a', '「让白锦书和若雪继续说话，稳住她的原始频率。」', { DRAMA: 10, bai_jinshu: 15 }, 'ch4_sc7', { flag: 'ruoxue_anchor' }),
      choice('ch4_c6_b', '「若兰，锁住陶启明的数据入口。」', { TECH: 10, lin_ruolan: 5 }, 'ch4_sc7'),
      choice('ch4_c6_c', '「小翠，记住阿生的位置，之后我们去找他。」', { DRAMA: 5, xiao_cui: 15, CLUE: 1 }, 'ch4_sc7'),
      choice('ch4_c6_special_bai', '「白督察，若雪已经替你做了选择。」', { DRAMA: 5, bai_jinshu: 20, CLUE: 1 }, 'ch4_sc7', {
        condition: { affection: { bai_jinshu: { min: 50 } } },
        special: true,
        flag: 'bai_lets_go'
      })
    ]
  });

  chapter('ch4').scenes.push({
    id: 'ch4_sc7',
    title: '三路汇合',
    time: '1931.10.24 19:39',
    weather: '地下',
    location: '主控室门前',
    bg: 'bg_lab.jpg',
    bgm: 'bgm_action.mp3',
    dialogues: [
      line(null, '三分钟被切成三条路。顾老三带人撬开地下电缆井，小翠把人群从展厅侧门引出去，陈子轩和林若兰趴在控制台前拆陶启明的备用逻辑。'),
      line(null, '沈默站在主控室门前，听见里面有两种声音：机器的嗡鸣，和陶启明压低的笑。'),
      line('陶启明', '你们以为选择在你们手里？频率已经开始自我校正。只要有一个人还想醒来，它就会继续。'),
      line('林若兰', '他把自我校正写进了底层。断电不够，必须从主控里删掉触发条件。'),
      line('陈子轩', '删掉要口令。十六位，三次机会。'),
      line('沈默', '口令不是数字。'),
      line(null, '他想起周老板说的桥，想起白若雪说的别让他替我选，想起男尸反复留下的第二层。陶启明这种人，会把信仰写进口令。'),
      line('沈默', '试「生命电流」。'),
      line('陈子轩', '不对。'),
      line('沈默', '试「二十一克」。'),
      line('陈子轩', '也不对，还剩一次。'),
      line(null, '仪表针压进红区。隔离舱里，白若雪的脑电波被拉得越来越细。'),
      line('白锦书', '沈默。'),
      line(null, '白锦书把枪递给他。不是让他杀人，是让他明白，有些门可以用更粗暴的办法打开。'),
      line('沈默', '不。陶启明相信的不是灵魂重量，也不是电流。他相信自己没有错。'),
      line('沈默', '口令是「爱迪生」。'),
      line(null, '陈子轩敲下最后一个字。主控室门咔哒一声打开。'),
      line(null, '门后，陶启明站在蓝白色电光里，像一具已经决定复活的尸体。三分钟还剩二十七秒。'),
      line('陶启明', '沈先生，既然你也会听第二层，那你应该明白：结局从来不只有一个。'),
      line(null, '沈默走进主控室。身后所有人的呼吸都压在他肩上。')
    ],
    choices: [
      choice('ch4_c7_a', '「先断开展馆广播，保住外面的人。」', { ACTION: 10, DRAMA: 5 }, 'ch5_sc1'),
      choice('ch4_c7_b', '「锁定陶启明的数据流，准备最后剥离。」', { TECH: 10, CLUE: 1 }, 'ch5_sc1'),
      choice('ch4_c7_c', '「逼陶启明承认：若雪不是他的容器。」', { DRAMA: 10, INTEL: 5 }, 'ch5_sc1'),
      choice('ch4_c7_special_all', '「打开回声窗口，让所有沉睡者说出自己的名字。」', { TECH: 5, DRAMA: 5, CLUE: 2 }, 'ch5_sc1', {
        condition: { params: { TECH: { min: 45 }, DRAMA: { min: 40 }, CLUE: { min: 8 } } },
        special: true,
        flag: 'names_in_echo'
      })
    ]
  });
}

function refreshFeedback() {
  for (const chapterData of data.chapters) {
    for (const sceneData of chapterData.scenes) {
      for (const item of sceneData.choices || []) {
        item.feedback = makeFeedback(item);
      }
    }
  }
}

function refreshEchoes() {
  data.echoes = [
    {
      chapter: 1,
      scene: 2,
      condition: { flag: 'kept_bead' },
      type: 'butterfly',
      title: '玻璃珠回响',
      message: '你藏起了那颗珠子，第二层声音因此有了落脚处。',
      echoId: 'bead_kept'
    },
    {
      chapter: 1,
      scene: 5,
      condition: { flag: 'heard_second_layer' },
      type: 'butterfly',
      title: '第二层声音',
      message: '死者留下的不是遗言，而是一段还没播放完的底层音轨。',
      echoId: 'second_layer'
    },
    {
      chapter: 2,
      scene: 2,
      type: 'ripple',
      title: '7830Hz',
      message: '示波器的线条在暗处收紧，频率开始记住你的选择。'
    },
    {
      chapter: 3,
      scene: 3,
      condition: { flag: 'found_lab' },
      type: 'butterfly',
      title: '地下实验室',
      message: '你见过机器的腹部，之后每一次沉默都会带着金属回音。',
      echoId: 'lab_found'
    },
    {
      chapter: 3,
      scene: 8,
      condition: { flag: 'echo_window' },
      type: 'butterfly',
      title: '回声窗口',
      message: '第三条波形很细，但足够让沉睡者把名字送回来。',
      echoId: 'echo_window'
    },
    {
      chapter: 4,
      scene: 5,
      type: 'ripple',
      title: '频率战争',
      message: '7830Hz 和抵消波互相撕咬，空气里出现看不见的裂纹。'
    },
    {
      chapter: 4,
      scene: 6,
      condition: { flag: 'ruoxue_anchor' },
      type: 'butterfly',
      title: '若雪的锚点',
      message: '有人叫了父亲，机器就再也不能假装那只是数据。',
      echoId: 'ruoxue_anchor'
    },
    {
      chapter: 5,
      scene: 2,
      condition: { flag: 'saved_everyone' },
      type: 'butterfly',
      title: '弦和预兆',
      message: '你选择过第三条路，最后的共振会记得这一次校准。',
      echoId: 'harmony_ending'
    }
  ];
}

function makeScreenplay() {
  const totalDialogueChars = data.chapters
    .flatMap(ch => ch.scenes)
    .flatMap(sc => sc.dialogues || [])
    .reduce((sum, item) => sum + item.text.length, 0);
  const choiceCount = data.chapters
    .flatMap(ch => ch.scenes)
    .flatMap(sc => sc.choices || [])
    .length;
  const specialCount = data.chapters
    .flatMap(ch => ch.scenes)
    .flatMap(sc => sc.choices || [])
    .filter(item => item.condition || item.special)
    .length;

  const out = [];
  out.push('# 第七频率 —— 视觉小说完整剧本');
  out.push('');
  out.push('> 本剧本文档由 `web/data/script.json` 同步生成，网页脚本为可游玩的权威数据源。');
  out.push(`> 当前对白约 ${totalDialogueChars} 字，选择 ${choiceCount} 个，条件/特殊选项 ${specialCount} 个。按视觉小说 280 字/分钟估算，正文阅读约 ${Math.round(totalDialogueChars / 280)} 分钟；结合选择、回看、存读档、插图和演出停顿，单周目目标时长超过 2 小时。`);
  out.push('');

  for (const ch of data.chapters) {
    out.push(`# ${ch.title ? `${ch.id.toUpperCase()}：${ch.title}` : ch.id}`);
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
  return `${out.join('\n')}\n`;
}

replaceBadLines();
repairSpecialChoices();
addNewScenes();
refreshFeedback();
refreshEchoes();

fs.writeFileSync(scriptPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
fs.writeFileSync(screenplayPath, makeScreenplay(), 'utf8');

const sceneCount = data.chapters.flatMap(ch => ch.scenes).length;
const choiceCount = data.chapters.flatMap(ch => ch.scenes).flatMap(sc => sc.choices || []).length;
const dialogueChars = data.chapters
  .flatMap(ch => ch.scenes)
  .flatMap(sc => sc.dialogues || [])
  .reduce((sum, item) => sum + item.text.length, 0);
console.log(JSON.stringify({
  chapters: data.chapters.length,
  scenes: sceneCount,
  choices: choiceCount,
  dialogueChars,
  estimatedReadingMinutes: Math.round(dialogueChars / 280)
}, null, 2));
