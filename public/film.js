
const API_URL = 'window.location.origin;';
const cultureContainer = document.getElementById("cultureFilms")
const educationContainer = document.getElementById("educationFilms")
const politicsContainer = document.getElementById("politicalFilms")
const relationshipsContainer = document.getElementById("relationshipFilms")
const parentingContainer = document.getElementById("parentingFilms")
const warsContainer = document.getElementById("warFilms")
const handoverContainer = document.getElementById("handoverFilms")
const recentContainer = document.getElementById("recents")
const recentLow = document.getElementById("recentLow")

async function findMovies() {
    try {
        const response = await fetch(`${API_URL}/api/findMoviePoster`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });
        if (response.ok) {
            const movies = await response.json();
            displayMovies(movies.results)
        }
        else {
            const errorText = await response.json()
            console.error("Error fetching movie ", errorText);
        }
    }
    catch (error) {
        console.error("Network error ", error);
        throw error
    }
}

function displayMovies(movies) {

    cultureContainer.innerHTML = '';
    educationContainer.innerHTML = '';
    politicsContainer.innerHTML = '';
    relationshipsContainer.innerHTML = '';
    parentingContainer.innerHTML = '';
    warsContainer.innerHTML = '';
    handoverContainer.innerHTML = '';
    recentContainer.innerHTML = '';
    recentLow.innerHTML = '';

    if (!movies || movies.length === 0) {
        recentContainer.innerHTML = "No movies available";
        return;
    }

    const latestMovie = movies[0];
    const remainingMovies = movies.slice(1);
    displayRecents(latestMovie, remainingMovies);

    remainingMovies.forEach((movie) => {
        CreateMovieCard(movie);
    });
}


function CreateMovieCard(movie) {
    const MovieCard = document.createElement("div");
    MovieCard.classList.add("MovieCard");

    MovieCard.innerHTML = `
    <div>
        <img src="${movie.moviePoster}" title="${movie.title}">
        <h3 class="movie-title">${movie.title}</h3>
        <h5 class="viewers">${movie.age}</h5>
        <p class="runtime">${movie.runtime}</p>
        
    </div>
    `;
    if (movie.topic === "culture") {
        cultureContainer.appendChild(MovieCard)
    }
    else if (movie.topic === "education") {
        educationContainer.appendChild(MovieCard)
    }
    else if (movie.topic === "politics") {
        politicsContainer.appendChild(MovieCard)
    }
    else if (movie.topic === "relationships") {
        relationshipsContainer.appendChild(MovieCard)
    }
    else if (movie.topic === "parenting") {
        parentingContainer.appendChild(MovieCard)
    }
    else if (movie.topic === "war") {
        warsContainer.appendChild(MovieCard)
    }
    else if (movie.topic === "handover") {
        handoverContainer.appendChild(MovieCard)
    }
    else {
        /* no category*/

    }
};

function createRecentCard(movie, isMain) {
    const card = document.createElement("div");
    card.classList.add("recent-card");
    if (isMain) card.classList.add("main");
    card.innerHTML = `
        <img src="${movie.moviePoster}" title="${movie.title}">
        <h3>${movie.title}</h3>
    `;

    return card;
}

function displayRecents(latestMovie, remainingMovies) {
    recentContainer.innerHTML = "";
    const topRow = document.createElement("div");
    topRow.classList.add("recent-top");

    const bottomRow = document.createElement("div");
    bottomRow.classList.add("recent-bottom");
    const mainCard = createRecentCard(latestMovie, true);
    topRow.appendChild(mainCard);
    remainingMovies.slice(0, 7).forEach(movie => {
        const card = createRecentCard(movie, false);
        bottomRow.appendChild(card);
                
    });

    recentContainer.appendChild(topRow);
    recentContainer.appendChild(bottomRow);
}

document.addEventListener("DOMContentLoaded", async () => {
    await findMovies()
})