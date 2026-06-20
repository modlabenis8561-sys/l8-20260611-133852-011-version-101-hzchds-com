(function () {
    var header = document.querySelector('[data-header]');
    var toggle = document.querySelector('[data-nav-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    function updateHeader() {
        if (!header) {
            return;
        }
        if (window.scrollY > 40) {
            header.classList.add('is-scrolled');
        } else {
            header.classList.remove('is-scrolled');
        }
    }

    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });

    if (toggle && mobileNav && header) {
        toggle.addEventListener('click', function () {
            var open = mobileNav.classList.toggle('is-open');
            header.classList.toggle('is-open', open);
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var index = 0;
        var timer = null;

        function showSlide(next) {
            if (!slides.length) {
                return;
            }
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        start();
    }

    var searchPage = document.querySelector('[data-search-page]');
    if (searchPage) {
        var input = searchPage.querySelector('[data-search-input]');
        var form = searchPage.querySelector('[data-search-form]');
        var cards = Array.prototype.slice.call(searchPage.querySelectorAll('[data-search-card]'));
        var filterButtons = Array.prototype.slice.call(searchPage.querySelectorAll('[data-filter-category]'));
        var params = new URLSearchParams(window.location.search);
        var currentCategory = 'all';

        function normalize(value) {
            return String(value || '').toLowerCase().trim();
        }

        function cardText(card) {
            return normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-region'),
                card.getAttribute('data-year'),
                card.getAttribute('data-tags')
            ].join(' '));
        }

        function applyFilter() {
            var query = normalize(input ? input.value : '');
            cards.forEach(function (card) {
                var category = card.getAttribute('data-category') || '';
                var categoryMatch = currentCategory === 'all' || category === currentCategory;
                var queryMatch = !query || cardText(card).indexOf(query) !== -1;
                card.classList.toggle('is-hidden', !(categoryMatch && queryMatch));
            });
        }

        if (input && params.get('q')) {
            input.value = params.get('q');
        }

        if (input) {
            input.addEventListener('input', applyFilter);
        }

        if (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                applyFilter();
            });
        }

        filterButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                currentCategory = button.getAttribute('data-filter-category') || 'all';
                filterButtons.forEach(function (item) {
                    item.classList.toggle('is-active', item === button);
                });
                applyFilter();
            });
        });

        applyFilter();
    }
})();
