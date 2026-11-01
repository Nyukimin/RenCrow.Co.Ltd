const seriesGroups = {
  classic: { label: '初期キャラクター', ids: Array.from({length: 22}, (_, i) => i + 1), color: '#6652ba' },
  yairo: { label: '八色通り', ids: [23, 24, 25, 26, 27, 28, 29, 30], color: '#c76842' },
  mahou: { label: 'ひみつの鈴と、まほうの星', ids: [31, 32], color: '#a855a1' },
};

const themeColors = {
  sera: '#d4a373', sena: '#4a7c91', yura: '#7c9cb8', gaku: '#8b7355',
  hazumi: '#9b4d6a', mira: '#c17f59', roku: '#5f7a6b', kikyo: '#a66b7a',
  sayo: '#7a6b8a', nico: '#6b8a7a', ritsu: '#8a7a6b', io: '#6b7a8a',
  noe: '#7a8a6b', towa: '#8a6b7a', toru: '#6b8a8a', baron: '#8a8a6b',
  koromu: '#a67b5b', naname: '#5b7ba6', fuwari: '#a65b7b', mikoro: '#7ba65b',
  momoka: '#e8a4b8', rei: '#7b5ba6', tsuzuri: '#8b7355', hibari: '#557b8b',
  neli: '#6b8a9a', rizel: '#9a8a6b', rekka: '#8b5555', mirune: '#558b7b',
  itsuki: '#7b558b', valto: '#5b5b8b', rubica: '#c77b8b', lilibell: '#e8b4c8',
};

export function renderIpGallery(ipCharacters, { escape }) {
  const switcher = `
    <div class="ip-variant-switcher" role="tablist" aria-label="表示スタイルを切り替え">
      <button role="tab" data-variant="0" aria-selected="true">現行</button>
      <button role="tab" data-variant="A" aria-selected="false">A: グリッド</button>
      <button role="tab" data-variant="B" aria-selected="false">B: ビジュアル</button>
      <button role="tab" data-variant="C" aria-selected="false">C: シリーズ</button>
      <button role="tab" data-variant="D" aria-selected="false">D: カード</button>
    </div>`;

  const variantDefault = renderVariantDefault(ipCharacters, { escape });
  const variantA = renderVariantA(ipCharacters, { escape });
  const variantB = renderVariantB(ipCharacters, { escape });
  const variantC = renderVariantC(ipCharacters, { escape });
  const variantD = renderVariantD(ipCharacters, { escape });

  return `
    <section class="ip-gallery-page wrap" aria-labelledby="ip-gallery-title">
      <div class="ip-gallery-header">
        <div>
          <p class="eyebrow">IP CHARACTERS GALLERY</p>
          <h1 id="ip-gallery-title">32人の世界を、<br><span class="highlight">のぞいてみよう。</span></h1>
          <p class="ip-gallery-lead">日常からファンタジーまで。それぞれの物語を持つ32人のIPキャラクター。</p>
        </div>
        ${switcher}
      </div>
      <div class="ip-variants-container">
        <div class="ip-variant" data-variant-panel="0">${variantDefault}</div>
        <div class="ip-variant" data-variant-panel="A" hidden>${variantA}</div>
        <div class="ip-variant" data-variant-panel="B" hidden>${variantB}</div>
        <div class="ip-variant" data-variant-panel="C" hidden>${variantC}</div>
        <div class="ip-variant" data-variant-panel="D" hidden>${variantD}</div>
      </div>
    </section>`;
}

function renderVariantDefault(chars, { escape }) {
  return `
    <div class="variant-0-grid">
      ${chars.map(c => `
        <article class="v0-card">
          <a href="/characters/${c.id}/" class="v0-visual" style="--accent:${themeColors[c.id] || '#6652ba'}">
            <img src="${escape(c.image)}" alt="${escape(c.name)}" loading="lazy" decoding="async">
            <span class="v0-number">IP / ${String(c.number).padStart(2,'0')}</span>
          </a>
          <div class="v0-info">
            <h3>${escape(c.english)}</h3>
            <span>${escape(c.name)}</span>
          </div>
          <p class="v0-tagline">${escape(c.tagline)}</p>
        </article>
      `).join('')}
    </div>`;
}

