// window.onerror = function(message, source, lineno, colno) {
//   alert(
//     "JS Error:\n" +
//     message +
//     "\nLine: " +
//     lineno +
//     "\nColumn: " +
//     colno
//   );
// };

window.onerror = function(message, source, lineno, colno) {
  alert(
    "JS ERROR\n\n" +
    message +
    "\n\nLine: " +
    lineno +
    "\nColumn: " +
    colno
  );

  return false;
};

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
// ---------------------------
// Portfolio gallery + lightbox
// ---------------------------
document.addEventListener('DOMContentLoaded', () => {

  const playBtn = document.querySelector('.lightbox-play');
  const speedSelect = document.querySelector('.lightbox-speed');
  const music = document.getElementById('slideshowMusic');
  const muteBtn = document.querySelector('.lightbox-mute');
  const grid = document.getElementById('portfolioGrid');
  const lightbox = document.getElementById('lightbox');

  if (!grid || !lightbox) return;

  const lightboxImage = document.getElementById('lightboxImage');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const closeBtn = document.querySelector('.lightbox-close');
  const nextBtn = document.querySelector('.lightbox-arrow.right');
  const prevBtn = document.querySelector('.lightbox-arrow.left');
  const timerBar = document.querySelector('.lightbox-timer-bar');

  let isPlaying = false;
  let isMuted = false;
  let slideshowSpeed = parseInt(speedSelect?.value) || 5000;
  let fadeInterval = null;
  let timerFallback = null;

  let portfolioImages = [];
  let currentIndex = 0;

  const downloadAllBtn = document.getElementById('downloadAllBtn');
  const startBtn = document.getElementById('startSlideshowBtn');

  const zipFile = grid.dataset.zip || null;

  // ---------------------------
  // Image load handling
  // ---------------------------

  lightboxImage?.addEventListener('load', async () => {

    if (lightboxImage.decode) {
      try {
        await lightboxImage.decode();
      } catch (e) {
        // Ignore decode errors
      }
    }

    lightboxImage.classList.remove('fade-out');

    if (isPlaying) {
      startTimerAnimation();
    }
  });

  // ---------------------------
  // Music
  // ---------------------------

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

    const randomIndex =
      Math.floor(Math.random() * musicTracks.length);

    music.src = musicTracks[randomIndex];
    music.load();
  }

  function fadeInAudio(duration = 1500) {
    if (!music) return;

    clearInterval(fadeInterval);

    music.volume = 0.01;

    const playPromise = music.play();

    if (playPromise !== undefined) {

      playPromise.then(() => {

        const targetVolume = 0.6;
        const step = 0.02;
        const intervalTime =
          duration / (targetVolume / step);

        fadeInterval = setInterval(() => {

          if (music.volume < targetVolume) {

            music.volume =
              Math.min(
                music.volume + step,
                targetVolume
              );

          } else {

            clearInterval(fadeInterval);

          }

        }, intervalTime);

      }).catch(error => {

        console.log("Audio blocked:", error);

      });

    }
  }

  function fadeOutAudio(duration = 2200, onComplete) {

    if (!music || music.paused) {

      if (onComplete) onComplete();

      return;
    }

    clearInterval(fadeInterval);

    const startVolume = music.volume;
    const start = performance.now();

    function fade(now) {

      const progress =
        Math.min((now - start) / duration, 1);

      music.volume =
        startVolume * (1 - progress);

      if (progress < 1) {

        requestAnimationFrame(fade);

      } else {

        music.pause();
        music.volume = 0.6;
      
        if (onComplete) {
          setTimeout(onComplete, 50);
        }
      
      }
    }

    requestAnimationFrame(fade);
  }

  function hardStopAudio() {

    if (!music) return;
  
    clearInterval(fadeInterval);
  
    music.pause();
    music.volume = 0.6;
  }

  // ---------------------------
  // Counter
  // ---------------------------

  function updateCounter() {

    const counter =
      document.getElementById("lightboxCounter");

    if (counter) {

      counter.textContent =
        `${currentIndex + 1} / ${portfolioImages.length}`;

    }
  }

  // ---------------------------
  // Update lightbox
  // ---------------------------

  function updateLightbox() {

    if (!portfolioImages.length) {

      console.warn("No portfolio images loaded yet");
      return;

    }

    if (
      currentIndex < 0 ||
      currentIndex >= portfolioImages.length
    ) {

      currentIndex = 0;

    }

    const item = portfolioImages[currentIndex];

    const downloadBtn =
      document.querySelector('.lightbox-download');

    if (downloadBtn) {

      downloadBtn.style.display =
        (item.approved && item.full)
          ? 'flex'
          : 'none';

    }

    clearTimeout(timerFallback);

    if (timerBar) {
      timerBar.style.animation = 'none';
    }

    lightboxImage.classList.add('fade-out');

    setTimeout(() => {

      lightboxImage.src =
        resolveImagePath(item.src);

      lightboxCaption.style.opacity = 0;

      setTimeout(() => {

        lightboxCaption.textContent =
          item.caption || '';

        lightboxCaption.style.opacity = 0.9;

      }, 150);

    }, 300);

    updateCounter();
  }

  // ---------------------------
  // Open / close lightbox
  // ---------------------------

  function openLightbox(index) {

    currentIndex = index;

    updateLightbox();

    lightbox.classList.add('show');
    document.body.classList.add('lightbox-open');

    updateCounter();
  }

  function closeLightbox() {

    const wasPlaying = isPlaying;

    stopSlideshow();

    if (wasPlaying) {

      setTimeout(() => {

        hardStopAudio();

        lightbox.classList.remove('show');
        document.body.classList.remove('lightbox-open');

        resetStartButton();

      }, 1500);

    } else {

      hardStopAudio();

      lightbox.classList.remove('show');
      document.body.classList.remove('lightbox-open');

      resetStartButton();

    }
  }

  // ---------------------------
  // Next / previous
  // ---------------------------

  function showNext(fromSlideshow = false) {

    if (!portfolioImages.length) return;

    if (
      isPlaying &&
      currentIndex >= portfolioImages.length - 1
    ) {

      finishSlideshow();
      return;

    }

    currentIndex++;

    if (currentIndex >= portfolioImages.length) {

      currentIndex =
        portfolioImages.length - 1;

      if (isPlaying) {
        finishSlideshow();
      }

      return;
    }

    // Preload next two images
    for (let i = 1; i <= 2; i++) {

      const preloadIndex =
        currentIndex + i;

      if (preloadIndex < portfolioImages.length) {

        const preloadItem =
          portfolioImages[preloadIndex];

        const preload = new Image();

        preload.src =
          resolveImagePath(preloadItem.src);

      }
    }

    updateLightbox();

    if (!fromSlideshow && isPlaying) {
      stopSlideshow();
    }
  }

  function showPrev() {

    if (!portfolioImages.length) return;

    currentIndex =
      (currentIndex - 1 + portfolioImages.length) %
      portfolioImages.length;

    updateLightbox();

    if (isPlaying) {
      stopSlideshow();
    }
  }

  // ---------------------------
  // Slideshow
  // ---------------------------

  function resetStartButton() {

    if (!startBtn) return;

    startBtn.disabled = false;
    startBtn.textContent = "▶ Start Slideshow";
  }

  function startTimerAnimation() {

    if (!timerBar || !isPlaying) return;

    clearTimeout(timerFallback);

    timerBar.style.animation = 'none';

    // Force browser reflow
    void timerBar.offsetWidth;

    timerBar.style.animation =
      `slideTimer ${slideshowSpeed}ms linear forwards`;

    timerBar.style.animationPlayState = 'running';

    timerFallback = setTimeout(() => {

      if (isPlaying) {
        showNext(true);
      }

    }, slideshowSpeed + 50);
  }

  function startSlideshow() {

    if (isPlaying) return;

    if (startBtn) {

      startBtn.textContent =
        "⏸ Slideshow Playing";

      startBtn.disabled = true;

    }

    isPlaying = true;

    if (playBtn) {

      playBtn.textContent = '⏸';

      playBtn.setAttribute(
        'aria-label',
        'Pause slideshow'
      );

    }

    lightbox.classList.add('slideshow-active');

    showControls();

    loadRandomTrack();
    fadeInAudio();

    updateLightbox();
  }

  function stopSlideshow(skipAudioFade = false) {

    if (!isPlaying) return;

    isPlaying = false;

    clearTimeout(timerFallback);

    if (timerBar) {
      timerBar.style.animation = 'none';
    }

    lightbox.classList.remove('slideshow-active');

    if (playBtn) {

      playBtn.textContent = '▶';

      playBtn.setAttribute(
        'aria-label',
        'Start slideshow'
      );

    }

    if (
      !skipAudioFade &&
      music &&
      !music.paused
    ) {

      fadeOutAudio();

    }

    resetStartButton();
  }

  function finishSlideshow() {

    isPlaying = false;

    clearTimeout(timerFallback);

    if (timerBar) {
      timerBar.style.animation = 'none';
    }

    lightbox.classList.remove('slideshow-active');

    if (playBtn) {

      playBtn.textContent = '▶';

      playBtn.setAttribute(
        'aria-label',
        'Start slideshow'
      );

    }

    fadeOutAudio(2200);

    setTimeout(() => {

      hardStopAudio();

      lightbox.classList.remove('show');

      document.body.classList.remove('lightbox-open');

      resetStartButton();

    }, 2250);
  }

  // ---------------------------
  // Buttons
  // ---------------------------

  playBtn?.addEventListener('click', e => {

    e.stopPropagation();

    if (isPlaying) {
      stopSlideshow();
    } else {
      startSlideshow();
    }

  });

  startBtn?.addEventListener('click', () => {

    if (!portfolioImages.length) {

      console.warn(
        "Portfolio still loading"
      );

      return;
    }

    openLightbox(0);

  });

  speedSelect?.addEventListener('change', e => {

    slideshowSpeed =
      parseInt(e.target.value);

    if (isPlaying) {
      updateLightbox();
    }

    e.target.blur();
  });

  muteBtn?.addEventListener('click', e => {

    e.stopPropagation();

    if (!music) return;

    isMuted = !isMuted;

    music.muted = isMuted;

    muteBtn.textContent =
      isMuted ? '🔇' : '🔊';

    muteBtn.setAttribute(
      'aria-label',
      isMuted
        ? 'Unmute music'
        : 'Mute music'
    );
  });

  // ---------------------------
  // Timer animation
  // ---------------------------

  timerBar?.addEventListener(
    'animationend',
    () => {

      if (!isPlaying) return;

      clearTimeout(timerFallback);

      showNext(true);

    }
  );

  // ---------------------------
  // Navigation controls
  // ---------------------------

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

    if (e.target === lightbox) {
      closeLightbox();
    }

  });

  // ---------------------------
  // Keyboard navigation
  // ---------------------------

  document.addEventListener('keydown', e => {

    if (!lightbox.classList.contains('show')) {
      return;
    }

    if (e.key === 'Escape') {
      closeLightbox();
    }

    if (e.key === 'ArrowRight') {
      showNext();
    }

    if (e.key === 'ArrowLeft') {
      showPrev();
    }

    if (e.code === 'Space') {

      e.preventDefault();

      if (playBtn) {
        playBtn.click();
      }

    }

  });

  // ---------------------------
  // Touch gestures
  // ---------------------------

  let startX = 0;
  let startY = 0;

  lightbox.addEventListener('touchstart', e => {

    if (!e.touches.length) return;

    startX =
      e.touches[0].clientX;

    startY =
      e.touches[0].clientY;

  }, { passive: true });

  lightbox.addEventListener('touchend', e => {

    if (!e.changedTouches.length) return;

    const diffX =
      e.changedTouches[0].clientX - startX;

    const diffY =
      e.changedTouches[0].clientY - startY;

    // Swipe down = close
    if (
      Math.abs(diffY) > 80 &&
      diffY > 0
    ) {

      closeLightbox();

      return;
    }

    // Horizontal swipe
    if (
      Math.abs(diffX) > Math.abs(diffY) &&
      Math.abs(diffX) > 60
    ) {

      if (diffX < 0) {
        showNext();
      } else {
        showPrev();
      }

    }

  }, { passive: true });

  // ---------------------------
  // Download current image
  // ---------------------------

  const downloadBtn =
    document.querySelector('.lightbox-download');

  downloadBtn?.addEventListener('click', e => {

    e.stopPropagation();

    const item =
      portfolioImages[currentIndex];

    if (!item || !item.full || !item.approved) {
      return;
    }

    const link =
      document.createElement('a');

    link.href =
      resolveImagePath(item.full);

    link.download =
      item.full.split('/').pop();

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

  });

  // ---------------------------
  // Download all
  // ---------------------------

  downloadAllBtn?.addEventListener('click', () => {

    if (!zipFile) return;

    const link =
      document.createElement('a');

    link.href = zipFile;

    link.download =
      zipFile.split('/').pop();

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

  });

  // ---------------------------
  // Controls visibility
  // ---------------------------

  let controlsTimeout;

  const controls =
    document.querySelector('.lightbox-controls');

  const arrows =
    document.querySelectorAll('.lightbox-arrow');

  function showControls() {

    if (!controls) return;

    controls.classList.remove('hidden');

    arrows.forEach(arrow => {
      arrow.classList.remove('hidden');
    });

    lightbox.classList.remove(
      'cursor-hidden'
    );

    clearTimeout(controlsTimeout);

    if (isPlaying) {

      controlsTimeout =
        setTimeout(() => {

          controls.classList.add('hidden');

          arrows.forEach(arrow => {
            arrow.classList.add('hidden');
          });

          lightbox.classList.add(
            'cursor-hidden'
          );

        }, 1500);

    }

  }

  [
    'mousemove',
    'click',
    'touchstart',
    'keydown'
  ].forEach(event => {

    document.addEventListener(
      event,
      showControls
    );

  });

  // ---------------------------
  // Load portfolio data
  // ---------------------------

  const dataSource =
    grid.dataset.source ||
    'data/portfolio.json';

  fetch(dataSource)
    .then(res => {

      if (!res.ok) {
        throw new Error(
          `Failed to load ${dataSource}: ${res.status}`
        );
      }

      return res.json();

    })
    .then(data => {

      portfolioImages = data;

      const approvedImages =
        data.filter(img => img.approved);

      if (
        approvedImages.length > 0 &&
        downloadAllBtn &&
        zipFile
      ) {

        downloadAllBtn.style.display =
          'inline-block';

        downloadAllBtn.textContent =
          `Download ${approvedImages.length} Images`;

      }

      data.forEach((item, index) => {

        const card =
          document.createElement('div');

        card.className =
          'portfolio-card';

        const wrap =
          document.createElement('div');

        wrap.className =
          'image-wrap';

        const img =
          document.createElement('img');

        img.src =
          resolveImagePath(item.src);

        img.alt =
          item.caption || '';

        img.loading =
          'lazy';

        img.addEventListener('load', () => {

          if (
            img.naturalWidth >
            img.naturalHeight
          ) {

            card.classList.add(
              'landscape'
            );

          } else {

            card.classList.add(
              'portrait'
            );

          }

        });

        img.addEventListener('click', () => {

          openLightbox(index);

        });

        wrap.appendChild(img);
        card.appendChild(wrap);
        grid.appendChild(card);

      });

    })
    .catch(err => {

      console.error(
        'Portfolio load error:',
        err
      );

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