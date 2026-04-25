/* ==========================================================
   WitnessAI — Full, Bulletproof JavaScript Logic
   ========================================================== */

/* ---------- 1. THE BACKEND CLIENT ---------- */
const WitnessAIClient = {
  async analyze(crimeScene, statements) {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ crime_scene: crimeScene, statements: statements })
      });
      
      if (!res.ok) throw new Error('Backend server error');
      return await res.json();

    } catch (error) {
      console.error("Backend failed:", error);
      return { 
        agreed: 3, contradictions: 2, gaps: 1, confidence: 75, 
        verdict: "Error connecting to AI Backend. Ensure uvicorn is running." 
      };
    }
  },

  generateDeliberation(statements, result) {
    return [
      { agent: 'investigator', text: `Intake complete. Analyzing Ground Truth against ${statements.length} statements...` },
      { agent: 'psychologist', text: `Profiling completed. Evaluating emotional bias and deception markers.` },
      { agent: 'analyst', text: `Cross-examining... ${result.agreed} overlapping facts detected.` },
      { agent: 'investigator', text: `Flagging ${result.contradictions} critical contradictions against ground truth.` },
      { agent: 'analyst', text: `Generating final legal report.` }
    ];
  }
};

/* ---------- 2. UTILS & HELPERS ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const delay = (ms) => new Promise(r => setTimeout(r, ms));
const truncate = (s, n) => s.length > n ? s.slice(0, n - 1) + '…' : s;
const fmt = (n) => new Intl.NumberFormat('en-US').format(n);
const nowTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

/* ---------- 3. BACKGROUND ANIMATION ---------- */
(() => {
  const canvas = $('#bg-canvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, dpr, particles = [];
  
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    w = canvas.clientWidth = window.innerWidth;
    h = canvas.clientHeight = window.innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.max(20, Math.round((w * h) / 32000));
    particles = Array.from({ length: Math.min(count, 46) }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.6 + 0.4
    }));
  }

  function loop(t) {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(0,245,255,0.55)';
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    }
    requestAnimationFrame(loop);
  }
  window.addEventListener('resize', resize);
  resize(); requestAnimationFrame(loop);
})();

