(function () {
    'use strict';

    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function getBasePrefix() {
        return document.body.getAttribute('data-base-prefix') || './';
    }

    function initMobileNav() {
        var button = document.querySelector('[data-menu-toggle]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function initGlobalSearch() {
        var forms = document.querySelectorAll('[data-global-search]');
        forms.forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var input = form.querySelector('input[name="q"]');
                var query = input ? input.value.trim() : '';
                var target = getBasePrefix() + 'search.html';
                if (query) {
                    target += '?q=' + encodeURIComponent(query);
                }
                window.location.href = target;
            });
        });
    }

    function initHeroSlider() {
        var slider = document.querySelector('[data-hero-slider]');
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var prev = slider.querySelector('[data-hero-prev]');
        var next = slider.querySelector('[data-hero-next]');
        var active = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === active);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });
        if (prev) {
            prev.addEventListener('click', function () {
                show(active - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(active + 1);
                start();
            });
        }
        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function initFilters() {
        var scopes = document.querySelectorAll('[data-filter-scope]');
        var urlParams = new URLSearchParams(window.location.search);
        var initialQuery = urlParams.get('q') || '';

        scopes.forEach(function (scope) {
            var grid = scope.parentElement ? scope.parentElement.querySelector('[data-filter-grid]') : null;
            if (!grid) {
                grid = document.querySelector('[data-filter-grid]');
            }
            if (!grid) {
                return;
            }

            var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]'));
            var textInput = scope.querySelector('[data-filter-text]');
            var regionSelect = scope.querySelector('[data-filter-region]');
            var typeSelect = scope.querySelector('[data-filter-type]');
            var yearSelect = scope.querySelector('[data-filter-year]');
            var clearButton = scope.querySelector('[data-filter-clear]');
            var countNode = scope.querySelector('[data-filter-count]');
            var emptyNode = scope.querySelector('[data-filter-empty]');

            if (textInput && initialQuery) {
                textInput.value = initialQuery;
            }

            function applyFilter() {
                var query = normalize(textInput && textInput.value);
                var region = normalize(regionSelect && regionSelect.value);
                var type = normalize(typeSelect && typeSelect.value);
                var year = normalize(yearSelect && yearSelect.value);
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute('data-title'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-region-group'),
                        card.getAttribute('data-type'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-tags'),
                        card.textContent
                    ].join(' '));
                    var cardRegion = normalize(card.getAttribute('data-region'));
                    var cardRegionGroup = normalize(card.getAttribute('data-region-group'));
                    var cardType = normalize(card.getAttribute('data-type'));
                    var cardYear = normalize(card.getAttribute('data-year'));
                    var matched = true;

                    if (query && haystack.indexOf(query) === -1) {
                        matched = false;
                    }
                    if (region && cardRegion !== region && cardRegionGroup !== region) {
                        matched = false;
                    }
                    if (type && cardType !== type) {
                        matched = false;
                    }
                    if (year && cardYear !== year) {
                        matched = false;
                    }

                    card.classList.toggle('is-hidden', !matched);
                    if (matched) {
                        visible += 1;
                    }
                });

                if (countNode) {
                    countNode.textContent = '当前显示 ' + visible + ' / ' + cards.length + ' 部';
                }
                if (emptyNode) {
                    emptyNode.classList.toggle('is-visible', visible === 0);
                }
            }

            [textInput, regionSelect, typeSelect, yearSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', applyFilter);
                    control.addEventListener('change', applyFilter);
                }
            });
            if (clearButton) {
                clearButton.addEventListener('click', function () {
                    if (textInput) {
                        textInput.value = '';
                    }
                    if (regionSelect) {
                        regionSelect.value = '';
                    }
                    if (typeSelect) {
                        typeSelect.value = '';
                    }
                    if (yearSelect) {
                        yearSelect.value = '';
                    }
                    applyFilter();
                });
            }
            applyFilter();
        });
    }

    function initImageFallbacks() {
        var images = document.querySelectorAll('img');
        images.forEach(function (image) {
            image.addEventListener('error', function () {
                image.classList.add('is-missing');
            }, { once: true });
        });
    }

    function initPlayers() {
        var cards = document.querySelectorAll('[data-player-card]');
        cards.forEach(function (card) {
            var video = card.querySelector('.js-hls-video');
            var button = card.querySelector('[data-player-start]');
            if (!video) {
                return;
            }
            var source = video.getAttribute('data-src');
            var hlsInstance = null;

            function attachSource() {
                if (!source || video.getAttribute('data-attached') === 'true') {
                    return;
                }
                video.setAttribute('data-attached', 'true');
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({ enableWorker: true });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    return;
                }
                video.src = source;
            }

            function playVideo() {
                attachSource();
                card.classList.add('is-playing');
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {
                        card.classList.remove('is-playing');
                    });
                }
            }

            if (button) {
                button.addEventListener('click', playVideo);
            }
            video.addEventListener('play', function () {
                card.classList.add('is-playing');
            });
            video.addEventListener('pause', function () {
                if (video.currentTime === 0 || video.ended) {
                    card.classList.remove('is-playing');
                }
            });
            video.addEventListener('click', attachSource, { once: true });
        });
    }

    ready(function () {
        initMobileNav();
        initGlobalSearch();
        initHeroSlider();
        initFilters();
        initImageFallbacks();
        initPlayers();
    });
})();
