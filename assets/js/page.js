document.addEventListener("DOMContentLoaded", async function () {
    try {
        // Normalize the current page path
        const currentPath = window.location.pathname.replace(/\/+$/, "");

        // Fetch posts JSON
        const posts = await fetchPosts("/posts.json");

        // Find the current post index
        const currentIndex = posts.findIndex(post => post.link === currentPath);
        if (currentIndex === -1) {
            console.warn("Current post not found in JSON.");
            return;
        }

        // Get previous and next posts
        const prevPost = posts[currentIndex - 1];
        const nextPost = posts[currentIndex + 1];

        // Add navigation links to the page
        addPostNavigation(prevPost, nextPost);
    } catch (error) {
        console.error("Error loading posts:", error);
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

// Function to create and append navigation buttons
function addPostNavigation(prevPost, nextPost) {
    const navContainer = document.createElement("div");
    navContainer.classList.add("post-navigation", "d-flex", "justify-content-between", "mt-4");

    // Add Previous button
    if (prevPost) {
        const prevLink = createButton(prevPost.link, `⇐ ${prevPost.title}`, "btn btn-secondary", "prev");
        navContainer.appendChild(prevLink);
    }

    // Add Next button
    if (nextPost) {
        const nextLink = createButton(nextPost.link, `${nextPost.title} ⇒`, "btn btn-primary ms-auto", "next");
        navContainer.appendChild(nextLink);
    }

    // Append to the article
    const article = document.querySelector("article");
    if (article) {
        article.appendChild(navContainer);
    } else {
        console.warn("No <article> element found.");
    }
}

// Helper function to create navigation buttons
function createButton(href, text, className, rel) {
    const button = document.createElement("a");
    button.href = href;
    button.textContent = text;
    button.className = className;
    button.setAttribute("rel", rel);
    return button;
}
