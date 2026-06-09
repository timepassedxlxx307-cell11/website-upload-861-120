(function () {
    function initPlayer(source) {
        var video = document.getElementById("moviePlayer");
        var overlay = document.getElementById("playOverlay");
        var attached = false;
        var hlsInstance = null;

        if (!video || !source) {
            return;
        }

        function attachSource() {
            if (attached) {
                return;
            }

            attached = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                return;
            }

            video.src = source;
        }

        function startPlayback() {
            attachSource();

            if (overlay) {
                overlay.classList.add("is-hidden");
            }

            var request = video.play();

            if (request && typeof request.catch === "function") {
                request.catch(function () {});
            }
        }

        if (overlay) {
            overlay.addEventListener("click", startPlayback);
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                startPlayback();
            }
        });

        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        });

        video.addEventListener("ended", function () {
            if (overlay) {
                overlay.classList.remove("is-hidden");
            }
        });

        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    }

    window.initPlayer = initPlayer;
})();
