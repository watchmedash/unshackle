document.addEventListener("DOMContentLoaded", function () {
    const currentLink = window.location.pathname.replace(/\/+$/, ""); // Normalize path

    fetch("/posts.json")
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(posts => {
            // Find the current post index
            const currentIndex = posts.findIndex(post => post.link === currentLink);

            if (currentIndex === -1) {
                console.warn("Current post not found in JSON.");
                return;
            }

            // Get Previous and Next posts
            const prevPost = posts[currentIndex - 1];
            const nextPost = posts[currentIndex + 1];

            // Add navigation buttons
            const navContainer = document.createElement("div");
            navContainer.classList.add("post-navigation", "d-flex", "justify-content-between", "mt-4");

            if (prevPost) {
                const prevButton = `
                    <a href="${prevPost.link}" class="btn btn-secondary" rel="prev">
                        ⇐ ${prevPost.title}
                    </a>
                `;
                navContainer.innerHTML += prevButton;
            }

            if (nextPost) {
                const nextButton = `
                    <a href="${nextPost.link}" class="btn btn-primary ms-auto" rel="next">
                        ${nextPost.title} ⇒
                    </a>
                `;
                navContainer.innerHTML += nextButton;
            }

            // Append navigation buttons to the article
            const article = document.querySelector("article");
            if (article) {
                article.appendChild(navContainer);
            } else {
                console.warn("No <article> element found.");
            }
        })
        .catch(error => console.error("Error loading posts:", error));
});
