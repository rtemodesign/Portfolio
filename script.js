document.addEventListener('DOMContentLoaded', () => {
  // === MOBILE NAVIGATION MENU TOGGLE ===
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      navToggle.classList.toggle('active');
      navMenu.classList.toggle('active');
    });

    const navLinks = navMenu.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
      });
    });

    window.addEventListener('scroll', () => {
      if (navMenu.classList.contains('active')) {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
      }
    }, { passive: true });

    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
      }
    });
  }

  // === HERO TAGLINE CLICK TO SCROLL TO ABOUT-ME ===
  const heroTaglines = document.querySelectorAll('.hero-tagline-3d');
  heroTaglines.forEach(tagline => {
    tagline.addEventListener('click', () => {
      const aboutMeSection = document.getElementById('about-me');
      if (aboutMeSection) {
        aboutMeSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // === DIAGRAM / BRANDBOOK CAROUSEL ===
  const track = document.getElementById('carouselTrack');
  const prevBtn = document.getElementById('prevSlide');
  const nextBtn = document.getElementById('nextSlide');

  if (track && prevBtn && nextBtn) {
    const slides = Array.from(track.children);
    let currentIndex = 0;

    function updateCarousel() {
      if (!slides.length) return;
      
      slides.forEach((slide, index) => {
        slide.classList.remove('active-center', 'active-side');
        if (index === currentIndex) {
          slide.classList.add('active-center');
        } else if (index === currentIndex - 1 || index === currentIndex + 1) {
          slide.classList.add('active-side');
        }
      });

      const activeSlide = slides[currentIndex];
      const slideCenter = activeSlide.offsetLeft + activeSlide.offsetWidth / 2;
      const viewportWidth = track.parentElement.offsetWidth;
      const targetTranslate = viewportWidth / 2 - slideCenter;

      track.style.transform = `translateX(${targetTranslate}px)`;
    }

    nextBtn.addEventListener('click', () => {
      if (currentIndex < slides.length - 1) {
        currentIndex++;
        updateCarousel();
      }
    });

    prevBtn.addEventListener('click', () => {
      if (currentIndex > 0) {
        currentIndex--;
        updateCarousel();
      }
    });

    slides.forEach((slide, idx) => {
      slide.addEventListener('click', () => {
        if (idx !== currentIndex) {
          currentIndex = idx;
          updateCarousel();
        }
      });
    });

    window.addEventListener('resize', updateCarousel);
    updateCarousel();
  }

  // === MODAL OVERLAY ===
  const modalOverlay = document.getElementById('modalOverlay');
  const modalCancel = document.getElementById('modalCancel');
  const modalConfirm = document.getElementById('modalConfirm');
  const modalTriggers = document.querySelectorAll('.js-modal-trigger');

  if (modalOverlay) {
    modalTriggers.forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const targetUrl = trigger.getAttribute('href');
        if (modalConfirm) modalConfirm.setAttribute('href', targetUrl);
        modalOverlay.classList.add('active');
      });
    });

    if (modalCancel) {
      modalCancel.addEventListener('click', () => {
        modalOverlay.classList.remove('active');
      });
    }

    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        modalOverlay.classList.remove('active');
      }
    });
  }

  // === MOBILE SCROLL TRIGGER FOR TOOLTIPS (10% - 90% VIEWPORT ZONE) ===
  function checkMobileToolsScroll() {
    if (window.innerWidth > 992) {
      document.querySelectorAll('.tool-card-item').forEach(item => {
        item.classList.remove('mobile-active');
      });
      return;
    }

    const viewportHeight = window.innerHeight;
    const topZone = viewportHeight * 0.10;
    const bottomZone = viewportHeight * 0.90;

    const toolItems = document.querySelectorAll('.tool-card-item');
    toolItems.forEach(item => {
      const rect = item.getBoundingClientRect();
      const itemMid = rect.top + rect.height / 2;

      if (itemMid >= topZone && itemMid <= bottomZone) {
        item.classList.add('mobile-active');
      } else {
        item.classList.remove('mobile-active');
      }
    });
  }

  window.addEventListener('scroll', checkMobileToolsScroll, { passive: true });
  window.addEventListener('resize', checkMobileToolsScroll, { passive: true });
  checkMobileToolsScroll();

  // === HERO & TOOLS 3D ROTATION PARALLAX ===
  const heroUiLayer = document.getElementById('heroUiLayer');
  const toolFloatIcons = document.querySelectorAll('.tool-float-icon');

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;

  let targetRotX = 0;
  let targetRotY = 0;
  let currentRotX = 0;
  let currentRotY = 0;
  let gyroActive = false;

  // Slow smooth transition multiplier for Hero elements rotation (12 -> 32)
  let currentHeroMultiplier = 12;

  function handleOrientation(e) {
    if (e.beta === null || e.gamma === null) return;

    const beta = Math.min(Math.max(e.beta, -45), 45);
    const gamma = Math.min(Math.max(e.gamma, -45), 45);

    targetRotX = -(beta / 45) * 8;
    targetRotY = (gamma / 45) * 8;
    gyroActive = true;
  }

  function initGyroscope() {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then(permissionState => {
          if (permissionState === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation, true);
          }
        })
        .catch(console.error);
    } else if ('DeviceOrientationEvent' in window) {
      window.addEventListener('deviceorientation', handleOrientation, true);
    }
  }

  document.body.addEventListener('touchstart', initGyroscope, { once: true });

  function updateParallax() {
    const isDesktopOrTablet = window.innerWidth > 768;
    const scrollY = window.scrollY;

    let isTaglineHovered = false;
    heroTaglines.forEach(tagline => {
      if (tagline.matches(':hover')) {
        isTaglineHovered = true;
      }
    });

    const targetHeroMultiplier = isTaglineHovered ? 32 : 12;
    currentHeroMultiplier += (targetHeroMultiplier - currentHeroMultiplier) * 0.02;

    if (isDesktopOrTablet) {
      // 1. Hero Floating PNG Elements Parallax
      if (heroUiLayer) {
        const desktopElements = document.querySelectorAll('.ui-d');
        const scrollOffset = -(scrollY * 0.2);

        desktopElements.forEach((el, index) => {
          if (isTaglineHovered) {
            el.classList.add('tagline-active');
          } else {
            el.classList.remove('tagline-active');
          }

          const rect = el.getBoundingClientRect();
          const elCenterX = rect.left + rect.width / 2;
          const elCenterY = rect.top + rect.height / 2;

          const deltaX = mouseX - elCenterX;
          const deltaY = mouseY - elCenterY;

          const depthMultiplier = 1 + (index * 0.15);
          
          const rotY = (deltaX / window.innerWidth) * currentHeroMultiplier * depthMultiplier;
          const rotX = -(deltaY / window.innerHeight) * currentHeroMultiplier * depthMultiplier;
          
          el.style.transform = `rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translateZ(${depthMultiplier * 10}px) translateY(${scrollOffset}px)`;
        });
      }

      // 2. Tools I Use Icons: High-Response Rotation & Lerped 120% Zoom
      toolFloatIcons.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const elCenterX = rect.left + rect.width / 2;
        const elCenterY = rect.top + rect.height / 2;

        const deltaX = mouseX - elCenterX;
        const deltaY = mouseY - elCenterY;

        const maxDist = 300;
        const clampedX = Math.min(Math.max(deltaX, -maxDist), maxDist);
        const clampedY = Math.min(Math.max(deltaY, -maxDist), maxDist);

        const rotY = (clampedX / maxDist) * 12;
        const rotX = -(clampedY / maxDist) * 12;

        if (!el._currentScale) el._currentScale = 1.0;
        const isHovered = el.closest('.tool-card-item').matches(':hover');
        const targetScale = isHovered ? 1.2 : 1.0;
        
        el._currentScale += (targetScale - el._currentScale) * 0.05;

        el.style.transform = `rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale(${el._currentScale.toFixed(3)}) translateZ(12px)`;
      });
    } else {
      // Mobile Parallax & Tagline Hover Opacity Sync
      if (heroUiLayer) {
        const mobileElements = document.querySelectorAll('.ui-m');
        const mobileScrollOffset = -(scrollY * 0.2);

        currentRotX += (targetRotX - currentRotX) * 0.08;
        currentRotY += (targetRotY - currentRotY) * 0.08;

        mobileElements.forEach((el, index) => {
          if (isTaglineHovered) {
            el.classList.add('tagline-active');
          } else {
            el.classList.remove('tagline-active');
          }

          const depthMultiplier = 1 + (index * 0.1);
          if (gyroActive) {
            el.style.transform = `translateY(${mobileScrollOffset}px) rotateX(${currentRotX * depthMultiplier}deg) rotateY(${currentRotY * depthMultiplier}deg)`;
          } else {
            el.style.transform = `translateY(${mobileScrollOffset}px)`;
          }
        });
      }
    }

    requestAnimationFrame(updateParallax);
  }

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // === FIREFLY TRACKING (Viewport Percentage Logic) ===
    const vpX = (mouseX / window.innerWidth) * 100;
    const vpY = (mouseY / window.innerHeight) * 100;
    document.documentElement.style.setProperty('--vp-x', `${vpX}%`);
    document.documentElement.style.setProperty('--vp-y', `${vpY}%`);
  });

  requestAnimationFrame(updateParallax);
});
