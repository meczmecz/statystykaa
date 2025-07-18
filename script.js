// script.js

document.addEventListener('DOMContentLoaded', () => {
  // Zmiana zakładek
  const tabs = document.querySelectorAll('.tab-btn');
  const sections = document.querySelectorAll('.tab-content');

  function showSection(id) {
    sections.forEach(sec => {
      sec.classList.toggle('hidden', sec.id !== id);
    });
    tabs.forEach(tab => {
      tab.classList.toggle('bg-blue-800', tab.dataset.target === id);
      tab.classList.toggle('bg-blue-600', tab.dataset.target !== id);
    });
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => showSection(tab.dataset.target));
  });

  // Pokaż domyślnie pierwszą zakładkę
  showSection('matchesSection');

  // Dane drużyn i zawodników
  let teams = [];
  let players = [];

  // Elementy
  const teamForm = document.getElementById('teamForm');
  const teamNameInput = document.getElementById('teamName');
  const teamsTableBody = document.getElementById('teamsTableBody');
  const selectTeamForPlayer = document.getElementById('selectTeamForPlayer');
  const playerForm = document.getElementById('playerForm');
  const playerNameInput = document.getElementById('playerName');
  const playersTableBody = document.getElementById('playersTableBody');

  // Dodawanie drużyny
  teamForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = teamNameInput.value.trim();
    if (!name) return alert('Podaj nazwę drużyny!');

    if (teams.find(t => t.name.toLowerCase() === name.toLowerCase())) {
      alert('Taka drużyna już istnieje!');
      return;
    }

    teams.push({ name, players: [] });
    teamNameInput.value = '';
    renderTeams();
    updateTeamSelect();
  });

  // Dodawanie zawodnika do drużyny
  playerForm.addEventListener('submit', e => {
    e.preventDefault();
    const playerName = playerNameInput.value.trim();
    const teamName = selectTeamForPlayer.value;
    if (!playerName || !teamName) return alert('Wybierz drużynę i podaj nazwisko zawodnika!');

    // Znajdź drużynę
    const team = teams.find(t => t.name === teamName);
    if (!team) return alert('Wybrana drużyna nie istnieje!');

    // Sprawdź, czy zawodnik już w tej drużynie
    if (team.players.find(p => p.toLowerCase() === playerName.toLowerCase())) {
      alert('Taki zawodnik już jest w drużynie!');
      return;
    }

    team.players.push(playerName);
    playerNameInput.value = '';
    renderTeams();
    renderPlayers();
  });

  // Usuwanie drużyny
  function deleteTeam(name) {
    if (!confirm(`Na pewno usunąć drużynę "${name}"? Usunięcie drużyny usunie też wszystkich zawodników.`)) return;
    teams = teams.filter(t => t.name !== name);
    renderTeams();
    renderPlayers();
    updateTeamSelect();
  }

  // Usuwanie zawodnika
  function deletePlayer(teamName, playerName) {
    if (!confirm(`Na pewno usunąć zawodnika "${playerName}" z drużyny "${teamName}"?`)) return;
    const team = teams.find(t => t.name === teamName);
    if (!team) return;
    team.players = team.players.filter(p => p !== playerName);
    renderTeams();
    renderPlayers();
  }

  // Renderowanie tabeli drużyn
  function renderTeams() {
    teamsTableBody.innerHTML = '';
    teams.forEach(team => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="py-2 px-4">${team.name}</td>
        <td class="py-2 px-4">${team.players.length}</td>
        <td class="py-2 px-4">
          <button class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-700" onclick="deleteTeam('${team.name}')">Usuń</button>
        </td>
      `;
      teamsTableBody.appendChild(tr);
    });
  }

  // Renderowanie tabeli zawodników
  function renderPlayers() {
    playersTableBody.innerHTML = '';
    teams.forEach(team => {
      team.players.forEach(player => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td class="py-2 px-4">${player}</td>
          <td class="py-2 px-4">${team.name}</td>
          <td class="py-2 px-4">
            <button class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-700" onclick="deletePlayer('${team.name}', '${player}')">Usuń</button>
          </td>
        `;
        playersTableBody.appendChild(tr);
      });
    });
  }

  // Aktualizacja select drużyn w formularzu zawodników
  function updateTeamSelect() {
    selectTeamForPlayer.innerHTML = '<option value="" disabled selected>Wybierz drużynę</option>';
    teams.forEach(team => {
      const option = document.createElement('option');
      option.value = team.name;
      option.textContent = team.name;
      selectTeamForPlayer.appendChild(option);
    });
  }

  // Żeby funkcje usuwania działały z onclick z stringami
  window.deleteTeam = deleteTeam;
  window.deletePlayer = deletePlayer;
});
