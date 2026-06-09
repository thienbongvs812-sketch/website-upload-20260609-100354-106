(function () {
  var navToggle = document.querySelector("[data-nav-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  var backTop = document.querySelector("[data-back-top]");

  if (backTop) {
    window.addEventListener("scroll", function () {
      if (window.scrollY > 420) {
        backTop.classList.add("visible");
      } else {
        backTop.classList.remove("visible");
      }
    });

    backTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  var hero = document.querySelector("[data-hero]");

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }

      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });

    restart();
  }

  var params = new URLSearchParams(window.location.search);
  var initialQuery = params.get("q") || "";
  var filterPanel = document.querySelector("[data-filter-panel]");

  if (filterPanel) {
    var searchInput = document.querySelector("[data-filter-search]");
    var typeSelect = document.querySelector("[data-filter-type]");
    var regionSelect = document.querySelector("[data-filter-region]");
    var resetButton = document.querySelector("[data-filter-reset]");
    var categoryButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-category]"));
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    var empty = document.querySelector("[data-filter-empty]");
    var activeCategory = "";

    if (searchInput && initialQuery) {
      searchInput.value = initialQuery;
    }

    function applyFilters() {
      var keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";
      var type = typeSelect ? typeSelect.value : "";
      var region = regionSelect ? regionSelect.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var text = [
          card.getAttribute("data-title") || "",
          card.getAttribute("data-region") || "",
          card.getAttribute("data-type") || "",
          card.getAttribute("data-year") || ""
        ].join(" ").toLowerCase();
        var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchesType = !type || card.getAttribute("data-type") === type;
        var matchesRegion = !region || card.getAttribute("data-region") === region;
        var matchesCategory = !activeCategory || card.getAttribute("data-category") === activeCategory;
        var shouldShow = matchesKeyword && matchesType && matchesRegion && matchesCategory;

        card.hidden = !shouldShow;

        if (shouldShow) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [searchInput, typeSelect, regionSelect].forEach(function (item) {
      if (item) {
        item.addEventListener("input", applyFilters);
        item.addEventListener("change", applyFilters);
      }
    });

    categoryButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        activeCategory = button.getAttribute("data-filter-category") || "";
        categoryButtons.forEach(function (item) {
          item.classList.toggle("active", item === button);
        });
        applyFilters();
      });
    });

    if (resetButton) {
      resetButton.addEventListener("click", function () {
        if (searchInput) {
          searchInput.value = "";
        }
        if (typeSelect) {
          typeSelect.value = "";
        }
        if (regionSelect) {
          regionSelect.value = "";
        }
        activeCategory = "";
        categoryButtons.forEach(function (button) {
          button.classList.toggle("active", !button.getAttribute("data-filter-category"));
        });
        applyFilters();
      });
    }

    applyFilters();
  }

  var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

  players.forEach(function (player) {
    var video = player.querySelector("video");
    var button = player.querySelector(".js-play");
    var message = player.querySelector("[data-player-message]");
    var prepared = false;
    var hls = null;

    if (!video || !button) {
      return;
    }

    function setMessage(text) {
      if (message) {
        message.textContent = text || "";
      }
    }

    function prepare() {
      if (prepared) {
        return true;
      }

      var source = video.getAttribute("data-hls");

      if (!source) {
        setMessage("视频加载失败");
        return false;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        prepared = true;
        return true;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setMessage("视频加载失败");
          }
        });
        prepared = true;
        return true;
      }

      setMessage("浏览器暂不支持播放");
      return false;
    }

    function start() {
      setMessage("");

      if (!prepare()) {
        return;
      }

      var promise = video.play();

      if (promise && typeof promise.then === "function") {
        promise
          .then(function () {
            player.classList.add("is-playing");
            video.setAttribute("controls", "controls");
          })
          .catch(function () {
            setMessage("点击视频区域继续播放");
          });
      } else {
        player.classList.add("is-playing");
        video.setAttribute("controls", "controls");
      }
    }

    button.addEventListener("click", function (event) {
      event.preventDefault();
      start();
    });

    video.addEventListener("play", function () {
      player.classList.add("is-playing");
      video.setAttribute("controls", "controls");
    });

    video.addEventListener("pause", function () {
      if (!video.ended) {
        player.classList.remove("is-playing");
      }
    });

    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
