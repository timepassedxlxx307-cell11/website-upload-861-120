document.addEventListener('DOMContentLoaded', function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === current);
        });
    }

    function startHero() {
        if (slides.length <= 1) {
            return;
        }
        timer = window.setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    function resetHero() {
        if (timer) {
            window.clearInterval(timer);
        }
        startHero();
    }

    if (slides.length) {
        showSlide(0);
        startHero();
    }

    if (prev) {
        prev.addEventListener('click', function () {
            showSlide(current - 1);
            resetHero();
        });
    }

    if (next) {
        next.addEventListener('click', function () {
            showSlide(current + 1);
            resetHero();
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
            resetHero();
        });
    });

    var search = document.querySelector('[data-search]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var searchTotal = document.querySelector('[data-search-total]');

    if (search && cards.length) {
        search.addEventListener('input', function () {
            var value = search.value.trim().toLowerCase();
            var visible = 0;

            cards.forEach(function (card) {
                var text = (card.getAttribute('data-search-text') || '').toLowerCase();
                var matched = !value || text.indexOf(value) !== -1;
                card.classList.toggle('hide-card', !matched);
                if (matched) {
                    visible += 1;
                }
            });

            if (searchTotal) {
                searchTotal.textContent = String(visible);
            }
        });
    }
});
