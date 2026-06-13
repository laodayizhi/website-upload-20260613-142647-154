(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMobileMenu() {
    var button = qs(".mobile-menu-button");
    var panel = qs(".mobile-panel");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      var opened = panel.hasAttribute("hidden");
      if (opened) {
        panel.removeAttribute("hidden");
      } else {
        panel.setAttribute("hidden", "");
      }
      button.setAttribute("aria-expanded", String(opened));
    });
  }

  function setupHero() {
    var carousel = qs("[data-hero-carousel]");
    if (!carousel) {
      return;
    }
    var slides = qsa("[data-hero-slide]", carousel);
    var dots = qsa("[data-hero-dot]", carousel);
    if (slides.length <= 1) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle("is-active", current === index);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle("is-active", current === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    dots.forEach(function (dot, current) {
      dot.addEventListener("click", function () {
        if (timer) {
          window.clearInterval(timer);
        }
        show(current);
        start();
      });
    });

    start();
  }

  function setupCategoryFilter() {
    var input = qs(".category-filter-input");
    var cards = qsa(".category-movie-list .movie-card");
    if (!input || !cards.length) {
      return;
    }
    input.addEventListener("input", function () {
      var value = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = [
          card.getAttribute("data-title"),
          card.getAttribute("data-year"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-genre")
        ].join(" ").toLowerCase();
        card.hidden = value && text.indexOf(value) === -1;
      });
    });
  }

  function cardHtml(movie) {
    var tags = (movie.tags || "").split(/[，,、/]+/).filter(Boolean).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return "<article class=\"movie-card\">" +
      "<a href=\"./" + movie.file + "\" class=\"movie-card-link\">" +
      "<div class=\"movie-poster\">" +
      "<img src=\"" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
      "<div class=\"poster-shade\"></div>" +
      "<span class=\"year-badge\">" + escapeHtml(movie.year) + "</span>" +
      "<span class=\"play-chip\">播放</span>" +
      "</div>" +
      "<div class=\"movie-card-body\">" +
      "<h2>" + escapeHtml(movie.title) + "</h2>" +
      "<p>" + escapeHtml(movie.oneLine) + "</p>" +
      "<div class=\"movie-meta-line\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span></div>" +
      "<div class=\"tag-row\">" + tags + "</div>" +
      "</div>" +
      "</a>" +
      "</article>";
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

  function setupSearchPage() {
    var panel = qs("[data-search-page]");
    if (!panel || !window.searchItems) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var input = qs("#site-search-input");
    var category = qs("#site-category-select");
    var year = qs("#site-year-select");
    var reset = qs("#site-search-reset");
    var results = qs("#search-results");
    var title = qs("#search-result-title");
    var count = qs("#search-result-count");

    input.value = params.get("q") || "";

    function render() {
      var q = input.value.trim().toLowerCase();
      var cat = category.value;
      var y = year.value;
      var filtered = window.searchItems.filter(function (movie) {
        var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine, movie.category].join(" ").toLowerCase();
        return (!q || text.indexOf(q) !== -1) && (!cat || movie.category === cat) && (!y || movie.year === y);
      });
      var limited = filtered.slice(0, 120);
      results.innerHTML = limited.map(cardHtml).join("");
      title.textContent = q || cat || y ? "筛选结果" : "精选内容";
      count.textContent = "共找到 " + filtered.length + " 部相关影片";
    }

    [input, category, year].forEach(function (control) {
      control.addEventListener("input", render);
      control.addEventListener("change", render);
    });

    reset.addEventListener("click", function () {
      input.value = "";
      category.value = "";
      year.value = "";
      render();
    });

    render();
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMobileMenu();
    setupHero();
    setupCategoryFilter();
    setupSearchPage();
  });
})();
