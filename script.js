document.addEventListener('DOMContentLoaded', () => {
  const navbar = document.querySelector('.navbar');
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  // Modal Elements
  const modalOverlay = document.getElementById('modalOverlay');
  const modalConfirm = document.getElementById('modalConfirm');
  const modalCancel = document.getElementById('modalCancel');

  // 1. Mobile Navigation Toggle
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
      });
    });
  }

  // 2. Smooth Scrolling for Anchor Links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      
      if (targetId !== '#') {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({
            behavior: 'smooth'
          });
        }
      }
    });
  });

  // 3. Proportional Navbar Solid Grey Background Fill on Scroll
  function updateNavbarProgress() {
    if (!navbar) return;
    
    const scrollTop = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    const scrollHeight = Math.max(
      document.body.scrollHeight, document.documentElement.scrollHeight,
      document.body.offsetHeight, document.documentElement.offsetHeight,
      document.body.clientHeight, document.documentElement.clientHeight
    ) - window.innerHeight;
    
    const scrollPercent = scrollHeight > 0 ? Math.min(Math.max((scrollTop / scrollHeight) * 100, 0), 100) : 0;
    navbar.style.setProperty('--scroll-progress', `${scrollPercent}%`);
  }

  window.addEventListener('scroll', updateNavbarProgress, { passive: true });
  window.addEventListener('resize', updateNavbarProgress, { passive: true });
  window.addEventListener('load', updateNavbarProgress);
  
  document.querySelectorAll('img, video').forEach(media => {
    media.addEventListener('load', updateNavbarProgress);
    media.addEventListener('loadeddata', updateNavbarProgress);
  });

  updateNavbarProgress();

  // 4. ScrollSpy: Highlight current active section in Navbar
  if (sections.length > 0 && navLinks.length > 0) {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const activeId = entry.target.getAttribute('id');
          
          navLinks.forEach(link => {
            if (link.getAttribute('href') === `#${activeId}`) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));
  }

  // 5. External Link Confirmation Modal Handler
  document.querySelectorAll('.js-modal-trigger').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const targetUrl = trigger.getAttribute('href');
      
      if (modalOverlay && modalConfirm) {
        modalConfirm.setAttribute('href', targetUrl);
        modalOverlay.classList.add('active');
        modalOverlay.setAttribute('aria-hidden', 'false');
      }
    });
  });

  function closeModal() {
    if (modalOverlay) {
      modalOverlay.classList.remove('active');
      modalOverlay.setAttribute('aria-hidden', 'true');
    }
  }

  if (modalCancel) {
    modalCancel.addEventListener('click', closeModal);
  }

  if (modalConfirm) {
    modalConfirm.addEventListener('click', closeModal);
  }

  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        closeModal();
      }
    });
  }

  // 6. Sierra Focus Carousel System (Centered Active Slide with Scaled Side Cards)
  const carouselTrack = document.getElementById('carouselTrack');
  const prevBtn = document.getElementById('prevSlide');
  const nextBtn = document.getElementById('nextSlide');

  if (carouselTrack && prevBtn && nextBtn) {
    const slides = Array.from(carouselTrack.children);
    let currentIndex = 0; // Starts focused on the first slide

    function updateCarousel() {
      slides.forEach((slide, index) => {
        slide.classList.remove('active-center', 'active-side');
        
        if (index === currentIndex) {
          slide.classList.add('active-center'); // Focused active center slide
        } else if (index === currentIndex - 1 || index === currentIndex + 1) {
          slide.classList.add('active-side'); // Left and Right cutted side slides
        }
      });

      // Calculate track position to center the active slide relative to screen width
      const activeSlide = slides[currentIndex];
      const slideOffsetLeft = activeSlide.offsetLeft;
      const slideWidth = activeSlide.offsetWidth;
      const viewportWidth = window.innerWidth;
      
      const targetTranslateX = (viewportWidth / 2) - (slideOffsetLeft + (slideWidth / 2));
      carouselTrack.style.transform = `translateX(${targetTranslateX}px)`;
    }

    // Direct click on adjacent side slides moves them to center
    slides.forEach((slide, index) => {
      slide.addEventListener('click', () => {
        if (index !== currentIndex) {
          currentIndex = index;
          updateCarousel();
        }
      });
    });

    prevBtn.addEventListener('click', () => {
      currentIndex = currentIndex > 0 ? currentIndex - 1 : slides.length - 1;
      updateCarousel();
    });

    nextBtn.addEventListener('click', () => {
      currentIndex = currentIndex < slides.length - 1 ? currentIndex + 1 : 0;
      updateCarousel();
    });

    window.addEventListener('resize', updateCarousel, { passive: true });
    
    // Ensure accurate offset calculation after images finish loading
    window.addEventListener('load', updateCarousel);
    setTimeout(updateCarousel, 100);
  }
});