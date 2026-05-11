import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
// your firebase config
const firebaseConfig = {
  apiKey: "Your API KEY",
  authDomain: "YOUR AUTHENTICATION",
  projectId: "YOUR PROJECTID",
  appId: "YOUR APP ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

onAuthStateChanged(auth, (user) => {
  console.log("USER:", user); 

  if (user) {
    document.getElementById("displayName").innerText =
      user.displayName ? user.displayName : "User";

    document.getElementById("displayEmail").innerText = user.email;
  } else {
    window.location.href = "login.html";
  }
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  signOut(auth).then(() => {
    window.location.href = "login.html";
  });
});


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
