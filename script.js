/**
 * script.js — 3D Interactive Tech Experience
 * - 3D Interactive Perspective Canvas (Interactive Neural Galaxy / Nodes with Mouse Inertia)
 * - 3D Gyroscopic & Mouse Tilt Physics on Cards (Perspective 3D + Glare)
 * - Dynamic Ambient Spotlight tracking cursor
 * - Theme Switcher (Dark by default with high-tech neon accents & Light option)
 * - Mobile Navigation Drawer
 * - Active Link Scroll Spy
 * - Client-validated Formspree Contact Form
 */

(function () {
  'use strict';

  // ── 1. THEME SWITCHER ──
  const themeToggle = document.getElementById('themeToggle');
  const STORAGE_KEY = 'portfolio-theme';

  function getPreferredTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
    // Default to dark for the 3D cybernetic tech aesthetic
    return 'dark';
  }

  function applyTheme(theme) {
    if (theme === 'light') {
      document.body.classList.remove('dark-mode');
      document.body.classList.add('light-mode');
      if (themeToggle) {
        themeToggle.setAttribute('aria-label', 'Switch to dark mode');
        themeToggle.setAttribute('title', 'Switch to dark mode');
      }
    } else {
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
      if (themeToggle) {
        themeToggle.setAttribute('aria-label', 'Switch to light mode');
        themeToggle.setAttribute('title', 'Switch to light mode');
      }
    }
  }

  applyTheme(getPreferredTheme());

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      const isDark = document.body.classList.contains('dark-mode');
      const nextTheme = isDark ? 'light' : 'dark';
      localStorage.setItem(STORAGE_KEY, nextTheme);
      applyTheme(nextTheme);
    });
  }

  // ── 2. 3D INTERACTIVE PARTICLE & NEURAL MESH CANVAS ──
  const canvas = document.getElementById('heroCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    let dpr = window.devicePixelRatio || 1;
    let animationFrameId = null;
    let isCanvasVisible = true;

    // 3D Particles
    const PARTICLE_COUNT = window.innerWidth < 768 ? 45 : 85;
    const particles = [];
    const FOV = 400; // Field of view distance

    // Rotation state & mouse inertia
    let rotX = 0;
    let rotY = 0;
    let targetRotX = 0;
    let targetRotY = 0;
    let mouseX = 0;
    let mouseY = 0;

    function resizeCanvas() {
      const parent = canvas.parentElement;
      width = parent ? parent.offsetWidth : window.innerWidth;
      height = parent ? parent.offsetHeight : window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.scale(dpr, dpr);
    }

    // Initialize 3D point cloud in a spherical/ellipsoid volume
    function initParticles() {
      particles.length = 0;
      const radius = Math.min(width, height) * 0.45;

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        // Spherical distribution
        const theta = Math.random() * 2 * Math.PI;
        const phi = Math.acos(Math.random() * 2 - 1);
        const r = radius * Math.cbrt(Math.random()); // Even volume distribution

        particles.push({
          x: r * Math.sin(phi) * Math.cos(theta),
          y: r * Math.sin(phi) * Math.sin(theta),
          z: r * Math.cos(phi),
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          vz: (Math.random() - 0.5) * 0.4,
          baseRadius: Math.random() * 2 + 1.2,
          pulse: Math.random() * Math.PI * 2,
        });
      }
    }

    resizeCanvas();
    initParticles();
    window.addEventListener('resize', function () {
      resizeCanvas();
      initParticles();
    }, { passive: true });

    // Track mouse over window with smooth easing
    window.addEventListener('mousemove', function (e) {
      const rect = canvas.getBoundingClientRect();
      mouseX = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
      mouseY = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);

      targetRotY = mouseX * 0.55;
      targetRotX = -mouseY * 0.55;
    }, { passive: true });

    // Render loop
    function render3D() {
      if (!isCanvasVisible) {
        animationFrameId = requestAnimationFrame(render3D);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // Smooth inertia rotation
      rotX += (targetRotX - rotX) * 0.05 + 0.001; // Continuous subtle spin
      rotY += (targetRotY - rotY) * 0.05 + 0.002;

      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);

      const cx = width / 2;
      const cy = height / 2;

      const isDarkMode = document.body.classList.contains('dark-mode');
      const pointColor = isDarkMode ? '59, 130, 246' : '37, 99, 235';
      const accentColor = isDarkMode ? '168, 85, 247' : '124, 58, 237';

      // Transform, project and sort particles by depth (Z-buffer)
      const projected = [];

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Animate particles subtly
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;
        p.pulse += 0.03;

        // Bounce within sphere boundary
        const dist = Math.hypot(p.x, p.y, p.z);
        const maxR = Math.min(width, height) * 0.5;
        if (dist > maxR) {
          p.x = (p.x / dist) * maxR * 0.98;
          p.y = (p.y / dist) * maxR * 0.98;
          p.z = (p.z / dist) * maxR * 0.98;
          p.vx *= -1;
          p.vy *= -1;
          p.vz *= -1;
        }

        // 3D Matrix Rotation (Y then X)
        const x1 = p.x * cosY + p.z * sinY;
        const z1 = -p.x * sinY + p.z * cosY;

        const y2 = p.y * cosX - z1 * sinX;
        const z2 = p.y * sinX + z1 * cosX;

        // Perspective Projection
        const distance = FOV + z2;
        if (distance <= 0) continue;

        const scale = FOV / distance;
        const screenX = cx + x1 * scale;
        const screenY = cy + y2 * scale;
        const alpha = Math.min(Math.max((z2 + 300) / 600, 0.15), 0.95);

        projected.push({
          x: screenX,
          y: screenY,
          z: z2,
          scale: scale,
          alpha: alpha,
          size: p.baseRadius * scale * (1 + 0.2 * Math.sin(p.pulse)),
          isAccent: i % 4 === 0,
        });
      }

      // Draw connecting lines in 3D
      const maxConnectDist = window.innerWidth < 768 ? 95 : 120;
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const p1 = projected[i];
          const p2 = projected[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist2D = Math.hypot(dx, dy);

          if (dist2D < maxConnectDist) {
            const lineAlpha = (1 - dist2D / maxConnectDist) * Math.min(p1.alpha, p2.alpha) * 0.4;
            ctx.strokeStyle = `rgba(${p1.isAccent ? accentColor : pointColor}, ${lineAlpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // Draw 3D nodes with glow
      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];
        const color = p.isAccent ? accentColor : pointColor;

        // Soft outer glow
        ctx.fillStyle = `rgba(${color}, ${p.alpha * 0.3})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Core dot
        ctx.fillStyle = `rgba(${color}, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render3D);
    }

    // Pause rendering when hero is off-screen to save CPU & battery
    const heroSection = document.getElementById('hero');
    if ('IntersectionObserver' in window && heroSection) {
      const heroObserver = new IntersectionObserver(function (entries) {
        isCanvasVisible = entries[0].isIntersecting;
      }, { threshold: 0.05 });
      heroObserver.observe(heroSection);
    }

    animationFrameId = requestAnimationFrame(render3D);
  }

  // ── 3. 3D TILT EFFECT ON CARDS WITH DYNAMIC PERSPECTIVE & GLARE ──
  const tiltCards = document.querySelectorAll('.tilt-card');
  const prefersReducedMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReducedMotion && window.matchMedia('(hover: hover)').matches) {
    tiltCards.forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -7; // Max tilt 7deg
        const rotateY = ((x - centerX) / centerX) * 7;

        // Dynamic 3D perspective tilt
        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;

        // Set CSS variables for holographic glare highlight
        const glareX = (x / rect.width) * 100;
        const glareY = (y / rect.height) * 100;
        card.style.setProperty('--glare-x', `${glareX}%`);
        card.style.setProperty('--glare-y', `${glareY}%`);
      });

      card.addEventListener('mouseleave', function () {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
      });
    });
  }

  // ── 4. MOBILE NAVIGATION DRAWER ──
  const hamburger = document.getElementById('hamburger');
  const navOverlay = document.getElementById('navOverlay');
  const navOverlayBg = document.getElementById('navOverlayBg');
  const navDrawerLinks = document.getElementById('navDrawerLinks');

  function openMobileNav() {
    if (!hamburger || !navOverlay) return;
    hamburger.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
    navOverlay.classList.add('open');
    navOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    const firstLink = navDrawerLinks ? navDrawerLinks.querySelector('a') : null;
    if (firstLink) {
      setTimeout(() => firstLink.focus(), 100);
    }
  }

  function closeMobileNav() {
    if (!hamburger || !navOverlay) return;
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    navOverlay.classList.remove('open');
    navOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (hamburger) {
    hamburger.addEventListener('click', function () {
      const isOpen = hamburger.classList.contains('active');
      if (isOpen) closeMobileNav();
      else openMobileNav();
    });
  }

  if (navOverlayBg) {
    navOverlayBg.addEventListener('click', closeMobileNav);
  }

  if (navDrawerLinks) {
    navDrawerLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMobileNav);
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && navOverlay && navOverlay.classList.contains('open')) {
      closeMobileNav();
      if (hamburger) hamburger.focus();
    }
  });

  // ── 5. HEADER SCROLL ELEVATION ──
  const header = document.getElementById('header');
  function handleHeaderScroll() {
    if (!header) return;
    if (window.pageYOffset > 24) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', handleHeaderScroll, { passive: true });
  handleHeaderScroll();

  // ── 6. ACTIVE NAV SCROLL SPY ──
  const sections = document.querySelectorAll('section[id], main[id]');
  const desktopNavLinks = document.querySelectorAll('.nav-links a');
  const drawerNavLinks = document.querySelectorAll('.nav-drawer-links a');

  function updateActiveNav() {
    const scrollPosition = window.pageYOffset + 120;
    let currentId = '';

    sections.forEach(function (section) {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      if (scrollPosition >= top && scrollPosition < top + height) {
        currentId = id;
      }
    });

    if (!currentId && sections.length > 0) {
      currentId = sections[0].getAttribute('id');
    }

    function syncLinks(linkList) {
      linkList.forEach(function (link) {
        const href = link.getAttribute('href');
        if (href === '#' + currentId) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }

    syncLinks(desktopNavLinks);
    syncLinks(drawerNavLinks);
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });
  updateActiveNav();

  // ── 7. SCROLL REVEAL (WITH REDUCED MOTION RESPECT) ──
  const revealElements = document.querySelectorAll('.reveal');

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealElements.forEach(function (el) {
      el.classList.add('visible');
    });
  } else {
    const revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.1,
      }
    );

    revealElements.forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  // ── 8. CONTACT FORM VALIDATION & SUBMISSION ──
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const messageInput = document.getElementById('message');
    const gotchaInput = document.getElementById('_gotcha');
    const submitBtn = document.getElementById('submitBtn');
    const formFeedback = document.getElementById('formFeedback');

    const errName = document.getElementById('errName');
    const errEmail = document.getElementById('errEmail');
    const errMessage = document.getElementById('errMessage');

    function isValidEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function clearError(input, errorEl) {
      if (input) {
        input.classList.remove('input-error');
        input.removeAttribute('aria-invalid');
      }
      if (errorEl) {
        errorEl.classList.remove('show');
      }
    }

    function showError(input, errorEl) {
      if (input) {
        input.classList.add('input-error');
        input.setAttribute('aria-invalid', 'true');
      }
      if (errorEl) {
        errorEl.classList.add('show');
      }
    }

    if (nameInput) nameInput.addEventListener('input', () => clearError(nameInput, errName));
    if (emailInput) emailInput.addEventListener('input', () => clearError(emailInput, errEmail));
    if (messageInput) messageInput.addEventListener('input', () => clearError(messageInput, errMessage));

    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      if (formFeedback) {
        formFeedback.className = 'form-feedback';
        formFeedback.textContent = '';
        formFeedback.style.display = 'none';
      }

      if (gotchaInput && gotchaInput.value.trim() !== '') {
        contactForm.reset();
        if (formFeedback) {
          formFeedback.className = 'form-feedback success';
          formFeedback.textContent = 'Thank you! Your message has been sent.';
          formFeedback.style.display = 'block';
        }
        return;
      }

      let isValid = true;
      let firstInvalid = null;

      const nameVal = nameInput ? nameInput.value.trim() : '';
      if (!nameVal || nameVal.length < 2) {
        showError(nameInput, errName);
        isValid = false;
        if (!firstInvalid) firstInvalid = nameInput;
      } else {
        clearError(nameInput, errName);
      }

      const emailVal = emailInput ? emailInput.value.trim() : '';
      if (!emailVal || !isValidEmail(emailVal)) {
        showError(emailInput, errEmail);
        isValid = false;
        if (!firstInvalid) firstInvalid = emailInput;
      } else {
        clearError(emailInput, errEmail);
      }

      const msgVal = messageInput ? messageInput.value.trim() : '';
      if (!msgVal || msgVal.length < 10) {
        showError(messageInput, errMessage);
        isValid = false;
        if (!firstInvalid) firstInvalid = messageInput;
      } else {
        clearError(messageInput, errMessage);
      }

      if (!isValid) {
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      const originalBtnText = submitBtn ? submitBtn.textContent : 'Send Message';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Transmitting...';
      }

      const formData = new FormData(contactForm);

      fetch('https://formspree.io/f/xgoprkvr', {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json',
        },
      })
        .then(function (res) {
          if (res.ok) {
            contactForm.reset();
            if (formFeedback) {
              formFeedback.className = 'form-feedback success';
              formFeedback.textContent = 'Message transmitted successfully! I will respond to your inquiry shortly.';
              formFeedback.style.display = 'block';
            }
          } else {
            return res.json().then(function (data) {
              throw new Error(data && data.error ? data.error : 'Transmission failed');
            });
          }
        })
        .catch(function () {
          if (formFeedback) {
            formFeedback.className = 'form-feedback error';
            formFeedback.innerHTML = 'Automated transmission failed. Please reach out directly to <a href="mailto:fadliyusra84@gmail.com" style="text-decoration: underline; color: inherit; font-weight: 700;">fadliyusra84@gmail.com</a>.';
            formFeedback.style.display = 'block';
          }
        })
        .finally(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
          }
        });
    });
  }
})();
