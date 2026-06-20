(function () {
    function initMoviePlayer(videoId, source) {
        var video = document.getElementById(videoId);

        if (!video || !source) {
            return;
        }

        var layer = document.querySelector('[data-play-layer="' + videoId + '"]');
        var hlsInstance = null;

        function bindSource() {
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
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
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else {
                video.src = source;
            }
        }

        function hideLayer() {
            if (layer) {
                layer.classList.add('is-hidden');
            }
        }

        function showLayer() {
            if (layer && video.paused) {
                layer.classList.remove('is-hidden');
            }
        }

        function start() {
            hideLayer();
            var playPromise = video.play();

            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    showLayer();
                });
            }
        }

        bindSource();

        if (layer) {
            layer.addEventListener('click', start);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            }
        });

        video.addEventListener('play', hideLayer);
        video.addEventListener('pause', showLayer);
        video.addEventListener('ended', showLayer);
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    window.initMoviePlayer = initMoviePlayer;
})();
