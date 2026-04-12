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

function resolveImagePath(src) {
  if (src.startsWith('/')) return src; // already absolute
  return `/portfolio-gallery/${src}`;  // fallback for main portfolio
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

// ✅ Declare FIRST
let slideshowSpeed = parseInt(speedSelect?.value) || 5000;
const music = document.getElementById('slideshowMusic');
let fadeInterval = null;
const muteBtn = document.querySelector('.lightbox-mute');
let isMuted = false;
const grid = document.getElementById('portfolioGrid');
const lightbox = document.getElementById('lightbox');

// ✅ SAFETY CHECKS
if (!grid || !lightbox) return;

  const lightboxImage = document.getElementById('lightboxImage');
  lightboxImage.addEventListener('load', async () => {
    // Wait for actual decode (fixes cached images issue)
    if (lightboxImage.decode) {
      try {
        await lightboxImage.decode();
      } catch (e) {}
    }
  
    lightboxImage.classList.remove('fade-out');
  
    if (isPlaying) {
      safeStartTimer();
    }
  });
  const lightboxCaption = document.getElementById('lightboxCaption');
  const closeBtn = document.querySelector('.lightbox-close');
  const nextBtn = document.querySelector('.lightbox-arrow.right');
  const prevBtn = document.querySelector('.lightbox-arrow.left');
  const progress = document.querySelector('.lightbox-progress');
  const timerBar = document.querySelector('.lightbox-timer-bar');

  const musicTracks = [
    "/assets/music/willowandpaw-1.mp3",
    "/assets/music/willowandpaw-2.mp3",
    "/assets/music/willowandpaw-3.mp3",
    "/assets/music/willowandpaw-4.mp3",
    "/assets/music/willowandpaw-5.mp3",
    "/assets/music/willowandpaw-6.mp3",
    "/assets/music/willowandpaw-7.mp3",
    "/assets/music/willowandpaw-8.mp3"
  ];

  function loadRandomTrack() {
    if (!music) return;
  
    const randomIndex = Math.floor(Math.random() * musicTracks.length);
    const selectedTrack = musicTracks[randomIndex];
  
    music.src = selectedTrack;
    music.load();
  }

  if (!lightbox) return;

  let portfolioImages = [];
  let currentIndex = 0;
  let timerStartedForCurrentImage = false;

  const downloadAllBtn = document.getElementById('downloadAllBtn');

  downloadAllBtn?.addEventListener('click', () => {
    if (!zipFile) return;
  
    const link = document.createElement('a');
    link.href = zipFile;
    link.download = zipFile.split('/').pop();
  
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  const startBtn = document.getElementById('startSlideshowBtn');

startBtn?.addEventListener('click', () => {
  if (portfolioImages.length === 0) return;

  openLightbox(0);        // open first image
  setTimeout(() => {
    startSlideshow();     // start auto play
  }, 400);                // small delay so lightbox animates in smoothly
});

function updateLightbox() {
  const item = portfolioImages[currentIndex];

  const downloadBtn = document.querySelector('.lightbox-download');

  if (downloadBtn) {
    if (item.approved && item.full) {
      downloadBtn.style.display = 'flex';
    } else {
      downloadBtn.style.display = 'none';
    }
  }

  timerStartedForCurrentImage = false; // ✅ ADD THIS
  clearTimeout(timerFallback); // ✅ kill any previous timer
timerBar.style.animation = 'none';

  lightboxImage.classList.add('fade-out');

  setTimeout(() => {
    lightboxImage.src = resolveImagePath(item.src);

    // Caption fade update
    lightboxCaption.style.opacity = 0;
    setTimeout(() => {
      lightboxCaption.textContent = item.caption || '';
      lightboxCaption.style.opacity = 0.9;
    }, 150);

    const counter = document.getElementById("lightboxCounter");

    if (counter && portfolioImages.length > 0) {
      counter.textContent = `${currentIndex + 1} / ${portfolioImages.length}`;
    }

  }, 300);
}

  function fadeInAudio(duration = 1500) {
    if (!music) return;
  
    clearInterval(fadeInterval);
  
    music.volume = 0.01; // 👈 not zero (important)
    if (music.currentTime === 0) music.currentTime = 0;
  
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
  
  function fadeOutAudio(duration = 2200, onComplete = null) {
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
  
        if (onComplete) onComplete();   // 👈 NEW
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
      counter.textContent = `${currentIndex + 1} / ${portfolioImages.length}`;
    }
  }

  function closeLightbox() {
    const wasPlaying = isPlaying;
  
    stopSlideshow();
  
    if (wasPlaying) {
      setTimeout(() => {
        hardStopAudio();
        lightbox.classList.remove('show');
        document.body.classList.remove('lightbox-open');
        resetStartButton();   // 👈 ensure reset
      }, 1500);
    } else {
      hardStopAudio();
      lightbox.classList.remove('show');
      document.body.classList.remove('lightbox-open');
      resetStartButton();   // 👈 ensure reset
    }
  }

  function showNext(fromSlideshow = false) {

    if (isPlaying && currentIndex === portfolioImages.length - 1) {

      stopSlideshow();
    
      fadeOutAudio(2200, () => {
        setTimeout(() => {
          closeLightbox();
        }, 300); // small delay for smoother finish
      });
    
      return;
    }
  
    currentIndex++;
  
    if (currentIndex >= portfolioImages.length) {
      currentIndex = portfolioImages.length - 1;
    }
  
// Preload next two images
for (let i = 1; i <= 2; i++) {

  const preloadIndex = currentIndex + i;

  if (preloadIndex < portfolioImages.length) {

    const preloadItem = portfolioImages[preloadIndex];

    const preload = new Image();
    preload.src = resolveImagePath(preloadItem.src);

  }

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

  function resetStartButton() {
    if (!startBtn) return;
  
    startBtn.disabled = false;
    startBtn.textContent = "▶ Start Slideshow";
  }

  function startSlideshow() {
    if (isPlaying) return;
  
    if (startBtn) {
      startBtn.textContent = "⏸ Slideshow Playing";
      startBtn.disabled = true;
    }
  
    isPlaying = true;
  
    playBtn.textContent = '⏸';
    playBtn.setAttribute('aria-label', 'Pause slideshow');
  
    lightbox.classList.add('slideshow-active');
  
    showControls();
  
    loadRandomTrack();
    fadeInAudio();
  
    // ✅ KEY FIX: start timer if image is already loaded
    if (lightboxImage.complete && lightboxImage.naturalWidth !== 0) {
      safeStartTimer();
    }
  }

  
  function stopSlideshow() {
    if (!isPlaying) return;
  
    isPlaying = false;
  
    timerBar.style.animation = 'none';
  
    lightbox.classList.remove('slideshow-active');
  
    playBtn.textContent = '▶';
    playBtn.setAttribute('aria-label', 'Start slideshow');
  
    if (music && !music.paused) {
      fadeOutAudio(); // 🎵 smooth fade out
    }
  
    resetStartButton();
  }

  function hardStopAudio() {
    if (!music) return;
  
    clearInterval(fadeInterval);
  
    music.pause();
    if (music.currentTime === 0) music.currentTime = 0; // only runs when gallery fully closes
    music.volume = 0.6; // reset for next play
  }

  playBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    isPlaying ? stopSlideshow() : startSlideshow();
  });

  speedSelect?.addEventListener('change', (e) => {
    slideshowSpeed = parseInt(e.target.value);
  
    if (isPlaying) {
      // Restart current image so timing stays accurate
      updateLightbox();
    }
  
    e.target.blur();
  });

  // Load portfolio images
  const dataSource = grid.dataset.source || 'data/portfolio.json';

  let zipFile = grid.dataset.zip || null;
  
  fetch(dataSource)
    .then(res => res.json())
    .then(data => {
      portfolioImages = data;

      const approvedImages = data.filter(img => img.approved);

if (approvedImages.length > 0 && downloadAllBtn && zipFile) {
  downloadAllBtn.style.display = 'inline-block';
  downloadAllBtn.textContent = `Download ${approvedImages.length} Images`;
}

      const hasApproved = data.some(img => img.approved);


      data.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'portfolio-card';
      
        // NEW: viewport wrapper
        const wrap = document.createElement('div');
        wrap.className = 'image-wrap';
      
        const img = document.createElement('img');
        img.src = resolveImagePath(item.src);
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

    let timerFallback = null;

    function safeStartTimer() {
      if (timerStartedForCurrentImage) return;
    
      timerStartedForCurrentImage = true;
      startTimerAnimation();
    }

function startTimerAnimation() {
  if (!timerBar) return;

  // Clear any existing fallback
  clearTimeout(timerFallback);

  timerBar.style.animation = 'none';
  timerBar.offsetHeight;

  timerBar.style.animation = `slideTimer ${slideshowSpeed}ms linear forwards`;
  timerBar.style.animationPlayState = 'running';

  // ✅ Fallback for mobile (guarantees next slide runs)
  timerFallback = setTimeout(() => {
    if (isPlaying) {
      showNext(true);
    }
  }, slideshowSpeed + 50); // small buffer
}

timerBar.addEventListener('animationend', () => {
  if (!isPlaying) return;

  clearTimeout(timerFallback); // ✅ prevent duplicate trigger
  showNext(true);
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

  let controlsTimeout;
const controls = document.querySelector('.lightbox-controls');

const arrows = document.querySelectorAll('.lightbox-arrow');

function showControls() {

  controls.classList.remove('hidden');
  arrows.forEach(a => a.classList.remove('hidden'));

  lightbox.classList.remove('cursor-hidden');

  clearTimeout(controlsTimeout);

  if (isPlaying) {
    controlsTimeout = setTimeout(() => {
      controls.classList.add('hidden');
      arrows.forEach(a => a.classList.add('hidden'));

      lightbox.classList.add('cursor-hidden');

    }, 1500);
  }

}

['mousemove','click','touchstart','keydown'].forEach(event => {
  document.addEventListener(event, showControls);
});

  // Keyboard navigation
  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('show')) return;

    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') showNext();
    if (e.key === 'ArrowLeft') showPrev();
  });
  
  document.addEventListener("keydown", (e) => {

    // Only trigger when the lightbox is open
    const lightbox = document.querySelector(".lightbox");
    if (!lightbox || !lightbox.classList.contains("show")) return;
  
    // Spacebar toggles slideshow
    if (e.code === "Space") {
      e.preventDefault();
  
      const playButton = document.querySelector(".lightbox-play");
      if (playButton) {
        playButton.click();
      }
    }
  
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
    }
  });

  const downloadBtn = document.querySelector('.lightbox-download');

  downloadBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
  
    const item = portfolioImages[currentIndex];
  
    if (!item.full || !item.approved) return;
  
    const link = document.createElement('a');
    link.href = resolveImagePath(item.full);
    link.download = item.full.split('/').pop();
  
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });


});

