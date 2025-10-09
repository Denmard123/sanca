// src/script.js
// Dashboard & Player Stats integration for Sanca Game
// - Handles player name input (modal)
// - Syncs stats (total games, high score, average, last played)
// - Provides window.updatePlayerStats(score) for game.js
// - Adds progress bar based on highScore

document.addEventListener("DOMContentLoaded", () => {
    const STORAGE_KEY = "sancaPlayerStats_v1";
    const MODAL_ID = "sancaPlayerModal_v1";
  
    // ===== DOM Reference =====
    const btnPlay = document.getElementById("btnPlay");
    const localStats = document.getElementById("localStats");
  
    // Stats text spans
    const statSpans = localStats
      ? Array.from(localStats.querySelectorAll("ul li span:last-child"))
      : [];
  
    const statTotalGamesEl = statSpans[0] || null;
    const statHighScoreEl = statSpans[1] || null;
    const statAvgEl = statSpans[2] || null;
    const statLastEl = statSpans[3] || null;
  
    // ===== Player Name Display =====
    let playerNameDisplay = localStats?.querySelector(".player-name-display");
    if (!playerNameDisplay && localStats) {
      playerNameDisplay = document.createElement("div");
      playerNameDisplay.className =
        "player-name-display text-sm text-gray-200 mb-3 font-semibold";
      const h3 = localStats.querySelector("h3");
      h3
        ? h3.insertAdjacentElement("afterend", playerNameDisplay)
        : localStats.prepend(playerNameDisplay);
    }
  
    // ===== Control Buttons (Ganti Nama, Reset) =====
    let controlsRow = localStats?.querySelector(".sanca-controls-row");
    if (!controlsRow && localStats) {
      controlsRow = document.createElement("div");
      controlsRow.className = "sanca-controls-row mt-4 flex gap-2";
  
      const changeBtn = document.createElement("button");
      changeBtn.id = "changeNameBtn";
      changeBtn.className =
        "px-3 py-1 rounded bg-yellow-500 text-black font-semibold text-sm";
      changeBtn.textContent = "Ganti Nama";
  
      const resetBtn = document.createElement("button");
      resetBtn.id = "resetStatsBtn";
      resetBtn.className =
        "px-3 py-1 rounded bg-red-600 text-white font-semibold text-sm";
      resetBtn.textContent = "Reset Data";
  
      controlsRow.append(changeBtn, resetBtn);
      localStats.appendChild(controlsRow);
    }
  
    const changeNameBtn = document.getElementById("changeNameBtn");
    const resetStatsBtn = document.getElementById("resetStatsBtn");
  
    // ===== Modal (Input Nama Pemain) =====
    let modal = document.getElementById(MODAL_ID);
    if (!modal) {
      modal = document.createElement("div");
      modal.id = MODAL_ID;
      modal.className = "fixed inset-0 z-50 flex items-center justify-center";
      modal.style.background = "rgba(0,0,0,0.6)";
      modal.style.display = "none";
  
      modal.innerHTML = `
        <div style="min-width:280px;max-width:420px" 
          class="bg-black/90 rounded-xl p-5 shadow-lg border border-green-600">
          <h3 class="text-lg font-bold mb-2 text-green-300">Masukkan Nama Pemain</h3>
          <input id="sancaPlayerInput" type="text" placeholder="Nama kamu..."
            style="width:100%;padding:.6rem;border-radius:.5rem;
            border:1px solid #0f6;background:#fff;color:#000;font-weight:600;
            text-align:center;outline:none;box-shadow:0 0 6px #0f64;
            transition:all .2s ease;">
          <div class="mt-3 flex gap-2 justify-end">
            <button id="sancaCancel" 
              class="px-3 py-1 rounded bg-gray-700 text-white hover:bg-gray-600">
              Batal
            </button>
            <button id="sancaSaveName" 
              class="px-3 py-1 rounded bg-green-500 text-black font-semibold hover:bg-green-400">
              Simpan & Main
            </button>
          </div>
        </div>`;
      document.body.appendChild(modal);
    }
  
    const playerInput = document.getElementById("sancaPlayerInput");
    const saveNameBtn = document.getElementById("sancaSaveName");
    const cancelNameBtn = document.getElementById("sancaCancel");
  
    // ===== Modal Functions =====
    function showModal() {
      modal.style.display = "flex";
      setTimeout(() => playerInput?.focus(), 100);
    }
    function hideModal() {
      modal.style.display = "none";
    }
  
    // ===== Storage Helpers =====
    function getStats() {
      try {
        const s = JSON.parse(localStorage.getItem(STORAGE_KEY));
        return (
          s || {
            name: null,
            totalGames: 0,
            totalScore: 0,
            highScore: 0,
            lastPlayed: "-",
          }
        );
      } catch {
        return {
          name: null,
          totalGames: 0,
          totalScore: 0,
          highScore: 0,
          lastPlayed: "-",
        };
      }
    }
  
    function saveStats(data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      renderStats();
    }
  
    // ===== Render Stats + Progress Bar =====
    function renderStats() {
      const s = getStats();
      if (playerNameDisplay)
        playerNameDisplay.textContent = `Pemain: ${s.name || "-"}`;
      if (statTotalGamesEl) statTotalGamesEl.textContent = s.totalGames || 0;
      if (statHighScoreEl)
        statHighScoreEl.textContent = (s.highScore || 0).toLocaleString("id-ID");
      if (statAvgEl) {
        const avg = s.totalGames
          ? Math.round((s.totalScore || 0) / s.totalGames)
          : 0;
        statAvgEl.textContent = avg.toLocaleString("id-ID");
      }
      if (statLastEl) statLastEl.textContent = s.lastPlayed || "-";
  
      updateProgressBar(s);
    }
  
    // ===== Bar Progress Integration =====
    function updateProgressBar(stats) {
      const progressBar = document.getElementById("progressBar");
      const progressGame = document.getElementById("progressGame");
      const progressScore = document.getElementById("progressScore");
      const progressDetail = document.getElementById("progressDetail");
  
      if (!progressBar) return;
  
      const maxScore = 100;
      const percentage = Math.min((stats.highScore / maxScore) * 100, 100);
  
      progressBar.style.width = `${percentage}%`;
      progressGame.textContent = `Game: SANCA`;
      progressScore.textContent = `${stats.highScore} / ${maxScore}`;
      progressDetail.textContent =
        stats.totalGames > 0
          ? `High score diraih pada permainan ke-${stats.totalGames}, rata-rata skor ${Math.round(
              stats.totalScore / (stats.totalGames || 1)
            )}`
          : "Belum ada data permainan.";
    }
  
    // ===== Event Logic =====
    let playIntent = false;
  
    btnPlay?.addEventListener("click", (e) => {
      const s = getStats();
      if (!s.name) {
        e.preventDefault();
        playIntent = true;
        showModal();
      }
    });
  
    saveNameBtn?.addEventListener("click", () => {
      const name = playerInput?.value.trim();
      if (!name) {
        alert("Nama tidak boleh kosong.");
        playerInput?.focus();
        return;
      }
      const s = getStats();
      s.name = name;
      saveStats(s);
      hideModal();
      if (playIntent && btnPlay?.href)
        setTimeout(() => (window.location.href = btnPlay.href), 150);
      playIntent = false;
    });
  
    cancelNameBtn?.addEventListener("click", hideModal);
    changeNameBtn?.addEventListener("click", () => {
      const s = getStats();
      playerInput.value = s.name || "";
      showModal();
    });
  
    resetStatsBtn?.addEventListener("click", () => {
      if (confirm("Yakin ingin menghapus semua data pemain?")) {
        localStorage.removeItem(STORAGE_KEY);
        renderStats();
        alert("Data pemain berhasil dihapus.");
      }
    });
  
    // ===== Game Integration =====
    window.updatePlayerStats = function (score) {
      const s = getStats();
      const sc = Number(score) || 0;
      s.totalGames += 1;
      s.totalScore += sc;
      s.highScore = Math.max(s.highScore || 0, sc);
      s.lastPlayed = new Date().toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      saveStats(s);
    };
  
    // ===== Cross-tab sync =====
    window.addEventListener("storage", (e) => {
      if (e.key === STORAGE_KEY) renderStats();
    });
  
    // ===== Initial Render =====
    renderStats();
    const initStats = getStats();
    if (!initStats.name) showModal();
  
    // ===== Helper for debug =====
    window.__sanca_stats_helpers = { STORAGE_KEY, getStats, saveStats, renderStats };
  });
  