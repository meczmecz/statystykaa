  const firebaseConfig = {
    apiKey: "AIzaSyAWXiBO5-woCCEqCBc2rfOIo1RhUUtevzU",
    authDomain: "jaguar-analityka.firebaseapp.com",
    databaseURL: "https://jaguar-analityka-default-rtdb.firebaseio.com",
    projectId: "jaguar-analityka",
    storageBucket: "jaguar-analityka.firebasestorage.app",
    messagingSenderId: "163915747034",
    appId: "1:163915747034:web:8c0311eaaa4ed792b25fe3",
    measurementId: "G-T3C1M10SM6"
  };
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// DOM
const teamsContainer = document.getElementById('teamsContainer'); // Sekcja do wyświetlania drużyn i zawodników
const playerStatsContainer = document.getElementById('playerStats'); // Sekcja do wyświetlania średnich ocen zawodnika
const ratingForm = document.getElementById('ratingForm');
const ratingTypeSelect = document.getElementById('ratingType'); // select trening/mecz
const trainingRatingInput = document.getElementById('trainingRating');
const matchRatingInput = document.getElementById('matchRating');
const playTimeInput = document.getElementById('playTime');
const ratingMessage = document.getElementById('ratingsMessage');

const matchForm = document.getElementById('matchForm');
const matchesTableBody = document.querySelector('#matchesTable tbody');
const matchesMessage = document.getElementById('matchesMessage');

let teams = [];
let selectedTeamId = null;
let selectedPlayerId = null;

// Wczytaj drużyny z bazy i wyświetl
function loadTeams() {
  db.ref('teams').on('value', snapshot => {
    const data = snapshot.val() || {};
    teams = Object.entries(data).map(([id, team]) => ({ id, ...team }));
    renderTeams();
  });
}

function renderTeams() {
  teamsContainer.innerHTML = '';
  teams.forEach(team => {
    const teamDiv = document.createElement('div');
    teamDiv.classList.add('team');
    teamDiv.textContent = team.name;
    teamDiv.style.cursor = 'pointer';
    teamDiv.addEventListener('click', () => {
      selectedTeamId = team.id;
      selectedPlayerId = null;
      showPlayersForTeam(team);
      playerStatsContainer.innerHTML = '';
      clearRatingForm();
    });
    teamsContainer.appendChild(teamDiv);
  });
}

function showPlayersForTeam(team) {
  // Wyświetl listę zawodników pod nazwą drużyny
  let playersList = document.getElementById('playersList');
  if(!playersList) {
    playersList = document.createElement('ul');
    playersList.id = 'playersList';
    teamsContainer.appendChild(playersList);
  }
  playersList.innerHTML = '';

  if(!team.players || team.players.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'Brak zawodników w drużynie';
    playersList.appendChild(li);
    return;
  }

  team.players.forEach(player => {
    const li = document.createElement('li');
    li.textContent = player.name;
    li.style.cursor = 'pointer';
    li.addEventListener('click', () => {
      selectedPlayerId = player.id;
      showPlayerStats(player);
      prefillRatingForm(player);
    });
    playersList.appendChild(li);
  });
}

function showPlayerStats(player) {
  playerStatsContainer.innerHTML = '<h3>Średnie oceny dla: ' + player.name + '</h3><p>Ładuję dane...</p>';

  // Pobierz oceny z bazy dla tego zawodnika
  db.ref('ratings').orderByChild('playerId').equalTo(player.id).once('value').then(snapshot => {
    const ratings = snapshot.val();
    if(!ratings) {
      playerStatsContainer.innerHTML = '<h3>Średnie oceny dla: ' + player.name + '</h3><p>Brak ocen dla tego zawodnika.</p>';
      return;
    }

    let trainingSum = 0, trainingCount = 0;
    let matchSum = 0, matchCount = 0;

    Object.values(ratings).forEach(r => {
      if(r.trainingRating !== undefined && r.trainingRating !== null) {
        trainingSum += r.trainingRating;
        trainingCount++;
      }
      if(r.matchRating !== undefined && r.matchRating !== null) {
        matchSum += r.matchRating;
        matchCount++;
      }
    });

    const avgTraining = trainingCount > 0 ? (trainingSum / trainingCount).toFixed(2) : 'Brak';
    const avgMatch = matchCount > 0 ? (matchSum / matchCount).toFixed(2) : 'Brak';

    playerStatsContainer.innerHTML = `
      <h3>Średnie oceny dla: ${player.name}</h3>
      <p>Trening: ${avgTraining}</p>
      <p>Mecz: ${avgMatch}</p>
    `;
  });
}

function prefillRatingForm(player) {
  // Ustaw w formularzu hidden teamId i playerId jeśli masz
  ratingForm.elements['teamId'].value = selectedTeamId;
  ratingForm.elements['playerId'].value = player.id;

  clearRatingForm();
}

function clearRatingForm() {
  ratingTypeSelect.value = 'training';
  trainingRatingInput.value = '';
  matchRatingInput.value = '';
  matchRatingInput.disabled = true;
  trainingRatingInput.disabled = false;
  playTimeInput.value = '';
  ratingMessage.textContent = '';
}

