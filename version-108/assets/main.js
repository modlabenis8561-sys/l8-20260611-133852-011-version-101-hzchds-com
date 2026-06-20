(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    var navToggle = document.querySelector("[data-nav-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (navToggle && mobileNav) {
      navToggle.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("[data-hero]").forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var current = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      }

      function restart() {
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5000);
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-hero-dot")) || 0);
          restart();
        });
      });

      if (prev) {
        prev.addEventListener("click", function () {
          show(current - 1);
          restart();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(current + 1);
          restart();
        });
      }

      show(0);
      restart();
    });

    document.querySelectorAll(".scroll-wrap").forEach(function (wrap) {
      var rail = wrap.querySelector("[data-scroll-rail]");
      var left = wrap.querySelector("[data-scroll-left]");
      var right = wrap.querySelector("[data-scroll-right]");

      function move(direction) {
        if (!rail) {
          return;
        }
        rail.scrollBy({
          left: direction * 420,
          behavior: "smooth"
        });
      }

      if (left) {
        left.addEventListener("click", function () {
          move(-1);
        });
      }

      if (right) {
        right.addEventListener("click", function () {
          move(1);
        });
      }
    });

    document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
      var targetSelector = panel.getAttribute("data-filter-target");
      var target = targetSelector ? document.querySelector(targetSelector) : document;
      var input = panel.querySelector("[data-search-input]");
      var typeSelect = panel.querySelector("[data-type-filter]");
      var noResults = target ? target.querySelector(".no-results") : null;

      function applyFilter() {
        if (!target) {
          return;
        }

        var query = input ? input.value.trim().toLowerCase() : "";
        var typeValue = typeSelect ? typeSelect.value.trim() : "";
        var cards = Array.prototype.slice.call(target.querySelectorAll(".movie-card, .ranking-row"));
        var visible = 0;

        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search-text") || card.textContent || "").toLowerCase();
          var type = card.getAttribute("data-type") || text;
          var matchText = !query || text.indexOf(query) !== -1;
          var matchType = !typeValue || type.indexOf(typeValue) !== -1 || text.indexOf(typeValue.toLowerCase()) !== -1;
          var matched = matchText && matchType;
          card.hidden = !matched;
          if (matched) {
            visible += 1;
          }
        });

        if (noResults) {
          noResults.hidden = visible !== 0;
        }
      }

      if (input) {
        input.addEventListener("input", applyFilter);
      }

      if (typeSelect) {
        typeSelect.addEventListener("change", applyFilter);
      }
    });
  });
})();
