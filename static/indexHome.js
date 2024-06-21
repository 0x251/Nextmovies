function toggleNav() {
    const nav = document.querySelector('.modern-nav');
    const navItems = document.getElementById('nav-items');
    const brandName = document.getElementById('brand-name');
    const searchBar = document.querySelector('.search-bar');
    if (nav.style.width === '120px' || nav.style.width === '') {
        nav.style.width = '256px';
        setTimeout(() => {
            navItems.style.opacity = '1';
            nav.style.backgroundColor = '#0c0b14';
            searchBar.style.opacity = '1';
            brandName.innerHTML = '<span style="color: #0998e5;">NEXT</span>MOVIES';
        }, 300);
    } else {
        nav.style.width = '120px';
        setTimeout(() => {
            navItems.style.opacity = '0';
            nav.style.backgroundColor = '#09080f';
            brandName.innerHTML = '<span style="color: #0998e5;">NX</span>M';
            searchBar.style.opacity = '0';
        }, 300);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    if (mobileCheck()) {
        const collapseBtn = document.querySelector('.collapse-btn');
        if (collapseBtn) {
            collapseBtn.remove();
        }
    }
    const searchInput = document.getElementById('search');
    const movieLists = document.querySelectorAll('.movie-list');
    const categoryDropdown = document.getElementById('categories-dropdown');
    const yearDropdown = document.getElementById('year-dropdown');
    let typingTimer;
    const typingInterval = 900; 

   
    const categories = [
        { id: 28, name: 'Action' },
        { id: 12, name: 'Adventure' },
        { id: 16, name: 'Animation' },
        { id: 35, name: 'Comedy' },
        { id: 80, name: 'Crime' },
        { id: 99, name: 'Documentary' },
        { id: 18, name: 'Drama' },
        { id: 10751, name: 'Family' },
        { id: 14, name: 'Fantasy' },
        { id: 36, name: 'History' },
        { id: 27, name: 'Horror' },
        { id: 10402, name: 'Music' },
        { id: 9648, name: 'Mystery' },
        { id: 10749, name: 'Romance' },
        { id: 878, name: 'Science Fiction' },
        { id: 10770, name: 'TV Movie' },
        { id: 53, name: 'Thriller' },
        { id: 10752, name: 'War' },
        { id: 37, name: 'Western' }
    ];
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        categoryDropdown.appendChild(option);
    });

  
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= 1900; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearDropdown.appendChild(option);
    }
    function fetchMovies(query, category, year, page = 1) {
        let url = `https://api.themoviedb.org/3/discover/movie?api_key=0ae47aadd2d85a324c238972cedab662&sort_by=popularity.desc&page=${page}`;
        if (query) {
            url = `https://api.themoviedb.org/3/search/movie?api_key=0ae47aadd2d85a324c238972cedab662&query=${query}&page=${page}`;
        } else {
            if (category) {
                url += `&with_genres=${category}`;
            }
            if (year) {
                url += `&year=${year}`;
            }
        }
        
        return fetch(url)
            .then(response => response.json());
    }

    function updateMovieList(data) {
        const movieList = document.getElementById('new-movies');
        movieLists.forEach(list => {
            while (list.firstChild) {
                list.removeChild(list.firstChild);
            }
        });
        data.results.forEach(movie => {
            if (movie.poster_path && movie.overview) {
                const movieItem = document.createElement('div');
                movieItem.className = 'movie-item';
                const shortDescription = mobileCheck() 
                    ? (movie.overview.length > 30 ? movie.overview.substring(0, 45) + '...' : movie.overview)
                    : (movie.overview.length > 160 ? movie.overview.substring(0, 160) + '...' : movie.overview);
                const genreNames = mobileCheck() 
                    ? movie.genre_ids.slice(0, 1).map(id => getGenreName(id)).join(', ')
                    : movie.genre_ids.map(id => getGenreName(id)).join(', ');
                const movieYear = new Date(movie.release_date).getFullYear();
                movieItem.innerHTML = `
                    <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title} Poster" style="height: ${mobileCheck() ? '290px' : 'auto'}; max-width: 100%;">
                    <div class="movie-description-container" style="height: ${mobileCheck() ? '290px' : '260px'}; display: flex; flex-direction: column; justify-content: space-between; margin-bottom: 20px;">
                        <div>
                            <div class="movie-title">${mobileCheck() && movie.title.length > 12 ? movie.title.substring(0, 12) + '...' : movie.title}</div>
                            <div class="movie-description" style="font-size: ${mobileCheck() ? '16px' : '20px'};">${shortDescription}</div>
                            <div class="movie-category">${genreNames} (${movieYear})</div>
                        </div>
                        <div class="movie-rating" style="font-size: ${mobileCheck() ? '20px' : '24px'};">${mobileCheck() ? '' : 'Rating: '}${'★'.repeat(Math.round(movie.vote_average / 2))}${'☆'.repeat(5 - Math.round(movie.vote_average / 2))}</div>
                    </div>
                `;
                movieList.appendChild(movieItem);
            }
        });
        setTimeout(() => {
            movieLists.forEach(list => list.classList.remove('loading'));
            document.body.style.overflow = 'auto';
        }, 1200);
    }

    searchInput.addEventListener('input', function() {
        clearTimeout(typingTimer);
        typingTimer = setTimeout(() => {
            const query = searchInput.value.trim();
            const category = categoryDropdown.value;
            const year = yearDropdown.value;
            movieLists.forEach(list => list.classList.add('loading'));
            document.body.style.overflow = 'hidden';
            window.scrollTo(0, 0);

            if (query.length > 0) {
                fetchMovies(query, category, year)
                    .then(data => updateMovieList(data))
                    .catch(error => {
                        console.error('Error searching movies:', error);
                        setTimeout(() => {
                            movieLists.forEach(list => list.classList.remove('loading'));
                            document.body.style.overflow = 'auto';
                        }, 1200);
                    });
            } else {
                fetchMovies('', category, year)
                    .then(data => updateMovieList(data))
                    .catch(error => {
                        console.error('Error fetching movies:', error);
                        setTimeout(() => {
                            movieLists.forEach(list => list.classList.remove('loading'));
                            document.body.style.overflow = 'auto';
                        }, 1200);
                    });
            }
        }, typingInterval);
    });

    function updateAllMovieLists(page = 1) {
        const query = searchInput.value.trim();
        const category = categoryDropdown.value;
        const year = yearDropdown.value;
        movieLists.forEach(list => list.classList.add('loading'));
        document.body.style.overflow = 'hidden';
        window.scrollTo(0, 0);

        fetchMovies(query, category, year, page)
            .then(data => updateMovieList(data))
            .catch(error => {
                console.error('Error searching movies:', error);
                setTimeout(() => {
                    movieLists.forEach(list => list.classList.remove('loading'));
                    document.body.style.overflow = 'auto';
                }, 1200);
            });
    }

    categoryDropdown.addEventListener('change', function() {
        updateAllMovieLists();
        resetPagination();
    });
    yearDropdown.addEventListener('change', function() {
        updateAllMovieLists();
        resetPagination();
    });

    function resetPagination() {
        const paginationButtons = document.querySelector('.pagination-buttons');
        while (paginationButtons.firstChild) {
            paginationButtons.removeChild(paginationButtons.firstChild);
        }
        const firstPageButton = document.createElement('button');
        firstPageButton.className = 'pagination-number active';
        firstPageButton.textContent = '1';
        firstPageButton.onclick = () => goToPage(1);
        paginationButtons.appendChild(firstPageButton);
    }
});

