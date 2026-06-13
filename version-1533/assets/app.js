(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function queryAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-menu]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function initSiteSearch() {
        queryAll("[data-site-search]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                }
            });
        });
    }

    function initHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }
        var slides = queryAll("[data-hero-slide]", root);
        var dots = queryAll("[data-hero-dot]", root);
        var prev = root.querySelector("[data-hero-prev]");
        var next = root.querySelector("[data-hero-next]");
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

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                var target = parseInt(dot.getAttribute("data-hero-dot"), 10);
                show(target);
                start();
            });
        });
        root.addEventListener("mouseenter", stop);
        root.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function applyFilters(scope) {
        var form = scope.querySelector("[data-filter-form]");
        if (!form) {
            return;
        }
        var textInput = form.querySelector("[data-filter-text]");
        var yearInput = form.querySelector("[data-filter-year]");
        var typeInput = form.querySelector("[data-filter-type]");
        var cards = queryAll("[data-card]", scope);
        var empty = form.querySelector("[data-filter-empty]");
        var text = textInput ? textInput.value.trim().toLowerCase() : "";
        var year = yearInput ? yearInput.value : "";
        var type = typeInput ? typeInput.value : "";
        var visible = 0;

        cards.forEach(function (card) {
            var cardText = (card.getAttribute("data-card-text") || "").toLowerCase();
            var cardYear = card.getAttribute("data-year") || "";
            var cardType = card.getAttribute("data-type") || "";
            var matched = true;
            if (text && cardText.indexOf(text) === -1) {
                matched = false;
            }
            if (year && cardYear !== year) {
                matched = false;
            }
            if (type && cardType !== type) {
                matched = false;
            }
            card.classList.toggle("is-hidden", !matched);
            if (matched) {
                visible += 1;
            }
        });

        if (empty) {
            empty.classList.toggle("is-visible", visible === 0);
        }
    }

    function initFilters() {
        queryAll("[data-filter-scope]").forEach(function (scope) {
            var form = scope.querySelector("[data-filter-form]");
            if (!form) {
                return;
            }
            queryAll("input, select", form).forEach(function (input) {
                input.addEventListener("input", function () {
                    applyFilters(scope);
                });
                input.addEventListener("change", function () {
                    applyFilters(scope);
                });
            });
            applyFilters(scope);
        });
    }

    function initSearchQuery() {
        var page = document.querySelector("[data-search-page]");
        if (!page) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        var input = page.querySelector("[data-search-input]");
        if (input && query) {
            input.value = query;
            applyFilters(page);
        }
    }

    ready(function () {
        initMenu();
        initSiteSearch();
        initHero();
        initFilters();
        initSearchQuery();
    });
})();
