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

// Przechwytywanie elementów DOM
const loginForm = document.getElementById('loginForm');
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const loginMessage = document.getElementById('loginMessage');

const sections = document.querySelectorAll('section');

// Funkcja do przełączania sekcji
function showSection(id) {
  sections.forEach(sec => {
    if (sec.id === id) sec.classList.add('active');
    else sec.classList.remove('active');
  });
  clearForms();
  clearMessages();
}

// Czyszczenie formularzy i komunikatów
function clearMessages() {
  document.getElementById('teamsMessage').textContent = '';
  document.getElementById('addPlayerMessage').textContent = '';
  document.getElementById('ratingsMessage').textContent = '';
  document.getElementById('matchesMessage').textContent = '';
  loginMessage.textContent = '';
}
function clearForms() {
  document.getElementById('teamForm').reset();
  document.getElementById('addPlayerForm').reset();
  document.getElementById('ratingForm').reset();
  document.getElementById('matchForm').reset();
}

// Logowanie (proste) — zastąp własnym systemem auth
loginForm.addEventListener('submit', e => {
  e.preventDefault();
  const email = loginEmail.value.trim();
  const password = loginPassword.value.trim();

  if (!email || !password) {
    loginMessage.textContent = 'Wprowadź email i hasło.';
    loginMessage.className = 'error';
    return;
  }

  // Tu możesz dodać Firebase Authentication, teraz tylko symulacja:
  if(email === "treucepacrouwe-1015@yopmail.com" && password === "123456") {
    loginMessage.textContent = '';
    showSection('teams');
  } else {
    loginMessage.textContent = 'Nieprawidłowy login lub hasło.';
    loginMessage.className = 'error';
  }
});

// --- Zarządzanie drużynami ---
const teamsTableBody = document.querySelector('#teamsTable tbody');
const teamForm = document.getElementById('teamForm');
const teamIdInput = document.getElementById('teamId');
const teamNameInput = document.getElementById('teamName');
const teamsMessage = document.getElementById('teamsMessage');
const teamFormClearBtn = document.getElementById('teamFormClearBtn');

let teams = [];

function loadTeams() {
  db.ref('teams').off();
  db.ref('teams').on('value', snapshot => {
    const data = snapshot.val() || {};
    teams = Object.entries(data).map(([id, team]) => ({ id, ...team }));
    renderTeams();
    populateTeamsSelects();
  });
}

function renderTeams() {
  teamsTableBody.innerHTML = '';
  teams.forEach(team => {
    const tr = document.createElement('tr');

    const playersCount = team.players ? team.players.length : 0;

    tr.innerHTML = `
      <td>${team.name}</td>
      <td>${playersCount}</td>
      <td>
        <button class="btn-edit" data-id="${team.id}">Edytuj</button>
        <button class="btn-delete" data-id="${team.id}">Usuń</button>
      </td>
    `;
    teamsTableBody.appendChild(tr);
  });

  // Obsługa kliknięć na edycję i usuwanie
  teamsTableBody.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', () => {
      const team = teams.find(t => t.id === btn.dataset.id);
      if(team) {
        teamIdInput.value = team.id;
        teamNameInput.value = team.name;
        teamsMessage.textContent = '';
      }
    });
  });

  teamsTableBody.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', () => {
      if(confirm('Na pewno chcesz usunąć tę drużynę?')) {
        db.ref('teams/' + btn.dataset.id).remove();
      }
    });
  });
}

teamForm.addEventListener('submit', e => {
  e.preventDefault();
  teamsMessage.textContent = '';
  const id = teamIdInput.value.trim();
  const name = teamNameInput.value.trim();

  if(!name) {
    teamsMessage.textContent = 'Nazwa drużyny jest wymagana';
    teamsMessage.className = 'error';
    return;
  }

  if(id) {
    // Aktualizuj drużynę
    db.ref('teams/' + id).update({ name })
      .then(() => {
        teamsMessage.textContent = 'Drużyna zaktualizowana';
        teamsMessage.className = 'success';
        teamForm.reset();
        teamIdInput.value = '';
      })
      .catch(e => {
        teamsMessage.textContent = 'Błąd: ' + e.message;
        teamsMessage.className = 'error';
      });
  } else {
    // Dodaj nową drużynę
    const newTeamRef = db.ref('teams').push();
    newTeamRef.set({ name, players: [] })
      .then(() => {
        teamsMessage.textContent = 'Drużyna dodana';
        teamsMessage.className = 'success';
        teamForm.reset();
      })
      .catch(e => {
        teamsMessage.textContent = 'Błąd: ' + e.message;
        teamsMessage.className = 'error';
      });
  }
});

