(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var shell = document.querySelector("[data-player]");
        var config = document.getElementById("player-config");
        if (!shell || !config) {
            return;
        }
        var video = shell.querySelector("video");
        var button = shell.querySelector("[data-player-button]");
        if (!video) {
            return;
        }
        var src = "";
        try {
            src = JSON.parse(config.textContent).src || "";
        } catch (error) {
            src = "";
        }
        var hls = null;
        var started = false;

        function attach() {
            if (!src) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                if (video.getAttribute("src") !== src) {
                    video.setAttribute("src", src);
                }
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                if (!hls) {
                    hls = new window.Hls({ enableWorker: true });
                    hls.loadSource(src);
                    hls.attachMedia(video);
                }
                return;
            }
            if (video.getAttribute("src") !== src) {
                video.setAttribute("src", src);
            }
        }

        function start() {
            attach();
            started = true;
            video.controls = true;
            if (button) {
                button.classList.add("is-hidden");
            }
            var playTask = video.play();
            if (playTask && typeof playTask.catch === "function") {
                playTask.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener("click", start);
        }
        video.addEventListener("click", function () {
            if (!started) {
                start();
            }
        });
        video.addEventListener("play", function () {
            started = true;
            if (button) {
                button.classList.add("is-hidden");
            }
        });
    });
})();
