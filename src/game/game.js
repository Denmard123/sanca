/* game.js — robust versi (memperbaiki null-element errors, pause/resume speed)
   Pastikan file ini dipanggil setelah HTML (di bottom of body).
*/
(function () {
    // --- DOM references (tolerant jika elemen tidak ada) ---
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas && canvas.getContext ? canvas.getContext("2d") : null;
  
    const overlay = document.getElementById("overlay");
    const gameOverOverlay = document.getElementById("gameOverOverlay");
    const startBtnEls = Array.from(document.querySelectorAll("#startBtn")); // handle duplicates
    const restartBtnEls = Array.from(document.querySelectorAll("#restartBtn")); // handle duplicates
  
    const pauseBtn = document.getElementById("pauseBtn");
    const resumeBtn = document.getElementById("resumeBtn");
    const headerRestart = document.getElementById("headerRestart"); // optional
  
    const celebration = document.getElementById("celebration");
    const celebrationText = document.getElementById("celebrationText");
    const continueBtn = document.getElementById("continueBtn");
  
    // require canvas/context
    if (!canvas || !ctx) {
      console.error("Canvas or context not found. game.js aborted.");
      return;
    }
  
    // --- game constants / state ---
    canvas.width = 400;
    canvas.height = 400;
    const cellSize = 15;
    let cols = Math.floor(canvas.width / cellSize);
    let rows = Math.floor(canvas.height / cellSize);
  
    let snake = [];
    let food = null;
    let direction = "RIGHT";
    let nextDirection = "RIGHT";
    let score = 0;
    let baseSpeed = 150; // starting ms
    let speed = baseSpeed; // current tick interval (persist across pause/resume)
    let visualScale = 1.0;
    let gridOffset = 0;
  
    let gameRunning = false;
    let paused = false;
    let waitingContinue = false;
    let loopTimer = null;
  
    // ads
    const adsLinks = [
      "https://otieu.com/4/9979613",
      "https://otieu.com/4/6159302",
      "https://otieu.com/4/6159925",
      "https://otieu.com/4/8177061",
    ];
    const randomLink = () => adsLinks[Math.floor(Math.random() * adsLinks.length)];
  
    // --- helpers to show/hide overlays (ke HTML yang ada) ---
    function showOverlay(el) {
      if (!el) return;
      el.classList.remove("hidden");
      el.classList.add("show");
      // many overlays expect flex container
      if (!el.classList.contains("flex")) el.classList.add("flex");
    }
    function hideOverlay(el) {
      if (!el) return;
      el.classList.add("hidden");
      el.classList.remove("show");
      if (el.classList.contains("flex")) el.classList.remove("flex");
    }
  
    // toggle header/start button visibility (tolerant)
    function toggleHeaderButtons() {
      // start buttons (could be multiple)
      if (!gameRunning) {
        startBtnEls.forEach(el => el && el.classList.remove("hidden"));
        if (pauseBtn) pauseBtn.classList.add("hidden");
        if (resumeBtn) resumeBtn.classList.add("hidden");
        if (headerRestart) headerRestart.classList.add("hidden");
        return;
      }
  
      if (paused || waitingContinue) {
        startBtnEls.forEach(el => el && el.classList.add("hidden"));
        if (pauseBtn) pauseBtn.classList.add("hidden");
        if (resumeBtn) resumeBtn.classList.remove("hidden");
        if (headerRestart) headerRestart.classList.remove("hidden");
      } else {
        startBtnEls.forEach(el => el && el.classList.add("hidden"));
        if (pauseBtn) pauseBtn.classList.remove("hidden");
        if (resumeBtn) resumeBtn.classList.add("hidden");
        if (headerRestart) headerRestart.classList.remove("hidden");
      }
    }
  
    // --- game functions ---
    function initGame() {
      cols = Math.floor(canvas.width / cellSize);
      rows = Math.floor(canvas.height / cellSize);
  
      snake = [{ x: Math.floor(cols / 2), y: Math.floor(rows / 2) }];
      food = spawnFood();
      direction = "RIGHT";
      nextDirection = "RIGHT";
      score = 0;
      baseSpeed = 150;
      speed = baseSpeed;
      visualScale = 1.0;
      paused = false;
      waitingContinue = false;
      gameRunning = true;
  
      hideOverlay(overlay);
      hideOverlay(gameOverOverlay);
      hideOverlay(celebration);
      if (continueBtn) continueBtn.classList.add("hidden");
  
      clearTimeout(loopTimer);
      toggleHeaderButtons();
      focusCanvas();
      loop();
    }
  
    function spawnFood() {
      // robust spawn not overlapping snake
      const maxTries = Math.max(200, cols * rows);
      let tries = 0;
      let fx, fy;
      do {
        fx = Math.floor(Math.random() * cols);
        fy = Math.floor(Math.random() * rows);
        tries++;
        if (tries > maxTries) break;
      } while (snake.some(seg => seg.x === fx && seg.y === fy));
      return { x: fx, y: fy };
    }
  
    function roundRect(ctx, x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }
  
    function draw() {
      // background gradient
      const bg = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        50,
        canvas.width / 2,
        canvas.height / 2,
        300
      );
      bg.addColorStop(0, "#001100");
      bg.addColorStop(1, "#000000");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
  
      // moving grid
      gridOffset += 0.4;
      ctx.strokeStyle = "rgba(0,255,100,0.06)";
      ctx.lineWidth = 1;
      for (let i = 0; i <= canvas.width; i += cellSize) {
        ctx.beginPath();
        ctx.moveTo(i + (gridOffset % cellSize), 0);
        ctx.lineTo(i + (gridOffset % cellSize), canvas.height);
        ctx.stroke();
      }
      for (let j = 0; j <= canvas.height; j += cellSize) {
        ctx.beginPath();
        ctx.moveTo(0, j + (gridOffset % cellSize));
        ctx.lineTo(canvas.width, j + (gridOffset % cellSize));
        ctx.stroke();
      }
  
      // draw snake (render-only scale)
      const segSize = Math.max(4, Math.floor(cellSize * visualScale));
      const pad = Math.max(0, Math.floor((cellSize - segSize) / 2));
      for (let i = 0; i < snake.length; i++) {
        const seg = snake[i];
        const isHead = i === 0;
        const px = seg.x * cellSize + pad;
        const py = seg.y * cellSize + pad;
        const grad = ctx.createLinearGradient(px, py, px + segSize, py + segSize);
        grad.addColorStop(0, isHead ? "#00ffcc" : "#00bb66");
        grad.addColorStop(1, isHead ? "#007755" : "#004422");
        ctx.fillStyle = grad;
        ctx.shadowColor = "#00ffaa";
        ctx.shadowBlur = isHead ? 14 : 6;
        roundRect(ctx, px + 1, py + 1, segSize - 2, segSize - 2, 4);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
  
      // draw food (orb)
      if (food) {
        const fx = food.x * cellSize + cellSize / 2;
        const fy = food.y * cellSize + cellSize / 2;
        const orb = ctx.createRadialGradient(fx, fy, 2, fx, fy, cellSize * 0.4);
        orb.addColorStop(0, "#ffcc33");
        orb.addColorStop(1, "#ff3300");
        ctx.fillStyle = orb;
        ctx.beginPath();
        ctx.arc(fx, fy, cellSize * 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
  
      // score text
      ctx.fillStyle = "#00ff88";
      ctx.font = "bold 15px Courier New, monospace";
      ctx.textAlign = "left";
      ctx.fillText(`SCORE: ${score}`, 12, canvas.height - 8);
    }
  
    // main loop (uses setTimeout so speed persists across pause/resume)
    function loop() {
      if (!gameRunning) return;
  
      // if paused or waiting, render and keep timer off (we don't queue new game ticks)
      if (paused || waitingContinue) {
        draw();
        return;
      }
  
      draw();
      clearTimeout(loopTimer);
      loopTimer = setTimeout(() => {
        // compute next head
        const head = { ...snake[0] };
        if (nextDirection === "LEFT") head.x -= 1;
        if (nextDirection === "UP") head.y -= 1;
        if (nextDirection === "RIGHT") head.x += 1;
        if (nextDirection === "DOWN") head.y += 1;
  
        // commit direction
        direction = nextDirection;
  
        // eat?
        if (food && head.x === food.x && head.y === food.y) {
          score++;
          food = spawnFood();
  
          if (score % 10 === 0 && score < 100) {
            // increase speed and visual scale, then pause & open ad
            speed = Math.max(60, speed - 10);
            visualScale = Math.min(1.6, visualScale + 0.12);
            pauseAndCelebrate();
            return; // paused by pauseAndCelebrate
          }
  
          if (score === 100) {
            finishGame();
            return;
          }
        } else {
          // normal: move tail
          snake.pop();
        }
  
        // collision check
        if (
          head.x < 0 ||
          head.y < 0 ||
          head.x >= cols ||
          head.y >= rows ||
          snake.some(s => s.x === head.x && s.y === head.y)
        ) {
          gameOver();
          return;
        }
  
        // add head & continue
        snake.unshift(head);
        // recursive loop:
        loop();
      }, speed);
    }
  
    // --- Pause & celebration (open ad in new tab) ---
    function pauseAndCelebrate() {
      if (!gameRunning) return;
      paused = true;
      waitingContinue = true;
      clearTimeout(loopTimer);
  
      // show celebration overlay + continue button
      if (celebrationText) celebrationText.innerText = "+10 🎉";
      showOverlay(celebration);
      if (continueBtn) continueBtn.classList.remove("hidden");
  
      toggleHeaderButtons();
  
      // open ad after small delay so UI can render
      setTimeout(() => {
        try { window.open(randomLink(), "_blank"); } catch (e) { /* ignore */ }
      }, 300);
    }
  
    function continueGame() {
      if (!waitingContinue) return;
      waitingContinue = false;
      paused = false;
      hideOverlay(celebration);
      if (continueBtn) continueBtn.classList.add("hidden");
      toggleHeaderButtons();
      focusCanvas();
      clearTimeout(loopTimer);
      loop();
    }
  
    // --- finish / game over ---
    function finishGame() {
      gameRunning = false;
      clearTimeout(loopTimer);
      if (celebrationText) celebrationText.innerText = "🎆 GAME COMPLETED! 🏁";
      showOverlay(celebration);
      if (continueBtn) continueBtn.classList.add("hidden");
      toggleHeaderButtons();
      setTimeout(() => {
        hideOverlay(celebration);
        showOverlay(gameOverOverlay);
        const finalEl = document.getElementById("finalScore");
        if (finalEl) finalEl.textContent = `Skor kamu: ${score}`;
      }, 1200);
    }
  
    function gameOver() {
      gameRunning = false;
      clearTimeout(loopTimer);
      hideOverlay(celebration);
      if (continueBtn) continueBtn.classList.add("hidden");
      showOverlay(gameOverOverlay);
      toggleHeaderButtons();
      const finalEl = document.getElementById("finalScore");
      if (finalEl) finalEl.textContent = `Skor kamu: ${score}`;
    }
  
    // --- pause / resume (header buttons & keyboard) ---
    function pauseGame() {
      if (!gameRunning || paused || waitingContinue) return;
      paused = true;
      clearTimeout(loopTimer);
      toggleHeaderButtons();
    }
    function resumeGame() {
      if (!gameRunning || waitingContinue) return;
      if (!paused) return;
      paused = false;
      toggleHeaderButtons();
      focusCanvas();
      clearTimeout(loopTimer);
      loop();
    }
  
    // --- focus canvas and prevent default scroll for arrows/space while playing ---
    function focusCanvas() {
      try {
        canvas.setAttribute("tabindex", "-1");
        canvas.focus({ preventScroll: true });
      } catch (e) { /* ignore */ }
    }
  
    // keyboard handler
    function handleKeyDown(e) {
      const arrows = ["ArrowLeft", "ArrowUp", "ArrowRight", "ArrowDown"];
      const isSpace = e.code === "Space" || e.key === " ";
  
      // prevent page scroll while playing
      if (gameRunning && (arrows.includes(e.key) || isSpace)) e.preventDefault();
  
      if (isSpace) {
        // space = start / continue / resume depending on state
        if (!gameRunning) { initGame(); return; }
        if (waitingContinue) { continueGame(); return; }
        if (paused) { resumeGame(); return; }
        // if running & not paused, do nothing (or optionally pause)
        return;
      }
  
      // arrows: only when game active & not waitingContinue
      if (!gameRunning || waitingContinue) return;
      if (e.key === "ArrowLeft" && direction !== "RIGHT") nextDirection = "LEFT";
      if (e.key === "ArrowUp" && direction !== "DOWN") nextDirection = "UP";
      if (e.key === "ArrowRight" && direction !== "LEFT") nextDirection = "RIGHT";
      if (e.key === "ArrowDown" && direction !== "UP") nextDirection = "DOWN";
    }
  
    // touch controls (mobile)
    function setupTouchControls() {
      const btns = document.querySelectorAll(".control-btn");
      if (!btns) return;
      btns.forEach(btn => {
        btn.addEventListener("touchstart", ev => {
          ev.preventDefault();
          if (waitingContinue) { continueGame(); return; }
          const dir = btn.dataset.dir;
          if (dir === "LEFT" && direction !== "RIGHT") nextDirection = "LEFT";
          if (dir === "UP" && direction !== "DOWN") nextDirection = "UP";
          if (dir === "RIGHT" && direction !== "LEFT") nextDirection = "RIGHT";
          if (dir === "DOWN" && direction !== "UP") nextDirection = "DOWN";
        }, { passive: false });
  
        // also click fallback
        btn.addEventListener("click", () => {
          if (waitingContinue) { continueGame(); return; }
          const dir = btn.dataset.dir;
          if (dir === "LEFT" && direction !== "RIGHT") nextDirection = "LEFT";
          if (dir === "UP" && direction !== "DOWN") nextDirection = "UP";
          if (dir === "RIGHT" && direction !== "LEFT") nextDirection = "RIGHT";
          if (dir === "DOWN" && direction !== "UP") nextDirection = "DOWN";
        });
      });
    }
  
    // --- attach event listeners safely ---
    // start buttons (could be several e.g. header + overlay)
    startBtnEls.forEach(btn => {
      if (btn) btn.addEventListener("click", () => { initGame(); focusCanvas(); });
    });
  
    // restart overlay(s)
    restartBtnEls.forEach(btn => {
      if (btn) btn.addEventListener("click", () => { initGame(); focusCanvas(); });
    });
  
    if (headerRestart) headerRestart.addEventListener("click", () => { initGame(); focusCanvas(); });
  
    if (pauseBtn) pauseBtn.addEventListener("click", pauseGame);
    if (resumeBtn) resumeBtn.addEventListener("click", resumeGame);
    if (continueBtn) continueBtn.addEventListener("click", () => { continueGame(); focusCanvas(); });
  
    document.addEventListener("keydown", handleKeyDown, { passive: false });
    canvas.addEventListener("click", focusCanvas);
  
    setupTouchControls();
  
    // initial UI state
    showOverlay(overlay);
    toggleHeaderButtons();
  })();
  