// ================= HEADER NEON INTERAKTIF =================
function initNeonHeader() {
  const header = document.getElementById("header");
  const menuToggle = document.getElementById("menuToggle");
  const mobileNav = document.getElementById("mobileNav");
  const mobileDropdownBtn = document.getElementById("mobileDropdownBtn");
  const mobileDropdown = document.getElementById("mobileDropdown");
  const navDropdownBtn = document.getElementById("navDropdownBtn");
  const navDropdown = document.getElementById("navDropdown");
  const btnSettings = document.getElementById("btnSettings");
  const brand = document.getElementById("brand");

  // 🌀 Animasi saat scroll
  window.addEventListener("scroll", () => {
    const scrolled = window.scrollY > 20;
    header.style.transition = "all 0.3s ease";
    header.style.boxShadow = scrolled
      ? "0 0 25px rgba(0,255,242,0.4)"
      : "0 0 10px rgba(0,255,242,0.2)";
    header.style.borderColor = scrolled ? "#00fff2" : "rgba(0,255,242,0.3)";
  });

  // 🐍 Toggle menu mobile
  if (menuToggle && mobileNav) {
    menuToggle.addEventListener("click", () => {
      const icon = menuToggle.querySelector("i");
      const opened = !mobileNav.classList.contains("hidden");
      mobileNav.classList.toggle("hidden");
      mobileNav.classList.toggle("flex");
      if (icon) icon.className = opened ? "fa-solid fa-bars" : "fa-solid fa-xmark text-neon-cyan";
    });
  }

  // ⚙️ Animasi tombol pengaturan
  if (btnSettings) {
    const gear = btnSettings.querySelector("i");
    btnSettings.addEventListener("mouseenter", () => { if (gear) gear.style.transform = "rotate(90deg)"; });
    btnSettings.addEventListener("mouseleave", () => { if (gear) gear.style.transform = "rotate(0deg)"; });
  }

  // 🐉 Efek hover logo brand
  if (brand) {
    const icon = brand.querySelector("i");
    brand.addEventListener("mouseenter", () => { if (icon) icon.style.filter = "drop-shadow(0 0 15px var(--neon-cyan))"; });
    brand.addEventListener("mouseleave", () => { if (icon) icon.style.filter = "drop-shadow(0 0 8px var(--neon-green))"; });
  }

  // 🔽 Dropdown Desktop
  if (navDropdownBtn && navDropdown) {
    navDropdownBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const opened = !navDropdown.classList.contains("hidden");
      document.querySelectorAll("#navDropdown").forEach(el => el.classList.add("hidden"));
      if (!opened) navDropdown.classList.remove("hidden");
    });
  }

  // 🔽 Dropdown Mobile
  if (mobileDropdownBtn && mobileDropdown) {
    mobileDropdownBtn.addEventListener("click", () => {
      const icon = mobileDropdownBtn.querySelector("i");
      const opened = !mobileDropdown.classList.contains("hidden");
      mobileDropdown.classList.toggle("hidden");
      mobileDropdown.classList.toggle("flex");
      if (icon) icon.style.transform = opened ? "rotate(0deg)" : "rotate(180deg)";
    });
  }

  // ❌ Klik di luar menu menutup dropdown desktop & mobile
  document.addEventListener("click", (e) => {
    if (navDropdown && !navDropdown.contains(e.target) && !navDropdownBtn.contains(e.target)) {
      navDropdown.classList.add("hidden");
    }
    if (mobileNav && !mobileNav.contains(e.target) && !menuToggle.contains(e.target)) {
      mobileNav.classList.add("hidden");
      mobileNav.classList.remove("flex");
      const icon = menuToggle?.querySelector("i");
      if (icon) icon.className = "fa-solid fa-bars";
    }
  });
}

