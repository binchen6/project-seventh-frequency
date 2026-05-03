#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import json
import os

scenes = []

# ============================================================
# Scene 1: 终极真相
# ============================================================
scenes.append({
    "id": "ch5_sc1",
    "title": "终极真相",
    "time": "11:15",
    "weather": "",
    "location": "地下隔离室",
    "bg": "assets/bg/ch5_isolation.png",
    "bgm": "bgm_suspense.mp3",
    "dialogues": [
        {"text": "隔离室的玻璃墙泛着冷光。白若雪躺在里面，脸色灰白，胸口几乎不动。显示器上的脑电波不是人的波形，是机械的、规则的脉冲，像一台坏了的钟还在走。", "speaker": None},
        {"text": "陶启明站在控制台前，手指悬在按钮上。他没看沈默，眼睛只盯着若雪。", "speaker": None},
        {"text": "爱迪生死前三个月，还在实验室里捣鼓他的『灵魂秤』。你知道这个吗？", "speaker": "陶启明", "expression": "neutral"},
        {"text": "沈默没回答。", "speaker": None},
        {"text": "他相信人死的时候体重会变轻，那轻掉的部分就是灵魂。二十一克。他称了无数次，没一次准的。但他没放弃。", "speaker": "陶启明", "expression": "thinking"},
        {"text": "沈默盯着显示器。机械脉冲之间，有极微弱的、几乎被淹没的正常波形。", "speaker": None},
        {"text": "我用了二十年。不是称灵魂，是找频率。7830 Hz。不是舒曼共振，是它的第七谐波。我把这个叫『第七频率』。", "speaker": "陶启明", "expression": "thinking"},
        {"text": "若雪的脑电波……没有被完全盖住。", "speaker": "沈默", "expression": "thinking"},
        {"text": "陶启明转头看屏幕。", "speaker": None},
        {"text": "你的数据只是叠在上面。像两张唱片叠着放，下面的那张还在转。", "speaker": "沈默", "expression": "neutral"},
        {"text": "陶启明的脸僵了一下。", "speaker": None},
        {"text": "不可能。传输是覆盖式的，原始数据会——", "speaker": "陶启明", "expression": "thinking"},
        {"text": "那这个怎么解释？", "speaker": "沈默", "expression": "neutral"},
        {"text": "他把唱片对着灯光。密纹在光下呈现出不寻常的断点。", "speaker": None},
        {"text": "死者用唱片存数据，因为声波是叠加的，不是覆盖的。旧数据不会被删，只是被新数据压住了。就像一张唱片可以刻很多层音轨。第一层是你的，第二层……是若雪自己。", "speaker": "沈默", "expression": "neutral"},
        {"text": "陶启明后退了一步。他的手从按钮上滑下来，垂在身侧。", "speaker": None},
        {"text": "二十年……", "speaker": "陶启明", "expression": "thinking"},
        {"text": "二十年，你一直以为是覆盖。其实是叠加。你从来没听过第二层音轨。", "speaker": "沈默", "expression": "neutral"},
        {"text": "你怎么……", "speaker": "陶启明", "expression": "thinking"},
        {"text": "我每天和死人打交道。死人和活人的区别，我比谁都清楚。", "speaker": "沈默", "expression": "neutral"}
    ],
    "choices": [
        {
            "id": "ch5_sc1_c",
            "text": "继续",
            "effects": {},
            "nextScene": "ch5_sc2"
        }
    ]
})

