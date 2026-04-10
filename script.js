/* script.js — scroll animations, dark mode */

// ── SCROLL REVEAL ──
var observer = new IntersectionObserver(
  function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  { threshold: 0.12 },
);

document.querySelectorAll(".reveal").forEach(function (el) {
  observer.observe(el);
});

// ── HEADER SHADOW ON SCROLL ──
window.addEventListener(
  "scroll",
  function () {
    var header = document.querySelector("header");
    if (window.pageYOffset > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  },
  { passive: true },
);

// ── DARK MODE TOGGLE ──
var toggleBtn = document.getElementById("darkToggle");

// Cek apakah sebelumnya sudah dark mode (disimpan di localStorage)
if (localStorage.getItem("darkMode") === "on") {
  document.body.classList.add("dark-mode");
  if (toggleBtn) toggleBtn.textContent = "Mode Terang";
}

if (toggleBtn) {
  toggleBtn.addEventListener("click", function () {
    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {
      toggleBtn.textContent = "Mode Terang";
      localStorage.setItem("darkMode", "on");
    } else {
      toggleBtn.textContent = "Mode Gelap";
      localStorage.setItem("darkMode", "off");
    }
  });
}
