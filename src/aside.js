// === ASIDE PANEL ===
const toggleAsideBtn = document.getElementById("toggleAside");
const profileAside = document.getElementById("profileAside");
const closeAsideBtn = document.getElementById("closeAsideBtn");

// Awal: posisi tersembunyi di kanan
profileAside.classList.add("translate-x-full", "transition-transform", "duration-500", "ease-out");

// Fungsi toggle aside
function toggleAside() {
  const isVisible = profileAside.classList.contains("translate-x-0");

  if (isVisible) {
    // Tutup
    profileAside.classList.remove("translate-x-0");
    profileAside.classList.add("translate-x-full");
  } else {
    // Buka
    profileAside.classList.remove("translate-x-full");
    profileAside.classList.add("translate-x-0");
  }
}

// Event listener untuk buka & tutup aside
toggleAsideBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  toggleAside();
});

closeAsideBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  toggleAside();
});

// Tutup ketika klik di luar aside
document.addEventListener("click", (e) => {
  if (!profileAside.contains(e.target) && e.target !== toggleAsideBtn) {
    if (profileAside.classList.contains("translate-x-0")) {
      toggleAside();
    }
  }
});

// === MOBILE MENU ===
const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const mobileMenu = document.getElementById("mobileMenu");

if (mobileMenuBtn && mobileMenu) {
  mobileMenuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = mobileMenu.classList.contains("opacity-100");

    if (isOpen) {
      mobileMenu.classList.remove("opacity-100", "scale-100", "pointer-events-auto");
      mobileMenu.classList.add("opacity-0", "scale-95", "pointer-events-none");
    } else {
      mobileMenu.classList.remove("opacity-0", "scale-95", "pointer-events-none");
      mobileMenu.classList.add("opacity-100", "scale-100", "pointer-events-auto");
    }
  });

  document.addEventListener("click", (e) => {
    if (!mobileMenu.contains(e.target) && e.target !== mobileMenuBtn) {
      mobileMenu.classList.remove("opacity-100", "scale-100", "pointer-events-auto");
      mobileMenu.classList.add("opacity-0", "scale-95", "pointer-events-none");
    }
  });
}
