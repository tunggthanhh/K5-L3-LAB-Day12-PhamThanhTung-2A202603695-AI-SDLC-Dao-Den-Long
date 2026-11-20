# Agent instructions

- Keep game rules in `game.js`; both the browser and `headless.js` must use it.
- Run `npm test` after changes to simulation or contract code.
- Do not add nondeterministic calls (`Math.random`, wall-clock time) to the simulation.
- Preserve the JSONL Test Contract and validate malformed scenario/input files with exit code 2.
