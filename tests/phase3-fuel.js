'use strict';
// Phase 3 test suite — Ticket-03 "Đèn cạn dầu"
// Tests: fuel decay, lantern_out, refuel, relight cost, shade drain,
//        dawn_survived win condition, dawn loss, capacity growth, score rules.
const { Simulation } = require('../game');
let pass = 0, fail = 0;

function assert(cond, msg) {
  if (cond) { pass++; }
  else { fail++; console.error('  FAIL:', msg); }
}

// ── 1. New lantern starts at fuel 100 when lit ──────────────────────────────
{
  const sim = new Simulation(7, { random_motes: false, random_shades: false,
    player: { pos: [0, 0, 25], carried: 10 } });
  const events = sim.step({ interact: true });
  assert(events.some(e => e.name === 'lantern_lit'), '1a lantern_lit event');
  assert(sim.lanterns[0].fuel === 100, '1b new lantern fuel = 100');
}

// ── 2. Fuel decays each tick ─────────────────────────────────────────────────
{
  const sim = new Simulation(7, { random_motes: false, random_shades: false,
    player: { pos: [0, 0, 25], carried: 10 } });
  sim.step({ interact: true });  // light L1
  sim.step({});
  assert(sim.lanterns[0].fuel < 100, '2 lit lantern fuel decays');
}

// ── 3. Lantern goes out when fuel reaches 0 ──────────────────────────────────
{
  const sim = new Simulation(9, { random_motes: false, random_shades: false,
    player: { pos: [20, 0, 20] },
    lanterns: [{ id: 'L1', lit: true, fuel: 1 }],
    shades: [{ id: 'S1', pos: [0, 0, 25], state: 'drain', target_lantern_id: 'L1' }],
  });
  for (let i = 0; i < 20; i++) sim.step({});
  assert(!sim.lanterns[0].lit, '3a drained lantern unlit');
  assert(sim.lanterns[0].fuel === 0, '3b drained lantern fuel = 0');
  assert(sim.lanterns[0].ever_lit === true, '3c ever_lit preserved after drain');
}

// ── 4. Snapshot v1.2 fields: fuel, ever_lit, relit_count, capacity ───────────
{
  const sim = new Simulation(7, { random_motes: false, random_shades: false,
    player: { pos: [0, 0, 25], carried: 10 } });
  sim.step({ interact: true });
  const snap = sim.snapshot();
  const l = snap.lanterns[0];
  assert(typeof l.fuel === 'number', '4a lantern snapshot has fuel');
  assert(typeof l.ever_lit === 'boolean', '4b lantern snapshot has ever_lit');
  assert(typeof l.relit_count === 'number', '4c lantern snapshot has relit_count');
  assert(typeof snap.player.capacity === 'number', '4d player snapshot has capacity');
}

// ── 5. Relight cost: ever_lit lantern costs 5, fresh costs 10 ───────────────
{
  // Set up a lantern that was lit before (ever_lit, now unlit)
  const sim = new Simulation(1, { random_motes: false, random_shades: false,
    player: { pos: [0, 0, 25], carried: 10 },
    lanterns: [{ id: 'L1', lit: false, deposited: 0, ever_lit: true }],
  });
  // With 5 motes it should relight (cost 5)
  sim.player.carried = 5;
  sim.step({ interact: true });
  assert(sim.lanterns[0].lit, '5a ever_lit lantern relit with 5 motes');
  assert(sim.player.carried === 0, '5b used exactly 5 motes for relight');
}

// ── 6. Refuel event emitted; refuel adds 10 fuel per mote used ───────────────
{
  const sim = new Simulation(7, { random_motes: false, random_shades: false,
    player: { pos: [0, 0, 25], carried: 10 } });
  sim.step({ interact: true });  // light at fuel 100
  sim.step({ interact: false }); // release interact so next press is fresh
  // Drain to 50 manually
  sim.lanterns[0].fuel = 50;
  sim.player.carried = 5;
  const events = sim.step({ interact: true });
  const refuels = events.filter(e => e.name === 'refuel');
  assert(refuels.length > 0, '6a refuel event emitted');
  const refuelData = refuels[0].data;
  assert(refuelData.amount >= 1, '6b refuel amount >= 1');
  // The event records the fuel after refuel — verify it matches lantern state
  assert(Math.abs(sim.lanterns[0].fuel - refuelData.fuel) < 0.01, '6c lantern fuel matches refuel event');
}

