const giftRainContainer = document.getElementById('gift-rain');

// Array of gift image paths (ensure these are correct paths to your images)
const gifts = [
  'gift1.png', 'gift2.png', 'gift3.png', 'gift4.png', 'gift5.png', 'gift6.png', 'gift7.png', 'gift8.png', 'gift9.png', 'gift10.png', 'gift11.png',
];

// Function to create a falling gift
function createFallingGift() {
  const gift = document.createElement('div');
  gift.classList.add('gift');

  // Set a random gift image
  const randomGift = gifts[Math.floor(Math.random() * gifts.length)];
  gift.style.backgroundImage = `url(${randomGift})`;

  // Set a random position along the x-axis (avoid spawning in the middle)
  const leftPosition = Math.random() * 100; // Random position from 0% to 100% of the viewport width
  gift.style.left = `${leftPosition}vw`;

  // Set a random animation duration for a unique fall time
  const duration = Math.random() * 10 + 10; // Random duration between 10s and 20s
  gift.style.animationDuration = `${duration}s`;

  giftRainContainer.appendChild(gift);

  // Remove the gift after it finishes falling
  setTimeout(() => {
    gift.remove();
  }, duration * 1000); // Duration in milliseconds
}

// Function to create gifts at random intervals, slowed down
function startGiftRain() {
  setInterval(createFallingGift, Math.random() * 1000 + 1000); // Random spawn interval between 1s to 2s
}

startGiftRain();
