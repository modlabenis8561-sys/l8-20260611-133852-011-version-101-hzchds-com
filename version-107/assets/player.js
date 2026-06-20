function initMoviePlayer(videoId, url) {
    var video = document.getElementById(videoId);

    if (!video) {
        return;
    }

    var shell = video.closest(".player-shell");
    var overlay = shell ? shell.querySelector(".player-overlay") : null;
    var attached = false;

    function attach() {
        if (attached) {
            return;
        }

        attached = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = url;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new Hls({
                enableWorker: true,
                backBufferLength: 90
            });

            hls.loadSource(url);
            hls.attachMedia(video);
            return;
        }

        video.src = url;
    }

    function start() {
        attach();
        video.controls = true;

        if (overlay) {
            overlay.classList.add("is-hidden");
        }

        var result = video.play();

        if (result && typeof result.catch === "function") {
            result.catch(function () {});
        }
    }

    if (overlay) {
        overlay.addEventListener("click", start);
    }

    video.addEventListener("click", function () {
        if (video.paused) {
            start();
        }
    });
}
