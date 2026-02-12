// ===========================
// Page Fade System (Clean)
// ===========================

// ===========================
// Page Fade System (Robust)
// ===========================

// Fade IN (normal load)
window.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('page-loaded');
});

// Fade IN (bfcache restore - Chrome back button fix)
window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    document.body.classList.add('page-loaded');
  }
});

// Fade OUT on internal navigation
document.addEventListener('click', function (e) {
  const link = e.target.closest('a');
  if (!link) return;

  const isInternal = link.hostname === window.location.hostname;
  const isHash = link.getAttribute('href')?.startsWith('#');
  const isDownload = link.hasAttribute('download');
  const isTargetBlank = link.target === '_blank';

  if (isInternal && !isHash && !isDownload && !isTargetBlank) {
    e.preventDefault();

    document.body.classList.remove('page-loaded');

    setTimeout(() => {
      window.location.href = link.href;
    }, 400);
  }
});

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
  const grid = document.getElementById('portfolioGrid');
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightboxImage');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const closeBtn = document.querySelector('.lightbox-close');
  const nextBtn = document.querySelector('.lightbox-arrow.right');
  const prevBtn = document.querySelector('.lightbox-arrow.left');

  if (!grid || !lightbox) return;

  let portfolioImages = [];
  let currentIndex = 0;

  function updateLightbox() {
    const item = portfolioImages[currentIndex];
    lightboxImage.src = `portfolio-gallery/${item.src}`;
    lightboxCaption.textContent = item.caption || '';
  }

  function openLightbox(index) {
    currentIndex = index;
    updateLightbox();
    lightbox.classList.add('show');
    document.body.classList.add('lightbox-open');
  }

  function closeLightbox() {
    lightbox.classList.remove('show');
    document.body.classList.remove('lightbox-open');
  }

  function showNext() {
    currentIndex = (currentIndex + 1) % portfolioImages.length;
    updateLightbox();
  }

  function showPrev() {
    currentIndex =
      (currentIndex - 1 + portfolioImages.length) % portfolioImages.length;
    updateLightbox();
  }

  // Load portfolio images
  fetch('data/portfolio.json')
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