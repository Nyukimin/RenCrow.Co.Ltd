(function() {
  'use strict';

  const STORAGE_KEY = 'rencrow-ip-variant';

  function getPreferredVariant() {
    const hash = location.hash.slice(1);
    if (['0', 'A', 'B', 'C', 'D'].includes(hash)) return hash;
    const params = new URLSearchParams(location.search);
    const v = params.get('v');
    if (['0', 'A', 'B', 'C', 'D'].includes(v)) return v;
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (['0', 'A', 'B', 'C', 'D'].includes(stored)) return stored;
    } catch (e) {}
    return '0';
  }

  function setVariant(variant) {
    const tabs = document.querySelectorAll('.ip-variant-switcher button[role="tab"]');
    const panels = document.querySelectorAll('.ip-variant[data-variant-panel]');

    tabs.forEach(tab => {
      tab.setAttribute('aria-selected', tab.dataset.variant === variant ? 'true' : 'false');
    });
    panels.forEach(panel => {
      panel.hidden = panel.dataset.variantPanel !== variant;
    });

    history.replaceState(null, '', `#${variant}`);
    try {
      sessionStorage.setItem(STORAGE_KEY, variant);
    } catch (e) {}
  }

  function initVariantSwitcher() {
    const switcher = document.querySelector('.ip-variant-switcher');
    if (!switcher) return;

    setVariant(getPreferredVariant());

    switcher.addEventListener('click', (e) => {
      const tab = e.target.closest('button[data-variant]');
      if (!tab) return;
      setVariant(tab.dataset.variant);
    });

    window.addEventListener('hashchange', () => {
      const hash = location.hash.slice(1);
      if (['0', 'A', 'B', 'C', 'D'].includes(hash)) {
        setVariant(hash);
      }
    });

    switcher.addEventListener('keydown', (e) => {
      const tabs = [...switcher.querySelectorAll('button[role="tab"]')];
      const current = tabs.findIndex(t => t.getAttribute('aria-selected') === 'true');
      if (current < 0) return;

      let next = -1;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        next = (current + 1) % tabs.length;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        next = (current - 1 + tabs.length) % tabs.length;
      } else if (e.key === 'Home') {
        next = 0;
      } else if (e.key === 'End') {
        next = tabs.length - 1;
      }

      if (next >= 0) {
        e.preventDefault();
        tabs[next].focus();
        setVariant(tabs[next].dataset.variant);
      }
    });
  }

  function initVariantA() {
    const container = document.querySelector('.variant-a');
    if (!container) return;

    const filterButtons = container.querySelectorAll('[data-filter-series], [data-filter-gender]');
    const items = container.querySelectorAll('.va-item');
    const thumbnails = container.querySelectorAll('.va-thumbnail[data-select-char]');
    const detailEmpty = container.querySelector('.va-detail-empty');
    const detailCards = container.querySelectorAll('.va-detail-card');

    let filters = { series: 'all', gender: 'all' };

    function applyFilters() {
      items.forEach(item => {
        const matchSeries = filters.series === 'all' || item.dataset.series === filters.series;
        const matchGender = filters.gender === 'all' || item.dataset.gender === filters.gender;
        item.hidden = !(matchSeries && matchGender);
      });
    }

    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.dataset.filterSeries !== undefined) {
          container.querySelectorAll('[data-filter-series]').forEach(b => b.classList.remove('active'));
          filters.series = btn.dataset.filterSeries;
        }
        if (btn.dataset.filterGender !== undefined) {
          container.querySelectorAll('[data-filter-gender]').forEach(b => b.classList.remove('active'));
          filters.gender = btn.dataset.filterGender;
        }
        btn.classList.add('active');
        applyFilters();
      });
    });

    thumbnails.forEach(thumb => {
      thumb.addEventListener('click', () => {
        const charId = thumb.dataset.selectChar;
        detailEmpty.hidden = true;
        detailCards.forEach(card => {
          card.hidden = card.dataset.detail !== charId;
        });
        thumbnails.forEach(t => t.classList.remove('selected'));
        thumb.classList.add('selected');
      });
    });
  }

  function initVariantB() {
    const container = document.querySelector('.variant-b');
    if (!container) return;

    const thumbs = container.querySelectorAll('.vb-thumb[data-thumb]');
    const characters = container.querySelectorAll('.vb-character[data-char]');

    thumbs.forEach(thumb => {
      thumb.addEventListener('click', () => {
        const charId = thumb.dataset.thumb;
        characters.forEach(c => {
          c.hidden = c.dataset.char !== charId;
        });
        thumbs.forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
        container.dataset.currentChar = charId;
      });
    });

    if (thumbs[0]) thumbs[0].classList.add('active');
  }

  function init() {
    initVariantSwitcher();
    initVariantA();
    initVariantB();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