function renderVariantA(chars, { escape }) {
  return `
    <div class="variant-a">
      <aside class="va-filters" role="group" aria-label="フィルター">
        <div class="va-filter-section">
          <h3>シリーズ</h3>
          <button data-filter-series="all" class="active">すべて</button>
          <button data-filter-series="classic">初期 (01-22)</button>
          <button data-filter-series="yairo">八色通り</button>
          <button data-filter-series="mahou">魔法少女</button>
        </div>
        <div class="va-filter-section">
          <h3>性別</h3>
          <button data-filter-gender="all" class="active">すべて</button>
          <button data-filter-gender="female">女性</button>
          <button data-filter-gender="male">男性</button>
        </div>
      </aside>
      <div class="va-main">
        <div class="va-grid" role="list">
          ${chars.map(c => {
            const series = c.number >= 31 ? 'mahou' : c.number >= 23 ? 'yairo' : 'classic';
            const gender = ['yura','gaku','roku','nico','noe','toru','baron','itsuki','valto'].includes(c.id) ? 'male' : 'female';
            return `
            <article class="va-item" role="listitem" data-series="${series}" data-gender="${gender}" data-id="${c.id}">
              <button class="va-thumbnail" data-select-char="${c.id}" aria-label="${escape(c.name)}を選択">
                <img src="${escape(c.image)}" alt="" loading="lazy" decoding="async">
                <span class="va-badge">${String(c.number).padStart(2,'0')}</span>
              </button>
              <span class="va-name">${escape(c.english)}</span>
            </article>`;
          }).join('')}
        </div>
        <div class="va-detail" aria-live="polite">
          <div class="va-detail-empty">
            <p>キャラクターを選択してください</p>
          </div>
          ${chars.map(c => `
            <article class="va-detail-card" data-detail="${c.id}" hidden>
              <div class="va-detail-image" style="--accent:${themeColors[c.id] || '#6652ba'}">
                <img src="${escape(c.image)}" alt="${escape(c.name)}" loading="lazy" decoding="async">
              </div>
              <div class="va-detail-info">
                <span class="va-detail-number">IP CHARACTER #${String(c.number).padStart(2,'0')}</span>
                <h2>${escape(c.name)} <small>${escape(c.english)}</small></h2>
                <p class="va-detail-tagline">${escape(c.tagline)}</p>
                <p class="va-detail-desc">${escape(c.description)}</p>
                <a href="/characters/${c.id}/" class="va-detail-link">詳細ページへ →</a>
              </div>
            </article>
          `).join('')}
        </div>
      </div>
    </div>`;
}

