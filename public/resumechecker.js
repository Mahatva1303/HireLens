let resumeText = "";

async function uploadResume() {
  const file = document.getElementById("resumeInput").files[0];

  if (!file) {
    alert("Please upload a resume first!");
    return;
  }

  const formData = new FormData();
  formData.append("resume", file);

  try {
    const res = await fetch("/analyze", {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    resumeText = data.text;
    console.log("Resume text:", resumeText);

    document.getElementById("score").innerText = data.score;
    document.getElementById("rating").innerText = "Rating: " + data.rating;

    const circle = document.querySelector(".circle");
    if (data.score > 80) circle.style.borderColor = "green";
    else if (data.score > 60) circle.style.borderColor = "orange";
    else circle.style.borderColor = "red";

    const strengths = document.getElementById("strengths");
    const improvements = document.getElementById("improvements");
    const keywords = document.getElementById("keywords");

    strengths.innerHTML = "";
    improvements.innerHTML = "";
    keywords.innerHTML = "";

    data.strengths.forEach(s => {
      strengths.innerHTML += `<li>${s}</li>`;
    });

    data.improvements.forEach(i => {
      improvements.innerHTML += `<li>${i}</li>`;
    });

    data.keywords.forEach(k => {
      keywords.innerHTML += `<span>${k}</span>`;
    });

  } catch (err) {
    console.error(err);
    alert("Error analyzing resume");
  }
}

function openPopup() {
  document.getElementById("popup").style.display = "block";
}

function closePopup() {
  document.getElementById("popup").style.display = "none";
}

// summary logic

async function generateSummary() {
  if (!resumeText) {
    alert("Please analyze resume first!");
    return;
  }

  try {
    const res = await fetch("/generate-summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: resumeText })
    });

    const data = await res.json();

    console.log("Summary:", data);

    // 🎨 Show summary in UI instead of alert
    let summaryBox = document.getElementById("summaryBox");

    if (!summaryBox) {
      const container = document.querySelector(".dashboard");

      const div = document.createElement("div");
      div.className = "card";
      div.id = "summaryBox";
      div.innerHTML = `<h3> AI Summary</h3><p>${data.summary}</p>`;

      container.appendChild(div);
    } else {
      summaryBox.innerHTML = `<h3> AI Summary</h3><p>${data.summary}</p>`;
    }

  } catch (err) {
    console.error(err);
    alert("Error generating summary");
  }
}
// match job
async function matchJob() {
  const role = document.getElementById("role").value;
  const company = document.getElementById("company").value;

  if (!resumeText) {
    alert("Upload resume first!");
    return;
  }

  if (!role || !company) {
    alert("Please fill role and company");
    return;
  }

  try {
    const res = await fetch("/match-job", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: resumeText,
        role,
        company
      })
    });

    const data = await res.json();

    console.log("Match result:", data);

    let matchBox = document.getElementById("matchBox");

    if (!matchBox) {
      const container = document.querySelector(".dashboard");

      const div = document.createElement("div");
      div.className = "card";
      div.id = "matchBox";
      div.innerHTML = `<h3> Job Match Result</h3><p>${data.result}</p>`;

      container.appendChild(div);
    } else {
      matchBox.innerHTML = `<h3> Job Match Result</h3><p>${data.result}</p>`;
    }

    closePopup();

  } catch (err) {
    console.error(err);
    alert("Error matching job");
  }
}


