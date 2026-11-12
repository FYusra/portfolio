/**
 * script.js — 3D Immersive Portfolio Experience (2026)
 * 
 * Features:
 * - Three.js: Floating wireframe geometries + particle galaxy in hero
 * - GSAP ScrollTrigger: Scroll-driven 3D section animations
 * - Enhanced 3D tilt cards with holographic glare
 * - Cursor-following ambient glow
 * - Theme Switcher (Monochrome Premium dark / light)
 * - Mobile Navigation Drawer
 * - Active Nav Scroll Spy
 * - Contact Form with Formspree
 */

(function () {
  'use strict';

  // ── 1. THEME SWITCHER ──
  const themeToggle = document.getElementById('themeToggle');
  const STORAGE_KEY = 'portfolio-theme';

  function getPreferredTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
    return 'dark'; // Monochrome Premium dark by default
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
    // Update Three.js scene colors if available
    if (window._updateSceneTheme) window._updateSceneTheme(theme);
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

  // ── 2. THREE.JS IMMERSIVE 3D SCENE ──
  const threeBg = document.getElementById('three-bg');
  const prefersReducedMotionInit =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (threeBg && window.THREE && !prefersReducedMotionInit) {
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050505, 0.018);

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      200
    );
    camera.position.set(0, 0, 28);

    const renderer = new THREE.WebGLRenderer({
      canvas: threeBg,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;
    const isMobile = window.innerWidth < 768;
    const isDark = document.body.classList.contains('dark-mode');

    scene.add(new THREE.AmbientLight(0x102030, 0.55));
    const lightCyan = new THREE.PointLight(0x00d4ff, 2.4, 90);
    lightCyan.position.set(12, 10, 18);
    scene.add(lightCyan);
    const lightViolet = new THREE.PointLight(0x7c3aed, 1.8, 90);
    lightViolet.position.set(-16, -8, 12);
    scene.add(lightViolet);

    const crystal = new THREE.Mesh(
      new THREE.IcosahedronGeometry(4.2, 1),
      new THREE.MeshStandardMaterial({
        color: 0x061018,
        emissive: 0x00d4ff,
        emissiveIntensity: 0.35,
        metalness: 0.85,
        roughness: 0.18,
        wireframe: false,
      })
    );
    crystal.position.set(8.5, 1.2, -6);
    scene.add(crystal);

    const crystalWire = new THREE.Mesh(
      new THREE.IcosahedronGeometry(4.35, 1),
      new THREE.MeshBasicMaterial({
        color: 0x00d4ff,
        wireframe: true,
        transparent: true,
        opacity: isDark ? 0.28 : 0.12,
      })
    );
    crystal.add(crystalWire);

    const knot = new THREE.Mesh(
      new THREE.TorusKnotGeometry(2.2, 0.42, 128, 16),
      new THREE.MeshStandardMaterial({
        color: 0x14081f,
        emissive: 0x7c3aed,
        emissiveIntensity: 0.45,
        metalness: 0.7,
        roughness: 0.25,
      })
    );
    knot.position.set(-11, -3.5, -8);
    scene.add(knot);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(6.4, 0.035, 16, 96),
      new THREE.MeshBasicMaterial({
        color: 0x00d4ff,
        transparent: true,
        opacity: 0.35,
      })
    );
    ring.rotation.x = Math.PI / 2.4;
    ring.position.copy(crystal.position);
    scene.add(ring);

    const ring2 = ring.clone();
    ring2.rotation.z = Math.PI / 3;
    ring2.scale.set(0.78, 0.78, 0.78);
    ring2.material = ring.material.clone();
    ring2.material.color.setHex(0x7c3aed);
    scene.add(ring2);

    const geometries = [];
    const geoConfigs = [
      { geo: new THREE.OctahedronGeometry(1.6, 0), pos: [-16, 8, -14], speed: 0.004 },
      { geo: new THREE.TetrahedronGeometry(1.4, 0), pos: [16, -9, -12], speed: 0.005 },
      { geo: new THREE.DodecahedronGeometry(1.3, 0), pos: [4, 10, -18], speed: 0.003 },
      { geo: new THREE.IcosahedronGeometry(1.1, 0), pos: [-6, -11, -16], speed: 0.004 },
    ];

    geoConfigs.forEach(function (cfg, i) {
      const mesh = new THREE.Mesh(
        cfg.geo,
        new THREE.MeshBasicMaterial({
          color: i % 2 === 0 ? 0x00d4ff : 0x7c3aed,
          wireframe: true,
          transparent: true,
          opacity: isDark ? 0.22 : 0.1,
        })
      );
      mesh.position.set(cfg.pos[0], cfg.pos[1], cfg.pos[2]);
      mesh.userData = {
        speed: cfg.speed,
        baseY: cfg.pos[1],
        phase: Math.random() * Math.PI * 2,
      };
      scene.add(mesh);
      geometries.push(mesh);
    });

    const nodeCount = isMobile ? 48 : 90;
    const nodePositions = [];
    const nodes = new THREE.Group();
    for (let i = 0; i < nodeCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 10 + Math.random() * 18;
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi) - 6;
      nodePositions.push(new THREE.Vector3(x, y, z));
    }

    const nodeGeo = new THREE.BufferGeometry().setFromPoints(nodePositions);
    const nodePoints = new THREE.Points(
      nodeGeo,
      new THREE.PointsMaterial({
        color: 0x00d4ff,
        size: 0.12,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    nodes.add(nodePoints);

    const linePositions = [];
    const maxDist = 7.2;
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        if (nodePositions[i].distanceTo(nodePositions[j]) < maxDist) {
          linePositions.push(nodePositions[i], nodePositions[j]);
        }
      }
    }
    const lineGeo = new THREE.BufferGeometry().setFromPoints(linePositions);
    const networkLines = new THREE.LineSegments(
      lineGeo,
      new THREE.LineBasicMaterial({
        color: 0x00d4ff,
        transparent: true,
        opacity: isDark ? 0.12 : 0.06,
      })
    );
    nodes.add(networkLines);
    scene.add(nodes);

    const particleCount = isMobile ? 600 : 1600;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 18 + Math.random() * 42;
      particlePositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = r * Math.cos(phi);
    }
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(particlePositions, 3)
    );
    const particleMaterial = new THREE.PointsMaterial({
      color: isDark ? 0x7ecbff : 0x4aa8c9,
      size: 0.055,
      transparent: true,
      opacity: isDark ? 0.55 : 0.28,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);

    window._updateSceneTheme = function (theme) {
      const dark = theme === 'dark';
      scene.fog = new THREE.FogExp2(dark ? 0x050505 : 0xf4f7fb, dark ? 0.018 : 0.012);
      crystalWire.material.opacity = dark ? 0.28 : 0.12;
      networkLines.material.opacity = dark ? 0.12 : 0.06;
      particleMaterial.color.setHex(dark ? 0x7ecbff : 0x4aa8c9);
      particleMaterial.opacity = dark ? 0.55 : 0.28;
      geometries.forEach(function (mesh, i) {
        mesh.material.opacity = dark ? 0.22 : 0.1;
        mesh.material.color.setHex(i % 2 === 0 ? 0x00d4ff : 0x7c3aed);
      });
    };

    document.addEventListener(
      'mousemove',
      function (e) {
        targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
        targetMouseY = -(e.clientY / window.innerHeight) * 2 + 1;
      },
      { passive: true }
    );

    window.addEventListener(
      'resize',
      function () {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      },
      { passive: true }
    );

    let time = 0;
    let isSceneVisible = document.visibilityState === 'visible';
    document.addEventListener('visibilitychange', function () {
      isSceneVisible = document.visibilityState === 'visible';
    });

    function animate() {
      requestAnimationFrame(animate);
      if (!isSceneVisible) return;

      time += 0.008;
      mouseX += (targetMouseX - mouseX) * 0.035;
      mouseY += (targetMouseY - mouseY) * 0.035;

      camera.position.x = mouseX * 4.5;
      camera.position.y = mouseY * 2.4;
      camera.lookAt(0, 0, 0);

      crystal.rotation.x += 0.0025;
      crystal.rotation.y += 0.004;
      knot.rotation.x += 0.006;
      knot.rotation.y += 0.008;
      ring.rotation.z += 0.004;
      ring2.rotation.y += 0.005;
      nodes.rotation.y = time * 0.12;
      particleSystem.rotation.y = time * 0.04;
      particleSystem.rotation.x = time * 0.015;
      lightCyan.position.x = 12 + Math.sin(time) * 4;
      lightViolet.position.y = -8 + Math.cos(time * 0.8) * 3;

      geometries.forEach(function (mesh) {
        mesh.rotation.x += mesh.userData.speed;
        mesh.rotation.y += mesh.userData.speed * 0.7;
        mesh.position.y =
          mesh.userData.baseY + Math.sin(time * 2 + mesh.userData.phase) * 1.4;
      });

      renderer.render(scene, camera);
    }

    animate();
  }

  // ── 3. CURSOR GLOW FOLLOW ──
  const cursorGlow = document.querySelector('.cursor-glow');
  if (cursorGlow && window.matchMedia('(hover: hover)').matches) {
    document.addEventListener('mousemove', function (e) {
      cursorGlow.style.left = e.clientX + 'px';
      cursorGlow.style.top = e.clientY + 'px';
    }, { passive: true });
  }

  // ── 4. ENHANCED 3D TILT EFFECT ON CARDS ──
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

        const rotateX = ((y - centerY) / centerY) * -8;
        const rotateY = ((x - centerX) / centerX) * 8;

        card.style.transform = 
          `perspective(1200px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-6px) scale(1.01)`;

        // Holographic glare
        const glareX = (x / rect.width) * 100;
        const glareY = (y / rect.height) * 100;
        card.style.setProperty('--glare-x', `${glareX}%`);
        card.style.setProperty('--glare-y', `${glareY}%`);
      });

      card.addEventListener('mouseleave', function () {
        card.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)';
      });
    });
  }

  // ── 5. GSAP SCROLL ANIMATIONS ──
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    // Animate sections on scroll with 3D transforms
    const sections = document.querySelectorAll('section');
    
    sections.forEach(function (section) {
      gsap.fromTo(section.querySelectorAll('.reveal'), 
        {
          opacity: 0,
          y: 50,
          rotateX: -5,
        },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 85%',
            end: 'top 35%',
            toggleActions: 'play none none none',
          },
        }
      );
    });

    // Hero entrance animation
    const heroElements = document.querySelectorAll('.hero .hero-text > *');
    gsap.fromTo(heroElements,
      { opacity: 0, y: 40, filter: 'blur(8px)' },
      { 
        opacity: 1, 
        y: 0, 
        filter: 'blur(0px)',
        duration: 1,
        stagger: 0.12,
        ease: 'power4.out',
        delay: 0.3,
      }
    );

    // Hero image 3D float in
    const heroImg = document.querySelector('.hero-img-container');
    if (heroImg) {
      gsap.fromTo(heroImg,
        { opacity: 0, scale: 0.8, rotateY: -15 },
        { 
          opacity: 1, 
          scale: 1, 
          rotateY: 0,
          duration: 1.2,
          ease: 'power3.out',
          delay: 0.5,
        }
      );
    }

    // Parallax effect on hero image while scrolling
    if (heroImg) {
      gsap.to(heroImg, {
        y: 80,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
      });
    }

  } else {
    // Fallback: IntersectionObserver for reveal animations
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
        { rootMargin: '0px 0px -60px 0px', threshold: 0.1 }
      );

      revealElements.forEach(function (el) {
        revealObserver.observe(el);
      });
    }
  }

  // ── 6. MOBILE NAVIGATION DRAWER ──
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

  // ── 7. HEADER SCROLL ELEVATION ──
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

  // ── 8. ACTIVE NAV SCROLL SPY ──
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const isSubpage = currentPath === 'profil.html' || currentPath === 'kontak.html';

  const pageSections = document.querySelectorAll('section[id], main[id]');
  const desktopNavLinks = document.querySelectorAll('.nav-links a');
  const drawerNavLinks = document.querySelectorAll('.nav-drawer-links a');

  function updateActiveNav() {
    if (isSubpage) {
      function highlightSubpageLinks(linkList) {
        linkList.forEach(function (link) {
          const href = link.getAttribute('href');
          if (href === currentPath) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
      highlightSubpageLinks(desktopNavLinks);
      highlightSubpageLinks(drawerNavLinks);
      return;
    }

    const scrollPosition = window.pageYOffset + 120;
    let currentId = '';

    pageSections.forEach(function (section) {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      if (scrollPosition >= top && scrollPosition < top + height) {
        currentId = id;
      }
    });

    if (!currentId && pageSections.length > 0) {
      currentId = pageSections[0].getAttribute('id');
    }

    function syncLinks(linkList) {
      linkList.forEach(function (link) {
        const href = link.getAttribute('href');
        if (href === '#' + currentId) {
          link.classList.add('active');
        } else if (href && href.startsWith('#')) {
          link.classList.remove('active');
        }
      });
    }

    syncLinks(desktopNavLinks);
    syncLinks(drawerNavLinks);
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });
  updateActiveNav();

  // ── 9. CONTACT FORM VALIDATION & SUBMISSION ──
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
      if (errorEl) errorEl.classList.remove('show');
    }

    function showError(input, errorEl) {
      if (input) {
        input.classList.add('input-error');
        input.setAttribute('aria-invalid', 'true');
      }
      if (errorEl) errorEl.classList.add('show');
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
        submitBtn.textContent = 'Sending...';
      }

      const formData = new FormData(contactForm);

      fetch('https://formspree.io/f/xgoprkvr', {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' },
      })
        .then(function (res) {
          if (res.ok) {
            contactForm.reset();
            if (formFeedback) {
              formFeedback.className = 'form-feedback success';
              formFeedback.textContent = 'Message sent successfully! I\'ll respond shortly.';
              formFeedback.style.display = 'block';
            }
          } else {
            return res.json().then(function (data) {
              throw new Error(data && data.error ? data.error : 'Send failed');
            });
          }
        })
        .catch(function () {
          if (formFeedback) {
            formFeedback.className = 'form-feedback error';
            formFeedback.innerHTML = 'Failed to send. Please email me directly at <a href="mailto:fadliyusra84@gmail.com" style="text-decoration: underline; color: inherit; font-weight: 700;">fadliyusra84@gmail.com</a>.';
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
