// ---------------------------
// Mobile navigation toggle
// ---------------------------
function myFunction() {
  const nav = document.getElementById("myTopnav");
  if (nav.className === "topnav") {
    nav.className += " responsive";
  } else {
    nav.className = "topnav";
  }
}

// ---------------------------
// Homepage scroll gallery
// ---------------------------
const gallery = document.getElementById('gallery');

if (gallery) {
  const leftBtn = document.getElementById('leftBtn');
  const rightBtn = document.getElementById('rightBtn');
  const images = Array.from(gallery.querySelectorAll('img'));

  let currentIndex = 0;
  let scrollTimeout;

  if (images.length > 0) images[0].classList.add('is-active');

  function updateCurrentIndex() {
    const galleryCenter = gallery.scrollLeft + gallery.clientWidth / 2;

    let closestIndex = 0;
    let closestDistance = Infinity;

    images.forEach((img, index) => {
      const imgCenter = img.offsetLeft + img.clientWidth / 2;
      const distance = Math.abs(galleryCenter - imgCenter);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    currentIndex = closestIndex;

    images.forEach(img => img.classList.remove('is-active'));
    images[currentIndex].classList.add('is-active');

    if (leftBtn && rightBtn) {
      leftBtn.classList.toggle('disabled', currentIndex === 0);
      rightBtn.classList.toggle('disabled', currentIndex === images.length - 1);
    }
  }

  function scrollToImage(index) {
    images[index].scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest'
    });
  }

  if (leftBtn) {
    leftBtn.addEventListener('click', () => {
      const prevIndex =
        (currentIndex - 1 + images.length) % images.length;
      scrollToImage(prevIndex);
    });
  }
  
  if (rightBtn) {
    rightBtn.addEventListener('click', () => {
      const nextIndex =
        (currentIndex + 1) % images.length;
      scrollToImage(nextIndex);
    });
  }

  gallery.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(updateCurrentIndex, 100);
  });

  window.addEventListener('load', updateCurrentIndex);
}

