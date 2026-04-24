/* ══════════════════════════
   COMPONENT: Summary
   Handles reliability cards + verdict
══════════════════════════ */

function buildReliabilityCards(container, scores) {
  container.className = 'reliability-wrap';

  scores.forEach((s, i) => {
    const score = Math.max(0, Math.min(100, s.score));
    const tier  = score >= 70 ? 'high' : score >= 45 ? 'med' : 'low';
    const barColor = { high: 'var(--green)', med: 'var(--amber)', low: 'var(--red)' }[tier];
    const verdict  = { high: '✅ Credible', med: '⚠ Questionable', low: '❌ Unreliable' }[tier];

    const card = document.createElement('div');
    card.className = 'reliability-card';
    card.style.animationDelay = `${i * 0.1}s`;

    card.innerHTML = `
      <div class="reliability-header">
        <div>
          <div class="witness-name">${s.name}</div>
          <span style="font-family:var(--font-mono);font-size:0.65rem;color:${barColor};margin-top:4px;display:block">${verdict}</span>
        </div>
        <div class="reliability-score-big score-${tier}">${score}%</div>
      </div>
      <div class="score-bar-wrap">
        <div class="score-bar" style="width:0%; background: linear-gradient(90deg, ${barColor}, ${barColor}aa)"></div>
      </div>
      <p class="reliability-reason">${s.reason || 'Analysis complete. See full report for details.'}</p>
    `;
    container.appendChild(card);

    // Double rAF ensures bar is painted at 0% before transition fires
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const bar = card.querySelector('.score-bar');
      if (bar) bar.style.width = `${score}%`;
    }));
  });
}

function buildVerdictSummary(container, text) {
  container.className = 'verdict-wrap';

  // Split into sections if possible
  const sections = [
    { icon: '📝', title: 'Chief Justice Final Verdict', content: text }
  ];

  sections.forEach(section => {
    const div = document.createElement('div');
    div.className = 'verdict-section';
    div.innerHTML = `
      <h3>${section.icon} ${section.title}</h3>
      <div class="verdict-content">${section.content}</div>
    `;
    container.appendChild(div);
  });

  // Add print/copy button
  const actions = document.createElement('div');
  actions.style.cssText = 'display:flex;gap:10px;margin-top:20px;';
  actions.innerHTML = `
    <button onclick="copyVerdict()" style="
      background:var(--cyan-dim);border:1px solid rgba(0,212,255,0.3);
      color:var(--cyan);border-radius:8px;font-family:var(--font-mono);
      font-size:0.75rem;padding:8px 16px;cursor:pointer;transition:all 0.3s;
    ">📋 Copy Report</button>
    <button onclick="window.print()" style="
      background:rgba(255,255,255,0.04);border:1px solid var(--border);
      color:var(--text-secondary);border-radius:8px;font-family:var(--font-mono);
      font-size:0.75rem;padding:8px 16px;cursor:pointer;transition:all 0.3s;
    ">🖨️ Print</button>
  `;
  container.appendChild(actions);
}

function copyVerdict() {
  const text = document.querySelector('.verdict-content')?.textContent || '';
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.querySelector('[onclick="copyVerdict()"]');
    if (btn) { btn.textContent = '✅ Copied!'; setTimeout(() => btn.textContent = '📋 Copy Report', 2000); }
  });
}