function updateMovies(movieListId, count, page = 1, offset = 0) {
    const movieList = document.getElementById(movieListId);
    const category = document.getElementById('categories-dropdown').value;
    const year = document.getElementById('year-dropdown').value;
    while (movieList.firstChild) {
        movieList.removeChild(movieList.firstChild);
    }
    fetch(`https://api.themoviedb.org/3/movie/popular?api_key=0ae47aadd2d85a324c238972cedab662&page=${page}`)
        .then(response => response.json())
        .then(data => {
            const movies = data.results.slice(offset, offset + count);
            const moviePromises = movies.map((movie, index) => {
                return new Promise((resolve, reject) => {
                    if (movie.poster_path && movie.overview) {
                        const movieItem = document.createElement('div');
                        movieItem.className = 'movie-item';
                        const shortDescription = mobileCheck() 
                        ? (movie.overview.length > 30 ? movie.overview.substring(0, 45) + '...' : movie.overview)
                        : (movie.overview.length > 160 ? movie.overview.substring(0, 160) + '...' : movie.overview);
                        
                        const genreNames = mobileCheck() 
                            ? movie.genre_ids.slice(0, 1).map(id => getGenreName(id)).join(', ')
                            : movie.genre_ids.map(id => getGenreName(id)).join(', ');
                        const movieYear = new Date(movie.release_date).getFullYear();
                        movieItem.innerHTML = `
                            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title} Poster" style="height: ${mobileCheck() ? '290px' : 'auto'}; max-width: 100%;">
                            <div class="movie-description-container" style="height: ${mobileCheck() ? '290px' : '260px'}; display: flex; flex-direction: column; justify-content: space-between;">
                                <div>
                                    <div class="movie-title">${mobileCheck() && movie.title.length > 12 ? movie.title.substring(0, 12) + '...' : movie.title}</div>
                                    <div class="movie-description" style="font-size: ${mobileCheck() ? '16px' : '20px'};">${shortDescription}</div>
                                    <div class="movie-category">${genreNames} (${movieYear})</div>
                                </div>
                                <div class="movie-rating" style="font-size: ${mobileCheck() ? '20px' : '24px'};">${mobileCheck() ? '' : 'Rating: '}${'★'.repeat(Math.round(movie.vote_average / 2))}${'☆'.repeat(5 - Math.round(movie.vote_average / 2))}</div>
                                </div>
                            `;
                        const img = movieItem.querySelector('img');
                        img.onload = () => resolve(movieItem);
                        img.onerror = reject;
                    } else {
                        resolve(null);
                    }
                });
            });

            Promise.all(moviePromises)
                .then(movieItems => {
                    movieItems.forEach(movieItem => {
                        if (movieItem) {
                            movieList.appendChild(movieItem);
                        }
                    });
                    
                    movieList.classList.remove('loading');
                })
                .catch(error => console.error('Error loading movies:', error));
        })
        .catch(error => console.error('Error loading movies:', error));
}

