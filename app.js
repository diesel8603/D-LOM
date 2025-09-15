/* =======================
   GLOBAL DEĞİŞKENLER
   ======================= */
let deferredPrompt = null;

/* DOM ELEMENTLERİ */
const splash = document.getElementById("splash");
const progressBar = document.getElementById("progressBar");
const loadingText = document.getElementById("loadingText");
const app = document.getElementById("app");
const installBtn = document.getElementById("installBtn");
const menuBtn = document.getElementById("menuBtn");
const mobileMenu = document.getElementById("mobileMenu");
const menuOverlay = document.getElementById("menuOverlay");

/* =======================
   INSTALL PROMPT
   ======================= */
function updateInstallBtnVisibility() {
  if (!installBtn) return;
  installBtn.hidden = !deferredPrompt;
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  updateInstallBtnVisibility();
});

window.addEventListener('appinstalled', () => console.log('Uygulama ana ekrana eklendi.'));

installBtn?.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  installBtn.hidden = true;
  deferredPrompt.prompt();
  try {
    const choice = await deferredPrompt.userChoice;
    console.log('Kullanıcı seçimi:', choice.outcome);
  } catch (err) {
    console.warn('Install prompt hatası', err);
  }
  deferredPrompt = null;
  updateInstallBtnVisibility();
});

/* =======================
   SPLASH SCREEN
   ======================= */
function startSplash() {
  if (!splash || !progressBar || !loadingText) {
    finishSplash();
    return;
  }

  let progress = 0;
  const duration = 4000; // ✅ Splash süresi (4sn)
  const startTime = performance.now();

  function lerpColor(color1, color2, t) {
    // İki renk arasında geçiş yap (linear interpolation)
    const c1 = color1.match(/\w\w/g).map(x => parseInt(x, 16));
    const c2 = color2.match(/\w\w/g).map(x => parseInt(x, 16));
    const result = c1.map((v, i) => Math.round(v + (c2[i] - v) * t));
    return `rgb(${result.join(",")})`;
  }

  function animate(time) {
    const elapsed = time - startTime;
    progress = Math.min((elapsed / duration) * 100, 100);

    // ✅ Renk geçişi hesaplama
    let color;
    if (progress < 50) {
      // %0 → %50 arasında kırmızıdan sarıya
      color = lerpColor("ff0000", "ffff00", progress / 50);
    } else {
      // %50 → %100 arasında sarıdan yeşile
      color = lerpColor("ffff00", "00ff00", (progress - 50) / 50);
    }

    progressBar.style.width = `${progress.toFixed(0)}%`;
    progressBar.style.backgroundColor = color;
    loadingText.textContent = `Yükleniyor... %${progress.toFixed(0)}`;

    if (progress < 100) {
      requestAnimationFrame(animate);
    } else {
      splash.classList.add("fade-out");
      setTimeout(finishSplash, 1000);
    }
  }

  requestAnimationFrame(animate);
}



function finishSplash() {
  splash?.parentNode?.removeChild(splash);
  app?.classList.remove("hidden");
  showTimePopup?.();
  updateInstallBtnVisibility();
}

/* =======================
   SAAT BAZLI POPUP
   ======================= */
function showTimePopup() {
  const popup = document.getElementById('timePopup');
  if (!popup) return;

  const messageSpan = popup.querySelector('.message');
  const iconSpan = popup.querySelector('.icon');
  if (!messageSpan) return;

  const hours = new Date().getHours();
  let message = '', className = '';

  if (hours >= 6 && hours <= 14) {
    message = 'Günaydın! Harika bir sabah sizi bekliyor';
    className = 'morning';
  } else if (hours > 14 && hours <= 18) {
    message = 'İyi öğleden sonralar!';
    className = 'afternoon';
  } else if (hours > 18 && hours <= 23) {
    message = 'İyi akşamlar!';
    className = 'evening';
  } else {
    message = 'Gece sakinliği...';
    className = 'night';
  }

  popup.className = `popup ${className} show`;
  messageSpan.textContent = message;
  if (iconSpan) {
    const icons = { morning: '☀️', afternoon: '🌤️', evening: '🌆', night: '🌙' };
    iconSpan.textContent = icons[className];
  }

  setTimeout(() => {
    popup.classList.add('hide');
    setTimeout(() => popup.className = 'popup', 500);
  }, 10000);
}

/* =======================
   MOBİL MENÜ
   ======================= */
function closeMenuPanel() {
  mobileMenu?.classList.remove("show");
  menuOverlay?.classList.remove("show");
  menuBtn?.classList.remove("open");
}

menuBtn?.addEventListener("click", () => {
  mobileMenu?.classList.toggle("show");
  menuOverlay?.classList.toggle("show");
  menuBtn?.classList.toggle("open");
});

menuOverlay?.addEventListener("click", closeMenuPanel);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeMenuPanel();
});

/* =======================
   TEMA KONTROLÜ (LIGHT/DARK)
   ======================= */
try {
  const isLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  document.body.classList.toggle('light', isLight);
  document.body.classList.toggle('dark', !isLight);
} catch(e){}

/* =======================
   DOM READY
   ======================= */
document.addEventListener('DOMContentLoaded', startSplash);
