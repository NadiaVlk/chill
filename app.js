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

// Resto del código JavaScript (sin cambios)
