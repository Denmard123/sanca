// src/ads.js
document.addEventListener("DOMContentLoaded", () => {
    const adContainer = document.querySelector("#ad-slot");
    if (!adContainer) return;
  
    adContainer.innerHTML = "";
  
    const monetagWrapper = document.createElement("div");
    monetagWrapper.id = "monetag-wrapper";
    monetagWrapper.className =
      "rounded-xl overflow-hidden border border-green-600/30 bg-black/20 p-2";
    adContainer.appendChild(monetagWrapper);
  
    // ✅ Deteksi: kalau lagi di localhost, tampilkan dummy ads
    if (location.hostname === "127.0.0.1" || location.hostname === "localhost") {
      monetagWrapper.innerHTML = `
        <div class="text-green-400 text-sm text-center p-4">
          [Simulasi Monetag aktif — gunakan domain publik untuk melihat iklan asli]
        </div>
      `;
      return;
    }
  
    // === Kalau bukan localhost, muat script Monetag asli ===
    const monetagScript = document.createElement("script");
    monetagScript.src = "https://fpyf8.com/88/tag.min.js";
    monetagScript.async = true;
    monetagScript.dataset.zone = "1288";
    monetagScript.dataset.cfasync = "false";
    monetagWrapper.appendChild(monetagScript);
  
    const style = document.createElement("style");
    style.textContent = `
      #ad-card iframe,
      #ad-card ins,
      #monetag-wrapper > * {
        max-width: 100% !important;
        width: 100% !important;
        display: block !important;
        margin: 0 auto !important;
        border-radius: 0.75rem;
      }
    `;
    document.head.appendChild(style);
  
    console.log("✅ Monetag loaded in card space");
  });
  