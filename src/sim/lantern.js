(function (root, factory) {
  const api = factory(); if (typeof module !== 'undefined') module.exports = api; if (root) root.LanternRules = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  const distance = (a, b) => Math.hypot(a[0]-b[0], a[2]-b[2]);
  // Nearest receivable lantern: unlit OR lit-but-not-full (for refueling).
  // Full lit lanterns (fuel === 100) are not receivable per Ticket-03.
  function nearest(player, lanterns, radius, fuelMax) {
    const max = fuelMax !== undefined ? fuelMax : 100;
    return lanterns
      .filter(l => distance(player.pos, l.pos) <= radius && (
        !l.lit ||
        (l.lit && l.fuel < max)
      ))
      .sort((a, b) => distance(player.pos, a.pos) - distance(player.pos, b.pos) || a.id.localeCompare(b.id))[0];
  }
  return { distance, nearest };
});
