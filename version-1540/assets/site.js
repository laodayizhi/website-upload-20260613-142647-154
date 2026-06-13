(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobilePanel = document.querySelector('.mobile-panel');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            var open = mobilePanel.hasAttribute('hidden');
            if (open) {
                mobilePanel.removeAttribute('hidden');
                menuButton.setAttribute('aria-expanded', 'true');
                menuButton.textContent = '×';
            } else {
                mobilePanel.setAttribute('hidden', '');
                menuButton.setAttribute('aria-expanded', 'false');
                menuButton.textContent = '☰';
            }
        });
    }

    var slider = document.querySelector('[data-slider]');
    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dots button'));
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

        function startSlider() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-slide')) || 0);
                startSlider();
            });
        });

        startSlider();
    }

    var filterInput = document.querySelector('.card-filter');
    var typeFilter = document.querySelector('.type-filter');
    var yearFilter = document.querySelector('.year-filter');
    var categoryFilter = document.querySelector('.category-filter');
    var filterTarget = document.querySelector('.filter-target');
    var emptyState = document.querySelector('.empty-state');

    function applyFilters() {
        if (!filterTarget) {
            return;
        }

        var query = filterInput ? filterInput.value.trim().toLowerCase() : '';
        var typeValue = typeFilter ? typeFilter.value.trim().toLowerCase() : '';
        var yearValue = yearFilter ? yearFilter.value.trim() : '';
        var categoryValue = categoryFilter ? categoryFilter.value.trim() : '';
        var cards = Array.prototype.slice.call(filterTarget.querySelectorAll('.movie-card'));
        var shown = 0;

        cards.forEach(function (card) {
            var keywords = (card.getAttribute('data-keywords') || '').toLowerCase();
            var title = (card.getAttribute('data-title') || '').toLowerCase();
            var type = (card.getAttribute('data-type') || '').toLowerCase();
            var year = card.getAttribute('data-year') || '';
            var category = card.getAttribute('data-category') || '';
            var ok = true;

            if (query && keywords.indexOf(query) === -1 && title.indexOf(query) === -1) {
                ok = false;
            }
            if (typeValue && type.indexOf(typeValue) === -1) {
                ok = false;
            }
            if (yearValue && year !== yearValue) {
                ok = false;
            }
            if (categoryValue && category !== categoryValue) {
                ok = false;
            }

            card.hidden = !ok;
            if (ok) {
                shown += 1;
            }
        });

        if (emptyState) {
            emptyState.hidden = shown !== 0;
        }
    }

    if (filterInput || typeFilter || yearFilter || categoryFilter) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q') || '';

        if (filterInput && q) {
            filterInput.value = q;
        }

        [filterInput, typeFilter, yearFilter, categoryFilter].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilters);
                control.addEventListener('change', applyFilters);
            }
        });

        applyFilters();
    }

    function setupPlayer(wrapper) {
        var video = wrapper.querySelector('.player-video');
        var button = wrapper.querySelector('.player-start');

        if (!video || !button) {
            return;
        }

        function loadAndPlay() {
            var stream = video.getAttribute('data-stream');
            if (!stream) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                if (!video.src) {
                    video.src = stream;
                }
                wrapper.classList.add('is-playing');
                video.play().catch(function () {});
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                if (!video.dataset.hlsReady) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    video.dataset.hlsReady = '1';
                }
                wrapper.classList.add('is-playing');
                video.play().catch(function () {});
                return;
            }

            if (!video.src) {
                video.src = stream;
            }
            wrapper.classList.add('is-playing');
            video.play().catch(function () {});
        }

        button.addEventListener('click', loadAndPlay);
        video.addEventListener('click', function () {
            if (video.paused) {
                loadAndPlay();
            }
        });
        video.addEventListener('play', function () {
            wrapper.classList.add('is-playing');
        });
    }

    Array.prototype.slice.call(document.querySelectorAll('.player-wrap')).forEach(setupPlayer);
})();
