document.addEventListener('DOMContentLoaded', function () {
    var video = document.querySelector('[data-video-player]');
    var button = document.querySelector('[data-play-trigger]');

    if (!video) {
        return;
    }

    var source = video.getAttribute('data-src');
    var frame = video.closest('.video-frame');
    var prepared = false;
    var hls = null;

    function markPlaying() {
        if (frame) {
            frame.classList.add('is-playing');
        }
    }

    function prepare(playAfterReady) {
        if (!source) {
            return;
        }

        if (prepared) {
            if (playAfterReady) {
                video.play().then(markPlaying).catch(function () {});
            }
            return;
        }

        prepared = true;

        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: false,
                backBufferLength: 90
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                if (playAfterReady) {
                    video.play().then(markPlaying).catch(function () {});
                }
            });
            hls.on(window.Hls.Events.ERROR, function (event, data) {
                if (!data || !data.fatal) {
                    return;
                }
                if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                    hls.startLoad();
                } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                    hls.recoverMediaError();
                } else {
                    hls.destroy();
                }
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            if (playAfterReady) {
                video.play().then(markPlaying).catch(function () {});
            }
        } else {
            video.src = source;
            if (playAfterReady) {
                video.play().then(markPlaying).catch(function () {});
            }
        }
    }

    if (button) {
        button.addEventListener('click', function () {
            prepare(true);
        });
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            prepare(true);
        }
    });

    video.addEventListener('play', markPlaying);
    video.addEventListener('loadedmetadata', function () {
        if (!video.paused) {
            markPlaying();
        }
    });

    window.addEventListener('beforeunload', function () {
        if (hls) {
            hls.destroy();
        }
    });
});
