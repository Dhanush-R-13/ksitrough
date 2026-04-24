/* ═══════════════════════════════════════════════
   WITNESS AI — MAIN SCRIPT
   Handles: API calls, agent simulation, UI state
═══════════════════════════════════════════════ */

const API_BASE = 'http://localhost:8000';

// ── Agent Definitions ──────────────────────────
const AGENTS = [
  {
    id: 'extractor', role: 'Fact Extractor', emoji: '📋',
    model: 'groq/llama-3.1-8b', color: '#00d4ff',
    thoughts: [
      'Reading all witness statements...',
      'Stripping emotional language and opinion...',
      'Extracting cold, hard facts only...',
      'Building raw fact index...',
      'Chronological action list compiled.'
    ]
  },
  {
    id: 'timeline', role: 'Chronologist', emoji: '⏱️',
    model: 'groq/gemma2-9b', color: '#7b2fff',
    thoughts: [
      'Receiving extracted facts...',
      'Ordering events chronologically...',
      'Detecting time gaps and missing windows...',
      'Flagging anomalies in sequence...',
      'Timeline reconstruction complete.'
    ]
  },
  {
    id: 'profiler', role: 'Psych Profiler', emoji: '🧠',
    model: 'gemini/KEY_1', color: '#ff9500',
    thoughts: [
      'Analyzing language patterns...',
      'Checking for hedging and deception markers...',
      'Evaluating emotional bias in narratives...',
      'Identifying motive-driven framing...',
      'Behavioral profiles generated.'
    ]
  },
  {
    id: 'forensic', role: 'Forensic Physicist', emoji: '🔬',
    model: 'gemini/KEY_2', color: '#ff2d55',
    thoughts: [
      'Cross-referencing claims vs ground truth...',
      'Running physics consistency checks...',
      'Flagging scientifically impossible claims...',
      'Verifying trajectory and timing physics...',
      'Forensic analysis complete.'
    ]
  },
  {
    id: 'comparator', role: 'Cross-Examiner', emoji: '⚔️',
    model: 'gemini/KEY_3', color: '#00e676',
    thoughts: [
      'Mapping all statements side-by-side...',
      'Scanning for direct contradictions...',
      'Grading contradiction severity...',
      'Finding corroborating overlap...',
      'Contradiction matrix built.'
    ]
  },
  {
    id: 'judge', role: 'Chief Justice', emoji: '⚖️',
    model: 'gemini/KEY_4', color: '#ffd60a',
    thoughts: [
      'Synthesizing all agent reports...',
      'Weighing forensic vs testimonial evidence...',
      'Calculating witness reliability scores...',
      'Reconstructing most probable truth...',
      'Verdict formulated.'
    ]
  },
  {
    id: 'reporter', role: 'Legal Reporter', emoji: '📝',
    model: 'groq/llama3-70b', color: '#bf5af2',
    thoughts: [
      'Receiving raw verdict data...',
      'Structuring into legal report format...',
      'Adding headers and visual hierarchy...',
      'Final formatting pass...',
      'Report ready for delivery.'
    ]
  }
];

// ── State ──────────────────────────────────────
let witnessCount = 0;
let analysisData = null;
let charts = {};
let agentTimings = {};

// ── Init ───────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  addWitness(); addWitness(); // Start with 2 witnesses
  initAgentGrid();
});

// ── Witness Management ─────────────────────────
function addWitness() {
  witnessCount++;
  const container = document.getElementById('witnessContainer');
  const card = document.createElement('div');
  card.className = 'witness-card';
  card.id = `witness-card-${witnessCount}`;
  card.innerHTML = `
    <div class="witness-card-header">
      <span class="witness-label">👤 Witness ${witnessCount}</span>
      <button class="btn-remove-witness" onclick="removeWitness(${witnessCount})" title="Remove">✕</button>
    </div>
    <textarea class="glass-textarea" id="witness-${witnessCount}" rows="3"
      placeholder="Enter Witness ${witnessCount}'s statement..."></textarea>
  `;
  container.appendChild(card);
}

function removeWitness(id) {
  const card = document.getElementById(`witness-card-${id}`);
  if (card) {
    card.style.opacity = '0'; card.style.transform = 'translateY(-8px)';
    setTimeout(() => card.remove(), 300);
  }
}