function nextPage() {
    const activePage = document.querySelector('.pagination-number.active');
    const movieLists = document.querySelectorAll('.movie-list');
    const category = document.getElementById('categories-dropdown').value;
    const year = document.getElementById('year-dropdown').value;
    movieLists.forEach(list => list.classList.add('loading'));
    document.body.style.overflow = 'hidden';
    window.scrollTo(0, 0);

    setTimeout(() => {
        movieLists.forEach(list => list.classList.remove('loading'));
        document.body.style.overflow = 'auto';
        let nextPageNumber;
        if (activePage) {
            nextPageNumber = parseInt(activePage.textContent) + 1;
            updateMovies('new-movies', 4, nextPageNumber, 0);
            updateMovies('top-movies', 4, nextPageNumber, 4);
            updateMovies('upcoming-movies', 4, nextPageNumber, 8);
            activePage.classList.remove('active');
            let nextPageButton = activePage.nextElementSibling;
            if (!nextPageButton || !nextPageButton.classList.contains('pagination-number')) {
                nextPageButton = document.createElement('button');
                nextPageButton.className = 'pagination-number';
                nextPageButton.textContent = nextPageNumber;
                nextPageButton.onclick = () => goToPage(nextPageNumber);
                activePage.parentNode.insertBefore(nextPageButton, activePage.nextElementSibling);
            }
            nextPageButton.classList.add('active');
        } else {
            nextPageNumber = 2;
            updateMovies('new-movies', 4, nextPageNumber, 0);
            updateMovies('top-movies', 4, nextPageNumber, 4);
            updateMovies('upcoming-movies', 4, nextPageNumber, 8);
            const nextPageButton = document.createElement('button');
            nextPageButton.className = 'pagination-number active';
            nextPageButton.textContent = nextPageNumber;
            nextPageButton.onclick = () => goToPage(nextPageNumber);
            document.querySelector('.pagination-buttons').appendChild(nextPageButton);
        }
        fetchMovies('', category, year, nextPageNumber)
            .then(data => updateMovieList(data))
            .catch(error => {
                console.error('Error fetching movies:', error);
                setTimeout(() => {
                    movieLists.forEach(list => list.classList.remove('loading'));
                    document.body.style.overflow = 'auto';
                }, 1200);
            });
    }, 1300);
}