// ================= PANEL PENGATURAN TERINTEGRASI =================
function initAsideSettings() {
  const aside = document.getElementById("asideSettings");
  const btnSettings = document.getElementById("btnSettings");
  const btnCloseAside = document.getElementById("btnCloseAside");
  const btnSaveAside = document.getElementById("btnSaveAside");
  const soundToggle = document.getElementById("soundToggle");
  const themeSelect = document.getElementById("themeSelect");
  const speedRange = document.getElementById("speedRange");
  const glowRange = document.getElementById("glowRange");
  const bodyEl = document.getElementById("bodyPage");

  if (!aside || !bodyEl) return;

  // ===== Audio main menu =====
  const bgMusic = new Audio("./sound/Stir It Up (1973) - Bob Marley _ The Wailers.mp3");
  bgMusic.loop = true;
  bgMusic.volume = 0.4;

  // ===== Fungsi open/close panel =====
  const openAside = () => {
    aside.style.transform = "translateX(0)";
    aside.style.opacity = "1";
    aside.style.pointerEvents = "auto";
  };
  const closeAside = () => {
    aside.style.transform = "translateX(100%)";
    aside.style.opacity = "0";
    aside.style.pointerEvents = "none";
  };

  if (btnSettings) btnSettings.addEventListener("click", (e) => { 
    e.stopPropagation(); 
    aside.style.opacity === "1" ? closeAside() : openAside(); 
  });
  if (btnCloseAside) btnCloseAside.addEventListener("click", closeAside);

  // ===== Fungsi simpan preferensi =====
  function savePrefs() {
    const data = {
      sound: soundToggle.checked,
      theme: themeSelect.value,
      speed: parseInt(speedRange.value),
      glow: parseInt(glowRange.value),
    };
    localStorage.setItem("sancaSettings", JSON.stringify(data));
    window.sancaSettings = data;
  }

  // ===== Intensitas Glow =====
  function applyGlow(intensity = 6) {
    const glowVal = Math.min(Math.max(intensity, 1), 10);
    // Glow lebih lembut agar tidak terlalu terang
    const shadow = `0 0 ${glowVal}px var(--neon-cyan), 0 0 ${glowVal*2}px var(--neon-green)`;
    const elements = document.querySelectorAll(
      "#bodyPage, header, main, aside, footer, .neon, .text-neon-cyan, .text-neon-green"
    );
    elements.forEach(el => {
      el.style.setProperty("text-shadow", shadow);
      el.style.setProperty("box-shadow", shadow);
    });
  }

  // ===== Kecepatan Animasi =====
  function applySpeed(speedValue) {
    const speed = Math.min(Math.max(speedValue, 1), 10);
    window.sancaSpeed = speed;
    // Animasi linear antara 2s (cepat) - 10s (lambat)
    const duration = ((11 - speed) / 10) * 8 + 2;
    document.querySelectorAll(".neon, .text-neon-cyan, .text-neon-green").forEach(el => {
      el.style.animationDuration = `${duration}s`;
    });
  }

  // ===== Fungsi handle sound toggle =====
  function handleSoundToggle() {
    if (soundToggle.checked) bgMusic.play().catch(() => console.warn("Audio tidak bisa diputar otomatis"));
    else bgMusic.pause();
  }

  // ===== Simpan nilai awal HTML =====
  const initialGlow = glowRange.value || 6;
  const initialSpeed = speedRange.value || 5;
  const initialSound = soundToggle.checked;

  // ===== Load preferensi jika ada =====
  const prefs = JSON.parse(localStorage.getItem("sancaSettings") || "{}");
  if (prefs.sound !== undefined) soundToggle.checked = prefs.sound;
  if (prefs.speed) speedRange.value = prefs.speed;
  if (prefs.glow) glowRange.value = prefs.glow;

  applyGlow(glowRange.value || initialGlow);
  applySpeed(speedRange.value || initialSpeed);
  handleSoundToggle();

  // ===== Event listener input =====
  soundToggle.addEventListener("change", handleSoundToggle);
  speedRange.addEventListener("input", () => applySpeed(speedRange.value));
  glowRange.addEventListener("input", () => applyGlow(glowRange.value));

  // ===== Tombol Simpan =====
  if (btnSaveAside) btnSaveAside.addEventListener("click", () => {
    savePrefs();
    applyGlow(glowRange.value);
    applySpeed(speedRange.value);
    handleSoundToggle();
    closeAside();
  });

  // ===== Klik di luar panel untuk menutup =====
  document.addEventListener("click", (e) => {
    if (aside.style.opacity === "1" && !aside.contains(e.target) && !btnSettings.contains(e.target)) {
      closeAside();
      // restore ke nilai awal HTML jika user tidak klik simpan
      glowRange.value = initialGlow;
      speedRange.value = initialSpeed;
      soundToggle.checked = initialSound;
      applyGlow(initialGlow);
      applySpeed(initialSpeed);
      handleSoundToggle();
    }
  });
}

// ================= INIT SEMUA =================
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    initNeonHeader();
    initAsideSettings();
  });
} else {
  initNeonHeader();
  initAsideSettings();
}



// ==========================
// SANCA MAIN PAGE SCRIPT (FIXED)
// ==========================
// Versi: 1.0.5 — Static Mode Optimized Neon Glow
// Oleh: Den Mardiyana

let pulse = 0;
let snakeTrail = [];
let animationFrame;
let snakeCanvas, ctx;

