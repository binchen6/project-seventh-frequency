const fs = require('fs');

const enginePath = 'web/js/engine.js';
let engine = fs.readFileSync(enginePath, 'utf8');

const chapterBriefs = {
  ch1: '尸体、唱片和第七频率第一次落到沈默手里，死者开始像无线电一样回放。',
  ch2: '阁楼里的唱片把线索推向亚美公司，所有证据都带着静电噪声。',
  ch3: '实验室的幽灵终于开口，幸存者和背叛者都被同一段频率牵引。',
  ch4: '博览会亮起灯牌，上海最体面的舞台下正在准备一场集体失控。',
  ch5: '假死、真生、记忆共振。最后的选择不只决定谁活下来，也决定谁被记住。'
};

const labelsBlock = `const chapterBriefs=${JSON.stringify(chapterBriefs, null, 2)}
const paramLabels={INTEL:'推理',DRAMA:'人心',ACTION:'行动',TECH:'技术',CLUE:'线索',ZHOU:'弦外'}
const affectionLabels={lin_ruolan:'若兰',chen_zixuan:'子轩',gu_laosan:'老三',xiao_cui:'小翠',bai_jinshu:'白锦书'}
`;

engine = engine.replace(/const chapterBriefs=[\s\S]*?const bgCache=/, `${labelsBlock}const bgCache=`);

const oldBriefFn = /function getSceneBrief\(scene\)\{return sceneBriefs\[scene\?\.id\]\|\|\{\}\}/;
const newBriefFn = `function sceneHasConditionalChoice(scene){return (scene?.choices||[]).some(choice=>choice.condition||choice.special)}
function firstNarration(scene){return (scene?.dialogues||[]).find(d=>!d.speaker&&d.text)?.text||(scene?.dialogues||[])[0]?.text||''}
function getSceneBrief(chData,scene){const first=firstNarration(scene).replace(/\\s+/g,'');const line=(state.scene===0?(chData.title+'开场。'):'')+(first?first.slice(0,54)+(first.length>54?'...':''):(chapterBriefs[chData.id]||''));const choiceCount=(scene?.choices||[]).length;return{time:scene?.time||chData?.date||'1931',location:scene?.location||chData?.location||'上海',objective:sceneHasConditionalChoice(scene)?('推进「'+(scene?.title||chData.title)+'」并留意条件选项的回响。'):(choiceCount>3?('在「'+(scene?.title||chData.title)+'」中做出关键判断，改写后续案卷。'):('跟进「'+(scene?.title||chData.title)+'」的线索，让第七频率继续显影。')),line}}`;

engine = engine.replace(oldBriefFn, newBriefFn);
engine = engine.replace(/function renderSceneChrome\(chData,scene\)\{const brief=getSceneBrief\(scene\);/, 'function renderSceneChrome(chData,scene){const brief=getSceneBrief(chData,scene);');
engine = engine.replace(/function showSceneCard\(chData,scene\)\{const brief=getSceneBrief\(scene\);/, 'function showSceneCard(chData,scene){const brief=getSceneBrief(chData,scene);');

fs.writeFileSync(enginePath, engine, 'utf8');
console.log(JSON.stringify({
  engineChars: engine.length,
  hasSceneBriefs: engine.includes('const sceneBriefs=')
}, null, 2));
