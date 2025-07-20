// Konfiguracja Firebase (podmień na swoje dane)
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

// --- ELEMENTY ---
const teamForm = document.getElementById('teamForm');
const teamNameInput = document.getElementById('teamNameInput');
const teamsList = document.getElementById('teamsList');

const playerSection = document.getElementById('playerSection');
const currentTeamNameSpan = document.getElementById('currentTeamName');
const playerForm = document.getElementById('playerForm');
const playerNameInput = document.getElementById('playerNameInput');
const playersList = document.getElementById('playersList');
const backToTeamsBtn = document.getElementById('backToTeamsBtn');

const matchForm = document.getElementById('matchForm');
const matchDateInput = document.getElementById('matchDate');
const matchTeamSelect = document.getElementById('matchTeamSelect');
const matchOpponentInput = document.getElementById('matchOpponentInput');
const matchScoreInput = document.getElementById('matchScoreInput');
const matchesTableBody = document.querySelector('#matchesTable tbody');

const chartTeamSelect = document.getElementById('chartTeamSelect');
const progressChartCtx = document.getElementById('progressChart').getContext('2d');

let currentTeamId = null;
let teamsData = {};
let playersData = {};
let matchesData = {};

let progressChart = null;

// --- FUNKCJE ---
// Wczytaj wszystkie drużyny i wyświetl
function loadTeams() {
  db.ref('teams').on('value', snapshot => {
    teamsData = snapshot.val() || {};
    renderTeamsList();
    populateTeamSelectors();
  });
}

// Renderowanie listy drużyn (lista po lewej)
function renderTeamsList() {
  teamsList.innerHTML = '';
  for (const teamId in teamsData) {
    const li = document.createElement('li');
    li.textContent = teamsData[teamId].name;
    li.dataset.teamId = teamId;
    li.addEventListener('click', () => {
      showPlayersOfTeam(teamId);
    });
    teamsList.appendChild(li);
  }
}

// Pokazuje sekcję zawodników i ładuje skład drużyny
function showPlayersOfTeam(teamId) {
  currentTeamId = teamId;
  currentTeamNameSpan.textContent = teamsData[teamId].name;
  playerSection.style.display = 'block';
  document.getElementById('teamSection').style.display = 'none';

  loadPlayers(teamId);
}

// Wczytaj zawodników drużyny z bazy
function loadPlayers(teamId) {
  db.ref(`players/${teamId}`).on('value', snapshot => {
    playersData = snapshot.val() || {};
    renderPlayersList();
  });
}

// Renderuj listę zawodników danej drużyny
function renderPlayersList() {
  playersList.innerHTML = '';
  for (const playerId in playersData) {
    const li = document.createElement('li');
    li.textContent = playersData[playerId].name;
    li.dataset.playerId = playerId;
    // Możesz dodać kliknięcie na zawodnika, by pokazać szczegóły i edycję
    li.addEventListener('click', () => {
      showPlayerDetails(playerId);
    });
    playersList.appendChild(li);
  }
}

// Szczegóły i edycja zawodnika (np. średnie oceny)
function showPlayerDetails(playerId) {
  const player = playersData[playerId];
  if (!player) return alert('Błąd: zawodnik nie istnieje');
  // Możesz rozbudować tę funkcję, np. pokazując średnie oceny
  alert(`Zawodnik: ${player.name}\n\nŚrednia ocena treningu: ${player.avgTraining || '-'}\nŚrednia ocena meczu: ${player.avgMatch || '-'}`);
}

// Powrót do listy drużyn
backToTeamsBtn.addEventListener('click', () => {
  playerSection.style.display = 'none';
  document.getElementById('teamSection').style.display = 'block';
  currentTeamId = null;
  playersList.innerHTML = '';
});

// Dodawanie drużyny
teamForm.addEventListener('submit', e => {
  e.preventDefault();
  const name = teamNameInput.value.trim();
  if (!name) return alert('Podaj nazwę drużyny');

  // Dodaj do bazy
  const newTeamRef = db.ref('teams').push();
  newTeamRef.set({ name })
    .then(() => {
      teamNameInput.value = '';
    })
    .catch(err => alert('Błąd dodawania drużyny: ' + err.message));
});

