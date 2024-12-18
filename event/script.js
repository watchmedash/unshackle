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
  "Did you know? The image of Santa Claus we know today was popularized by Coca-Cola ads in the 1930s! 🎅🥤",
  "The tradition of decorating Christmas trees originated in Germany in the 16th century! 🎄",
  "Santa Claus is based on Saint Nicholas, a generous bishop from the 4th century! ✨🎁",
  "The song 'Jingle Bells' was originally written for Thanksgiving, not Christmas! 🎶🦃",
  "The world’s largest Christmas stocking measured over 106 feet and weighed nearly a ton! 🧦🎄",
  "Did you know? NORAD has been tracking Santa's journey on Christmas Eve since 1955! ✈️🎅",
  "In Japan, it’s a tradition to eat KFC on Christmas! 🎄🍗",
  "Rudolph the Red-Nosed Reindeer was created as a marketing gimmick for a department store in 1939! 🦌✨",
  "The first artificial Christmas trees were made of dyed goose feathers in Germany! 🪶🎄",
  "Christmas wasn’t always on December 25—it was chosen to align with a Roman festival! 🎉🌟",
  "The Christmas wreath symbolizes the circle of life and eternal love. 🌺🎄",
  "Santa’s sleigh is said to travel at 650 miles per second to deliver gifts to every child! 🛷🌟",
  "The largest snowflake ever recorded was 15 inches wide and fell in Montana in 1887! ❄️⛄",
  "In Iceland, the 'Yule Lads' bring gifts to children for 13 nights leading up to Christmas! 🎁",
  "Candy canes were invented in the late 17th century and originally didn’t have the red stripes! 🍭🎄"
];

// Background Image Shuffle
function shuffleBackgrounds() {
  const images = ['xmas.jpg', 'xmas1.jpg', 'xmas2.jpg', 'xmas3.jpg', 'xmas4.jpg', 'xmas5.jpg', 'xmas6.jpg', 'xmas7.jpg', 'xmas8.jpg', 'xmas9.jpg'];
  shuffleArray(images);
  return images[0];
}

// Create Cards
function createCards() {
  const cardsContainer = document.getElementById('cards-container');
  shuffleArray(messages); // Shuffle messages before card creation

  let emailCardIndex = Math.floor(Math.random() * messages.length); // Randomly select one card to have the email input

  for (let i = 0; i < messages.length; i++) {
    const card = document.createElement('div');
    card.className = 'card';
    const backgroundImage = shuffleBackgrounds(); // Shuffle background for each card
    card.style.backgroundImage = `url(${backgroundImage})`;
    card.setAttribute('data-index', i); // Store index to track opened cards

    card.onclick = () => {
      openCard(i, card, emailCardIndex); // Pass emailCardIndex to check if this is the special card
    };
    cardsContainer.appendChild(card);
  }

  return emailCardIndex;  // Return the email card index so it's available for checking
}

// Open Card and Show Popup
function openCard(index, card, emailCardIndex) {
  const message = messages[index];
  const openedCardImage = 'opened.jpg'; // Image representing the card has been opened
  card.style.backgroundImage = `url(${openedCardImage})`; // Change card background to opened state

  const popup = document.getElementById('popup');
  const overlay = document.getElementById('overlay');
  const messageElement = document.getElementById('message');

  // Clear previous content (email input and buttons)
  popup.innerHTML = ''; // Clear previous content in the popup
  overlay.style.display = 'block'; // Show overlay
  popup.style.display = 'block'; // Show popup

  // Create Try Another button (Only for regular cards)
  const tryAnotherButton = document.createElement('button');
  tryAnotherButton.textContent = "Try another card";

  // If it's the special card, show email input and claim button
  if (index === emailCardIndex) {
    // Clear the content before adding new
    const emailInputContainer = document.createElement('div');
    emailInputContainer.innerHTML = `${message} <br><input type="email" id="email" placeholder="Enter your email" required/><br><button id="claim-gift-btn" onclick="claimGift()" disabled>Claim Gift 🎁</button>`;
    popup.appendChild(emailInputContainer); // Add email input container

    const emailInput = document.getElementById('email');
    const claimButton = document.getElementById('claim-gift-btn');

    // Enable claim button only if email is valid
    emailInput.addEventListener('input', () => {
      const email = emailInput.value;
      if (email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        claimButton.disabled = false;
      } else {
        claimButton.disabled = true;
      }
    });
  } else {
    // For regular cards, show the message and the "Try another card" button
    messageElement.textContent = message;
    popup.appendChild(messageElement);
    tryAnotherButton.onclick = () => {
      closePopup();
    };
    popup.appendChild(tryAnotherButton);
  }
}

// Close Popup
function closePopup() {
  const popup = document.getElementById('popup');
  const overlay = document.getElementById('overlay');
  popup.style.display = 'none';
  overlay.style.display = 'none';
}

// Claim Gift
function claimGift() {
  const link = document.createElement('a');
  link.href = 'https://luglawhaulsano.net/4/8670939';
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showThankYouPopup();
}

// Show Thank You Popup
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

// Initialize Cards and store the special card index
const emailCardIndex = createCards();
