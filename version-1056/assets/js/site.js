(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initMobileNav() {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        if (slides.length <= 1) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                var next = Number(dot.getAttribute("data-hero-dot"));
                if (!Number.isNaN(next)) {
                    show(next);
                    start();
                }
            });
        });

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initListingFilter() {
        var form = document.querySelector("[data-listing-filter]");
        var grid = document.querySelector("[data-listing-grid]");
        if (!form || !grid) {
            return;
        }
        var keywordInput = form.querySelector("[data-filter-keyword]");
        var yearSelect = form.querySelector("[data-filter-year]");
        var typeSelect = form.querySelector("[data-filter-type]");
        var empty = document.querySelector("[data-empty-state]");
        var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));

        function normalize(value) {
            return String(value || "").trim().toLowerCase();
        }

        function apply() {
            var keyword = normalize(keywordInput && keywordInput.value);
            var year = normalize(yearSelect && yearSelect.value);
            var type = normalize(typeSelect && typeSelect.value);
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = normalize(card.textContent + " " + card.dataset.title + " " + card.dataset.region + " " + card.dataset.genre + " " + card.dataset.type + " " + card.dataset.year);
                var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchesYear = !year || normalize(card.dataset.year) === year;
                var matchesType = !type || normalize(card.dataset.type) === type;
                var shouldShow = matchesKeyword && matchesYear && matchesType;
                card.style.display = shouldShow ? "" : "none";
                if (shouldShow) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }

        [keywordInput, yearSelect, typeSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });
        apply();
    }

    function initMoviePlayer(source) {
        var video = document.getElementById("moviePlayer");
        var overlay = document.getElementById("playOverlay");
        var status = document.getElementById("playerStatus");
        if (!video || !source) {
            return;
        }
        var hls = null;

        function setStatus(text) {
            if (status) {
                status.textContent = text || "";
            }
        }

        function attachSource() {
            if (video.dataset.ready === "true") {
                return;
            }
            video.dataset.ready = "true";
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function play() {
            attachSource();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            video.controls = true;
            setStatus("加载中...");
            var playTask = video.play();
            if (playTask && typeof playTask.catch === "function") {
                playTask.catch(function () {
                    setStatus("点击视频区域继续播放");
                });
            }
        }

        if (overlay) {
            overlay.addEventListener("click", play);
        }
        video.addEventListener("playing", function () {
            setStatus("");
        });
        video.addEventListener("error", function () {
            setStatus("当前网络波动，请稍后重试");
        });
        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    window.initMoviePlayer = initMoviePlayer;

    ready(function () {
        initMobileNav();
        initHero();
        initListingFilter();
    });
})();
