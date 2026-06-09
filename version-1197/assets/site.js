(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupNavigation() {
        var toggle = document.querySelector('.nav-toggle');
        var nav = document.querySelector('.main-nav');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            var open = nav.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    function setupHero() {
        var root = document.querySelector('[data-hero-slider]');
        if (!root) {
            return;
        }
        var slides = selectAll('.hero-slide', root);
        var dots = selectAll('.hero-dot', root);
        var next = document.querySelector('[data-hero-next]');
        var prev = document.querySelector('[data-hero-prev]');
        var index = 0;
        var timer;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }
        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                restart();
            });
        });
        show(0);
        restart();
    }

    function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    function setupFilters() {
        selectAll('[data-filter-scope]').forEach(function (panel) {
            var container = panel.parentElement || document;
            var input = panel.querySelector('.js-filter-input');
            var selects = selectAll('.js-select', panel);
            var empty = panel.querySelector('.empty-state');
            var cards = selectAll('.movie-card, .compact-card', container);

            function apply() {
                var keyword = normalize(input && input.value);
                var filters = {};
                selects.forEach(function (select) {
                    filters[select.getAttribute('data-filter')] = normalize(select.value);
                });
                var shown = 0;
                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute('data-keywords') + ' ' + card.getAttribute('data-title'));
                    var ok = !keyword || text.indexOf(keyword) !== -1;
                    Object.keys(filters).forEach(function (name) {
                        var selected = filters[name];
                        if (!selected || selected === 'all') {
                            return;
                        }
                        if (normalize(card.getAttribute('data-' + name)) !== selected) {
                            ok = false;
                        }
                    });
                    card.classList.toggle('is-hidden', !ok);
                    if (ok) {
                        shown += 1;
                    }
                });
                if (empty) {
                    empty.hidden = shown !== 0;
                }
            }

            if (input) {
                input.addEventListener('input', apply);
            }
            selects.forEach(function (select) {
                select.addEventListener('change', apply);
            });

            var params = new URLSearchParams(window.location.search);
            var q = params.get('q');
            if (q && input) {
                input.value = q;
            }
            apply();
        });
    }

    window.setupMoviePlayer = function (sourceUrl) {
        var video = document.getElementById('moviePlayer');
        var frame = document.querySelector('[data-player-box]');
        var start = document.querySelector('[data-player-start]');
        var hlsInstance;

        if (!video || !frame || !start || !sourceUrl) {
            return;
        }

        function attach() {
            if (video.getAttribute('data-ready') === '1') {
                return;
            }
            video.setAttribute('data-ready', '1');
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = sourceUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    maxBufferLength: 30
                });
                hlsInstance.loadSource(sourceUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = sourceUrl;
            }
        }

        function play() {
            attach();
            frame.classList.add('is-playing');
            start.hidden = true;
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {});
            }
        }

        start.addEventListener('click', function (event) {
            event.preventDefault();
            play();
        });

        frame.addEventListener('click', function (event) {
            if (event.target === start || start.contains(event.target)) {
                return;
            }
            if (video.getAttribute('data-ready') !== '1') {
                play();
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        setupNavigation();
        setupHero();
        setupFilters();
    });
})();
