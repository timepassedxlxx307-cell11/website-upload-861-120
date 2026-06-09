document.addEventListener("DOMContentLoaded", function () {
  var menuButton = document.querySelector(".menu-toggle");
  var mobileNav = document.querySelector(".mobile-nav");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      var open = mobileNav.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", String(open));
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  var current = 0;
  var timer = null;

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
      dot.setAttribute("aria-pressed", String(dotIndex === current));
    });
  }

  function startTimer() {
    if (timer || slides.length < 2) {
      return;
    }

    timer = window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  function stopTimer() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      stopTimer();
      showSlide(index);
      startTimer();
    });
  });

  if (slides.length) {
    showSlide(0);
    startTimer();
  }

  Array.prototype.slice.call(document.querySelectorAll(".js-filter-block")).forEach(function (block) {
    var input = block.querySelector('[data-filter="query"]');
    var selects = Array.prototype.slice.call(block.querySelectorAll("select[data-filter]"));
    var scope = block.parentElement;
    var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function matches(card, filter, value) {
      if (!value) {
        return true;
      }

      var source = "";

      if (filter === "query") {
        source = [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year"),
          card.getAttribute("data-tags")
        ].join(" ");
      } else {
        source = card.getAttribute("data-" + filter);
      }

      return normalize(source).indexOf(normalize(value)) !== -1;
    }

    function applyFilters() {
      var query = input ? input.value : "";
      var values = selects.map(function (select) {
        return {
          filter: select.getAttribute("data-filter"),
          value: select.value
        };
      });

      cards.forEach(function (card) {
        var visible = matches(card, "query", query);

        values.forEach(function (item) {
          if (visible) {
            visible = matches(card, item.filter, item.value);
          }
        });

        card.classList.toggle("is-filtered", !visible);
      });
    }

    if (input) {
      input.addEventListener("input", applyFilters);
    }

    selects.forEach(function (select) {
      select.addEventListener("change", applyFilters);
    });
  });
});
