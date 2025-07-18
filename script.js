// --- Dane przechowywane w localStorage ---
let teams = JSON.parse(localStorage.getItem('teams')) || [];
let players = JSON.parse(localStorage.getItem('players')) || []; // wszyscy zawodnicy, powiązani z drużynami
let matches = JSON.parse(localStorage.getItem('matches')) || [];
let ratings = JSON.parse(localStorage.getItem('ratings')) || [];

// --- Zapis do localStorage ---
function saveData() {
  localStorage.setItem('teams', JSON.stringify(teams));
  localStorage.setItem('players', JSON.stringify(players));
  localStorage.setItem('matches', JSON.stringify(matches));
  localStorage.setItem('ratings', JSON.stringify(ratings));
}

// --- Render drużyn i zawodników w zakładce Drużyny ---
function renderTeams() {
  const container = document.getElementById('teamsContainer');
  container.innerHTML = '';
  if (teams.length === 0) {
    container.innerHTML = '<p>Brak drużyn. Dodaj nową drużynę.</p>';
    return;
  }
  teams.forEach(team => {
    // Znajdź zawodników tej drużyny
    const teamPlayers = players.filter(p => p.teamId === team.id);

    const teamDiv = document.createElement('div');
    teamDiv.className = 'card';
    teamDiv.innerHTML = `
      <h3>${team.name} 
        <button class="btn-red" onclick="deleteTeam(${team.id})">Usuń drużynę</button>
      </h3>
      <p><b>Zawodnicy:</b></p>
      <ul id="playersList_${team.id}">
        ${teamPlayers.map(p => 
          `<li>${p.name} 
            <button class="btn-red" onclick="deletePlayer(${team.id},${p.id})">Usuń</button>
          </li>`).join('')}
      </ul>
      <input type="text" id="newPlayerName_${team.id}" placeholder="Dodaj zawodnika">
      <button onclick="addPlayer(${team.id})">Dodaj zawodnika</button>
    `;
    container.appendChild(teamDiv);
  });
  updateTeamSelects();
}

// --- Dodawanie drużyny ---
function addTeam() {
  const input = document.getElementById('teamNameInput');
  const name = input.value.trim();
  if (!name) {
    alert('Podaj nazwę drużyny!');
    return;
  }
  if (teams.find(t => t.name.toLowerCase() === name.toLowerCase())) {
    alert('Taka drużyna już istnieje!');
    return;
  }
  const newTeam = { id: Date.now(), name };
  teams.push(newTeam);
  saveData();
  input.value = '';
  renderTeams();
}

// --- Usuwanie drużyny ---
function deleteTeam(id) {
  if (!confirm('Usunąć drużynę i wszystkich jej zawodników?')) return;
  teams = teams.filter(t => t.id !== id);
  players = players.filter(p => p.teamId !== id);
  ratings = ratings.filter(r => {
    const player = players.find(p => p.id === r.playerId);
    return player !== undefined;
  });
  saveData();
  renderTeams();
  renderRatings();
}

// --- Dodawanie zawodnika ---
function addPlayer(teamId) {
  const input = document.getElementById(`newPlayerName_${teamId}`);
  const name = input.value.trim();
  if (!name) {
    alert('Podaj nazwę zawodnika!');
    return;
  }
  if (players.find(p => p.name.toLowerCase() === name.toLowerCase() && p.teamId === teamId)) {
    alert('Taki zawodnik już jest w tej drużynie!');
    return;
  }
  const newPlayer = { id: Date.now(), teamId, name };
  players.push(newPlayer);
  saveData();
  input.value = '';
  renderTeams();
}

// --- Usuwanie zawodnika ---
function deletePlayer(teamId, playerId) {
  if (!confirm('Usunąć zawodnika?')) return;
  players = players.filter(p => p.id !== playerId);
  ratings = ratings.filter(r => r.playerId !== playerId);
  saveData();
  renderTeams();
  renderRatings();
}

// --- Render meczów ---
function renderMatches() {
  const container = document.getElementById('matchesContainer');
  container.innerHTML = '';
  if (matches.length === 0) {
    container.innerHTML = '<p>Brak dodanych meczów.</p>';
    return;
  }
  matches.forEach(match => {
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `
      <p><b>Data:</b> ${match.date}</p>
      <p><b>Przeciwnik:</b> ${match.opponent}</p>
      <p><b>Wynik:</b> ${match.result}</p>
      <p><b>Strzelcy:</b> ${match.scorers || '-'}</p>
      <p><b>Najlepszy zawodnik:</b> ${match.bestPlayer || '-'}</p>
      <p><b>3 najlepsi z Jaguara:</b> ${match.best3Jaguar || '-'}</p>
      <p><b>3 najlepsi przeciwnicy:</b> ${match.best3Opponent || '-'}</p>
      <p><b>Opis:</b> ${match.descriptions || '-'}</p>
      <button class="btn-red" onclick="deleteMatch(${match.id})">Usuń mecz</button>
    `;
    container.appendChild(div);
  });
}

// --- Dodawanie meczu ---
function addMatch(event) {
  event.preventDefault();
  const date = document.getElementById('matchDate').value;
  const opponent = document.getElementById('matchOpponent').value.trim();
  const result = document.getElementById('matchResult').value.trim();
  const scorers = document.getElementById('matchScorers').value.trim();
  const bestPlayer = document.getElementById('matchBestPlayer').value.trim();
  const best3Jaguar = document.getElementById('matchBest3Jaguar').value.trim();
  const best3Opponent = document.getElementById('matchBest3Opponent').value.trim();
  const descriptions = document.getElementById('matchDescriptions').value.trim();

  if (!date || !opponent || !result) {
    alert('Wypełnij wymagane pola: data, przeciwnik, wynik');
    return;
  }
  const newMatch = {
    id: Date.now(),
    date, opponent, result,
    scorers, bestPlayer,
    best3Jaguar, best3Opponent,
    descriptions
  };
  matches.push(newMatch);
  saveData();
  renderMatches();
  event.target.reset();
}

