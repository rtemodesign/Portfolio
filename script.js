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
});
