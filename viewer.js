const dialog = document.querySelector('#sheet-viewer');

if (dialog && typeof dialog.showModal === 'function') {
  const image = dialog.querySelector('[data-sheet-image]');
  const title = dialog.querySelector('[data-sheet-title]');
  const label = dialog.querySelector('[data-image-label-display]');
  const status = dialog.querySelector('[data-sheet-status]');
  const zoom = dialog.querySelector('[data-sheet-zoom]');
  const body = dialog.querySelector('[data-sheet-body]');
  const navigation = dialog.querySelector('[data-gallery-navigation]');
  const count = dialog.querySelector('[data-gallery-count]');
  const basePath = document.querySelector('meta[name="rencrow-base-path"]')?.getAttribute('content') || '/';
  let opener;
  let items = [];
  let index = 0;

  function readItem(trigger) {
    const source = trigger.dataset.sheetSrc;
    const profile = trigger.dataset.profileHref;
    if (!/^\/(?:[A-Za-z0-9][A-Za-z0-9._-]*\/)*$/.test(basePath) || typeof source !== 'string' || typeof profile !== 'string') return null;
    if (!source.startsWith(basePath) || !profile.startsWith(basePath)) return null;
    if (!/^assets\/characters\/[a-z][a-z0-9-]*\.webp$/.test(source.slice(basePath.length)) || !/^characters\/[a-z][a-z0-9-]*\/$/.test(profile.slice(basePath.length))) return null;
    return { source, profile, name: trigger.dataset.sheetName, label: trigger.dataset.imageLabel || '紹介シート' };
  }

  function showItem(nextIndex) {
    index = (nextIndex + items.length) % items.length;
    const item = items[index];
    title.textContent = item.name;
    label.textContent = item.label;
    image.alt = `${item.name}の${item.label}`;
    image.hidden = true;
    zoom.disabled = true;
    zoom.textContent = '拡大';
    zoom.setAttribute('aria-pressed', 'false');
    dialog.classList.remove('is-zoomed');
    status.textContent = '画像を読み込んでいます…';
    navigation.hidden = items.length < 2;
    count.textContent = `${index + 1} / ${items.length}`;
    dialog.querySelector('[data-sheet-original]').href = item.source;
    dialog.querySelector('[data-sheet-profile]').href = item.profile;
    image.onload = () => {
      image.hidden = false;
      status.textContent = '';
      zoom.disabled = false;
    };
    image.onerror = () => {
      image.hidden = true;
      status.textContent = '画像を読み込めませんでした。「画像を別タブで開く」からご確認ください。';
      zoom.disabled = true;
    };
    image.src = item.source;
    body.scrollTop = 0;
    body.scrollLeft = 0;
  }

  document.addEventListener('click', event => {
    const trigger = event.target.closest('[data-sheet-src]');
    if (!trigger || event.defaultPrevented || event.button > 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const selected = readItem(trigger);
    if (!selected) return;
    event.preventDefault();
    opener = trigger;
    const group = trigger.dataset.galleryGroup;
    items = /^[a-z][a-z0-9-]*$/.test(group || '')
      ? [...document.querySelectorAll(`[data-gallery-item][data-gallery-group="${group}"]`)].map(readItem).filter(Boolean)
      : [];
    if (!items.some(item => item.source === selected.source)) items = [selected];
    showItem(items.findIndex(item => item.source === selected.source));
    if (!dialog.open) dialog.showModal();
    document.body.classList.add('viewer-open');
  });

  dialog.querySelector('[data-gallery-previous]').addEventListener('click', () => showItem(index - 1));
  dialog.querySelector('[data-gallery-next]').addEventListener('click', () => showItem(index + 1));
  dialog.addEventListener('keydown', event => {
    if (items.length < 2 || dialog.classList.contains('is-zoomed') || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      showItem(index + (event.key === 'ArrowLeft' ? -1 : 1));
    }
  });
  dialog.querySelector('[data-sheet-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  zoom.addEventListener('click', () => {
    const expanded = dialog.classList.toggle('is-zoomed');
    zoom.setAttribute('aria-pressed', String(expanded));
    zoom.textContent = expanded ? '全体表示' : '拡大';
    body.scrollTop = 0;
    body.scrollLeft = 0;
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('viewer-open');
    opener?.focus({ preventScroll: true });
  });
}
