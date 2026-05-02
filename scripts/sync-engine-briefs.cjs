#!/usr/bin/env node
// Backward-compatible alias kept for older notes. The engine now derives scene
// HUD copy directly from web/data/script.json at runtime, so there is no scene
// brief table to synchronize.
require('./optimize-engine-briefs.cjs');
