(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  qsa('img').forEach(function (img) {
    img.addEventListener('error', function () {
      img.classList.add('image-off');
    }, { once: true });
  });

  var navButton = qs('[data-nav-toggle]');
  var mobileNav = qs('[data-mobile-nav]');
  if (navButton && mobileNav) {
    navButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
      navButton.textContent = mobileNav.classList.contains('open') ? '×' : '☰';
    });
  }

  var slider = qs('[data-hero-slider]');
  if (slider) {
    var slides = qsa('.hero-slide', slider);
    var dotsWrap = qs('[data-hero-dots]', slider);
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, idx) {
        slide.classList.toggle('active', idx === current);
      });
      qsa('button', dotsWrap).forEach(function (dot, idx) {
        dot.classList.toggle('active', idx === current);
      });
    }

    if (dotsWrap && slides.length > 1) {
      slides.forEach(function (_, idx) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('aria-label', '切换焦点影片');
        dot.addEventListener('click', function () {
          showSlide(idx);
          restart();
        });
        dotsWrap.appendChild(dot);
      });

      function restart() {
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(function () {
          showSlide(current + 1);
        }, 5200);
      }

      showSlide(0);
      restart();
    }
  }

  qsa('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = qs('input[name="q"]', form);
      if (input && input.value.trim()) {
        form.action = './search.html';
      }
    });
  });

  var params = new URLSearchParams(window.location.search);
  var initialQuery = params.get('q') || '';
  var filterPanel = qs('[data-filter-panel]');
  if (filterPanel) {
    var textInput = qs('[data-filter-text]', filterPanel);
    var regionSelect = qs('[data-filter-region]', filterPanel);
    var typeSelect = qs('[data-filter-type]', filterPanel);
    var yearSelect = qs('[data-filter-year]', filterPanel);
    var cards = qsa('.filter-grid .movie-card, .filter-grid .ranking-item');

    if (textInput && initialQuery) {
      textInput.value = initialQuery;
    }

    function normalize(value) {
      return (value || '').toString().trim().toLowerCase();
    }

    function applyFilters() {
      var q = normalize(textInput && textInput.value);
      var region = normalize(regionSelect && regionSelect.value);
      var type = normalize(typeSelect && typeSelect.value);
      var year = normalize(yearSelect && yearSelect.value);

      cards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre,
          card.textContent
        ].join(' '));
        var ok = true;
        if (q && haystack.indexOf(q) === -1) {
          ok = false;
        }
        if (region && normalize(card.dataset.region).indexOf(region) === -1) {
          ok = false;
        }
        if (type && normalize(card.dataset.type).indexOf(type) === -1) {
          ok = false;
        }
        if (year && normalize(card.dataset.year) !== year) {
          ok = false;
        }
        card.classList.toggle('is-hidden', !ok);
      });
    }

    [textInput, regionSelect, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  }

  function loadHls(callback) {
    if (window.Hls) {
      callback();
      return;
    }
    var existing = qs('script[data-hls-loader]');
    if (existing) {
      existing.addEventListener('load', callback, { once: true });
      return;
    }
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js';
    script.async = true;
    script.setAttribute('data-hls-loader', 'true');
    script.addEventListener('load', callback, { once: true });
    document.head.appendChild(script);
  }

  function setupPlayer(player) {
    var video = qs('video[data-stream]', player);
    var start = qs('.player-start', player);
    if (!video || !start) {
      return;
    }
    var stream = video.getAttribute('data-stream');
    var hlsInstance = null;
    var initialized = false;

    function attachAndPlay() {
      if (!stream) {
        return;
      }
      player.classList.add('is-playing');
      if (initialized) {
        video.play().catch(function () {});
        return;
      }
      initialized = true;

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          maxBufferLength: 30,
          enableWorker: true
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
          if (data && data.fatal && hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
            initialized = false;
            player.classList.remove('is-playing');
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        video.play().catch(function () {});
      } else {
        initialized = false;
        loadHls(attachAndPlay);
      }
    }

    start.addEventListener('click', attachAndPlay);
    video.addEventListener('click', function () {
      if (video.paused) {
        attachAndPlay();
      }
    });
    video.addEventListener('play', function () {
      player.classList.add('is-playing');
    });
    video.addEventListener('pause', function () {
      if (!video.seeking && video.currentTime < 0.1) {
        player.classList.remove('is-playing');
      }
    });
  }

  qsa('[data-player]').forEach(setupPlayer);
})();