# ============================================================
# Scene 2: 最终抉择
# ============================================================
scenes.append({
    "id": "ch5_sc2",
    "title": "最终抉择",
    "time": "11:30",
    "weather": "",
    "location": "地下控制室",
    "bg": "assets/bg/ch5_control_room.png",
    "bgm": "bgm_suspense.mp3",
    "dialogues": [
        {"text": "沈默的手指停在控制台的键盘上。屏幕上显示着三个选项。", "speaker": None},
        {"text": "三种不同的「拯救」方案。", "speaker": None, "illustration": "assets/illustrations/ch5_sc2_choice.png"},
        {"text": "方案一：彻底摧毁。沈默可以用原型机生成一个超强功率的反向波，直接摧毁陶启明植入的所有数据——包括陶启明的『备份』和白若雪被覆盖的意识。结果是：白若雪会恢复正常的脑电波，但她将永久失去三年的记忆。陶启明的所有研究数据也会彻底消失。", "speaker": None},
        {"text": "方案二：选择性剥离。沈默可以尝试只剥离陶启明的数据，保留白若雪的原始意识。但风险极高——如果操作失误，两种数据会混在一起，白若雪可能永远无法分辨哪些记忆是自己的，哪些是陶启明的。她可能会变成一个『人格混合体』。", "speaker": None},
        {"text": "方案三：记忆共振。沈默可以利用7830 Hz的『记忆共振』效应，让白若雪的意识和在场某个人的意识产生共鸣——通过另一个人的大脑作为『过滤器』，把陶启明的数据『导』出去。但代价是：作为『过滤器』的那个人，会永久承载一部分陶启明的记忆碎片，而且如果频率失控，那个人也会脑死亡。", "speaker": None},
        {"text": "陶启明站在一旁，不再说话。他的疯狂在这一刻消退了，取而代之的是一种奇怪的平静——像是在等待判决。", "speaker": None},
        {"text": "门开了。白锦书冲了进来，身后跟着林若兰和陈子轩。白督察的脸上是汗水和泪水混在一起，他的眼睛只盯着隔离室里的女儿。", "speaker": None},
        {"text": "若雪……若雪……爸爸在这里……", "speaker": "白锦书", "expression": "neutral"},
        {"text": "沈默看着白锦书，又看着屏幕上的三个选项。他知道——这个选择，没有正确答案。", "speaker": None}
    ],
    "choices": [
        {
            "id": "ch5_c2_a",
            "text": "选择方案一：彻底摧毁（弦断）",
            "effects": {"DRAMA": 20},
            "nextScene": "ch5_sc3"
        },
        {
            "id": "ch5_c2_b",
            "text": "选择方案二：选择性剥离（弦鸣）",
            "effects": {"ACTION": 20},
            "nextScene": "ch5_sc4"
        },
        {
            "id": "ch5_c2_c",
            "text": "选择方案三：记忆共振（弦和）",
            "effects": {"TECH": 20},
            "nextScene": "ch5_sc5"
        },
        {
            "id": "ch5_c2_d",
            "text": "「周老板……这一切，是不是还没完？」（弦外·隐藏）",
            "effects": {},
            "nextScene": "ch5_sc6",
            "condition": {"flags": ["clue_1", "clue_2", "clue_3", "clue_4", "clue_5", "clue_6"], "affection": {"zhou_laoban": 80}}
        }
    ]
})

