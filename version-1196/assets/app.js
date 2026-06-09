(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initNavigation() {
        var toggle = document.querySelector("[data-nav-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function initHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        var prev = root.querySelector("[data-hero-prev]");
        var next = root.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
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

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                start();
            });
        });
        root.addEventListener("mouseenter", stop);
        root.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initCarousel() {
        document.querySelectorAll("[data-carousel]").forEach(function (carousel) {
            var track = carousel.querySelector("[data-carousel-track]");
            var prev = carousel.querySelector("[data-carousel-prev]");
            var next = carousel.querySelector("[data-carousel-next]");
            if (!track || !prev || !next) {
                return;
            }
            var index = 0;

            function visibleCount() {
                if (window.innerWidth < 761) {
                    return 1;
                }
                if (window.innerWidth < 1101) {
                    return 2;
                }
                return 4;
            }

            function update() {
                var items = track.children.length;
                var max = Math.max(0, items - visibleCount());
                index = Math.min(Math.max(index, 0), max);
                var item = track.children[0];
                var width = item ? item.getBoundingClientRect().width + 22 : 0;
                track.style.transform = "translateX(" + (-index * width) + "px)";
            }

            prev.addEventListener("click", function () {
                index -= 1;
                update();
            });
            next.addEventListener("click", function () {
                index += 1;
                update();
            });
            window.addEventListener("resize", update);
            update();
        });
    }

    function initSearch() {
        var input = document.querySelector("[data-search-input]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
        var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter-chip]"));
        if (!input || !cards.length) {
            return;
        }
        var active = "全部";

        function textOf(card) {
            return [
                card.getAttribute("data-title"),
                card.getAttribute("data-genre"),
                card.getAttribute("data-region"),
                card.getAttribute("data-year"),
                card.getAttribute("data-category"),
                card.textContent
            ].join(" ").toLowerCase();
        }

        function apply() {
            var query = input.value.trim().toLowerCase();
            cards.forEach(function (card) {
                var text = textOf(card);
                var byText = !query || text.indexOf(query) !== -1;
                var byChip = active === "全部" || text.indexOf(active.toLowerCase()) !== -1;
                card.style.display = byText && byChip ? "" : "none";
            });
        }

        input.addEventListener("input", apply);
        chips.forEach(function (chip) {
            chip.addEventListener("click", function () {
                active = chip.getAttribute("data-filter-chip") || "全部";
                chips.forEach(function (item) {
                    item.classList.toggle("is-active", item === chip);
                });
                apply();
            });
        });
        if (chips[0]) {
            chips[0].classList.add("is-active");
        }
        apply();
    }

    function initPlayers() {
        document.querySelectorAll("[data-player]").forEach(function (player) {
            var video = player.querySelector("[data-player-video]");
            var cover = player.querySelector("[data-player-cover]");
            var buttons = Array.prototype.slice.call(player.querySelectorAll("[data-player-start]"));
            var loaded = false;
            var hls = null;

            if (!video) {
                return;
            }

            function load() {
                if (loaded) {
                    return;
                }
                var stream = video.getAttribute("data-stream");
                if (!stream) {
                    return;
                }
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({ enableWorker: true });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                } else {
                    video.src = stream;
                }
                loaded = true;
            }

            function play() {
                load();
                if (cover) {
                    cover.classList.add("is-hidden");
                }
                var result = video.play();
                if (result && typeof result.catch === "function") {
                    result.catch(function () {
                        video.controls = true;
                    });
                }
            }

            buttons.forEach(function (button) {
                button.addEventListener("click", play);
            });
            video.addEventListener("click", function () {
                if (!loaded) {
                    play();
                }
            });
            window.addEventListener("beforeunload", function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    }

    ready(function () {
        initNavigation();
        initHero();
        initCarousel();
        initSearch();
        initPlayers();
    });
})();
