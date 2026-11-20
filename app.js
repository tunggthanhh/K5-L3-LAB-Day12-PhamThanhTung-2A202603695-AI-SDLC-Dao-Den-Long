const canvas = document.querySelector("canvas"),
  c = canvas.getContext("2d"),
  stats = document.querySelector("#stats"),
  banner = document.querySelector("#banner");

// --- Colorblind mode ---
let colorblindMode = false;
try { colorblindMode = localStorage.getItem("colorblind") === "1"; } catch(e) {}
const COLOR = {
  shade_normal: () => colorblindMode ? "#00B3FF" : "#7A3CFF",
  shade_stunned: "#9d7cff",
  warn_ui: () => colorblindMode ? "#FFFFFF" : "#FF5A5F",
  bg: "#120d25",
  island: "#241c43",
  mote: "#ffe98a",
  lantern_lit: "#ffb13b",
  lantern_lit_low: "#8a5b22",
  lantern_unlit: "#654f78",
  player: "#f7d28a",
};

let sim = new LanternGame.Simulation(42),
  keys = {},
  last = performance.now();

addEventListener("keydown", (e) => {
  keys[e.key.toLowerCase()] = true;
  if (e.key.toLowerCase() === "r") sim = new LanternGame.Simulation(42);
  // Toggle colorblind mode with C key
  if (e.key.toLowerCase() === "c") {
    colorblindMode = !colorblindMode;
    try { localStorage.setItem("colorblind", colorblindMode ? "1" : "0"); } catch(e) {}
  }
});
addEventListener("keyup", (e) => (keys[e.key.toLowerCase()] = false));

function resize() {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}
addEventListener("resize", resize);
resize();

function project(p) {
  const scale = Math.min(canvas.width, canvas.height) / 90;
  return [
    canvas.width / 2 + p[0] * scale,
    canvas.height * 0.58 + p[2] * scale * 0.42 - p[1] * scale,
  ];
}
function dot(p, r, color) {
  const q = project(p);
  c.beginPath();
  c.arc(q[0], q[1], r, 0, Math.PI * 2);
  c.fillStyle = color;
  c.fill();
}

function drawFuelBar(lantern) {
  const q = project(lantern.pos);
  const barW = 28, barH = 5;
  const x = q[0] - barW / 2, y = q[1] - 26;
  c.fillStyle = "#333";
  c.fillRect(x, y, barW, barH);
  const pct = Math.max(0, Math.min(1, (lantern.fuel || 0) / 100));
  const fuelColor = pct < 0.3 ? (colorblindMode ? "#FFFFFF" : "#FF5A5F") : "#44e57a";
  c.fillStyle = fuelColor;
  c.fillRect(x, y, barW * pct, barH);
}

function draw() {
  c.fillStyle = COLOR.bg;
  c.fillRect(0, 0, canvas.width, canvas.height);
  const center = project([0, 0, 0]);
  c.beginPath();
  c.ellipse(
    center[0],
    center[1],
    Math.min(canvas.width, canvas.height) * 0.43,
    Math.min(canvas.width, canvas.height) * 0.18,
    0,
    0,
    7,
  );
  c.fillStyle = COLOR.island;
  c.fill();

  for (const m of sim.motes) dot(m.pos, 4, COLOR.mote);

  for (const l of sim.lanterns) {
    const lowFuel = l.lit && l.fuel !== undefined && l.fuel < 30;
    const blinkOff = lowFuel && Math.floor(performance.now() / 500) % 2 === 0;

    if (!l.lit && colorblindMode) {
      // Colorblind: unlit lantern is visually squished (20% smaller) with a torn-paper mark
      const q = project(l.pos);
      c.beginPath();
      c.arc(q[0], q[1], 8, 0, Math.PI * 2);
      c.fillStyle = COLOR.lantern_unlit;
      c.fill();
      // "torn paper" indicator — a small white cross
      c.strokeStyle = "#fff";
      c.lineWidth = 1.5;
      c.beginPath();
      c.moveTo(q[0]-4, q[1]); c.lineTo(q[0]+4, q[1]);
      c.moveTo(q[0], q[1]-4); c.lineTo(q[0], q[1]+4);
      c.stroke();
    } else {
      dot(l.pos, l.lit ? (blinkOff ? 12 : 17) : 10, l.lit ? (blinkOff ? COLOR.lantern_lit_low : COLOR.lantern_lit) : COLOR.lantern_unlit);
    }

    if (l.lit) {
      const q = project(l.pos);
      const g = c.createRadialGradient(q[0], q[1], 1, q[0], q[1], 45);
      g.addColorStop(0, "#ffc65188");
      g.addColorStop(1, "#ffc65100");
      c.fillStyle = g;
      c.fillRect(q[0] - 50, q[1] - 50, 100, 100);
      // Fuel bar on lit lanterns
      drawFuelBar(l);
      // Warning icon in colorblind mode when low fuel
      if (lowFuel && colorblindMode) {
        const q2 = project(l.pos);
        c.fillStyle = "#FFFFFF";
        c.font = "bold 14px sans-serif";
        c.textAlign = "center";
        c.fillText("⚠", q2[0], q2[1] - 30);
      }
    }
  }

  for (const s of sim.shades) {
    const col = s.state === "stunned" ? COLOR.shade_stunned
      : s.state === "drain" ? "#ff4444"
      : COLOR.shade_normal();
    dot(s.pos, 13, col);
    // In colorblind mode shade border is different color
    if (colorblindMode && s.state !== "stunned") {
      const q = project(s.pos);
      c.beginPath();
      c.arc(q[0], q[1], 13, 0, Math.PI * 2);
      c.strokeStyle = "#00B3FF";
      c.lineWidth = 2;
      c.stroke();
    }
  }

  dot(sim.player.pos, 14, COLOR.player);

  const capacity = Math.min(20, 10 + 2 * (sim.successfulLights || 0));
  const litCount = sim.lanterns.filter((x) => x.lit).length;
  const required = Math.ceil(sim.lanterns.length * 0.6);
  const warnColor = litCount < required ? (colorblindMode ? "#FFFFFF" : "#FF5A5F") : "#44e57a";
  const cbNote = colorblindMode ? " [Bảng màu dễ phân biệt - C để tắt]" : " [C: bật chế độ mù màu]";
  stats.innerHTML = `🔥 ${sim.player.flames} &nbsp; ✨ ${sim.player.carried}/${capacity} &nbsp; <span style="color:${warnColor}">🏮 ${litCount}/${sim.lanterns.length} (cần ${required})</span><br>Điểm: ${sim.score} · ${Math.ceil(sim.timeLeft)}s${cbNote}`;

  if (sim.state !== "playing") {
    banner.style.display = "grid";
    banner.innerHTML =
      sim.state === "won"
        ? "Bình minh đến! Đảo an toàn!<br><small>Nhấn R để chơi lại</small>"
        : "Sương đen đã bao phủ đảo...<br><small>Nhấn R để chơi lại</small>";
  } else
    banner.style.display =
      keys.w || keys.a || keys.s || keys.d ? "none" : "grid";
}

function loop(now) {
  while (now - last >= 1000 / 60) {
    sim.step({
      move: [
        (keys.d ? 1 : 0) - (keys.a ? 1 : 0),
        (keys.s ? 1 : 0) - (keys.w ? 1 : 0),
      ],
      jump: !!keys.q,
      interact: !!keys.e,
      pulse: !!keys[" "],
      dash: !!keys.shift,
      cam_yaw_deg: 0,
    });
    last += 1000 / 60;
  }
  draw();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