# ============================================================
# Scene 3-A: 弦断结局
# ============================================================
scenes.append({
    "id": "ch5_sc3",
    "title": "弦断",
    "time": "11:45",
    "weather": "",
    "location": "地下控制室",
    "bg": "assets/bg/ch5_control_room.png",
    "bgm": "bgm_ambient.mp3",
    "dialogues": [
        {"text": "沈默按下了『彻底摧毁』的按钮。", "speaker": None},
        {"text": "原型机发出一声尖锐的啸叫，然后是一阵低沉的嗡鸣。反向波以7830 Hz为载波，注入了白若雪的大脑。", "speaker": None},
        {"text": "显示器上，脑电波开始剧烈波动——陶启明的机械脉冲被反向波吞噬，像冰雪遇到烈火，迅速消融。然后，在脉冲完全消失的瞬间，出现了一段微弱的、但确实正常的α波。", "speaker": None},
        {"text": "白若雪的眼皮颤动了一下。", "speaker": None},
        {"text": "若雪？若雪！", "speaker": "白锦书", "expression": "neutral"},
        {"text": "白若雪缓缓睁开眼睛。她的目光涣散了一瞬，然后聚焦——她看见了白锦书，嘴角微微上扬，露出一个虚弱的笑容。", "speaker": None},
        {"text": "爸爸……我……做了好长一个梦……", "speaker": "白若雪", "expression": "smile"},
        {"text": "白锦书泪流满面。他转身，看向沈默，嘴唇动了动，但最终没有说出话来。他只是深深地鞠了一躬——一个父亲对救命恩人的最诚挚的感谢。", "speaker": None},
        {"text": "沈默看着父女俩，心里涌起一种复杂的情绪。他知道，白若雪失去了三年的记忆——那些大学时光、那些实验、那些和父亲的争吵与和解。都变成了空白。但她也摆脱了陶启明的噩梦。", "speaker": None},
        {"text": "代价是：陶启明二十年的研究彻底消失。所有的『沉睡者』再也无法被唤醒——他们的意识已经被数据覆盖太久，原始数据早已损坏。小翠的弟弟、刘老三、还有那些不知名的实验体。他们将永远沉睡。", "speaker": None},
        {"text": "陶启明被巡捕房逮捕时，没有反抗。他只是看着那台被摧毁的机器，眼神空洞。", "speaker": None},
        {"text": "弦断了……音律消失了……", "speaker": "陶启明", "expression": "thinking"},
        {"text": "三个月后，沈默在苏州河边租了一间小门面，开了一家诊所。招牌上写着『沈氏医馆』，字是他自己写的，歪歪扭扭，但清楚。来看病的人不多，都是附近码头上的苦力和黄包车夫。他收的钱很少，有时干脆不收。", "speaker": None},
        {"text": "林若兰来过两次。第一次带了半打真空管，说是从亚美公司的废墟里捡的。第二次什么也没带，只是坐在诊所门口的竹椅上，看了一下午的河水。走的时候她说：『我下个月去南京。』沈默说：『好。』没有问为什么。", "speaker": None},
        {"text": "陈子轩的信从南京来，一个月一封。字迹越来越潦草，但内容越来越踏实。最后一封信里说：『我在做一个真正的收音机，能收到延安的广播。』沈默把那封信压在诊所的玻璃板下面。", "speaker": None},
        {"text": "顾老三的黄包车还停在老地方，只是车篷上挂了块木牌，写的是『消息灵通』四个字，漆都掉了半边。他说这叫『品牌效应』，是从小翠那儿学的词。沈默每次路过，都会往他手里塞一支烟。", "speaker": None},
        {"text": "小翠在纺织厂上夜班。有一回沈默出诊回来，在弄堂口碰见她，她递过来一条围巾，说是『废品，不要就扔了』。沈默围了整个冬天。", "speaker": None},
        {"text": "周老板还是老样子。但沈默知道，他床底下的铁盒里，那台原型机的真空管还热着。", "speaker": None},
        {"text": "白锦书走之前，把督察的肩章和枪一起交了。他在沈默的诊所里坐了一个上午，最后留下一张纸，上面只写了一行字：『若雪认不出我了。但她会笑。这就够了。』", "speaker": None},
        {"text": "那年冬天，上海下了第一场雪。沈默推开窗，雪落在苏州河上，一下就化了。他想起了很多事，但都不想说。只是点了一支烟，看着河水往北流去。", "speaker": None},
        {"text": "黑暗还在。但至少，有人还在点灯。", "speaker": None},
        {"text": "——正剧结局：弦断 —— 完——", "speaker": None}
    ],
    "choices": [],
    "nextScene": None,
    "ending": "弦断"
})

