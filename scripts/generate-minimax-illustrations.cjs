const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 使用环境变量或相对路径，避免硬编码本地绝对路径
const python = process.env.PYTHON_PATH || 'py';
const cli = path.resolve(__dirname, '../skills/minimax-image/scripts/minimax_image.py');
const outDir = 'web/assets/illustrations/minimax';

const jobs = [
  {
    file: 'ch1_sc4_dock_tip.png',
    prompt: '1930s Shanghai noir visual novel CG, Sixteen Shop dock in morning fog, rickshaw runner informant beside brass cargo crates, black gold art deco mood, cinematic wide shot, warm tungsten and cyan radio glow, no text, no watermark'
  },
  {
    file: 'ch1_sc5_missing_body.png',
    prompt: '1930s forensic morgue visual novel CG, empty dissection table with white sheet collapsed, wet footprints and a strip of damaged film under tungsten lamp, black gold art deco noir, cinematic, no text, no watermark'
  },
  {
    file: 'ch2_sc6_sleepers_registry.png',
    prompt: '1930s secret laboratory archive visual novel CG, wall of patient photographs and handwritten sleeper registry, brass instruments, cyan oscilloscope glow, art deco noir, dramatic shadows, no readable text, no watermark'
  },
  {
    file: 'ch2_sc7_glass_heartbeat.png',
    prompt: '1930s retro science isolation corridor visual novel CG, young woman asleep behind thick glass chamber, faint heartbeat waveform reflected on glass, brass and porcelain laboratory, black gold cyan palette, no text, no watermark'
  },
  {
    file: 'ch3_sc7_rain_alliance.png',
    prompt: '1930s Shanghai safehouse visual novel CG, small team around a table with burnt blueprints, rain on window, radio parts, oil lamp, tense alliance mood, art deco noir, cinematic wide composition, no text, no watermark'
  },
  {
    file: 'ch3_sc8_suzhou_broadcast.png',
    prompt: '1930s riverside warehouse visual novel CG, prototype radio machine and oscilloscope showing a third waveform, Suzhou Creek outside rainy window, brass coils and vacuum tubes, black gold cyan glow, no text, no watermark'
  },
  {
    file: 'ch4_sc6_ruoxue_echo.png',
    prompt: 'climactic visual novel CG, retro isolation chamber glowing cyan, sleeping woman voice echo over speakers, shocked father silhouette, brass control room, 1930s Shanghai science noir, no text, no watermark'
  },
  {
    file: 'ch4_sc8_blackout_minute.png',
    prompt: '1930s art deco expo control room blackout visual novel CG, emergency cyan sparks, engineer bridging wires under console, silhouettes in darkness, tense one minute countdown mood, no text, no watermark'
  }
];

fs.mkdirSync(outDir, { recursive: true });

for (const job of jobs) {
  const target = path.join(outDir, job.file);
  if (fs.existsSync(target) && fs.statSync(target).size > 1024) {
    console.log(`Skip existing ${target}`);
    continue;
  }
  const before = new Set(fs.readdirSync(outDir));
  const args = [
    cli,
    '--prompt', job.prompt,
    '--model', 'image-01',
    '--width', '1280',
    '--height', '720',
    '--response-format', 'base64',
    '--n', '1',
    '--output-dir', outDir
  ];
  const result = spawnSync(python, args, { encoding: 'utf8', stdio: 'pipe' });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  if (result.status !== 0) throw new Error(`MiniMax generation failed for ${job.file}`);
  const after = fs.readdirSync(outDir)
    .filter(name => !before.has(name) && /^minimax_.*\.png$/.test(name))
    .map(name => path.join(outDir, name))
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
  if (!after[0]) throw new Error(`No output image found for ${job.file}`);
  if (fs.existsSync(target)) fs.unlinkSync(target);
  fs.renameSync(after[0], target);
  console.log(`Renamed: ${target}`);
}

console.log(JSON.stringify({ generated: jobs.length, outDir }, null, 2));
