document.getElementById('searchButton').addEventListener('click', () => {
    const query = document.getElementById('searchInput').value;
    if (query) {
        searchContent(query);
    }
});

document.getElementById('searchInput').addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        const query = document.getElementById('searchInput').value;
        if (query) {
            searchContent(query);
        }
    }
});

document.getElementById('prevSeason').addEventListener('click', () => changeSeason(-1));
document.getElementById('nextSeason').addEventListener('click', () => changeSeason(1));
document.getElementById('prevEpisode').addEventListener('click', () => changeEpisode(-1));
document.getElementById('nextEpisode').addEventListener('click', () => changeEpisode(1));

document.getElementById('seasonInput').addEventListener('change', () => updateSeason());
document.getElementById('episodeInput').addEventListener('change', () => updateEpisode());

let currentTmdbId = '';
let currentSeason = 1;
let currentEpisode = 1;

function searchContent(query) {
    const type = document.getElementById('typeSelector').value;
    const apiKey = 'e2e05b26a02be183714d56f9ad0d0900';
    const url = `https://api.themoviedb.org/3/search/${type}?api_key=${apiKey}&query=${encodeURIComponent(query)}`;

    const playerContainer = document.getElementById('player');
    playerContainer.style.display = 'none';
    playerContainer.innerHTML = '';
    document.getElementById('imdbIdDisplay').textContent = '';
    hideEpisodeControls();

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            if (data.results.length === 0) {
                displayNoResults();
            } else {
                displayResults(data.results);
            }
        })
        .catch(error => console.error('Error:', error));
}

function displayResults(results) {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '';

    results.forEach(result => {
        const resultItem = document.createElement('div');
        resultItem.classList.add('result-item');

        const poster = document.createElement('img');
        poster.src = result.poster_path ? `https://image.tmdb.org/t/p/w200${result.poster_path}` : 'https://via.placeholder.com/150';
        poster.alt = result.title || result.name;

        const title = document.createElement('h2');
        title.textContent = result.title || result.name;

        const overview = document.createElement('p');
        overview.textContent = result.overview;

        poster.dataset.tmdbId = result.id;
        poster.addEventListener('click', () => {
            displayTmdbId(result.id);
            currentTmdbId = result.id;
            const type = document.getElementById('typeSelector').value;
            if (type === 'tv') {
                showEpisodeControls();
                embedTvShow(result.id, 1, 1);
            } else {
                hideEpisodeControls();
                embedMovie(result.id);
            }
        });

        resultItem.appendChild(poster);
        resultItem.appendChild(title);
        resultItem.appendChild(overview);
        resultsContainer.appendChild(resultItem);
    });
}

function updateContentInfo(title, season = null, episode = null) {
    const contentInfo = document.getElementById('currentContentInfo');
    if (season !== null && episode !== null) {
        contentInfo.textContent = `${title} - Temporada ${season}, Episodio ${episode}`;
    } else {
        contentInfo.textContent = title;
    }
}

function embedMovie(tmdbId) {
    fetchContentDetails(tmdbId).then(imdbId => {
        if (imdbId) {
            const embedUrl = `https://vidsrc.me/embed/movie/${imdbId}`;
            const playerContainer = document.getElementById('player');
            playerContainer.innerHTML = `<iframe id="videoPlayer" src="${embedUrl}" width="800" height="450" frameborder="0" allowfullscreen referrerpolicy="origin"></iframe>`;
            playerContainer.style.display = 'block';

            const resultsContainer = document.getElementById('results');
            resultsContainer.innerHTML = '';

            // Actualizar el título de la película
            const title = document.querySelector(`img[data-tmdb-id="${tmdbId}"]`).alt;
            updateContentInfo(title);

            monitorIframe();
        } else {
            console.error('No se pudo obtener el ID de IMDb.');
        }
    });
}

function embedTvShow(tmdbId, season, episode) {
    const embedUrl = `https://vidsrc.me/embed/tv/${tmdbId}/${season}/${episode}`;
    const playerContainer = document.getElementById('player');
    playerContainer.innerHTML = `<iframe id="videoPlayer" src="${embedUrl}" width="800" height="450" frameborder="0" allowfullscreen referrerpolicy="origin"></iframe>`;
    playerContainer.style.display = 'block';

    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '';

    // Actualizar el título de la serie y la información de temporada/episodio
    const title = document.querySelector(`img[data-tmdb-id="${tmdbId}"]`).alt;
    updateContentInfo(title, season, episode);

    currentSeason = season;
    currentEpisode = episode;
    document.getElementById('seasonInput').value = season;
    document.getElementById('episodeInput').value = episode;

    monitorIframe();
}


function changeSeason(change) {
    const newSeason = currentSeason + change;
    if (newSeason >= 1) {
        currentSeason = newSeason;
        currentEpisode = 1;
        document.getElementById('seasonInput').value = currentSeason;
        document.getElementById('episodeInput').value = currentEpisode;

        const title = document.querySelector(`img[data-tmdb-id="${currentTmdbId}"]`).alt;
        updateContentInfo(title, currentSeason, currentEpisode);

        embedTvShow(currentTmdbId, currentSeason, currentEpisode);
    }
}

function changeEpisode(change) {
    const newEpisode = currentEpisode + change;
    if (newEpisode >= 1) {
        currentEpisode = newEpisode;
        document.getElementById('episodeInput').value = currentEpisode;

        const title = document.querySelector(`img[data-tmdb-id="${currentTmdbId}"]`).alt;
        updateContentInfo(title, currentSeason, currentEpisode);

        embedTvShow(currentTmdbId, currentSeason, currentEpisode);
    }
}
// Resto del código JavaScript (sin cambios)
