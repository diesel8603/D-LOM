if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(reg => {
      console.log('Service Worker kayıtlı:', reg);
      reg.onupdatefound = () => {
        const newWorker = reg.installing;
        newWorker.onstatechange = () => {
          if (newWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              console.log('Yeni içerik bulundu — sayfayı yenileyin.');
            } else {
              console.log('İçerik önbelleklendi, offline çalışabilir.');
            }
          }
        };
      };
    })
    .catch(err => console.error('Service Worker kayıt hatası:', err));

  navigator.serviceWorker.addEventListener("message", (event) => {
    if (event.data?.type === "CACHE_PROGRESS") {
      const { loaded, total } = event.data;
      const percent = Math.round((loaded / total) * 100);
      const bar = document.getElementById("progressBar");
      const text = document.getElementById("loadingText");
      if (bar) bar.style.width = percent + "%";
      if (text) text.textContent = `Yükleniyor... %${percent}`;
      if (percent >= 100) {
        setTimeout(() => {
          document.getElementById("splash").classList.add("fade-out");
          setTimeout(() => {
            document.getElementById("splash").remove();
            document.getElementById("app").classList.remove("hidden");
          }, 500);
        }, 200);
      }
    }
  });
}

