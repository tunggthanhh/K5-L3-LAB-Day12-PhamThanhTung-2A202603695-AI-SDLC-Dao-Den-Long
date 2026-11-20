# Simulation refactor plan

`game.js` grew as a compact Phase 1 prototype. Phase 2 and Phase 3 need independent
subsystems for map geometry, entity spawning, lantern fuel, player abilities and JSONL
serialization. The next implementation pass must split these into named functions before
adding more feature patches. This avoids changing tick ordering accidentally.

Required regression gates after each subsystem: `npm test`, deterministic two-run JSONL
comparison, and one scenario per feature.
