(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var navToggle = document.querySelector("[data-nav-toggle]");
    var nav = document.querySelector("[data-site-nav]");

    if (navToggle && nav) {
      navToggle.addEventListener("click", function () {
        nav.classList.toggle("is-open");
        document.body.classList.toggle("nav-open", nav.classList.contains("is-open"));
      });
    }

    document.querySelectorAll("[data-global-search]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";
        var prefix = location.pathname.indexOf("/movies/") !== -1 || location.pathname.indexOf("/category/") !== -1 ? "../" : "./";
        location.href = prefix + "search.html" + (query ? "?q=" + encodeURIComponent(query) : "");
      });
    });

    document.querySelectorAll("[data-hero]").forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var previous = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
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

      function restart() {
        if (timer) {
          clearInterval(timer);
        }
        timer = setInterval(function () {
          show(index + 1);
        }, 5000);
      }

      if (previous) {
        previous.addEventListener("click", function () {
          show(index - 1);
          restart();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          restart();
        });
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-hero-dot")) || 0);
          restart();
        });
      });

      show(0);
      restart();
    });

    document.querySelectorAll("[data-filter-form]").forEach(function (form) {
      var scope = form.parentElement || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
      var searchInput = form.querySelector("[data-search-input]");
      var typeFilter = form.querySelector("[data-type-filter]");
      var yearFilter = form.querySelector("[data-year-filter]");
      var params = new URLSearchParams(location.search);
      var initialQuery = params.get("q") || "";

      if (searchInput && initialQuery) {
        searchInput.value = initialQuery;
      }

      function applyFilters() {
        var query = searchInput ? searchInput.value.trim().toLowerCase() : "";
        var type = typeFilter ? typeFilter.value : "";
        var year = yearFilter ? yearFilter.value : "";

        cards.forEach(function (card) {
          var title = card.getAttribute("data-title") || "";
          var cardType = card.getAttribute("data-type") || "";
          var cardYear = card.getAttribute("data-year") || "";
          var matched = true;

          if (query && title.indexOf(query) === -1) {
            matched = false;
          }

          if (type && cardType !== type) {
            matched = false;
          }

          if (year && cardYear !== year) {
            matched = false;
          }

          card.hidden = !matched;
        });
      }

      form.addEventListener("submit", function (event) {
        event.preventDefault();
        applyFilters();
      });

      [searchInput, typeFilter, yearFilter].forEach(function (control) {
        if (control) {
          control.addEventListener("input", applyFilters);
          control.addEventListener("change", applyFilters);
        }
      });

      applyFilters();
    });

    document.querySelectorAll(".player-box").forEach(function (box) {
      var video = box.querySelector("video");
      var cover = box.querySelector(".player-cover");
      var url = box.getAttribute("data-video");
      var attached = false;

      function attach() {
        if (!video || !url || attached) {
          return;
        }

        attached = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(url);
          hls.attachMedia(video);
          box.hlsPlayer = hls;
        } else {
          video.src = url;
        }
      }

      function play() {
        if (!video) {
          return;
        }

        attach();
        video.controls = true;

        if (cover) {
          cover.classList.add("is-hidden");
        }

        var action = video.play();
        if (action && typeof action.catch === "function") {
          action.catch(function () {});
        }
      }

      if (cover) {
        cover.addEventListener("click", function (event) {
          event.preventDefault();
          play();
        });
      }

      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            play();
          }
        });
      }
    });
  });
})();
