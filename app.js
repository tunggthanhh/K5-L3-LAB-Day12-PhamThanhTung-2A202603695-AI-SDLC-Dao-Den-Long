/**
 * ĐẢO ĐÈN LỒNG — Lantern Island
 * Phase 4: Production Release v1.0.0
 * 3D Stylized Diorama Canvas Engine, Accessibility, Leaderboard & Presentation
 */

(function () {
  "use strict";

  const canvas = document.querySelector("canvas");
  const ctx = canvas.getContext("2d");

  // --- UI DOM ELEMENTS ---
  const elFlamesRow = document.getElementById("flames-row");
  const elMoteFill = document.getElementById("mote-fill");
  const elMoteLabel = document.getElementById("mote-label");
  const elLanternTrack = document.getElementById("lantern-track");
  const elScoreBox = document.getElementById("score-box");
  const elTimerBox = document.getElementById("timer-box");
  const elInteractionPrompt = document.getElementById("interaction-prompt");
  const elPromptText = document.getElementById("prompt-text");
  const elPromptKey = document.getElementById("prompt-key");
  const elCdPulse = document.getElementById("cd-pulse");
  const elCdDash = document.getElementById("cd-dash");
  const elSubtitleBanner = document.getElementById("subtitle-banner");
  const elSubIcon = document.getElementById("sub-icon");
  const elSubText = document.getElementById("sub-text");

  // Chips & skill labels
  const elKeyPulseLabel = document.getElementById("key-pulse-label");
  const elKeyDashLabel = document.getElementById("key-dash-label");
  const elChipJump = document.getElementById("chip-jump");
  const elChipInteract = document.getElementById("chip-interact");

  // Modals
  const elMenuModal = document.getElementById("menu-modal");
  const elHelpModal = document.getElementById("help-modal");
  const elVictoryModal = document.getElementById("victory-modal");
  const elDefeatModal = document.getElementById("defeat-modal");
  const elLeaderboardModal = document.getElementById("leaderboard-modal");
  const elAccessModal = document.getElementById("access-modal");

  const elBtnStart = document.getElementById("btn-start");
  const elBtnHelp = document.getElementById("btn-help");
  const elBtnCloseHelp = document.getElementById("btn-close-help");
  const elBtnRestartWin = document.getElementById("btn-restart-win");
  const elBtnRestartLose = document.getElementById("btn-restart-lose");
  const elBtnOpenLeaderboard = document.getElementById("btn-open-leaderboard");
  const elBtnCloseLead = document.getElementById("btn-close-lead");
  const elBtnAccess = document.getElementById("btn-access");
  const elBtnCloseAccess = document.getElementById("btn-close-access");
  const elBtnResetKeys = document.getElementById("btn-reset-keys");
  const elRebindAlert = document.getElementById("rebind-alert");

  const elLeadBody = document.getElementById("lead-body");
  const elWinScore = document.getElementById("win-score");
  const elWinLanterns = document.getElementById("win-lanterns");
  const elLoseScore = document.getElementById("lose-score");
  const elLoseLanterns = document.getElementById("lose-lanterns");
  const elDefeatReason = document.getElementById("defeat-reason");

  const elWinPlayerName = document.getElementById("win-player-name");
  const elLosePlayerName = document.getElementById("lose-player-name");
  const elBtnSaveScoreWin = document.getElementById("btn-save-score-win");
  const elBtnSaveScoreLose = document.getElementById("btn-save-score-lose");

  const elChkReducedMotion = document.getElementById("chk-reduced-motion");
  const elChkLargeText = document.getElementById("chk-large-text");

  // --- KEY BINDINGS & ACCESSIBILITY ---
  const DEFAULT_KEYS = {
    up: "w",
    down: "s",
    left: "a",
    right: "d",
    jump: "q",
    dash: "shift",
    interact: "e",
    pulse: " ",
    pause: "p",
  };

  let keyBindings = Object.assign({}, DEFAULT_KEYS);
  try {
    const saved = localStorage.getItem("key_bindings");
    if (saved) keyBindings = Object.assign(keyBindings, JSON.parse(saved));
  } catch (e) {}

  let reducedMotion = false;
  try {
    reducedMotion = localStorage.getItem("reduced_motion") === "1";
    if (reducedMotion) document.body.classList.add("reduced-motion");
    if (elChkReducedMotion) elChkReducedMotion.checked = reducedMotion;
  } catch (e) {}

  let largeText = false;
  try {
    largeText = localStorage.getItem("large_text") === "1";
    if (largeText) document.body.classList.add("large-text");
    if (elChkLargeText) elChkLargeText.checked = largeText;
  } catch (e) {}

  let colorblindMode = false;
  try {
    colorblindMode = localStorage.getItem("colorblind") === "1";
    if (colorblindMode) document.body.classList.add("cb-mode");
  } catch (e) {}

  function updateKeyLabels() {
    const formatKey = (k) => (k === " " ? "SPACE" : k.toUpperCase());
    if (elKeyPulseLabel) elKeyPulseLabel.innerText = formatKey(keyBindings.pulse);
    if (elKeyDashLabel) elKeyDashLabel.innerText = formatKey(keyBindings.dash);
    if (elChipJump) elChipJump.innerText = formatKey(keyBindings.jump);
    if (elChipInteract) elChipInteract.innerText = formatKey(keyBindings.interact);
    if (elPromptKey) elPromptKey.innerText = formatKey(keyBindings.interact);

    // Update buttons in rebind modal
    document.querySelectorAll(".rebind-btn").forEach((btn) => {
      const act = btn.getAttribute("data-action");
      if (act && keyBindings[act]) {
        btn.innerText = formatKey(keyBindings[act]);
      }
    });
  }
  updateKeyLabels();

  // --- SUBTITLE & INDICATOR SYSTEM ---
  let subtitleTimer = 0;
  function showSubtitle(text, icon = "⚠", durationSec = 3.0) {
    if (!elSubtitleBanner) return;
    elSubIcon.innerText = icon;
    elSubText.innerText = text;
    elSubtitleBanner.classList.add("show");
    subtitleTimer = durationSec;
  }

  // --- PALETTE SYSTEM ---
  const PALETTE = {
    goldWarm: "#FFBF69",
    goldBright: "#FFE8A3",
    nightDark: "#0d0b1a",
    nightBlue: "#18213F",
    purpleDeep: "#21142F",
    grassBase: "#365744",
    grassLight: "#4e775f",
    rockBase: "#1a1e36",
    rockTop: "#2a3152",
    pathDirt: "#665443",
    shadeNormal: () => (colorblindMode ? "#00B3FF" : "#7A3CFF"),
    shadeBody: "#1a0f28",
    warnColor: () => (colorblindMode ? "#FFFFFF" : "#FF5A5F"),
  };

  function toggleColorblind() {
    colorblindMode = !colorblindMode;
    try {
      localStorage.setItem("colorblind", colorblindMode ? "1" : "0");
    } catch (e) {}
    if (colorblindMode) {
      document.body.classList.add("cb-mode");
      showSubtitle("Bảng màu dễ phân biệt: BẬT", "👁️");
    } else {
      document.body.classList.remove("cb-mode");
      showSubtitle("Bảng màu dễ phân biệt: TẮT", "👁️");
    }
  }

  // --- GAME INSTANCE ---
  let sim = new LanternGame.Simulation(42);
  let keys = {};
  let lastTime = performance.now();
  let gameStarted = false;

  // Camera & Visual Smoothness
  let camX = 0;
  let camZ = 0;
  let camShake = 0;
  let facingAngle = Math.PI * 0.5;
  let playerAnimTime = 0;
  let prevCarried = 0;
  let prevFlames = 3;
  let prevLitCount = 0;
  let tenSecAlertTriggered = false;

  // Particle & VFX Systems
  const particles = [];
  const floatingTexts = [];
  const shockwaves = [];
  const islandDecorations = generateIslandDecorations(42);
  const skyStars = generateSkyStars(120);

  // --- INPUT & REBINDING HANDLERS ---
  let recordingAction = null;

  window.addEventListener("keydown", (e) => {
    const k = e.key.toLowerCase();

    // If recording a key rebind
    if (recordingAction) {
      e.preventDefault();
      // Check for conflict
      const conflict = Object.entries(keyBindings).find(([act, key]) => key === k && act !== recordingAction);
      if (conflict) {
        if (elRebindAlert) elRebindAlert.style.display = "block";
        return;
      }
      if (elRebindAlert) elRebindAlert.style.display = "none";
      keyBindings[recordingAction] = k;
      try {
        localStorage.setItem("key_bindings", JSON.stringify(keyBindings));
      } catch (err) {}
      recordingAction = null;
      document.querySelectorAll(".rebind-btn").forEach((b) => b.classList.remove("recording"));
      updateKeyLabels();
      return;
    }

    keys[k] = true;

    // Movement starts game
    const isMovement =
      k === keyBindings.up ||
      k === keyBindings.down ||
      k === keyBindings.left ||
      k === keyBindings.right;
    if (!gameStarted && isMovement) {
      startGame();
    }

    if (k === "r") {
      restartGame();
    } else if (k === "c") {
      toggleColorblind();
    }
  });

  window.addEventListener("keyup", (e) => {
    keys[e.key.toLowerCase()] = false;
  });

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resize);
  resize();

  // Button actions
  elBtnStart.addEventListener("click", () => startGame());
  elBtnHelp.addEventListener("click", () => elHelpModal.classList.add("open"));
  elBtnCloseHelp.addEventListener("click", () => elHelpModal.classList.remove("open"));
  elBtnRestartWin.addEventListener("click", () => restartGame());
  elBtnRestartLose.addEventListener("click", () => restartGame());

  // Accessibility dialog
  elBtnAccess.addEventListener("click", () => elAccessModal.classList.add("open"));
  elBtnCloseAccess.addEventListener("click", () => elAccessModal.classList.remove("open"));
  elBtnResetKeys.addEventListener("click", () => {
    keyBindings = Object.assign({}, DEFAULT_KEYS);
    try {
      localStorage.setItem("key_bindings", JSON.stringify(keyBindings));
    } catch (e) {}
    if (elRebindAlert) elRebindAlert.style.display = "none";
    updateKeyLabels();
  });

  document.querySelectorAll(".rebind-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".rebind-btn").forEach((b) => b.classList.remove("recording"));
      recordingAction = btn.getAttribute("data-action");
      btn.classList.add("recording");
      btn.innerText = "...";
    });
  });

  if (elChkReducedMotion) {
    elChkReducedMotion.addEventListener("change", (e) => {
      reducedMotion = e.target.checked;
      try {
        localStorage.setItem("reduced_motion", reducedMotion ? "1" : "0");
      } catch (err) {}
      if (reducedMotion) document.body.classList.add("reduced-motion");
      else document.body.classList.remove("reduced-motion");
    });
  }

  if (elChkLargeText) {
    elChkLargeText.addEventListener("change", (e) => {
      largeText = e.target.checked;
      try {
        localStorage.setItem("large_text", largeText ? "1" : "0");
      } catch (err) {}
      if (largeText) document.body.classList.add("large-text");
      else document.body.classList.remove("large-text");
    });
  }

  // Leaderboard dialog
  elBtnOpenLeaderboard.addEventListener("click", () => {
    loadAndShowLeaderboard();
  });
  elBtnCloseLead.addEventListener("click", () => elLeaderboardModal.classList.remove("open"));

  function loadAndShowLeaderboard() {
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then((data) => {
        renderLeaderboardTable(data.entries || []);
        elLeaderboardModal.classList.add("open");
      })
      .catch(() => {
        // Fallback to local storage if running strictly offline
        try {
          const local = JSON.parse(localStorage.getItem("leaderboard_cache") || "[]");
          renderLeaderboardTable(local);
        } catch (e) {
          renderLeaderboardTable([]);
        }
        elLeaderboardModal.classList.add("open");
      });
  }

  function renderLeaderboardTable(entries) {
    if (!elLeadBody) return;
    if (!entries || entries.length === 0) {
      elLeadBody.innerHTML = `<tr><td colspan="5" style="text-align:center; opacity:0.6;">Chưa có dữ liệu</td></tr>`;
      return;
    }
    const html = entries.map((e, idx) => {
      const dateStr = e.achieved_at ? new Date(e.achieved_at).toLocaleTimeString("vi-VN") : "--:--";
      return `<tr>
        <td style="font-weight:900; color:var(--gold)">#${idx + 1}</td>
        <td><b>${escapeHtml(e.name)}</b></td>
        <td style="color:#44e57a; font-weight:800;">${e.score}</td>
        <td>${e.nights_won || 0}/3 Đêm</td>
        <td style="font-size:11px; opacity:0.8;">${dateStr}</td>
      </tr>`;
    });
    elLeadBody.innerHTML = html.join("");
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
  }

  // Save score handler
  function saveScore(nameInputId) {
    const input = document.getElementById(nameInputId);
    if (!input) return;
    const name = input.value.trim().slice(0, 12) || "Vo_Danh";
    const entry = {
      name,
      score: sim.score,
      nights_won: sim.state === "won" ? sim.night : Math.max(0, sim.night - 1),
      seed: sim.seed,
    };

    fetch("/api/leaderboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    })
      .then(() => {
        showSubtitle(`Đã lưu điểm cho ${name}!`, "🏆");
        loadAndShowLeaderboard();
      })
      .catch(() => {
        showSubtitle(`Đã lưu điểm cục bộ!`, "🏆");
      });
  }

  if (elBtnSaveScoreWin) elBtnSaveScoreWin.addEventListener("click", () => saveScore("win-player-name"));
  if (elBtnSaveScoreLose) elBtnSaveScoreLose.addEventListener("click", () => saveScore("lose-player-name"));

  function startGame() {
    gameStarted = true;
    elMenuModal.classList.remove("open");
  }

  function restartGame() {
    sim = new LanternGame.Simulation(42);
    camX = sim.player.pos[0];
    camZ = sim.player.pos[2];
    camShake = 0;
    particles.length = 0;
    floatingTexts.length = 0;
    shockwaves.length = 0;
    prevCarried = sim.player.carried;
    prevFlames = sim.player.flames;
    prevLitCount = sim.lanterns.filter((l) => l.lit).length;
    tenSecAlertTriggered = false;
    elVictoryModal.classList.remove("open");
    elDefeatModal.classList.remove("open");
    spawnFloatingText(sim.player.pos[0], sim.player.pos[2], "ĐẢO BẾN MỚI BẮT ĐẦU!", PALETTE.goldWarm);
  }

  elMenuModal.classList.add("open");

  // --- 3D PROJECTION SYSTEM ---
  function project(x, y, z) {
    const scale = Math.min(canvas.width, canvas.height) / 70;
    const relX = x - camX;
    const relZ = z - camZ;
    const tilt = 0.48;

    const screenX = canvas.width / 2 + relX * scale;
    const screenY = canvas.height * 0.54 + relZ * scale * tilt - y * scale;
    const depth = relZ + y * 0.1;

    return { x: screenX, y: screenY, depth, scale };
  }

  // --- WORLD & DECORATIONS ---
  function seededRng(seed) {
    let s = seed >>> 0 || 1;
    return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
  }

  function generateSkyStars(count) {
    const rng = seededRng(1337);
    const stars = [];
    for (let i = 0; i < count; i++) {
      stars.push({
        x: rng(),
        y: rng() * 0.65,
        r: 0.8 + rng() * 1.6,
        twinkleSpeed: 1 + rng() * 3,
        twinkleOffset: rng() * Math.PI * 2,
        color: rng() > 0.3 ? "#FFE8A3" : "#CBE4FF",
      });
    }
    return stars;
  }

  function generateIslandDecorations(seed) {
    const rng = seededRng(seed);
    const decor = [];

    const treeAngles = [0.3, 1.1, 2.2, 3.4, 4.6, 5.7];
    for (let i = 0; i < treeAngles.length; i++) {
      const a = treeAngles[i] + (rng() - 0.5) * 0.2;
      const dist = 18 + rng() * 12;
      decor.push({
        type: "tree",
        x: Math.cos(a) * dist,
        y: 0,
        z: Math.sin(a) * dist,
        height: 28 + rng() * 10,
        canopyRadius: 18 + rng() * 6,
        hue: rng() > 0.5 ? "#2d4e39" : "#3b6348",
      });
    }

    for (let i = 0; i < 18; i++) {
      const a = rng() * Math.PI * 2;
      const dist = 8 + rng() * 26;
      decor.push({
        type: "rock",
        x: Math.cos(a) * dist,
        y: 0,
        z: Math.sin(a) * dist,
        size: 5 + rng() * 7,
      });
    }

    for (let i = 0; i < 40; i++) {
      const a = rng() * Math.PI * 2;
      const dist = 4 + rng() * 32;
      decor.push({
        type: "flower",
        x: Math.cos(a) * dist,
        y: 0,
        z: Math.sin(a) * dist,
        color: rng() > 0.5 ? "#FFE57F" : "#A5D6A7",
      });
    }

    for (let i = -3; i <= 3; i++) {
      decor.push({
        type: "fence",
        x: i * 4,
        y: 0,
        z: 32 + Math.abs(i) * 0.5,
      });
    }

    return decor;
  }

  // --- VFX & FLOATING LABELS ---
  function spawnFloatingText(x, z, text, color = "#FFE8A3") {
    floatingTexts.push({
      x,
      z,
      y: 3.5,
      text,
      color,
      life: 1.0,
      vy: 1.8,
    });
  }

  function spawnShockwave(x, z, maxRadius = 6.0, color = "#FFBF69") {
    shockwaves.push({
      x,
      z,
      radius: 0.5,
      maxRadius,
      color,
      life: 1.0,
    });
  }

  function spawnParticleBurst(x, y, z, count = 12, color = "#FFE8A3") {
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 3.5;
      particles.push({
        x,
        y,
        z,
        vx: Math.cos(ang) * speed,
        vy: 1.0 + Math.random() * 3.0,
        vz: Math.sin(ang) * speed,
        r: 2 + Math.random() * 3,
        color,
        life: 1.0,
        decay: 1.2 + Math.random() * 1.5,
      });
    }
  }

  // --- MAIN RENDER PIPELINE ---
  function render(time) {
    const dt = 1 / 60;
    const nowSec = time * 0.001;

    // Camera follow with lerp
    camX += (sim.player.pos[0] - camX) * 0.08;
    camZ += (sim.player.pos[2] - camZ) * 0.08;

    // Reduced motion eliminates camera shake
    if (!reducedMotion && camShake > 0) {
      camX += (Math.random() - 0.5) * camShake * 0.5;
      camZ += (Math.random() - 0.5) * camShake * 0.5;
      camShake = Math.max(0, camShake - dt * 2.5);
    }

    // Clear Canvas
    ctx.fillStyle = PALETTE.nightDark;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 1. Draw Starry Sky & Moon
    drawSky(nowSec);

    // 2. Draw Sea of Clouds
    drawSeaOfClouds(nowSec);

    // 3. Draw 3D Island Terrain & Cliffs
    drawIslandTerrain(nowSec);

    // 4. Draw Ground Lighting / Safe Zone Quads
    drawGroundLightZones(nowSec);

    // 5. Build Depth-Sorted Entities List (Painter's algorithm)
    const renderList = [];

    for (const d of islandDecorations) {
      const p = project(d.x, d.y, d.z);
      renderList.push({
        depth: p.depth,
        draw: () => drawDecoration(d, p, nowSec),
      });
    }

    for (const l of sim.lanterns) {
      const p = project(l.pos[0], l.pos[1], l.pos[2]);
      renderList.push({
        depth: p.depth,
        draw: () => drawGreatLantern(l, p, nowSec),
      });
    }

    for (const m of sim.motes) {
      const p = project(m.pos[0], m.pos[1], m.pos[2]);
      renderList.push({
        depth: p.depth,
        draw: () => drawFirefly(m, p, nowSec),
      });
    }

    for (const s of sim.shades) {
      const p = project(s.pos[0], s.pos[1], s.pos[2]);
      renderList.push({
        depth: p.depth,
        draw: () => drawShadeEnemy(s, p, nowSec),
      });
    }

    const pPlayer = project(sim.player.pos[0], sim.player.pos[1], sim.player.pos[2]);
    renderList.push({
      depth: pPlayer.depth,
      draw: () => drawMainCharacterMay(pPlayer, nowSec),
    });

    renderList.sort((a, b) => a.depth - b.depth);

    for (const item of renderList) {
      item.draw();
    }

    // 6. Draw Shockwaves & Particles
    drawShockwaves(nowSec);
    drawParticles(dt);
    drawFloatingTexts(dt);

    // 7. Draw Visual Edge Threat Indicators
    drawShadeEdgeIndicators();

    // 8. Update HUD & Subtitles
    updateHUD(nowSec);
  }

  // --- DRAW VISUAL EDGE INDICATORS (ACCESSIBILITY) ---
  function drawShadeEdgeIndicators() {
    const margin = 35;
    for (const s of sim.shades) {
      const p = project(s.pos[0], s.pos[1], s.pos[2]);
      const offscreen = p.x < margin || p.x > canvas.width - margin || p.y < margin || p.y > canvas.height - margin;
      if (offscreen) {
        // Clamp to screen border
        const cx = Math.max(margin, Math.min(canvas.width - margin, p.x));
        const cy = Math.max(margin, Math.min(canvas.height - margin, p.y));

        ctx.save();
        ctx.fillStyle = PALETTE.warnColor();
        ctx.font = "bold 18px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowColor = "#000";
        ctx.shadowBlur = 6;
        ctx.fillText("▲", cx, cy);
        ctx.restore();
      }
    }
  }

  // --- DRAW SKY & MOON ---
  function drawSky(time) {
    const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.75);
    skyGradient.addColorStop(0, "#080614");
    skyGradient.addColorStop(0.5, "#10132b");
    skyGradient.addColorStop(1, "#182045");
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height * 0.8);

    for (const star of skyStars) {
      const sx = star.x * canvas.width;
      const sy = star.y * canvas.height;
      const twinkle = reducedMotion ? 1.0 : 0.5 + 0.5 * Math.sin(time * star.twinkleSpeed + star.twinkleOffset);
      ctx.beginPath();
      ctx.arc(sx, sy, star.r * twinkle, 0, Math.PI * 2);
      ctx.fillStyle = star.color;
      ctx.globalAlpha = 0.3 + 0.6 * twinkle;
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;

    // Glowing Crescent Moon
    const moonX = canvas.width * 0.82;
    const moonY = canvas.height * 0.16;

    const moonGlow = ctx.createRadialGradient(moonX, moonY, 10, moonX, moonY, 90);
    moonGlow.addColorStop(0, "rgba(255, 235, 170, 0.45)");
    moonGlow.addColorStop(0.4, "rgba(255, 215, 120, 0.15)");
    moonGlow.addColorStop(1, "rgba(255, 215, 120, 0)");
    ctx.fillStyle = moonGlow;
    ctx.beginPath();
    ctx.arc(moonX, moonY, 90, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.beginPath();
    ctx.arc(moonX, moonY, 26, 0, Math.PI * 2);
    ctx.fillStyle = "#FFEFAF";
    ctx.shadowColor = "#FFD700";
    ctx.shadowBlur = 18;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(moonX - 9, moonY - 5, 23, 0, Math.PI * 2);
    ctx.fillStyle = "#10132b";
    ctx.shadowBlur = 0;
    ctx.fill();
    ctx.restore();
  }

  // --- DRAW SEA OF CLOUDS ---
  function drawSeaOfClouds(time) {
    const cloudBands = [
      { y: canvas.height * 0.68, speed: 0.15, alpha: 0.28, color: "#1c1b3d" },
      { y: canvas.height * 0.74, speed: 0.25, alpha: 0.38, color: "#25214d" },
      { y: canvas.height * 0.82, speed: 0.35, alpha: 0.48, color: "#16132e" },
    ];

    for (const band of cloudBands) {
      ctx.fillStyle = band.color;
      ctx.globalAlpha = band.alpha;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height);
      ctx.lineTo(0, band.y);

      for (let x = 0; x <= canvas.width; x += 40) {
        const wave = Math.sin(x * 0.008 + time * band.speed) * 16 + Math.cos(x * 0.018 - time * 0.2) * 10;
        ctx.lineTo(x, band.y + wave);
      }
      ctx.lineTo(canvas.width, canvas.height);
      ctx.closePath();
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;
  }

  // --- DRAW 3D ISLAND TERRAIN & ROCK CLIFFS ---
  function drawIslandTerrain(time) {
    const pCenter = project(0, 0, 0);
    const radiusWorld = 40;
    const scale = pCenter.scale;

    // 1. 3D Under-Cliff / Natural Rock layers
    const cliffSteps = 5;
    for (let i = cliffSteps; i >= 1; i--) {
      const dropY = i * 2.8;
      const pCliff = project(0, -dropY, 0);
      const cliffRx = (radiusWorld + (cliffSteps - i) * 1.5) * scale;
      const cliffRz = cliffRx * 0.48;

      ctx.beginPath();
      ctx.ellipse(pCliff.x, pCliff.y, cliffRx, cliffRz, 0, 0, Math.PI * 2);
      ctx.fillStyle = i === cliffSteps ? "#0f0e21" : i % 2 === 0 ? PALETTE.rockBase : PALETTE.rockTop;
      ctx.fill();

      ctx.strokeStyle = "rgba(70, 77, 125, 0.3)";
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }

    // 2. Island Top Lush Grass Diorama
    const grassRx = radiusWorld * scale;
    const grassRz = grassRx * 0.48;

    ctx.beginPath();
    ctx.ellipse(pCenter.x, pCenter.y + 4, grassRx, grassRz, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#1d3228";
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(pCenter.x, pCenter.y, grassRx, grassRz, 0, 0, Math.PI * 2);
    const grassGrad = ctx.createRadialGradient(pCenter.x, pCenter.y, 10, pCenter.x, pCenter.y, grassRx);
    grassGrad.addColorStop(0, PALETTE.grassLight);
    grassGrad.addColorStop(0.7, PALETTE.grassBase);
    grassGrad.addColorStop(1, "#264233");
    ctx.fillStyle = grassGrad;
    ctx.fill();

    ctx.strokeStyle = "rgba(165, 214, 167, 0.4)";
    ctx.lineWidth = 3;
    ctx.stroke();

    // 3. Stylized Curved Dirt Paths
    ctx.save();
    ctx.strokeStyle = PALETTE.pathDirt;
    ctx.lineWidth = 14 * (scale / 12);
    ctx.lineCap = "round";
    ctx.globalAlpha = 0.65;

    for (const l of sim.lanterns) {
      const pL = project(l.pos[0], l.pos[1], l.pos[2]);
      ctx.beginPath();
      ctx.moveTo(pCenter.x, pCenter.y);
      const midX = (pCenter.x + pL.x) * 0.5 + (l.pos[2] > 0 ? 15 : -15);
      const midY = (pCenter.y + pL.y) * 0.5;
      ctx.quadraticCurveTo(midX, midY, pL.x, pL.y);
      ctx.stroke();
    }
    ctx.restore();
  }

  // --- DRAW GROUND LIGHT ZONES & SAFE CIRCLES ---
  function drawGroundLightZones(time) {
    for (const l of sim.lanterns) {
      if (!l.lit) continue;

      const pL = project(l.pos[0], 0, l.pos[2]);
      const safeR = 6.0;
      const screenSafeR = safeR * pL.scale;

      const lowFuel = l.fuel !== undefined && l.fuel < 30;
      const alphaPulse = lowFuel && !reducedMotion ? 0.3 + 0.25 * Math.sin(time * 6.28) : 0.65;

      const glowGrad = ctx.createRadialGradient(pL.x, pL.y, 4, pL.x, pL.y, screenSafeR);
      glowGrad.addColorStop(0, `rgba(255, 191, 105, ${alphaPulse * 0.7})`);
      glowGrad.addColorStop(0.6, `rgba(255, 160, 50, ${alphaPulse * 0.3})`);
      glowGrad.addColorStop(1, "rgba(255, 160, 50, 0)");

      ctx.save();
      ctx.beginPath();
      ctx.ellipse(pL.x, pL.y, screenSafeR, screenSafeR * 0.48, 0, 0, Math.PI * 2);
      ctx.fillStyle = glowGrad;
      ctx.fill();

      if (!lowFuel) {
        ctx.strokeStyle = "rgba(255, 232, 163, 0.45)";
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 6]);
        ctx.stroke();
      } else {
        ctx.strokeStyle = colorblindMode ? "rgba(255, 255, 255, 0.6)" : "rgba(255, 90, 95, 0.6)";
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  // --- DRAW MAIN CHARACTER: MÂY ---
  function drawMainCharacterMay(p, time) {
    const isMoving = Math.abs(sim.input.move[0]) > 0.1 || Math.abs(sim.input.move[1]) > 0.1;
    const isInvuln = sim.invuln > 0;

    if (isMoving) {
      facingAngle = Math.atan2(sim.input.move[1], sim.input.move[0]);
      playerAnimTime += 0.25;
    } else {
      playerAnimTime += 0.05;
    }

    const bob = reducedMotion ? 0 : Math.sin(playerAnimTime * 2) * (isMoving ? 3 : 1.5);
    const legSwing = isMoving ? Math.sin(playerAnimTime * 4) * 5 : 0;
    const s = p.scale / 12;

    ctx.save();
    ctx.translate(p.x, p.y);

    if (isInvuln && !reducedMotion && Math.floor(time * 20) % 2 === 0) {
      ctx.globalAlpha = 0.45;
    }

    // 1. Soft Contact Shadow
    const shadowScale = Math.max(0.4, 1.0 - sim.player.pos[1] * 0.35);
    ctx.beginPath();
    ctx.ellipse(0, 0, 14 * s * shadowScale, 6 * s * shadowScale, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(10, 8, 20, 0.65)";
    ctx.fill();

    ctx.translate(0, -bob - 4 * s);

    // 2. Legs & Shoes
    ctx.fillStyle = "#223355";
    ctx.fillRect(-7 * s + legSwing * 0.5, -12 * s, 4.5 * s, 10 * s);
    ctx.fillRect(2.5 * s - legSwing * 0.5, -12 * s, 4.5 * s, 10 * s);

    ctx.fillStyle = "#111827";
    ctx.fillRect(-8 * s + legSwing * 0.5, -3 * s, 5.5 * s, 3.5 * s);
    ctx.fillRect(2 * s - legSwing * 0.5, -3 * s, 5.5 * s, 3.5 * s);

    // 3. Cream Tunic / Áo bà ba vải kem
    ctx.fillStyle = "#F7F2E7";
    ctx.beginPath();
    ctx.roundRect(-10 * s, -28 * s, 20 * s, 18 * s, 6 * s);
    ctx.fill();
    ctx.fillStyle = "#8d5b32";
    ctx.fillRect(-10 * s, -14 * s, 20 * s, 3 * s);

    // 4. Firefly Satchel / Túi đeo chéo đựng đom đóm
    ctx.save();
    ctx.fillStyle = "#6b4226";
    ctx.beginPath();
    ctx.roundRect(5 * s, -17 * s, 8 * s, 8 * s, 3 * s);
    ctx.fill();
    ctx.strokeStyle = "#4a2c16";
    ctx.lineWidth = 2 * s;
    ctx.beginPath();
    ctx.moveTo(-9 * s, -26 * s);
    ctx.lineTo(8 * s, -14 * s);
    ctx.stroke();

    if (sim.player.carried > 0) {
      const bagGlow = ctx.createRadialGradient(9 * s, -13 * s, 1, 9 * s, -13 * s, 8 * s);
      bagGlow.addColorStop(0, "rgba(255, 232, 163, 0.9)");
      bagGlow.addColorStop(1, "rgba(255, 191, 105, 0)");
      ctx.fillStyle = bagGlow;
      ctx.beginPath();
      ctx.arc(9 * s, -13 * s, 8 * s, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 5. Cute Little Lantern at Hip
    const hipLanternSwing = reducedMotion ? 0 : Math.sin(playerAnimTime * 3) * 3;
    ctx.save();
    ctx.translate(-9 * s, -12 * s + hipLanternSwing);
    ctx.fillStyle = "#b5722b";
    ctx.fillRect(-2 * s, 0, 4 * s, 6 * s);
    ctx.fillStyle = "#ffe066";
    ctx.beginPath();
    ctx.arc(0, 3 * s, 3 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 6. Yellow Scarf / Khăn choàng vàng
    ctx.fillStyle = "#FFD166";
    ctx.beginPath();
    ctx.roundRect(-11 * s, -30 * s, 22 * s, 6 * s, 3 * s);
    ctx.fill();
    const scarfFlutter = reducedMotion ? 0 : Math.sin(time * 5) * 4 * s;
    ctx.beginPath();
    ctx.moveTo(-7 * s, -27 * s);
    ctx.quadraticCurveTo(-14 * s + scarfFlutter, -22 * s, -16 * s + scarfFlutter, -16 * s);
    ctx.lineTo(-12 * s + scarfFlutter, -16 * s);
    ctx.closePath();
    ctx.fill();

    // 7. Chibi Round Head & Face
    ctx.fillStyle = "#fddcb4";
    ctx.beginPath();
    ctx.arc(0, -36 * s, 12 * s, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#1e1e24";
    ctx.beginPath();
    ctx.arc(0, -38 * s, 12.5 * s, Math.PI * 0.9, Math.PI * 2.1);
    ctx.fill();

    const eyeOffsetX = Math.cos(facingAngle) * 3 * s;
    ctx.fillStyle = "#1a120b";
    ctx.beginPath();
    ctx.ellipse(-4 * s + eyeOffsetX, -36 * s, 1.8 * s, 2.4 * s, 0, 0, Math.PI * 2);
    ctx.ellipse(4 * s + eyeOffsetX, -36 * s, 1.8 * s, 2.4 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(-3.5 * s + eyeOffsetX, -37 * s, 0.8 * s, 0, Math.PI * 2);
    ctx.arc(4.5 * s + eyeOffsetX, -37 * s, 0.8 * s, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(255, 138, 128, 0.55)";
    ctx.beginPath();
    ctx.arc(-7 * s + eyeOffsetX, -33 * s, 2 * s, 0, Math.PI * 2);
    ctx.arc(7 * s + eyeOffsetX, -33 * s, 2 * s, 0, Math.PI * 2);
    ctx.fill();

    // 8. Iconic Vietnamese Conical Hat / Nón Lá Cách Điệu
    const hatTilt = isMoving && !reducedMotion ? Math.sin(playerAnimTime * 2) * 0.08 : 0;
    ctx.save();
    ctx.translate(0, -42 * s);
    ctx.rotate(hatTilt);

    ctx.beginPath();
    ctx.moveTo(0, -16 * s);
    ctx.lineTo(22 * s, 4 * s);
    ctx.quadraticCurveTo(0, 7 * s, -22 * s, 4 * s);
    ctx.closePath();
    const hatGrad = ctx.createLinearGradient(0, -16 * s, 0, 5 * s);
    hatGrad.addColorStop(0, "#ffeaa7");
    hatGrad.addColorStop(0.5, "#fdcb6e");
    hatGrad.addColorStop(1, "#e17055");
    ctx.fillStyle = hatGrad;
    ctx.fill();

    ctx.strokeStyle = "rgba(180, 100, 30, 0.35)";
    ctx.lineWidth = 1 * s;
    for (let r = 5; r <= 15; r += 4) {
      ctx.beginPath();
      ctx.ellipse(0, -16 * s + r * 1.3 * s, r * 1.2 * s, r * 0.4 * s, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.strokeStyle = "#ff7675";
    ctx.lineWidth = 1.8 * s;
    ctx.beginPath();
    ctx.moveTo(-16 * s, 3 * s);
    ctx.quadraticCurveTo(0, 12 * s, 16 * s, 3 * s);
    ctx.stroke();

    ctx.restore();
    ctx.restore();
  }

  // --- DRAW 5 GREAT LANTERNS ---
  function drawGreatLantern(lantern, p, time) {
    const s = p.scale / 12;
    const isLit = lantern.lit;
    const lowFuel = isLit && lantern.fuel !== undefined && lantern.fuel < 30;
    const isSquished = !isLit && colorblindMode;

    ctx.save();
    ctx.translate(p.x, p.y);

    ctx.beginPath();
    ctx.ellipse(0, 0, 22 * s, 11 * s, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#22253b";
    ctx.fill();
    ctx.strokeStyle = "#3e4466";
    ctx.lineWidth = 2 * s;
    ctx.stroke();

    const height = (isSquished ? 36 : 45) * s;
    ctx.fillStyle = isLit ? "#8a2b2b" : "#382333";
    ctx.fillRect(-12 * s, -height, 4 * s, height);
    ctx.fillRect(8 * s, -height, 4 * s, height);

    const blinkOff = lowFuel && !reducedMotion && Math.floor(time * 2) % 2 === 0;

    let silkColor = "#2b2238";
    if (isLit) {
      silkColor = blinkOff ? "#8a5b22" : "#ffb13b";
    }

    ctx.beginPath();
    ctx.roundRect(-10 * s, -height + 6 * s, 20 * s, height - 12 * s, 4 * s);
    ctx.fillStyle = silkColor;
    ctx.fill();

    if (isLit && !blinkOff) {
      const glow = ctx.createRadialGradient(0, -height * 0.5, 4 * s, 0, -height * 0.5, 36 * s);
      glow.addColorStop(0, "rgba(255, 235, 160, 0.85)");
      glow.addColorStop(0.5, "rgba(255, 177, 59, 0.4)");
      glow.addColorStop(1, "rgba(255, 177, 59, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(-36 * s, -height - 20 * s, 72 * s, height + 40 * s);
    }

    ctx.beginPath();
    ctx.moveTo(0, -height - 14 * s);
    ctx.lineTo(18 * s, -height);
    ctx.quadraticCurveTo(0, -height - 4 * s, -18 * s, -height);
    ctx.closePath();
    ctx.fillStyle = isLit ? "#b33939" : "#3b2d42";
    ctx.fill();
    ctx.strokeStyle = "#ffeaa7";
    ctx.lineWidth = 1.5 * s;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, -height - 14 * s, 3.5 * s, 0, Math.PI * 2);
    ctx.fillStyle = "#FFD700";
    ctx.fill();

    const tasselSwing = reducedMotion ? 0 : Math.sin(time * 3) * 2 * s;
    ctx.strokeStyle = "#ff7675";
    ctx.lineWidth = 1.5 * s;
    ctx.beginPath();
    ctx.moveTo(-18 * s, -height);
    ctx.lineTo(-20 * s + tasselSwing, -height + 8 * s);
    ctx.moveTo(18 * s, -height);
    ctx.lineTo(20 * s + tasselSwing, -height + 8 * s);
    ctx.stroke();

    // Floating Fuel Bar
    const barW = 34 * s;
    const barH = 5 * s;
    const barY = -height - 24 * s;

    ctx.fillStyle = "rgba(10, 8, 20, 0.8)";
    ctx.fillRect(-barW * 0.5, barY, barW, barH);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    ctx.lineWidth = 1;
    ctx.strokeRect(-barW * 0.5, barY, barW, barH);

    if (isLit) {
      const pct = Math.max(0, Math.min(1, (lantern.fuel || 0) / 100));
      const fuelCol = pct < 0.3 ? (colorblindMode ? "#FFFFFF" : "#FF5A5F") : "#44e57a";
      ctx.fillStyle = fuelCol;
      ctx.fillRect(-barW * 0.5 + 1, barY + 1, (barW - 2) * pct, barH - 2);

      if (lowFuel) {
        ctx.fillStyle = colorblindMode ? "#FFFFFF" : "#FF5A5F";
        ctx.font = `bold ${Math.round(12 * s)}px sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText("⚠ SẮP TẮT", 0, barY - 4 * s);
      }
    } else {
      const cost = lantern.ever_lit ? 5 : 10;
      const pct = Math.max(0, Math.min(1, (lantern.deposited || 0) / cost));
      ctx.fillStyle = "#ffb703";
      ctx.fillRect(-barW * 0.5 + 1, barY + 1, (barW - 2) * pct, barH - 2);

      ctx.fillStyle = "#cbd5e1";
      ctx.font = `bold ${Math.round(9 * s)}px sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(`${lantern.deposited || 0}/${cost}`, 0, barY - 4 * s);
    }

    ctx.restore();
  }

  // --- DRAW FIREFLY ---
  function drawFirefly(mote, p, time) {
    const s = p.scale / 12;
    const bob = reducedMotion ? 0 : Math.sin(time * 3 + mote.pos[0] * 2) * 4 * s;
    const wingFlap = reducedMotion ? 0 : Math.sin(time * 18);

    ctx.save();
    ctx.translate(p.x, p.y + bob);

    const glow = ctx.createRadialGradient(0, 0, 1, 0, 0, 14 * s);
    glow.addColorStop(0, "rgba(255, 245, 180, 0.9)");
    glow.addColorStop(0.4, "rgba(255, 215, 60, 0.4)");
    glow.addColorStop(1, "rgba(255, 215, 60, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, 14 * s, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, 0, 4.2 * s, 0, Math.PI * 2);
    ctx.fillStyle = "#FFE8A3";
    ctx.fill();

    ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
    ctx.beginPath();
    ctx.ellipse(-3 * s, -3 * s * wingFlap, 3.5 * s, 1.8 * s, -0.4, 0, Math.PI * 2);
    ctx.ellipse(3 * s, -3 * s * wingFlap, 3.5 * s, 1.8 * s, 0.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // --- DRAW SHADE ENEMY ---
  function drawShadeEnemy(shade, p, time) {
    const s = p.scale / 12;
    const isStunned = shade.state === "stunned";
    const isDrain = shade.state === "drain";

    const wobbleX = reducedMotion ? 1.0 : 1.0 + Math.sin(time * 4 + shade.pos[0]) * 0.12;
    const wobbleY = reducedMotion ? 1.0 : 1.0 - Math.sin(time * 4 + shade.pos[0]) * 0.12;

    ctx.save();
    ctx.translate(p.x, p.y);

    ctx.beginPath();
    ctx.ellipse(0, 0, 12 * s, 5 * s, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(10, 5, 20, 0.7)";
    ctx.fill();

    ctx.save();
    ctx.translate(0, -14 * s);
    ctx.scale(wobbleX, wobbleY);

    ctx.beginPath();
    ctx.arc(0, -6 * s, 10 * s, Math.PI, 0, false);
    ctx.quadraticCurveTo(8 * s, 8 * s, 4 * s, 12 * s);
    ctx.quadraticCurveTo(0, 8 * s, -4 * s, 12 * s);
    ctx.quadraticCurveTo(-8 * s, 8 * s, -10 * s, -6 * s);
    ctx.closePath();

    ctx.fillStyle = isDrain ? "#40102a" : PALETTE.shadeBody;
    ctx.fill();

    ctx.strokeStyle = PALETTE.shadeNormal();
    ctx.lineWidth = 2 * s;
    ctx.stroke();

    if (isStunned) {
      ctx.strokeStyle = "#FFE8A3";
      ctx.lineWidth = 1.5 * s;
      ctx.beginPath();
      ctx.arc(-4 * s, -6 * s, 3 * s, 0, Math.PI * 1.5);
      ctx.arc(4 * s, -6 * s, 3 * s, 0, Math.PI * 1.5);
      ctx.stroke();
    } else {
      ctx.fillStyle = PALETTE.shadeNormal();
      ctx.beginPath();
      ctx.ellipse(-4 * s, -6 * s, 2.5 * s, 3.5 * s, 0, 0, Math.PI * 2);
      ctx.ellipse(4 * s, -6 * s, 2.5 * s, 3.5 * s, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    if (isStunned) {
      const starAng = time * 5;
      for (let i = 0; i < 3; i++) {
        const a = starAng + (i * Math.PI * 2) / 3;
        const starX = Math.cos(a) * 12 * s;
        const starY = -28 * s + Math.sin(a) * 4 * s;
        ctx.fillStyle = "#FFE8A3";
        ctx.beginPath();
        ctx.arc(starX, starY, 2 * s, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (isDrain && shade.target_lantern_id) {
      const targetLantern = sim.lanterns.find((l) => l.id === shade.target_lantern_id);
      if (targetLantern) {
        const pL = project(targetLantern.pos[0], targetLantern.pos[1] + 1.5, targetLantern.pos[2]);
        ctx.save();
        ctx.strokeStyle = "rgba(255, 68, 68, 0.75)";
        ctx.lineWidth = 3 * s;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(0, -14 * s);
        ctx.lineTo(pL.x - p.x, pL.y - p.y);
        ctx.stroke();
        ctx.restore();
      }
    }

    ctx.restore();
  }

  // --- DRAW DECORATIONS ---
  function drawDecoration(d, p, time) {
    const s = p.scale / 12;

    ctx.save();
    ctx.translate(p.x, p.y);

    if (d.type === "tree") {
      ctx.beginPath();
      ctx.ellipse(0, 0, 8 * s, 4 * s, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(10, 8, 20, 0.6)";
      ctx.fill();

      ctx.fillStyle = "#4a3525";
      ctx.beginPath();
      ctx.moveTo(-4 * s, 0);
      ctx.quadraticCurveTo(-6 * s, -d.height * 0.5 * s, 0, -d.height * s);
      ctx.lineTo(5 * s, -d.height * s);
      ctx.quadraticCurveTo(2 * s, -d.height * 0.5 * s, 5 * s, 0);
      ctx.closePath();
      ctx.fill();

      const canopyY = -d.height * s;
      ctx.beginPath();
      ctx.arc(0, canopyY, d.canopyRadius * s, 0, Math.PI * 2);
      ctx.fillStyle = d.hue;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(-4 * s, canopyY - 4 * s, d.canopyRadius * 0.6 * s, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
      ctx.fill();
    } else if (d.type === "rock") {
      ctx.beginPath();
      ctx.ellipse(0, 0, d.size * s, d.size * 0.55 * s, 0, 0, Math.PI * 2);
      ctx.fillStyle = "#2d334d";
      ctx.fill();
      ctx.strokeStyle = "#434b6e";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    } else if (d.type === "flower") {
      const sway = reducedMotion ? 0 : Math.sin(time * 2 + d.x) * 2 * s;
      ctx.fillStyle = d.color;
      ctx.beginPath();
      ctx.arc(sway, -3 * s, 2.2 * s, 0, Math.PI * 2);
      ctx.fill();
    } else if (d.type === "fence") {
      ctx.fillStyle = "#5c4033";
      ctx.fillRect(-2 * s, -10 * s, 4 * s, 10 * s);
      ctx.fillRect(-8 * s, -8 * s, 16 * s, 2.5 * s);
    }

    ctx.restore();
  }

  // --- DRAW PARTICLES & SHOCKWAVES ---
  function drawShockwaves(time) {
    for (let i = shockwaves.length - 1; i >= 0; i--) {
      const sw = shockwaves[i];
      sw.radius += 0.35;
      sw.life -= 0.04;

      if (sw.life <= 0) {
        shockwaves.splice(i, 1);
        continue;
      }

      const p = project(sw.x, 0, sw.z);
      const screenR = sw.radius * p.scale;

      ctx.save();
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, screenR, screenR * 0.48, 0, 0, Math.PI * 2);
      ctx.strokeStyle = sw.color;
      ctx.lineWidth = 6 * sw.life;
      ctx.globalAlpha = sw.life;
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawParticles(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const pt = particles[i];
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.z += pt.vz * dt;
      pt.life -= pt.decay * dt;

      if (pt.life <= 0) {
        particles.splice(i, 1);
        continue;
      }

      const p = project(pt.x, Math.max(0, pt.y), pt.z);
      ctx.beginPath();
      ctx.arc(p.x, p.y, pt.r * pt.life, 0, Math.PI * 2);
      ctx.fillStyle = pt.color;
      ctx.globalAlpha = pt.life;
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;
  }

  function drawFloatingTexts(dt) {
    ctx.save();
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
      const ft = floatingTexts[i];
      ft.y += ft.vy * dt;
      ft.life -= 1.0 * dt;

      if (ft.life <= 0) {
        floatingTexts.splice(i, 1);
        continue;
      }

      const p = project(ft.x, ft.y, ft.z);
      ctx.font = "bold 15px sans-serif";
      ctx.textAlign = "center";
      ctx.fillStyle = ft.color;
      ctx.globalAlpha = ft.life;
      ctx.shadowColor = "#000";
      ctx.shadowBlur = 6;
      ctx.fillText(ft.text, p.x, p.y);
    }
    ctx.restore();
  }

  // --- UPDATE HUD & ACCESSIBILITY ALERTS ---
  function updateHUD(time) {
    // 1. Flames (HP)
    if (elFlamesRow) {
      const flamesHtml = [];
      for (let i = 0; i < 3; i++) {
        const isLost = i >= sim.player.flames;
        flamesHtml.push(`<span class="flame-icon ${isLost ? "lost" : ""}">🔥</span>`);
      }
      elFlamesRow.innerHTML = flamesHtml.join("");
    }

    // 2. Motes bar & Capacity
    const capacity = Math.min(20, 10 + 2 * (sim.successfulLights || 0));
    const carriedPct = Math.min(100, (sim.player.carried / capacity) * 100);
    elMoteFill.style.width = `${carriedPct}%`;
    elMoteLabel.innerText = `✨ ${sim.player.carried}/${capacity}`;

    // 3. Lanterns track
    const litCount = sim.lanterns.filter((l) => l.lit).length;
    const required = Math.ceil(sim.lanterns.length * 0.6);
    const lanternPills = sim.lanterns.map((l) => {
      const isLit = l.lit;
      const isLow = isLit && l.fuel !== undefined && l.fuel < 30;
      return `<span class="lantern-pill ${isLit ? "lit" : ""} ${isLow ? "low" : ""}">🏮</span>`;
    });
    elLanternTrack.innerHTML = lanternPills.join("");

    // 4. Score & Timer
    elScoreBox.innerText = `${sim.score} ĐIỂM`;
    elTimerBox.innerText = `${Math.ceil(sim.timeLeft)}s`;

    // 5. Cooldowns
    const pulseCdPct = Math.min(1, sim.cooldown / 3.0);
    elCdPulse.style.height = `${pulseCdPct * 100}%`;

    const dashCdPct = Math.min(1, sim.dashCd / 90.0);
    elCdDash.style.height = `${dashCdPct * 100}%`;

    // 6. Interactive Prompt
    const getNearestLantern = (player, lanterns, radius, fuelMax) => {
      if (typeof LanternRules !== "undefined" && LanternRules && typeof LanternRules.nearest === "function") {
        return LanternRules.nearest(player, lanterns, radius, fuelMax);
      }
      const max = fuelMax !== undefined ? fuelMax : 100;
      return lanterns
        .filter((l) => {
          const d = Math.hypot(player.pos[0] - l.pos[0], player.pos[2] - l.pos[2]);
          return d <= radius && (!l.lit || (l.lit && l.fuel < max));
        })
        .sort((a, b) => {
          const da = Math.hypot(player.pos[0] - a.pos[0], player.pos[2] - a.pos[2]);
          const db = Math.hypot(player.pos[0] - b.pos[0], player.pos[2] - b.pos[2]);
          return da - db || a.id.localeCompare(b.id);
        })[0];
    };

    const nearestLantern = getNearestLantern(
      sim.player,
      sim.lanterns,
      LanternGame.T.interact_radius,
      LanternGame.T.fuel_max
    );

    if (nearestLantern && sim.state === "playing") {
      elInteractionPrompt.classList.add("show");
      if (!nearestLantern.lit) {
        const cost = nearestLantern.ever_lit ? LanternGame.T.relight_cost : LanternGame.T.lantern_cost;
        const remain = cost - (nearestLantern.deposited || 0);
        elPromptText.innerText = `Thắp Đèn Lồng (Cần ${remain} đom đóm)`;
      } else {
        const need = Math.ceil((100 - (nearestLantern.fuel || 0)) / 10);
        elPromptText.innerText = `Châm Dầu Đèn Lồng (Cần ${need} đom đóm)`;
      }
    } else {
      elInteractionPrompt.classList.remove("show");
    }

    // 7. Subtitle alerts
    if (subtitleTimer > 0) {
      subtitleTimer -= 1 / 60;
      if (subtitleTimer <= 0) {
        elSubtitleBanner.classList.remove("show");
      }
    }

    // 10s countdown alert
    if (sim.state === "playing" && sim.timeLeft <= 10 && !tenSecAlertTriggered) {
      tenSecAlertTriggered = true;
      showSubtitle("10 giây cuối trước Bình Minh!", "⏰", 4.0);
    }

    // Wind warning (Night 3)
    if (sim.night === 3 && sim.wind && sim.wind.active && sim.simTick % 1800 === 120) {
      showSubtitle("Gió mạnh đang thổi trên đảo!", "🌪️", 3.0);
    }

    // Low fuel warning
    const hasLowFuelLantern = sim.lanterns.some((l) => l.lit && l.fuel < 30);
    if (hasLowFuelLantern && Math.floor(time) % 8 === 0) {
      showSubtitle("Đèn Lớn cạn dầu! Hãy châm thêm đom đóm!", "🏮", 2.0);
    }

    // 8. Event reactions
    if (sim.player.carried > prevCarried) {
      spawnFloatingText(sim.player.pos[0], sim.player.pos[2], `+${sim.player.carried - prevCarried} ĐOM ĐÓM`, "#FFE8A3");
    }
    if (sim.player.flames < prevFlames) {
      if (!reducedMotion) camShake = 14;
      spawnFloatingText(sim.player.pos[0], sim.player.pos[2], "-1 NGỌN LỬA!", "#FF5A5F");
    }
    if (litCount > prevLitCount) {
      spawnShockwave(sim.player.pos[0], sim.player.pos[2], 8.0, "#FFBF69");
      spawnFloatingText(sim.player.pos[0], sim.player.pos[2], "ĐÈN ĐÃ RỰC SÁNG!", "#44e57a");
    }
    prevCarried = sim.player.carried;
    prevFlames = sim.player.flames;
    prevLitCount = litCount;

    // 9. Victory & Defeat Modals
    if (sim.state === "won" && !elVictoryModal.classList.contains("open")) {
      elWinScore.innerText = `${sim.score}`;
      elWinLanterns.innerText = `${litCount}/${sim.lanterns.length}`;
      elVictoryModal.classList.add("open");
    } else if (sim.state === "lost" && !elDefeatModal.classList.contains("open")) {
      elLoseScore.innerText = `${sim.score}`;
      elLoseLanterns.innerText = `${litCount}/${sim.lanterns.length}`;
      elDefeatReason.innerText =
        sim.player.flames <= 0
          ? "Bé Mây đã kiệt sức khi ngọn lửa sinh mệnh vụt tắt..."
          : "Bình minh đến nhưng không giữ đủ 3/5 ngọn đèn để đẩy lùi sương đen.";
      elDefeatModal.classList.add("open");
    }
  }

  // --- GAME MAIN LOOP ---
  function loop(now) {
    while (now - lastTime >= 1000 / 60) {
      if (gameStarted && sim.state === "playing") {
        const moveX = (keys[keyBindings.right] ? 1 : 0) - (keys[keyBindings.left] ? 1 : 0);
        const moveZ = (keys[keyBindings.down] ? 1 : 0) - (keys[keyBindings.up] ? 1 : 0);

        const events = sim.step({
          move: [moveX, moveZ],
          jump: !!keys[keyBindings.jump],
          interact: !!keys[keyBindings.interact],
          pulse: !!keys[keyBindings.pulse],
          dash: !!keys[keyBindings.dash],
          cam_yaw_deg: 0,
        });

        for (const ev of events) {
          if (ev.name === "pulse") {
            if (!reducedMotion) camShake = 8;
            spawnShockwave(sim.player.pos[0], sim.player.pos[2], 6.0, "#FFE8A3");
            spawnParticleBurst(sim.player.pos[0], 1.5, sim.player.pos[2], 25, "#FFBF69");
          } else if (ev.name === "dash") {
            spawnParticleBurst(sim.player.pos[0], 0.5, sim.player.pos[2], 10, "#E0F2FE");
          } else if (ev.name === "shade_spawned") {
            showSubtitle("Bóng Mực xuất hiện!", "👾", 2.5);
          }
        }
      }
      lastTime += 1000 / 60;
    }

    render(now);
    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
})();
