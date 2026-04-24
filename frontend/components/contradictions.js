/* ══════════════════════════
   COMPONENT: Contradictions
══════════════════════════ */

function buildContradictions(container, items) {
  container.className = 'contradictions-wrap';

  // Summary bar
  const critical = items.filter(i => i.severity === 'critical').length;
  const moderate = items.filter(i => i.severity === 'moderate').length;
  const minor    = items.filter(i => i.severity === 'minor').length;

  const summary = document.createElement('div');
  summary.style.cssText = `
    display:flex; gap:10px; margin-bottom:16px; flex-wrap:wrap;
  `;
  summary.innerHTML = `
    ${critical ? `<span style="background:var(--red-dim);color:var(--red);border:1px solid rgba(255,45,85,0.25);padding:5px 14px;border-radius:999px;font-family:var(--font-mono);font-size:0.72rem;">🔴 ${critical} Critical</span>` : ''}
    ${moderate ? `<span style="background:var(--amber-dim);color:var(--amber);border:1px solid rgba(255,149,0,0.25);padding:5px 14px;border-radius:999px;font-family:var(--font-mono);font-size:0.72rem;">🟡 ${moderate} Moderate</span>` : ''}
    ${minor    ? `<span style="background:rgba(255,255,255,0.05);color:var(--text-muted);border:1px solid var(--border);padding:5px 14px;border-radius:999px;font-family:var(--font-mono);font-size:0.72rem;">⚪ ${minor} Minor</span>` : ''}
    <span style="margin-left:auto;font-family:var(--font-mono);font-size:0.72rem;color:var(--text-muted);align-self:center;">${items.length} total findings</span>
  `;
  container.appendChild(summary);

  // Cards
  items.forEach((item, i) => {
    const card = document.createElement('div');
    card.className = `contradiction-card ${item.severity || 'minor'}`;
    card.style.animationDelay = `${i * 0.1}s`;

    const severityIcon = { critical: '🔴', moderate: '🟡', minor: '⚪' }[item.severity] || '⚪';

    const witnessTagsHtml = (item.witnesses || []).map(w =>
      `<span class="witness-tag">${w}</span>`
    ).join('');

    card.innerHTML = `
      <div class="contradiction-header">
        <span class="contradiction-severity">${severityIcon} ${item.severity || 'minor'}</span>
        <span class="contradiction-title">${item.title || 'Contradiction found'}</span>
      </div>
      <p class="contradiction-body">${item.body || ''}</p>
      ${witnessTagsHtml ? `<div class="contradiction-witnesses">${witnessTagsHtml}</div>` : ''}
    `;
    container.appendChild(card);
  });
}