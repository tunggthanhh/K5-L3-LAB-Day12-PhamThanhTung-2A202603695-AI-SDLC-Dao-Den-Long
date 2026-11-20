'use strict';
/**
 * PHASE 4 VERIFICATION TEST SUITE — Ticket-04 Release v1.0.0
 */

const fs = require('fs');
const path = require('path');
const cp = require('child_process');

let pass = 0, fail = 0;
function assert(cond, msg) {
  if (cond) { pass++; }
  else { fail++; console.error('  FAIL:', msg); }
}

console.log('[TEST] Running Phase 4 Release Verification...');

// 1. Contract v1.3 Verification
const contract = require('../game.contract.json');
assert(contract.contract_version === '1.3', '1. contract_version must be 1.3');
assert(typeof contract.bench_cmd === 'string', '2. bench_cmd must be defined');
assert(typeof contract.soak_cmd === 'string', '3. soak_cmd must be defined');
assert(typeof contract.run_cmd === 'string', '4. run_cmd must be defined');

// 2. bench.json Verification
assert(fs.existsSync(path.join(__dirname, '../bench.json')), '5. bench.json exists');
if (fs.existsSync(path.join(__dirname, '../bench.json'))) {
  const bench = JSON.parse(fs.readFileSync(path.join(__dirname, '../bench.json'), 'utf8'));
  assert(bench.contract_version === '1.3', '6. bench contract_version 1.3');
  assert(bench.avg_fps >= 60, `7. avg_fps (${bench.avg_fps}) >= 60`);
  assert(bench.p1_low_fps >= 30, `8. p1_low_fps (${bench.p1_low_fps}) >= 30`);
  assert(bench.load_ms <= 10000, `9. load_ms (${bench.load_ms}) <= 10000`);
  assert(bench.vsync_off === true, '10. vsync_off is true');
  assert(typeof bench.peak_mem_mb === 'number', '11. peak_mem_mb is number');
}

// 3. soak.json Verification
assert(fs.existsSync(path.join(__dirname, '../soak.json')), '12. soak.json exists');
if (fs.existsSync(path.join(__dirname, '../soak.json'))) {
  const soak = JSON.parse(fs.readFileSync(path.join(__dirname, '../soak.json'), 'utf8'));
  assert(soak.nights === 10, '13. soak nights count is 10');
  assert(soak.crashes === 0, `14. soak crashes (${soak.crashes}) === 0`);
  assert(soak.mem_end_mb <= 1.2 * soak.mem_start_mb, `15. mem_end_mb (${soak.mem_end_mb}) <= 1.2 * mem_start_mb (${soak.mem_start_mb})`);
  assert(Array.isArray(soak.results) && soak.results.length === 10, '16. soak results array has 10 elements');
}

// 4. Leaderboard CLI Export Test
const tmpLead = path.join(__dirname, '../tmp_lead_test.json');
try {
  cp.execFileSync(process.execPath, ['server.js', '--export-leaderboard', tmpLead]);
  assert(fs.existsSync(tmpLead), '17. --export-leaderboard created output file');
  const leadData = JSON.parse(fs.readFileSync(tmpLead, 'utf8'));
  assert(Array.isArray(leadData.entries), '18. exported leaderboard has entries array');
  assert(leadData.entries.length <= 10, '19. top 10 limit respected');
  if (leadData.entries.length > 1) {
    assert(leadData.entries[0].score >= leadData.entries[1].score, '20. sorted descending by score');
  }
} catch (e) {
  assert(false, `Leaderboard export failed: ${e.message}`);
} finally {
  if (fs.existsSync(tmpLead)) fs.unlinkSync(tmpLead);
}

console.log(`phase 4 release test passed (${pass} assertions, ${fail} failures)`);
if (fail > 0) process.exit(1);