// ---------------------------
// Portfolio gallery + lightbox (FIXED & SAFE)
// ---------------------------
document.addEventListener('DOMContentLoaded', () => {
  const playBtn = document.querySelector('.lightbox-play');
let isPlaying = false;
const speedSelect = document.querySelector('.lightbox-speed');
let slideshowSpeed = 3000;
const music = document.getElementById('slideshowMusic');
let fadeInterval = null;
const muteBtn = document.querySelector('.lightbox-mute');
let isMuted = false;
  const grid = document.getElementById('portfolioGrid');
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightboxImage');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const closeBtn = document.querySelector('.lightbox-close');
  const nextBtn = document.querySelector('.lightbox-arrow.right');
  const prevBtn = document.querySelector('.lightbox-arrow.left');
  const progress = document.querySelector('.lightbox-progress');
  const timerBar = document.querySelector('.lightbox-timer-bar');

  if (!grid || !lightbox) return;

  let portfolioImages = [];
  let currentIndex = 0;

  function updateLightbox() {
    const item = portfolioImages[currentIndex];
  
    // Fade out first
    lightboxImage.classList.add('fade-out');
  
    setTimeout(() => {
      lightboxImage.src = `portfolio-gallery/${item.src}`;
      lightboxCaption.textContent = item.caption || '';
  
      if (progress) {
        progress.textContent = `${currentIndex + 1} / ${portfolioImages.length}`;
      }
  
      // Wait for image to load before fading in
      lightboxImage.onload = () => {
        lightboxImage.classList.remove('fade-out');
      };
  
    }, 200); // matches half of transition duration
  }

  function fadeInAudio(duration = 1500) {
    if (!music) return;
  
    clearInterval(fadeInterval);
  
    music.volume = 0.01; // 👈 not zero (important)
    music.currentTime = 0;
  
    const playPromise = music.play();
  
    if (playPromise !== undefined) {
      playPromise.then(() => {
  
        const targetVolume = 0.6; // softer, premium feel
        const step = 0.02;
        const intervalTime = duration / (targetVolume / step);
  
        fadeInterval = setInterval(() => {
          if (music.volume < targetVolume) {
            music.volume = Math.min(music.volume + step, targetVolume);
          } else {
            clearInterval(fadeInterval);
          }
        }, intervalTime);
  
      }).catch(error => {
        console.log("Audio blocked:", error);
      });
    }
  }
  
  function fadeOutAudio(duration = 1500) {
    if (!music) return;
  
    clearInterval(fadeInterval);
  
    const step = 0.02;
    const intervalTime = duration / (music.volume / step);
  
    fadeInterval = setInterval(() => {
      if (music.volume > 0.02) {
        music.volume = Math.max(music.volume - step, 0);
      } else {
        clearInterval(fadeInterval);
        music.pause();
      }
    }, intervalTime);
  }

  muteBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
  
    isMuted = !isMuted;
    music.muted = isMuted;
  
    muteBtn.textContent = isMuted ? '🔇' : '🔊';
    muteBtn.setAttribute(
      'aria-label',
      isMuted ? 'Unmute music' : 'Mute music'
    );
  });

  function openLightbox(index) {
    currentIndex = index;
    updateLightbox();
    lightbox.classList.add('show');
    document.body.classList.add('lightbox-open');
    const counter = document.getElementById("lightboxCounter");

if (counter && portfolioImages.length > 0) {
  counter.textContent = `1 / ${portfolioImages.length}`;
}
  }

  function closeLightbox() {
    const wasPlaying = isPlaying;
  
    stopSlideshow();
  
    if (wasPlaying) {
      // Wait for fade before closing
      setTimeout(() => {
        hardStopAudio();
        lightbox.classList.remove('show');
        document.body.classList.remove('lightbox-open');
      }, 1500); // matches fadeOutAudio duration
    } else {
      hardStopAudio();
      lightbox.classList.remove('show');
      document.body.classList.remove('lightbox-open');
    }
  }

  function showNext(fromSlideshow = false) {

    if (isPlaying && currentIndex === portfolioImages.length - 1) {
      stopSlideshow();
    
      // Give music time to fade out before closing
      setTimeout(() => {
        closeLightbox();
      }, 1200);
    
      return;
    }
  
    currentIndex++;
  
    if (currentIndex >= portfolioImages.length) {
      currentIndex = portfolioImages.length - 1;
    }
  
    updateLightbox();
  
    if (!fromSlideshow && isPlaying) {
      stopSlideshow();
    }
  }
  
  function showPrev() {
    currentIndex =
      (currentIndex - 1 + portfolioImages.length) % portfolioImages.length;
    updateLightbox();
  
    if (isPlaying) {
      stopSlideshow();
    }
  }

  function startSlideshow() {
    if (isPlaying) return;
  
    isPlaying = true;
  
    playBtn.textContent = '⏸';
    playBtn.setAttribute('aria-label', 'Pause slideshow');
  
    lightbox.classList.add('slideshow-active');
  
    fadeInAudio(); // 🎵 start music
    startTimerAnimation();
  }

  
  function stopSlideshow() {
    isPlaying = false;
  
    timerBar.style.animationPlayState = 'paused';
  
    lightbox.classList.remove('slideshow-active');
  
    playBtn.textContent = '▶';
    playBtn.setAttribute('aria-label', 'Start slideshow');
  
    fadeOutAudio();
  }

  function hardStopAudio() {
    if (!music) return;
  
    clearInterval(fadeInterval);
  
    music.pause();
    music.currentTime = 0;
    music.volume = 0.6; // reset for next play
  }

  playBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    isPlaying ? stopSlideshow() : startSlideshow();
  });

  speedSelect?.addEventListener('change', (e) => {
    slideshowSpeed = parseInt(e.target.value);
  
    if (isPlaying) {
      clearInterval(slideshowInterval);
      slideshowInterval = null;
  
      timerBar.style.animation = 'none';
      timerBar.offsetHeight;
  
      startTimerAnimation();
      startSlideshow();
    }
  });

  // Load portfolio images
  const dataSource = grid.dataset.source || 'data/portfolio.json';
  fetch(dataSource)
    .then(res => res.json())
    .then(data => {
      portfolioImages = data;

      data.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'portfolio-card';
      
        // NEW: viewport wrapper
        const wrap = document.createElement('div');
        wrap.className = 'image-wrap';
      
        const img = document.createElement('img');
        img.src = `portfolio-gallery/${item.src}`;
        img.alt = item.caption || '';
        img.loading = 'lazy';
      
        img.addEventListener('load', () => {
          if (img.naturalWidth > img.naturalHeight) {
            card.classList.add('landscape');
          } else {
            card.classList.add('portrait');
          }
        });
      
        img.addEventListener('click', () => openLightbox(index));
      
        // NEW structure
        wrap.appendChild(img);
        card.appendChild(wrap);
        grid.appendChild(card);
      });
    })
    .catch(err => console.error('Portfolio load error:', err));

    function startTimerAnimation() {
      if (!timerBar) return;
    
      timerBar.style.animation = 'none';
      timerBar.offsetHeight; // force reflow
    
      timerBar.style.animation = `slideTimer ${slideshowSpeed}ms linear forwards`;
      timerBar.style.animationPlayState = 'running';
    }

    timerBar.addEventListener('animationend', () => {
      if (!isPlaying) return;
    
      showNext(true);
      startTimerAnimation();
    });



  // Controls
  closeBtn?.addEventListener('click', e => {
    e.stopPropagation();
    closeLightbox();
  });

  nextBtn?.addEventListener('click', e => {
    e.stopPropagation();
    showNext();
  });

  prevBtn?.addEventListener('click', e => {
    e.stopPropagation();
    showPrev();
  });

  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });

  // Keyboard navigation
  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('show')) return;

    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') showNext();
    if (e.key === 'ArrowLeft') showPrev();
  });

  // Touch gestures
  let startX = 0;
  let startY = 0;

  lightbox.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  });

  lightbox.addEventListener('touchend', e => {
    const diffX = e.changedTouches[0].clientX - startX;
    const diffY = e.changedTouches[0].clientY - startY;

    if (Math.abs(diffY) > 80 && diffY > 0) {
      closeLightbox();
      return;
    }

    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 60) {
      diffX < 0 ? showNext() : showPrev();
      if (isPlaying) startTimerAnimation();
    }
  });
});

