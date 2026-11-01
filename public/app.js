const controls = document.querySelector('[data-filter-controls]');
const cards = [...document.querySelectorAll('[data-character-grid] [data-character]')];
const search = document.querySelector('#character-search');
const count = document.querySelector('[data-result-count]');
const empty = document.querySelector('[data-empty-search]');
const more = document.querySelector('[data-load-more]');
const description = document.querySelector('[data-group-description]');
const buttons = [...document.querySelectorAll('[data-filter]')];
const descriptions = {
  all: '41人のキャラクター。それぞれのページから、そのひとの世界へ。',
  main: 'RenCrowのメインキャラクター、Mio・Midori・Shiro・Kuro。',
  friend: 'RenCrowのお友達、Lumina。',
  support: 'Aka・Ao・Kin・Gin。RenCrowのサブキャラクターたち。',
  ip: '日常からファンタジーまで。32人それぞれの世界をのぞいてみよう。',
};
let activeGroup = 'main';
let limit = 8;
const normalize = value => value.normalize('NFKC').toLocaleLowerCase('ja');
function render() {
  const query = normalize(search.value.trim());
  const matches = cards.filter(card => (activeGroup === 'all' || card.dataset.group === activeGroup) && normalize(card.dataset.search).includes(query));
  const shown = new Set(matches.slice(0, limit));
  cards.forEach(card => { card.hidden = !shown.has(card); });
  buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === activeGroup)));
  count.textContent = `${matches.length} CHARACTERS${matches.length > limit ? ` / ${limit}人を表示` : ''}`;
  description.textContent = descriptions[activeGroup];
  empty.hidden = matches.length !== 0;
  more.hidden = matches.length <= limit;
  more.firstChild.textContent = `もっと見る（残り${Math.max(0, matches.length - limit)}人） `;
}
if (controls && search && more && empty && count && description) {
  controls.hidden = false;
  buttons.forEach(button => button.addEventListener('click', () => { activeGroup = button.dataset.filter; limit = 8; render(); }));
  search.addEventListener('input', () => { limit = 8; render(); });
  more.addEventListener('click', () => {
    const shown = cards.filter(card => !card.hidden).length;
    limit += 8;
    render();
    cards.filter(card => !card.hidden)[shown]?.querySelector('a').focus({ preventScroll: true });
  });
  document.querySelector('[data-reset-search]').addEventListener('click', () => { search.value = ''; activeGroup = 'all'; limit = 8; render(); search.focus(); });
  render();
}