# ============================================================
# Scene 3-B: 弦鸣结局
# ============================================================
scenes.append({
    "id": "ch5_sc4",
    "title": "弦鸣",
    "time": "11:45",
    "weather": "",
    "location": "地下控制室",
    "bg": "assets/bg/ch5_control_room.png",
    "bgm": "bgm_action.mp3",
    "dialogues": [
        {"text": "沈默选择了『选择性剥离』。", "speaker": None},
        {"text": "他调出林若兰提供的原始设计图，开始手动调整频率参数。这不是自动程序能做到的——需要人脑实时判断，根据脑电波的反馈，微调每一毫秒的频率。", "speaker": None},
        {"text": "沈默，频率偏移了0.3 Hz！调整！", "speaker": "林若兰", "expression": "neutral"},
        {"text": "收到！", "speaker": "沈默", "expression": "neutral"},
        {"text": "时间一分一秒过去。脑电波上的机械脉冲越来越弱，而正常的α波越来越强。但沈默注意到，在两种波形交替的瞬间，出现了一些奇怪的『混合片段』——白若雪的记忆和陶启明的数据交错在一起，像两段不同的旋律被强行拼接。", "speaker": None},
        {"text": "他咬紧牙关，继续调整。他知道，任何失误都会导致两种数据彻底融合，永远无法分离。", "speaker": None},
        {"text": "最终，在一声尖锐的电子音后，机械脉冲完全消失。屏幕上只剩下正常的脑电波——但波形比正常人更复杂，像是叠加了很多层不同的信号。", "speaker": None},
        {"text": "白若雪睁开了眼睛。", "speaker": None},
        {"text": "但她的眼神——不是那个大学生的清澈，也不是实验体的空洞。是一种混合的、复杂的、带着太多记忆的重叠。", "speaker": None},
        {"text": "爸爸……我记得。我记得我大学时的一切。我记得实验室里的公式。我记得陶启明教我的一切。我也记得……", "speaker": "白若雪", "expression": "thinking"},
        {"text": "我记得他。爱迪生。不是历史上的爱迪生，是陶启明记忆里的爱迪生。他老了，孤独，在实验室里对着一台机器哭泣。他认为自己找到了『生命电流』，但没有人相信他。", "speaker": "白若雪", "expression": "thinking"},
        {"text": "白锦书愣住了。沈默也愣住了。", "speaker": None},
        {"text": "沈先生，陶启明不是坏人。他只是……太孤独了。他想证明自己没有错。他想让全世界知道，爱迪生的『生命电流』是真的。", "speaker": "白若雪", "expression": "neutral"},
        {"text": "陶启明被带走时，白若雪走到他面前，伸出手，轻轻握住了他的手。", "speaker": None},
        {"text": "陶教授，我记得您。我记得您教我的一切。我不恨您。", "speaker": "白若雪", "expression": "neutral"},
        {"text": "陶启明的眼泪流了下来。这是他二十年来第一次哭。", "speaker": None},
        {"text": "若雪……对不起……", "speaker": "陶启明", "expression": "thinking"},
        {"text": "白若雪后来的事，沈默是从报纸上知道的。她去了美国，在约翰霍普金斯大学做研究。有一年《申报》登了一则简讯，说一位中国女科学家发表了一篇关于『脑电波频率与记忆恢复』的论文，引起了轰动。沈默把那张报纸剪下来，和别的杂物一起放在抽屉里。", "speaker": None},
        {"text": "他没去找过她。偶尔她会来信，信封上是英文地址，信纸边缘印着大学的徽章。信很短，总是说实验室的事，最后总会问一句：『苏州河的水还脏吗？』沈默从不回信。不是不想，是不知道说什么。", "speaker": None},
        {"text": "陶启明死在狱中。不是自杀，是心脏病。看守说他死前攥着一张纸条，上面写满了公式，最后一个等号后面不是数字，是一个问号。沈默听说后，去了趟监狱，要那张纸条。狱警说已经烧了。沈默站在监狱门口，抽了一支烟，走了。", "speaker": None},
        {"text": "——动作结局：弦鸣 —— 完——", "speaker": None}
    ],
    "choices": [],
    "nextScene": None,
    "ending": "弦鸣"
})

