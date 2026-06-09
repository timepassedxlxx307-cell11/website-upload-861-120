(function () {
  function attachPlayer(shell) {
    var video = shell.querySelector("video");
    var button = shell.querySelector(".player-cover");
    var stream = shell.getAttribute("data-stream");
    var attached = false;

    if (!video || !stream) {
      return;
    }

    function bind() {
      if (attached) {
        return;
      }

      attached = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls();
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
    }

    function start() {
      bind();

      if (button) {
        button.classList.add("hidden");
      }

      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          video.controls = true;
        });
      }
    }

    if (button) {
      button.addEventListener("click", start);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });

    video.addEventListener("play", function () {
      if (button) {
        button.classList.add("hidden");
      }
    });
  }

  document.querySelectorAll("[data-player]").forEach(attachPlayer);
})();
