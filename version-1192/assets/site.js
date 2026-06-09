(function () {
  const ready = function (callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  };

  const normalize = function (value) {
    return String(value || '').toLowerCase().trim();
  };

  ready(function () {
    const toggle = document.querySelector('.mobile-toggle');
    const mobileNav = document.querySelector('.mobile-nav');

    if (toggle && mobileNav) {
      toggle.addEventListener('click', function () {
        mobileNav.classList.toggle('is-open');
      });
    }

    document.querySelectorAll('.site-search').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        const input = form.querySelector('input[name="q"]');
        if (!input || !input.value.trim()) {
          event.preventDefault();
          if (input) {
            input.focus();
          }
        }
      });
    });

    setupHero();
    setupFiltering();
    setupCategoryFiltering();
    setupPlayer();
    setupSearchPage();
  });

  function setupHero() {
    const slides = Array.from(document.querySelectorAll('.hero-slide'));
    const dots = Array.from(document.querySelectorAll('.hero-dot'));
    const prev = document.querySelector('.hero-prev');
    const next = document.querySelector('.hero-next');

    if (!slides.length) {
      return;
    }

    let current = 0;
    let timer = null;

    const show = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    };

    const play = function () {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    };

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.dataset.slide || 0));
        play();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        play();
      });
    }

    play();
  }

  function setupFiltering() {
    const input = document.querySelector('.movie-filter-input');
    const select = document.querySelector('.movie-filter-select');
    const cards = Array.from(document.querySelectorAll('.movie-card, .ranking-card'));

    if (!cards.length || (!input && !select)) {
      return;
    }

    const apply = function () {
      const keyword = normalize(input ? input.value : '');
      const year = select ? select.value : '';

      cards.forEach(function (card) {
        const text = normalize([
          card.dataset.title,
          card.dataset.tags,
          card.dataset.region,
          card.dataset.category,
          card.dataset.year
        ].join(' '));
        const yearMatched = !year || String(card.dataset.year || '').indexOf(year) !== -1;
        const keywordMatched = !keyword || text.indexOf(keyword) !== -1;
        card.classList.toggle('is-filtered-out', !(yearMatched && keywordMatched));
      });
    };

    if (input) {
      input.addEventListener('input', apply);
    }

    if (select) {
      select.addEventListener('change', apply);
    }
  }

  function setupCategoryFiltering() {
    const input = document.querySelector('.category-filter-input');
    const cards = Array.from(document.querySelectorAll('.category-overview-card'));

    if (!input || !cards.length) {
      return;
    }

    input.addEventListener('input', function () {
      const keyword = normalize(input.value);
      cards.forEach(function (card) {
        const text = normalize([card.dataset.title, card.dataset.intro].join(' '));
        card.classList.toggle('is-filtered-out', keyword && text.indexOf(keyword) === -1);
      });
    });
  }

  function setupPlayer() {
    const holder = document.querySelector('[data-player]');

    if (!holder) {
      return;
    }

    const video = holder.querySelector('video');
    const start = holder.querySelector('.player-start');

    if (!video) {
      return;
    }

    const stream = video.dataset.stream || video.currentSrc || video.src;

    if (stream && window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
    } else if (stream && video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
    }

    if (start) {
      start.addEventListener('click', function () {
        const playResult = video.play();
        start.classList.add('is-hidden');
        if (playResult && typeof playResult.catch === 'function') {
          playResult.catch(function () {
            start.classList.remove('is-hidden');
          });
        }
      });
      video.addEventListener('play', function () {
        start.classList.add('is-hidden');
      });
      video.addEventListener('pause', function () {
        if (video.currentTime === 0 || video.ended) {
          start.classList.remove('is-hidden');
        }
      });
    }
  }

  function setupSearchPage() {
    const results = document.querySelector('[data-search-results]');
    const status = document.querySelector('[data-search-status]');
    const input = document.querySelector('.search-page-input');

    if (!results || typeof searchItems === 'undefined') {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q') || '';

    if (input) {
      input.value = initialQuery;
    }

    const render = function (query) {
      const keyword = normalize(query);
      const matched = !keyword ? searchItems.slice(0, 24) : searchItems.filter(function (item) {
        return normalize([
          item.title,
          item.genre,
          item.tags,
          item.region,
          item.year,
          item.category
        ].join(' ')).indexOf(keyword) !== -1;
      }).slice(0, 80);

      results.innerHTML = '';

      matched.forEach(function (item) {
        const article = document.createElement('article');
        article.className = 'movie-card';

        const link = document.createElement('a');
        link.className = 'poster-link';
        link.href = item.url;

        const image = document.createElement('img');
        image.src = item.cover;
        image.alt = item.title;
        image.loading = 'lazy';
        link.appendChild(image);

        const category = document.createElement('span');
        category.className = 'card-category';
        category.textContent = item.category;
        link.appendChild(category);

        const body = document.createElement('div');
        body.className = 'card-body';

        const title = document.createElement('h3');
        const titleLink = document.createElement('a');
        titleLink.href = item.url;
        titleLink.textContent = item.title;
        title.appendChild(titleLink);

        const summary = document.createElement('p');
        summary.textContent = item.oneLine || item.genre;

        const meta = document.createElement('div');
        meta.className = 'card-meta';
        [item.year, item.region, item.type].forEach(function (value) {
          const span = document.createElement('span');
          span.textContent = value;
          meta.appendChild(span);
        });

        body.appendChild(title);
        body.appendChild(summary);
        body.appendChild(meta);
        article.appendChild(link);
        article.appendChild(body);
        results.appendChild(article);
      });

      if (status) {
        status.textContent = keyword ? '搜索结果' : '热门推荐';
      }
    };

    render(initialQuery);
  }
})();
