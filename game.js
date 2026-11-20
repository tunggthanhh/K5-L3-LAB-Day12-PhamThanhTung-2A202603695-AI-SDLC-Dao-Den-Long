(function (root, factory) {
  const api = factory(root);
  if (typeof module !== "undefined") module.exports = api;
  if (root) root.LanternGame = api;
})(typeof window !== "undefined" ? window : globalThis, function (root) {
  "use strict";
  const Player =
    typeof require !== "undefined"
      ? require("./src/sim/player")
      : root.LanternPlayer;
  const Maps =
    typeof require !== "undefined"
      ? require("./src/sim/map")
      : root.LanternMaps;
  const Lantern =
    typeof require !== "undefined"
      ? require("./src/sim/lantern")
      : root.LanternRules;
  const JSONL =
    typeof require !== "undefined"
      ? require("./src/sim/jsonl")
      : root.LanternJSONL;
  const Drifter =
    typeof require !== "undefined"
      ? require("./src/sim/drifter")
      : root.LanternDrifter;
  const T = {
    player_speed: 6,
    carry_capacity: 10,
    lantern_cost: 10,
    lantern_count_night1: 5,
    pickup_radius: 1,
    interact_radius: 2,
    pulse_cost: 3,
    pulse_radius: 5,
    night1_duration_s: 240,
    night2_duration_s: 270,
    night3_duration_s: 300,
    fuel_max: 100,
    fuel_decay_per_s: 1,
    fuel_per_mote: 10,
    relight_cost: 5,
    win_ratio: 0.6,
    drain_per_s: 5,
    low_fuel_threshold: 30,
    capacity_max: 20,
    dash_speed: 14,
    dash_duration_s: 0.2,
    dash_cooldown_s: 1.5,
    flames: 3,
    invuln_s: 1.5,
    hit_drop_ratio: 0.5,
    pulse_stun_s: 2,
    pulse_push_m: 4,
    pulse_cooldown_s: 3,
    safe_radius: 6,
    shade_speed: 4,
    shade_hit_radius: 1,
    score: {
      per_mote: 0,
      per_lantern: 100,
      per_stun: 5,
      per_second_left: 0,
      per_flame_left: 50,
    },
  };
  // Phase 2/3 simulation helpers. Keep deterministic logic independent from rendering.
  const round = (n) => Math.round(n * 1000) / 1000;
  const d2 = (a, b) => Lantern.distance(a, b);
  const copyPos = (p) => [round(p[0]), round(p[1] || 0), round(p[2])];
  function seeded(seed) {
    let s = seed >>> 0 || 1;
    return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
  }
  function defaults(seed, night = 1) {
    const r = seeded(seed),
      motes = [];
    for (let i = 0; i < 20; i++) {
      const a = r() * Math.PI * 2,
        radius = 5 + r() * 30;
      motes.push({
        id: `M${i + 1}`,
        pos: [round(Math.cos(a) * radius), 0, round(Math.sin(a) * radius)],
      });
    }
    return {
      player: { pos: [0, 0, 0], carried: 0, flames: T.flames },
      lanterns: Maps.lanterns(night),
      motes,
      shades: [],
    };
  }
  function validateInputs(x) {
    if (!x || typeof x !== "object" || !Array.isArray(x.frames))
      throw Error("inputs.frames must be an array");
    let last = -1;
    for (const f of x.frames) {
      if (!f || !Number.isInteger(f.tick) || f.tick <= last || f.tick < 0)
        throw Error("frame ticks must strictly increase");
      last = f.tick;
      if (
        f.move &&
        (!Array.isArray(f.move) ||
          f.move.length !== 2 ||
          f.move.some((n) => typeof n !== "number" || n < -1 || n > 1))
      )
        throw Error("invalid move");
      if (f.cam_yaw_deg !== undefined && typeof f.cam_yaw_deg !== "number")
        throw Error("invalid cam_yaw_deg");
      for (const k of ["jump", "interact", "pulse", "dash", "pause"])
        if (f[k] !== undefined && typeof f[k] !== "boolean")
          throw Error(`invalid ${k}`);
    }
  }
  function validateScenario(x) {
    if (!x || typeof x !== "object" || Array.isArray(x))
      throw Error("scenario must be an object");
    for (const key of ["motes", "shades", "lanterns"])
      if (x[key] !== undefined && !Array.isArray(x[key]))
        throw Error(`${key} must be an array`);
  }
  class Simulation {
    constructor(seed = 1, scenario, night = 1) {
      this.seed = seed;
      this.night = night;
      this.tick = 0;
      this.simTick = 0;
      this.wind = { active: false, dir_deg: 0 };
      this.state = "playing";
      this.score = 0;
      this.successfulLights = 0;
      this.events = [];
      this.input = {
        move: [0, 0],
        cam_yaw_deg: 0,
        jump: false,
        dash: false,
        pause: false,
        interact: false,
        pulse: false,
      };
      this.prev = {
        jump: false,
        dash: false,
        pause: false,
        interact: false,
        pulse: false,
      };
      this.verticalVelocity = 0;
      this.dashTicks = 0;
      this.dashCd = 0;
      this.charmTicks = 0;
      this.invuln = 0;
      this.cooldown = 0;
      this.timeLeft = T[`night${night}_duration_s`];
      const x = defaults(seed, night);
      this.player = x.player;
      this.lanterns = x.lanterns;
      this.motes = x.motes;
      this.shades = x.shades;
      this.drifters = [];
      this.charms =
        night === 2
          ? [{ id: "C1", pos: [35, 0, 0], available: true, respawn: 0 }]
          : night === 3
            ? [
                { id: "C1", pos: [30, 0, 25], available: true, respawn: 0 },
                { id: "C2", pos: [-30, 0, 25], available: true, respawn: 0 },
              ]
            : [];
      if (scenario) this.applyScenario(scenario);
    }
    applyScenario(s) {
      validateScenario(s);
      if (s.player) {
        if (s.player.pos) this.player.pos = copyPos(s.player.pos);
        for (const k of ["carried", "flames"])
          if (s.player[k] !== undefined) this.player[k] = s.player[k];
        if (s.player.successful_lights !== undefined) this.successfulLights = s.player.successful_lights;
      }
      if (s.player && s.player.charm_ticks !== undefined)
        this.charmTicks = s.player.charm_ticks;
      if (s.drifters)
        this.drifters = s.drifters.map((d, i) =>
          Object.assign(Drifter.create(d.id || `D${i + 1}`, d.pos), {
            state: d.state || "idle",
            stolen: d.stolen || 0,
          }),
        );
      if (s.charms)
        this.charms = s.charms.map((c) => ({
          id: c.id,
          pos: copyPos(c.pos),
          available: c.available !== false,
          respawn: c.respawn_ticks || 0,
        }));
      if (s.random_motes === false) this.motes = [];
      if (s.random_shades === false) this.shades = [];
      if (s.motes)
        this.motes = s.motes.map((p, i) =>
          Array.isArray(p)
            ? { id: `M${i + 1}`, pos: copyPos(p) }
            : { id: p.id || `M${i + 1}`, pos: copyPos(p.pos) },
        );
      if (s.shades)
        this.shades = s.shades.map((q, i) => ({
          id: q.id || `S${i + 1}`,
          pos: copyPos(q.pos),
          state: q.state || "chase",
          stun: q.state_ticks_left !== undefined ? q.state_ticks_left / 60 : 0,
          target_lantern_id: q.target_lantern_id,
        }));
      if (s.lanterns)
        for (const patch of s.lanterns) {
          const l = this.lanterns.find((v) => v.id === patch.id);
          if (l) {
            if (patch.pos) l.pos = copyPos(patch.pos);
            if (patch.deposited !== undefined) l.deposited = patch.deposited;
            if (patch.lit !== undefined) {
              l.lit = patch.lit;
              if (patch.lit && patch.fuel === undefined) l.fuel = T.fuel_max;
            }
            if (patch.fuel !== undefined) l.fuel = patch.fuel;
            if (patch.ever_lit !== undefined) l.ever_lit = patch.ever_lit;
          }
        }
      if (s.time_left_s !== undefined) this.timeLeft = s.time_left_s;
    }
    event(name, data) {
      this.events.push(JSONL.event(this.tick + 1, name, data));
    }
    step(patch = {}) {
      Object.assign(this.input, patch);
      const e = (this.events = []);
      if (this.input.pause && !this.prev.pause) {
        this.state = this.state === "paused" ? "playing" : "paused";
        this.events.push({
          type: "event",
          tick: this.tick + 1,
          name: this.state === "paused" ? "paused" : "resumed",
          data: {},
        });
      }
      this.prev.pause = !!this.input.pause;
      if (this.state === "paused") {
        this.tick++;
        return e;
      }
      if (this.state !== "playing") return e;
      const dt = 1 / 60;
      for (const lantern of this.lanterns) {
        if (!lantern.lit) continue;
        lantern.fuel = Math.max(0, (lantern.fuel ?? T.fuel_max) - T.fuel_decay_per_s * dt);
        if (lantern.fuel === 0) {
          lantern.lit = false;
          lantern.deposited = 0;
          lantern.ever_lit = true;
          this.event("lantern_out", { lantern_id: lantern.id });
        }
      }
      if (
        this.input.dash &&
        !this.prev.dash &&
        this.dashCd <= 0 &&
        this.dashTicks === 0
      ) {
        this.dashTicks = 12;
        this.dashCd = this.charmTicks > 0 ? 0 : 90;
        this.event("dash", {});
      }
      this.prev.dash = !!this.input.dash;
      const speed =
        this.dashTicks > 0
          ? T.dash_speed
          : this.charmTicks > 0
            ? 7.2
            : T.player_speed;
      this.dashTicks = Math.max(0, this.dashTicks - 1);
      this.dashCd = Math.max(0, this.dashCd - 1);
      this.charmTicks = Math.max(0, this.charmTicks - 1);
      Player.move(
        this.player.pos,
        this.input.move,
        this.input.cam_yaw_deg,
        speed,
      );
      if (this.night === 3) {
        const cycle = this.simTick % 1800;
        this.wind.active = cycle >= 120 && cycle < 420;
        this.wind.dir_deg = Math.floor(this.simTick / 1800) * 137 % 360;
        if (this.wind.active) {
          const a = this.wind.dir_deg * Math.PI / 180;
          this.player.pos[0] += Math.cos(a) * 2 * dt;
          this.player.pos[2] += Math.sin(a) * 2 * dt;
        }
      }
      this.player.verticalVelocity = this.verticalVelocity;
      Player.jump(this.player, this.input.jump && !this.prev.jump);
      this.verticalVelocity = this.player.verticalVelocity;
      for (const c of this.charms) {
        if (c.available && d2(this.player.pos, c.pos) <= T.pickup_radius) {
          c.available = false;
          c.respawn = 2700;
          this.charmTicks = 600;
          this.event("charm_picked", { charm_id: c.id, charm_ticks: 600 });
        } else if (!c.available && --c.respawn <= 0) c.available = true;
      }
      for (let i = this.motes.length - 1; i >= 0; i--)
        if (this.motes[i].ttl !== undefined && --this.motes[i].ttl <= 0) {
          this.motes.splice(i, 1);
          continue;
        }
      for (let i = this.motes.length - 1; i >= 0; i--)
        if (
          (!this.motes[i].pickupAfter || this.simTick >= this.motes[i].pickupAfter) &&
          d2(this.player.pos, this.motes[i].pos) <= T.pickup_radius &&
          this.player.carried < Math.min(T.capacity_max, T.carry_capacity + 2 * this.successfulLights)
        ) {
          this.motes.splice(i, 1);
          this.player.carried++;
          this.score += T.score.per_mote;
          this.event("mote_picked", { carried: this.player.carried });
        }
      if (this.simTick > 0 && this.simTick % 240 === 0 && this.motes.length < 30) {
        const angle = ((this.simTick / 240) * Math.PI / 4) % (Math.PI * 2);
        const pos = [round(Math.cos(angle) * 12), 0, round(Math.sin(angle) * 12)];
        if (!this.motes.some((m) => d2(m.pos, pos) < 0.01)) {
          this.motes.push({ id: `M${this.simTick / 240 + 20}`, pos, kind: "random" });
        }
      }
      const shadeInterval = this.night === 1 ? 480 : this.night === 2 ? 420 : 360;
      const shadeLimit = this.night === 1 ? 6 : this.night === 2 ? 8 : 10;
      const shouldSpawnShades = this.simTick === 300 || (this.simTick > 300 && (this.simTick - 300) % shadeInterval === 0);
      if (shouldSpawnShades && this.shades.length < shadeLimit) {
        const count = this.simTick === 300 ? 2 : 1;
        for (let i = 0; i < count && this.shades.length < shadeLimit; i++) {
          const id = `S${this.shades.length + 1}`;
          const angle = ((this.shades.length * 2 + 1) * Math.PI) / 6;
          this.shades.push({ id, pos: [round(Math.cos(angle) * 37), 1, round(Math.sin(angle) * 37)], state: "wander", stun: 0 });
          this.event("shade_spawned", { id });
        }
      }
      if (this.input.interact && !this.prev.interact) {
        const l = Lantern.nearest(
          this.player,
          this.lanterns,
          T.interact_radius,
          T.fuel_max,
        );
        if (l && this.player.carried) {
          const relight = !l.lit && !!l.ever_lit;
          const cost = relight ? T.relight_cost : T.lantern_cost;
          const amount = l.lit
            ? Math.min(this.player.carried, Math.ceil((T.fuel_max - l.fuel) / T.fuel_per_mote))
            : Math.min(this.player.carried, cost - l.deposited);
          if (amount <= 0) {
            // A full lantern is not receivable; continue the rest of this tick.
          } else {
          const fuelWasLow = l.lit && l.fuel < T.low_fuel_threshold;
          this.player.carried -= amount;
          if (l.lit) {
            l.fuel = Math.min(T.fuel_max, l.fuel + T.fuel_per_mote * amount);
            this.event("refuel", { lantern_id: l.id, amount, fuel: round(l.fuel) });
            // If fuel refueled up to >= low_fuel_threshold, push nearby draining shades
            if (fuelWasLow && l.fuel >= T.low_fuel_threshold) {
              for (const s of this.shades) {
                if (d2(this.player.pos, s.pos) <= T.safe_radius) {
                  const dx = s.pos[0] - l.pos[0], dz = s.pos[2] - l.pos[2];
                  const n = Math.hypot(dx, dz) || 1;
                  s.pos[0] = l.pos[0] + (dx / n) * T.safe_radius;
                  s.pos[2] = l.pos[2] + (dz / n) * T.safe_radius;
                  s.stun = Math.min(s.stun, 30 / 60); // up to 30 ticks, no damage
                  if (s.state === "drain") s.state = "wander";
                }
              }
            }
          } else {
            l.deposited += amount;
            this.event("deposit", { lantern_id: l.id, amount, deposited: l.deposited });
          }
          this.score += amount * 5;
          if (!l.lit && l.deposited >= cost) {
            l.lit = true;
            l.fuel = T.fuel_max;
            l.ever_lit = true;
            if (relight) l.relit_count = (l.relit_count || 0) + 1;
            this.successfulLights++;
            this.score += relight ? 40 : 100;
            this.event("lantern_lit", { lantern_id: l.id, relight });
          }
          }
        }
      }
      if (
        this.input.pulse &&
        !this.prev.pulse &&
        this.cooldown <= 0 &&
        this.player.carried >= T.pulse_cost
      ) {
        this.player.carried -= T.pulse_cost;
        this.cooldown = T.pulse_cooldown_s;
        const ids = [];
        for (const s of this.shades)
          if (d2(this.player.pos, s.pos) <= T.pulse_radius) {
            const wasDraining = s.state === "drain";
            s.state = "stunned";
            s.stun = T.pulse_stun_s;
            const dx = s.pos[0] - this.player.pos[0],
              dz = s.pos[2] - this.player.pos[2],
              n = Math.hypot(dx, dz) || 1;
            s.pos[0] += (dx / n) * T.pulse_push_m;
            s.pos[2] += (dz / n) * T.pulse_push_m;
            ids.push(s.id);
            this.score += wasDraining ? 15 : T.score.per_stun;
          }
        this.event("pulse", { stunned_ids: ids });
      }
      if (
        this.night > 1 &&
        this.tick > 0 &&
        this.tick % 1200 === 0 &&
        this.drifters.length < 2
      )
        this.drifters.push(
          Drifter.create(`D${this.drifters.length + 1}`, [12, 0, 0]),
        );
      for (const d of this.drifters) {
        Drifter.updateState(d, this.player);
        if (d.state === "chase") Drifter.moveToward(d, this.player.pos, 7);
        const amount = Drifter.steal(d, this.player);
        if (amount)
          this.event("drifter_steal", {
            drifter_id: d.id,
            amount,
            carried: this.player.carried,
          });
      }
      this.prev.jump = !!this.input.jump;
      this.prev.interact = !!this.input.interact;
      this.prev.pulse = !!this.input.pulse;
      this.invuln = Math.max(0, this.invuln - dt);
      this.cooldown = Math.max(0, this.cooldown - dt);
      for (const s of this.shades) {
        if (s.stun > 0) {
          s.stun -= dt;
          if (s.stun <= 0) s.state = "wander";
          continue;
        }
        const weak = this.lanterns.filter((l) => l.lit && l.fuel < T.low_fuel_threshold).sort((a, b) => d2(s.pos, a.pos) - d2(s.pos, b.pos) || a.id.localeCompare(b.id))[0];
        if (s.state === "wander" && weak) {
          const dx = weak.pos[0] - s.pos[0], dz = weak.pos[2] - s.pos[2], n = Math.hypot(dx, dz) || 1;
          s.pos[0] += dx / n * T.shade_speed * dt;
          s.pos[2] += dz / n * T.shade_speed * dt;
          if (d2(s.pos, weak.pos) <= 2) { s.state = "drain"; s.target_lantern_id = weak.id; }
          continue;
        }
        if (s.state === "drain") {
          const target = this.lanterns.find((l) => l.id === s.target_lantern_id) || weak;
          if (!target || !target.lit || target.fuel >= T.low_fuel_threshold || d2(s.pos, target.pos) > 2) { s.state = "wander"; continue; }
          target.fuel = Math.max(0, target.fuel - T.drain_per_s * dt);
          if (target.fuel === 0) {
            target.lit = false;
            target.deposited = 0;
            target.ever_lit = true;
            this.event("lantern_out", { lantern_id: target.id });
            s.state = "wander";
            continue;
          }
          if (this.simTick % 60 === 0) this.event("fuel_drain", { lantern_id: target.id, shade_id: s.id, fuel: round(target.fuel) });
          continue;
        }
        // Safe zone: only lit lanterns with fuel >= low_fuel_threshold block shades
        const inSafe = this.lanterns.some(
          (l) => l.lit && l.fuel >= T.low_fuel_threshold && d2(l.pos, s.pos) <= T.safe_radius,
        );
        if (!inSafe) {
          const dx = this.player.pos[0] - s.pos[0],
            dz = this.player.pos[2] - s.pos[2],
            n = Math.hypot(dx, dz) || 1;
          s.pos[0] += (dx / n) * T.shade_speed * dt;
          s.pos[2] += (dz / n) * T.shade_speed * dt;
        }
        if (
          this.invuln <= 0 &&
          d2(this.player.pos, s.pos) <= T.shade_hit_radius
        ) {
          const dropped = Math.floor(this.player.carried * T.hit_drop_ratio);
          this.player.carried -= dropped;
          for (let i = 0; i < dropped; i++) {
            const a = (Math.PI * 2 * i) / Math.max(1, dropped);
            this.motes.push({ id: `D${this.tick}-${i}`, pos: [round(this.player.pos[0] + 2 * Math.cos(a)), 0, round(this.player.pos[2] + 2 * Math.sin(a))], kind: "dropped", ttl: 480, pickupAfter: this.simTick + 1 });
          }
          this.player.flames--;
          this.invuln = T.invuln_s;
          this.event("player_hit", {
            by: "shade",
            flames: this.player.flames,
            dropped,
          });
        }
      }
      this.tick++;
      this.simTick++;
      this.timeLeft = Math.max(0, this.timeLeft - dt);
      if (this.player.flames <= 0) this.finish("lost", "no_flames");
      else if (this.timeLeft <= 0) {
        const required = Math.ceil(this.lanterns.length * T.win_ratio);
        const lit = this.lanterns.filter((l) => l.lit).length;
        this.finish(lit >= required ? "won" : "lost", lit >= required ? "dawn_survived" : "dawn");
      }
      return e;
    }
    finish(state, reason) {
      if (this.state !== "playing") return;
      this.state = state;
      if (state === "won") {
        this.score += this.player.flames * 50;
        for (const lantern of this.lanterns) if (lantern.lit) this.score += 50 + Math.floor(lantern.fuel || 0);
      }
      this.events.push(
        JSONL.event(this.tick, "game_over", { result: state, reason }),
      );
    }
    snapshot() {
      return {
        type: "snapshot",
        tick: this.tick,
        sim_tick: this.simTick,
        state: this.state,
        time_left_s: round(this.timeLeft),
        night: this.night,
        wind: this.wind,
        score: this.score,
        player: {
          pos: copyPos(this.player.pos),
          vel: [0, round(this.verticalVelocity), 0],
          grounded: this.player.pos[1] === 0,
          invuln: round(this.invuln),
          dash_cd_s: round(this.dashCd / 60),
          pulse_cd_s: round(this.cooldown),
          charm_s: round(this.charmTicks / 60),
          capacity: Math.min(T.capacity_max, T.carry_capacity + 2 * this.successfulLights),
          flames: this.player.flames,
          carried: this.player.carried,
        },
        lanterns: this.lanterns.map((l) => ({
          id: l.id,
          pos: copyPos(l.pos),
          lit: l.lit,
          deposited: l.deposited,
          fuel: round(l.fuel || 0),
          ever_lit: !!l.ever_lit,
          relit_count: l.relit_count || 0,
        })),
        shades: this.shades.map((s) => ({
          id: s.id,
          pos: copyPos(s.pos),
          state: s.state,
        })),
        motes: this.motes.map((m) => ({
          id: m.id,
          pos: copyPos(m.pos),
          kind: m.kind || "random",
          ttl_s: m.ttl === undefined ? null : round(m.ttl / 60),
        })),
        motes_active: this.motes.length,
        drifters: this.drifters.map((d) => ({
          id: d.id,
          pos: copyPos(d.pos),
          state: d.state,
          stolen: d.stolen,
        })),
        charms: this.charms.map((c) => ({
          id: c.id,
          available: c.available,
          respawn_s: round(c.respawn / 60),
        })),
      };
    }
  }
  return { T, Simulation, validateInputs, validateScenario };
});
