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
const teamsContainer = document.getElementById('teamsContainer');
const playerStatsContainer = document.getElementById('playerStats');
const ratingForm = document.getElementById('ratingForm');
const ratingTypeSelect = document.getElementById('ratingType');
const trainingRatingInput = document.getElementById('trainingRating');
const matchRatingInput = document.getElementById('matchRating');
const ratingsMessage = document.getElementById('ratingsMessage');

const matchForm = document.getElementById('matchForm');
const matchesTableBody = document.querySelector('#matchesTable tbody');
const matchesMessage = document.getElementById('matchesMessage');

let teams = [];
let selectedTeam = null;
let selectedPlayer = null;

// --- Ładowanie i wyświetlanie drużyn ---
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
    teamDiv.onclick = () => {
      selectedTeam = team;
      selectedPlayer = null;
      showPlayers(team);
      playerStatsContainer.innerHTML = 'Wybierz zawodnika, aby zobaczyć statystyki';
      clearRatingForm();
    };
    teamsContainer.appendChild(teamDiv);
  });
}

function showPlayers(team) {
  let playersList = document.getElementById('playersList');
  if(!playersList) {
    playersList = document.createElement('ul');
    playersList.id = 'playersList';
    teamsContainer.appendChild(playersList);
  }
  playersList.innerHTML = '';

  if(!team.players || team.players.length === 0) {
    playersList.innerHTML = '<li>Brak zawodników w drużynie</li>';
    return;
  }

  team.players.forEach(player => {
    const li = document.createElement('li');
    li.textContent = player.name;
    li.onclick = () => {
      selectedPlayer = player;
      showPlayerStats(player);
      prefillRatingForm(team.id, player.id);
    };
    playersList.appendChild(li);
  });
}

// --- Pokaż statystyki zawodnika ---
function showPlayerStats(player) {
  playerStatsContainer.innerHTML = `<h3>Ładowanie statystyk dla ${player.name}...</h3>`;
  db.ref('ratings').orderByChild('playerId').equalTo(player.id).once('value').then(snapshot => {
    const ratings = snapshot.val();
    if(!ratings) {
      playerStatsContainer.innerHTML = `<h3>${player.name}</h3><p>Brak ocen</p>`;
      return;
    }

    let trainingSum = 0, trainingCount = 0;
    let matchSum = 0, matchCount = 0;

    Object.values(ratings).forEach(r => {
      if(r.trainingRating !== null && r.trainingRating !== undefined) {
        trainingSum += r.trainingRating;
        trainingCount++;
      }
      if(r.matchRating !== null && r.matchRating !== undefined) {
        matchSum += r.matchRating;
        matchCount++;
      }
    });

    const avgTraining = trainingCount ? (trainingSum / trainingCount).toFixed(2) : 'Brak';
    const avgMatch = matchCount ? (matchSum / matchCount).toFixed(2) : 'Brak';

    playerStatsContainer.innerHTML = `
      <h3>${player.name}</h3>
      <p>Średnia ocena treningu: ${avgTraining}</p>
      <p>Średnia ocena meczu: ${avgMatch}</p>
    `;
  });
}

function prefillRatingForm(teamId, playerId) {
  ratingForm.elements['teamId'].value = teamId;
  ratingForm.elements['playerId'].value = playerId;
  clearRatingForm();
}

function clearRatingForm() {
  ratingTypeSelect.value = 'training';
  trainingRatingInput.disabled = false;
  matchRatingInput.disabled = true;
  trainingRatingInput.value = '';
  matchRatingInput.value = '';
  ratingForm.elements['date'].value = '';
  ratingForm.elements['playTime'].value = '';
  ratingsMessage.textContent = '';
}

// --- Przełączanie inputów ocen ---
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

// --- Dodawanie ocen ---
ratingForm.addEventListener('submit', e => {
  e.preventDefault();
  ratingsMessage.textContent = '';

  const teamId = ratingForm.elements['teamId'].value;
  const playerId = ratingForm.elements['playerId'].value;
  const date = ratingForm.elements['date'].value;
  const ratingType = ratingTypeSelect.value;
  const trainingRating = parseFloat(trainingRatingInput.value);
  const matchRating = parseFloat(matchRatingInput.value);
  const playTime = parseInt(ratingForm.elements['playTime'].value);

  if(!teamId || !playerId || !date || isNaN(playTime)) {
    ratingsMessage.textContent = 'Wypełnij wszystkie wymagane pola.';
    ratingsMessage.className = 'error';
    return;
  }

  if(ratingType === 'training' && (isNaN(trainingRating) || trainingRating < 0 || trainingRating > 10)) {
    ratingsMessage.textContent = 'Podaj ocenę treningu od 0 do 10.';
    ratingsMessage.className = 'error';
    return;
  }

  if(ratingType === 'match' && (isNaN(matchRating) || matchRating < 0 || matchRating > 10)) {
    ratingsMessage.textContent = 'Podaj ocenę meczu od 0 do 10.';
    ratingsMessage.className = 'error';
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
      ratingsMessage.textContent = 'Ocena dodana.';
      ratingsMessage.className = 'success';
      ratingForm.reset();
      clearRatingForm();
      if(selectedPlayer && selectedPlayer.id === playerId) {
        showPlayerStats(selectedPlayer);
      }
    })
    .catch(err => {
      ratingsMessage.textContent = 'Błąd: ' + err.message;
      ratingsMessage.className = 'error';
    });
});

// --- Zarządzanie meczami ---
function loadMatches() {
  db.ref('matches').on('value', snapshot => {
    const data = snapshot.val() || {};
    const matches = Object.entries(data).map(([id, m]) => ({ id, ...m }));
    renderMatches(matches);
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

  document.querySelectorAll('.editMatchBtn').forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      db.ref('matches/' + id).once('value').then(snap => {
        const match = snap.val();
        if(match) {
          matchForm.elements['date'].value = match.date;
          matchForm.elements['opponent'].value = match.opponent;
          matchForm.dataset.editId = id;
          matchesMessage.textContent = 'Edytujesz mecz';
          matchesMessage.className = '';
        }
      });
    };
  });

  document.querySelectorAll('.deleteMatchBtn').forEach(btn => {
    btn.onclick = () => {
      if(confirm('Na pewno usunąć ten mecz?')) {
        db.ref('matches/' + btn.dataset.id).remove();
      }
    };
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
      .catch(err => {
        matchesMessage.textContent = 'Błąd: ' + err.message;
        matchesMessage.className = 'error';
      });
  } else {
    const newRef = db.ref('matches').push();
    newRef.set({ date, opponent })
      .then(() => {
        matchesMessage.textContent = 'Mecz dodany.';
        matchesMessage.className = 'success';
        matchForm.reset();
      })
      .catch(err => {
        matchesMessage.textContent = 'Błąd: ' + err.message;
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

