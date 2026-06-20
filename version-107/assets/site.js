(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function textOf(value) {
        return (value || "").toString().toLowerCase();
    }

    ready(function () {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");

        if (toggle && panel) {
            toggle.addEventListener("click", function () {
                panel.classList.toggle("is-open");
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

            function start() {
                window.clearInterval(timer);
                timer = window.setInterval(function () {
                    show(current + 1);
                }, 5000);
            }

            if (prev) {
                prev.addEventListener("click", function () {
                    show(current - 1);
                    start();
                });
            }

            if (next) {
                next.addEventListener("click", function () {
                    show(current + 1);
                    start();
                });
            }

            dots.forEach(function (dot, index) {
                dot.addEventListener("click", function () {
                    show(index);
                    start();
                });
            });

            show(0);
            start();
        });

        document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
            var list = scope.parentElement.querySelector("[data-filter-list]");
            var input = scope.querySelector("[data-filter-input]");
            var year = scope.querySelector("[data-filter-year]");
            var type = scope.querySelector("[data-filter-type]");

            if (!list) {
                return;
            }

            var cards = Array.prototype.slice.call(list.querySelectorAll("[data-card]"));

            function applyFilter() {
                var keyword = textOf(input && input.value);
                var yearValue = textOf(year && year.value);
                var typeValue = textOf(type && type.value);

                cards.forEach(function (card) {
                    var haystack = textOf([
                        card.dataset.title,
                        card.dataset.tags,
                        card.dataset.year,
                        card.dataset.type,
                        card.dataset.region
                    ].join(" "));
                    var yearMatch = !yearValue || textOf(card.dataset.year).indexOf(yearValue) !== -1;
                    var typeMatch = !typeValue || textOf(card.dataset.type).indexOf(typeValue) !== -1;
                    var keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;

                    card.classList.toggle("is-filter-hidden", !(yearMatch && typeMatch && keywordMatch));
                });
            }

            [input, year, type].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", applyFilter);
                    control.addEventListener("change", applyFilter);
                }
            });

            var params = new URLSearchParams(window.location.search);
            var q = params.get("q");

            if (q && input) {
                input.value = q;
                applyFilter();
            }
        });
    });
})();
