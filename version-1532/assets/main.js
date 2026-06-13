(function () {
  const menuButton = document.querySelector('[data-menu-button]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-site-search]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      const input = form.querySelector('input[name="q"]');
      const query = input ? input.value.trim() : '';
      const root = form.getAttribute('data-root') || '';
      const target = root + 'search.html' + (query ? '?q=' + encodeURIComponent(query) : '');
      window.location.href = target;
    });
  });

  const carousel = document.querySelector('[data-carousel]');
  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
    let current = 0;
    let timer = null;

    function show(index) {
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

    function start() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    show(0);
    start();
  }

  const panel = document.querySelector('[data-filter-panel]');
  if (panel) {
    const queryInput = panel.querySelector('[data-filter-query]');
    const categorySelect = panel.querySelector('[data-filter-category]');
    const typeSelect = panel.querySelector('[data-filter-type]');
    const yearSelect = panel.querySelector('[data-filter-year]');
    const resetButton = panel.querySelector('[data-filter-reset]');
    const cards = Array.from(document.querySelectorAll('[data-card]'));
    const resultTitle = document.querySelector('[data-result-title]');
    const params = new URLSearchParams(window.location.search);

    if (queryInput && params.get('q')) {
      queryInput.value = params.get('q');
    }

    function valueOf(element) {
      return element ? element.value.trim().toLowerCase() : '';
    }

    function applyFilters() {
      const keyword = valueOf(queryInput);
      const category = valueOf(categorySelect);
      const type = valueOf(typeSelect);
      const year = valueOf(yearSelect);
      let visible = 0;

      cards.forEach(function (card) {
        const title = (card.getAttribute('data-title') || '').toLowerCase();
        const keywords = (card.getAttribute('data-keywords') || '').toLowerCase();
        const cardCategory = (card.getAttribute('data-category') || '').toLowerCase();
        const cardType = (card.getAttribute('data-type') || '').toLowerCase();
        const cardYear = (card.getAttribute('data-year') || '').toLowerCase();
        const text = title + ' ' + keywords;
        const matched =
          (!keyword || text.indexOf(keyword) !== -1) &&
          (!category || cardCategory === category) &&
          (!type || cardType.indexOf(type) !== -1) &&
          (!year || cardYear === year);

        card.classList.toggle('is-hidden', !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (resultTitle) {
        resultTitle.textContent = visible ? '影片列表 · ' + visible : '暂无匹配影片';
      }
    }

    [queryInput, categorySelect, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    if (resetButton) {
      resetButton.addEventListener('click', function () {
        if (queryInput) queryInput.value = '';
        if (categorySelect) categorySelect.value = '';
        if (typeSelect) typeSelect.value = '';
        if (yearSelect) yearSelect.value = '';
        applyFilters();
      });
    }

    applyFilters();
  }
})();
