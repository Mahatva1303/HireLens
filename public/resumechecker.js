document.addEventListener("DOMContentLoaded", () => {
  const uploadBtn = document.querySelector(".upload-btn");
  const fileInput = document.querySelector("#resumeUpload");
  const loader = document.querySelector("#loader");
  const resultContainer = document.querySelector("#result-container");

  loader.classList.add("hidden");

  uploadBtn.addEventListener("click", async () => {
    const file = fileInput.files[0];
    if (!file) return alert("Please upload your resume first!");

    const formData = new FormData();
    formData.append("resume", file);

    loader.classList.remove("hidden");
    resultContainer.classList.add("hidden");
    uploadBtn.disabled = true;

    try {
      const response = await fetch("http://localhost:3000/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Server Error");

      const data = await response.json();
      showResults(data);
    } catch (err) {
      console.error("❌ Error analyzing resume:", err);
      alert("Error analyzing resume. Make sure your Node.js server is running!");
    }

    loader.classList.add("hidden");
    uploadBtn.disabled = false;
  });

  function showResults(data) {
    resultContainer.classList.remove("hidden");
    resultContainer.innerHTML = `
      <div class="score-card">
        <h3>ATS Score</h3>
        <div class="score-circle" id="scoreCircle">
          <span>0%</span>
        </div>
      </div>
      <h4>AI Suggestions</h4>
      <ul>${data.suggestions.map(s => `<li>${s}</li>`).join("")}</ul>
    `;
    animateScore(data.score);
  }

  function animateScore(score) {
    const scoreCircle = document.querySelector("#scoreCircle span");
    const circleContainer = document.querySelector("#scoreCircle");

    let color = "#f44336";
    if (score >= 75) color = "#4caf50";
    else if (score >= 50) color = "#ff9800";
    circleContainer.style.borderColor = color;

    let counter = 0;
    const interval = setInterval(() => {
      if (counter >= score) clearInterval(interval);
      else {
        counter++;
        scoreCircle.textContent = counter + "%";
      }
    }, 20);
  }
});