# ============================================================
# Scene 3-C: 弦和结局
# ============================================================
scenes.append({
    "id": "ch5_sc5",
    "title": "弦和",
    "time": "11:45",
    "weather": "",
    "location": "地下控制室",
    "bg": "assets/bg/ch5_control_room.png",
    "bgm": "bgm_main.mp3",
    "dialogues": [
        {"text": "沈默看向林若兰。", "speaker": None},
        {"text": "若兰，『记忆共振』需要两个人。你懂7830 Hz，你懂电路，你懂数据传输。只有你，能做这个『过滤器』。", "speaker": "沈默", "expression": "neutral"},
        {"text": "林若兰没有犹豫。她走到控制台前，开始连接自己的脑电波监测仪到系统上。", "speaker": None},
        {"text": "沈默，如果我的意识也被覆盖了，不要救我。让我和陶启明的数据一起消失。", "speaker": "林若兰", "expression": "neutral"},
        {"text": "不会有如果。", "speaker": "沈默", "expression": "neutral"},
        {"text": "连接完成。7830 Hz的频率同时注入白若雪和林若兰的大脑。两个女人的脑电波在屏幕上开始同步——她们的意识产生了『共振』。", "speaker": None},
        {"text": "在共振的状态下，陶启明的数据开始从白若雪的大脑『流动』到林若兰的大脑——就像一个溢满的水杯，把水倒入另一个空杯。但沈默严格控制着流速，确保数据不会『溢出』到林若兰的原始意识中。", "speaker": None},
        {"text": "屏幕上，白若雪的脑电波越来越『干净』——陶启明的机械脉冲被一点点抽离。而林若兰的脑电波上，出现了一层微弱的『外来信号』。陶启明的数据碎片，被锁在一个『隔离区』里，不会影响到她的正常意识。", "speaker": None},
        {"text": "十分钟后，传输完成。", "speaker": None},
        {"text": "白若雪睁开眼睛，眼神清澈——是她自己的眼神，一个二十二岁大学生的眼神。她看着白锦书，笑了。", "speaker": None},
        {"text": "爸爸……我饿了。", "speaker": "白若雪", "expression": "smile"},
        {"text": "白锦书泪流满面，紧紧抱住了女儿。", "speaker": None},
        {"text": "林若兰摘下脑电波监测仪，脸色有些苍白，但眼神清明。她看向沈默，嘴角微微上扬。", "speaker": None},
        {"text": "陶启明的数据……在我的大脑里。不是全部，是碎片。但我能感觉到它们——像是一本被遗忘的书，藏在书架的最深处。", "speaker": "林若兰", "expression": "thinking"},
        {"text": "你会受影响吗？", "speaker": "沈默", "expression": "neutral"},
        {"text": "不会。它们被『隔离』了。但……", "speaker": "林若兰", "expression": "thinking"},
        {"text": "我能『感觉』到爱迪生。不是记忆，是一种……共鸣。他的孤独，他的执着，他的绝望。沈默，陶启明的研究——虽然方法错了，但方向可能是对的。意识确实是一种频率。如果我们能用正确的方式研究它……", "speaker": "林若兰", "expression": "thinking"},
        {"text": "沈默看着她，明白了她的意思。", "speaker": None},
        {"text": "那就用正确的方式继续。", "speaker": "沈默", "expression": "neutral"},
        {"text": "『第七频率研究所』的招牌挂在霞飞路的一栋老洋房里，字是陈子轩写的，因为他字最好看。所里一共七个人，加上后来加入的白若雪，八个。", "speaker": None},
        {"text": "白锦书来报到那天，穿的是便装，不是警服。他说：『我现在管的不是犯人，是病人。』顾老三每天拉着黄包车来，车上坐的不是客人，是来找研究所看病的乡下人。小翠管账，用的是她在百乐门学的速记法，快得惊人。", "speaker": None},
        {"text": "陶启明死前的那封信，林若兰读了很久。信纸很薄，上面的字很淡，像是用铅笔写的。沈默没看内容，只看见林若兰读完之后，把信纸折好，放进了抽屉最深处。", "speaker": None},
        {"text": "1937年秋天，日本人进了上海。研究所撤往内地的时候，沈默把招牌摘下来，卷成一卷，塞进了行李。林若兰抱着那台原型机，顾老三拉着一车零件，小翠拎着账本。他们走了三个月，到了四川。", "speaker": None},
        {"text": "弦和出生的时候，外面正在下雨。林若兰说：『就叫弦和吧。弦外之音，和而不同。』沈默说：『好。』他不太懂这些，但觉得好听。", "speaker": None},
        {"text": "很多年后，弦和站在斯德哥尔摩的讲台上。她没有说『科学的伟大之处在于选择』，她说的是：『我母亲教我的第一件事，是怎么用示波器。她教我的第二件事，是不要在波形里看见自己想看见的东西。』", "speaker": None},
        {"text": "——技术结局：弦和 —— 完——", "speaker": None}
    ],
    "choices": [],
    "nextScene": None,
    "ending": "弦和"
})

