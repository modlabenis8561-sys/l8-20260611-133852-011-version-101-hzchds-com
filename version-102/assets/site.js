(function () {
  const movies = Array.isArray(window.SITE_MOVIES) ? window.SITE_MOVIES : [];

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function buildSearchResult(movie) {
    const a = document.createElement('a');
    a.href = movie.url;
    const title = document.createElement('strong');
    title.textContent = movie.title;
    const meta = document.createElement('span');
    meta.textContent = [movie.year, movie.region, movie.type, movie.category].filter(Boolean).join(' · ') + ' · ' + movie.oneLine;
    a.appendChild(title);
    a.appendChild(meta);
    return a;
  }

  document.querySelectorAll('[data-search-input]').forEach(function (input) {
    const box = input.parentElement.querySelector('[data-search-results]');
    if (!box) {
      return;
    }
    input.addEventListener('input', function () {
      const keyword = normalize(input.value);
      box.innerHTML = '';
      if (!keyword) {
        box.classList.remove('open');
        return;
      }
      const result = movies.filter(function (movie) {
        const text = normalize([movie.title, movie.oneLine, movie.year, movie.region, movie.type, movie.category, (movie.tags || []).join(' ')].join(' '));
        return text.indexOf(keyword) !== -1;
      }).slice(0, 10);
      result.forEach(function (movie) {
        box.appendChild(buildSearchResult(movie));
      });
      box.classList.toggle('open', result.length > 0);
    });
    document.addEventListener('click', function (event) {
      if (!input.parentElement.contains(event.target)) {
        box.classList.remove('open');
      }
    });
  });

  const toggle = document.querySelector('.nav-toggle');
  const mobilePanel = document.querySelector('[data-mobile-panel]');
  if (toggle && mobilePanel) {
    toggle.addEventListener('click', function () {
      const open = mobilePanel.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let current = 0;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
      });
    });
    if (slides.length > 1) {
      setInterval(function () {
        show(current + 1);
      }, 5200);
    }
  }

  const grid = document.querySelector('[data-card-grid]');
  const localSearch = document.querySelector('[data-local-search]');
  const emptyState = document.querySelector('[data-empty-state]');
  const chips = Array.from(document.querySelectorAll('[data-filter-value]'));
  if (grid) {
    const cards = Array.from(grid.querySelectorAll('[data-movie-card]'));
    let filterValue = 'all';
    function applyFilters() {
      const keyword = normalize(localSearch ? localSearch.value : '');
      let visible = 0;
      cards.forEach(function (card) {
        const searchable = normalize([
          card.dataset.title,
          card.dataset.year,
          card.dataset.region,
          card.dataset.type,
          card.dataset.category,
          card.dataset.tags
        ].join(' '));
        const typeText = normalize(card.dataset.type);
        const matchesKeyword = !keyword || searchable.indexOf(keyword) !== -1;
        const matchesFilter = filterValue === 'all' || typeText.indexOf(normalize(filterValue)) !== -1;
        const shouldShow = matchesKeyword && matchesFilter;
        card.hidden = !shouldShow;
        if (shouldShow) {
          visible += 1;
        }
      });
      if (emptyState) {
        emptyState.classList.toggle('open', visible === 0);
      }
    }
    if (localSearch) {
      localSearch.addEventListener('input', applyFilters);
    }
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (item) {
          item.classList.remove('active');
        });
        chip.classList.add('active');
        filterValue = chip.dataset.filterValue || 'all';
        applyFilters();
      });
    });
  }
})();
