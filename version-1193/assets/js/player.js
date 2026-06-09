(function () {
    window.initMoviePlayer = function (url) {
        var video = document.getElementById("movie-player");
        var layer = document.querySelector(".play-layer");
        var hlsInstance = null;
        var loaded = false;

        if (!video || !url) {
            return;
        }

        function bindSource() {
            if (loaded) {
                return;
            }
            loaded = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = url;
                video.play().catch(function () {});
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    maxBufferLength: 30,
                    enableWorker: true
                });
                hlsInstance.loadSource(url);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hlsInstance.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hlsInstance.recoverMediaError();
                    } else {
                        hlsInstance.destroy();
                    }
                });
                return;
            }

            video.src = url;
            video.play().catch(function () {});
        }

        function start() {
            bindSource();
            if (layer) {
                layer.classList.add("is-hidden");
            }
            video.play().catch(function () {});
        }

        if (layer) {
            layer.addEventListener("click", start);
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });

        video.addEventListener("play", function () {
            if (layer) {
                layer.classList.add("is-hidden");
            }
        });

        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };
})();