# ============================================================
# Scene 3-D: 弦外隐藏结局
# ============================================================
scenes.append({
    "id": "ch5_sc6",
    "title": "弦外",
    "time": "12:00",
    "weather": "",
    "location": "石库门弄堂",
    "bg": "assets/bg/ch4_underground.png",
    "bgm": "bgm_ambient.mp3",
    "dialogues": [
        {"text": "主结局的尘埃落定后，沈默回到了石库门弄堂。周老板坐在门口，像往常一样端着一碗豆腐花。", "speaker": None},
        {"text": "沈先生，事情了了？", "speaker": "周老板", "expression": "neutral"},
        {"text": "沈默在他旁边坐下。", "speaker": None},
        {"text": "了了。但有一个问题，我一直没答案。", "speaker": "沈默", "expression": "thinking"},
        {"text": "什么问题？", "speaker": "周老板", "expression": "neutral"},
        {"text": "沈默直视周老板的眼睛。", "speaker": None},
        {"text": "二十年前，您和亚美公司的创始人一起发现了『生命电流』。那创始人是谁？后来怎么样了？", "speaker": "沈默", "expression": "thinking"},
        {"text": "周老板沉默了很长时间。然后他放下豆腐花，从长衫的内袋里掏出一张照片——一张泛黄的老照片，上面是两个年轻人站在一台奇怪的机器前。", "speaker": None, "illustration": "assets/illustrations/ch5_ending_hidden.png"},
        {"text": "这个人，叫沈怀瑾。是我的师兄，也是……", "speaker": "周老板", "expression": "thinking"},
        {"text": "……你的父亲。", "speaker": "周老板", "expression": "neutral"},
        {"text": "沈默僵住了。", "speaker": None},
        {"text": "二十年前，沈怀瑾和我发现了7830 Hz的效应。但我们意识到它太危险了——可以救人，也可以杀人。我们决定销毁所有研究，隐姓埋名。但陶启明……他是我们的师弟。他偷走了沈怀瑾的笔记，继续研究。", "speaker": "周老板", "expression": "thinking"},
        {"text": "他看着沈默，眼神里有一种复杂的情感——愧疚、怀念、还有某种解脱。", "speaker": None},
        {"text": "你父亲不是死于疾病。他是被陶启明害的——陶启明想从他嘴里逼出完整的频率公式，但你父亲宁死不说。他死前，把你托付给我。他说：『不要让默儿知道这些。让他做一个普通人。』", "speaker": "周老板", "expression": "thinking"},
        {"text": "沈默的手在颤抖。他想起父亲——那个在他记忆里总是沉默寡言、偶尔教他中医和武术的男人。那个在他十二岁时『病逝』的男人。", "speaker": None},
        {"text": "但我违背了他的遗愿。我看到你在验尸房的表现——你对尸体的敏感，对频率的直觉，那不是后天学来的。那是基因里的记忆。你父亲的研究，他的发现，他的痛苦……都在你的血液里。", "speaker": "周老板", "expression": "thinking"},
        {"text": "他站起来，把照片递给沈默。", "speaker": None},
        {"text": "沈默，『第七频率』不是陶启明发明的。是你父亲。陶启明只是个窃贼。而你——", "speaker": "周老板", "expression": "neutral"},
        {"text": "他转身，走向弄堂深处，声音渐渐远去。", "speaker": None},
        {"text": "——你才是『第七频率』的真正继承人。", "speaker": "周老板", "expression": "neutral"},
        {"text": "沈默低头看着照片。照片上的年轻人，眉骨和他一样，眼神也一样。那种看东西时的冷静，不是学来的，是遗传的。", "speaker": None},
        {"text": "照片背面有一行字，铅笔写的，已经淡了：『频率是桥梁，不是武器。默儿，别选错。』", "speaker": None},
        {"text": "沈默在石库门的夕阳里站了很久。旁边周老板在收豆腐花摊，木勺刮着锅底，声音很响。卖豆腐花的老太太问周老板：『沈先生怎么了？』周老板说：『没事。想事情呢。』", "speaker": None},
        {"text": "沈默把照片收进口袋，走进弄堂。他的脚步声在石板路上响着，和二十年前某个人的脚步声，大概是一样的。", "speaker": None},
        {"text": "苏州河在远处流。水声里好像有什么东西，但他不确定那是什么。也许只是风声。也许是别的。", "speaker": None},
        {"text": "——隐藏结局：弦外 —— 完——", "speaker": None}
    ],
    "choices": [],
    "nextScene": None,
    "ending": "弦外"
})

# Write output
script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(script_dir)
output_path = os.path.join(project_root, "web", "data", "temp_ch5.json")
os.makedirs(os.path.dirname(output_path), exist_ok=True)

with open(output_path, "w", encoding="utf-8") as f:
    json.dump(scenes, f, ensure_ascii=False, indent=2)

print(f"Written {len(scenes)} scenes to {output_path}")
print(f"Total dialogues: {sum(len(s['dialogues']) for s in scenes)}")
print(f"File size: {os.path.getsize(output_path)} bytes")