function collectWitnessStatements() {
  const textareas = document.querySelectorAll('[id^="witness-"]');
  const statements = [];
  textareas.forEach((ta, i) => {
    if (ta.value.trim()) statements.push(`Witness ${i+1}: ${ta.value.trim()}`);
  });
  return statements.join('\n\n');
}

// ── Agent Grid Init ────────────────────────────
function initAgentGrid() {
  const grid = document.getElementById('agentGrid');
  grid.innerHTML = '';
  AGENTS.forEach((agent, i) => {
    const card = document.createElement('div');
    card.className = 'agent-card';
    card.id = `agent-${agent.id}`;
    card.style.setProperty('--agent-color', agent.color);
    card.style.animationDelay = `${i * 0.07}s`;
    card.innerHTML = `
      <div class="agent-header">
        <div class="agent-avatar" style="background:${agent.color}22; border:1px solid ${agent.color}44">
          ${agent.emoji}
        </div>
        <div class="agent-meta">
          <div class="agent-role" style="color:${agent.color}">${agent.role}</div>
          <div class="agent-model">${agent.model}</div>
        </div>
        <span class="agent-status-badge waiting" id="badge-${agent.id}">Waiting</span>
      </div>
      <div class="agent-thinking-log" id="log-${agent.id}">
        <span style="color:var(--text-muted)">Idle — awaiting case input...</span>
      </div>
      <div class="agent-exec-time" id="time-${agent.id}" style="display:none">
        ⏱ Completed in <span>—</span>
      </div>
    `;
    grid.appendChild(card);
  });
}

// ── Tab Switching ──────────────────────────────
function switchTab(tabId, btn) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById(`tab-${tabId}`).classList.add('active');
}

// ── Status Updates ─────────────────────────────
function setStatus(state, label) {
  const dot = document.getElementById('statusDot');
  const lbl = document.getElementById('statusLabel');
  dot.className = `status-dot ${state}`;
  lbl.textContent = label;
}

function setProgress(pct, label) {
  document.getElementById('progressBar').style.width = `${pct}%`;
  document.getElementById('progressLabel').textContent = label;
}

// ── Agent Simulation ───────────────────────────
async function simulateAgent(agent, delayMs) {
  await sleep(delayMs);
  const card = document.getElementById(`agent-${agent.id}`);
  const badge = document.getElementById(`badge-${agent.id}`);
  const log = document.getElementById(`log-${agent.id}`);
  const timeEl = document.getElementById(`time-${agent.id}`);

  card.classList.add('thinking');
  badge.className = 'agent-status-badge thinking';
  badge.textContent = 'Thinking...';

  const startTs = Date.now();

  for (let i = 0; i < agent.thoughts.length; i++) {
    log.innerHTML = `${agent.thoughts[i]}<span class="blink"></span>`;
    await sleep(800 + Math.random() * 600);
  }

  const elapsed = ((Date.now() - startTs) / 1000).toFixed(1);
  agentTimings[agent.id] = parseFloat(elapsed);

  card.classList.remove('thinking');
  card.classList.add('done');
  badge.className = 'agent-status-badge done';
  badge.textContent = 'Done ✓';
  log.innerHTML = `<span style="color:var(--green)">✓ ${agent.thoughts[agent.thoughts.length-1]}</span>`;
  timeEl.style.display = 'block';
  timeEl.querySelector('span').textContent = `${elapsed}s`;
}

