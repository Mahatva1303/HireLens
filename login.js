document.getElementById("loginForm").addEventListener("submit", function(e) {
  e.preventDefault();

  // Get values
  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;

  // Store in localStorage
  localStorage.setItem("username", username);
  localStorage.setItem("email", email);

  // Redirect to profile page
  window.location.href = "profile.html";
});
