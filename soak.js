#!/usr/bin/env node
'use strict';

/**
 * SOAK TEST RUNNER — Ticket-04 (Phase 4)
 * Command: node soak.js --seed 7 --nights 10 --out soak.json
 */

const fs = require('fs');
const { performance } = require('perf_hooks');
const { Simulation, T } = require('./game');

// Parse CLI args
const args = process.argv.slice(2);
function getArg(key, def) {
  const idx = args.indexOf(key);
  return idx >= 0 && idx + 1 < args.length ? args[idx + 1] : def;
}

const baseSeed = parseInt(getArg('--seed', '7'), 10);
const numNights = parseInt(getArg('--nights', '10'), 10);
const outPath = getArg('--out', 'soak.json');

console.log(`[SOAK] Starting Soak Test: ${numNights} nights, base seed ${baseSeed}...`);

const startTime = performance.now();
let memStartMb = null;
let memEndMb = null;
let crashes = 0;
const results = [];

function seededRng(s) {
  let v = s >>> 0 || 1;
  return () => (v = (v * 1664525 + 1013904223) >>> 0) / 4294967296;
}

for (let i = 0; i < numNights; i++) {
  const nightNumber = (i % 3) + 1;
  const currentSeed = baseSeed + i;
  const rng = seededRng(currentSeed);

  console.log(`[SOAK] Running Night ${i + 1}/${numNights} (Stage ${nightNumber}, Seed ${currentSeed})...`);

  try {
    const sim = new Simulation(currentSeed, null, nightNumber);

    // Record initial memory after first night loads
    if (i === 0) {
      if (global.gc) global.gc();
      memStartMb = Math.round(process.memoryUsage().rss / (1024 * 1024));
    }

    const maxTicks = T[`night${nightNumber}_duration_s`] * 60;
    let currentMove = [0, 0];

    for (let tick = 0; tick < maxTicks && sim.state === 'playing'; tick++) {
      // Every 30 ticks, re-pick movement direction
      if (tick % 30 === 0) {
        const mx = (rng() * 2 - 1);
        const mz = (rng() * 2 - 1);
        currentMove = [Math.round(mx * 10) / 10, Math.round(mz * 10) / 10];
      }

      // Action probabilities: 5% jump, 3% dash, 2% pulse, 10% interact
      const jump = rng() < 0.05;
      const dash = rng() < 0.03;
      const pulse = rng() < 0.02;
      const interact = rng() < 0.10;

      sim.step({
        move: currentMove,
        jump,
        dash,
        pulse,
        interact,
        cam_yaw_deg: 0
      });
    }

    results.push(sim.state === 'won' ? 'won' : 'lost');
  } catch (err) {
    console.error(`[SOAK] Crash on Night ${i + 1}:`, err);
    crashes++;
    results.push('crash');
  }
}

// Final memory after all nights finished
if (global.gc) global.gc();
memEndMb = Math.round(process.memoryUsage().rss / (1024 * 1024));

const durationSec = parseFloat(((performance.now() - startTime) / 1000).toFixed(1));

const output = {
  nights: numNights,
  crashes,
  results,
  mem_start_mb: memStartMb,
  mem_end_mb: memEndMb,
  duration_s: durationSec
};

fs.writeFileSync(outPath, JSON.stringify(output, null, 2) + '\n');
console.log(`[SOAK] Completed! Written to ${outPath}:`);
console.log(JSON.stringify(output, null, 2));

process.exit(crashes > 0 ? 1 : 0);