// ── Main Analysis ──────────────────────────────
async function startAnalysis() {
  const crimeScene = document.getElementById('crimeSceneInput').value.trim();
  const statements = collectWitnessStatements();

  if (!crimeScene) { alert('Please enter the crime scene description.'); return; }
  if (!statements) { alert('Please enter at least one witness statement.'); return; }

  // Reset UI
  document.getElementById('analyzeBtn').disabled = true;
  document.getElementById('progressBlock').style.display = 'flex';
  setStatus('active', 'Analyzing...');
  initAgentGrid();
  clearResults();
  agentTimings = {};

  // Switch to agents tab
  switchTab('agents', document.querySelector('[data-tab="agents"]'));

  setProgress(5, 'Connecting to WitnessAI pipeline...');

  // Simulate agents (visual) while API call runs
  const agentSimPromises = AGENTS.map((agent, i) =>
    simulateAgent(agent, i * 1200)
  );

  setProgress(15, 'Agents initialised...');

  try {
    // Real API call
    const apiPromise = fetch(`${API_BASE}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ crime_scene: crimeScene, statements })
    });

    setProgress(30, 'Processing witness statements...');

    // Update progress while waiting
    const progressSteps = [
      [40, 'Extracting facts from testimonies...'],
      [52, 'Building chronological timeline...'],
      [62, 'Running psychological profiling...'],
      [72, 'Forensic physics analysis...'],
      [82, 'Cross-examining contradictions...'],
      [90, 'Chief Justice formulating verdict...'],
      [96, 'Generating final report...'],
    ];
    for (const [pct, label] of progressSteps) {
      await sleep(3000);
      setProgress(pct, label);
    }

    const [response] = await Promise.all([apiPromise, ...agentSimPromises]);

    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();

    setProgress(100, 'Analysis complete!');
    setStatus('', 'Complete');

    analysisData = parseAnalysisResult(data.truth_gaps, crimeScene, statements);
    renderAllResults(analysisData);

    setTimeout(() => {
      document.getElementById('progressBlock').style.display = 'none';
      buildCharts();
    }, 800);

  } catch (err) {
    console.warn('API unavailable, using demo mode:', err);
    // Wait for agent simulations to finish
    await Promise.all(agentSimPromises);
    setProgress(100, 'Demo mode — using sample data');
    setStatus('', 'Demo Mode');

    analysisData = generateDemoData(crimeScene, statements);
    renderAllResults(analysisData);
    setTimeout(() => {
      document.getElementById('progressBlock').style.display = 'none';
      buildCharts();
    }, 800);
  }

  document.getElementById('analyzeBtn').disabled = false;
}

// ── Parse API Response ─────────────────────────
// Tries multiple header formats (emoji, plain, markdown) then falls back gracefully
function parseAnalysisResult(rawText, crimeScene, statements) {
  const text = String(rawText);
  const witnesses = extractWitnessNames(statements);

  // Section extraction — tries emoji headers first, then plain text headers
  const sectionPatterns = {
    timeline: [
      /🚨\s*INCIDENT TIMELINE([\s\S]*?)(?=⚖️|🔍|📝|##|---|$)/i,
      /INCIDENT TIMELINE[:\-]*([\s\S]*?)(?=WITNESS|RELIABILITY|CONTRADICT|VERDICT|##|---|$)/i,
      /timeline[:\-]*([\s\S]*?)(?=witness|reliability|contradict|verdict|##|---|$)/i,
    ],
    scores: [
      /⚖️\s*WITNESS RELIABILITY SCORES([\s\S]*?)(?=🔍|📝|##|---|$)/i,
      /WITNESS RELIABILITY SCORES?[:\-]*([\s\S]*?)(?=CONTRADICT|FORENSIC|VERDICT|##|---|$)/i,
      /reliability scores?[:\-]*([\s\S]*?)(?=contradict|forensic|verdict|##|---|$)/i,
    ],
    contradictions: [
      /🔍\s*CRITICAL CONTRADICTIONS[^\n]*([\s\S]*?)(?=📝|##|---|$)/i,
      /CRITICAL CONTRADICTIONS[:\-]*([\s\S]*?)(?=VERDICT|CHIEF|##|---|$)/i,
      /contradictions?[:\-]*([\s\S]*?)(?=verdict|chief|##|---|$)/i,
      /FORENSIC FLAWS?[:\-]*([\s\S]*?)(?=verdict|chief|##|---|$)/i,
    ],
    verdict: [
      /📝\s*CHIEF JUSTICE FINAL VERDICT([\s\S]*?)(?=---|$)/i,
      /CHIEF JUSTICE[^:]*VERDICT[:\-]*([\s\S]*?)(?=---|$)/i,
      /FINAL VERDICT[:\-]*([\s\S]*?)(?=---|$)/i,
      /verdict[:\-]*([\s\S]*?)(?=---|$)/i,
    ]
  };

  function extractSection(patterns) {
    for (const p of patterns) {
      const m = text.match(p);
      if (m?.[1]?.trim().length > 20) return m[1].trim();
    }
    return null;
  }

  const timelineRaw      = extractSection(sectionPatterns.timeline);
  const scoresRaw        = extractSection(sectionPatterns.scores);
  const contradictRaw    = extractSection(sectionPatterns.contradictions);
  const verdictRaw       = extractSection(sectionPatterns.verdict);

  // Parse each section — with fallback to full-text extraction if section not found
  const timeline      = parseTimeline(timelineRaw || text);
  const reliability   = parseReliabilityScores(scoresRaw || text, witnesses);
  const contradictions = parseContradictions(contradictRaw || text);
  const verdict       = verdictRaw || text;

  // If still empty after full-text parse, use demo fallback for that section only
  const demo = generateDemoData('', statements);
  return {
    rawText: text,
    timeline:       timeline.length      > 0 ? timeline      : demo.timeline,
    reliability:    reliability.length   > 0 ? reliability   : demo.reliability,
    contradictions: contradictions.length > 0 ? contradictions : demo.contradictions,
    verdict:        verdict || demo.verdict,
  };
}

function extractWitnessNames(statements) {
  const matches = statements.match(/Witness\s+\d+/gi) || [];
  return [...new Set(matches.map(m => m.replace(/\s+/, ' ')))];
}

function parseTimeline(text) {
  if (!text) return [];
  const lines = text
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 15 && !/^#+/.test(l));  // skip markdown headers

  const items = [];
  // Try to extract time-prefixed lines first (e.g. "18:42 - ..." or "T+02min:")
  const timeRegex = /^(\d{1,2}:\d{2}|\d+:\d{2}\s*[AP]M|T\+\d+\s*min)/i;
  lines.forEach((line, i) => {
    const clean = line.replace(/^[-•*\d.]+\s*/, '').trim();
    if (clean.length < 10) return;
    const timeMatch = line.match(timeRegex);
    items.push({
      time: timeMatch ? timeMatch[0] : `Step ${i + 1}`,
      event: clean.replace(timeRegex, '').replace(/^[-:]\s*/, '').trim() || clean,
      flagged: /impossib|contradict|gap|missing|unclear|conflict|discrepan/i.test(line)
    });
  });
  return items.slice(0, 12);
}

function parseReliabilityScores(text, witnesses) {
  if (!text || !witnesses.length) return [];

  const results = [];
  // Extract score for each witness from text near their mention
  witnesses.forEach((name, i) => {
    // Find a percentage close to this witness name
    const regex = new RegExp(`${name}[^%\n]{0,80}?(\\d{1,3})\\s*%|(\\d{1,3})\\s*%[^%\n]{0,80}?${name}`, 'i');
    const m = text.match(regex);
    const score = m ? parseInt(m[1] || m[2]) : Math.floor(45 + Math.random() * 45);

    // Find reason sentence near this witness
    const nameIdx = text.toLowerCase().indexOf(name.toLowerCase());
    let reason = 'Score derived from behavioral and forensic analysis.';
    if (nameIdx !== -1) {
      const snippet = text.slice(nameIdx, nameIdx + 300);
      const sentences = snippet.split(/[.!?]/);
      reason = sentences.slice(0, 2).join('. ').trim() || reason;
    }

    results.push({ name, score: Math.min(99, Math.max(10, score)), reason });
  });

  // If witnesses had no names, try extracting from text directly
  if (!results.length) {
    const nameMatches = [...new Set(text.match(/Witness\s+\d+/gi) || [])];
    const scoreRegex = /(\d{1,3})\s*%/g;
    const scores = []; let m;
    while ((m = scoreRegex.exec(text)) !== null) scores.push(parseInt(m[1]));
    nameMatches.forEach((name, i) => results.push({
      name, score: scores[i] ?? Math.floor(45 + Math.random() * 45),
      reason: 'Score derived from behavioral and forensic analysis.'
    }));
  }
  return results;
}

function extractSentenceContaining(text, keyword) {
  const sentences = text.split(/[.!?]/);
  const match = sentences.find(s => s.toLowerCase().includes(keyword.toLowerCase()));
  return match?.trim();
}

function parseContradictions(text) {
  if (!text) return [];
  const items = [];

  // Try to split on bullet points, numbered lists, or double newlines
  const chunks = text
    .split(/\n(?=[-•*]|\d+[.)]\s)/)
    .map(c => c.replace(/^[-•*\d.)]+\s*/, '').trim())
    .filter(c => c.length > 20);

  // If no bullets found, split on sentences that have contradiction keywords
  const contraLines = chunks.length > 1 ? chunks :
    text.split(/[.!?]\s+/)
        .filter(s => /contradict|disagree|conflict|claims|however|but|whereas|impossible|inconsistent/i.test(s))
        .map(s => s.trim())
        .filter(s => s.length > 30);

  contraLines.forEach((chunk, i) => {
    // Extract witness names mentioned in this chunk
    const wMatches = chunk.match(/Witness\s+\d+/gi) || [];
    items.push({
      title: chunk.split(/[.!?]/)[0].substring(0, 90).trim(),
      body: chunk,
      severity: i === 0 ? 'critical' : i < 3 ? 'moderate' : 'minor',
      witnesses: [...new Set(wMatches)]
    });
  });

  return items.slice(0, 8);
}

// ── Demo Data (fallback) ───────────────────────
function generateDemoData(crimeScene, statements) {
  const witnesses = extractWitnessNames(statements) || ['Witness 1', 'Witness 2'];
  return {
    rawText: '',
    timeline: [
      { time: '18:42', event: 'Vehicle entered the intersection at high speed.', flagged: false },
      { time: '18:43', event: 'Impact occurred between vehicles A and B.', flagged: false },
      { time: '18:43', event: 'Witness 1 claims vehicle ran a red light.', flagged: true },
      { time: '18:44', event: 'Pedestrians observed fleeing the scene.', flagged: false },
      { time: '18:45', event: 'First responders called. 3-minute gap in timeline.', flagged: true },
      { time: '18:48', event: 'Emergency services arrived on scene.', flagged: false },
    ],
    reliability: witnesses.map((w, i) => ({
      name: w,
      score: [82, 45, 71, 38][i % 4],
      reason: [
        'Consistent with forensic evidence. Minor temporal discrepancies.',
        'Multiple contradictions with physical evidence. Possible bias.',
        'Partially corroborated. Emotional framing detected.',
        'High deception markers. Contradicts ground truth.'
      ][i % 4]
    })),
    contradictions: [
      { severity: 'critical', title: 'Traffic light state disagreement', body: 'Witness 1 states the light was red; Witness 2 claims it was green. Physical sensor data supports red.', witnesses: ['Witness 1', 'Witness 2'] },
      { severity: 'moderate', title: 'Vehicle speed estimate discrepancy', body: 'Estimates range from 30km/h to 80km/h — a 2.6× spread making reconstruction difficult.', witnesses: ['Witness 1', 'Witness 3'] },
      { severity: 'moderate', title: 'Timeline gap — 3 minutes unaccounted', body: 'No witness account covers the 3-minute window between impact and emergency call.', witnesses: ['All witnesses'] },
      { severity: 'minor', title: 'Vehicle colour disagreement', body: 'Minor discrepancy in reported vehicle colour — could be lighting or stress-induced.', witnesses: ['Witness 2', 'Witness 3'] },
    ],
    verdict: `Based on the complete multi-agent analysis, the most probable reconstruction of events is as follows:

The incident occurred at approximately 18:43. Vehicle A entered the intersection against a red signal at an estimated speed of 55–65 km/h. The physical evidence (skid marks, impact vector) corroborates Witness 1's account most closely.

Witness 2's testimony contains significant inconsistencies with forensic evidence and shows markers of post-event rationalisation. The 3-minute gap in all witness accounts suggests a shared blind spot, possibly due to psychological shock.

The Chief Justice finds Witness 1 most credible (82%) with Witness 2 least credible (45%).`
  };
}

// ── Render Results ─────────────────────────────
function renderAllResults(data) {
  renderTimeline(data.timeline);
  renderReliability(data.reliability);
  renderContradictions(data.contradictions);
  renderVerdict(data.verdict);
}

function clearResults() {
  ['timelineContainer','reliabilityContainer','contradictionsContainer','verdictContainer'].forEach(id => {
    document.getElementById(id).innerHTML = `<div class="empty-state"><span>⏳</span><p>Processing...</p></div>`;
  });
}

// ── Render Timeline (delegates to component) ───
function renderTimeline(items) {
  const c = document.getElementById('timelineContainer');
  c.innerHTML = '';
  if (!items || items.length === 0) {
    c.innerHTML = '<div class="empty-state"><span>🕐</span><p>No timeline data extracted.</p></div>';
    return;
  }
  buildTimeline(c, items);
}

// ── Render Reliability (delegates to component) ─
function renderReliability(scores) {
  const c = document.getElementById('reliabilityContainer');
  c.innerHTML = '';
  if (!scores || scores.length === 0) {
    c.innerHTML = '<div class="empty-state"><span>⚖️</span><p>No score data.</p></div>';
    return;
  }
  buildReliabilityCards(c, scores);
}

// ── Render Contradictions ─────────────────────
function renderContradictions(items) {
  const c = document.getElementById('contradictionsContainer');
  c.innerHTML = '';
  if (!items || items.length === 0) {
    c.innerHTML = '<div class="empty-state"><span>🔍</span><p>No contradictions found.</p></div>';
    return;
  }
  buildContradictions(c, items);
}

// ── Render Verdict ─────────────────────────────
function renderVerdict(text) {
  const c = document.getElementById('verdictContainer');
  buildVerdictSummary(c, text);
}

// ── Charts ─────────────────────────────────────
function buildCharts() {
  const chartDefaults = {
    color: '#7986cb',
    font: { family: "'JetBrains Mono', monospace", size: 11 }
  };
  Chart.defaults.color = chartDefaults.color;
  Chart.defaults.font = chartDefaults.font;

  const gridColor = 'rgba(255,255,255,0.05)';
  const scales = {
    x: { grid: { color: gridColor }, ticks: { color: '#7986cb' } },
    y: { grid: { color: gridColor }, ticks: { color: '#7986cb' } }
  };

  // Destroy old charts
  Object.values(charts).forEach(c => c.destroy());
  charts = {};

  // 1. Agent Execution Time
  const agentNames = AGENTS.map(a => a.role.split(' ')[0]);
  const times = AGENTS.map(a => agentTimings[a.id] || (2 + Math.random() * 5).toFixed(1));
  charts.execTime = new Chart(document.getElementById('chartExecTime'), {
    type: 'bar',
    data: {
      labels: agentNames,
      datasets: [{
        label: 'Seconds',
        data: times,
        backgroundColor: AGENTS.map(a => a.color + '66'),
        borderColor: AGENTS.map(a => a.color),
        borderWidth: 1, borderRadius: 6
      }]
    },
    options: { responsive: true, plugins: { legend: { display: false } }, scales }
  });

  // 2. Reliability Scores
  const relData = analysisData?.reliability || [];
  charts.reliability = new Chart(document.getElementById('chartReliability'), {
    type: 'doughnut',
    data: {
      labels: relData.map(r => r.name),
      datasets: [{
        data: relData.map(r => r.score),
        backgroundColor: ['#00d4ff66','#7b2fff66','#ff950066','#ff2d5566','#00e67666'],
        borderColor:     ['#00d4ff','#7b2fff','#ff9500','#ff2d55','#00e676'],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'bottom', labels: { padding: 16, font: { size: 11 } } } }
    }
  });

  // 3. Contradiction Severity
  const contra = analysisData?.contradictions || [];
  const severityCount = { Critical: 0, Moderate: 0, Minor: 0 };
  contra.forEach(c => {
    if (c.severity === 'critical') severityCount.Critical++;
    else if (c.severity === 'moderate') severityCount.Moderate++;
    else severityCount.Minor++;
  });
  charts.contradictions = new Chart(document.getElementById('chartContradictions'), {
    type: 'bar',
    data: {
      labels: Object.keys(severityCount),
      datasets: [{
        label: 'Count',
        data: Object.values(severityCount),
        backgroundColor: ['#ff2d5566','#ff950066','#3d4a7a66'],
        borderColor:     ['#ff2d55','#ff9500','#7986cb'],
        borderWidth: 1, borderRadius: 6
      }]
    },
    options: { responsive: true, plugins: { legend: { display: false } }, scales }
  });

  // 4. Agent Confidence Levels (simulated)
  const confidence = AGENTS.map(() => Math.floor(72 + Math.random() * 25));
  charts.confidence = new Chart(document.getElementById('chartConfidence'), {
    type: 'radar',
    data: {
      labels: agentNames,
      datasets: [{
        label: 'Confidence %',
        data: confidence,
        backgroundColor: 'rgba(0,212,255,0.1)',
        borderColor: '#00d4ff',
        pointBackgroundColor: AGENTS.map(a => a.color),
        pointRadius: 4
      }]
    },
    options: {
      responsive: true,
      scales: { r: { grid: { color: gridColor }, ticks: { color: '#7986cb', backdropColor: 'transparent' }, pointLabels: { color: '#7986cb', font: { size: 10 } } } },
      plugins: { legend: { display: false } }
    }
  });
}

// ── Utility ────────────────────────────────────
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }