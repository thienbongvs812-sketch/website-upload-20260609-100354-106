(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupNavigation() {
    var button = document.querySelector('[data-nav-toggle]');
    if (!button) {
      return;
    }
    button.addEventListener('click', function () {
      document.body.classList.toggle('nav-open');
    });
  }

  function setupImageFallbacks() {
    document.querySelectorAll('img[data-fallback]').forEach(function (image) {
      image.addEventListener('error', function () {
        var shell = image.closest('.poster-shell, .hero-poster, .category-cover');
        if (shell) {
          shell.classList.add('image-missing');
        }
      });
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = Math.max(0, slides.findIndex(function (slide) {
      return slide.classList.contains('is-active');
    }));
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }

    if (slides.length > 1) {
      restart();
    }
  }

  function setupFilters() {
    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
      var form = scope.querySelector('[data-search-form]');
      var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
      var result = scope.querySelector('[data-filter-result]');

      if (!form || cards.length === 0) {
        return;
      }

      function filterCards() {
        var keyword = normalize(form.elements.keyword && form.elements.keyword.value);
        var year = normalize(form.elements.year && form.elements.year.value);
        var region = normalize(form.elements.region && form.elements.region.value);
        var type = normalize(form.elements.type && form.elements.type.value);
        var visible = 0;

        cards.forEach(function (card) {
          var cardYear = Number(card.getAttribute('data-year') || 0);
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-category'),
            card.getAttribute('data-tags'),
            card.textContent
          ].join(' '));

          var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchesRegion = !region || normalize(card.getAttribute('data-region')).indexOf(region) !== -1;
          var matchesType = !type || normalize(card.getAttribute('data-type')).indexOf(type) !== -1;
          var matchesYear = true;

          if (year) {
            if (year === '2020') {
              matchesYear = cardYear <= 2020;
            } else {
              matchesYear = String(cardYear) === year;
            }
          }

          var show = matchesKeyword && matchesRegion && matchesType && matchesYear;
          card.classList.toggle('is-hidden', !show);
          if (show) {
            visible += 1;
          }
        });

        if (result) {
          result.textContent = '当前显示 ' + visible + ' 部影片，共 ' + cards.length + ' 部。';
        }
      }

      form.addEventListener('input', filterCards);
      form.addEventListener('change', filterCards);

      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q && form.elements.keyword) {
        form.elements.keyword.value = q;
      }
      filterCards();
    });
  }

  ready(function () {
    setupNavigation();
    setupImageFallbacks();
    setupHero();
    setupFilters();
  });
}());
