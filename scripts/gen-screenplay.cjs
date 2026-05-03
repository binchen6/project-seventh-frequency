const fs = require('fs');
const data = JSON.parse(fs.readFileSync('web/data/script.json', 'utf-8'));

let md = `# 《第七频率》\n\n`;
md += `> **版本**: v2.0 | **日期**: 2026-05-03 | **字数**: ~36,000字 | **选项**: 116+ | **特殊选项**: 22 | **隐藏结局**: 1\n\n`;
md += `---\n\n`;

// Add version history
md += `## 版本历史\n\n`;
md += `| 版本 | 日期 | 改动 |\n`;
md += `|------|------|------|\n`;
md += `| v1.0 | 2026-04-19 | 初版，5章完整剧情 |\n`;
md += `| v1.1 | 2026-04-20 | 合并choiceFixer.js + 引擎升级v2.0 |\n`;
md += `| v1.2 | 2026-04-20 | 道具系统 + 特殊选项 + 分歧渲染 |\n`;
md += `| v1.3 | 2026-04-21 | 条件判定系统 + 全局事件 + 路线B + 约34,000字 |\n`;
md += `| v1.3.1 | 2026-04-22 | 选项修复 + 旁白衔接 + 过渡动画 + 多属性条件 |\n`;
md += `| **v2.0** | **2026-05-03** | **历史考据修正 + 爱迪生之死 + 九一八背景 + 特斯拉传承线 + 亚美公司历史强化 + 舒曼共振科学细节** |\n`;
md += `\n---\n\n`;

// Add research notes
md += `## v2.0 历史考据与研究\n\n`;
md += `### 修正的历史错误\n`;
md += `- **百乐门 → 大华饭店**: 百乐门始建于1932年，1933年开业。1931年10月尚未建成，改为同期存在的大华饭店（Majestic Hall，静安寺路）。\n`;
md += `- **万国博览会 → 亚美无线电科技展**: 1931年上海没有举办万国博览会，改为贴合主题的亚美公司无线电科技展览。\n\n`;
md += `### 新增历史元素\n`;
md += `- **爱迪生逝世（1931年10月18日）**: 故事期间发生的真实历史事件，陶启明的「生命电流」理论追溯至爱迪生未完成的necrophone研究。\n`;
md += `- **九一八事变（1931年9月18日）**: 故事开始前一个月，抗日情绪高涨的时代背景。\n`;
md += `- **特斯拉1889年发现**: 特斯拉在电磁实验中观测到接近8赫兹的谐振现象，比舒曼1952年的理论预言早63年。\n`;
md += `- **亚美公司真实历史**: 1924年苏氏七姐弟创办，厂址江西路323号，1929年创办广播电台XGAH，地下党李强曾在此学习无线电技术。\n`;
md += `- **舒曼共振科学**: 7.83赫兹基频、NASA太空舱应用、Rutger Wever实验（屏蔽掩体中志愿者节律紊乱）、HeartMath研究所心率对齐研究。\n\n`;
md += `---\n\n`;

// Process chapters
data.chapters.forEach(ch => {
  md += `## 第${ch.number}章：${ch.title}\n\n`;
  md += `**解锁条件**: ${ch.unlockCondition || '完成上一章'} | **通关奖励**: ${ch.unlockReward || '无'}\n\n`;
  
  ch.scenes.forEach((sc, scIdx) => {
    const sceneNum = scIdx + 1;
    md += `### ${sc.id}：${sc.title || '场景 ' + sceneNum}\n\n`;
    md += `**角色**: ${sc.characters ? sc.characters.join('、') : '无'} | **地点**: ${sc.location || '未设定'}\n\n`;
    
    if (sc.unlockCondition) {
      md += `**解锁条件**: ${sc.unlockCondition}\n\n`;
    }
    
    // Dialogues
    sc.dialogues.forEach(dia => {
      const speaker = dia.speaker ? `**${dia.speaker}**` : '旁白';
      const expr = dia.expression ? `（${dia.expression}）` : '';
      
      md += `${speaker}${expr}：${dia.text}\n\n`;
      
      if (dia.choices) {
        dia.choices.forEach(choice => {
          md += `> **选择** ${choice.text}\n`;
          if (choice.special) md += `> > 特殊选项 | ${choice.special}\n`;
          if (choice.rewards) {
            const rewards = [];
            if (choice.rewards.intuition) rewards.push(`直觉 +${choice.rewards.intuition}`);
            if (choice.rewards.reasoning) rewards.push(`推理 +${choice.rewards.reasoning}`);
            if (choice.rewards.empathy) rewards.push(`共情 +${choice.rewards.empathy}`);
            if (choice.rewards.courage) rewards.push(`勇气 +${choice.rewards.courage}`);
            if (choice.rewards.inkling) rewards.push(`灵感 +${choice.rewards.inkling}`);
            if (choice.rewards.intel) rewards.push(`线索 +${choice.rewards.intel}`);
            if (choice.rewards.mark) rewards.push(`标记 +${choice.rewards.mark}`);
            if (choice.rewards.achievement) rewards.push(`成就：${choice.rewards.achievement}`);
            if (choice.rewards.item) rewards.push(`道具：${choice.rewards.item.name}`);
            md += `> > 奖励：${rewards.join('、')}\n`;
          }
          if (choice.transition) {
            md += `> > 过渡：${choice.transition}\n`;
          }
          md += `\n`;
        });
      }
    });
    
    // Scene choices (if not inline)
    if (sc.choices && sc.choices.length > 0) {
      md += `**\n场景选项：\n\n**`;
      sc.choices.forEach(choice => {
        md += `- ${choice.text}\n`;
        if (choice.special) md += `  - 特殊选项 | ${choice.special}\n`;
        if (choice.rewards) {
          const rewards = [];
          if (choice.rewards.intuition) rewards.push(`直觉 +${choice.rewards.intuition}`);
          if (choice.rewards.reasoning) rewards.push(`推理 +${choice.rewards.reasoning}`);
          if (choice.rewards.empathy) rewards.push(`共情 +${choice.rewards.empathy}`);
          if (choice.rewards.courage) rewards.push(`勇气 +${choice.rewards.courage}`);
          if (choice.rewards.inkling) rewards.push(`灵感 +${choice.rewards.inkling}`);
          if (choice.rewards.intel) rewards.push(`线索 +${choice.rewards.intel}`);
          if (choice.rewards.mark) rewards.push(`标记 +${choice.rewards.mark}`);
          if (choice.rewards.achievement) rewards.push(`成就：${choice.rewards.achievement}`);
          if (choice.rewards.item) rewards.push(`道具：${choice.rewards.item.name}`);
          md += `  - 奖励：${rewards.join('、')}\n`;
        }
        if (choice.transition) {
          md += `  - 过渡：${choice.transition}\n`;
        }
      });
      md += `\n`;
    }
    
    if (sc.nextScene) {
      md += `**下一场景**: ${sc.nextScene}\n\n`;
    }
    
    md += `---\n\n`;
  });
});

