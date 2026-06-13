(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function setupNav() {
        var toggle = document.querySelector("[data-nav-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("open");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot") || 0));
                start();
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                start();
            });
        }
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function setupCardFilters() {
        var panel = document.querySelector("[data-filter-panel]");
        var grid = document.querySelector("[data-card-grid]");
        if (!panel || !grid) {
            return;
        }
        var search = panel.querySelector("[data-card-search]");
        var year = panel.querySelector("[data-filter-year]");
        var region = panel.querySelector("[data-filter-region]");
        var type = panel.querySelector("[data-filter-type]");
        var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-movie-card]"));

        function apply() {
            var query = normalize(search && search.value);
            var yearValue = normalize(year && year.value);
            var regionValue = normalize(region && region.value);
            var typeValue = normalize(type && type.value);

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-tags"),
                    card.textContent
                ].join(" "));
                var ok = true;
                if (query && haystack.indexOf(query) === -1) {
                    ok = false;
                }
                if (yearValue && normalize(card.getAttribute("data-year")) !== yearValue) {
                    ok = false;
                }
                if (regionValue && normalize(card.getAttribute("data-region")) !== regionValue) {
                    ok = false;
                }
                if (typeValue && normalize(card.getAttribute("data-type")) !== typeValue) {
                    ok = false;
                }
                card.classList.toggle("hidden", !ok);
            });
        }

        [search, year, region, type].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });
        apply();
    }

    function cardHtml(movie) {
        return [
            '<article class="movie-card">',
            '<a class="card-cover" href="' + movie.url + '" aria-label="' + escapeHtml(movie.title) + '">',
            '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '<span class="cover-gradient"></span>',
            '<span class="play-dot" aria-hidden="true"></span>',
            '<span class="card-region">' + escapeHtml(movie.region) + '</span>',
            '<span class="card-year">' + escapeHtml(movie.year) + '</span>',
            '</a>',
            '<div class="card-body">',
            '<h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
            '<p>' + escapeHtml(movie.oneLine) + '</p>',
            '<div class="card-meta"><span>' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>',
            '</div>',
            '</article>'
        ].join("");
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    function setupGlobalSearch() {
        var form = document.querySelector("[data-global-search-form]");
        var input = document.querySelector("[data-global-search-input]");
        var results = document.querySelector("[data-global-search-results]");
        var defaults = document.querySelector("[data-search-default]");
        if (!form || !input || !results || !window.SEARCH_MOVIES) {
            return;
        }

        function render() {
            var query = normalize(input.value);
            if (!query) {
                results.innerHTML = "";
                if (defaults) {
                    defaults.style.display = "block";
                }
                return;
            }
            var matches = window.SEARCH_MOVIES.filter(function (movie) {
                return normalize([
                    movie.title,
                    movie.oneLine,
                    movie.region,
                    movie.type,
                    movie.year,
                    movie.genre,
                    movie.tags
                ].join(" ")).indexOf(query) !== -1;
            }).slice(0, 80);
            if (defaults) {
                defaults.style.display = "none";
            }
            if (!matches.length) {
                results.innerHTML = '<section class="content-section"><div class="section-head"><div><h2>暂无匹配结果</h2><p>可以尝试更换影片名、地区、类型或年份继续搜索。</p></div></div></section>';
                return;
            }
            results.innerHTML = '<section class="content-section"><div class="section-head"><div><h2>搜索结果</h2><p>点击影片卡片进入详情与播放页面。</p></div></div><div class="movie-grid">' + matches.map(cardHtml).join("") + '</div></section>';
        }

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            render();
        });
        input.addEventListener("input", render);
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q");
        if (q) {
            input.value = q;
            render();
        }
    }

    function setupPlayer(source) {
        var video = document.getElementById("movie-player");
        var cover = document.getElementById("player-cover");
        if (!video || !cover || !source) {
            return;
        }
        var attached = false;
        var hls = null;

        function attach() {
            if (attached) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                attached = true;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                attached = true;
                return;
            }
            video.src = source;
            attached = true;
        }

        function start() {
            attach();
            cover.classList.add("is-hidden");
            video.controls = true;
            var play = video.play();
            if (play && typeof play.catch === "function") {
                play.catch(function () {});
            }
        }

        cover.addEventListener("click", start);
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener("play", function () {
            cover.classList.add("is-hidden");
        });
        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    ready(function () {
        setupNav();
        setupHero();
        setupCardFilters();
        setupGlobalSearch();
    });

    window.MovieSite = {
        setupPlayer: setupPlayer
    };
})();
