import { db, auth } from './firebase-config.js';
import { ref, push, get, child, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import Chart from 'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js';