teamFormClearBtn.addEventListener('click', () => {
  teamForm.reset();
  teamIdInput.value = '';
  teamsMessage.textContent = '';
});

// --- Zawodnicy i oceny ---
const selectTeamForPlayer = document.getElementById('selectTeamForPlayer');
const addPlayerForm = document.getElementById('addPlayerForm');
const playerNameInput = document.getElementById('playerName');
const addPlayerMessage = document.getElementById('addPlayerMessage');

const ratingTeamSelect = document.getElementById('ratingTeam');
const ratingPlayerSelect = document.getElementById('ratingPlayer');
const ratingForm = document.getElementById('ratingForm');
const ratingsMessage = document.getElementById('ratingsMessage');

let selectedRatingTeamId = null;

// Wypełnij selecty drużyn do zawodników i ocen
function populateTeamsSelects() {
  selectTeamForPlayer.innerHTML = '<option value="">-- wybierz --</option>';
  ratingTeamSelect.innerHTML = '<option value="">-- wybierz --</option>';
  teams.forEach(team => {
    const opt1 = document.createElement('option');
    opt1.value = team.id;
    opt1.textContent = team.name;
    selectTeamForPlayer.appendChild(opt1);

    const opt2 = document.createElement('option');
    opt2.value = team.id;
    opt2.textContent = team.name;
    ratingTeamSelect.appendChild(opt2);
  });
}

// Dodawanie zawodnika do drużyny
addPlayerForm.addEventListener('submit', e => {
  e.preventDefault();
  addPlayerMessage.textContent = '';
  const teamId = selectTeamForPlayer.value;
  const playerName = playerNameInput.value.trim();

  if(!teamId || !playerName) {
    addPlayerMessage.textContent = 'Wybierz drużynę i wpisz nazwisko zawodnika.';
    addPlayerMessage.className = 'error';
    return;
  }

  const teamRef = db.ref('teams/' + teamId);
  teamRef.once('value').then(snapshot => {
    const teamData = snapshot.val();
    if(!teamData) throw new Error('Drużyna nie istnieje.');

    let players = teamData.players || [];

    if(players.some(p => p.name.toLowerCase() === playerName.toLowerCase())) {
      throw new Error('Taki zawodnik już jest w drużynie.');
    }

    players.push({ name: playerName, id: Date.now().toString() });

    return teamRef.update({ players });
  }).then(() => {
    addPlayerMessage.textContent = 'Zawodnik został dodany do drużyny.';
    addPlayerMessage.className = 'success';
    addPlayerForm.reset();
  }).catch(err => {
    addPlayerMessage.textContent = 'Błąd: ' + err.message;
    addPlayerMessage.className = 'error';
  });
});

// Ładowanie zawodników dla wybranej drużyny (w formularzu ocen)
ratingTeamSelect.addEventListener('change', () => {
  const teamId = ratingTeamSelect.value;
  ratingPlayerSelect.innerHTML = '<option value="">-- wybierz --</option>';
  ratingsMessage.textContent = '';
  if(!teamId) return;
  selectedRatingTeamId = teamId;
  const team = teams.find(t => t.id === teamId);
  if(!team || !team.players) return;
  team.players.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = p.name;
    ratingPlayerSelect.appendChild(opt);
  });
});

// Dodawanie oceny zawodnikowi
ratingForm.addEventListener('submit', e => {
  e.preventDefault();
  ratingsMessage.textContent = '';

  const teamId = ratingTeamSelect.value;
  const playerId = ratingPlayerSelect.value;
  const date = document.getElementById('ratingDate').value;
  const trainingRating = parseInt(document.getElementById('trainingRating').value);
  const matchRating = parseInt(document.getElementById('matchRating').value);
  const playTime = parseInt(document.getElementById('playTime').value);

  if(!teamId || !playerId || !date || isNaN(trainingRating) || isNaN(matchRating) || isNaN(playTime)) {
    ratingsMessage.textContent = 'Wypełnij wszystkie pola prawidłowo.';
    ratingsMessage.className = 'error';
    return;
  }

  // Klucz oceny - unikalny
  const ratingId = Date.now().toString();

  // Struktura oceny
  const ratingData = {
    teamId,
    playerId,
    date,
    trainingRating,
    matchRating,
    playTime
  };

  db.ref('ratings/' + ratingId).set(ratingData)
    .then(() => {
      ratingsMessage.textContent = 'Ocena została dodana.';
      ratingsMessage.className = 'success';
      ratingForm.reset();
      ratingPlayerSelect.innerHTML = '<option value="">-- wybierz --</option>';
    })
    .catch(e => {
      ratingsMessage.textContent = 'Błąd: ' + e.message;
      ratingsMessage.className = 'error';
    });
});

