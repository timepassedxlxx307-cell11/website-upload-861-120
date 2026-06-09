(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var menu = document.querySelector("[data-nav-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupGlobalSearch() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-search-form]"));
    if (!forms.length || !window.MOVIE_SEARCH_INDEX) {
      return;
    }

    function renderResults(panel, matches) {
      if (!matches.length) {
        panel.innerHTML = '<div class="search-item"><div></div><span>没有找到匹配内容</span></div>';
        panel.classList.add("is-open");
        return;
      }
      panel.innerHTML = matches.slice(0, 12).map(function (movie) {
        return [
          '<a class="search-item" href="' + movie.url + '">',
          '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '">',
          '<span><strong>' + escapeHtml(movie.title) + '</strong>',
          '<small>' + escapeHtml(movie.region + ' · ' + movie.type + ' · ' + movie.year) + '</small>',
          '<small>' + escapeHtml(movie.oneLine) + '</small></span>',
          '</a>'
        ].join('');
      }).join('');
      panel.classList.add("is-open");
    }

    forms.forEach(function (form) {
      var input = form.querySelector("[data-global-search]");
      var panel = form.querySelector("[data-search-results]");
      if (!input || !panel) {
        return;
      }
      input.addEventListener("input", function () {
        var query = input.value.trim().toLowerCase();
        if (!query) {
          panel.classList.remove("is-open");
          panel.innerHTML = "";
          return;
        }
        var matches = window.MOVIE_SEARCH_INDEX.filter(function (movie) {
          return movie.searchText.indexOf(query) !== -1;
        });
        renderResults(panel, matches);
      });
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var first = panel.querySelector("a");
        if (first) {
          window.location.href = first.getAttribute("href");
        }
      });
      document.addEventListener("click", function (event) {
        if (!form.contains(event.target)) {
          panel.classList.remove("is-open");
        }
      });
    });
  }

  function setupCategoryFilter() {
    var grid = document.querySelector("[data-filter-grid]");
    if (!grid) {
      return;
    }
    var input = document.querySelector("[data-filter-input]");
    var type = document.querySelector("[data-filter-type]");
    var year = document.querySelector("[data-filter-year]");
    var empty = document.querySelector("[data-empty-state]");
    var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-movie-card]"));

    function apply() {
      var query = input ? input.value.trim().toLowerCase() : "";
      var selectedType = type ? type.value : "";
      var selectedYear = year ? year.value : "";
      var visible = 0;
      cards.forEach(function (card) {
        var text = (card.getAttribute("data-tags") || "").toLowerCase();
        var cardType = card.getAttribute("data-type") || "";
        var cardYear = card.getAttribute("data-year") || "";
        var ok = (!query || text.indexOf(query) !== -1) && (!selectedType || cardType === selectedType) && (!selectedYear || cardYear === selectedYear);
        card.style.display = ok ? "" : "none";
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    [input, type, year].forEach(function (element) {
      if (element) {
        element.addEventListener("input", apply);
        element.addEventListener("change", apply);
      }
    });
    apply();
  }

  function setupPlayer() {
    var player = document.querySelector("[data-player-shell]");
    var video = document.querySelector("[data-player-video]");
    var startButton = document.querySelector("[data-player-start]");
    var overlay = document.querySelector("[data-player-overlay]");
    var message = document.querySelector("[data-player-message]");
    if (!player || !video || !startButton) {
      return;
    }
    var sourceUrl = video.getAttribute("data-src") || "";
    var hls = null;
    var attached = false;

    function setMessage(text) {
      if (message) {
        message.textContent = text || "";
      }
    }

    function attachSource() {
      if (attached || !sourceUrl) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (data && data.fatal) {
            setMessage("视频加载失败，请刷新后重试");
          }
        });
        return;
      }
      video.src = sourceUrl;
    }

    function beginPlayback() {
      attachSource();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      video.controls = true;
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          if (overlay) {
            overlay.classList.remove("is-hidden");
          }
        });
      }
    }

    startButton.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      beginPlayback();
    });

    player.addEventListener("click", function (event) {
      if (event.target === video && video.controls) {
        return;
      }
      beginPlayback();
    });

    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      }[char];
    });
  }

  ready(function () {
    setupNavigation();
    setupHero();
    setupGlobalSearch();
    setupCategoryFilter();
    setupPlayer();
  });
})();
