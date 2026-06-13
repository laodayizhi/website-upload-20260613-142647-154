(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var players = Array.prototype.slice.call(document.querySelectorAll('.js-player'));
    players.forEach(function (player) {
      var video = player.querySelector('video');
      var toggle = player.querySelector('.player-toggle');
      var state = player.querySelector('.player-state');
      var mute = player.querySelector('[data-mute]');
      var fullscreen = player.querySelector('[data-fullscreen]');
      var stream = video ? video.getAttribute('data-stream') : '';
      var hlsInstance = null;

      if (!video || !stream) {
        if (state) {
          state.textContent = '视频暂时无法播放';
        }
        player.classList.add('is-error');
        return;
      }

      function setState(text) {
        if (state) {
          state.textContent = text;
        }
      }

      function refresh() {
        var playing = !video.paused && !video.ended;
        player.classList.toggle('is-playing', playing);
        player.classList.toggle('is-paused', !playing);
        if (toggle) {
          toggle.textContent = playing ? 'Ⅱ' : '▶';
        }
        setState(playing ? '正在播放' : '点击播放');
      }

      function attach() {
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setState('视频暂时无法播放');
              player.classList.add('is-error');
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else {
          setState('该浏览器暂不支持此播放格式');
          player.classList.add('is-error');
        }
      }

      function togglePlay() {
        if (player.classList.contains('is-error')) {
          return;
        }
        if (video.paused) {
          video.play().then(refresh).catch(function () {
            setState('点击播放');
          });
        } else {
          video.pause();
          refresh();
        }
      }

      attach();
      refresh();

      video.addEventListener('click', togglePlay);
      video.addEventListener('play', refresh);
      video.addEventListener('pause', refresh);
      video.addEventListener('ended', refresh);

      if (toggle) {
        toggle.addEventListener('click', togglePlay);
      }
      if (mute) {
        mute.addEventListener('click', function () {
          video.muted = !video.muted;
          mute.textContent = video.muted ? '取消静音' : '静音';
        });
      }
      if (fullscreen) {
        fullscreen.addEventListener('click', function () {
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else if (player.requestFullscreen) {
            player.requestFullscreen();
          }
        });
      }

      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  });
})();
