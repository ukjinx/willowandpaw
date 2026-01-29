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
      if (currentIndex > 0) scrollToImage(currentIndex - 1);
    });
  }

  if (rightBtn) {
    rightBtn.addEventListener('click', () => {
      if (currentIndex < images.length - 1) scrollToImage(currentIndex + 1);
    });
  }

  gallery.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(updateCurrentIndex, 100);
  });

  window.addEventListener('load', updateCurrentIndex);
}


// ---------------------------
// Portfolio gallery
// ---------------------------
document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('portfolioGrid');
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightboxImage');
  const lightboxCaption = document.getElementById('lightboxCaption');

  if (!grid) return;

  fetch('data/portfolio.json')
    .then(res => res.json())
    .then(images => {
      images.forEach(item => {
        const img = document.createElement('img');
        img.src = `portfolio-gallery/${item.src}`;
        img.alt = '';
        img.loading = 'lazy';

        img.addEventListener('click', () => {
          lightboxImage.src = img.src;
          lightboxCaption.textContent = item.caption || '';
          lightbox.classList.add('show');
        });

        grid.appendChild(img);
      });
    })
    .catch(err => console.error('Portfolio load error:', err));

  lightbox.addEventListener('click', () => {
    lightbox.classList.remove('show');
  });
});


let touchStartY = 0;
let touchEndY = 0;

lightbox.addEventListener('touchstart', e => {
  touchStartY = e.touches[0].clientY;
});

lightbox.addEventListener('touchmove', e => {
  touchEndY = e.touches[0].clientY;
});

lightbox.addEventListener('touchend', () => {
  if (touchEndY - touchStartY > 80) {
    lightbox.classList.remove('show'); // swipe down to close
  }
});