window.addEventListener('load', () => {
    const gallery = document.getElementById('gallery');
    const leftBtn = document.getElementById('leftBtn');
    const rightBtn = document.getElementById('rightBtn');
    const images = Array.from(gallery.querySelectorAll('img'));
  
    let currentIndex = 0;
    let scrollTimeout;
  
    // Set first image as active immediately
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
  
      leftBtn.classList.toggle('disabled', currentIndex === 0);
      rightBtn.classList.toggle('disabled', currentIndex === images.length - 1);
    }
  
    function scrollToImage(index) {
      images[index].scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest'
      });
    }
  
    leftBtn.addEventListener('click', () => {
      if (currentIndex > 0) scrollToImage(currentIndex - 1);
    });
  
    rightBtn.addEventListener('click', () => {
      if (currentIndex < images.length - 1) scrollToImage(currentIndex + 1);
    });
  
    gallery.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(updateCurrentIndex, 100);
    });
  
    // Wait for all images in gallery to load
    let loadedImages = 0;
    images.forEach(img => {
      if (img.complete) {
        loadedImages++;
      } else {
        img.addEventListener('load', () => {
          loadedImages++;
          if (loadedImages === images.length) {
            updateCurrentIndex();
          }
        });
      }
    });
  
    // If all images are already loaded
    if (loadedImages === images.length) {
      updateCurrentIndex();
    }
  });