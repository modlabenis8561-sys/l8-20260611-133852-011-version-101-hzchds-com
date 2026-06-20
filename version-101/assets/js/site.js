(() => {
  const header = document.querySelector('.site-header');
  const mobileToggle = document.querySelector('.mobile-toggle');

  if (header && mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = header.classList.toggle('is-open');
      mobileToggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const dots = Array.from(hero.querySelectorAll('.hero-dot'));
    let active = Math.max(0, slides.findIndex((slide) => slide.classList.contains('is-active')));

    const show = (index) => {
      active = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => slide.classList.toggle('is-active', slideIndex === active));
      dots.forEach((dot, dotIndex) => dot.classList.toggle('is-active', dotIndex === active));
    };

    dots.forEach((dot) => {
      dot.addEventListener('click', () => show(Number(dot.dataset.slide || 0)));
    });

    if (slides.length > 1) {
      setInterval(() => show(active + 1), 5000);
    }
  }

  const globalSearch = document.getElementById('globalSearch');
  const globalResults = document.getElementById('globalSearchResults');

  if (globalSearch && globalResults && Array.isArray(MOVIE_SEARCH_INDEX)) {
    const renderGlobalResults = (items) => {
      if (!items.length) {
        globalResults.hidden = true;
        globalResults.innerHTML = '';
        return;
      }

      globalResults.innerHTML = items.slice(0, 8).map((item) => {
        const tagText = [item.year, item.type, item.category].filter(Boolean).join(' · ');
        return `<a href="${item.url}"><img src="${item.cover}" alt="${item.title}" loading="lazy"><span><strong>${item.title}</strong><span>${tagText}</span></span></a>`;
      }).join('');
      globalResults.hidden = false;
    };

    globalSearch.addEventListener('input', () => {
      const query = globalSearch.value.trim().toLowerCase();
      if (!query) {
        renderGlobalResults([]);
        return;
      }

      const matched = MOVIE_SEARCH_INDEX.filter((item) => {
        const text = `${item.title} ${item.year} ${item.type} ${item.category} ${(item.tags || []).join(' ')}`.toLowerCase();
        return text.includes(query);
      });
      renderGlobalResults(matched);
    });

    document.addEventListener('click', (event) => {
      if (!globalResults.contains(event.target) && event.target !== globalSearch) {
        globalResults.hidden = true;
      }
    });
  }

  const filterGrid = document.querySelector('[data-filter-grid]');
  if (filterGrid) {
    const cards = Array.from(filterGrid.querySelectorAll('.movie-card'));
    const localFilter = document.getElementById('localFilter');
    const typeFilter = document.getElementById('typeFilter');
    const yearFilter = document.getElementById('yearFilter');
    const types = new Set();
    const years = new Set();

    cards.forEach((card) => {
      if (card.dataset.type) {
        types.add(card.dataset.type);
      }
      if (card.dataset.year) {
        years.add(card.dataset.year);
      }
    });

    if (typeFilter) {
      Array.from(types).sort().forEach((value) => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        typeFilter.appendChild(option);
      });
    }

    if (yearFilter) {
      Array.from(years).sort((a, b) => Number(b) - Number(a)).forEach((value) => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        yearFilter.appendChild(option);
      });
    }

    const applyFilters = () => {
      const query = (localFilter?.value || '').trim().toLowerCase();
      const selectedType = typeFilter?.value || '';
      const selectedYear = yearFilter?.value || '';

      cards.forEach((card) => {
        const text = `${card.dataset.title || ''} ${card.dataset.year || ''} ${card.dataset.type || ''} ${card.dataset.tags || ''}`.toLowerCase();
        const matchText = !query || text.includes(query);
        const matchType = !selectedType || card.dataset.type === selectedType;
        const matchYear = !selectedYear || card.dataset.year === selectedYear;
        card.classList.toggle('is-hidden-by-filter', !(matchText && matchType && matchYear));
      });
    };

    [localFilter, typeFilter, yearFilter].forEach((control) => {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });
  }

  const player = document.querySelector('[data-player]');
  if (player) {
    const video = player.querySelector('video');
    const cover = player.querySelector('.player-cover');
    const stream = player.getAttribute('data-stream');
    let hlsInstance = null;

    const attachStream = () => {
      if (!video || !stream || video.dataset.ready === '1') {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      }

      video.dataset.ready = '1';
    };

    const startPlayback = () => {
      attachStream();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      if (video) {
        video.controls = true;
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(() => {});
        }
      }
    };

    if (cover) {
      cover.addEventListener('click', startPlayback);
    }

    if (video) {
      video.addEventListener('click', () => {
        if (video.paused) {
          startPlayback();
        }
      });
    }

    window.addEventListener('pagehide', () => {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  }
})();
