(function () {
    var header = document.getElementById("site-header");
    var mobileButton = document.querySelector(".mobile-toggle");
    var mobileNav = document.getElementById("mobile-nav");
    var year = document.getElementById("year-now");

    if (year) {
        year.textContent = new Date().getFullYear();
    }

    if (mobileButton && mobileNav) {
        mobileButton.addEventListener("click", function () {
            var opened = mobileNav.classList.toggle("is-open");
            document.body.classList.toggle("nav-open", opened);
            mobileButton.setAttribute("aria-expanded", opened ? "true" : "false");
        });
    }

    if (header) {
        window.addEventListener("scroll", function () {
            header.classList.toggle("is-scrolled", window.scrollY > 8);
        });
    }

    var carousel = document.getElementById("hero-carousel");
    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5600);
        }

        carousel.querySelectorAll("[data-hero]").forEach(function (button) {
            button.addEventListener("click", function () {
                showSlide(button.getAttribute("data-hero") === "next" ? current + 1 : current - 1);
                restart();
            });
        });

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.getAttribute("data-slide")) || 0);
                restart();
            });
        });

        showSlide(0);
        restart();
    }

    var searchInput = document.getElementById("movie-search");
    var categoryFilter = document.getElementById("category-filter");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".searchable-grid .movie-card"));
    var emptyState = document.getElementById("empty-state");

    if (searchInput && cards.length) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        if (query) {
            searchInput.value = query;
        }

        function normalize(value) {
            return String(value || "").toLowerCase().replace(/\s+/g, "");
        }

        function filterCards() {
            var keyword = normalize(searchInput.value);
            var category = categoryFilter ? normalize(categoryFilter.value) : "";
            var visible = 0;

            cards.forEach(function (card) {
                var title = card.getAttribute("data-title") || "";
                var meta = card.getAttribute("data-meta") || "";
                var genre = card.getAttribute("data-genre") || "";
                var tags = card.getAttribute("data-tags") || "";
                var badge = card.querySelector(".card-badge") ? card.querySelector(".card-badge").textContent : "";
                var haystack = normalize(title + meta + genre + tags + badge);
                var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchCategory = !category || normalize(badge).indexOf(category) !== -1;
                var matched = matchKeyword && matchCategory;
                card.style.display = matched ? "" : "none";
                if (matched) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.style.display = visible ? "none" : "block";
            }
        }

        searchInput.addEventListener("input", filterCards);
        if (categoryFilter) {
            categoryFilter.addEventListener("change", filterCards);
        }
        filterCards();
    }
})();

function bindMoviePlayer(videoId, streamUrl) {
    var video = document.getElementById(videoId);
    if (!video || !streamUrl) {
        return;
    }

    var shell = video.closest(".player-shell");
    var cover = shell ? shell.querySelector(".player-cover") : null;
    var initialized = false;
    var hls = null;

    function begin() {
        if (cover) {
            cover.classList.add("is-hidden");
        }

        video.controls = true;

        if (!initialized) {
            initialized = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
                video.addEventListener("loadedmetadata", function () {
                    video.play().catch(function () {});
                }, { once: true });
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new Hls();
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                hls.on(Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
            } else {
                video.src = streamUrl;
            }
        }

        video.play().catch(function () {});
    }

    if (cover) {
        cover.addEventListener("click", begin);
    }

    video.addEventListener("click", function () {
        if (!initialized || video.paused) {
            begin();
        }
    });

    window.addEventListener("pagehide", function () {
        if (hls) {
            hls.destroy();
            hls = null;
        }
    });
}
