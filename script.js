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

        const img = document.createElement('img');
        img.src = `portfolio-gallery/${item.src}`;
        img.alt = item.caption || '';
        img.loading = 'lazy';

        img.addEventListener('click', () => openLightbox(index));

        card.appendChild(img);
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