/* Footer */

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

fetch('/includes/footer.html')
  .then(response => response.text())
  .then(data => {
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (!footerPlaceholder) return;

    footerPlaceholder.innerHTML = data;

    // Observe fade elements
    const newFadeElements = footerPlaceholder.querySelectorAll('.fade-in');
    newFadeElements.forEach(el => fadeObserver.observe(el));
    
    // ✅ Attach cookie button AFTER footer loads
    const manageBtn = document.getElementById("manageCookies");
    
    if (manageBtn) {
      manageBtn.addEventListener("click", (e) => {
        e.preventDefault(); // ✅ STOP PAGE JUMP
      
        const banner = document.getElementById("cookieBanner");
      
        if (banner) {
          banner.classList.add("show");
        }
      
        // DO NOT delete consent automatically
        // Just reopen the banner
      });
    }
  });


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

if (nav) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  });
}

// ---------------------------
// Cookie Consent System (GDPR-compliant)
// ---------------------------

// Set consent with expiry (6 months)
function setConsent(value) {
  const expiryDate = new Date();
  expiryDate.setMonth(expiryDate.getMonth() + 6);

  const consentData = {
    value,
    expires: expiryDate.getTime()
  };

  localStorage.setItem("cookieConsent", JSON.stringify(consentData));
}

