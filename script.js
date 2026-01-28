const handleOnDown = e => track.dataset.mouseDownAt = e.clientX;

const handleOnUp = () => {
    track.dataset.mouseDownAt = "0";
    track.dataset.prevPercentage = track.dataset.percentage;
}

const handleOnMove = e => {
    if (track.dataset.mouseDownAt === "0") return;

    const mouseDelta = parseFloat(track.dataset.mouseDownAt) - e.clientX,
        maxDelta = window.innerWidth / 2;

    const percentage = (mouseDelta / maxDelta) * -100,
        nextPercentageUnconstrained = parseFloat(track.dataset.prevPercentage) + percentage,
        nextPercentage = Math.max(Math.min(nextPercentageUnconstrained, 0), -100);

    track.dataset.percentage = nextPercentage;

    track.animate({
        transform: `translate(${nextPercentage}%, -50%)`
    }, { duration: 1200, fill: "forwards" });

    for (const image of track.getElementsByClassName("image")) {
        image.animate({
            objectPosition: `${100 + nextPercentage}% center`
        }, { duration: 1200, fill: "forwards" });
    }
}

/* -- Had to add extra lines for touch events -- */

window.onmousedown = e => handleOnDown(e);

window.ontouchstart = e => handleOnDown(e.touches[0]);

window.onmouseup = e => handleOnUp(e);

window.ontouchend = e => handleOnUp(e.touches[0]);

window.onmousemove = e => handleOnMove(e);

window.ontouchmove = e => handleOnMove(e.touches[0]);

/* Toggle between adding and removing the "responsive" class to topnav when the user clicks on the icon */
function myFunction() {
    var x = document.getElementById("myTopnav");
    if (x.className === "topnav") {
      x.className += " responsive";
    } else {
      x.className = "topnav";
    }
  }


<script>
const gallery = document.getElementById('gallery');
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');

const images = Array.from(gallery.querySelectorAll('img'));
let currentIndex = 0;

// Work out which image is currently centred
function updateCurrentIndex() {
  const galleryCenter = gallery.scrollLeft + gallery.clientWidth / 2;

  let closest = 0;
  let closestDistance = Infinity;

  images.forEach((img, index) => {
    const imgCenter = img.offsetLeft + img.clientWidth / 2;
    const distance = Math.abs(galleryCenter - imgCenter);

    if (distance < closestDistance) {
      closestDistance = distance;
      closest = index;
    }
  });

  currentIndex = closest;
  updateArrows();
}

function scrollToImage(index) {
  images[index].scrollIntoView({
    behavior: 'smooth',
    inline: 'center'
  });
}

function updateArrows() {
  leftBtn.classList.toggle('disabled', currentIndex === 0);
  rightBtn.classList.toggle('disabled', currentIndex === images.length - 1);
}

leftBtn.addEventListener('click', () => {
  if (currentIndex > 0) {
    scrollToImage(currentIndex - 1);
  }
});

rightBtn.addEventListener('click', () => {
  if (currentIndex < images.length - 1) {
    scrollToImage(currentIndex + 1);
  }
});

gallery.addEventListener('scroll', () => {
  window.requestAnimationFrame(updateCurrentIndex);
});

// Initial state
updateCurrentIndex();
</script>