/* Footer */

fetch('/includes/footer.html')
  .then(response => response.text())
  .then(data => {
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (!footerPlaceholder) return;

    footerPlaceholder.innerHTML = data;

    // Observe newly injected fade-in elements
    const newFadeElements = footerPlaceholder.querySelectorAll('.fade-in');
    newFadeElements.forEach(el => fadeObserver.observe(el));
  });

const fadeObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.2
  }
);

// ===========================
// Theme Toggle (FINAL, CLEAN)
// ===========================

document.addEventListener('DOMContentLoaded', () => {
  const root = document.documentElement;
  const toggles = document.querySelectorAll('[data-theme-toggle]');

  // 1. Load saved or system preference
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');

  root.setAttribute('data-theme', initialTheme);

  // 2. Set aria state
  toggles.forEach(btn => {
    btn.setAttribute('aria-pressed', initialTheme === 'dark');
  });

  // 3. Toggle handler
  toggles.forEach(btn => {
    btn.addEventListener('click', () => {
      const isDark = root.getAttribute('data-theme') === 'dark';
      const newTheme = isDark ? 'light' : 'dark';

      root.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);

      toggles.forEach(t =>
        t.setAttribute('aria-pressed', newTheme === 'dark')
      );
    });
  });
});

// 4. React to OS theme changes (only if user hasn't chosen)
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

mediaQuery.addEventListener('change', e => {
  if (!localStorage.getItem('theme')) {
    document.documentElement.setAttribute(
      'data-theme',
      e.matches ? 'dark' : 'light'
    );
  }
});


  const nav = document.querySelector('.nav-desktop');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  });