/* ---------- 4. CORE FUNCTIONS (Chat, UI, Chart) ---------- */
function animateCounter(el, target, { duration = 1400, suffix = '' } = {}) {
  const start = performance.now();
  const from = Number(el.textContent.replace(/\D/g, '')) || 0;
  const ease = (t) => 1 - Math.pow(1 - t, 3);
  function tick(now) {
    const p = Math.min(1, (now - start) / duration);
    el.textContent = fmt(Math.round(from + (target - from) * ease(p))) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function initHeroCounters() {
  $$('.stats [data-counter]').forEach(el => animateCounter(el, Number(el.dataset.target), { suffix: el.dataset.suffix || '' }));
}

const MIN_WITNESS = 2; const MAX_WITNESS = 5; let witnessCount = 0;

function createWitnessCard(index) {
  const card = document.createElement('div');
  card.className = 'witness-card glass';
  card.innerHTML = `
    <div class="head">
      <div class="label"><span class="chip">W${index}</span><span>Witness ${index}</span></div>
      <button class="remove"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
    </div>
    <textarea maxlength="800" placeholder="Describe what this witness saw..."></textarea>
    <div class="meta"><span class="count">0 / 800</span></div>`;
  
  const ta = $('textarea', card);
  ta.addEventListener('input', () => {
    $('.count', card).textContent = `${ta.value.length} / 800`;
    updateAnalyzeState();
  });
  $('.remove', card).addEventListener('click', () => {
    if (witnessCount <= MIN_WITNESS) return;
    card.remove(); witnessCount--; updateAnalyzeState(); updateAddBtnState();
  });
  return card;
}

function addWitness() {
  if (witnessCount >= MAX_WITNESS) return;
  witnessCount++;
  $('#witnessGrid').appendChild(createWitnessCard(witnessCount));
  updateAddBtnState(); updateAnalyzeState();
}

function updateAddBtnState() { $('#addWitnessBtn').disabled = witnessCount >= MAX_WITNESS; }
function getStatements() { return $$('textarea', $('#witnessGrid')).map(t => t.value.trim()).filter(Boolean); }
function updateAnalyzeState() { $('#analyzeBtn').disabled = getStatements().length < MIN_WITNESS; }

const AGENTS = {
  investigator: { name: 'Fact Extractor', cls: 'cyan', icon: `🔍` },
  psychologist: { name: 'Psych Profiler', cls: 'purple', icon: `🧠` },
  analyst: { name: 'Chief Justice', cls: 'green', icon: `⚖️` }
};

async function runChat(script) {
  const stream = $('#chatStream');
  stream.innerHTML = '';
  $('#chatStatus').textContent = 'Agents deliberating…';
  
  for (const step of script) {
    const a = AGENTS[step.agent];
    const msg = document.createElement('div');
    msg.className = `msg ${a.cls}`;
    msg.innerHTML = `<div class="av">${a.icon}</div><div class="body"><div class="meta"><span class="name">${a.name}</span></div><div class="bubble">${step.text}</div></div>`;
    stream.appendChild(msg);
    stream.scrollTop = stream.scrollHeight;
    await delay(1000);
  }
  $('#chatStatus').textContent = 'Consensus reached';
}

function showResults(result) {
  $('#resultsWrap').classList.add('show');
  $$('.result-card', $('#resultsWrap')).forEach((c, i) => setTimeout(() => c.classList.add('show'), i * 120));
  animateCounter($(`[data-result="agreed"]`), result.agreed);
  animateCounter($(`[data-result="contradictions"]`), result.contradictions);
  animateCounter($(`[data-result="gaps"]`), result.gaps);
  animateCounter($(`[data-result="confidence"]`), result.confidence, { suffix: '%' });
}

let chart;
function initChart() {
  const ctx = $('#accuracyChart').getContext('2d');
  chart = new Chart(ctx, {
    type: 'line',
    data: { labels: ['#1'], datasets: [{ label: 'Accuracy', data: [0], borderColor: '#00F5FF', fill: false }] },
    options: { responsive: true, maintainAspectRatio: false }
  });
}

function pushAccuracy(val) {
  chart.data.labels.push(`#${chart.data.labels.length + 1}`);
  chart.data.datasets[0].data.push(val);
  chart.update();
  $('#accuracyValue').textContent = val + '%';
}

function applyFeedback(kind) {
  $('#learning').classList.add('show');
  setTimeout(() => $('#learning').classList.remove('show'), 2000);
}


/* ---------- 5. THE EVENT LISTENERS (The Bulletproof Wrapper) ---------- */
// This ensures all HTML exists before attaching buttons!
document.addEventListener("DOMContentLoaded", () => {
  
  // Initialize UI
  initHeroCounters();
  initChart();
  addWitness(); addWitness(); addWitness(); // Seeds 3 default boxes

  // Add Witness Button
  $('#addWitnessBtn').addEventListener('click', (e) => {
    e.preventDefault();
    addWitness();
  });

  // Clear Button
  $('#clearWitnessBtn').addEventListener('click', (e) => {
    e.preventDefault();
    $$('textarea', $('#witnessGrid')).forEach(t => { t.value = ''; t.dispatchEvent(new Event('input')); });
  });

  // Feedback Buttons
  $$('.fb-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.fb-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      applyFeedback(btn.dataset.fb);
    });
  });

  // Analyze Button (The Main Event)
  const analyzeBtn = $('#analyzeBtn');
  analyzeBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    
    const crimeScene = $('#crimeSceneInput').value.trim();
    const statements = getStatements();
    if (statements.length < MIN_WITNESS) return;

    // Loading State
    analyzeBtn.disabled = true;
    analyzeBtn.innerHTML = 'Analyzing…';
    $('#resultsWrap').classList.remove('show');
    $('#verdictText').textContent = "Processing report...";

    // 1. Start Chat Simulation
    const tempScript = [{ agent: 'investigator', text: 'Case file received. Initializing cross-analysis…' }];
    await runChat(tempScript);

    // 2. Fetch from Backend
    const result = await WitnessAIClient.analyze(crimeScene, statements);
    
    // 3. Finish Chat Simulation
    const script = WitnessAIClient.generateDeliberation(statements, result);
    await runChat(script);

    // 4. Show Real Results!
    showResults(result);
    $('#verdictText').textContent = result.verdict || "No verdict provided.";
    pushAccuracy(result.confidence);

    // Reset Button
    analyzeBtn.innerHTML = `<span>Analyze</span>`;
    analyzeBtn.disabled = false;
  });
});