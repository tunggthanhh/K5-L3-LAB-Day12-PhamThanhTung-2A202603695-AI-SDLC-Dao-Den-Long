(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined') module.exports = api;
  if (root) root.LanternPlayer = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  function normalize(x, z) { const n = Math.hypot(x, z); return n > 1 ? [x / n, z / n] : [x, z]; }
  function move(position, input, yawDeg, speed) {
    const [x, z] = normalize(input[0], input[1]); const a = yawDeg * Math.PI / 180;
    position[0] += (x * Math.cos(a) + z * Math.sin(a)) * speed / 60;
    position[2] += (-x * Math.sin(a) + z * Math.cos(a)) * speed / 60;
  }
  function jump(player, pressed) { if (pressed && player.pos[1] === 0) player.verticalVelocity = 7; player.pos[1] += player.verticalVelocity / 60; player.verticalVelocity -= 20 / 60; if (player.pos[1] <= 0) { player.pos[1] = 0; player.verticalVelocity = 0; } }
  return { normalize, move, jump };
});
