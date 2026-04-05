/* script.js — scroll animations & interactions */

// ── SCROLL REVEAL ──
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  { threshold: 0.12 },
);

document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

// ── HEADER SHADOW ON SCROLL ──
window.addEventListener(
  "scroll",
  () => {
    const header = document.querySelector("header");
    if (window.pageYOffset > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  },
  { passive: true },
);
