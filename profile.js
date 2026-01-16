// // Get stored info
// const username = localStorage.getItem("username");
// const email = localStorage.getItem("email");

// // Display user info
// document.getElementById("displayName").textContent = username ? username : "Guest User";
// document.getElementById("displayEmail").textContent = email ? email : "No email found";

// // Avatar video elements
// const profileVideo = document.getElementById("profileVideo");
// const boyAvatar = document.getElementById("boyAvatar");
// const girlAvatar = document.getElementById("girlAvatar");

// // Load saved avatar (if any)
// const savedAvatar = localStorage.getItem("profileVideo");
// if (savedAvatar) {
//   profileVideo.src = savedAvatar;

//   if (savedAvatar.includes("boy")) boyAvatar.classList.add("selected");
//   else if (savedAvatar.includes("girl")) girlAvatar.classList.add("selected");
// }

// // Handle avatar selection
// boyAvatar.addEventListener("click", () => {
//   profileVideo.src = "boy.mp4";
//   localStorage.setItem("profileVideo", "boy.mp4");
//   boyAvatar.classList.add("selected");
//   girlAvatar.classList.remove("selected");
// });

// girlAvatar.addEventListener("click", () => {
//   profileVideo.src = "girl.mp4";
//   localStorage.setItem("profileVideo", "girl.mp4");
//   girlAvatar.classList.add("selected");
//   boyAvatar.classList.remove("selected");
// });

// Get stored info
const username = localStorage.getItem("username");
const email = localStorage.getItem("email");

// Display user info
document.getElementById("displayName").textContent = username ? username : "Guest User";
document.getElementById("displayEmail").textContent = email ? email : "No email found";

// Avatar video elements
const profileVideo = document.getElementById("profileVideo");
const boyAvatar = document.getElementById("boyAvatar");
const girlAvatar = document.getElementById("girlAvatar");

// Load saved avatar (if any)
const savedAvatar = localStorage.getItem("profileVideo");
if (savedAvatar) {
  profileVideo.querySelector("source").src = savedAvatar;
  profileVideo.load(); // reload video source

  if (savedAvatar.includes("26LRRG8psAXG2zse13")) {
    boyAvatar.classList.add("selected");
  } else if (savedAvatar.includes("62G3VjIXEI0xS2EkE8")) {
    girlAvatar.classList.add("selected");
  }
}

// Handle avatar selection
boyAvatar.addEventListener("click", () => {
  const boyVideo = "images/26LRRG8psAXG2zse13.mp4"; // actual file
  profileVideo.querySelector("source").src = boyVideo;
  profileVideo.load(); // refresh video source
  localStorage.setItem("profileVideo", boyVideo);
  boyAvatar.classList.add("selected");
  girlAvatar.classList.remove("selected");
});

girlAvatar.addEventListener("click", () => {
  const girlVideo = "images/62G3VjIXEI0xS2EkE8.mp4"; // actual file
  profileVideo.querySelector("source").src = girlVideo;
  profileVideo.load(); // refresh video source
  localStorage.setItem("profileVideo", girlVideo);
  girlAvatar.classList.add("selected");
  boyAvatar.classList.remove("selected");
});


