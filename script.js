// script.js

// Prosty system zakładek
const tabs = {
  tabMatches: document.getElementById('matchesSection'),
  tabTeams: document.getElementById('teamsSection'),
  tabPlayers: document.getElementById('playersSection')
};
const tabButtons = {
  tabMatches: document.getElementById('tabMatches'),
  tabTeams: document.getElementById('tabTeams'),
  tabPlayers: document.getElementById('tabPlayers')
};

for (const btnId in tabButtons) {
  tabButtons[btnId].addEventListener('click', () => {
    // Aktywuj przycisk
    Object.values(tabButtons).forEach(b => b.classList.remove('active'));
    tabButtons[btnId].classList.add('active');
    // Pokaż sekcję
    Object.values(tabs).forEach(s => s.classList.remove('active'));
    tabs[btnId].classList.add('active');
  });
}

// Dane w pamięci (można potem rozszerzyć o localStorage)
const data = {
  teams: [],
  players: [],
  matches: []
};

// === FUNKCJE DO DRUŻYN ===

const teamForm = document.getElementById('teamForm');
const teamNameInput = document.getElementById('teamName');
const teamsTableBody = document.querySelector('#teamsTable tbody');

function renderTeams() {
  teamsTableBody.innerHTML = '';
  data.teams.forEach((team, i) => {
    const playersCount = data.players.filter(p => p.team === team).length;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${team}</td>
      <td>${playersCount}</td>
      <td><button data-index="${i}" class="deleteTeamBtn">Usuń</button></td>
    `;
    teamsTableBody.appendChild(tr);
  });

  // Obsługa usuwania drużyny
  document.querySelectorAll('.deleteTeamBtn').forEach(btn => {
    btn.onclick = () => {
      const idx = +btn.getAttribute('data-index');
      const teamToDelete = data.teams[idx];
      // Usuwamy zawodników z tej drużyny też
      data.players = data.players.filter(p => p.team !== teamToDelete);
      // Usuwamy drużynę
      data.teams.splice(idx, 1);
      renderTeams();
      renderPlayers();
      updateTeamSelect();
    };
  });
}

teamForm.addEventListener('submit', e => {
  e.preventDefault();
  const newTeam = teamNameInput.value.trim();
  if (newTeam && !data.teams.includes(newTeam)) {
    data.teams.push(newTeam);
    teamNameInput.value = '';
    renderTeams();
    updateTeamSelect();
  } else {
    alert('Podaj unikalną nazwę drużyny!');
  }
});

// === FUNKCJE DO ZAWODNIKÓW ===

const playerForm = document.getElementById('playerForm');
const selectTeamForPlayer = document.getElementById('selectTeamForPlayer');
const playerNameInput = document.getElementById('playerName');
const playersTableBody = document.querySelector('#playersTable tbody');

function renderPlayers() {
  playersTableBody.innerHTML = '';
  data.players.forEach((player, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${player.name}</td>
      <td>${player.team}</td>
      <td><button data-index="${i}" class="deletePlayerBtn">Usuń</button></td>
    `;
    playersTableBody.appendChild(tr);
  });

  // Usuwanie zawodnika
  document.querySelectorAll('.deletePlayerBtn').forEach(btn => {
    btn.onclick = () => {
      const idx = +btn.getAttribute('data-index');
      data.players.splice(idx, 1);
      renderPlayers();
      updatePlayerSelect();
    };
  });
}

playerForm.addEventListener('submit', e => {
  e.preventDefault();
  const team = selectTeamForPlayer.value;
  const name = playerNameInput.value.trim();
  if (team && name && !data.players.some(p => p.name === name && p.team === team)) {
    data.players.push({ name, team, ratings: [] });
    playerNameInput.value = '';
    renderPlayers();
    updatePlayerSelect();
  } else {
    alert('Wybierz drużynę i podaj unikalną nazwę zawodnika!');
  }
});

// Aktualizacja selectów

function updateTeamSelect() {
  selectTeamForPlayer.innerHTML = '<option value="">-- Wybierz drużynę --</option>';
  data.teams.forEach(t => {
    const option = document.createElement('option');
    option.value = t;
    option.textContent = t;
    selectTeamForPlayer.appendChild(option);
  });
  updatePlayerSelect();
}

const selectPlayerForRating = document.getElementById('selectPlayerForRating');

function updatePlayerSelect() {
  selectPlayerForRating.innerHTML = '<option value="">-- Wybierz zawodnika --</option>';
  data.players.forEach(p => {
    const option = document.createElement('option');
    option.value = p.name + '|' + p.team; // klucz do identyfikacji
    option.textContent = p.name + ' (' + p.team + ')';
    selectPlayerForRating.appendChild(option);
  });
}

// === FUNKCJE DO OCENIANIA ZAWODNIKÓW ===

