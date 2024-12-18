// snow.js

// Create the snowflakes
function createSnowflakes() {
    const snowflakeCount = 50; // Number of snowflakes to appear
    const snowflakes = [];

    // Create snowflake elements
    for (let i = 0; i < snowflakeCount; i++) {
        const snowflake = document.createElement('div');
        snowflake.classList.add('snowflake');
        snowflakes.push(snowflake);
        document.body.appendChild(snowflake);
    }

    // Set animation for each snowflake
    snowflakes.forEach((snowflake, index) => {
        // Set random properties for each snowflake
        const size = Math.random() * 10 + 3; // Random size between 5px and 15px
        const leftPosition = Math.random() * window.innerWidth; // Random horizontal position
        const animationDuration = Math.random() * 5 + 7; // Random animation time between 5s and 10s
        const delay = Math.random() * 5; // Random delay to make it look natural

        snowflake.style.width = `${size}px`;
        snowflake.style.height = `${size}px`;
        snowflake.style.left = `${leftPosition}px`;
        snowflake.style.animationDuration = `${animationDuration}s`;
        snowflake.style.animationDelay = `${delay}s`;
    });
}

// Call the function to create snowflakes
createSnowflakes();