function previousPage() {
    const activePage = document.querySelector('.pagination-number.active');
    const category = document.getElementById('categories-dropdown').value;
    const year = document.getElementById('year-dropdown').value;
    if (activePage) {
        const previousPageNumber = parseInt(activePage.textContent) - 1;
        updateMovies('new-movies', 4, previousPageNumber, 0);
        updateMovies('top-movies', 4, previousPageNumber, 4);
        updateMovies('upcoming-movies', 4, previousPageNumber, 8);
        activePage.classList.remove('active');
        activePage.previousElementSibling.classList.add('active');
        fetchMovies('', category, year, previousPageNumber)
            .then(data => updateMovieList(data))
            .catch(error => {
                console.error('Error fetching movies:', error);
                setTimeout(() => {
                    movieLists.forEach(list => list.classList.remove('loading'));
                    document.body.style.overflow = 'auto';
                }, 1200);
            });
    }
}

function goToPage(pageNumber) {
    const movieLists = document.querySelectorAll('.movie-list');
    const category = document.getElementById('categories-dropdown').value;
    const year = document.getElementById('year-dropdown').value;
    movieLists.forEach(list => list.classList.add('loading'));
    document.body.style.overflow = 'hidden';
    window.scrollTo(0, 0);

    updateMovies('new-movies', 4, pageNumber, 0);
    updateMovies('top-movies', 4, pageNumber, 4);
    updateMovies('upcoming-movies', 4, pageNumber, 8);
    const activePage = document.querySelector('.pagination-number.active');
    if (activePage) {
        activePage.classList.remove('active');
    }
    const targetPage = document.querySelectorAll('.pagination-number')[pageNumber - 1];
    if (targetPage) {
        targetPage.classList.add('active');
    }

    fetchMovies('', category, year, pageNumber)
        .then(data => updateMovieList(data))
        .catch(error => {
            console.error('Error fetching movies:', error);
            setTimeout(() => {
                movieLists.forEach(list => list.classList.remove('loading'));
                document.body.style.overflow = 'auto';
            }, 1200);
        });

    setTimeout(() => {
        movieLists.forEach(list => list.classList.remove('loading'));
        document.body.style.overflow = 'auto';
    }, 1200);
}