// Ending summary
md += `## 结局概览\n\n`;
md += `| 结局 | 条件 | 描述 |\n`;
md += `|------|------|------|\n`;
md += `| 弦音 | 默认 | 白若雪在第七频率中永远沉睡 |\n`;
md += `| 弦鸣 | 拯救失败（陶启明频率未抵消） | 陶启明完成大唤醒，更多人进入沉睡状态 |\n`;
md += `| 弦和 | 拯救成功（频率抵消） | 白若雪苏醒，陶启明计划失败 |\n`;
md += `| **弦外** | **隐藏 | 看到更多真相** | 揭示白锦书的真正计划 |\n`;
md += `\n`;

// Appendix
md += `## 附录：历史考据来源\n\n`;
md += `### 舒曼共振\n`;
md += `- 1889年特斯拉在电磁实验中观测到接近8赫兹谐振现象\n`;
md += `- 1952年德国物理学家温弗里德·奥托·舒曼理论预测\n`;
md += `- 基频7.83赫兹，与人类α波频率(8-12赫兹)相近\n`;
md += `- NASA在载人太空舱中安装舒曼波产生器\n`;
md += `- Rutger Wever实验（1960年代）：屏蔽掩体中志愿者节律紊乱，7-10Hz信号恢复节律\n`;
md += `- HeartMath研究所：心率变异频谱与舒曼频率对齐\n\n`;

md += `### 爱迪生与「生命电流」\n`;
md += `- 爱迪生确实研究过「与亡灵对话的机器」（necrophone）\n`;
md += `- 爱迪生1931年10月18日逝世\n`;
md += `- 爱迪生效应（1883年）：热电子发射，电子管基础\n`;
md += `- 特斯拉也研究类似领域\n\n`;

md += `### 亚美公司\n`;
md += `- 1924年10月由苏祖斐、苏祖圭、苏祖修、苏祖国、苏祖尧、苏祖光等姐弟7人合资创办\n`;
md += `- 厂址：江西路323号\n`;
md += `- 1929年12月23日创办亚美广播电台（呼号XGAH）\n`;
md += `- 1933年10月生产第一台收音机（1001号矿石收音机）\n`;
md += `- 1935年10月生产国内第一台超外差式五灯中波收音机\n`;
md += `- 地下党李强曾「混」进亚美公司学习无线电技术\n\n`;

md += `### 大华饭店\n`;
md += `- 1930年代上海著名舞厅，位于静安寺路（今南京西路）\n`;
md += `- 法租界内著名社交场所\n\n`;

md += `### 时代背景\n`;
md += `- 1931年9月18日：九一八事变，日本侵占东北\n`;
md += `- 1931年10月：上海抗日救亡运动高涨\n`;
md += `- 法租界、公共租界、华界三足鼎立\n`;
md += `- 民族工业蓬勃发展，无线电业余爱好者社群活跃\n\n`;

md += `---\n\n`;
md += `*《第七频率》v2.0 剧本 | 2026-05-03*\n`;
md += `*基于深度历史考据，修正百乐门、万国博览会等历史错误，融入爱迪生之死、九一八事变、特斯拉发现等真实历史事件*\n`;

fs.writeFileSync('screenplay/screenplay.md', md, 'utf-8');
console.log('Screenplay v2.0 generated: screenplay/screenplay.md');
console.log('Length:', md.length, 'characters');
