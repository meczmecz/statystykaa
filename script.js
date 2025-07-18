// script.js

document.addEventListener('DOMContentLoaded', () => {

  // Dane — na razie w pamięci (możesz potem rozbudować o storage)
  let teams = [];
  let players = [];

  // Elementy DOM
  const tabs = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  const teamsList = document.getElementById('teamsList');
  const playersList = document.getElementById('playersList');

  const teamForm = document.getElementById('teamForm');
  const teamNameInput = document.getElementById('teamName');

  const playerForm = document.getElementById('playerForm');
  const playerTeamSelect = document.getElementById('playerTeamSelect');
  const playerNameInput = document.getElementById('playerName');

  // FUNKCJA: Zmiana zakładek
  function switchTab(tabName) {
    tabContents.forEach(tc => {
      tc.classList.toggle('hidden', tc.id !== tabName);
    });

    tabs.forEach(tab => {
      if(tab.dataset.tab === tabName) {
        tab.classList.add('bg-blue-600', 'text-white');
        tab.classList.remove('bg-white', 'text-blue-800');
      } else {
        tab.classList.remove('bg-blue-600', 'text-white');
        tab.classList.add('bg-white', 'text-blue-800');
      }
    });
  }

  // Obsługa kliknięcia w zakładkę
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      switchTab(tab.dataset.tab);
    });
  });

  // Domyślnie pokaż Drużyny
  switchTab('teams');

  // Dodawanie drużyny
  teamForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = teamNameInput.value.trim();
    if (!name) {
      alert('Podaj nazwę drużyny!');
      return;
    }
    if (teams.some(t => t.name.toLowerCase() === name.toLowerCase())) {
      alert('Taka drużyna już istnieje!');
      return;
    }
    teams.push({ name, id: Date.now().toString() });
    teamNameInput.value = '';
    renderTeams();
    updateTeamSelect();
  });

  // Dodawanie zawodnika
  playerForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = playerNameInput.value.trim();
    const teamId = playerTeamSelect.value;
    if (!name || !teamId) {
      alert('Wybierz drużynę i podaj nazwisko zawodnika!');
      return;
    }
    if (players.some(p => p.name.toLowerCase() === name.toLowerCase() && p.teamId === teamId)) {
      alert('Taki zawodnik już jest w tej drużynie!');
      return;
    }
    players.push({ name, id: Date.now().toString(), teamId });
    playerNameInput.value = '';
    renderPlayers();
  });

  // Usuwanie drużyny
  function deleteTeam(id) {
    if (!confirm('Na pewno chcesz usunąć tę drużynę i wszystkich jej zawodników?')) return;
    teams = teams.filter(t => t.id !== id);
    players = players.filter(p => p.teamId !== id);
    renderTeams();
    renderPlayers();
    updateTeamSelect();
  }

  // Usuwanie zawodnika
  function deletePlayer(id) {
    if (!confirm('Na pewno chcesz usunąć tego zawodnika?')) return;
    players = players.filter(p => p.id !== id);
    renderPlayers();
  }

  // Renderowanie drużyn jako kafelki
  function renderTeams() {
    if(teams.length === 0) {
      teamsList.innerHTML = `<p class="col-span-full text-center text-gray-500">Brak drużyn. Dodaj nową drużynę powyżej.</p>`;
      return;
    }
    teamsList.innerHTML = '';
    teams.forEach(team => {
      const teamPlayers = players.filter(p => p.teamId === team.id);
      const div = document.createElement('div');
      div.className = 'bg-white rounded-xl shadow-lg p-6 flex flex-col justify-between hover:shadow-xl transition relative';
      div.innerHTML = `
        <h3 class="text-xl font-semibold mb-2 text-blue-700">${team.name}</h3>
        <p class="text-gray-600 mb-4">Liczba zawodników: <span class="font-bold">${teamPlayers.length}</span></p>
        <button class="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-800 transition" title="Usuń drużynę">Usuń</button>
      `;
      const btn = div.querySelector('button');
      btn.addEventListener('click', () => deleteTeam(team.id));
      teamsList.appendChild(div);
    });
  }

  // Renderowanie zawodników jako kafelki
  function renderPlayers() {
    if(players.length === 0) {
      playersList.innerHTML = `<p class="col-span-full text-center text-gray-500">Brak zawodników. Dodaj zawodnika powyżej.</p>`;
      return;
    }
    playersList.innerHTML = '';
    players.forEach(player => {
      const team = teams.find(t => t.id === player.teamId);
      const div = document.createElement('div');
      div.className = 'bg-white rounded-xl shadow-lg p-6 flex flex-col justify-between hover:shadow-xl transition relative';
      div.innerHTML = `
        <h3 class="text-xl font-semibold mb-2 text-blue-700">${player.name}</h3>
        <p class="text-gray-600 mb-4">Drużyna: <span class="font-bold">${team ? team.name : 'Nieznana'}</span></p>
        <button class="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-800 transition" title="Usuń zawodnika">Usuń</button>
      `;
      const btn = div.querySelector('button');
      btn.addEventListener('click', () => deletePlayer(player.id));
      playersList.appendChild(div);
    });
  }

  // Aktualizacja selecta drużyn w formularzu zawodnika
  function updateTeamSelect() {
    playerTeamSelect.innerHTML = `<option value="" disabled selected>Wybierz drużynę</option>`;
    teams.forEach(team => {
      const opt = document.createElement('option');
      opt.value = team.id;
      opt.textContent = team.name;
      playerTeamSelect.appendChild(opt);
    });
  }

  // Initial render
  renderTeams();
  renderPlayers();
  updateTeamSelect();

});
