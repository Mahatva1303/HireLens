let rating = 0;

function setRating(r) {
  rating = r;
  const stars = document.querySelectorAll(".stars span");

  stars.forEach((star, index) => {
    star.style.color = index < r ? "gold" : "gray";
  });
}

// SUBMIT
async function submitReview() {
  const data = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    rating,
    comment: document.getElementById("comment").value
  };

  await fetch("/api/reviews", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(data)
  });

  alert("Review Submitted!");
}

// LOAD
async function loadReviews() {
  const res = await fetch("/api/reviews");
  const reviews = await res.json();

  const container = document.getElementById("reviewsContainer");
  container.innerHTML = "";

  reviews.forEach(r => {
    container.innerHTML += `
      <div class="review-card">
        <b>${r.name}</b> (${r.rating}★)
        <p>${r.comment}</p>
      </div>
    `;
  });
}