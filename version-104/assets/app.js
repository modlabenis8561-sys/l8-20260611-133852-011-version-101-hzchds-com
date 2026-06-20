(function() {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function() {
            mobilePanel.classList.toggle('is-open');
        });
    }

    var slider = document.querySelector('[data-hero-slider]');

    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var next = slider.querySelector('[data-hero-next]');
        var prev = slider.querySelector('[data-hero-prev]');
        var activeIndex = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === activeIndex);
            });
            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === activeIndex);
            });
        }

        function startTimer() {
            window.clearInterval(timer);
            timer = window.setInterval(function() {
                showSlide(activeIndex + 1);
            }, 5200);
        }

        dots.forEach(function(dot) {
            dot.addEventListener('click', function() {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                startTimer();
            });
        });

        if (next) {
            next.addEventListener('click', function() {
                showSlide(activeIndex + 1);
                startTimer();
            });
        }

        if (prev) {
            prev.addEventListener('click', function() {
                showSlide(activeIndex - 1);
                startTimer();
            });
        }

        showSlide(0);
        startTimer();
    }

    function normalize(value) {
        return String(value || '').toLowerCase().replace(/\s+/g, '');
    }

    function filterScope(scope) {
        var input = scope.querySelector('[data-card-search]');
        var buttons = Array.prototype.slice.call(scope.querySelectorAll('[data-filter]'));
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
        var activeFilter = 'all';

        function applyFilter() {
            var query = normalize(input ? input.value : '');
            var filter = normalize(activeFilter);

            cards.forEach(function(card) {
                var text = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-keywords')
                ].join(' '));
                var matchesQuery = !query || text.indexOf(query) !== -1;
                var matchesFilter = filter === 'all' || text.indexOf(filter) !== -1;
                card.classList.toggle('is-hidden', !(matchesQuery && matchesFilter));
            });
        }

        if (input) {
            input.addEventListener('input', applyFilter);
        }

        buttons.forEach(function(button) {
            button.addEventListener('click', function() {
                activeFilter = button.getAttribute('data-filter') || 'all';
                buttons.forEach(function(item) {
                    item.classList.toggle('is-active', item === button);
                });
                applyFilter();
            });
        });

        if (scope.hasAttribute('data-search-page')) {
            var params = new URLSearchParams(window.location.search);
            var keyword = params.get('q') || '';
            if (input && keyword) {
                input.value = keyword;
            }
        }

        applyFilter();
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]')).forEach(filterScope);
})();
