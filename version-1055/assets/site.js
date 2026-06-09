(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === current);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            showSlide(current + 1);
        }, 6200);
    }

    var searchInput = document.getElementById('site-search');
    var typeFilter = document.getElementById('type-filter');
    var regionFilter = document.getElementById('region-filter');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card, .rank-item'));
    var emptyState = document.querySelector('[data-empty-state]');

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function applyFilters() {
        if (!cards.length) {
            return;
        }

        var query = normalize(searchInput && searchInput.value);
        var selectedType = typeFilter ? typeFilter.value : '';
        var selectedRegion = regionFilter ? regionFilter.value : '';
        var visible = 0;

        cards.forEach(function (card) {
            var text = normalize(card.getAttribute('data-search'));
            var type = card.getAttribute('data-type') || '';
            var region = card.getAttribute('data-region') || '';
            var matchQuery = !query || text.indexOf(query) !== -1;
            var matchType = !selectedType || type === selectedType;
            var matchRegion = !selectedRegion || region === selectedRegion;
            var matched = matchQuery && matchType && matchRegion;

            card.classList.toggle('hidden-by-filter', !matched);
            if (matched) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.classList.toggle('show', visible === 0);
        }
    }

    [searchInput, typeFilter, regionFilter].forEach(function (item) {
        if (item) {
            item.addEventListener('input', applyFilters);
            item.addEventListener('change', applyFilters);
        }
    });
})();
