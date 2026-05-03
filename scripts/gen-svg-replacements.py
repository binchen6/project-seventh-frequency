import subprocess, sys, os, json, glob, time, shutil

SKILL_DIR = os.path.expanduser("~/.openclaw/workspace/skills/doubao-image")
SCRIPT = os.path.join(SKILL_DIR, "scripts/doubao_image.py")
OUTPUT_DIR = os.path.join(SKILL_DIR, "generated")
DEST_DIR = "assets/illustrations"

illustrations = [
    {"file": "ch1_sc3_shikumen", "prompt": "1930s Shanghai police station corridor at dawn, shikumen stone gate architecture, dim morning light filtering through frosted glass windows, wet stone floor reflecting light, cheap tobacco smoke lingering, wooden doors half-open, Art Deco wall sconces, noir atmosphere, cinematic lighting, visual novel CG style, no text, no watermark"},
    {"file": "ch1_sc6_suzhou_dawn", "prompt": "1930s Shanghai Suzhou Creek at dawn, misty waterfront, old warehouses and shikumen buildings along the bank, soft golden light breaking through fog, wooden boats moored by the shore, reflections on calm water, Art Deco bridge in background, noir atmosphere, cinematic wide shot, visual novel CG style, no text, no watermark"},
    {"file": "ch2_sc2_receiver", "prompt": "1930s radio receiver device on a wooden workbench, copper coils and vacuum tubes glowing amber, oscilloscope screen showing a thin frequency line, tangled wires and brass instruments, warm tungsten lamp light, dark room with Art Deco shadows, noir technical illustration, steampunk-adjacent, visual novel CG style, no text, no watermark"},
    {"file": "ch2_sc8_tao_invitation", "prompt": "1930s Shanghai private tea room, elegant Art Deco interior, a distinguished Chinese man in a dark suit pouring tea from a porcelain pot into a thin-rimmed cup, warm amber lighting, tension in the air, dark wood furniture, silk curtains, noir atmosphere, cinematic composition, visual novel CG style, no text, no watermark"},
    {"file": "ch3_sc9_silent_registry", "prompt": "1930s secret warehouse interior, dim single bulb hanging from ceiling, a young Chinese man adjusting a radio transmitter dial, a woman with a ledger book, another man guarding the door, shadows and tension, concrete walls, Art Deco industrial style, noir atmosphere, cinematic wide shot, visual novel CG style, no text, no watermark"},
    {"file": "ch4_sc4_transmitter", "prompt": "1930s radio transmitter machine room, white ceramic tiles on walls with dusty grout lines, large copper transmitter with glowing vacuum tubes, brass instruments and oscilloscopes on metal tables, industrial Art Deco design, ominous cyan and amber lighting, noir atmosphere, cinematic composition, visual novel CG style, no text, no watermark"},
    {"file": "ch5_sc1_false_death", "prompt": "1930s medical isolation chamber, glass wall separating observation room from patient area, a young Chinese woman lying motionless on a white bed, brainwave monitors showing mechanical pulse patterns, cold blue-white fluorescent light, medical equipment with brass fittings, clinical yet tragic atmosphere, Art Deco medical design, noir, visual novel CG style, no text, no watermark"},
    {"file": "ch5_sc5_institute", "prompt": "1930s Shanghai research institute interior, Art Deco architecture with geometric patterns, large windows with warm sunset light, scientific instruments and radio equipment on wooden tables, bookshelves with leather-bound volumes, a sense of final revelation and closure, golden hour lighting, noir atmosphere, cinematic wide shot, visual novel CG style, no text, no watermark"},
]

batch_num = int(sys.argv[1]) if len(sys.argv) > 1 else 0
batch = illustrations[batch_num*4:(batch_num+1)*4]

os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(DEST_DIR, exist_ok=True)

# Get existing files before generation
before = set(glob.glob(os.path.join(OUTPUT_DIR, "*.png")))

for item in batch:
    fname = item["file"]
    print(f"\n=== Generating: {fname} ===", flush=True)
    cmd = [
        sys.executable, SCRIPT,
        "--prompt", item["prompt"],
        "--size", "2K",
        "--output-dir", OUTPUT_DIR,
    ]
    t0 = time.time()
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=180)
    elapsed = time.time() - t0
    
    if result.returncode != 0:
        print(f"  FAILED ({elapsed:.0f}s): {result.stderr[:200]}", flush=True)
        continue
    
    # Find new file
    after = set(glob.glob(os.path.join(OUTPUT_DIR, "*.png")))
    new_files = after - before
    if new_files:
        src = max(new_files, key=os.path.getmtime)
        dst = os.path.join(DEST_DIR, fname + ".png")
        shutil.copy2(src, dst)
        size_kb = os.path.getsize(dst) / 1024
        print(f"  OK ({elapsed:.0f}s): {fname}.png ({size_kb:.0f} KB)", flush=True)
        before = after
    else:
        print(f"  WARNING: No new file found", flush=True)

print(f"\n=== Batch {batch_num} complete ===", flush=True)
