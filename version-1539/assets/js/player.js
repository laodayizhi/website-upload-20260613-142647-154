(function () {
  function init(source) {
    var video = document.getElementById("movie-player");
    var overlay = document.getElementById("player-overlay");
    if (!video || !overlay || !source) {
      return;
    }
    var started = false;
    var hls = null;

    function begin() {
      if (started) {
        video.play().catch(function () {});
        return;
      }
      started = true;
      overlay.setAttribute("hidden", "");
      video.setAttribute("controls", "controls");

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        video.addEventListener("loadedmetadata", function () {
          video.play().catch(function () {});
        }, { once: true });
        video.play().catch(function () {});
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        return;
      }

      video.src = source;
      video.play().catch(function () {});
    }

    overlay.addEventListener("click", begin);
    video.addEventListener("click", function () {
      if (!started) {
        begin();
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  window.SitePlayer = {
    init: init
  };
})();
