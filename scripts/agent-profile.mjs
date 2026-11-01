export function renderAgentProfile(character, { escape, allAgents }) {
  const agent = character.agentDetails;
  if (!agent) return '';

  const isSupport = character.group === 'support';
  const isMain = character.group === 'main';
  const isFriend = character.group === 'friend';

  const teamSection = isMain ? renderTeamRelations(character, allAgents, { escape }) : '';
  const supportTeamSection = isSupport ? renderSupportTeam(character, allAgents, { escape }) : '';
  const personaSection = isFriend && agent.personas ? renderPersonas(agent.personas, { escape }) : '';

  return `<nav class="profile-quick-nav wrap" aria-label="キャラクター紹介の目次">
<a href="#agent-role">役割と得意分野</a>
<a href="#agent-voice">口調と話し方</a>
${teamSection ? '<a href="#agent-team">チーム関係</a>' : ''}
${supportTeamSection ? '<a href="#support-team">四神チーム</a>' : ''}
${personaSection ? '<a href="#agent-personas">3つのペルソナ</a>' : ''}
<a href="#character-works">作品</a>
</nav>

<section class="agent-role-section wrap section-space" id="agent-role" aria-labelledby="agent-role-title">
  <div class="agent-role-grid">
    <div class="agent-role-content">
      <p class="eyebrow">01 / ROLE & EXPERTISE</p>
      <h2 id="agent-role-title">${escape(character.name)}の<br><span>役割と得意分野。</span></h2>
      <div class="agent-role-details">
        <dl class="agent-facts">
          <div><dt>所属</dt><dd>${escape(agent.affiliation)}</dd></div>
          <div><dt>役割</dt><dd>${escape(agent.role)}</dd></div>
          ${agent.specialty ? `<div><dt>得意分野</dt><dd>${escape(agent.specialty)}</dd></div>` : ''}
          ${agent.approach ? `<div><dt>アプローチ</dt><dd>${escape(agent.approach)}</dd></div>` : ''}
        </dl>
      </div>
    </div>
    <div class="agent-role-visual">
      <div class="agent-card-large color-${character.id}">
        <img src="${escape(character.image)}" alt="${escape(character.name)}" width="${character.width}" height="${character.height}" loading="lazy" decoding="async">
        <div class="agent-card-overlay">
          <span class="agent-card-number">${String(character.number).padStart(2, '0')}</span>
          <span class="agent-card-name">${escape(character.english)}</span>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="agent-voice-section section-space" id="agent-voice" aria-labelledby="agent-voice-title">
  <div class="wrap">
    <div class="section-top">
      <p class="eyebrow">02 / VOICE & STYLE</p>
      <span class="section-index">${escape(character.english.toUpperCase())} / COMMUNICATION</span>
    </div>
    <div class="section-heading">
      <h2 id="agent-voice-title">こんな風に、<br><span>話します。</span></h2>
      <p>一人称、呼び方、口調の特徴。<br>${escape(character.name)}らしさが伝わる言葉たち。</p>
    </div>
    <div class="agent-voice-grid">
      <div class="agent-voice-info">
        <dl class="agent-voice-facts">
          ${agent.firstPerson ? `<div><dt>一人称</dt><dd>「${escape(agent.firstPerson)}」</dd></div>` : ''}
          ${agent.userCall ? `<div><dt>ユーザーの呼び方</dt><dd>「${escape(agent.userCall)}」</dd></div>` : ''}
          ${agent.speechStyle ? `<div><dt>口調の特徴</dt><dd>${escape(agent.speechStyle)}</dd></div>` : ''}
          ${agent.suffix ? `<div><dt>語尾</dt><dd>${escape(agent.suffix)}</dd></div>` : ''}
        </dl>
      </div>
      <div class="agent-quotes">
        <h3>こんな言葉を、口にする。</h3>
        ${agent.sampleDialogues.map(d => `<blockquote class="agent-quote">「${escape(d)}」</blockquote>`).join('')}
        <p class="content-note">キャラクター設定に基づいた台詞例です。</p>
      </div>
    </div>
  </div>
</section>

${teamSection}
${supportTeamSection}
${personaSection}`;
}

function renderTeamRelations(character, allAgents, { escape }) {
  const mainAgents = allAgents.filter(a => a.group === 'main' && a.id !== character.id);
  const supportAgents = allAgents.filter(a => a.group === 'support');
  
  return `<section class="agent-team-section wrap section-space" id="agent-team" aria-labelledby="agent-team-title">
  <div class="section-top">
    <p class="eyebrow">03 / TEAM RELATIONS</p>
    <span class="section-index">RENCROW CORE / AGENTS</span>
  </div>
  <div class="section-heading">
    <h2 id="agent-team-title">一緒に働く、<br><span>仲間たち。</span></h2>
    <p>RenCrow COREを支える<br>4人のメインAgentと4人のサポートCoder。</p>
  </div>
  <div class="agent-team-grid">
    <div class="team-section">
      <h3 class="team-section-title">メインAgent</h3>
      <p class="team-section-desc">それぞれの専門領域を持つ4人のメインキャラクター。</p>
      <div class="team-members">
        ${mainAgents.map(a => `<a href="/characters/${a.id}/" class="team-member-card color-${a.id}">
          <img src="${escape(a.image)}" alt="${escape(a.name)}" width="80" height="80" loading="lazy" decoding="async">
          <div class="team-member-info">
            <span class="team-member-name">${escape(a.english)}</span>
            <span class="team-member-role">${escape(a.agentDetails?.role || a.tagline)}</span>
          </div>
        </a>`).join('')}
      </div>
    </div>
    <div class="team-section">
      <h3 class="team-section-title">サポートCoder（四神）</h3>
      <p class="team-section-desc">開発作業を担う4人の守護者たち。</p>
      <div class="team-members team-members-small">
        ${supportAgents.map(a => `<a href="/characters/${a.id}/" class="team-member-mini color-${a.id}">
          <img src="${escape(a.image)}" alt="${escape(a.name)}" width="48" height="48" loading="lazy" decoding="async">
          <span>${escape(a.name)}</span>
        </a>`).join('')}
      </div>
    </div>
  </div>
</section>`;
}