// --- Wczytywanie ocen do wykresów ---
const showChartsBtn = document.getElementById('showChartsBtn');
const chartTrainingCtx = document.getElementById('chartTraining').getContext('2d');
const chartMatchCtx = document.getElementById('chartMatch').getContext('2d');
let chartTraining = null;
let chartMatch = null;

showChartsBtn.addEventListener('click', () => {
  if(!selectedRatingTeamId) {
    ratingsMessage.textContent = 'Wybierz drużynę w sekcji ocen.';
    ratingsMessage.className = 'error';
    return;
  }
  drawChartsForTeam(selectedRatingTeamId);
});

function drawChartsForTeam(teamId) {
  db.ref('ratings').orderByChild('teamId').equalTo(teamId).once('value').then(snapshot => {
    const ratingsData = snapshot.val() || {};
    if(Object.keys(ratingsData).length === 0) {
      ratingsMessage.textContent = 'Brak ocen dla wybranej drużyny.';
      ratingsMessage.className = 'error';
      if(chartTraining) chartTraining.destroy();
      if(chartMatch) chartMatch.destroy();
      return;
    }
    ratingsMessage.textContent = '';
    // Grupowanie po dacie
    const dates = {};
    Object.values(ratingsData).forEach(r => {
      if(!dates[r.date]) dates[r.date] = { trainingSum:0, matchSum:0, count:0 };
      dates[r.date].trainingSum += r.trainingRating;
      dates[r.date].matchSum += r.matchRating;
      dates[r.date].count++;
    });

    const labels = Object.keys(dates).sort();
    const avgTraining = labels.map(d => (dates[d].trainingSum / dates[d].count).toFixed(2));
    const avgMatch = labels.map(d => (dates[d].matchSum / dates[d].count).toFixed(2));

    if(chartTraining) chartTraining.destroy();
    if(chartMatch) chartMatch.destroy();

    chartTraining = new Chart(chartTrainingCtx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Średnia ocena treningu',
          data: avgTraining,
          borderColor: 'blue',
          backgroundColor: 'rgba(0,0,255,0.1)',
          fill: true,
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true, max: 10 }
        }
      }
    });

    chartMatch = new Chart(chartMatchCtx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Średnia ocena meczu',
          data: avgMatch,
          borderColor: 'green',
          backgroundColor: 'rgba(0,255,0,0.1)',
          fill: true,
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true, max: 10 }
        }
      }
    });
  });
}

// --- Mecze ---
const matchesTableBody = document.querySelector('#matchesTable tbody');
const matchForm = document.getElementById('matchForm');
const matchDateInput = document.getElementById('matchDate');
const matchOpponentInput = document.getElementById('matchOpponent');
const matchesMessage = document.getElementById('matchesMessage');
const matchFormClearBtn = document.getElementById('matchFormClearBtn');

let matches = [];

function loadMatches() {
  db.ref('matches').off();
  db.ref('matches').on('value', snapshot => {
    const data = snapshot.val() || {};
    matches = Object.entries(data).map(([id, match]) => ({ id, ...match }));
    renderMatches();
  });
}

function renderMatches() {
  matchesTableBody.innerHTML = '';
  matches.forEach(match => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${match.date}</td>
      <td>${match.opponent}</td>
      <td>
        <button class="btn-edit" data-id="${match.id}">Edytuj</button>
        <button class="btn-delete" data-id="${match.id}">Usuń</button>
      </td>
    `;
    matchesTableBody.appendChild(tr);
  });

  matchesTableBody.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', () => {
      const match = matches.find(m => m.id === btn.dataset.id);
      if(match) {
        matchDateInput.value = match.date;
        matchOpponentInput.value = match.opponent;
        matchesMessage.textContent = '';
        matchForm.dataset.editId = match.id;
      }
    });
  });

  matchesTableBody.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', () => {
      if(confirm('Na pewno chcesz usunąć ten mecz?')) {
        db.ref('matches/' + btn.dataset.id).remove();
      }
    });
  });
}

matchForm.addEventListener('submit', e => {
  e.preventDefault();
  matchesMessage.textContent = '';

  const date = matchDateInput.value.trim();
  const opponent = matchOpponentInput.value.trim();
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

matchFormClearBtn.addEventListener('click', () => {
  matchForm.reset();
  matchesMessage.textContent = '';
  delete matchForm.dataset.editId;
});

// --- Inicjalizacja ---
window.onload = () => {
  showSection('login');
  loadTeams();
  loadMatches();
};