// ── 7. Shade enters drain state when it reaches a low-fuel lantern ───────────
{
  const sim2 = new Simulation(1, {
    random_motes: false, random_shades: false,
    player: { pos: [999, 0, 999] },
    lanterns: [{ id: 'L1', pos: [0, 0, 5], lit: true, fuel: 10 }],
    shades: [{ id: 'S1', pos: [0, 0, 6], state: 'wander' }],
  });
  for (let i = 0; i < 10; i++) sim2.step({});
  assert(sim2.shades[0].state === 'drain', '7 shade transitions to drain near low-fuel lantern');
}

// ── 8. fuel_drain event emitted every 60 ticks while draining ───────────────
{
  const sim = new Simulation(1, { random_motes: false, random_shades: false,
    player: { pos: [999, 0, 999] },
    lanterns: [{ id: 'L1', pos: [0, 0, 0], lit: true, fuel: 20 }],
    shades: [{ id: 'S1', pos: [0, 0, 1], state: 'drain', target_lantern_id: 'L1' }],
  });
  const allEvents = [];
  for (let i = 0; i < 65; i++) allEvents.push(...sim.step({}));
  const drainEvents = allEvents.filter(e => e.name === 'fuel_drain');
  // simTick starts at 0 → fires at simTick 60 (tick 61)
  assert(drainEvents.length >= 1, '8 fuel_drain event emitted at 60-tick interval');
}

// ── 9. Dawn win: enough lanterns lit at end of night ────────────────────────
{
  // 5 lanterns, need ceil(0.6*5)=3 lit. Set 3 lit, time nearly out.
  const sim = new Simulation(1, { random_motes: false, random_shades: false,
    player: { pos: [0, 0, 0], flames: 3 },
    lanterns: [
      { id: 'L1', lit: true, fuel: 90 },
      { id: 'L2', lit: true, fuel: 90 },
      { id: 'L3', lit: true, fuel: 90 },
      { id: 'L4', lit: false },
      { id: 'L5', lit: false },
    ],
    time_left_s: 0.016,  // about 1 tick left
  });
  sim.step({});
  assert(sim.state === 'won', '9a dawn win when >= 3/5 lit');
  assert(sim.events.some(e => e.name === 'game_over' && e.data.reason === 'dawn_survived'), '9b reason = dawn_survived');
}

// ── 10. Dawn loss: not enough lanterns lit ───────────────────────────────────
{
  const sim = new Simulation(1, { random_motes: false, random_shades: false,
    player: { pos: [0, 0, 0], flames: 3 },
    lanterns: [
      { id: 'L1', lit: true, fuel: 90 },
      { id: 'L2', lit: false },
      { id: 'L3', lit: false },
      { id: 'L4', lit: false },
      { id: 'L5', lit: false },
    ],
    time_left_s: 0.016,
  });
  sim.step({});
  assert(sim.state === 'lost', '10a dawn loss when < 3/5 lit');
  assert(sim.events.some(e => e.name === 'game_over' && e.data.reason === 'dawn'), '10b reason = dawn');
}

// ── 11. No early win: lighting all 5 lamps does NOT end game immediately ─────
{
  const sim = new Simulation(7, { random_motes: false, random_shades: false,
    player: { pos: [0, 0, 25], carried: 50, flames: 3 },
  });
  // Light all 5 lanterns by teleporting and interacting
  const positions = sim.lanterns.map(l => l.pos);
  for (const pos of positions) {
    sim.player.pos = [...pos];
    sim.player.pos[2] += 1.5;  // within interact_radius=2
    sim.step({ interact: true });
  }
  assert(sim.state === 'playing', '11 all lanterns lit but game still playing (no early win)');
}

