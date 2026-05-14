import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";


const firebaseConfig = {
  apiKey: "AIzaSyBnCO-p3ulx6mM0GSlxTJ3fqDXKoxZ2Se8",
  authDomain: "hirelens-ec8b2.firebaseapp.com",
  projectId: "hirelens-ec8b2",
  appId: "1:64689401973:web:644a287658271daa58083c"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

let isLogin = true;

// Toggle form
window.toggleForm = function() {
    isLogin = !isLogin;

    const title = document.getElementById("form-title");
    const button = document.querySelector("button");
    const text = document.getElementById("toggle-text");

    const firstName = document.getElementById("firstName");
    const lastName = document.getElementById("lastName");

    if (isLogin) {
        title.innerText = "Sign in to your account";
        button.innerText = "Login";
        firstName.style.display = "none";
        lastName.style.display = "none";
        text.innerHTML = `Don't have an account? <span onclick="toggleForm()">Create Account</span>`;
    } else {
        title.innerText = "Create Account";
        button.innerText = "Sign Up";
        firstName.style.display = "block";
        lastName.style.display = "block";
        text.innerHTML = `Already have an account? <span onclick="toggleForm()">Login</span>`;
    }
};

// Email/Password Auth
window.handleAuth = function() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (isLogin) {
        // LOGIN
        signInWithEmailAndPassword(auth, email, password)
            .then(() => {
                alert("Login Successful ✅");
                window.location.href = "index.html";
            })
            .catch(err => alert(err.message));

    } else {
        // SIGNUP
        const firstName = document.getElementById("firstName").value;
        const lastName = document.getElementById("lastName").value;

        if (!firstName || !lastName) {
            alert("Please enter full name");
            return;
        }

        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Save name in Firebase profile
                return updateProfile(userCredential.user, {
                    displayName: `${firstName} ${lastName}`
                });
            })
            .then(() => {
                alert("Account Created ✅");
                window.location.href = "index.html";
            })
            .catch(err => alert(err.message));
    }
};

// Google Login
window.googleLogin = function() {
    signInWithPopup(auth, provider)
        .then((result) => {
            alert("Google Login Successful ✅");
            window.location.href = "index.html";
            console.log(result.user);
        })
        .catch((error) => {
            alert(error.message);
        });
};



