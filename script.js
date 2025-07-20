const addPlayerForm = document.getElementById('addPlayerForm');
const selectTeamForPlayer = document.getElementById('selectTeamForPlayer');
const playerNameInput = document.getElementById('playerName');
const addPlayerMessage = document.getElementById('addPlayerMessage');

function populateTeamsSelect() {
  // Czyścimy listę
  selectTeamForPlayer.innerHTML = '<option value="">-- wybierz --</option>';

  teams.forEach(team => {
    // zakładam, że team ma pole id i name
    const option = document.createElement('option');
    option.value = team.id || team.name;
    option.textContent = team.name;
    selectTeamForPlayer.appendChild(option);
  });
}

// Wywołaj tę funkcję po załadowaniu teams
populateTeamsSelect();

addPlayerForm.addEventListener('submit', e => {
  e.preventDefault();

  const teamId = selectTeamForPlayer.value;
  const playerName = playerNameInput.value.trim();

  if (!teamId || !playerName) {
    addPlayerMessage.style.color = 'red';
    addPlayerMessage.textContent = 'Wybierz drużynę i wpisz nazwisko zawodnika.';
    return;
  }

  const teamRef = db.ref('teams/' + teamId);

  teamRef.once('value').then(snapshot => {
    const teamData = snapshot.val();
    if (!teamData) {
      throw new Error('Drużyna nie istnieje w bazie.');
    }

    const players = teamData.players || [];

    // Sprawdź czy zawodnik już jest
    if (players.some(p => p.name.toLowerCase() === playerName.toLowerCase())) {
      throw new Error('Taki zawodnik już jest w drużynie.');
    }

    players.push({ name: playerName });

    return teamRef.update({ players });
  })
  .then(() => {
    addPlayerMessage.style.color = 'green';
    addPlayerMessage.textContent = 'Zawodnik został dodany.';
    addPlayerForm.reset();
    loadData(); // odśwież dane w UI, jeśli masz taką funkcję
  })
  .catch(err => {
    addPlayerMessage.style.color = 'red';
    addPlayerMessage.textContent = 'Błąd: ' + err.message;
  });
});

