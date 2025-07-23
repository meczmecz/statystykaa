import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
// Konfiguracja aplikacji
const firebaseConfig = {
  apiKey: "AIzaSyAWXiBO5-woCCEqCBc2rfOIo1RhUUtevzU",
  authDomain: "jaguar-analityka.firebaseapp.com",
  projectId: "jaguar-analityka",
  storageBucket: "jaguar-analityka.appspot.com",
  messagingSenderId: "163915747034",
  appId: "1:163915747034:web:8c0311eaaa4ed792b25fe3",
  measurementId: "G-T3C1M10SM6",
  databaseURL: "https://jaguar-analityka-default-rtdb.europe-west1.firebasedatabase.app" // ← dodaj to ręcznie!
};
// Inicjalizacja Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
// Eksportuj, aby app.js mógł korzystać
export { db, auth };
