/* ==========================================================
   WitnessAI — FINAL MASTER FRONTEND (ALL-IN-ONE)
   ========================================================== */

/* ---------- 1. THE BACKEND CLIENT ---------- */
const WitnessAIClient = {
  async analyze(crimeScene, statements) {
    try {
      const res = await fetch('http://localhost:8000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ crime_scene: crimeScene, statements: statements })
      });
      if (!res.ok) throw new Error('Backend server error');
      return await res.json();
    } catch (e) {
      console.error("API Error:", e);
      return { 
        agreed: ["Offline"], 
        contradictions: ["Server unreachable"], 
        gaps: ["Check port 8000"], 
        confidence: 0, 
        verdict: "Backend is not running. Please start uvicorn." 
      };
    }
  },
  
  // Simulated chat messages
  getDeliberation(result) {
    const facts = Array.isArray(result.agreed) ? result.agreed.length : 1;
    return [
      { agent: 'investigator', text: `Analyzing ground truth against provided accounts...` },
      { agent: 'psychologist', text: `Cross-referencing narratives for behavioral inconsistencies.` },
      { agent: 'analyst', text: `Detected ${facts} key points of overlap. Drafting final synthesis.` }
    ];
  }
};

/* ---------- 2. UTILS ---------- */
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));
const delay = (ms) => new Promise(r => setTimeout(r, ms));

/* ---------- 3. BACKGROUND ANIMATION ---------- */
(() => {
  const canvas = $('#bg-canvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, particles = [];
  
  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.5
    }));
  }
  function loop() {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(0,245,255,0.4)';
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    });
    requestAnimationFrame(loop);
  }
  window.addEventListener('resize', resize);
  resize(); loop();
})();

/* ---------- 4. UI COMPONENTS ---------- */
let witnessCount = 0;

function createWitnessCard(index) {
  const card = document.createElement('div');
  card.className = 'witness-card glass';
  card.innerHTML = `
    <div class="head">
      <div class="label"><span class="chip">W${index}</span><span>Witness ${index}</span></div>
      <button class="remove">×</button>
    </div>
    <textarea placeholder="Describe the account..."></textarea>`;
  
  card.querySelector('.remove').onclick = () => {
    if (witnessCount > 2) { card.remove(); witnessCount--; }
  };
  return card;
}

function addWitness() {
  if (witnessCount >= 5) return;
  witnessCount++;
  $('#witnessGrid').appendChild(createWitnessCard(witnessCount));
}

/* ---------- 5. CORE LOGIC ---------- */
function animateCounter(el, target, suffix = '') {
  if (!el) return;
  let count = 0;
  const step = target / 30;
  const timer = setInterval(() => {
    count += step;
    if (count >= target) {
      el.textContent = Math.round(target) + suffix;
      clearInterval(timer);
    } else {
      el.textContent = Math.round(count) + suffix;
    }
  }, 20);
}

async function runChat(script) {
  const stream = $('#chatStream');
  stream.innerHTML = '';
  const icons = { investigator: '🔍', psychologist: '🧠', analyst: '⚖️' };
  const names = { investigator: 'Fact Extractor', psychologist: 'Psych Profiler', analyst: 'Chief Justice' };

  for (const step of script) {
    const msg = document.createElement('div');
    msg.className = `msg ${step.agent === 'investigator' ? 'cyan' : step.agent === 'psychologist' ? 'purple' : 'green'}`;
    msg.innerHTML = `<div class="av">${icons[step.agent]}</div><div class="body"><div class="meta"><b>${names[step.agent]}</b></div><div class="bubble">${step.text}</div></div>`;
    stream.appendChild(msg);
    stream.scrollTop = stream.scrollHeight;
    await delay(800);
  }
}

function showResults(result) {
  $('#resultsWrap').classList.add('show');
  
  // Safe lengths to prevent NaN
  const getL = (v) => Array.isArray(v) ? v.length : 1;
  
  animateCounter($(`[data-result="agreed"]`), getL(result.agreed));
  animateCounter($(`[data-result="contradictions"]`), getL(result.contradictions));
  animateCounter($(`[data-result="gaps"]`), getL(result.gaps));
  animateCounter($(`[data-result="confidence"]`), result.confidence || 0, '%');

  const populate = (id, data) => {
    const list = $(`#list-${id}`);
    if (!list) return;
    list.innerHTML = Array.isArray(data) 
      ? data.map(i => `<li>${i}</li>`).join('') 
      : `<li>${data}</li>`;
  };

  populate('agreed', result.agreed);
  populate('contradictions', result.contradictions);
  populate('gaps', result.gaps);
  $('#verdictText').textContent = result.verdict;
}

/* ---------- 6. EVENT LISTENERS ---------- */
document.addEventListener("DOMContentLoaded", () => {
  // Setup Witnesses
  addWitness(); addWitness(); addWitness();

  $('#addWitnessBtn').onclick = (e) => { e.preventDefault(); addWitness(); };

  $('#analyzeBtn').onclick = async (e) => {
    e.preventDefault();
    const btn = $('#analyzeBtn');
    btn.disabled = true;
    btn.textContent = 'Processing...';

    const crimeScene = $('#crimeSceneInput').value;
    const statements = $$('.witness-card textarea').map(t => t.value).filter(v => v.trim());

    if (statements.length < 2) {
      alert("Please enter at least 2 witness statements.");
      btn.disabled = false;
      btn.textContent = 'Analyze';
      return;
    }

    // Call API
    const result = await WitnessAIClient.analyze(crimeScene, statements);
    
    // Run Chat
    await runChat(WitnessAIClient.getDeliberation(result));
    
    // Show UI
    showResults(result);
    
    btn.disabled = false;
    btn.textContent = 'Analyze';
  };

  // Dropdown toggles
  $$('.result-card.expandable').forEach(card => {
    card.onclick = () => card.classList.toggle('expanded');
  });
});