window.addEventListener("DOMContentLoaded", () => {
  snakeCanvas = document.getElementById("snakeCanvas");
  if (!snakeCanvas) return console.warn("⚠️ snakeCanvas tidak ditemukan di halaman!");
  ctx = snakeCanvas.getContext("2d");

  drawSnakePreview();
});

function drawSnakePreview() {
  const width = (snakeCanvas.width = snakeCanvas.offsetWidth);
  const height = (snakeCanvas.height = snakeCanvas.offsetHeight);
  ctx.clearRect(0, 0, width, height);

  // Background lembut neon
  const gradientBg = ctx.createLinearGradient(0, 0, width, height);
  gradientBg.addColorStop(0, "rgba(0,255,255,0.04)");
  gradientBg.addColorStop(1, "rgba(0,255,128,0.05)");
  ctx.fillStyle = gradientBg;
  ctx.fillRect(0, 0, width, height);

  // Setup properti ular
  const segmentCount = 60;
  const amplitudeX = 70;
  const amplitudeY = 50;

  pulse += 0.05;

  // Posisi kepala (gerakan halus)
  const headX = width / 2 + Math.sin(pulse * 1.3) * amplitudeX;
  const headY = height / 2 + Math.cos(pulse * 0.9) * amplitudeY;

  // Tambah posisi ke trail
  snakeTrail.unshift({ x: headX, y: headY });
  if (snakeTrail.length > segmentCount) snakeTrail.pop();

  // Gambar tiap segmen
  for (let i = 0; i < snakeTrail.length; i++) {
    const seg = snakeTrail[i];
    const t = i / snakeTrail.length;

    // Warna gradasi kepala → ekor
    const r = 0;
    const g = 255 - Math.floor(t * 150);
    const b = 255 - Math.floor(t * 220);
    const alpha = 1 - t * 0.9;
    const color = `rgba(${r},${g},${b},${alpha})`;

    // Ukuran segmen
    const size = 8 + Math.sin(t * Math.PI) * 5;

    // Efek glow tiap segmen
    const glow = ctx.createRadialGradient(seg.x, seg.y, 0, seg.x, seg.y, size * 3);
    glow.addColorStop(0, color);
    glow.addColorStop(1, "transparent");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(seg.x, seg.y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  // Kepala (lebih terang dan efek glow besar)
  const head = snakeTrail[0];
  const headGlow = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, 40);
  headGlow.addColorStop(0, "rgba(0,255,255,1)");
  headGlow.addColorStop(1, "rgba(0,255,255,0)");
  ctx.fillStyle = headGlow;
  ctx.beginPath();
  ctx.arc(head.x, head.y, 10, 0, Math.PI * 2);
  ctx.fill();

  // Efek neon line halus antar segmen
  ctx.shadowColor = "#00fff0";
  ctx.shadowBlur = 15;
  ctx.strokeStyle = "rgba(0,255,255,0.4)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i < snakeTrail.length - 1; i++) {
    const p1 = snakeTrail[i];
    const p2 = snakeTrail[i + 1];
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
  }
  ctx.stroke();
  ctx.shadowBlur = 0;

  animationFrame = requestAnimationFrame(drawSnakePreview);
}

// Reset trail saat resize agar gak glitch
window.addEventListener("resize", () => {
  cancelAnimationFrame(animationFrame);
  snakeTrail = [];
  drawSnakePreview();
});



// ---------- FOOTER FUNCTIONS ----------

// 1️⃣ Newsletter form simulation
const newsletterForm = document.querySelector("footer form");
if (newsletterForm) {
  newsletterForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const emailInput = newsletterForm.querySelector("input[type='email']");
    const email = emailInput.value.trim();

    if (!email || !email.includes("@")) {
      showFooterMessage("Masukkan email yang valid.", "error");
      return;
    }

    emailInput.value = "";
    showFooterMessage("Terima kasih! Kamu sudah berlangganan 🎉", "success");
  });
}

// 2️⃣ Helper untuk menampilkan pesan bawah form
function showFooterMessage(text, type) {
  let msg = document.createElement("p");
  msg.textContent = text;
  msg.className = `mt-2 text-sm ${
    type === "success" ? "text-neon-green" : "text-red-400"
  } transition-all duration-500`;
  newsletterForm.appendChild(msg);
  setTimeout(() => msg.remove(), 3000);
}

// 3️⃣ Smooth scroll navigasi footer
document.querySelectorAll("footer a[href^='#']").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute("href"));
    if (target) {
      window.scrollTo({
        top: target.offsetTop - 80,
        behavior: "smooth",
      });
    }
  });
});

// 4️⃣ Tahun otomatis
const yearSpan = document.querySelector("footer span.text-neon-green");
if (yearSpan) {
  yearSpan.innerHTML = `SANCA ${new Date().getFullYear()}`;
}
