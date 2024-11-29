let postsData = []; // To store the JSON data
let filteredPosts = []; // To store filtered posts for search and tag filtering
const postsPerPage = 12; // Number of posts per page
let currentPage = 1; // Current page number
let allTags = []; // Array to store unique tags

function displayPosts() {
  const postsContainer = document.getElementById('posts-container');
  postsContainer.innerHTML = ''; // Clear the container

  // Save current page to localStorage
  localStorage.setItem('currentPage', currentPage);

  // Check if there are no filtered posts
  if (filteredPosts.length === 0) {
    postsContainer.innerHTML = '<p>No results found.</p>'; // Display no results message
    return; // Exit the function early if no posts found
  }

  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;

  const currentPosts = filteredPosts.slice(startIndex, endIndex);

  currentPosts.forEach(post => {
    const postElement = document.createElement('div');
    postElement.classList.add('post');

    postElement.innerHTML = `
      <img src="${post.image}" alt="${post.title}">
      <div class="post-content">
        <h2><a href="${post.link}">${post.title}</a></h2>
        <p>${post.snippet}</p>
      </div>
    `;

    postsContainer.appendChild(postElement);
  });

  // Lazyload handling
  const lazyImages = document.querySelectorAll('img.lazyload');
  lazyImages.forEach(img => {
    img.addEventListener('load', () => {
      img.previousElementSibling.style.display = 'none'; // Hide spinner when image loads
    });

    img.src = img.getAttribute('data-src'); // Trigger image loading
    img.removeAttribute('data-src');
  });

  createPagination();
}

// Function to create pagination buttons
function createPagination() {
  const pagination = document.getElementById('pagination');
  pagination.innerHTML = ''; // Clear the pagination

  // If there are no posts after filtering, don't show pagination
  if (filteredPosts.length === 0) {
    return; // Exit the function if no posts are available
  }

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const visibleButtons = 3; // Number of visible buttons at a time

  if (currentPage > 1) {
    const firstButton = document.createElement('button');
    firstButton.textContent = '<<';
    firstButton.classList.add('pagination-btn');
    firstButton.addEventListener('click', () => {
      currentPage = 1;
      displayPosts();
      createPagination();
    });
    pagination.appendChild(firstButton);

    const prevButton = document.createElement('button');
    prevButton.textContent = '<';
    prevButton.classList.add('pagination-btn');
    prevButton.addEventListener('click', () => {
      currentPage -= 1;
      displayPosts();
      createPagination();
    });
    pagination.appendChild(prevButton);
  }

  let startPage = Math.max(1, currentPage - Math.floor(visibleButtons / 2));
  let endPage = Math.min(totalPages, startPage + visibleButtons - 1);
  if (endPage - startPage < visibleButtons - 1) {
    startPage = Math.max(1, endPage - visibleButtons + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    const button = document.createElement('button');
    button.textContent = i;
    button.classList.add('pagination-btn');
    if (i === currentPage) {
      button.classList.add('active');
    }
    button.addEventListener('click', () => {
      currentPage = i;
      displayPosts();
      createPagination();
    });
    pagination.appendChild(button);
  }

  if (currentPage < totalPages) {
    const nextButton = document.createElement('button');
    nextButton.textContent = '>';
    nextButton.classList.add('pagination-btn');
    nextButton.addEventListener('click', () => {
      currentPage += 1;
      displayPosts();
      createPagination();
    });
    pagination.appendChild(nextButton);

    const lastButton = document.createElement('button');
    lastButton.textContent = '>>';
    lastButton.classList.add('pagination-btn');
    lastButton.addEventListener('click', () => {
      currentPage = totalPages;
      displayPosts();
      createPagination();
    });
    pagination.appendChild(lastButton);
  }
}

// Function to handle search
function searchPosts(searchTerm) {
  const term = searchTerm.trim().toLowerCase();
  if (!term) {
    filteredPosts = postsData; // Reset to all posts if search is empty
  } else {
    filteredPosts = postsData.filter(post =>
      post.title && post.title.toLowerCase().includes(term)
    );
  }

  currentPage = 1; // Reset to the first page
  displayPosts();
  createPagination();
}

// Function to handle tag click and filter posts by category
function filterByTag(tag) {
  filteredPosts = postsData.filter(post => post.tag === tag);
  currentPage = 1;  // Reset to the first page when a tag is clicked
  displayPosts();  // Display filtered posts
  createPagination();
}

// Function to show all posts
function showAllPosts() {
  filteredPosts = postsData;
  currentPage = 1;
  displayPosts();
  createPagination();
}

// Function to create tag filter dropdown
function createTagFilter() {
  const tagContainer = document.getElementById('tag-filter');
  tagContainer.innerHTML = '';  // Clear existing tags

  // Create a "Show All" option
  const showAllOption = document.createElement('option');
  showAllOption.value = 'all';
  showAllOption.textContent = 'Show All';
  tagContainer.appendChild(showAllOption);

  // Create an option for each unique tag
  allTags.forEach(tag => {
    const tagOption = document.createElement('option');
    tagOption.value = tag;
    tagOption.textContent = tag;
    tagContainer.appendChild(tagOption);
  });

  // Add event listener to filter posts when a tag is selected
  tagContainer.addEventListener('change', (e) => {
    const selectedTag = e.target.value;
    if (selectedTag === 'all') {
      showAllPosts();
    } else {
      filterByTag(selectedTag);
    }
  });
}

fetch('pages.json')
  .then(response => response.json())
  .then(data => {
    postsData = data; // Load posts data
    filteredPosts = postsData; // Initially show all posts

    // Retrieve current page from localStorage
    const savedPage = localStorage.getItem('currentPage');
    currentPage = savedPage ? parseInt(savedPage, 10) : 1;

    // Extract unique tags from posts data
    allTags = [...new Set(postsData.map(post => post.tag))];

    createTagFilter(); // Create the tag filter dropdown
    displayPosts(); // Display the posts
    createPagination(); // Create pagination buttons
  })
  .catch(error => {
    console.error('Error loading pages.json:', error);
  });


// Attach search input event
document.getElementById('search-input').addEventListener('input', (e) => {
  searchPosts(e.target.value); // Trigger search as input changes
});
