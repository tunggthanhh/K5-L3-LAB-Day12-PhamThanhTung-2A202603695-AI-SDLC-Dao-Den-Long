/**
 * ĐẢO ĐÈN LỒNG — Lantern Island
 * Senior 3D Stylized Diorama Canvas Engine & Presentation Layer
 *
 * Designed & Engineered to render a cozy, beautiful Stylized Fantasy Island
 * while perfectly keeping deterministic simulation and test contract integrity.
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
  const elCdPulse = document.getElementById("cd-pulse");
  const elCdDash = document.getElementById("cd-dash");

  // Modals
  const elMenuModal = document.getElementById("menu-modal");
  const elHelpModal = document.getElementById("help-modal");
  const elVictoryModal = document.getElementById("victory-modal");
  const elDefeatModal = document.getElementById("defeat-modal");
  const elBtnStart = document.getElementById("btn-start");
  const elBtnHelp = document.getElementById("btn-help");
  const elBtnCloseHelp = document.getElementById("btn-close-help");
  const elBtnRestartWin = document.getElementById("btn-restart-win");
  const elBtnRestartLose = document.getElementById("btn-restart-lose");
  const elWinScore = document.getElementById("win-score");
  const elWinLanterns = document.getElementById("win-lanterns");
  const elLoseScore = document.getElementById("lose-score");
  const elLoseLanterns = document.getElementById("lose-lanterns");
  const elDefeatReason = document.getElementById("defeat-reason");

  // --- COLORBLIND & PALETTE SYSTEM ---
  let colorblindMode = false;
  try {
    colorblindMode = localStorage.getItem("colorblind") === "1";
    if (colorblindMode) document.body.classList.add("cb-mode");
  } catch (e) {}

  function toggleColorblind() {
    colorblindMode = !colorblindMode;
    try {
      localStorage.setItem("colorblind", colorblindMode ? "1" : "0");
    } catch (e) {}
    if (colorblindMode) {
      document.body.classList.add("cb-mode");
      spawnFloatingText(sim.player.pos[0], sim.player.pos[2], "Bảng màu dễ phân biệt: BẬT", "#00B3FF");
    } else {
      document.body.classList.remove("cb-mode");
      spawnFloatingText(sim.player.pos[0], sim.player.pos[2], "Bảng màu dễ phân biệt: TẮT", "#FFBF69");
    }
  }

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

  // --- GAME INSTANCE & CONTROLS ---
  let sim = new LanternGame.Simulation(42);
  let keys = {};
  let lastTime = performance.now();
  let gameStarted = false;
  let hasInteractedOnce = false;

  // Camera & Visual Smoothness
  let camX = 0;
  let camZ = 0;
  let camShake = 0;
  let facingAngle = Math.PI * 0.5; // facing South initially
  let playerAnimTime = 0;
  let prevCarried = 0;
  let prevFlames = 3;
  let prevLitCount = 0;

  // Particle & VFX Systems
  const particles = [];
  const floatingTexts = [];
  const shockwaves = [];
  const fireflyVisuals = new Map(); // id -> {wingAngle, bobOffset}

  // Pre-generated static decorative island features (trees, rocks, flowers)
  const islandDecorations = generateIslandDecorations(42);
  const skyStars = generateSkyStars(120);

  // --- INPUT LISTENERS ---
  window.addEventListener("keydown", (e) => {
    const k = e.key.toLowerCase();
    keys[k] = true;

    if (!gameStarted && (k === "w" || k === "a" || k === "s" || k === "d" || k === " ")) {
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

  // Window resize
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resize);
  resize();

  // Button clicks
  elBtnStart.addEventListener("click", () => startGame());
  elBtnHelp.addEventListener("click", () => elHelpModal.classList.add("open"));
  elBtnCloseHelp.addEventListener("click", () => elHelpModal.classList.remove("open"));
  elBtnRestartWin.addEventListener("click", () => restartGame());
  elBtnRestartLose.addEventListener("click", () => restartGame());

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
    elVictoryModal.classList.remove("open");
    elDefeatModal.classList.remove("open");
    spawnFloatingText(sim.player.pos[0], sim.player.pos[2], "ĐẢO BẾN MỚI BẮT ĐẦU!", PALETTE.goldWarm);
  }

  // Show menu at start if not yet moved
  elMenuModal.classList.add("open");

  // --- 3D PROJECTION SYSTEM ---
  // Transforms 3D world coords (X, Y, Z) to 2D screen coords (ScreenX, ScreenY)
  // using smooth isometric-perspective projection with dynamic camera tracking
  function project(x, y, z) {
    const scale = Math.min(canvas.width, canvas.height) / 70;
    const relX = x - camX;
    const relZ = z - camZ;
    const tilt = 0.48; // Isometric tilt ratio

    const screenX = canvas.width / 2 + relX * scale;
    const screenY = canvas.height * 0.54 + relZ * scale * tilt - y * scale;
    const depth = relZ + y * 0.1; // For Painter's algorithm depth sorting

    return { x: screenX, y: screenY, depth, scale };
  }

  // --- PROCEDURAL WORLD GENERATION ---
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
        y: rng() * 0.65, // upper sky
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

    // Ancient Stylized Trees
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

    // Mossy Boulders & Small Rocks
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

    // Glowing Wildflowers & Bush Clumps
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

    // Rustic Wooden Fence Sections near harbor pier
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

    // Camera follow player with smooth damping
    const targetCamX = sim.player.pos[0];
    const targetCamZ = sim.player.pos[2];
    camX += (targetCamX - camX) * 0.08;
    camZ += (targetCamZ - camZ) * 0.08;

    // Camera shake
    if (camShake > 0) {
      camX += (Math.random() - 0.5) * camShake * 0.5;
      camZ += (Math.random() - 0.5) * camShake * 0.5;
      camShake = Math.max(0, camShake - dt * 2.5);
    }

    // Clear Canvas
    ctx.fillStyle = PALETTE.nightDark;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 1. Draw Starry Sky & Moon
    drawSky(nowSec);

    // 2. Draw Rolling Sea of Clouds below island
    drawSeaOfClouds(nowSec);

    // 3. Draw 3D Island Base, Rock Cliffs & Paths
    drawIslandTerrain(nowSec);

    // 4. Draw Ground Lighting / Safe Zone Quads
    drawGroundLightZones(nowSec);

    // 5. Build Depth-Sorted Entities List (Painter's Algorithm)
    const renderList = [];

    // Decorations (trees, rocks, flowers, fences)
    for (const d of islandDecorations) {
      const p = project(d.x, d.y, d.z);
      renderList.push({
        depth: p.depth,
        draw: () => drawDecoration(d, p, nowSec),
      });
    }

    // 5 Great Lanterns
    for (const l of sim.lanterns) {
      const p = project(l.pos[0], l.pos[1], l.pos[2]);
      renderList.push({
        depth: p.depth,
        draw: () => drawGreatLantern(l, p, nowSec),
      });
    }

    // Fireflies (Motes)
    for (const m of sim.motes) {
      const p = project(m.pos[0], m.pos[1], m.pos[2]);
      renderList.push({
        depth: p.depth,
        draw: () => drawFirefly(m, p, nowSec),
      });
    }

    // Enemies (Shades)
    for (const s of sim.shades) {
      const p = project(s.pos[0], s.pos[1], s.pos[2]);
      renderList.push({
        depth: p.depth,
        draw: () => drawShadeEnemy(s, p, nowSec),
      });
    }

    // Main Character: Mây
    const pPlayer = project(sim.player.pos[0], sim.player.pos[1], sim.player.pos[2]);
    renderList.push({
      depth: pPlayer.depth,
      draw: () => drawMainCharacterMay(pPlayer, nowSec),
    });

    // Sort all entities by depth (far to near)
    renderList.sort((a, b) => a.depth - b.depth);

    // Render sorted entities
    for (const item of renderList) {
      item.draw();
    }

    // 6. Draw Shockwaves & VFX Particles
    drawShockwaves(nowSec);
    drawParticles(dt);
    drawFloatingTexts(dt);

    // 7. Update HUD UI
    updateHUD(nowSec);
  }

  // --- DRAW SKY & MOON ---
  function drawSky(time) {
    const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.75);
    skyGradient.addColorStop(0, "#080614");
    skyGradient.addColorStop(0.5, "#10132b");
    skyGradient.addColorStop(1, "#182045");
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height * 0.8);

    // Stars
    for (const star of skyStars) {
      const sx = star.x * canvas.width;
      const sy = star.y * canvas.height;
      const twinkle = 0.5 + 0.5 * Math.sin(time * star.twinkleSpeed + star.twinkleOffset);
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

    // Moon Glow
    const moonGlow = ctx.createRadialGradient(moonX, moonY, 10, moonX, moonY, 90);
    moonGlow.addColorStop(0, "rgba(255, 235, 170, 0.45)");
    moonGlow.addColorStop(0.4, "rgba(255, 215, 120, 0.15)");
    moonGlow.addColorStop(1, "rgba(255, 215, 120, 0)");
    ctx.fillStyle = moonGlow;
    ctx.beginPath();
    ctx.arc(moonX, moonY, 90, 0, Math.PI * 2);
    ctx.fill();

    // Moon Crescent
    ctx.save();
    ctx.beginPath();
    ctx.arc(moonX, moonY, 26, 0, Math.PI * 2);
    ctx.fillStyle = "#FFEFAF";
    ctx.shadowColor = "#FFD700";
    ctx.shadowBlur = 18;
    ctx.fill();

    // Dark cutout for crescent
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

      // Stylized rock edge ridges
      ctx.strokeStyle = "rgba(70, 77, 125, 0.3)";
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }

    // 2. Island Top Lush Grass Diorama
    const grassRx = radiusWorld * scale;
    const grassRz = grassRx * 0.48;

    // Grass shadow rim
    ctx.beginPath();
    ctx.ellipse(pCenter.x, pCenter.y + 4, grassRx, grassRz, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#1d3228";
    ctx.fill();

    // Grass main surface
    ctx.beginPath();
    ctx.ellipse(pCenter.x, pCenter.y, grassRx, grassRz, 0, 0, Math.PI * 2);
    const grassGrad = ctx.createRadialGradient(pCenter.x, pCenter.y, 10, pCenter.x, pCenter.y, grassRx);
    grassGrad.addColorStop(0, PALETTE.grassLight);
    grassGrad.addColorStop(0.7, PALETTE.grassBase);
    grassGrad.addColorStop(1, "#264233");
    ctx.fillStyle = grassGrad;
    ctx.fill();

    // Edge highlight for Stylized Cartoon Look
    ctx.strokeStyle = "rgba(165, 214, 167, 0.4)";
    ctx.lineWidth = 3;
    ctx.stroke();

    // 3. Stylized Curved Dirt Paths connecting Center to 5 Lanterns
    ctx.save();
    ctx.strokeStyle = PALETTE.pathDirt;
    ctx.lineWidth = 14 * (scale / 12);
    ctx.lineCap = "round";
    ctx.globalAlpha = 0.65;

    for (const l of sim.lanterns) {
      const pL = project(l.pos[0], l.pos[1], l.pos[2]);
      ctx.beginPath();
      ctx.moveTo(pCenter.x, pCenter.y);
      // Gentle curve toward lantern
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
      const safeR = 6.0; // 6 meters safe zone
      const screenSafeR = safeR * pL.scale;

      const lowFuel = l.fuel !== undefined && l.fuel < 30;
      const alphaPulse = lowFuel ? 0.3 + 0.25 * Math.sin(time * 6.28) : 0.65;

      // Warm ground radial illumination
      const glowGrad = ctx.createRadialGradient(pL.x, pL.y, 4, pL.x, pL.y, screenSafeR);
      glowGrad.addColorStop(0, `rgba(255, 191, 105, ${alphaPulse * 0.7})`);
      glowGrad.addColorStop(0.6, `rgba(255, 160, 50, ${alphaPulse * 0.3})`);
      glowGrad.addColorStop(1, "rgba(255, 160, 50, 0)");

      ctx.save();
      ctx.beginPath();
      ctx.ellipse(pL.x, pL.y, screenSafeR, screenSafeR * 0.48, 0, 0, Math.PI * 2);
      ctx.fillStyle = glowGrad;
      ctx.fill();

      // Safe perimeter ring (only if fuel >= 30)
      if (!lowFuel) {
        ctx.strokeStyle = "rgba(255, 232, 163, 0.45)";
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 6]);
        ctx.stroke();
      } else {
        // Red warning dashed ring
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
    const isGrounded = sim.player.pos[1] <= 0.05;
    const isInvuln = sim.invuln > 0;

    // Determine facing angle
    if (isMoving) {
      facingAngle = Math.atan2(sim.input.move[1], sim.input.move[0]);
      playerAnimTime += 0.25;
    } else {
      playerAnimTime += 0.05;
    }

    const bob = Math.sin(playerAnimTime * 2) * (isMoving ? 3 : 1.5);
    const legSwing = isMoving ? Math.sin(playerAnimTime * 4) * 5 : 0;
    const s = p.scale / 12; // Character scaling factor

    ctx.save();
    ctx.translate(p.x, p.y);

    // Invulnerability blink
    if (isInvuln && Math.floor(time * 20) % 2 === 0) {
      ctx.globalAlpha = 0.45;
    }

    // 1. Soft Contact Shadow under feet
    const shadowScale = Math.max(0.4, 1.0 - sim.player.pos[1] * 0.35);
    ctx.beginPath();
    ctx.ellipse(0, 0, 14 * s * shadowScale, 6 * s * shadowScale, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(10, 8, 20, 0.65)";
    ctx.fill();

    // 2. Character Body Offset (with jump height)
    ctx.translate(0, -bob - 4 * s);

    // 3. Legs & Shoes
    ctx.fillStyle = "#223355"; // Dark blue pants
    // Left leg
    ctx.fillRect(-7 * s + legSwing * 0.5, -12 * s, 4.5 * s, 10 * s);
    // Right leg
    ctx.fillRect(2.5 * s - legSwing * 0.5, -12 * s, 4.5 * s, 10 * s);

    // Shoes
    ctx.fillStyle = "#111827";
    ctx.fillRect(-8 * s + legSwing * 0.5, -3 * s, 5.5 * s, 3.5 * s);
    ctx.fillRect(2 * s - legSwing * 0.5, -3 * s, 5.5 * s, 3.5 * s);

    // 4. Cream Tunic / Áo bà ba vải kem
    ctx.fillStyle = "#F7F2E7";
    ctx.beginPath();
    ctx.roundRect(-10 * s, -28 * s, 20 * s, 18 * s, 6 * s);
    ctx.fill();
    // Brown belt
    ctx.fillStyle = "#8d5b32";
    ctx.fillRect(-10 * s, -14 * s, 20 * s, 3 * s);

    // 5. Firefly Satchel / Túi đeo chéo đựng đom đóm
    ctx.save();
    ctx.fillStyle = "#6b4226";
    ctx.beginPath();
    ctx.roundRect(5 * s, -17 * s, 8 * s, 8 * s, 3 * s);
    ctx.fill();
    // Strap
    ctx.strokeStyle = "#4a2c16";
    ctx.lineWidth = 2 * s;
    ctx.beginPath();
    ctx.moveTo(-9 * s, -26 * s);
    ctx.lineTo(8 * s, -14 * s);
    ctx.stroke();

    // Glowing fireflies inside satchel
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

    // 6. Cute Little Lantern at Hip
    const hipLanternSwing = Math.sin(playerAnimTime * 3) * 3;
    ctx.save();
    ctx.translate(-9 * s, -12 * s + hipLanternSwing);
    ctx.fillStyle = "#b5722b";
    ctx.fillRect(-2 * s, 0, 4 * s, 6 * s);
    ctx.fillStyle = "#ffe066";
    ctx.beginPath();
    ctx.arc(0, 3 * s, 3 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 7. Yellow Scarf / Khăn choàng vàng bay bay
    ctx.fillStyle = "#FFD166";
    ctx.beginPath();
    ctx.roundRect(-11 * s, -30 * s, 22 * s, 6 * s, 3 * s);
    ctx.fill();
    // Scarf tail flutter
    const scarfFlutter = Math.sin(time * 5) * 4 * s;
    ctx.beginPath();
    ctx.moveTo(-7 * s, -27 * s);
    ctx.quadraticCurveTo(-14 * s + scarfFlutter, -22 * s, -16 * s + scarfFlutter, -16 * s);
    ctx.lineTo(-12 * s + scarfFlutter, -16 * s);
    ctx.closePath();
    ctx.fill();

    // 8. Chibi Round Head & Cute Face
    ctx.fillStyle = "#fddcb4"; // Soft skin tone
    ctx.beginPath();
    ctx.arc(0, -36 * s, 12 * s, 0, Math.PI * 2);
    ctx.fill();

    // Black Hair
    ctx.fillStyle = "#1e1e24";
    ctx.beginPath();
    ctx.arc(0, -38 * s, 12.5 * s, Math.PI * 0.9, Math.PI * 2.1);
    ctx.fill();

    // Eyes (sparkling anime dots)
    const eyeOffsetX = Math.cos(facingAngle) * 3 * s;
    ctx.fillStyle = "#1a120b";
    ctx.beginPath();
    ctx.ellipse(-4 * s + eyeOffsetX, -36 * s, 1.8 * s, 2.4 * s, 0, 0, Math.PI * 2);
    ctx.ellipse(4 * s + eyeOffsetX, -36 * s, 1.8 * s, 2.4 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eye catchlights
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(-3.5 * s + eyeOffsetX, -37 * s, 0.8 * s, 0, Math.PI * 2);
    ctx.arc(4.5 * s + eyeOffsetX, -37 * s, 0.8 * s, 0, Math.PI * 2);
    ctx.fill();

    // Rosy Cheeks
    ctx.fillStyle = "rgba(255, 138, 128, 0.55)";
    ctx.beginPath();
    ctx.arc(-7 * s + eyeOffsetX, -33 * s, 2 * s, 0, Math.PI * 2);
    ctx.arc(7 * s + eyeOffsetX, -33 * s, 2 * s, 0, Math.PI * 2);
    ctx.fill();

    // 9. Iconic Vietnamese Conical Hat / Nón Lá Cách Điệu
    const hatTilt = isMoving ? Math.sin(playerAnimTime * 2) * 0.08 : 0;
    ctx.save();
    ctx.translate(0, -42 * s);
    ctx.rotate(hatTilt);

    // Hat base cone
    ctx.beginPath();
    ctx.moveTo(0, -16 * s); // Hat apex
    ctx.lineTo(22 * s, 4 * s);
    ctx.quadraticCurveTo(0, 7 * s, -22 * s, 4 * s);
    ctx.closePath();
    const hatGrad = ctx.createLinearGradient(0, -16 * s, 0, 5 * s);
    hatGrad.addColorStop(0, "#ffeaa7");
    hatGrad.addColorStop(0.5, "#fdcb6e");
    hatGrad.addColorStop(1, "#e17055");
    ctx.fillStyle = hatGrad;
    ctx.fill();

    // Woven concentric rings
    ctx.strokeStyle = "rgba(180, 100, 30, 0.35)";
    ctx.lineWidth = 1 * s;
    for (let r = 5; r <= 15; r += 4) {
      ctx.beginPath();
      ctx.ellipse(0, -16 * s + r * 1.3 * s, r * 1.2 * s, r * 0.4 * s, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Hat Chin Ribbon / Quai nón
    ctx.strokeStyle = "#ff7675";
    ctx.lineWidth = 1.8 * s;
    ctx.beginPath();
    ctx.moveTo(-16 * s, 3 * s);
    ctx.quadraticCurveTo(0, 12 * s, 16 * s, 3 * s);
    ctx.stroke();

    ctx.restore();
    ctx.restore();
  }

  // --- DRAW 5 GREAT LANTERNS (ĐÈN LỒNG LỚN) ---
  function drawGreatLantern(lantern, p, time) {
    const s = p.scale / 12;
    const isLit = lantern.lit;
    const lowFuel = isLit && lantern.fuel !== undefined && lantern.fuel < 30;
    const isSquished = !isLit && colorblindMode; // 20% squished in colorblind mode

    ctx.save();
    ctx.translate(p.x, p.y);

    // 1. Base Octagonal Stone Dais / Đế đá hoa sen
    ctx.beginPath();
    ctx.ellipse(0, 0, 22 * s, 11 * s, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#22253b";
    ctx.fill();
    ctx.strokeStyle = "#3e4466";
    ctx.lineWidth = 2 * s;
    ctx.stroke();

    // 2. Pillars & Wooden Frame / 4 Cột Gỗ Sơn Son
    const height = (isSquished ? 36 : 45) * s;
    ctx.fillStyle = isLit ? "#8a2b2b" : "#382333";
    ctx.fillRect(-12 * s, -height, 4 * s, height);
    ctx.fillRect(8 * s, -height, 4 * s, height);

    // 3. Central Lantern Silk Chamber
    const blinkOff = lowFuel && Math.floor(time * 2) % 2 === 0;

    let silkColor = "#2b2238"; // unlit dark
    if (isLit) {
      silkColor = blinkOff ? "#8a5b22" : "#ffb13b";
    }

    ctx.beginPath();
    ctx.roundRect(-10 * s, -height + 6 * s, 20 * s, height - 12 * s, 4 * s);
    ctx.fillStyle = silkColor;
    ctx.fill();

    // 4. Radiant Glow & Light Beams if lit
    if (isLit && !blinkOff) {
      const glow = ctx.createRadialGradient(0, -height * 0.5, 4 * s, 0, -height * 0.5, 36 * s);
      glow.addColorStop(0, "rgba(255, 235, 160, 0.85)");
      glow.addColorStop(0.5, "rgba(255, 177, 59, 0.4)");
      glow.addColorStop(1, "rgba(255, 177, 59, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(-36 * s, -height - 20 * s, 72 * s, height + 40 * s);

      // Subtle rising firefly particles
      if (Math.random() < 0.2) {
        particles.push({
          x: lantern.pos[0] + (Math.random() - 0.5) * 1.5,
          y: 2 + Math.random() * 2,
          z: lantern.pos[2] + (Math.random() - 0.5) * 1.5,
          vx: (Math.random() - 0.5) * 0.3,
          vy: 0.8 + Math.random() * 0.8,
          vz: (Math.random() - 0.5) * 0.3,
          r: 2,
          color: "#FFE8A3",
          life: 0.8,
          decay: 1.0,
        });
      }
    }

    // 5. Curved Pagoda Roof with Golden Spire / Mái ngói cong Á Đông
    ctx.beginPath();
    ctx.moveTo(0, -height - 14 * s); // Spire tip
    ctx.lineTo(18 * s, -height);
    ctx.quadraticCurveTo(0, -height - 4 * s, -18 * s, -height);
    ctx.closePath();
    ctx.fillStyle = isLit ? "#b33939" : "#3b2d42";
    ctx.fill();
    ctx.strokeStyle = "#ffeaa7";
    ctx.lineWidth = 1.5 * s;
    ctx.stroke();

    // Golden Finial atop roof
    ctx.beginPath();
    ctx.arc(0, -height - 14 * s, 3.5 * s, 0, Math.PI * 2);
    ctx.fillStyle = "#FFD700";
    ctx.fill();

    // Corner bells / tassels fluttering
    const tasselSwing = Math.sin(time * 3) * 2 * s;
    ctx.strokeStyle = "#ff7675";
    ctx.lineWidth = 1.5 * s;
    ctx.beginPath();
    ctx.moveTo(-18 * s, -height);
    ctx.lineTo(-20 * s + tasselSwing, -height + 8 * s);
    ctx.moveTo(18 * s, -height);
    ctx.lineTo(20 * s + tasselSwing, -height + 8 * s);
    ctx.stroke();

    // 6. Floating 3D Fuel Bar (or Deposit Progress if unlit)
    const barW = 34 * s;
    const barH = 5 * s;
    const barY = -height - 24 * s;

    // Background bar
    ctx.fillStyle = "rgba(10, 8, 20, 0.8)";
    ctx.fillRect(-barW * 0.5, barY, barW, barH);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    ctx.lineWidth = 1;
    ctx.strokeRect(-barW * 0.5, barY, barW, barH);

    if (isLit) {
      // Fuel percentage
      const pct = Math.max(0, Math.min(1, (lantern.fuel || 0) / 100));
      const fuelCol = pct < 0.3 ? (colorblindMode ? "#FFFFFF" : "#FF5A5F") : "#44e57a";
      ctx.fillStyle = fuelCol;
      ctx.fillRect(-barW * 0.5 + 1, barY + 1, (barW - 2) * pct, barH - 2);

      // Warning Icon when fuel < 30
      if (lowFuel) {
        ctx.fillStyle = colorblindMode ? "#FFFFFF" : "#FF5A5F";
        ctx.font = `bold ${Math.round(12 * s)}px sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText("⚠ SẮP TẮT", 0, barY - 4 * s);
      }
    } else {
      // Progress of deposited motes
      const cost = lantern.ever_lit ? 5 : 10;
      const pct = Math.max(0, Math.min(1, (lantern.deposited || 0) / cost));
      ctx.fillStyle = "#ffb703";
      ctx.fillRect(-barW * 0.5 + 1, barY + 1, (barW - 2) * pct, barH - 2);

      // Label
      ctx.fillStyle = "#cbd5e1";
      ctx.font = `bold ${Math.round(9 * s)}px sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(`${lantern.deposited || 0}/${cost}`, 0, barY - 4 * s);
    }

    ctx.restore();
  }

  // --- DRAW FIREFLY (MOTE) ---
  function drawFirefly(mote, p, time) {
    const s = p.scale / 12;
    const bob = Math.sin(time * 3 + mote.pos[0] * 2) * 4 * s;
    const wingFlap = Math.sin(time * 18);

    ctx.save();
    ctx.translate(p.x, p.y + bob);

    // Glowing halo
    const glow = ctx.createRadialGradient(0, 0, 1, 0, 0, 14 * s);
    glow.addColorStop(0, "rgba(255, 245, 180, 0.9)");
    glow.addColorStop(0.4, "rgba(255, 215, 60, 0.4)");
    glow.addColorStop(1, "rgba(255, 215, 60, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, 14 * s, 0, Math.PI * 2);
    ctx.fill();

    // Firefly orb body
    ctx.beginPath();
    ctx.arc(0, 0, 4.2 * s, 0, Math.PI * 2);
    ctx.fillStyle = "#FFE8A3";
    ctx.fill();

    // Translucent fairy wings
    ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
    ctx.beginPath();
    ctx.ellipse(-3 * s, -3 * s * wingFlap, 3.5 * s, 1.8 * s, -0.4, 0, Math.PI * 2);
    ctx.ellipse(3 * s, -3 * s * wingFlap, 3.5 * s, 1.8 * s, 0.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // --- DRAW SHADE ENEMY (BÓNG MỰC) ---
  function drawShadeEnemy(shade, p, time) {
    const s = p.scale / 12;
    const isStunned = shade.state === "stunned";
    const isDrain = shade.state === "drain";

    // Jelly droplet floating oscillation
    const wobbleX = 1.0 + Math.sin(time * 4 + shade.pos[0]) * 0.12;
    const wobbleY = 1.0 - Math.sin(time * 4 + shade.pos[0]) * 0.12;

    ctx.save();
    ctx.translate(p.x, p.y);

    // 1. Dark Shadow on ground
    ctx.beginPath();
    ctx.ellipse(0, 0, 12 * s, 5 * s, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(10, 5, 20, 0.7)";
    ctx.fill();

    // 2. Jelly Ink Body (Teardrop shape)
    ctx.save();
    ctx.translate(0, -14 * s);
    ctx.scale(wobbleX, wobbleY);

    ctx.beginPath();
    ctx.arc(0, -6 * s, 10 * s, Math.PI, 0, false);
    // 3 small tentacles at base
    ctx.quadraticCurveTo(8 * s, 8 * s, 4 * s, 12 * s);
    ctx.quadraticCurveTo(0, 8 * s, -4 * s, 12 * s);
    ctx.quadraticCurveTo(-8 * s, 8 * s, -10 * s, -6 * s);
    ctx.closePath();

    ctx.fillStyle = isDrain ? "#40102a" : PALETTE.shadeBody;
    ctx.fill();

    // Stylized Glowing Edge
    ctx.strokeStyle = PALETTE.shadeNormal();
    ctx.lineWidth = 2 * s;
    ctx.stroke();

    // 3. Glowing Eyes
    if (isStunned) {
      // Swirly cartoon dizzy eyes
      ctx.strokeStyle = "#FFE8A3";
      ctx.lineWidth = 1.5 * s;
      ctx.beginPath();
      ctx.arc(-4 * s, -6 * s, 3 * s, 0, Math.PI * 1.5);
      ctx.arc(4 * s, -6 * s, 3 * s, 0, Math.PI * 1.5);
      ctx.stroke();
    } else {
      // Focused predator glowing eyes
      ctx.fillStyle = PALETTE.shadeNormal();
      ctx.beginPath();
      ctx.ellipse(-4 * s, -6 * s, 2.5 * s, 3.5 * s, 0, 0, Math.PI * 2);
      ctx.ellipse(4 * s, -6 * s, 2.5 * s, 3.5 * s, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    // 4. Stun Stars Halo if stunned
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

    // 5. Fuel Drain Energy Leech Beam
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

  // --- DRAW ENVIRONMENT DECORATIONS ---
  function drawDecoration(d, p, time) {
    const s = p.scale / 12;

    ctx.save();
    ctx.translate(p.x, p.y);

    if (d.type === "tree") {
      // Tree trunk shadow
      ctx.beginPath();
      ctx.ellipse(0, 0, 8 * s, 4 * s, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(10, 8, 20, 0.6)";
      ctx.fill();

      // Curved Ghibli-style trunk
      ctx.fillStyle = "#4a3525";
      ctx.beginPath();
      ctx.moveTo(-4 * s, 0);
      ctx.quadraticCurveTo(-6 * s, -d.height * 0.5 * s, 0, -d.height * s);
      ctx.lineTo(5 * s, -d.height * s);
      ctx.quadraticCurveTo(2 * s, -d.height * 0.5 * s, 5 * s, 0);
      ctx.closePath();
      ctx.fill();

      // Stylized spherical fluffy canopy
      const canopyY = -d.height * s;
      ctx.beginPath();
      ctx.arc(0, canopyY, d.canopyRadius * s, 0, Math.PI * 2);
      ctx.fillStyle = d.hue;
      ctx.fill();

      // Lighter foliage fluff highlights
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
      const sway = Math.sin(time * 2 + d.x) * 2 * s;
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

  // --- DRAW SHOCKWAVES & PARTICLES ---
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

  // --- UPDATE HUD UI ---
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

    // 5. Skill Cooldowns
    const pulseCdPct = Math.min(1, sim.cooldown / 3.0);
    elCdPulse.style.height = `${pulseCdPct * 100}%`;

    const dashCdPct = Math.min(1, sim.dashCd / 90.0);
    elCdDash.style.height = `${dashCdPct * 100}%`;

    // 6. Interactive Context Prompt
    const nearestLantern = LanternGame.LanternRules.nearest(
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

    // 7. Detect gameplay events for visual reactions
    if (sim.player.carried > prevCarried) {
      spawnFloatingText(sim.player.pos[0], sim.player.pos[2], `+${sim.player.carried - prevCarried} ĐOM ĐÓM`, "#FFE8A3");
    }
    if (sim.player.flames < prevFlames) {
      camShake = 14;
      spawnFloatingText(sim.player.pos[0], sim.player.pos[2], "-1 NGỌN LỬA!", "#FF5A5F");
    }
    if (litCount > prevLitCount) {
      spawnShockwave(sim.player.pos[0], sim.player.pos[2], 8.0, "#FFBF69");
      spawnFloatingText(sim.player.pos[0], sim.player.pos[2], "ĐÈN ĐÃ RỰC SÁNG!", "#44e57a");
    }
    prevCarried = sim.player.carried;
    prevFlames = sim.player.flames;
    prevLitCount = litCount;

    // 8. Victory & Defeat Modals
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
      // Step simulation only if playing
      if (gameStarted && sim.state === "playing") {
        const moveX = (keys.d ? 1 : 0) - (keys.a ? 1 : 0);
        const moveZ = (keys.s ? 1 : 0) - (keys.w ? 1 : 0);

        const events = sim.step({
          move: [moveX, moveZ],
          jump: !!keys.q,
          interact: !!keys.e,
          pulse: !!keys[" "],
          dash: !!keys.shift,
          cam_yaw_deg: 0,
        });

        // Trigger pulse VFX when event caught
        for (const ev of events) {
          if (ev.name === "pulse") {
            camShake = 8;
            spawnShockwave(sim.player.pos[0], sim.player.pos[2], 6.0, "#FFE8A3");
            spawnParticleBurst(sim.player.pos[0], 1.5, sim.player.pos[2], 25, "#FFBF69");
          } else if (ev.name === "dash") {
            spawnParticleBurst(sim.player.pos[0], 0.5, sim.player.pos[2], 10, "#E0F2FE");
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
