(function () {
  const video = document.getElementById('movieVideo');
  const player = document.querySelector('[data-player]');
  const cover = player ? player.querySelector('.player-cover') : null;
  const message = player ? player.querySelector('[data-player-error]') : null;
  let connected = false;
  let hlsInstance = null;

  function setMessage(value) {
    if (message) {
      message.textContent = value || '';
    }
  }

  function attachStream() {
    if (!video || connected) {
      return Promise.resolve();
    }

    if (typeof streamUrl !== 'string' || !streamUrl) {
      setMessage('播放内容暂时无法加载');
      return Promise.reject(new Error('empty stream'));
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      connected = true;
      return Promise.resolve();
    }

    if (globalThis.Hls && globalThis.Hls.isSupported()) {
      hlsInstance = new globalThis.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
      connected = true;
      return new Promise(function (resolve) {
        hlsInstance.on(globalThis.Hls.Events.MANIFEST_PARSED, function () {
          resolve();
        });
      });
    }

    video.src = streamUrl;
    connected = true;
    return Promise.resolve();
  }

  function startPlayback() {
    if (!video) {
      return;
    }

    if (cover) {
      cover.classList.add('is-hidden');
    }

    attachStream()
      .then(function () {
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            if (cover) {
              cover.classList.remove('is-hidden');
            }
            setMessage('点击播放按钮开始观看');
          });
        }
      })
      .catch(function () {
        if (cover) {
          cover.classList.remove('is-hidden');
        }
        setMessage('播放内容暂时无法加载');
      });
  }

  if (cover) {
    cover.addEventListener('click', startPlayback);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (!connected || video.paused) {
        startPlayback();
      }
    });
    video.addEventListener('error', function () {
      setMessage('播放内容暂时无法加载');
      if (cover) {
        cover.classList.remove('is-hidden');
      }
    });
  }
})();
