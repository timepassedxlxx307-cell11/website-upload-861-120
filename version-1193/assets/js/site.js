(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var toggle = document.querySelector(".menu-toggle");
        var mobileNav = document.querySelector(".mobile-nav");
        if (toggle && mobileNav) {
            toggle.addEventListener("click", function () {
                var isOpen = mobileNav.classList.toggle("is-open");
                toggle.setAttribute("aria-expanded", String(isOpen));
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var index = 0;

        function activateSlide(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                activateSlide(i);
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                activateSlide(index + 1);
            }, 5200);
        }

        var panels = Array.prototype.slice.call(document.querySelectorAll(".filter-panel"));
        panels.forEach(function (panel) {
            var scope = panel.parentElement || document;
            var list = scope.querySelector(".searchable-list") || document.querySelector(".searchable-list");
            var cards = list ? Array.prototype.slice.call(list.querySelectorAll(".movie-card")) : [];
            var search = panel.querySelector(".movie-search");
            var genre = panel.querySelector(".genre-filter");
            var region = panel.querySelector(".region-filter");
            var empty = panel.querySelector(".empty-state");

            function valueOf(input) {
                return input ? input.value.trim().toLowerCase() : "";
            }

            function filterCards() {
                var keyword = valueOf(search);
                var genreValue = valueOf(genre);
                var regionValue = valueOf(region);
                var visible = 0;

                cards.forEach(function (card) {
                    var text = [
                        card.getAttribute("data-title") || "",
                        card.getAttribute("data-genre") || "",
                        card.getAttribute("data-region") || "",
                        card.getAttribute("data-year") || "",
                        card.textContent || ""
                    ].join(" ").toLowerCase();

                    var genreText = (card.getAttribute("data-genre") || "").toLowerCase();
                    var regionText = (card.getAttribute("data-region") || "").toLowerCase();
                    var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
                    var matchGenre = !genreValue || genreText.indexOf(genreValue) !== -1;
                    var matchRegion = !regionValue || regionText.indexOf(regionValue) !== -1;
                    var show = matchKeyword && matchGenre && matchRegion;

                    card.hidden = !show;
                    if (show) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }

            [search, genre, region].forEach(function (input) {
                if (input) {
                    input.addEventListener("input", filterCards);
                    input.addEventListener("change", filterCards);
                }
            });
        });
    });
})();
