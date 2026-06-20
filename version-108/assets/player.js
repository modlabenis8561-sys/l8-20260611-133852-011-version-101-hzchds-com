(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    document.querySelectorAll("[data-player]").forEach(function (player) {
      var video = player.querySelector("video");
      var overlay = player.querySelector(".player-overlay");
      var source = player.getAttribute("data-src");
      var hls = null;
      var loading = false;

      if (!video || !source) {
        return;
      }

      function attachSource() {
        return new Promise(function (resolve) {
          if (video.getAttribute("data-loaded") === "1") {
            resolve();
            return;
          }

          if (loading) {
            var wait = window.setInterval(function () {
              if (video.getAttribute("data-loaded") === "1") {
                window.clearInterval(wait);
                resolve();
              }
            }, 80);
            return;
          }

          loading = true;

          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            video.setAttribute("data-loaded", "1");
            resolve();
            return;
          }

          if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true,
              backBufferLength: 90
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
              video.setAttribute("data-loaded", "1");
              resolve();
            });
            hls.on(window.Hls.Events.ERROR, function () {
              video.setAttribute("data-loaded", "1");
              resolve();
            });
            return;
          }

          video.src = source;
          video.setAttribute("data-loaded", "1");
          resolve();
        });
      }

      function hideOverlay() {
        if (overlay) {
          overlay.setAttribute("hidden", "hidden");
        }
        player.classList.add("is-playing");
      }

      function startVideo() {
        attachSource().then(function () {
          hideOverlay();
          var promise = video.play();
          if (promise && typeof promise.catch === "function") {
            promise.catch(function () {
              if (overlay) {
                overlay.removeAttribute("hidden");
              }
            });
          }
        });
      }

      if (overlay) {
        overlay.addEventListener("click", startVideo);
      }

      video.addEventListener("click", function () {
        if (video.paused) {
          startVideo();
        }
      });

      video.addEventListener("play", hideOverlay);

      video.addEventListener("ended", function () {
        if (overlay) {
          overlay.removeAttribute("hidden");
        }
        player.classList.remove("is-playing");
      });

      document.querySelectorAll("[data-player-start]").forEach(function (button) {
        button.addEventListener("click", function (event) {
          event.preventDefault();
          player.scrollIntoView({
            behavior: "smooth",
            block: "center"
          });
          startVideo();
        });
      });

      window.addEventListener("pagehide", function () {
        if (hls) {
          hls.destroy();
          hls = null;
        }
      });
    });
  });
})();
