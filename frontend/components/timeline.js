/* ══════════════════════════
   COMPONENT: Timeline
══════════════════════════ */

function buildTimeline(container, items) {
  container.className = 'timeline-wrap';

  items.forEach((item, i) => {
    const el = document.createElement('div');
    el.className = 'timeline-item';
    el.style.animationDelay = `${i * 0.08}s`;

    const dotColor = item.flagged ? 'var(--amber)' : 'var(--cyan)';
    const dotBg    = item.flagged ? 'var(--amber-dim)' : 'var(--cyan-dim)';
    const dotEmoji = item.flagged ? '⚠️' : '📍';

    el.innerHTML = `
      <div class="timeline-dot" style="border-color:${dotColor}; background:${dotBg}">
        ${dotEmoji}
      </div>
      <div class="timeline-body">
        <div class="timeline-time">${item.time || `Event ${i + 1}`}</div>
        <div class="timeline-event">${escapeHtml(item.event)}</div>
        ${item.flagged ? `<span class="timeline-flag">⚠ Discrepancy flagged</span>` : ''}
      </div>
    `;
    container.appendChild(el);
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}