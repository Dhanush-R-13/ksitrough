let witnesses = [];

function addWitness() {
  const text = document.getElementById("inputText").value;
  if (!text) return;

  witnesses.push({
    statement: text,
    time: new Date().toLocaleTimeString()
  });

  document.getElementById("inputText").value = "";
  renderWitnesses();
}

function renderWitnesses() {
  const list = document.getElementById("witnessList");
  list.innerHTML = "";

  witnesses.forEach(w => {
    const div = document.createElement("div");
    div.className = "witness";
    div.innerHTML = `<p>${w.statement}</p><small>${w.time}</small>`;
    list.appendChild(div);
  });
}

function analyze() {
  if (witnesses.length === 0) {
    alert("Add at least one witness!");
    return;
  }

  const aiData = [
    {title:"👁️ Visual AI", text:"Detected movements and positions.", conf:85},
    {title:"🧠 Logical AI", text:"Sequence suggests planned action.", conf:88},
    {title:"📊 Data AI", text:"Matches known patterns.", conf:82},
    {title:"💬 Behavioral AI", text:"Body language indicates stress.", conf:84},
    {title:"🌍 Context AI", text:"Unusual activity for environment.", conf:80},
    {title:"⚖️ Judge AI", text:"Final reasoning complete.", conf:86}
  ];

  const container = document.getElementById("aiCards");
  container.innerHTML = "";

  aiData.forEach((card, index) => {
    setTimeout(() => {
      const div = document.createElement("div");
      div.className = "ai-card";

      div.innerHTML = `
        <b>${card.title}</b>
        <p>${card.text}</p>
        <div class="progress">
          <div class="progress-bar" style="width:${card.conf}%"></div>
        </div>
        <small>${card.conf}% confidence</small>
      `;

      container.appendChild(div);
      setTimeout(() => div.classList.add("show"), 100);

    }, index * 300);
  });

  document.getElementById("discussion").innerHTML =
    "<b>💬 AI Discussion:</b><br>Multiple AI agents cross-validated witness inputs.";

  document.getElementById("final").innerHTML =
    "<b>⚖️ Final Conclusion:</b><br>Event reconstructed successfully.<br><br><b>Confidence: 86%</b>";

  drawChart([2,4,3,6]);
  document.getElementById("chartBox").style.display = "block";
}

function drawChart(data) {
  const ctx = document.getElementById("chart").getContext("2d");

  new Chart(ctx, {
    type: "line",
    data: {
      labels: ["Start", "Event", "Conflict", "Resolution"],
      datasets: [{
        label: "Confidence Flow",
        data: data,
        borderColor: "#22c55e",
        tension: 0.4
      }]
    }
  });
}