// --- Usuwanie meczu ---
function deleteMatch(id) {
  if (!confirm('Usunąć mecz?')) return;
  matches = matches.filter(m => m.id !== id);
  saveData();
  renderMatches();
}

// --- Render ocen ---
function renderRatings() {
  const container = document.getElementById('ratingsContainer');
  container.innerHTML = '';
  if (ratings.length === 0) {
    container.innerHTML = '<p>Brak dodanych ocen.</p>';
    return;
  }
  ratings.forEach(r => {
    const team = teams.find(t => t.id === r.teamId);
    const player = players.find(p => p.id === r.playerId);
    if (!team || !player) return;

    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `
      <p><b>${team.name} - ${player.name}</b></p>
      <p>Typ: ${r.type}, Data: ${r.date}, Ocena: ${r.score}, Czas na boisku: ${r.timeOnField || '-'}</p>
    `;
    container.appendChild(div);
  });
}

// --- Dodawanie oceny ---
function addRating() {
  const teamId = Number(document.getElementById('ratingTeamSelect').value);
  const playerId = Number(document.getElementById('ratingPlayerSelect').value);
  const type = document.getElementById('ratingType').value;
  const date = document.getElementById('ratingDate').value;
  const score = Number(document.getElementById('ratingScore').value);
  const timeOnField = document.getElementById('ratingTime').value.trim();

  if (!teamId || !playerId || !type || !date || !score) {
    alert('Wypełnij wszystkie pola oceny!');
    return;
  }
  if (score < 1 || score > 5) {
    alert('Ocena musi być od 1 do 5!');
    return;
  }

  const newRating = { id: Date.now(), teamId, playerId, type, date, score, timeOnField };
  ratings.push(newRating);
  saveData();
  renderRatings();
  updateCharts();

  // Resetuj formularz
  document.getElementById('ratingForm').reset();
}

// --- Aktualizacja selectów drużyn i zawodników ---
function updateTeamSelects() {
  const selects = document.querySelectorAll('.teamSelect');
  selects.forEach(select => {
    const prevValue = select.value;
    select.innerHTML = '<option value="">Wybierz drużynę</option>';
    teams.forEach(team => {
      const option = document.createElement('option');
      option.value = team.id;
      option.textContent = team.name;
      select.appendChild(option);
    });
    select.value = prevValue;
  });
  updatePlayerSelect();
}

function updatePlayerSelect() {
  const teamSelect = document.getElementById('ratingTeamSelect');
  const playerSelect = document.getElementById('ratingPlayerSelect');
  playerSelect.innerHTML = '<option value="">Wybierz zawodnika</option>';
  const teamId = Number(teamSelect.value);
  if (!teamId) return;
  players.filter(p => p.teamId === teamId).forEach(player => {
    const option = document.createElement('option');
    option.value = player.id;
    option.textContent = player.name;
    playerSelect.appendChild(option);
  });
}

// --- Wykresy Chart.js ---
let chart1, chart2;
const ctx1 = document.getElementById('chart1').getContext('2d');
const ctx2 = document.getElementById('chart2').getContext('2d');

function updateCharts() {
  // Średnia ocena zawodników w drużynach
  const teamScores = {};
  ratings.forEach(r => {
    if (!teamScores[r.teamId]) teamScores[r.teamId] = { sum: 0, count: 0 };
    teamScores[r.teamId].sum += r.score;
    teamScores[r.teamId].count++;
  });
  const labels = teams.map(t => t.name);
  const data = teams.map(t => {
    if (teamScores[t.id]) return (teamScores[t.id].sum / teamScores[t.id].count).toFixed(2);
    return 0;
  });

  if (chart1) chart1.destroy();
  chart1 = new Chart(ctx1, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Średnia ocena zawodników',
        data,
        backgroundColor: '#1e40af',
      }]
    },
    options: {
      scales: { y: { beginAtZero: true, max: 5 }},
      plugins: { legend: { display: false }}
    }
  });

  // Porównanie ocen trening vs mecz
  const typeScores = { trening: [], mecz: [] };
  ratings.forEach(r => {
    if (typeScores[r.type]) typeScores[r.type].push(r.score);
  });
  const avgTrening = typeScores.trening.length ? (typeScores.trening.reduce((a,b)=>a+b,0)/typeScores.trening.length).toFixed(2) : 0;
  const avgMecz = typeScores.mecz.length ? (typeScores.mecz.reduce((a,b)=>a+b,0)/typeScores.mecz.length).toFixed(2) : 0;

  if (chart2) chart2.destroy();
  chart2 = new Chart(ctx2, {
    type: 'pie',
    data: {
      labels: ['Ocena treningu', 'Ocena meczu'],
      datasets: [{
        data: [avgTrening, avgMecz],
        backgroundColor: ['#2563eb', '#ef4444']
      }]
    },
    options: {
      plugins: { legend: { position: 'bottom' }}
    }
  });
}

// --- Inicjalizacja i podpięcie zdarzeń ---
function init() {
  renderTeams();
  renderMatches();
  renderRatings();
  updateTeamSelects();
  updateCharts();

  document.getElementById('addTeamBtn').onclick = addTeam;
  document.getElementById('matchForm').onsubmit = addMatch;
  document.getElementById('ratingForm').onsubmit = e => {
    e.preventDefault();
    addRating();
  };

  // Aktualizuj listę zawodników po wyborze drużyny
  document.getElementById('ratingTeamSelect').onchange = updatePlayerSelect;
}

init();

