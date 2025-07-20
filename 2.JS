import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, set, onValue } from "firebase/database";

// Konfiguracja Firebase
const firebaseConfig = {
  apiKey: "API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT.firebaseio.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// Elementy DOM
const loginForm = document.getElementById("loginForm");
const logoutBtn = document.getElementById("logoutBtn");
const userInfo = document.getElementById("userInfo");
const mainContent = document.getElementById("mainContent");

loginForm.addEventListener("submit", e => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, password)
    .then(userCredential => {
      userInfo.textContent = `Zalogowany jako: ${userCredential.user.email}`;
      loginForm.style.display = "none";
      logoutBtn.style.display = "block";
      mainContent.style.display = "block";
    })
    .catch(error => alert(error.message));
});

logoutBtn.addEventListener("click", () => {
  signOut(auth).then(() => {
    userInfo.textContent = "Nie zalogowany";
    loginForm.style.display = "block";
    logoutBtn.style.display = "none";
    mainContent.style.display = "none";
  });
});

// Sprawdzanie stanu zalogowania na starcie strony
onAuthStateChanged(auth, user => {
  if (user) {
    userInfo.textContent = `Zalogowany jako: ${user.email}`;
    loginForm.style.display = "none";
    logoutBtn.style.display = "block";
    mainContent.style.display = "block";
  } else {
    userInfo.textContent = "Nie zalogowany";
    loginForm.style.display = "block";
    logoutBtn.style.display = "none";
    mainContent.style.display = "none";
  }
});