document.addEventListener('DOMContentLoaded', function() {
    const movieLists = document.querySelectorAll('.movie-list');
    movieLists.forEach(list => list.classList.add('loading'));
    document.body.style.overflow = 'hidden';
    window.scrollTo(0, 0);

    fetch('https://api.themoviedb.org/3/movie/now_playing?api_key=0ae47aadd2d85a324c238972cedab662')
        .then(response => response.json())
        .then(data => {
            const movies = data.results;
            const newMovies = document.getElementById('new-movies');
            const topMovies = document.getElementById('top-movies');
            const upcomingMovies = document.getElementById('upcoming-movies');

            const moviePromises = movies.map((movie, index) => {
                return new Promise((resolve, reject) => {
                    if (movie.poster_path && movie.overview) {
                        const movieItem = document.createElement('div');
                        movieItem.className = 'movie-item ';
                        const shortDescription = mobileCheck() 
                        ? (movie.overview.length > 30 ? movie.overview.substring(0, 45) + '...' : movie.overview)
                        : (movie.overview.length > 160 ? movie.overview.substring(0, 160) + '...' : movie.overview);
                        
                        const genreNames = mobileCheck() 
                            ? movie.genre_ids.slice(0, 1).map(id => getGenreName(id)).join(', ')
                            : movie.genre_ids.map(id => getGenreName(id)).join(', ');
                        const movieYear = new Date(movie.release_date).getFullYear();
                        movieItem.innerHTML = `
                            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title} Poster" style="height: ${mobileCheck() ? '290px' : 'auto'}; max-width: 100%;">
                            <div class="movie-description-container" style="height: ${mobileCheck() ? '290px' : '260px'}; display: flex; flex-direction: column; justify-content: space-between;">
                                <div>
                                    <div class="movie-title">${mobileCheck() && movie.title.length > 12 ? movie.title.substring(0, 12) + '...' : movie.title}</div>
                                    <div class="movie-description" style="font-size: ${mobileCheck() ? '16px' : '20px'};">${shortDescription}</div>
                                    <div class="movie-category">${genreNames} (${movieYear})</div>
                                </div>
                                <div class="movie-rating" style="font-size: ${mobileCheck() ? '20px' : '24px'};">${mobileCheck() ? '' : 'Rating: '}${'★'.repeat(Math.round(movie.vote_average / 2))}${'☆'.repeat(5 - Math.round(movie.vote_average / 2))}</div>
                                </div>
                            
                            `;

                        const img = movieItem.querySelector('img');
                        

                        img.onload = () => resolve({ movieItem, index });
                        img.onerror = reject;
                        
                    } else {
                        resolve(null);
                    }
                });
            });

            Promise.all(moviePromises)
                .then(movieItems => {
                    movieItems.forEach(({ movieItem, index }) => {
                        if (movieItem) {
                            if (index < 4) {
                                newMovies.appendChild(movieItem);
                            } else if (index >= 4 && index < 8) {
                                topMovies.appendChild(movieItem);
                            } else if (index >= 8 && index < 12) {
                                upcomingMovies.appendChild(movieItem);
                            }
                        }
                    });
                    setTimeout(() => {
                        newMovies.classList.remove('loading');
                        topMovies.classList.remove('loading');
                        upcomingMovies.classList.remove('loading');
                        document.body.style.overflow = 'auto';
                    }, 1200);
                })
                .catch(error => console.error('Error loading movies:', error));
        })
        .catch(error => console.error('Error loading movies:', error));
});

document.addEventListener('keydown', function(event) {
    if (document.body.classList.contains('loading')) {
        return;
    }
    if (event.code === 'Space+1') {
        nextPage();
    } else if (event.code === 'Backspace') {
        previousPage();
    }
});

window.mobileCheck = function() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    return /android|bb\d+|meego.+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(userAgent) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(userAgent);
}

function getGenreName(id) {
    const genres = {
        28: 'Action',
        12: 'Adventure',
        16: 'Animation',
        35: 'Comedy',
        80: 'Crime',
        99: 'Documentary',
        18: 'Drama',
        10751: 'Family',
        14: 'Fantasy',
        36: 'History',
        27: 'Horror',
        10402: 'Music',
        9648: 'Mystery',
        10749: 'Romance',
        878: 'Science Fiction',
        10770: 'TV Movie',
        53: 'Thriller',
        10752: 'War',
        37: 'Western'
    };
    return genres[id] || 'Unknown';
}

function fetchMovies(query, category, year, page = 1) {
    let url = `https://api.themoviedb.org/3/discover/movie?api_key=0ae47aadd2d85a324c238972cedab662&sort_by=popularity.desc&page=${page}`;
    if (query) {
        url = `https://api.themoviedb.org/3/search/movie?api_key=0ae47aadd2d85a324c238972cedab662&query=${query}&page=${page}`;
    } else {
        if (category) {
            url += `&with_genres=${category}`;
        }
        if (year) {
            url += `&year=${year}`;
        }
    }
    
    return fetch(url)
        .then(response => response.json());
}

