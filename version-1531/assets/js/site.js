const formatTime = (seconds) => {
    if (!Number.isFinite(seconds) || seconds < 0) {
        return '0:00';
    }

    const minutes = Math.floor(seconds / 60);
    const rest = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${rest}`;
};

const setText = (element, value) => {
    if (element) {
        element.textContent = value;
    }
};

const initMobileNav = () => {
    const button = document.querySelector('[data-mobile-toggle]');
    const nav = document.querySelector('[data-mobile-nav]');

    if (!button || !nav) {
        return;
    }

    button.addEventListener('click', () => {
        nav.classList.toggle('is-open');
    });
};

const initHeroCarousel = () => {
    const carousel = document.querySelector('[data-hero-carousel]');

    if (!carousel) {
        return;
    }

    const slides = Array.from(carousel.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
    let activeIndex = 0;

    const showSlide = (index) => {
        activeIndex = (index + slides.length) % slides.length;

        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle('is-active', slideIndex === activeIndex);
        });

        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle('is-active', dotIndex === activeIndex);
        });
    };

    dots.forEach((dot, dotIndex) => {
        dot.addEventListener('click', () => showSlide(dotIndex));
    });

    if (slides.length > 1) {
        window.setInterval(() => showSlide(activeIndex + 1), 5000);
    }
};

const initHorizontalScroll = () => {
    const buttons = document.querySelectorAll('[data-scroll-target]');

    buttons.forEach((button) => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-scroll-target');
            const direction = button.getAttribute('data-scroll-direction') === 'left' ? -1 : 1;
            const scroller = document.getElementById(targetId);

            if (scroller) {
                scroller.scrollBy({ left: direction * 420, behavior: 'smooth' });
            }
        });
    });
};

const initSearchPage = () => {
    const page = document.querySelector('[data-search-page]');

    if (!page) {
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q') || '';
    const input = page.querySelector('[data-search-input]');
    const cards = Array.from(page.querySelectorAll('.search-card'));
    const count = page.querySelector('[data-search-count]');

    const filterCards = () => {
        const query = (input?.value || '').trim().toLowerCase();
        let visible = 0;

        cards.forEach((card) => {
            const haystack = [
                card.getAttribute('data-title'),
                card.getAttribute('data-tags'),
                card.getAttribute('data-year'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.textContent,
            ].join(' ').toLowerCase();

            const matched = !query || haystack.includes(query);
            card.classList.toggle('is-hidden', !matched);

            if (matched) {
                visible += 1;
            }
        });

        setText(count, query ? `找到 ${visible} 部相关影片` : `共 ${cards.length} 部影片`);
    };

    if (input) {
        input.value = initialQuery;
        input.addEventListener('input', filterCards);
    }

    filterCards();
};

const initImageFallback = () => {
    document.querySelectorAll('img').forEach((image) => {
        image.addEventListener('error', () => {
            image.style.opacity = '0';
            image.closest('.poster, .hero-carousel, .detail-cover')?.classList.add('image-missing');
        }, { once: true });
    });
};

const initVideoPlayers = async () => {
    const players = Array.from(document.querySelectorAll('[data-video-player]'));

    if (!players.length) {
        return;
    }

    let HlsClass = null;

    const getHlsClass = async () => {
        if (HlsClass) {
            return HlsClass;
        }

        const module = await import('./hls-vendor-dru42stk.js');
        HlsClass = module.H;
        return HlsClass;
    };

    for (const player of players) {
        const video = player.querySelector('video');
        const source = player.getAttribute('data-video-src');
        const playButtons = player.querySelectorAll('[data-play-button], [data-overlay-play]');
        const muteButton = player.querySelector('[data-mute-button]');
        const progress = player.querySelector('[data-progress]');
        const currentTime = player.querySelector('[data-current-time]');
        const duration = player.querySelector('[data-duration]');
        const fullscreenButton = player.querySelector('[data-fullscreen-button]');
        const overlay = player.querySelector('[data-overlay-play]');
        const message = player.querySelector('[data-player-message]');

        if (!video || !source) {
            setText(message, '当前影片暂未配置播放源。');
            continue;
        }

        const attachSource = async () => {
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                return;
            }

            try {
                const Hls = await getHlsClass();

                if (Hls && Hls.isSupported()) {
                    const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    player._hls = hls;
                    return;
                }
            } catch (error) {
                setText(message, '播放器组件加载失败，请通过静态服务器访问页面后重试。');
                return;
            }

            setText(message, '当前浏览器不支持 HLS 播放。');
        };

        await attachSource();

        const updateButtons = () => {
            playButtons.forEach((button) => {
                button.textContent = video.paused ? '▶' : 'Ⅱ';
            });

            overlay?.classList.toggle('is-hidden', !video.paused);
        };

        const togglePlay = async () => {
            try {
                if (video.paused) {
                    await video.play();
                } else {
                    video.pause();
                }
            } catch (error) {
                setText(message, '播放被浏览器阻止，请再次点击播放按钮。');
            }
        };

        playButtons.forEach((button) => {
            button.addEventListener('click', togglePlay);
        });

        video.addEventListener('click', togglePlay);
        video.addEventListener('play', updateButtons);
        video.addEventListener('pause', updateButtons);
        video.addEventListener('loadedmetadata', () => {
            if (progress) {
                progress.max = Number.isFinite(video.duration) ? video.duration : 0;
            }

            setText(duration, formatTime(video.duration));
        });

        video.addEventListener('timeupdate', () => {
            if (progress) {
                progress.value = video.currentTime;
            }

            setText(currentTime, formatTime(video.currentTime));
        });

        muteButton?.addEventListener('click', () => {
            video.muted = !video.muted;
            muteButton.textContent = video.muted ? '🔇' : '🔊';
        });

        progress?.addEventListener('input', () => {
            video.currentTime = Number(progress.value || 0);
        });

        fullscreenButton?.addEventListener('click', async () => {
            const stage = player.querySelector('.video-stage') || video;

            if (document.fullscreenElement) {
                await document.exitFullscreen();
            } else if (stage.requestFullscreen) {
                await stage.requestFullscreen();
            }
        });

        updateButtons();
    }

    window.addEventListener('beforeunload', () => {
        players.forEach((player) => {
            if (player._hls) {
                player._hls.destroy();
            }
        });
    });
};

document.addEventListener('DOMContentLoaded', () => {
    initMobileNav();
    initHeroCarousel();
    initHorizontalScroll();
    initSearchPage();
    initImageFallback();
    initVideoPlayers();
});
