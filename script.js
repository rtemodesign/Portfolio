document.addEventListener('DOMContentLoaded', () => {
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

  // === HERO PARALLAX & 3D ROTATION (DESKTOP MOUSE + MOBILE GYROSCOPE) ===
  const heroUiLayer = document.getElementById('heroUiLayer');
  if (heroUiLayer) {
    const desktopElements = document.querySelectorAll('.ui-d');
    const mobileElements = document.querySelectorAll('.ui-m');
    
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    let targetRotX = 0;
    let targetRotY = 0;
    let currentRotX = 0;
    let currentRotY = 0;
    let gyroActive = false;

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
      
      if (isDesktopOrTablet) {
        const scrollOffset = -(scrollY * 0.2); 

        desktopElements.forEach((el, index) => {
          const rect = el.getBoundingClientRect();
          const elCenterX = rect.left + rect.width / 2;
          const elCenterY = rect.top + rect.height / 2;

          const deltaX = mouseX - elCenterX;
          const deltaY = mouseY - elCenterY;

          const depthMultiplier = 1 + (index * 0.15);
          
          const rotY = (deltaX / window.innerWidth) * 6 * depthMultiplier;
          const rotX = -(deltaY / window.innerHeight) * 6 * depthMultiplier;
          
          el.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(${depthMultiplier * 10}px) translateY(${scrollOffset}px)`;
        });
      } else {
        const mobileScrollOffset = -(scrollY * 0.2);

        currentRotX += (targetRotX - currentRotX) * 0.08;
        currentRotY += (targetRotY - currentRotY) * 0.08;

        mobileElements.forEach((el, index) => {
          const depthMultiplier = 1 + (index * 0.1);
          if (gyroActive) {
            el.style.transform = `translateY(${mobileScrollOffset}px) rotateX(${currentRotX * depthMultiplier}deg) rotateY(${currentRotY * depthMultiplier}deg)`;
          } else {
            el.style.transform = `translateY(${mobileScrollOffset}px)`;
          }
        });
      }

      requestAnimationFrame(updateParallax);
    }

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    requestAnimationFrame(updateParallax);
  }
});
