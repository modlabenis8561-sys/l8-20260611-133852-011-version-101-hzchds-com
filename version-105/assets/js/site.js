(function () {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');

    if (toggle && panel) {
        toggle.addEventListener('click', function () {
            panel.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var index = 0;

        function showHero(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                showHero(dotIndex);
            });
        });

        window.setInterval(function () {
            showHero(index + 1);
        }, 5200);
    }

    var panelFilter = document.querySelector('[data-filter-panel]');

    if (panelFilter) {
        var cards = Array.prototype.slice.call(document.querySelectorAll('.filter-card'));
        var search = panelFilter.querySelector('[data-filter-search]');
        var region = panelFilter.querySelector('[data-filter-region]');
        var type = panelFilter.querySelector('[data-filter-type]');
        var year = panelFilter.querySelector('[data-filter-year]');
        var reset = panelFilter.querySelector('[data-filter-reset]');
        var empty = document.querySelector('.filter-empty');
        var params = new URLSearchParams(window.location.search);
        var queryValue = params.get('q') || '';

        if (queryValue && search) {
            search.value = queryValue;
        }

        function normalize(value) {
            return (value || '').toString().trim().toLowerCase();
        }

        function cardText(card) {
            return normalize([
                card.dataset.title,
                card.dataset.region,
                card.dataset.type,
                card.dataset.year,
                card.dataset.genre,
                card.dataset.tags,
                card.textContent
            ].join(' '));
        }

        function applyFilter() {
            var keyword = normalize(search && search.value);
            var regionValue = normalize(region && region.value);
            var typeValue = normalize(type && type.value);
            var yearValue = normalize(year && year.value);
            var visible = 0;

            cards.forEach(function (card) {
                var matched = true;
                var text = cardText(card);

                if (keyword && text.indexOf(keyword) === -1) {
                    matched = false;
                }

                if (regionValue && normalize(card.dataset.region) !== regionValue) {
                    matched = false;
                }

                if (typeValue && normalize(card.dataset.type) !== typeValue) {
                    matched = false;
                }

                if (yearValue && normalize(card.dataset.year) !== yearValue) {
                    matched = false;
                }

                card.hidden = !matched;

                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        [search, region, type, year].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });

        if (reset) {
            reset.addEventListener('click', function () {
                if (search) {
                    search.value = '';
                }
                if (region) {
                    region.value = '';
                }
                if (type) {
                    type.value = '';
                }
                if (year) {
                    year.value = '';
                }
                applyFilter();
            });
        }

        applyFilter();
    }
})();
