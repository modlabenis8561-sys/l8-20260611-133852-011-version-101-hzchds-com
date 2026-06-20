(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initHeader() {
    var header = document.querySelector("[data-site-header]");
    var toggle = document.querySelector("[data-nav-toggle]");
    var mobile = document.querySelector("[data-mobile-nav]");

    function setHeaderState() {
      if (!header) {
        return;
      }
      header.classList.toggle("is-scrolled", window.scrollY > 18);
    }

    setHeaderState();
    window.addEventListener("scroll", setHeaderState, { passive: true });

    if (toggle && mobile) {
      toggle.addEventListener("click", function () {
        var expanded = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-expanded", expanded ? "false" : "true");
        mobile.classList.toggle("is-open", !expanded);
      });
    }
  }

  function initHero() {
    var root = document.querySelector("[data-hero-carousel]");
    if (!root) {
      return;
    }

    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function addOption(select, value) {
    var option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  }

  function initFilters() {
    var panel = document.querySelector("[data-filter-form]");
    var list = document.querySelector("[data-filter-list]");
    if (!panel || !list) {
      return;
    }

    var input = panel.querySelector("[data-filter-input]");
    var yearSelect = panel.querySelector("[data-year-filter]");
    var regionSelect = panel.querySelector("[data-region-filter]");
    var typeSelect = panel.querySelector("[data-type-filter]");
    var count = document.querySelector("[data-result-count]");
    var cards = Array.prototype.slice.call(list.querySelectorAll("[data-movie-card]"));
    var years = [];
    var regions = [];
    var types = [];

    cards.forEach(function (card) {
      var year = card.getAttribute("data-year") || "";
      var region = card.getAttribute("data-region") || "";
      var type = card.getAttribute("data-type") || "";
      if (year && years.indexOf(year) === -1) {
        years.push(year);
      }
      if (region && regions.indexOf(region) === -1) {
        regions.push(region);
      }
      if (type && types.indexOf(type) === -1) {
        types.push(type);
      }
    });

    years.sort(function (a, b) {
      return String(b).localeCompare(String(a), "zh-CN", { numeric: true });
    });
    regions.sort(function (a, b) {
      return a.localeCompare(b, "zh-CN");
    });
    types.sort(function (a, b) {
      return a.localeCompare(b, "zh-CN");
    });

    years.forEach(function (year) {
      addOption(yearSelect, year);
    });
    regions.forEach(function (region) {
      addOption(regionSelect, region);
    });
    types.forEach(function (type) {
      addOption(typeSelect, type);
    });

    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");
    if (q && input) {
      input.value = q;
    }

    function apply() {
      var query = input ? input.value.trim().toLowerCase() : "";
      var year = yearSelect ? yearSelect.value : "";
      var region = regionSelect ? regionSelect.value : "";
      var type = typeSelect ? typeSelect.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var text = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
        var matchQuery = !query || text.indexOf(query) !== -1;
        var matchYear = !year || card.getAttribute("data-year") === year;
        var matchRegion = !region || card.getAttribute("data-region") === region;
        var matchType = !type || card.getAttribute("data-type") === type;
        var matched = matchQuery && matchYear && matchRegion && matchType;
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = "筛选结果：" + visible + " 部";
      }
    }

    [input, yearSelect, regionSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });

    apply();
  }

  function initMoviePlayer(playerId, sourceUrl) {
    var root = document.getElementById(playerId);
    if (!root) {
      return;
    }

    var video = root.querySelector("video");
    var overlay = root.querySelector(".player-overlay");
    var hls = null;
    var started = false;

    function playVideo() {
      var result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(function () {
          if (overlay) {
            overlay.classList.remove("is-hidden");
          }
        });
      }
    }

    function start() {
      if (!video) {
        return;
      }

      if (overlay) {
        overlay.classList.add("is-hidden");
      }

      if (started) {
        playVideo();
        return;
      }

      started = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
        playVideo();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          playVideo();
        });
        hls.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (!data || !data.fatal || !hls) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
            hls = null;
          }
        });
        return;
      }

      video.src = sourceUrl;
      playVideo();
    }

    if (overlay) {
      overlay.addEventListener("click", start);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (!started) {
          start();
        }
      });
    }
  }

  window.initMoviePlayer = initMoviePlayer;

  ready(function () {
    initHeader();
    initHero();
    initFilters();
  });
})();