function renderSupportTeam(character, allAgents, { escape }) {
  const supportAgents = allAgents.filter(a => a.group === 'support');
  const agent = character.agentDetails;
  
  const directionMap = {
    'aka': { direction: '南', guardian: '朱雀', element: '火', color: '#e85d4c' },
    'ao': { direction: '東', guardian: '青龍', element: '木', color: '#4a90a4' },
    'kin': { direction: '北', guardian: '玄武', element: '水', color: '#6b8e5e' },
    'gin': { direction: '西', guardian: '白虎', element: '金', color: '#9e8ec1' }
  };
  
  const info = directionMap[character.id] || {};
  
  return `<section class="support-team-section section-space" id="support-team" aria-labelledby="support-team-title">
  <div class="wrap">
    <div class="section-top">
      <p class="eyebrow">03 / FOUR GUARDIANS</p>
      <span class="section-index">四神 / CODER TEAM</span>
    </div>
    <div class="section-heading">
      <h2 id="support-team-title">四神の一員、<br><span>${escape(info.guardian || '守護者')}。</span></h2>
      <p>四方を守る神獣をモチーフにした<br>4人のCoderチームの一員。</p>
    </div>
    <div class="support-guardian-info">
      <div class="guardian-card" style="--guardian-color: ${info.color || 'var(--purple)'}">
        <div class="guardian-symbol">${escape(info.guardian || '守護')}</div>
        <dl class="guardian-facts">
          <div><dt>方角</dt><dd>${escape(info.direction || '—')}の守護者</dd></div>
          <div><dt>モチーフ</dt><dd>${escape(info.guardian || '—')}</dd></div>
          <div><dt>元素</dt><dd>${escape(info.element || '—')}</dd></div>
          ${agent?.suffix ? `<div><dt>語尾</dt><dd>「${escape(agent.suffix)}」</dd></div>` : ''}
        </dl>
      </div>
    </div>
    <div class="support-team-members">
      <h3>四神チーム</h3>
      <div class="guardian-grid">
        ${supportAgents.map(a => {
          const aInfo = directionMap[a.id] || {};
          const isCurrent = a.id === character.id;
          return `<a href="/characters/${a.id}/" class="guardian-member ${isCurrent ? 'is-current' : ''}" style="--member-color: ${aInfo.color || 'var(--purple)'}">
            <img src="${escape(a.image)}" alt="${escape(a.name)}" width="64" height="64" loading="lazy" decoding="async">
            <div class="guardian-member-info">
              <span class="guardian-member-name">${escape(a.name)}</span>
              <span class="guardian-member-title">${escape(aInfo.direction || '')}・${escape(aInfo.guardian || '')}</span>
            </div>
          </a>`;
        }).join('')}
      </div>
    </div>
  </div>
</section>`;
}

function renderPersonas(personas, { escape }) {
  return `<section class="personas-section section-space" id="agent-personas" aria-labelledby="personas-title">
  <div class="wrap">
    <div class="section-top">
      <p class="eyebrow">03 / THREE PERSONAS</p>
      <span class="section-index">LUMINA / CLARIS / NOX</span>
    </div>
    <div class="section-heading">
      <h2 id="personas-title">3つの顔、<br><span>ひとつの存在。</span></h2>
      <p>場面や状況に応じて現れる<br>ルミナの3つのペルソナ。</p>
    </div>
    <div class="personas-grid">
      ${personas.map((p, i) => `<article class="persona-card" style="--persona-color: ${p.color}">
        <div class="persona-header">
          <span class="persona-number">${String(i + 1).padStart(2, '0')}</span>
          <h3 class="persona-name">${escape(p.name)}</h3>
          <span class="persona-english">${escape(p.english)}</span>
        </div>
        <p class="persona-tagline">${escape(p.tagline)}</p>
        <p class="persona-description">${escape(p.description)}</p>
        ${p.traits ? `<ul class="persona-traits">${p.traits.map(t => `<li>${escape(t)}</li>`).join('')}</ul>` : ''}
      </article>`).join('')}
    </div>
    <p class="content-note">ペルソナは設定上の概念であり、状況に応じて自然に切り替わります。</p>
  </div>
</section>`;
}

export function renderAgentFacts(character, { escape }) {
  const agent = character.agentDetails;
  if (!agent) return '';
  
  const facts = [];
  if (character.birthday) facts.push({ label: '誕生日', value: character.birthday });
  if (character.age) facts.push({ label: '年齢', value: character.age });
  if (character.height && typeof character.height === 'string' && character.height.includes('cm')) {
    facts.push({ label: '身長', value: character.height });
  }
  if (character.imageColor) facts.push({ label: 'イメージカラー', value: character.imageColor });
  if (agent.affiliation) facts.push({ label: '所属', value: agent.affiliation });
  if (agent.role) facts.push({ label: '役割', value: agent.role });
  
  if (facts.length === 0) return '';
  
  return `<dl class="profile-facts">${facts.map(fact => `<div><dt>${escape(fact.label)}</dt><dd>${escape(fact.value)}</dd></div>`).join('')}</dl>`;
}
