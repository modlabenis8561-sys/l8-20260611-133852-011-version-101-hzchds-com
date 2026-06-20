(function () {
    window.MoviePlayer = {
        create: function (videoId, streamUrl, playerId) {
            var video = document.getElementById(videoId);
            var player = document.getElementById(playerId);
            if (!video || !player || !streamUrl) {
                return;
            }

            var cover = player.querySelector('.player-cover');
            var state = player.querySelector('.player-state');
            var hls = null;
            var ready = false;

            function setState(message) {
                if (state) {
                    state.textContent = message || '';
                }
            }

            function load() {
                if (ready) {
                    return;
                }
                ready = true;
                setState('加载中');

                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(streamUrl);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        setState('');
                    });
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            setState('播放暂时不可用');
                        }
                    });
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = streamUrl;
                    video.addEventListener('loadedmetadata', function () {
                        setState('');
                    }, { once: true });
                    video.addEventListener('error', function () {
                        setState('播放暂时不可用');
                    }, { once: true });
                } else {
                    video.src = streamUrl;
                    video.addEventListener('loadedmetadata', function () {
                        setState('');
                    }, { once: true });
                }
            }

            function play() {
                load();
                player.classList.add('is-playing');
                var attempt = video.play();
                if (attempt && attempt.catch) {
                    attempt.catch(function () {
                        player.classList.remove('is-playing');
                    });
                }
            }

            if (cover) {
                cover.addEventListener('click', play);
            }

            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                }
            });

            video.addEventListener('play', function () {
                player.classList.add('is-playing');
            });

            video.addEventListener('pause', function () {
                if (!video.ended) {
                    player.classList.remove('is-playing');
                }
            });

            window.addEventListener('beforeunload', function () {
                if (hls) {
                    hls.destroy();
                }
            });
        }
    };
})();
