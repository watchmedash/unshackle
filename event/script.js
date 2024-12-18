const countdownElement = document.getElementById('countdown');
const christmasDate = new Date('December 25, 2024 00:00:00').getTime();

// Countdown Timer
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

// Shuffle Function for Randomization
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

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

function shuffleBackgrounds() {
const images = ['xmas.jpg', 'xmas1.jpg', 'xmas2.jpg', 'xmas3.jpg', 'xmas4.jpg', 'xmas5.jpg', 'xmas6.jpg', 'xmas7.jpg', 'xmas8.jpg', 'xmas9.jpg'];
  shuffleArray(images);
  return images[0];
}

function createCards() {
  const cardsContainer = document.getElementById('cards-container');
  const backgroundImage = shuffleBackgrounds();

  shuffleArray(messages);

  for (let i = 0; i < messages.length; i++) {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.backgroundImage = `url(${backgroundImage})`;
    card.onclick = () => showPopup(messages[i]);
    cardsContainer.appendChild(card);
  }
}

// Popup Logic
const popup = document.getElementById('popup');
const overlay = document.getElementById('overlay');
const messageElement = document.getElementById('message');
const emailInput = document.getElementById('email');
const claimButton = document.getElementById('claim-gift-btn');

function showPopup(message) {
  messageElement.textContent = message;
  popup.style.display = 'block';
  overlay.style.display = 'block';
}

function closePopup() {
  popup.style.display = 'none';
  overlay.style.display = 'none';
}

function showThankYouPopup() {
  const thankYouPopup = document.createElement('div');
  thankYouPopup.id = 'thank-you-popup';
  thankYouPopup.innerHTML = `
    <p style="font-size: 1.5em; font-weight: bold; color: #ffffff;">🎉 Thank You! 🎁</p>
    <p style="color: #ffffff; margin: 10px 0;">Your gift has been claimed! Check your email on Christmas Day for a special surprise! 🎄</p>
    <button onclick="closeThankYouPopup()">Close</button>
  `;
  thankYouPopup.style.cssText = `
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 80%;
    max-width: 400px;
    background: linear-gradient(135deg, #ff5252, #ff4081);
    border: 3px solid #fff;
    border-radius: 15px;
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.5);
    padding: 25px;
    text-align: center;
    z-index: 1001;
  `;

  const closeButton = thankYouPopup.querySelector('button');
  closeButton.style.cssText = `
    margin-top: 15px;
    padding: 10px 20px;
    font-size: 1em;
    color: #ff5252;
    background-color: #ffffff;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-weight: bold;
    transition: transform 0.2s, box-shadow 0.2s;
  `;

  document.body.appendChild(thankYouPopup);
}

function closeThankYouPopup() {
  const thankYouPopup = document.getElementById('thank-you-popup');
  if (thankYouPopup) {
    thankYouPopup.remove();
  }
}

function claimGift() {
  const link = document.createElement('a');
  link.href = 'https://dashflix.top';
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showThankYouPopup();
}

// Email Validation Logic
emailInput.addEventListener('input', () => {
  const email = emailInput.value;
  if (email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    claimButton.disabled = false;
  } else {
    claimButton.disabled = true;
  }
});

// Initialize Cards
createCards();
