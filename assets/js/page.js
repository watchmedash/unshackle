document.addEventListener("DOMContentLoaded", async function () {
    try {
        // Normalize the current page path
        const currentPath = window.location.pathname.replace(/\/+$/, "");

        // Fetch posts JSON
        const posts = await fetchPosts("https://uaexpats.top/posts.json");

        // Exclude the current post
        const relatedPosts = getRelatedPosts(posts, currentPath, 3);

        // Add related posts to the bottom of the article
        displayRelatedPosts(relatedPosts);
    } catch (error) {
        console.error("Error loading related posts:", error);
    }
});

// Function to fetch posts JSON
async function fetchPosts(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch posts.json: ${response.statusText}`);
    }
    return await response.json();
}

// Function to get random related posts
function getRelatedPosts(posts, currentPath, count) {
    // Filter out the current post
    const filteredPosts = posts.filter(post => post.link !== currentPath);

    // Shuffle posts array (Fisher-Yates Shuffle)
    for (let i = filteredPosts.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [filteredPosts[i], filteredPosts[j]] = [filteredPosts[j], filteredPosts[i]];
    }

    // Return the first `count` posts
    return filteredPosts.slice(0, count);
}

// Function to display related posts
function displayRelatedPosts(relatedPosts) {
    // Create a container for related posts
    const relatedContainer = document.createElement("div");
    relatedContainer.classList.add("related-posts", "mt-5");

    // Add a heading
    const heading = document.createElement("h3");
    heading.textContent = "Related Posts";
    relatedContainer.appendChild(heading);

    // Add each related post as a card or list item
    const postsList = document.createElement("div");
    postsList.classList.add("d-flex", "flex-wrap", "gap-3");

    relatedPosts.forEach(post => {
        const postCard = createPostCard(post);
        postsList.appendChild(postCard);
    });

    relatedContainer.appendChild(postsList);

    // Append to the bottom of the article
    const article = document.querySelector("article");
    if (article) {
        article.appendChild(relatedContainer);
    } else {
        console.warn("No <article> element found.");
    }
}

// Function to create a card for each related post
function createPostCard(post) {
    const card = document.createElement("div");
    card.classList.add("related-post-card", "card", "p-3", "shadow-sm", "flex-grow-1");

    // Title link
    const titleLink = document.createElement("a");
    titleLink.href = post.link;
    titleLink.textContent = post.title;
    titleLink.classList.add("card-title", "h5", "text-decoration-none");

    // Image (if available)
    if (post.image) {
        const img = document.createElement("img");
        img.src = post.image;
        img.alt = post.title;
        img.classList.add("card-img-top", "mb-3");
        card.appendChild(img);
    }

    // Add the title
    card.appendChild(titleLink);

    // Add tags or additional info (optional)
    if (post.tag) {
        const tag = document.createElement("span");
        tag.textContent = post.tag;
        tag.classList.add("badge", "bg-primary", "mt-2");
        card.appendChild(tag);
    }

    return card;
}
