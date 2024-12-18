const countdownElement = document.getElementById('countdown');
const christmasDate = new Date('December 25, 2024 00:00:00').getTime();

function updateCountdown() {
  const now = new Date().getTime();
  const distance = christmasDate - now;

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  countdownElement.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s until Christmas!`;

  if (distance < 0) {
    clearInterval(timer);
    countdownElement.textContent = "Merry Christmas!";
  }
}
const timer = setInterval(updateCountdown, 1000);

const cardsContainer = document.getElementById('cards-container');
const messages = [
  "May this Christmas season bring you endless joy and unforgettable moments spent with your loved ones! 🎅🎄",
  "Wishing you a Christmas filled with love, laughter, and everything you’ve been hoping for! ❤️❄️",
  "May the holiday season remind you of the beauty of giving, sharing, and creating memories that last forever. 🎁✨",
  "Here’s to a Christmas that’s merry and bright, with happiness in every corner of your home. 🌟🎶",
  "May this Christmas bring warmth to your heart, light to your soul, and joy to your days! 🌟❄️",
  "Let the magic of Christmas fill your heart and home with peace, love, and happiness! 🎄❤️",
  "Wishing you a holiday season that’s as beautiful and magical as you are! 🎅✨",
  "This Christmas, may all your dreams come true, and may your days be filled with peace and love. 🌟🎁",
  "Sending you warm wishes for a Christmas filled with laughter, love, and cherished memories. ❤️🎄",
  "Hope your holiday season sparkles with moments of joy, magic, and endless love. ✨🎅",
  "Wishing you the happiest of holidays and a New Year filled with prosperity and success. 🥂🎉",
  "May the beauty of the season touch your heart and bring you countless blessings. 🌟🎄"
];

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function shuffleBackgrounds() {
  const images = ['xmas.jpg', 'xmas1.jpg', 'xmas2.jpg', 'xmas3.jpg', 'xmas4.jpg', 'xmas5.jpg', 'xmas6.jpg', 'xmas7.jpg', 'xmas8.jpg', 'xmas9.jpg'];
  shuffleArray(images);
  return images[0];  // Return only one shuffled image for all cards
}

function createCards() {
  const backgroundImage = shuffleBackgrounds(); // Get one shuffled background image

  shuffleArray(messages);

  for (let i = 0; i < 12; i++) {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.backgroundImage = `url(${backgroundImage})`; // Set the same background image for all cards
    card.onclick = () => showPopup(messages[i]);
    cardsContainer.appendChild(card);
  }
}

const popup = document.getElementById('popup');
const overlay = document.getElementById('overlay');
const messageElement = document.getElementById('message');

function showPopup(message) {
  messageElement.textContent = message;
  popup.style.display = 'block';
  overlay.style.display = 'block';
}

function closePopup() {
  popup.style.display = 'none';
  overlay.style.display = 'none';
}

// New function to open a link when "Claim Gift" is clicked
function claimGift() {
  window.open('https://dashflix.top', '_blank'); // Replace with your desired URL
}

createCards();
