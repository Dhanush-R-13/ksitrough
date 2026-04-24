function generateSummary(data) {
  const el = document.getElementById("summary");

  el.innerHTML = `
    <h3>Summary</h3>
    <p>Total witnesses: ${data.length}</p>
  `;
}