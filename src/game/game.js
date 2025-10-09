/* === SANCA GAME - FIXED CONTROL + PAUSE HEADER ===
   - Pause & Resume di header
   - Pause tiap 10 poin buka iklan
   - Spacebar = start / resume / continue
   - Tidak ganggu control mobile atau arrow
*/

(function () {
    // === DOM ELEMENTS ===
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    const overlay = document.getElementById("overlay");
    const gameOverOverlay = document.getElementById("gameOverOverlay");
    const startBtn = document.getElementById("startBtn");
    const restartBtn = document.getElementById("restartBtn");
    const celebration = document.getElementById("celebration");
    const celebrationText = document.getElementById("celebrationText");
    const continueBtn = document.getElementById("continueBtn");
  
    // Tombol header pause/resume
    const pauseBtn = document.getElementById("pauseBtn");
    const resumeBtn = document.getElementById("resumeBtn");
  
    // === CONFIG ===
    canvas.width = 400;
    canvas.height = 400;
    const cellSize = 15;
    let cols = Math.floor(canvas.width / cellSize);
    let rows = Math.floor(canvas.height / cellSize);
  
    // === STATE ===
    let snake = [];
    let food = null;
    let direction = "RIGHT";
    let nextDirection = "RIGHT";
    let score = 0;
    let speed = 150;
    let gameRunning = false;
    let paused = false;
    let waitingContinue = false;
    let loopTimer = null;
    let visualScale = 1.0;
    let gridOffset = 0;
  
    // === ADS ===
    const adsLinks = [
      "https://otieu.com/4/9979613",
      "https://otieu.com/4/6159302",
      "https://otieu.com/4/6159925",
      "https://otieu.com/4/8177061",
    ];
    const randomLink = () => adsLinks[Math.floor(Math.random() * adsLinks.length)];
  
    // === UI HELPERS ===
    const showOverlay = (el) => {
      el.classList.remove("hidden");
      el.classList.add("show");
    };
    const hideOverlay = (el) => {
      el.classList.add("hidden");
      el.classList.remove("show");
    };
  
    const toggleHeaderButtons = () => {
      if (!gameRunning) {
        pauseBtn.classList.add("hidden");
        resumeBtn.classList.add("hidden");
        startBtn.classList.remove("hidden");
      } else if (paused || waitingContinue) {
        pauseBtn.classList.add("hidden");
        resumeBtn.classList.remove("hidden");
      } else {
        pauseBtn.classList.remove("hidden");
        resumeBtn.classList.add("hidden");
        startBtn.classList.add("hidden");
      }
    };
  
    // === GAME INIT ===
    function initGame() {
      cols = Math.floor(canvas.width / cellSize);
      rows = Math.floor(canvas.height / cellSize);
      snake = [{ x: Math.floor(cols / 2), y: Math.floor(rows / 2) }];
      food = spawnFood();
      direction = "RIGHT";
      nextDirection = "RIGHT";
      score = 0;
      speed = 150;
      visualScale = 1.0;
      paused = false;
      waitingContinue = false;
      gameRunning = true;
  
      hideOverlay(overlay);
      hideOverlay(gameOverOverlay);
      hideOverlay(celebration);
      continueBtn.classList.add("hidden");
  
      toggleHeaderButtons();
      focusCanvas();
      loop();
    }
  
    function spawnFood() {
      let fx, fy;
      do {
        fx = Math.floor(Math.random() * cols);
        fy = Math.floor(Math.random() * rows);
      } while (snake.some((seg) => seg.x === fx && seg.y === fy));
      return { x: fx, y: fy };
    }
  
    // === DRAW ===
    function draw() {
      const bgGrad = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        50,
        canvas.width / 2,
        canvas.height / 2,
        300
      );
      bgGrad.addColorStop(0, "#001100");
      bgGrad.addColorStop(1, "#000000");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
  
      gridOffset += 0.4;
      ctx.strokeStyle = "rgba(0,255,100,0.06)";
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
  
      const segRenderSize = Math.max(4, Math.floor(cellSize * visualScale));
      const pad = Math.max(0, Math.floor((cellSize - segRenderSize) / 2));
  
      for (let i = 0; i < snake.length; i++) {
        const isHead = i === 0;
        const gx = snake[i].x;
        const gy = snake[i].y;
        const px = gx * cellSize + pad;
        const py = gy * cellSize + pad;
  
        const grad = ctx.createLinearGradient(px, py, px + segRenderSize, py + segRenderSize);
        grad.addColorStop(0, isHead ? "#00ffcc" : "#00bb66");
        grad.addColorStop(1, isHead ? "#007755" : "#004422");
        ctx.fillStyle = grad;
        ctx.shadowColor = "#00ffaa";
        ctx.shadowBlur = isHead ? 16 : 8;
  
        const r = Math.min(6, Math.floor(segRenderSize / 3));
        roundRect(ctx, px + 1, py + 1, segRenderSize - 2, segRenderSize - 2, r);
        ctx.fill();
      }
  
      const fx = food.x * cellSize + cellSize / 2;
      const fy = food.y * cellSize + cellSize / 2;
      const orb = ctx.createRadialGradient(fx, fy, 2, fx, fy, cellSize * 0.4);
      orb.addColorStop(0, "#ffcc33");
      orb.addColorStop(1, "#ff3300");
      ctx.fillStyle = orb;
      ctx.beginPath();
      ctx.arc(fx, fy, cellSize * 0.4, 0, Math.PI * 2);
      ctx.fill();
  
      ctx.fillStyle = "#00ff88";
      ctx.font = "bold 15px Courier New";
      ctx.textAlign = "left";
      ctx.fillText(`SCORE: ${score}`, 12, canvas.height - 8);
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
  
    // === LOOP ===
    function loop() {
      if (!gameRunning) return;
  
      if (paused || waitingContinue) {
        draw();
        loopTimer = setTimeout(loop, 100);
        return;
      }
  
      draw();
      loopTimer = setTimeout(() => {
        let head = { ...snake[0] };
        if (nextDirection === "LEFT") head.x--;
        if (nextDirection === "UP") head.y--;
        if (nextDirection === "RIGHT") head.x++;
        if (nextDirection === "DOWN") head.y++;
        direction = nextDirection;
  
        if (head.x === food.x && head.y === food.y) {
          score++;
          food = spawnFood();
  
          if (score % 10 === 0 && score < 100) {
            speed = Math.max(60, speed - 10);
            visualScale = Math.min(1.6, visualScale + 0.12);
            pauseAndCelebrate();
            return;
          }
        } else {
          snake.pop();
        }
  
        if (
          head.x < 0 ||
          head.y < 0 ||
          head.x >= cols ||
          head.y >= rows ||
          snake.some((s) => s.x === head.x && s.y === head.y)
        ) {
          return gameOver();
        }
  
        snake.unshift(head);
        loop();
      }, speed);
    }
  
    // === PAUSE / RESUME ===
    function pauseGame() {
      if (!gameRunning || paused || waitingContinue) return;
      paused = true;
      toggleHeaderButtons();
    }
  
    function resumeGame() {
      if (!gameRunning || waitingContinue) return;
      paused = false;
      toggleHeaderButtons();
      focusCanvas();
      loop();
    }
  
    // === CELEBRATION + ADS ===
    function pauseAndCelebrate() {
      paused = true;
      waitingContinue = true;
      celebrationText.innerText = "+10 🎉";
      showOverlay(celebration);
      continueBtn.classList.remove("hidden");
      toggleHeaderButtons();
  
      setTimeout(() => {
        window.open(randomLink(), "_blank");
      }, 300);
    }
  
    function continueGame() {
      if (!waitingContinue) return;
      waitingContinue = false;
      paused = false;
      hideOverlay(celebration);
      continueBtn.classList.add("hidden");
      toggleHeaderButtons();
      focusCanvas();
      loop();
    }
  
    // === GAME END ===
    function gameOver() {
      gameRunning = false;
      hideOverlay(celebration);
      continueBtn.classList.add("hidden");
      showOverlay(gameOverOverlay);
      toggleHeaderButtons();
      document.getElementById("finalScore").textContent = `Skor kamu: ${score}`;
    }
  
    // === FOCUS & CONTROL ===
    function focusCanvas() {
      try {
        canvas.setAttribute("tabindex", "-1");
        canvas.focus({ preventScroll: true });
      } catch {}
    }
  
    function handleKeyDown(e) {
      const arrows = ["ArrowLeft", "ArrowUp", "ArrowRight", "ArrowDown"];
      const isSpace = e.code === "Space";
  
      if (gameRunning && (arrows.includes(e.key) || isSpace)) e.preventDefault();
  
      if (isSpace) {
        if (!gameRunning) return initGame();
        if (waitingContinue) return continueGame();
        if (paused) return resumeGame();
        return;
      }
  
      if (!gameRunning || waitingContinue) return;
      if (e.key === "ArrowLeft" && direction !== "RIGHT") nextDirection = "LEFT";
      if (e.key === "ArrowUp" && direction !== "DOWN") nextDirection = "UP";
      if (e.key === "ArrowRight" && direction !== "LEFT") nextDirection = "RIGHT";
      if (e.key === "ArrowDown" && direction !== "UP") nextDirection = "DOWN";
    }
  
    // === TOUCH CONTROL (MOBILE) ===
    document.querySelectorAll(".control-btn").forEach((btn) => {
      btn.addEventListener("touchstart", (ev) => {
        ev.preventDefault();
        if (waitingContinue) return continueGame();
        const dir = btn.dataset.dir;
        if (dir === "LEFT" && direction !== "RIGHT") nextDirection = "LEFT";
        if (dir === "UP" && direction !== "DOWN") nextDirection = "UP";
        if (dir === "RIGHT" && direction !== "LEFT") nextDirection = "RIGHT";
        if (dir === "DOWN" && direction !== "UP") nextDirection = "DOWN";
      });
    });
  
    // === EVENTS ===
    startBtn.addEventListener("click", initGame);
    restartBtn.addEventListener("click", initGame);
    continueBtn.addEventListener("click", continueGame);
    pauseBtn.addEventListener("click", pauseGame);
    resumeBtn.addEventListener("click", resumeGame);
    document.addEventListener("keydown", handleKeyDown, { passive: false });
  
    // === INIT ===
    showOverlay(overlay);
    toggleHeaderButtons();
  })();
  