const ratingForm = document.getElementById('ratingForm');
const ratingDateInput = document.getElementById('ratingDate');
const trainingRatingInput = document.getElementById('trainingRating');
const matchRatingPlayerInput = document.getElementById('matchRatingPlayer');
const timeOnFieldInput = document.getElementById('timeOnField');

ratingForm.addEventListener('submit', e => {
  e.preventDefault();
  const selected = selectPlayerForRating.value;
  if (!selected) {
    alert('Wybierz zawodnika!');
    return;
  }
  const [name, team] = selected.split('|');
  const date = ratingDateInput.value;
  const trainingRating = parseInt(trainingRatingInput.value);
  const matchRating = parseInt(matchRatingPlayerInput.value);
  const timeOnField = parseInt(timeOnFieldInput.value);

  if (!date || trainingRating < 1 || trainingRating > 5 || matchRating < 1 || matchRating > 5 || timeOnField < 0) {
    alert('Wprowadź poprawne dane!');
    return;
  }

  // Znajdź zawodnika i dodaj ocenę
  const player = data.players.find(p => p.name === name && p.team === team);
  if (!player) {
    alert('Nie znaleziono zawodnika!');
    return;
  }
  player.ratings.push({ date, trainingRating, matchRating, timeOnField });
  ratingForm.reset();
  drawCharts(player);
});

// === FUNKCJE DO ANALIZ MECZÓW ===

const matchForm = document.getElementById('matchForm');
const matchesTableBody = document.querySelector('#matchesTable tbody');

matchForm.addEventListener('submit', e => {
  e.preventDefault();

  const date = document.getElementById('matchDate').value;
  const result = document.getElementById('matchResult').value.trim();
  const matchRating = parseInt(document.getElementById('matchRating').value);
  const goalScorers = document.getElementById('goalScorers').value.trim();
  const bestPlayer = document.getElementById('bestPlayer').value.trim();
  const topJaguarPlayers = document.getElementById('topJaguarPlayers').value.trim();
  const topOpponentsPlayers = document.getElementById('topOpponentsPlayers').value.trim();
  const playerDescriptions = document.getElementById('playerDescriptions').value.trim();

  if (!date || !result || matchRating < 1 || matchRating > 5) {
    alert('Proszę uzupełnić wymagane pola!');
    return;
  }

  data.matches.push({
    date,
    result,
    matchRating,
    goalScorers,
    bestPlayer,
    topJaguarPlayers,
    topOpponentsPlayers,
    playerDescriptions
  });

  matchForm.reset();
  renderMatches();
});

function renderMatches() {
  matchesTableBody.innerHTML = '';
  data.matches.forEach(m => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${m.date}</td>
      <td>${m.result}</td>
      <td>${m.matchRating}</td>
      <td>${m.goalScorers}</td>
      <td>${m.bestPlayer}</td>
      <td>${m.topJaguarPlayers}</td>
      <td>${m.topOpponentsPlayers}</td>
      <td>${m.playerDescriptions}</td>
    `;
    matchesTableBody.appendChild(tr);
  });
}

// === WYKRESY ===

const trainingChartCtx = document.getElementById('trainingChart').getContext('2d');
const matchChartCtx = document.getElementById('matchChart').getContext('2d');
let trainingChart = null;
let matchChart = null;

function drawCharts(player) {
  if (!player || !player.ratings.length) {
    clearCharts();
    return;
  }
  // Sortujemy wg daty rosnąco
  const ratingsSorted = player.ratings.slice().sort((a,b) => new Date(a.date) - new Date(b.date));
  const labels = ratingsSorted.map(r => r.date);
  const trainingData = ratingsSorted.map(r => r.trainingRating);
  const matchData = ratingsSorted.map(r => r.matchRating);

  if (trainingChart) trainingChart.destroy();
  trainingChart = new Chart(trainingChartCtx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: `Ocena treningu - ${player.name}`,
        data: trainingData,
        borderColor: 'rgba(13, 110, 253, 0.8)',
        backgroundColor: 'rgba(13, 110, 253, 0.3)',
        fill: true,
        tension: 0.2,
        pointRadius: 5,
      }]
    },
    options: {
      scales: {
        y: { min: 1, max: 5, ticks: { stepSize: 1 } }
      }
    }
  });

  if (matchChart) matchChart.destroy();
  matchChart = new Chart(matchChartCtx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: `Ocena meczu - ${player.name}`,
        data: matchData,
        borderColor: 'rgba(220,53,69,0.8)',
        backgroundColor: 'rgba(220,53,69,0.3)',
        fill: true,
        tension: 0.2,
        pointRadius: 5,
      }]
    },
    options: {
      scales: {
        y: { min: 1, max: 5, ticks: { stepSize: 1 } }
      }
    }
  });
}

function clearCharts() {
  if (trainingChart) trainingChart.destroy();
  if (matchChart) matchChart.destroy();
}

// Inicjalizacja selectów
updateTeamSelect();
updatePlayerSelect();
renderTeams();
renderPlayers();
renderMatches();
