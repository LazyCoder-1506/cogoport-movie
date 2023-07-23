const apiKey = '6bf832'; // Replace with your OMDB API key

const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const moviesContainer = document.getElementById('moviesContainer');
const pagination = document.getElementById('pagination');
const modal = document.getElementById('modal');
const movieDetails = document.getElementById('movieDetails');
const closeBtn = document.getElementById('closeBtn');

const movieTitleElement = document.getElementById('movieTitle');
const ratingElement = document.getElementById('rating');
const commentElement = document.getElementById('comment');
const submitBtn = document.getElementById('submitBtn');

let ratedMovies = {};

let currentPage = 1;
let totalPages = 1;
let imdbID = '';

searchBtn.addEventListener('click', () => {
    currentPage = 1;
    searchMovies();
});

function searchMovies() {
    const searchTerm = searchInput.value;
    const url = `http://www.omdbapi.com/?apikey=${apiKey}&s=${searchTerm}&page=${currentPage}`;

    fetch(url)
        .then((response) => response.json())
        .then((data) => {
            totalPages = Math.ceil(data.totalResults / 10);
            displayMovies(data.Search);
            displayPagination();
        })
        .catch((error) => console.error('Error fetching data:', error));
}

function displayMovies(movies) {
    moviesContainer.innerHTML = '';

    movies.forEach((movie) => {
        const movieElement = document.createElement('div');
        movieElement.classList.add('movie');
        movieElement.innerHTML = `
            <img src="${movie.Poster}" alt="${movie.Title}">
            <p>${movie.Title}</p>
        `;

        movieElement.addEventListener('click', () => showMovieDetails(movie.imdbID));

        moviesContainer.appendChild(movieElement);
    });
}

function displayPagination() {
    pagination.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const pageLink = document.createElement('span');
        pageLink.classList.add('page-link');
        pageLink.innerText = i;

        if (i === currentPage) {
            pageLink.classList.add('active');
        }

        pageLink.addEventListener('click', () => {
            currentPage = i;
            searchMovies();
        });

        pagination.appendChild(pageLink);
    }
}

function showMovieDetails(id) {
    imdbID = id; 
    const url = `http://www.omdbapi.com/?apikey=${apiKey}&i=${imdbID}`;

    fetch(url)
        .then((response) => response.json())
        .then((data) => {
            const { Title, Year, Plot, Poster } = data;
            movieDetails.innerHTML = `
                <h2>${Title} (${Year})</h2>
                <p>${Plot}</p>
                <img src="${Poster}" alt="${Title}">
            `;
            modal.style.display = 'block';
        })
        .catch((error) => console.error('Error fetching movie details:', error));
}

closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

// Close modal when clicking outside the content
window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

// Initial search on page load (you can replace this with a default search)
// searchMovies();


submitBtn.addEventListener('click', () => {
    const rating = parseInt(ratingElement.value);
    const comment = commentElement.value.trim();

    if (!imdbID || isNaN(rating) || rating < 1 || rating > 5 || comment === '') {
        alert('Please provide a valid rating (1-5) and a comment.');
        return;
    }

    // Store the rating and comment in local storage
    if (!ratedMovies[imdbID]) {
        ratedMovies[imdbID] = [];
    }
    ratedMovies[imdbID].push({ rating, comment });
    localStorage.setItem('ratedMovies', JSON.stringify(ratedMovies));

    // Clear the input fields
    ratingElement.value = '';
    commentElement.value = '';

    // Update the display with the new rating and comment
    updateMovieDetails(imdbID);
});

function updateMovieDetails(imdbID) {
    const url = `http://www.omdbapi.com/?apikey=${apiKey}&i=${imdbID}`;

    fetch(url)
        .then((response) => response.json())
        .then((data) => {
            const { Title, Year, Plot, Poster } = data;
            movieTitleElement.textContent = `${Title} (${Year})`;
            movieDetails.dataset.imdbID = imdbID;

            // Check if the movie has any ratings and comments
            const movieRatings = ratedMovies[imdbID];
            if (movieRatings && movieRatings.length > 0) {
                const averageRating = calculateAverageRating(movieRatings);
                movieTitleElement.textContent += ` - Avg. Rating: ${averageRating.toFixed(1)}`;
            }

            // Display the movie poster
            document.getElementById('moviePoster').innerHTML = `<img src="${Poster}" alt="${Title}">`;

            // Create the HTML for the ratings and comments
            const commentsHtml = movieRatings
                ? movieRatings.map(({ rating, comment }) => `<p>Rating: ${rating}, Comment: ${comment}</p>`).join('')
                : '';

            const movieDetailsHtml = `
                <p>${Plot}</p>
                ${commentsHtml}
            `;
            movieDetails.innerHTML = movieDetailsHtml;
        })
        .catch((error) => console.error('Error fetching movie details:', error));
}

function calculateAverageRating(ratings) {
    const totalRating = ratings.reduce((sum, { rating }) => sum + rating, 0);
    return totalRating / ratings.length;
}

// ... (Existing code) ...

// Handle the case where user submits the rating and comment before searching
if (localStorage.getItem('ratedMovies')) {
    ratedMovies = JSON.parse(localStorage.getItem('ratedMovies'));
}

// ... (Existing code) ...
