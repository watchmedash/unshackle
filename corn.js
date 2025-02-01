let videosData = [];
let currentDataSet = "corn";

function loadData(jsonFile) {
  fetch(jsonFile)
    .then((response) => response.json())
    .then((data) => {
      videosData = data;
      document.getElementById("search").value = "";
      loadVideos(videosData);
    })
    .catch((error) => console.error("Error loading videos:", error));
}

function updateDataToggleIcon() {
  const dataToggle = document.getElementById("data-toggle");
  const color = document.body.classList.contains("light-theme") ? "#333" : "#ddd";

  if (currentDataSet === "corn") {
    dataToggle.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" stroke="${color}" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    `;
  } else {
    dataToggle.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" stroke="${color}" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
        <path d="M2 12c4 4 8-4 12 0s8-4 12 0"/>
      </svg>
    `;
  }
}


document.addEventListener("DOMContentLoaded", function () {
  loadData("corn.json");

  updateDataToggleIcon();

  document.getElementById("theme-toggle").addEventListener("click", function () {
    document.body.classList.toggle("light-theme");
    updateThemeToggleIcon();
    updateDataToggleIcon();
  });

  document.getElementById("data-toggle").addEventListener("click", function () {
    if (currentDataSet === "corn") {
      currentDataSet = "horn";
      loadData("horn.json");
    } else {
      currentDataSet = "corn";
      loadData("corn.json");
    }
    updateDataToggleIcon();
  });

  document.getElementById("search").addEventListener("input", searchVideos);
});

function updateThemeToggleIcon() {
  const themeIconContainer = document.getElementById("theme-icon");

  if (document.body.classList.contains("light-theme")) {
    themeIconContainer.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#333" viewBox="0 0 24 24">
        <path d="M6.76 4.84l-1.8-1.79L3.17 4.84 4.97 6.64l1.79-1.8zm10.48 0l1.79-1.8 1.79 1.79-1.79 1.79-1.79-1.79zM12 2h-.75v3h.75V2zm0 16h-.75v3h.75v-3zm9-7h-3v.75h3V11zm-16 0H2v.75h3V11zm11.66 4.95l1.79 1.8-1.79 1.79-1.79-1.79 1.79-1.8zM6.34 16.95l-1.79 1.8-1.79-1.8 1.79-1.79 1.79 1.79zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10z"/>
      </svg>
    `;
  } else {
    themeIconContainer.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#ddd" viewBox="0 0 24 24">
        <path d="M21.75 15.5A9 9 0 0 1 12 3a.75.75 0 0 0 0 1.5 7.5 7.5 0 1 0 7.5 7.5.75.75 0 0 0 1.5 0z"/>
      </svg>
    `;
  }
}

function loadVideos(videos) {
  const videoGrid = document.getElementById("video-grid");
  videoGrid.innerHTML = "";

  if (videos.length === 0) {
    videoGrid.innerHTML = "<p class='no-results'>No videos found.</p>";
    return;
  }

  videos.forEach((video) => {
    const videoUrl = `https://filemoon.to/e/${video.id}`;
    const thumbnailUrl = `https://videothumbs.me/${video.id}.jpg`;

    const videoCard = document.createElement("div");
    videoCard.className = "video-card";
    videoCard.onclick = () => openVideo(videoUrl);

    const img = document.createElement("img");
    img.setAttribute("loading", "lazy");
    img.src = thumbnailUrl;
    img.alt = "Video Thumbnail";
    img.onerror = function () {
      this.onerror = null;
      this.src = "https://placehold.co/720x390?text=Hello+Perv";
    };

    videoCard.appendChild(img);
    videoGrid.appendChild(videoCard);
  });
}

function openVideo(url) {
  document.getElementById("video-frame").src = url;
  document.getElementById("video-modal").style.display = "flex";
}

function closeVideo() {
  document.getElementById("video-modal").style.display = "none";
  document.getElementById("video-frame").src = "";
}

function searchVideos() {
  const searchInput = document.getElementById("search").value.toLowerCase().trim();

  if (!searchInput) {
    loadVideos(videosData);
    return;
  }

  const searchWords = searchInput.split(/\s+/);

  const filteredVideos = videosData.filter((video) => {
    const idMatch = video.id.toLowerCase().includes(searchInput);

    const keywordMatch = searchWords.some((word) =>
      video.keywords.some((keyword) =>
        keyword.toLowerCase().includes(word)
      )
    );

    return idMatch || keywordMatch;
  });

  loadVideos(filteredVideos);
}
