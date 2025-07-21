import { db, auth } from './firebase-config.js';
import { ref, push, get, child, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import Chart from 'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js';


function showPlayerDetails(playerId) {
  currentPlayerId = playerId;
  const player = playersData[playerId];
  if (!player) return alert('Nie znaleziono zawodnika');

  playerDetailName.textContent = player.name;
  playerDetails.classList.remove('hidden');

  trainingScoreInput.value = '';
  matchScoreInputPlayer.value = '';

  // POBIERZ i WYŚWIETL liczbę MVP
  const mvpRef = db.ref(`players/${currentTeamId}/${playerId}/mvpCount`);
  mvpRef.once('value').then(snapshot => {
    const count = snapshot.val() || 0;

    let existing = document.getElementById('mvpDisplay');
    if (!existing) {
      existing = document.createElement('p');
      existing.id = 'mvpDisplay';
      existing.style.marginTop = '10px';
      playerDetails.appendChild(existing);
    }
    existing.textContent = `Liczba MVP: ${count}`;
  });
}