// Zmiana typu oceny - trening czy mecz
ratingTypeSelect.addEventListener('change', () => {
  if(ratingTypeSelect.value === 'training') {
    trainingRatingInput.disabled = false;
    matchRatingInput.disabled = true;
    matchRatingInput.value = '';
  } else {
    trainingRatingInput.disabled = true;
    trainingRatingInput.value = '';
    matchRatingInput.disabled = false;
  }
});

// Dodawanie oceny
ratingForm.addEventListener('submit', e => {
  e.preventDefault();
  ratingMessage.textContent = '';

  const teamId = ratingForm.elements['teamId'].value;
  const playerId = ratingForm.elements['playerId'].value;
  const date = ratingForm.elements['date'].value;
  const ratingType = ratingTypeSelect.value;
  const trainingRating = parseInt(trainingRatingInput.value);
  const matchRating = parseInt(matchRatingInput.value);
  const playTime = parseInt(playTimeInput.value);

  if(!teamId || !playerId || !date || !playTime) {
    ratingMessage.textContent = 'Wypełnij wszystkie wymagane pola.';
    ratingMessage.className = 'error';
    return;
  }

  if(ratingType === 'training' && (isNaN(trainingRating) || trainingRating < 0 || trainingRating > 10)) {
    ratingMessage.textContent = 'Podaj ocenę treningu od 0 do 10.';
    ratingMessage.className = 'error';
    return;
  }

  if(ratingType === 'match' && (isNaN(matchRating) || matchRating < 0 || matchRating > 10)) {
    ratingMessage.textContent = 'Podaj ocenę meczu od 0 do 10.';
    ratingMessage.className = 'error';
    return;
  }

  const newRating = {
    teamId,
    playerId,
    date,
    playTime,
    trainingRating: ratingType === 'training' ? trainingRating : null,
    matchRating: ratingType === 'match' ? matchRating : null,
  };

  const newKey = db.ref().child('ratings').push().key;
  db.ref('ratings/' + newKey).set(newRating)
    .then(() => {
      ratingMessage.textContent = 'Ocena została dodana!';
      ratingMessage.className = 'success';
      ratingForm.reset();
      clearRatingForm();
      if(selectedPlayerId === playerId) {
        // Odśwież statystyki jeśli dodaliśmy ocenę dla wybranego zawodnika
        showPlayerStats({id: playerId, name: ratingForm.elements['playerName'] ? ratingForm.elements['playerName'].value : ''});
      }
    })
    .catch(err => {
      ratingMessage.textContent = 'Błąd podczas dodawania oceny: ' + err.message;
      ratingMessage.className = 'error';
    });
});

// --- Zarządzanie meczami ---
// Wczytaj mecze
function loadMatches() {
  db.ref('matches').on('value', snapshot => {
    const data = snapshot.val() || {};
    renderMatches(Object.entries(data).map(([id, match]) => ({ id, ...match })));
  });
}

function renderMatches(matches) {
  matchesTableBody.innerHTML = '';
  matches.forEach(match => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${match.date}</td>
      <td>${match.opponent}</td>
      <td>
        <button class="editMatchBtn" data-id="${match.id}">Edytuj</button>
        <button class="deleteMatchBtn" data-id="${match.id}">Usuń</button>
      </td>
    `;
    matchesTableBody.appendChild(tr);
  });

  // Edycja
  document.querySelectorAll('.editMatchBtn').forEach(btn => {
    btn.addEventListener('click', () => {
      const matchId = btn.dataset.id;
      db.ref('matches/' + matchId).once('value').then(snapshot => {
        const match = snapshot.val();
        if(match) {
          matchForm.elements['date'].value = match.date;
          matchForm.elements['opponent'].value = match.opponent;
          matchForm.dataset.editId = matchId;
          matchesMessage.textContent = 'Edytujesz mecz';
        }
      });
    });
  });

  // Usuwanie
  document.querySelectorAll('.deleteMatchBtn').forEach(btn => {
    btn.addEventListener('click', () => {
      if(confirm('Na pewno chcesz usunąć ten mecz?')) {
        const matchId = btn.dataset.id;
        db.ref('matches/' + matchId).remove();
      }
    });
  });
}

matchForm.addEventListener('submit', e => {
  e.preventDefault();
  matchesMessage.textContent = '';

  const date = matchForm.elements['date'].value;
  const opponent = matchForm.elements['opponent'].value;
  const editId = matchForm.dataset.editId;

  if(!date || !opponent) {
    matchesMessage.textContent = 'Wypełnij wszystkie pola.';
    matchesMessage.className = 'error';
    return;
  }

  if(editId) {
    db.ref('matches/' + editId).update({ date, opponent })
      .then(() => {
        matchesMessage.textContent = 'Mecz zaktualizowany.';
        matchesMessage.className = 'success';
        matchForm.reset();
        delete matchForm.dataset.editId;
      })
      .catch(e => {
        matchesMessage.textContent = 'Błąd: ' + e.message;
        matchesMessage.className = 'error';
      });
  } else {
    const newMatchRef = db.ref('matches').push();
    newMatchRef.set({ date, opponent })
      .then(() => {
        matchesMessage.textContent = 'Mecz dodany.';
        matchesMessage.className = 'success';
        matchForm.reset();
      })
      .catch(e => {
        matchesMessage.textContent = 'Błąd: ' + e.message;
        matchesMessage.className = 'error';
      });
  }
});

// --- Inicjalizacja ---
window.onload = () => {
  loadTeams();
  loadMatches();
  clearRatingForm();
};

