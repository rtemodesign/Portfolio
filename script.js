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

  // === HERO TAGLINE CLICK TO SCROLL TO CORE FOCUS ===
  const heroTaglines = document.querySelectorAll('.hero-tagline-3d');
  heroTaglines.forEach(tagline => {
    tagline.addEventListener('click', () => {
      const coreFocusSection = document.getElementById('about-me');
      if (coreFocusSection) {
        coreFocusSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // === CORE FOCUS "TAKE & SHOW" LOGIC (DESKTOP FLIP MODAL) ===
const focusData = {
    crm: {
      title: 'Logistics CRM',
      points: [
        {
          icon: 'Media/icons/data-heavy.svg',
          title: 'Data-Heavy Interfaces:',
          desc: 'Complex tables, multi-level filters, and forms for operational dispatch.'
        },
        {
          icon: 'Media/icons/info-architecture.svg',
          title: 'Information Architecture:',
          desc: 'Clear visual hierarchy for scanning and sorting massive shipment data.'
        },
        {
          icon: 'Media/icons/workflow.svg',
          title: 'Workflow Optimization:',
          desc: 'Structuring multi-step processes to cut daily operational friction.'
        }
      ]
    },
    driverapp: {
      title: 'Driver Mobile App',
      points: [
        {
          icon: 'Media/icons/mobile.svg',
          title: 'Mobile UX/UI:',
          desc: 'Pixel-perfect screens with structured layouts and distinct component states.'
        },
        {
          icon: 'Media/icons/concept.svg',
          title: 'Concept to High-Fidelity:',
          desc: 'Taking the product from initial concept to a production-ready mobile interface.'
        },
        {
          icon: 'Media/icons/prototype.svg',
          title: 'Prototyping:',
          desc: 'Interactive prototypes built to validate user flows and conduct usability testing.'
        }
      ]
    },
    ds: {
      title: 'Design System',
      points: [
        {
          icon: 'Media/icons/comp-architecture.svg',
          title: 'Component Architecture:',
          desc: 'Scalable, multi-state UI elements ensuring visual consistency across platforms.'
        },
        {
          icon: 'Media/icons/variables.svg',
          title: 'Figma Variables & Tokens:',
          desc: 'Centralized management for colors, typography, and spacing modes.'
        },
        {
          icon: 'Media/icons/documentation.svg',
          title: 'Specs & Documentation:',
          desc: 'Clear implementation guidelines to simplify handoff and accelerate frontend delivery.'
        }
      ]
    }
  };

  const focusBackdrop = document.getElementById('focusBackdrop');
  const focusExpandedView = document.getElementById('focusExpandedView');
  const focusModalClose = document.getElementById('focusModalClose');
  const focusExpandedTitle = document.getElementById('focusExpandedTitle');
  const focusExpandedImgSlot = document.getElementById('focusExpandedImgSlot');
  const focusModalList = document.getElementById('focusModalList');
  const focusCards = document.querySelectorAll('.focus-card');

  let activeCard = null;
  let activeVisual = null;
  let activeGroup = null;
  let placeholderEl = null;
  let activeImgs = [];
  let baseEndRects = [];
  let isExpanded = false;

  // Purposeful scroll tracking
  let cumulativeScrollDelta = 0;
  let scrollResetTimer = null;
  let touchStartY = 0;

  function openFocusElement(card) {
    if (isExpanded) return;
    const focusKey = card.getAttribute('data-focus');
    const data = focusData[focusKey];
    const visual = card.querySelector('.focus-card-visual');
    const group = card.querySelector('.focus-group');
    if (!data || !visual || !group) return;

    isExpanded = true;
    activeCard = card;
    activeVisual = visual;
    activeGroup = group;
    activeImgs = Array.from(group.querySelectorAll('.focus-anim-img'));
    cumulativeScrollDelta = 0;

    // 1. Reset active transforms
    activeGroup.style.transition = 'none';
    activeGroup.style.transform = 'none';

    activeImgs.forEach(img => {
      img.style.transition = 'none';
      img.style.transform = 'none';
    });

    // 2. Measure starting positions of all images
    const startRects = activeImgs.map(img => img.getBoundingClientRect());

    // 3. Create cloned placeholder to lock unopened card geometry
    placeholderEl = group.cloneNode(true);
    placeholderEl.className += ' focus-placeholder-clone';
    visual.appendChild(placeholderEl);

// 4. Update modal title & icon-based points
    focusExpandedTitle.textContent = data.title;
    focusModalList.innerHTML = data.points.map(pt => `
      <li class="focus-point-item">
        <img src="${pt.icon}" alt="" class="focus-point-icon" />
        <div class="focus-point-text">
          <span class="focus-point-title">${pt.title}</span>
          <span class="focus-point-desc">${pt.desc}</span>
        </div>
      </li>
    `).join('');
    focusExpandedImgSlot.setAttribute('data-opened', focusKey);

    // 5. Reparent group to opened stage
    focusExpandedImgSlot.appendChild(group);

    // 6. Measure destination rects in opened stage
    baseEndRects = activeImgs.map(img => {
      img.style.transition = 'none';
      img.style.transform = 'none';
      return img.getBoundingClientRect();
    });

    // 7. Invert: translate each image to match unopened start position exactly
    activeImgs.forEach((img, i) => {
      const start = startRects[i];
      const end = baseEndRects[i];
      const deltaX = (start.left + start.width / 2) - (end.left + end.width / 2);
      const deltaY = (start.top + start.height / 2) - (end.top + end.height / 2);
      const scale = start.width / (end.width || 1);

      img.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0) scale(${scale})`;
      img.style.opacity = '1';
    });

    // Force reflow
    group.offsetHeight;

    // 8. Activate backdrop & view
    focusBackdrop.classList.add('active');
    focusExpandedView.classList.remove('is-closing');
    focusExpandedView.classList.add('active');
    focusExpandedView.setAttribute('aria-hidden', 'false');

    // 9. Animate all images smoothly to opened positions
    activeImgs.forEach(img => {
      img.style.transition = 'transform 1.3s cubic-bezier(0.16, 1, 0.3, 1)';
      img.style.transform = 'translate3d(0, 0, 0) scale(1)';
    });
  }

  function closeFocusElement() {
    if (!isExpanded || !activeGroup || !placeholderEl || !activeVisual) return;

    // 1. Measure current placeholder images positions
    const placeholderImgs = Array.from(placeholderEl.querySelectorAll('.focus-anim-img'));
    const targetRects = placeholderImgs.map(img => img.getBoundingClientRect());

    // 2. Animate all images back to unopened card positions
    activeImgs.forEach((img, i) => {
      const target = targetRects[i];
      const base = baseEndRects[i];
      const deltaX = (target.left + target.width / 2) - (base.left + base.width / 2);
      const deltaY = (target.top + target.height / 2) - (base.top + base.height / 2);
      const scale = target.width / (base.width || 1);

      img.style.transition = 'transform 0.12s cubic-bezier(0.2, 0, 0.2, 1)';
      img.style.opacity = '1';
      img.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0) scale(${scale})`;
    });

    // 3. Fade out backdrop & UI controls
    focusBackdrop.classList.remove('active');
    focusExpandedView.classList.add('is-closing');
    focusExpandedView.classList.remove('active');
    focusExpandedView.setAttribute('aria-hidden', 'true');

    // 4. Return elements back to card visual
    setTimeout(() => {
      if (placeholderEl && placeholderEl.parentNode) {
        placeholderEl.parentNode.removeChild(placeholderEl);
        placeholderEl = null;
      }
      activeVisual.appendChild(activeGroup);
      activeImgs.forEach(img => {
        img.style.transition = 'none';
        img.style.transform = '';
        img.style.opacity = '1';
      });

      activeGroup.style.transition = 'none';
      activeGroup.style.transform = 'none';
      activeGroup._currentScale = 1.0;
      activeGroup._currentRotX = 0;
      activeGroup._currentRotY = 0;

      focusExpandedImgSlot.removeAttribute('data-opened');
      focusExpandedView.classList.remove('is-closing');

      activeCard = null;
      activeVisual = null;
      activeGroup = null;
      activeImgs = [];
      baseEndRects = [];
      isExpanded = false;
      cumulativeScrollDelta = 0;
    }, 130);
  }

  // === CORE FOCUS CLICK HANDLER (DESKTOP ONLY) ===
  focusCards.forEach(card => {
    card.addEventListener('click', () => {
      // Bypasses modal interaction on mobile viewports
      if (window.innerWidth <= 992) return;
      openFocusElement(card);
    });
  });

  // Safeguard: Close modal if resized to mobile while open
  window.addEventListener('resize', () => {
    if (window.innerWidth <= 992 && isExpanded) {
      closeFocusElement();
    }
  });

  if (focusModalClose) {
    focusModalClose.addEventListener('click', (e) => {
      e.stopPropagation();
      closeFocusElement();
    });
  }

  // Close when clicking in background around item
  if (focusExpandedView) {
    focusExpandedView.addEventListener('click', (e) => {
      if (e.target.closest('#focusModalLiquidFrame')) return;
      closeFocusElement();
    });
  }

  if (focusBackdrop) {
    focusBackdrop.addEventListener('click', closeFocusElement);
  }

  // Close when user continues to scroll purposefully on desktop
  window.addEventListener('wheel', (e) => {
    if (!isExpanded) return;
    if (e.target.closest('#focusModalLiquidFrame')) return;

    cumulativeScrollDelta += Math.abs(e.deltaY);
    clearTimeout(scrollResetTimer);
    scrollResetTimer = setTimeout(() => {
      cumulativeScrollDelta = 0;
    }, 400);

    if (cumulativeScrollDelta > 80) {
      cumulativeScrollDelta = 0;
      closeFocusElement();
    }
  }, { passive: true });

  window.addEventListener('touchstart', (e) => {
    if (!isExpanded) return;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (!isExpanded) return;
    if (e.target.closest('#focusModalLiquidFrame')) return;

    const currentY = e.touches[0].clientY;
    const diff = Math.abs(currentY - touchStartY);

    if (diff > 100) {
      closeFocusElement();
    }
  }, { passive: true });

  window.addEventListener('scroll', () => {
    if (isExpanded) {
      closeFocusElement();
    }
  }, { passive: true });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isExpanded) {
      closeFocusElement();
    }
  });

  // === MOBILE ACCORDION FOR TOOLS I USE ===
  const toolCardItems = document.querySelectorAll('.tool-card-item');
  toolCardItems.forEach(item => {
    item.addEventListener('click', () => {
      if (window.innerWidth <= 992) {
        item.classList.toggle('expanded');
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

  // === HERO & TOOLS & CORE FOCUS 3D ROTATION PARALLAX ===
  const heroUiLayer = document.getElementById('heroUiLayer');
  const toolFloatIcons = document.querySelectorAll('.tool-float-icon');
  const focusGroups = document.querySelectorAll('.focus-group');

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;

  let targetRotX = 0;
  let targetRotY = 0;
  let currentRotX = 0;
  let currentRotY = 0;
  let gyroActive = false;

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

      // Core focus groups parallax (desktop only)
      focusGroups.forEach((el) => {
        if (isExpanded && el === activeGroup) return;

        const card = el.closest('.focus-card');
        const isHovered = card && card.matches(':hover');

        if (!el._currentScale) el._currentScale = 1.0;
        if (!el._currentRotX) el._currentRotX = 0;
        if (!el._currentRotY) el._currentRotY = 0;

        let targetTiltX = 0;
        let targetTiltY = 0;
        const targetScale = isHovered ? 1.03 : 1.0;

        if (!isHovered) {
          const rect = el.getBoundingClientRect();
          const elCenterX = rect.left + rect.width / 2;
          const elCenterY = rect.top + rect.height / 2;

          const deltaX = mouseX - elCenterX;
          const deltaY = mouseY - elCenterY;

          const maxDist = 450;
          const clampedX = Math.min(Math.max(deltaX, -maxDist), maxDist);
          const clampedY = Math.min(Math.max(deltaY, -maxDist), maxDist);

          targetTiltY = (clampedX / maxDist) * 8;
          targetTiltX = -(clampedY / maxDist) * 8;
        }

        el._currentScale += (targetScale - el._currentScale) * 0.08;
        el._currentRotX += (targetTiltX - el._currentRotX) * 0.08;
        el._currentRotY += (targetTiltY - el._currentRotY) * 0.08;

        el.style.transform = `rotateX(${el._currentRotX.toFixed(2)}deg) rotateY(${el._currentRotY.toFixed(2)}deg) scale(${el._currentScale.toFixed(3)})`;
      });

    } else {
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

    const vpX = (mouseX / window.innerWidth) * 100;
    const vpY = (mouseY / window.innerHeight) * 100;
    document.documentElement.style.setProperty('--vp-x', `${vpX}%`);
    document.documentElement.style.setProperty('--vp-y', `${vpY}%`);
  });

  requestAnimationFrame(updateParallax);
});
