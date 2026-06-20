(() => {
  const ready = (fn) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  };

  const setupMenu = () => {
    const toggle = document.querySelector('[data-menu-toggle]');
    const menu = document.querySelector('[data-mobile-menu]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', () => {
      menu.classList.toggle('is-open');
    });
  };

  const setupHero = () => {
    const hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    if (slides.length <= 1) {
      return;
    }
    let index = 0;
    const show = (next) => {
      index = (next + slides.length) % slides.length;
      slides.forEach((slide, itemIndex) => {
        slide.classList.toggle('is-active', itemIndex === index);
      });
      dots.forEach((dot, itemIndex) => {
        dot.classList.toggle('is-active', itemIndex === index);
      });
    };
    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const next = Number(dot.getAttribute('data-hero-dot'));
        show(next);
      });
    });
    window.setInterval(() => show(index + 1), 5200);
  };

  const readQuery = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('q') || '';
  };

  const setupFilters = () => {
    const panel = document.querySelector('[data-filter-panel]');
    const list = document.querySelector('[data-card-list]');
    if (!panel || !list) {
      return;
    }
    const input = panel.querySelector('[data-search-input]');
    const typeSelect = panel.querySelector('[data-type-filter]');
    const yearSelect = panel.querySelector('[data-year-filter]');
    const emptyState = document.querySelector('[data-empty-state]');
    const cards = Array.from(list.querySelectorAll('[data-card]'));
    const query = readQuery();
    if (query && input) {
      input.value = query;
    }
    const apply = () => {
      const keyword = (input ? input.value : '').trim().toLowerCase();
      const typeValue = typeSelect ? typeSelect.value : '';
      const yearValue = yearSelect ? yearSelect.value : '';
      let visible = 0;
      cards.forEach((card) => {
        const text = card.textContent.toLowerCase();
        const matchesKeyword = !keyword || text.includes(keyword);
        const matchesType = !typeValue || card.getAttribute('data-type') === typeValue;
        const matchesYear = !yearValue || card.getAttribute('data-year') === yearValue;
        const ok = matchesKeyword && matchesType && matchesYear;
        card.hidden = !ok;
        if (ok) {
          visible += 1;
        }
      });
      if (emptyState) {
        emptyState.hidden = visible !== 0;
      }
    };
    [input, typeSelect, yearSelect].forEach((element) => {
      if (element) {
        element.addEventListener('input', apply);
        element.addEventListener('change', apply);
      }
    });
    apply();
  };

  const playVideo = (video, url, overlay) => {
    const hideOverlay = () => {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    };
    const start = () => {
      hideOverlay();
      video.play().catch(() => {});
    };
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (video.getAttribute('src') !== url) {
        video.src = url;
      }
      start();
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      if (!video._hlsReady) {
        const hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        video._hlsReady = true;
        video._hlsInstance = hls;
        hls.on(window.Hls.Events.MANIFEST_PARSED, start);
      } else {
        start();
      }
    }
  };

  const setupPlayer = () => {
    const frame = document.querySelector('[data-player]');
    if (!frame) {
      return;
    }
    const video = frame.querySelector('video');
    const overlay = frame.querySelector('.play-overlay');
    const url = frame.getAttribute('data-play');
    if (!video || !url) {
      return;
    }
    if (overlay) {
      overlay.addEventListener('click', () => playVideo(video, url, overlay));
    }
    video.addEventListener('play', () => {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });
  };

  ready(() => {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayer();
  });
})();
