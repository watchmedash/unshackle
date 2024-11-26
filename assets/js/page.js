document.addEventListener("DOMContentLoaded", function () {
    const currentLink = window.location.pathname; // Current post's link

    fetch("/posts.json")
        .then(response => response.json())
        .then(posts => {
            // Find the current post index
            const currentIndex = posts.findIndex(post => post.link === currentLink);

            if (currentIndex !== -1) {
                // Get Previous and Next posts
                const prevPost = posts[currentIndex - 1];
                const nextPost = posts[currentIndex + 1];

                // Add navigation buttons
                const navContainer = document.createElement("div");
                navContainer.classList.add("post-navigation", "d-flex", "justify-content-between", "mt-4");

                if (prevPost) {
                    const prevButton = `
                        <a href="${prevPost.link}" class="btn btn-secondary">
                            ⇐ ${prevPost.title}
                        </a>
                    `;
                    navContainer.innerHTML += prevButton;
                }

                if (nextPost) {
                    const nextButton = `
                        <a href="${nextPost.link}" class="btn btn-primary ms-auto">
                            ${nextPost.title} ⇒
                        </a>
                    `;
                    navContainer.innerHTML += nextButton;
                }

                // Append navigation buttons to the article
                const article = document.querySelector("article");
                article.appendChild(navContainer);
            }
        })
        .catch(error => console.error("Error loading posts:", error));
});
