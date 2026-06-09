(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function iconPlay() {
        return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"></path></svg>';
    }

    function card(movie) {
        var tags = (movie.tags || []).slice(0, 4).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');
        return '<article class="movie-card">' +
            '<a href="' + escapeHtml(movie.href) + '" class="movie-card-link">' +
                '<figure class="movie-poster">' +
                    '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
                    '<span class="poster-badge">' + escapeHtml(movie.year) + '</span>' +
                    '<span class="poster-play">' + iconPlay() + '</span>' +
                '</figure>' +
                '<div class="movie-card-body">' +
                    '<div class="movie-tags">' + tags + '</div>' +
                    '<h3>' + escapeHtml(movie.title) + '</h3>' +
                    '<p>' + escapeHtml(movie.oneLine) + '</p>' +
                    '<div class="movie-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>' +
                '</div>' +
            '</a>' +
        '</article>';
    }

    ready(function () {
        var input = document.querySelector('[data-search-input]');
        var form = document.querySelector('[data-search-form]');
        var results = document.querySelector('[data-search-results]');
        var empty = document.querySelector('[data-search-empty]');
        var summary = document.querySelector('[data-search-summary]');
        var data = window.MOVIE_SEARCH_DATA || [];
        if (!input || !form || !results) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';
        input.value = initial;

        function render(query) {
            var keyword = normalize(query);
            var matched = data.filter(function (movie) {
                if (!keyword) {
                    return true;
                }
                var haystack = normalize([
                    movie.title,
                    movie.year,
                    movie.region,
                    movie.type,
                    movie.genre,
                    movie.oneLine,
                    (movie.tags || []).join(' ')
                ].join(' '));
                return haystack.indexOf(keyword) !== -1;
            }).slice(0, 120);
            results.innerHTML = matched.map(card).join('');
            if (empty) {
                empty.classList.toggle('is-visible', matched.length === 0);
            }
            if (summary) {
                summary.textContent = keyword ? '已为你匹配相关影片' : '热门影片推荐';
            }
        }

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var value = input.value.trim();
            var url = value ? 'search.html?q=' + encodeURIComponent(value) : 'search.html';
            window.history.replaceState(null, '', url);
            render(value);
        });
        input.addEventListener('input', function () {
            render(input.value);
        });
        render(initial);
    });
})();
