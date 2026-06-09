(function () {
  var form = document.querySelector("[data-search-form]");
  var input = document.querySelector("[data-search-input]");
  var results = document.querySelector("[data-search-results]");
  var empty = document.querySelector(".empty-result");

  function params() {
    return new URLSearchParams(window.location.search);
  }

  function card(movie) {
    var tag = movie.tags && movie.tags.length ? movie.tags[0] : movie.type;
    return [
      '<a class="result-card" href="' + movie.url + '">',
      '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span>',
      '<strong>' + escapeHtml(movie.title) + '</strong>',
      '<small>' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.genre) + '</small>',
      '<p>' + escapeHtml(movie.summary) + '</p>',
      '<em class="result-tag">' + escapeHtml(tag) + '</em>',
      '</span>',
      '</a>'
    ].join("");
  }

  function escapeHtml(text) {
    return String(text || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function render(query) {
    if (!results || typeof SEARCH_MOVIES === "undefined") {
      return;
    }

    var value = String(query || "").trim().toLowerCase();
    var list = SEARCH_MOVIES.filter(function (movie) {
      if (!value) {
        return true;
      }

      return [movie.title, movie.region, movie.type, movie.genre, movie.summary, (movie.tags || []).join(" ")]
        .join(" ")
        .toLowerCase()
        .indexOf(value) >= 0;
    }).slice(0, 120);

    results.innerHTML = list.map(card).join("");

    if (empty) {
      empty.style.display = list.length ? "none" : "block";
    }
  }

  var initial = params().get("q") || "";

  if (input) {
    input.value = initial;
  }

  render(initial);

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var value = input ? input.value.trim() : "";
      var url = value ? "search.html?q=" + encodeURIComponent(value) : "search.html";
      history.replaceState(null, "", url);
      render(value);
    });
  }
})();
