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
  "In some parts of the world, Santa has different names—like 'Father Christmas' in the UK and 'Père Noël' in France! 🌍🎅",
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
  "Candy canes were invented in the late 17th century and originally didn’t have the red stripes! 🍭🎄",
  "Did you know? The abbreviation 'Xmas' comes from the Greek letter Chi (Χ), which stands for Christ. ✝️🎅",
  "The Rockefeller Center Christmas tree tradition started in 1933 in New York City! 🌟🎄",
  "In Italy, children await 'La Befana,' a kind witch who delivers gifts on January 6! 🧙‍♀️",
  "The world’s tallest snowman was built in Maine, USA, and stood at 122 feet tall! ⛄❄️",
  "The legend of Krampus tells of a half-goat, half-demon creature who punishes naughty children! 😈🛷",
  "The tradition of Christmas stockings comes from a legend where Saint Nicholas dropped coins into stockings hung by the fireplace! 🧦✨",
  "The Star of Bethlehem, which guided the Wise Men, is thought by some to have been a rare planetary alignment. 🌟✨",
  "The Yule log tradition comes from a Norse celebration, symbolizing the sun’s return after the winter solstice! 🔥🌞",
  "In the UK, it’s believed that robins on Christmas cards symbolize good luck and joy! 🐦🎄",
  "The Christmas cracker tradition in England started in the mid-1800s as a fun twist on wrapped gifts! 🎁🎉",
  "Did you know? The Nutcracker ballet was first performed in 1892 and is now a Christmas classic! 🩰🎶",
  "The Finnish believe Santa Claus lives in Korvatunturi, a secret mountain in Lapland! 🏔️🎅",
  "Mistletoe, a symbol of love and friendship, was sacred to ancient druids. 💚❄️",
  "The poinsettia, known as the Christmas flower, originated in Mexico and symbolizes purity and joy. 🌺🎄",
  "The Twelve Days of Christmas song is believed to have hidden Christian meanings during times of persecution. 🎶✝️",
  "In Germany, children leave their shoes out on December 6 for Saint Nicholas to fill with treats! 👞🎁",
  "The Grinch, a beloved Christmas character, was created by Dr. Seuss in 1957 to remind us of the holiday spirit! 💚🎅",
  "According to legend, Christmas bells were rung to drive away evil spirits and bring blessings. 🔔✨",
  "Did you know? Frosty the Snowman was introduced as a song in 1950 before becoming a TV classic! ⛄🎵",
  "In Scandinavian folklore, the Yule Goat delivers presents instead of Santa! 🐐🎄",
  "The word 'carol' originally meant a dance in a circle, often accompanied by singing. 🎶✨",
  "In Ukraine, spider webs are considered good luck on Christmas trees, inspired by a magical legend! 🕸️🎄",
  "The idea of Christmas elves originated in 19th-century literature as Santa's helpers! 🧝‍♂️✨",
  "The Feast of the Nativity was first celebrated as a Christian holiday in 336 AD. ✝️🎄",
  "According to legend, reindeer can fly because of magic corn given to them by Santa! 🦌✨",
  "The story of the Little Drummer Boy symbolizes that even simple gifts from the heart are precious. 🥁❤️",
  "The phrase 'Happy Holidays' gained popularity to include the many celebrations in December! 🌟❄️"
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
