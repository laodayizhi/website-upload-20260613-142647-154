(function () {
  var toggle = document.querySelector('.menu-toggle');
  var panel = document.querySelector('.mobile-panel');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      var open = panel.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.textContent = open ? '×' : '☰';
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var prev = document.querySelector('[data-hero-prev]');
  var next = document.querySelector('[data-hero-next]');
  var heroIndex = 0;
  var heroTimer = null;

  function showHero(index) {
    if (!slides.length) {
      return;
    }

    heroIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === heroIndex);
    });

    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === heroIndex);
    });
  }

  function startHeroTimer() {
    if (heroTimer) {
      clearInterval(heroTimer);
    }

    heroTimer = setInterval(function () {
      showHero(heroIndex + 1);
    }, 5200);
  }

  if (slides.length) {
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        showHero(i);
        startHeroTimer();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showHero(heroIndex - 1);
        startHeroTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showHero(heroIndex + 1);
        startHeroTimer();
      });
    }

    startHeroTimer();
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var yearSelect = document.querySelector('[data-year-select]');
  var cardList = document.querySelector('[data-card-list]');
  var filterEmpty = document.querySelector('[data-filter-empty]');

  function applyLocalFilter() {
    if (!cardList) {
      return;
    }

    var query = filterInput ? filterInput.value.trim().toLowerCase() : '';
    var year = yearSelect ? yearSelect.value : '';
    var cards = Array.prototype.slice.call(cardList.querySelectorAll('[data-movie-card]'));
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = (card.getAttribute('data-search') || '').toLowerCase();
      var cardYear = card.getAttribute('data-year') || '';
      var matched = (!query || haystack.indexOf(query) !== -1) && (!year || cardYear === year);
      card.hidden = !matched;
      if (matched) {
        visible += 1;
      }
    });

    if (filterEmpty) {
      filterEmpty.hidden = visible !== 0;
    }
  }

  if (filterInput) {
    filterInput.addEventListener('input', applyLocalFilter);
  }

  if (yearSelect) {
    yearSelect.addEventListener('change', applyLocalFilter);
  }

  var globalSearchInput = document.getElementById('globalSearchInput');
  var globalSearchButton = document.getElementById('globalSearchButton');
  var searchResults = document.getElementById('searchResults');
  var searchEmpty = document.getElementById('searchEmpty');

  function createSearchCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return '' +
      '<article class="movie-card" data-movie-card>' +
        '<a class="card-link" href="' + escapeHtml(movie.url) + '" aria-label="' + escapeHtml(movie.title) + '">' +
          '<div class="card-media">' +
            '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
            '<div class="card-overlay"><p>' + escapeHtml(movie.oneLine) + '</p></div>' +
            '<span class="type-badge">' + escapeHtml(movie.type) + '</span>' +
          '</div>' +
          '<div class="card-body">' +
            '<h3>' + escapeHtml(movie.title) + '</h3>' +
            '<div class="card-meta"><span>' + escapeHtml(movie.category) + '</span><span>' + escapeHtml(movie.year) + '</span></div>' +
            '<div class="tag-row">' + tags + '</div>' +
          '</div>' +
        '</a>' +
      '</article>';
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function runGlobalSearch() {
    if (!searchResults || !globalSearchInput || !Array.isArray(window.SEARCH_MOVIES)) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = globalSearchInput.value.trim() || (params.get('q') || '').trim();

    if (!globalSearchInput.value && query) {
      globalSearchInput.value = query;
    }

    var normalized = query.toLowerCase();
    var results = window.SEARCH_MOVIES.filter(function (movie) {
      return !normalized || movie.search.indexOf(normalized) !== -1;
    }).slice(0, 120);

    searchResults.innerHTML = results.map(createSearchCard).join('');

    if (searchEmpty) {
      searchEmpty.hidden = results.length !== 0;
    }
  }

  if (globalSearchInput && searchResults) {
    globalSearchInput.addEventListener('input', runGlobalSearch);

    if (globalSearchButton) {
      globalSearchButton.addEventListener('click', runGlobalSearch);
    }

    runGlobalSearch();
  }
}());

function initializePlayer(source) {
  var video = document.getElementById('moviePlayer');
  var cover = document.getElementById('playerCover');
  var button = document.getElementById('playerStart');
  var hlsInstance = null;
  var ready = false;

  if (!video || !source) {
    return;
  }

  function load() {
    if (ready) {
      return;
    }

    ready = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({ enableWorker: true });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      return;
    }

    video.src = source;
  }

  function play() {
    load();

    if (cover) {
      cover.hidden = true;
    }

    var promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {});
    }
  }

  if (button) {
    button.addEventListener('click', function (event) {
      event.stopPropagation();
      play();
    });
  }

  if (cover) {
    cover.addEventListener('click', play);
  }

  video.addEventListener('click', function () {
    if (!ready) {
      play();
    }
  });

  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