// Dodawanie zawodnika do aktualnej drużyny
playerForm.addEventListener('submit', e => {
  e.preventDefault();
  const name = playerNameInput.value.trim();
  if (!name) return alert('Podaj imię i nazwisko zawodnika');
  if (!currentTeamId) return alert('Wybierz drużynę najpierw');

  // Dodaj zawodnika do bazy pod daną drużyną
  const newPlayerRef = db.ref(`players/${currentTeamId}`).push();
  newPlayerRef.set({
    name,
    trainingScores: {},  // do ocen z treningów
    matchScores: {}      // do ocen z meczów
  }).then(() => {
    playerNameInput.value = '';
  }).catch(err => alert('Błąd dodawania zawodnika: ' + err.message));
});

// --- MECZE ---

// Załaduj drużyny do formularza dodawania meczu i wykresów
function populateTeamSelectors() {
  [matchTeamSelect, chartTeamSelect].forEach(selectEl => {
    const prevVal = selectEl.value;
    selectEl.innerHTML = '<option value="">-- wybierz drużynę --</option>';
    for (const teamId in teamsData) {
      const opt = document.createElement('option');
      opt.value = teamId;
      opt.textContent = teamsData[teamId].name;
      selectEl.appendChild(opt);
    }
    selectEl.value = prevVal;
  });
}

// Dodawanie meczu
matchForm.addEventListener('submit', e => {
  e.preventDefault();

  const date = matchDateInput.value;
  const teamId = matchTeamSelect.value;
  const opponent = matchOpponentInput.value.trim();
  const score = matchScoreInput.value.trim();

  if (!date || !teamId || !opponent || !score) {
    return alert('Wypełnij wszystkie pola meczu');
  }

  const newMatchRef = db.ref('matches').push();
  newMatchRef.set({
    date,
    teamId,
    opponent,
    score
  }).then(() => {
    matchForm.reset();
  }).catch(err => alert('Błąd dodawania meczu: ' + err.message));
});

// Wczytaj i wyświetl mecze
function loadMatches() {
  db.ref('matches').on('value', snapshot => {
    matchesData = snapshot.val() || {};
    renderMatchesTable();
  });
}

// Renderowanie tabeli meczów
function renderMatchesTable() {
  matchesTableBody.innerHTML = '';
  for (const matchId in matchesData) {
    const match = matchesData[matchId];
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${match.date}</td>
      <td>${teamsData[match.teamId] ? teamsData[match.teamId].name : 'Nieznana drużyna'}</td>
      <td>${match.opponent}</td>
      <td>${match.score}</td>
      <td><button data-id="${matchId}" class="deleteMatchBtn">Usuń</button></td>
    `;
    matchesTableBody.appendChild(tr);
  }
  // Dodaj obsługę usuwania
  document.querySelectorAll('.deleteMatchBtn').forEach(btn => {
    btn.onclick = () => {
      if (confirm('Usunąć ten mecz?')) {
        db.ref('matches/' + btn.dataset.id).remove();
      }
    };
  });
}

// --- WYKRES ---

function loadChartData(teamId) {
  if (!teamId) {
    clearChart();
    return;
  }
  // Pobierz zawodników danej drużyny
  db.ref(`players/${teamId}`).once('value').then(snapshot => {
    const players = snapshot.val() || {};
    // Budujemy dane do wykresu:
    // Oś X: nazwiska zawodników
    // Oś Y: średnia ocena treningu i meczu

    const labels = [];
    const trainingAvgs = [];
    const matchAvgs = [];

    for (const playerId in players) {
      const p = players[playerId];
      labels.push(p.name);
      trainingAvgs.push(calcAverage(p.trainingScores));
      matchAvgs.push(calcAverage(p.matchScores));
    }

    drawChart(labels, trainingAvgs, matchAvgs);
  });
}

function calcAverage(scoresObj) {
  if (!scoresObj) return 0;
  const values = Object.values(scoresObj);
  if (values.length === 0) return 0;
  const sum = values.reduce((a,b) => a+b, 0);
  return (sum / values.length).toFixed(2);
}

function drawChart(labels, trainingAvgs, matchAvgs) {
  if (progressChart) progressChart.destroy();
  progressChart = new Chart(progressChartCtx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Średnia ocena treningu',
          data: trainingAvgs,
          backgroundColor: 'rgba(0, 74, 173, 0.7)'
        },
        {
          label: 'Średnia ocena meczu',
          data: matchAvgs,
          backgroundColor: 'rgba(0, 173, 81, 0.7)'
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true, max: 10 }
      }
    }
  });
}

function clearChart() {
  if (progressChart) {
    progressChart.destroy();
    progressChart = null;
  }
}

// Zmiana drużyny na wykresie
chartTeamSelect.addEventListener('change', () => {
  loadChartData(chartTeamSelect.value);
});

// --- INICJALIZACJA ---
loadTeams();
loadMatches();