// Get consent (and check expiry)
function getConsent() {
  const stored = localStorage.getItem("cookieConsent");
  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored);

    if (Date.now() > parsed.expires) {
      localStorage.removeItem("cookieConsent");
      return null;
    }

    return parsed.value;
  } catch {
    return null;
  }
}

// ---------------------------
// Google Consent Mode (DEFAULT DENY)
// ---------------------------
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}

gtag('consent', 'default', {
  analytics_storage: 'denied'
});

// ---------------------------
// Load Google Analytics ONLY after consent
// ---------------------------
function loadAnalytics() {
  if (window.gaLoaded) return;
  window.gaLoaded = true;

  const script = document.createElement("script");
  script.src = "https://www.googletagmanager.com/gtag/js?id=G-ZH5F82ETRF"; // 👈 replace with your ID
  script.async = true;
  document.head.appendChild(script);

  script.onload = () => {
    gtag('js', new Date());

    gtag('consent', 'update', {
      analytics_storage: 'granted'
    });

    gtag('config', 'G-ZH5F82ETRF'); // 👈 replace with your ID
  };
}

// ---------------------------
// Banner Logic
// ---------------------------
document.addEventListener("DOMContentLoaded", () => {
  const banner = document.getElementById("cookieBanner");
  const acceptBtn = document.getElementById("acceptCookies");
  const rejectBtn = document.getElementById("rejectCookies");

  if (!banner || !acceptBtn || !rejectBtn) return;

  const consent = getConsent();

  console.log("Cookie consent status:", consent); // 👈 DEBUG

  // 👇 FIXED LOGIC
  if (consent === "accepted") {
    banner.classList.remove("show");
    loadAnalytics();
  } 
  else if (consent === "rejected") {
    banner.classList.remove("show");
  } 
  else {
    banner.classList.add("show");
  }

  // Accept
  acceptBtn.addEventListener("click", () => {
    setConsent("accepted");
    banner.classList.remove("show");
    loadAnalytics();
  });

  // Reject
  rejectBtn.addEventListener("click", () => {
    setConsent("rejected");
    banner.classList.remove("show");
  });
});

function updateMobileNavPosition() {
  const nav = document.querySelector('.nav-mobile');
  if (!nav || !window.visualViewport) return;

  const vv = window.visualViewport;

  // Stick nav to the *actual* bottom of the visible viewport
  nav.style.bottom = `${window.innerHeight - vv.height - vv.offsetTop}px`;
}

// Run on load
updateMobileNavPosition();

// Update on viewport changes
window.visualViewport?.addEventListener('resize', updateMobileNavPosition);
window.visualViewport?.addEventListener('scroll', updateMobileNavPosition);

// Fallback
window.addEventListener('scroll', updateMobileNavPosition);
window.addEventListener('resize', updateMobileNavPosition);