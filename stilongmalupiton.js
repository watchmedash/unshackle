(function() {
    'use strict';

    const TMDB_API_KEY = '4f599baa15d072c9de346b2816a131b8';
    const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
    const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w92';

    let currentSelection = null;
    let tvShowDetails = null;

    const elements = {
        get searchInput() { return document.getElementById('searchInput'); },
        get searchBtn() { return document.getElementById('searchBtn'); },
        get searchResults() { return document.getElementById('searchResults'); },
        get loadingSpinner() { return document.getElementById('loadingSpinner'); },
        get selectedContent() { return document.getElementById('selectedContent'); },
        get selectedTitle() { return document.getElementById('selectedTitle'); },
        get selectedMeta() { return document.getElementById('selectedMeta'); },
        get seasonEpisodeControls() { return document.getElementById('seasonEpisodeControls'); },
        get seasonSelect() { return document.getElementById('seasonSelect'); },
        get episodeSelect() { return document.getElementById('episodeSelect'); },
        get playerContainer() { return document.getElementById('playerContainer'); },
        get playerIframe() { return document.getElementById('playerIframe'); },
        get errorMessage() { return document.getElementById('errorMessage'); }
    };

    function initializeEventListeners() {
        elements.searchInput.addEventListener('input', debounce(handleSearch, 500));
        elements.searchInput.addEventListener('keypress', handleSearchEnter);
        elements.searchBtn.addEventListener('click', handleSearch);
        elements.seasonSelect.addEventListener('change', handleSeasonChange);
        elements.episodeSelect.addEventListener('change', handleEpisodeChange);

    }

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    async function handleSearch() {
        const query = elements.searchInput.value.trim();

        if (!query) {
            elements.searchResults.style.display = 'none';
            return;
        }

        elements.searchInput.classList.add('loading');
        elements.loadingSpinner.style.display = 'block';
        elements.searchResults.style.display = 'none';

        try {
            const results = await searchTMDB(query, TMDB_API_KEY);
            displaySearchResults(results);
        } catch (error) {
            showError('Search failed. Please check your connection and try again.');
            console.error('Search error:', error);
        } finally {
            elements.searchInput.classList.remove('loading');
            elements.loadingSpinner.style.display = 'none';
        }
    }

    async function searchTMDB(query, apiKey) {
        const url = `${TMDB_BASE_URL}/search/multi?api_key=${apiKey}&query=${encodeURIComponent(query)}`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        return await response.json();
    }

    function displaySearchResults(data) {
        const resultsContainer = elements.searchResults;
        resultsContainer.innerHTML = '';

        if (!data.results || data.results.length === 0) {
            resultsContainer.innerHTML = `
                <div style="padding: 30px; text-align: center; color: rgba(255,255,255,0.6);">
                    <i class="fas fa-search" style="font-size: 24px; margin-bottom: 10px; opacity: 0.5;"></i>
                    <div>No results found</div>
                </div>
            `;
            resultsContainer.style.display = 'block';
            return;
        }

        const currentDate = new Date();

        const mediaResults = data.results.filter(item => {
            if (item.media_type !== 'movie' && item.media_type !== 'tv') {
                return false;
            }

            const releaseDate = item.media_type === 'movie' ? item.release_date : item.first_air_date;
            if (!releaseDate) {
                return false;
            }

            const itemDate = new Date(releaseDate);
            return itemDate <= currentDate;
        });

        if (mediaResults.length === 0) {
            resultsContainer.innerHTML = `
                <div style="padding: 30px; text-align: center; color: rgba(255,255,255,0.6);">
                    <i class="fas fa-calendar-times" style="font-size: 24px; margin-bottom: 10px; opacity: 0.5;"></i>
                    <div>No released content found</div>
                </div>
            `;
            resultsContainer.style.display = 'block';
            return;
        }

        mediaResults.forEach(item => {
            const resultItem = createSearchResultItem(item);
            resultsContainer.appendChild(resultItem);
        });

        resultsContainer.style.display = 'block';
    }

    function createSearchResultItem(item) {
        const div = document.createElement('div');
        div.className = 'search-result-item';

        const title = item.title || item.name;
        const year = item.release_date ? new Date(item.release_date).getFullYear() :
                   item.first_air_date ? new Date(item.first_air_date).getFullYear() : '';
        const posterUrl = item.poster_path ? `${TMDB_IMAGE_BASE_URL}${item.poster_path}` : '';

        const mediaIcon = item.media_type === 'movie' ? 'fas fa-film' : 'fas fa-tv';

        div.innerHTML = `
            ${posterUrl ? `<img src="${posterUrl}" alt="${title}" class="result-poster" onerror="this.style.display='none'">` : '<div class="result-poster"></div>'}
            <div class="result-info">
                <div class="result-title">${title}</div>
                <div class="result-meta">
                    <i class="fas fa-calendar"></i> ${year}
                    <span class="result-type ${item.media_type}">
                        <i class="${mediaIcon}"></i>
                        ${item.media_type === 'movie' ? 'Movie' : 'TV Show'}
                    </span>
                </div>
            </div>
        `;

        div.addEventListener('click', () => selectContent(item));
        return div;
    }

    async function selectContent(item) {
        currentSelection = item;
        elements.searchResults.style.display = 'none';

        const title = item.title || item.name;
        const year = item.release_date ? new Date(item.release_date).getFullYear() :
                   item.first_air_date ? new Date(item.first_air_date).getFullYear() : '';

        const mediaIcon = item.media_type === 'movie' ? 'fas fa-film' : 'fas fa-tv';

        elements.selectedTitle.innerHTML = `<i class="${mediaIcon}"></i> ${title}`;
        elements.selectedMeta.innerHTML = `
            <i class="fas fa-calendar"></i> ${year}
            <i class="fas fa-tag"></i> ${item.media_type === 'movie' ? 'Movie' : 'TV Show'}
            <i class="fas fa-database"></i> TMDB ID: ${item.id}
        `;
        elements.selectedContent.classList.add('show');

        if (item.media_type === 'tv') {
            await loadTVShowDetails(item.id);
            elements.seasonEpisodeControls.classList.add('show');
        } else {
            elements.seasonEpisodeControls.classList.remove('show');
            tvShowDetails = null;
        }

        loadSelectedContent();
    }

    async function loadTVShowDetails(tvId) {
        try {
            tvShowDetails = await getTVShowDetails(tvId, TMDB_API_KEY);
            populateSeasonDropdown();
        } catch (error) {
            console.error('Error loading TV show details:', error);

            populateBasicSeasonDropdown();
        }
    }

    async function getTVShowDetails(tvId, apiKey) {
        const url = `${TMDB_BASE_URL}/tv/${tvId}?api_key=${apiKey}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to fetch TV show details: ${response.status}`);
        }

        return await response.json();
    }

    async function getSeasonDetails(tvId, seasonNumber, apiKey) {
        const url = `${TMDB_BASE_URL}/tv/${tvId}/season/${seasonNumber}?api_key=${apiKey}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to fetch season details: ${response.status}`);
        }

        return await response.json();
    }

    function populateSeasonDropdown() {
        const seasonSelect = elements.seasonSelect;
        seasonSelect.innerHTML = '';

        if (tvShowDetails && tvShowDetails.seasons) {
            const currentDate = new Date();

            const releasedSeasons = tvShowDetails.seasons.filter(season => {
                if (season.season_number <= 0) return false;

                if (season.air_date) {
                    const seasonDate = new Date(season.air_date);
                    return seasonDate <= currentDate;
                }

                return true;
            });

            releasedSeasons.forEach(season => {
                const option = document.createElement('option');
                option.value = season.season_number;
                option.textContent = `Season ${season.season_number}`;
                seasonSelect.appendChild(option);
            });

            if (releasedSeasons.length > 0) {
                handleSeasonChange();
            } else {
                populateBasicSeasonDropdown();
            }
        } else {
            populateBasicSeasonDropdown();
        }
    }

    function populateBasicSeasonDropdown() {
        const seasonSelect = elements.seasonSelect;
        seasonSelect.innerHTML = '';
        for (let i = 1; i <= 10; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `Season ${i}`;
            seasonSelect.appendChild(option);
        }
        handleSeasonChange();
    }

    async function handleSeasonChange() {
        const selectedSeason = parseInt(elements.seasonSelect.value);
        const episodeSelect = elements.episodeSelect;
        episodeSelect.innerHTML = '';

        let episodeCount = 20;
        if (tvShowDetails && tvShowDetails.seasons) {
            const seasonData = tvShowDetails.seasons.find(s => s.season_number === selectedSeason);
            if (seasonData) {
                episodeCount = seasonData.episode_count;
            }
        }

        try {
            const seasonDetails = await getSeasonDetails(currentSelection.id, selectedSeason, TMDB_API_KEY);
            if (seasonDetails && seasonDetails.episodes) {
                const currentDate = new Date();
                const releasedEpisodes = seasonDetails.episodes.filter(episode => {
                    if (!episode.air_date) return false;
                    const episodeDate = new Date(episode.air_date);
                    return episodeDate <= currentDate;
                });

                releasedEpisodes.forEach(episode => {
                    const option = document.createElement('option');
                    option.value = episode.episode_number;
                    option.textContent = `Episode ${episode.episode_number}`;
                    episodeSelect.appendChild(option);
                });

                if (releasedEpisodes.length === 0) {

                    for (let i = 1; i <= Math.min(episodeCount, 1); i++) {
                        const option = document.createElement('option');
                        option.value = i;
                        option.textContent = `Episode ${i}`;
                        episodeSelect.appendChild(option);
                    }
                }
            } else {

                for (let i = 1; i <= episodeCount; i++) {
                    const option = document.createElement('option');
                    option.value = i;
                    option.textContent = `Episode ${i}`;
                    episodeSelect.appendChild(option);
                }
            }
        } catch (error) {

            for (let i = 1; i <= episodeCount; i++) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = `Episode ${i}`;
                episodeSelect.appendChild(option);
            }
        }
    }

    function handleEpisodeChange() {

        loadSelectedContent();
    }

    function loadSelectedContent() {
    if (!currentSelection) return;

    const introPlayer = document.getElementById('introPlayer');
    const mainPlayer = elements.playerIframe;
    const introOverlay = document.getElementById('introOverlay');

    let embedUrl;
    if (currentSelection.media_type === 'tv') {
        const season = elements.seasonSelect.value || '1';
        const episode = elements.episodeSelect.value || '1';
        embedUrl = `https://vidsrc.xyz/embed/tv?tmdb=${currentSelection.id}&season=${season}&episode=${episode}`;
    } else {
        embedUrl = `https://vidsrc.xyz/embed/movie/${currentSelection.id}`;
    }

    introPlayer.style.display = 'block';
    mainPlayer.style.display = 'none';
    introOverlay.style.display = 'flex';

    const YOUTUBE_VIDEO_ID = '4lzYN-0XsyI';
    introPlayer.src = `https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1&mute=1&controls=0&rel=0&modestbranding=1`;

    setTimeout(() => {
        introPlayer.style.display = 'none';
        introPlayer.src = '';
        mainPlayer.style.display = 'block';
        mainPlayer.src = embedUrl;
        introOverlay.style.display = 'none';
    }, 15000);
}

    function handleSearchEnter(event) {
        if (event.key === 'Enter') {
            handleSearch();
        }
    }

    function showError(message) {
        elements.errorMessage.querySelector('span').textContent = message;
        elements.errorMessage.style.display = 'flex';
    }

    function hideError() {
        elements.errorMessage.style.display = 'none';
    }

    function toggleFullscreen() {
        const iframe = elements.playerIframe;
        if (iframe.requestFullscreen) {
            iframe.requestFullscreen();
        } else if (iframe.webkitRequestFullscreen) {
            iframe.webkitRequestFullscreen();
        } else if (iframe.msRequestFullscreen) {
            iframe.msRequestFullscreen();
        }
    }

    function initialize() {
        initializeEventListeners();
        hideError();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

    setTimeout(initialize, 100);
    window.addEventListener('load', initialize);

})();
