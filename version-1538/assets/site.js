import { H as Hls } from './hls-dru42stk.js';

const ready = (callback) => {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', callback);
    } else {
        callback();
    }
};

const normalize = (value) => String(value || '').trim().toLowerCase();

function setupMobileNavigation() {
    const toggle = document.querySelector('[data-mobile-toggle]');
    const nav = document.querySelector('[data-mobile-nav]');

    if (!toggle || !nav) {
        return;
    }

    toggle.addEventListener('click', () => {
        nav.classList.toggle('is-open');
    });
}

function setupSiteSearchForms() {
    document.querySelectorAll('[data-site-search]').forEach((form) => {
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const input = form.querySelector('input[name="q"]');
            const query = input ? input.value.trim() : '';
            const target = query ? `search.html?q=${encodeURIComponent(query)}` : 'search.html';
            window.location.href = target;
        });
    });
}

function compareCards(a, b, mode) {
    const number = (element, name) => Number(element.dataset[name] || 0);
    const titleA = normalize(a.dataset.title);
    const titleB = normalize(b.dataset.title);

    switch (mode) {
        case 'year-asc':
            return number(a, 'year') - number(b, 'year');
        case 'views-desc':
            return number(b, 'views') - number(a, 'views');
        case 'likes-desc':
            return number(b, 'likes') - number(a, 'likes');
        case 'title-asc':
            return titleA.localeCompare(titleB, 'zh-Hans-CN');
        case 'year-desc':
        default:
            return number(b, 'year') - number(a, 'year');
    }
}

function setupArchiveFiltering() {
    const grid = document.querySelector('[data-card-grid]');

    if (!grid) {
        return;
    }

    const cards = Array.from(grid.children);
    const filter = document.querySelector('[data-page-filter]');
    const sort = document.querySelector('[data-sort-select]');
    const count = document.querySelector('[data-result-count]');
    const empty = document.querySelector('[data-empty-state]');
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q') || '';

    if (filter && initialQuery) {
        filter.value = initialQuery;
    }

    const apply = () => {
        const query = normalize(filter ? filter.value : '');
        const mode = sort ? sort.value : 'year-desc';
        const ordered = [...cards].sort((a, b) => compareCards(a, b, mode));
        let visible = 0;

        ordered.forEach((card) => {
            const haystack = normalize(`${card.dataset.title || ''} ${card.dataset.text || ''}`);
            const matched = !query || haystack.includes(query);
            card.hidden = !matched;
            if (matched) {
                visible += 1;
            }
            grid.appendChild(card);
        });

        if (count) {
            count.textContent = `${visible} 部影片`;
        }

        if (empty) {
            empty.hidden = visible !== 0;
        }
    };

    if (filter) {
        filter.addEventListener('input', apply);
    }

    if (sort) {
        sort.addEventListener('change', apply);
    }

    apply();
}

function setupPlayers() {
    document.querySelectorAll('[data-player]').forEach((player) => {
        const video = player.querySelector('video[data-hls]');
        const overlay = player.querySelector('[data-play-overlay]');

        if (!video) {
            return;
        }

        const source = video.dataset.hls;

        if (source) {
            if (Hls && Hls.isSupported()) {
                const hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(Hls.Events.ERROR, (event, data) => {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        hls.destroy();
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            }
        }

        const play = () => {
            const request = video.play();
            if (request && typeof request.catch === 'function') {
                request.catch(() => {
                    player.classList.remove('is-playing');
                });
            }
        };

        if (overlay) {
            overlay.addEventListener('click', () => {
                if (video.paused) {
                    play();
                } else {
                    video.pause();
                }
            });
        }

        video.addEventListener('play', () => {
            player.classList.add('is-playing');
        });

        video.addEventListener('pause', () => {
            player.classList.remove('is-playing');
        });

        video.addEventListener('ended', () => {
            player.classList.remove('is-playing');
        });
    });
}

ready(() => {
    setupMobileNavigation();
    setupSiteSearchForms();
    setupArchiveFiltering();
    setupPlayers();
});