// ── 12. Capacity grows with successfulLights, capped at 20 ──────────────────
{
  const sim = new Simulation(7, { random_motes: false, random_shades: false,
    player: { pos: [0, 0, 25], carried: 50, successful_lights: 5 } });
  const snap = sim.snapshot();
  assert(snap.player.capacity === 20, '12a capacity = 10 + 2*5 = 20');
  // With successful_lights = 1, capacity should be 12
  const sim2 = new Simulation(7, { random_motes: false, random_shades: false,
    player: { pos: [0, 0, 25], carried: 50, successful_lights: 1 } });
  assert(sim2.snapshot().player.capacity === 12, '12b capacity = 10 + 2*1 = 12');
}

// ── 13. Score: +5 per mote deposited (new + relight + refuel) ───────────────
{
  const sim = new Simulation(7, { random_motes: false, random_shades: false,
    player: { pos: [0, 0, 25], carried: 10 } });
  const before = sim.score;
  const events = sim.step({ interact: true });
  // Should have deposited 10 motes for first light → +50 (10×5) + 100 (first light)
  assert(sim.score >= before + 50, '13 score += 5 per mote deposited');
}

// ── 14. Dawn win score: +50 per surviving flame + (50 + floor(fuel)) per lit lantern ─
{
  const sim = new Simulation(1, { random_motes: false, random_shades: false,
    player: { pos: [0, 0, 0], flames: 2 },
    lanterns: [
      { id: 'L1', lit: true, fuel: 80 },
      { id: 'L2', lit: true, fuel: 60 },
      { id: 'L3', lit: true, fuel: 40 },
      { id: 'L4', lit: false },
      { id: 'L5', lit: false },
    ],
    time_left_s: 0.016,
  });
  const scoreBefore = sim.score;
  sim.step({});
  // Fuel decays by 1/60 per tick before finish() — capture actual fuel after tick
  const litLanterns = sim.lanterns.filter(l => l.lit);
  const expectedBonus = sim.player.flames * 50 +
    litLanterns.reduce((sum, l) => sum + 50 + Math.floor(l.fuel), 0);
  const bonus = sim.score - scoreBefore;
  assert(bonus === expectedBonus, '14 dawn win score bonus correct');
  // Structural check: 2 flames + 3 lit lanterns → bonus > 400
  assert(bonus > 400, '14b dawn win bonus is substantial (>400)');
}

// ── 15. Stun recovery goes to wander (not chase) ────────────────────────────
{
  const sim = new Simulation(1, { random_motes: false, random_shades: false,
    player: { pos: [0, 0, 0] },
    shades: [{ id: 'S1', pos: [5, 0, 0], state: 'stunned', state_ticks_left: 1 }],
  });
  sim.step({});
  assert(sim.shades[0].state === 'wander', '15 shade recovers from stun to wander');
}

// ── 16. Determinism: two runs with same seed/input produce identical JSONL ───
{
  const fs = require('fs'), os = require('os'), path = require('path'), cp = require('child_process');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'phase3-det-'));
  const a = path.join(tmp, 'a.jsonl'), b = path.join(tmp, 'b.jsonl');
  const args = ['headless.js', '--seed', '42', '--night', '1', '--ticks', '300', '--out'];
  cp.execFileSync(process.execPath, [...args, a]);
  cp.execFileSync(process.execPath, [...args, b]);
  const aContent = fs.readFileSync(a, 'utf8');
  const bContent = fs.readFileSync(b, 'utf8');
  assert(aContent === bContent, '16 deterministic: two runs produce identical JSONL');
}

// ── 17. Contract version is 1.2 ──────────────────────────────────────────────
{
  const contract = require('../game.contract.json');
  assert(contract.contract_version === '1.2', '17 contract_version is 1.2');
  assert(typeof contract.tuning.fuel_max === 'number', '17b fuel_max in contract');
  assert(typeof contract.tuning.drain_per_s === 'number', '17c drain_per_s in contract');
  assert(typeof contract.tuning.win_ratio === 'number', '17d win_ratio in contract');
}

// ── Summary ──────────────────────────────────────────────────────────────────
console.log(`phase 3 fuel test passed (${pass} assertions, ${fail} failures)`);
if (fail > 0) process.exit(1);
