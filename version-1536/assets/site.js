(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (toggle && menu) {
      toggle.addEventListener('click', function () {
        menu.classList.toggle('open');
      });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var prev = hero.querySelector('[data-hero-prev]');
      var next = hero.querySelector('[data-hero-next]');
      var current = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('active', i === current);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('active', i === current);
        });
      }

      function start() {
        stop();
        timer = setInterval(function () {
          show(current + 1);
        }, 5000);
      }

      function stop() {
        if (timer) {
          clearInterval(timer);
          timer = null;
        }
      }

      if (prev) {
        prev.addEventListener('click', function () {
          show(current - 1);
          start();
        });
      }
      if (next) {
        next.addEventListener('click', function () {
          show(current + 1);
          start();
        });
      }
      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          show(Number(dot.getAttribute('data-hero-dot') || 0));
          start();
        });
      });
      hero.addEventListener('mouseenter', stop);
      hero.addEventListener('mouseleave', start);
      show(0);
      start();
    }

    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
    panels.forEach(function (panel) {
      var root = panel.parentElement;
      var grid = root ? root.querySelector('[data-filterable]') : null;
      if (!grid) {
        return;
      }
      var input = panel.querySelector('[data-filter-input]');
      var region = panel.querySelector('[data-region-filter]');
      var year = panel.querySelector('[data-year-filter]');
      var status = root.querySelector('[data-filter-status]');
      var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));

      if (input && input.hasAttribute('data-url-query')) {
        var params = new URLSearchParams(window.location.search);
        var value = params.get(input.getAttribute('data-url-query'));
        if (value) {
          input.value = value;
        }
      }

      function matchYear(cardYear, selected) {
        if (!selected) {
          return true;
        }
        if (selected === '2010' || selected === '2000' || selected === '1990') {
          return cardYear.indexOf(selected.slice(0, 3)) === 0;
        }
        return cardYear.indexOf(selected) !== -1;
      }

      function apply() {
        var keyword = input ? input.value.trim().toLowerCase() : '';
        var selectedRegion = region ? region.value : '';
        var selectedYear = year ? year.value : '';
        var visible = 0;
        cards.forEach(function (card) {
          var text = [
            card.getAttribute('data-title') || '',
            card.getAttribute('data-region') || '',
            card.getAttribute('data-genre') || '',
            card.getAttribute('data-year') || '',
            card.getAttribute('data-tags') || '',
            card.textContent || ''
          ].join(' ').toLowerCase();
          var regionText = card.getAttribute('data-region') || '';
          var yearText = card.getAttribute('data-year') || '';
          var ok = (!keyword || text.indexOf(keyword) !== -1) &&
            (!selectedRegion || regionText.indexOf(selectedRegion) !== -1) &&
            matchYear(yearText, selectedYear);
          card.classList.toggle('hidden', !ok);
          if (ok) {
            visible += 1;
          }
        });
        if (status) {
          status.textContent = visible ? '筛选结果：' + visible + ' 部影片' : '没有找到匹配影片';
        }
      }

      ['input', 'change'].forEach(function (eventName) {
        if (input) {
          input.addEventListener(eventName, apply);
        }
        if (region) {
          region.addEventListener(eventName, apply);
        }
        if (year) {
          year.addEventListener(eventName, apply);
        }
      });
      apply();
    });
  });
})();
