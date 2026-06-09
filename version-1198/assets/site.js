(function () {
  var toggle = document.querySelector(".menu-toggle");
  var mobileNav = document.querySelector(".mobile-nav");

  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      var open = mobileNav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  document.querySelectorAll("[data-year]").forEach(function (node) {
    node.textContent = String(new Date().getFullYear());
  });

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("active", slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("active", dotIndex === current);
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
    }, 6200);
  }

  var heroSearch = document.querySelector(".hero-search");

  if (heroSearch) {
    heroSearch.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = heroSearch.querySelector("input");
      var value = input ? input.value.trim() : "";
      window.location.href = value ? "search.html?q=" + encodeURIComponent(value) : "search.html";
    });
  }

  var categoryFilter = document.querySelector("[data-category-filter]");
  var yearSelect = document.querySelector("[data-year-select]");
  var filterCards = Array.prototype.slice.call(document.querySelectorAll("[data-filter-card]"));
  var empty = document.querySelector(".empty-result");

  function runFilter() {
    var keyword = categoryFilter ? categoryFilter.value.trim().toLowerCase() : "";
    var yearValue = yearSelect ? yearSelect.value : "";
    var visible = 0;

    filterCards.forEach(function (card) {
      var haystack = [
        card.getAttribute("data-title") || "",
        card.getAttribute("data-tags") || ""
      ].join(" ").toLowerCase();
      var year = card.getAttribute("data-year") || "";
      var matched = (!keyword || haystack.indexOf(keyword) >= 0) && (!yearValue || year === yearValue);
      card.style.display = matched ? "" : "none";
      if (matched) {
        visible += 1;
      }
    });

    if (empty) {
      empty.style.display = visible ? "none" : "block";
    }
  }

  if (categoryFilter) {
    categoryFilter.addEventListener("input", runFilter);
  }

  if (yearSelect) {
    yearSelect.addEventListener("change", runFilter);
  }
})();
