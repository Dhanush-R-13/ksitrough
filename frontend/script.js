let witnessCount = 2;

const grid = document.getElementById("witnesses-grid");
const addBtn = document.getElementById("add-witness-btn");
const analyzeBtn = document.getElementById("analyze-btn");

addBtn.addEventListener("click", () => {
  if (witnessCount >= 5) return;

  witnessCount++;

  const div = document.createElement("div");
  div.className = "witness-card";

  div.innerHTML = `
    <textarea class="witness-textarea" placeholder="Enter testimony..."></textarea>
  `;

  grid.appendChild(div);
});

analyzeBtn.addEventListener("click", () => {
  const inputs = document.querySelectorAll(".witness-textarea");

  let data = [];

  inputs.forEach(input => {
    if (input.value.trim()) {
      data.push(input.value);
    }
  });

  if (data.length === 0) {
    alert("Enter at least one testimony");
    return;
  }

  // Call components
  generateSummary(data);
  findContradictions(data);
  generateTimeline(data);

  document.getElementById("results-section").style.display = "block";
});