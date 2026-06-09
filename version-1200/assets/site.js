(function () {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");

    if (toggle && panel) {
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var current = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        current = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("is-active", slideIndex === current);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("is-active", dotIndex === current);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    var searchPage = document.querySelector("[data-search-page]");

    if (searchPage && window.MOVIE_INDEX) {
        var form = document.querySelector("[data-search-form]");
        var input = document.querySelector("[data-search-input]");
        var resultBox = document.querySelector("[data-search-results]");
        var titleBox = document.querySelector("[data-search-title]");
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q") || "";

        if (input) {
            input.value = initialQuery;
        }

        function createCard(movie) {
            return [
                '<a class="movie-card" href="' + movie.url + '">',
                '<div class="card-poster">',
                '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
                '<div class="poster-overlay"><span class="play-icon">▶</span></div>',
                '<span class="duration">' + movie.duration + '</span>',
                '</div>',
                '<div class="card-body">',
                '<h3 class="card-title">' + escapeHtml(movie.title) + '</h3>',
                '<p class="card-desc">' + escapeHtml(movie.oneLine) + '</p>',
                '<div class="card-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.category) + '</span><span>' + escapeHtml(movie.region) + '</span></div>',
                '</div>',
                '</a>'
            ].join("");
        }

        function escapeHtml(value) {
            return String(value || "").replace(/[&<>\"]/g, function (char) {
                return {
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    "\"": "&quot;"
                }[char];
            });
        }

        function runSearch(query) {
            var normalized = String(query || "").trim().toLowerCase();
            var list = window.MOVIE_INDEX;

            if (normalized) {
                list = list.filter(function (movie) {
                    return [
                        movie.title,
                        movie.oneLine,
                        movie.category,
                        movie.region,
                        movie.year,
                        movie.genre,
                        movie.tags
                    ].join(" ").toLowerCase().indexOf(normalized) !== -1;
                });
            } else {
                list = list.slice(0, 48);
            }

            if (titleBox) {
                titleBox.textContent = normalized ? "搜索结果" : "热门推荐";
            }

            if (resultBox) {
                resultBox.innerHTML = list.slice(0, 96).map(createCard).join("");
            }
        }

        if (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var value = input ? input.value : "";
                var url = new URL(window.location.href);
                url.searchParams.set("q", value);
                history.replaceState(null, "", url.toString());
                runSearch(value);
            });
        }

        runSearch(initialQuery);
    }
})();