function renderVariantB(chars, { escape }) {
  return `
    <div class="variant-b" data-current-char="${chars[0].id}">
      <div class="vb-showcase">
        ${chars.map((c, i) => `
          <div class="vb-character" data-char="${c.id}" style="--theme:${themeColors[c.id] || '#6652ba'}" ${i > 0 ? 'hidden' : ''}>
            <div class="vb-fullbody">
              <img src="${escape(c.image)}" alt="${escape(c.name)}" ${i === 0 ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">
              <div class="vb-backdrop"></div>
            </div>
            <div class="vb-info">
              <span class="vb-number">#${String(c.number).padStart(2,'0')}</span>
              <h2>${escape(c.english)}</h2>
              <p class="vb-jp-name">${escape(c.name)}</p>
              <blockquote class="vb-tagline">${escape(c.tagline)}</blockquote>
              <p class="vb-desc">${escape(c.description)}</p>
              <a href="/characters/${c.id}/" class="vb-link">PROFILE →</a>
            </div>
          </div>
        `).join('')}
      </div>
      <nav class="vb-strip" aria-label="キャラクター選択">
        ${chars.map(c => `
          <button class="vb-thumb" data-thumb="${c.id}" style="--thumb-color:${themeColors[c.id] || '#6652ba'}" aria-label="${escape(c.name)}">
            <img src="${escape(c.image)}" alt="" loading="lazy" decoding="async">
            <span>${String(c.number).padStart(2,'0')}</span>
          </button>
        `).join('')}
      </nav>
    </div>`;
}

function renderVariantC(chars, { escape }) {
  const groups = [
    { key: 'classic', label: '初期キャラクター', sublabel: '日常の物語', chars: chars.filter(c => c.number <= 22), color: '#6652ba' },
    { key: 'yairo', label: '八色通り', sublabel: '好きなものが違うから、同じ街が違って見える', chars: chars.filter(c => c.number >= 23 && c.number <= 30), color: '#c76842' },
    { key: 'mahou', label: 'ひみつの鈴と、まほうの星', sublabel: 'しまっておきたい。見せてあげたい。', chars: chars.filter(c => c.number >= 31), color: '#a855a1' },
  ];

  return `
    <div class="variant-c">
      ${groups.map(g => `
        <section class="vc-group" style="--group-color:${g.color}">
          <header class="vc-group-header">
            <div class="vc-group-label">
              <span class="vc-group-count">${g.chars.length} CHARACTERS</span>
              <h2>${escape(g.label)}</h2>
              <p>${escape(g.sublabel)}</p>
            </div>
          </header>
          <div class="vc-members">
            ${g.chars.map(c => `
              <a href="/characters/${c.id}/" class="vc-member" style="--accent:${themeColors[c.id] || g.color}">
                <div class="vc-avatar">
                  <img src="${escape(c.image)}" alt="" loading="lazy" decoding="async">
                </div>
                <div class="vc-member-info">
                  <span class="vc-member-num">#${String(c.number).padStart(2,'0')}</span>
                  <h3>${escape(c.name)}</h3>
                  <span class="vc-member-en">${escape(c.english)}</span>
                </div>
              </a>
            `).join('')}
          </div>
          ${g.key === 'yairo' ? `
            <div class="vc-relations">
              <h3>キャラクター相関</h3>
              <div class="vc-relation-pairs">
                <div class="vc-pair"><span>ツヅリ × イツキ</span><small>終わりを惜しむ読者と、言葉を届ける書き手</small></div>
                <div class="vc-pair"><span>ヒバリ × ネリ</span><small>静かな観察と音の収集</small></div>
                <div class="vc-pair"><span>リゼル × レッカ</span><small>一夜の庭と即興の演奏</small></div>
              </div>
            </div>
          ` : ''}
          ${g.key === 'mahou' ? `
            <div class="vc-relations">
              <h3>二人の関係</h3>
              <div class="vc-relation-pairs">
                <div class="vc-pair"><span>リリベル × ルビカ</span><small>鈴に集める子と、星として開く子</small></div>
              </div>
            </div>
          ` : ''}
        </section>
      `).join('')}
    </div>`;
}

function renderVariantD(chars, { escape }) {
  return `
    <div class="variant-d">
      ${chars.map(c => {
        const traits = c.details?.traits || [];
        const quotes = c.details?.quotes || [];
        return `
        <article class="vd-card" style="--card-accent:${themeColors[c.id] || '#6652ba'}">
          <div class="vd-portrait">
            <img src="${escape(c.image)}" alt="${escape(c.name)}" loading="lazy" decoding="async">
            <span class="vd-number">${String(c.number).padStart(2,'0')}</span>
          </div>
          <div class="vd-content">
            <header class="vd-header">
              <h2>${escape(c.english)}</h2>
              <span class="vd-jp">${escape(c.name)}</span>
            </header>
            <p class="vd-tagline">${escape(c.tagline)}</p>
            <dl class="vd-stats">
              ${c.details?.facts ? c.details.facts.slice(0, 3).map(f => `
                <div class="vd-stat">
                  <dt>${escape(f.label)}</dt>
                  <dd>${escape(f.value)}</dd>
                </div>
              `).join('') : `
                <div class="vd-stat"><dt>タイプ</dt><dd>IP CHARACTER</dd></div>
              `}
            </dl>
            ${quotes.length ? `<blockquote class="vd-quote">${escape(quotes[0])}</blockquote>` : ''}
            <a href="/characters/${c.id}/" class="vd-more">詳しく見る</a>
          </div>
        </article>`;
      }).join('')}
    </div>`;
}
