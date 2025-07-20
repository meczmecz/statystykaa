const addPlayerForm = document.getElementById('addPlayerForm');
const selectTeamForPlayer = document.getElementById('selectTeamForPlayer');
const playerNameInput = document.getElementById('playerName');
const addPlayerMessage = document.getElementById('addPlayerMessage');

// Funkcja do wypełniania listy drużyn w formularzu
function populateTeamsForPlayer() {
  selectTeamForPlayer.innerHTML = '<option value="">-- wybierz --</option>';
  teams.forEach(team => {
    const option = document.createElement('option');
    option.value = team.id || team.name; // ważne, żeby była unikalna wartość (np. id)
    option.textContent = team.name;
    selectTeamForPlayer.appendChild(option);
  });
}

// Wołaj po załadowaniu drużyn
populateTeamsForPlayer();

addPlayerForm.addEventListener('submit', e => {
  e.preventDefault();
  addPlayerMessage.textContent = '';

  const teamId = selectTeamForPlayer.value;
  const playerName = playerNameInput.value.trim();

  if (!teamId || !playerName) {
    addPlayerMessage.style.color = 'red';
    addPlayerMessage.textContent = 'Wybierz drużynę i wpisz nazwisko zawodnika.';
    return;
  }

  // Znajdź drużynę w teams po ID
  const team = teams.find(t => (t.id || t.name) === teamId);
  if (!team) {
    addPlayerMessage.style.color = 'red';
    addPlayerMessage.textContent = 'Wybrana drużyna nie istnieje.';
    return;
  }

  // Pobierz aktualną listę zawodników z Firebase (bezpośrednio z bazy)
  const teamRef = db.ref('teams/' + teamId);

  teamRef.once('value')
    .then(snapshot => {
      const teamData = snapshot.val();
      let players = teamData.players || [];

      // Sprawdź, czy zawodnik już jest na liście
      if (players.some(p => p.name.toLowerCase() === playerName.toLowerCase())) {
        addPlayerMessage.style.color = 'red';
        addPlayerMessage.textContent = 'Zawodnik o tym nazwisku już jest w drużynie.';
        throw new Error('Duplikat zawodnika');
      }

      // Dodaj zawodnika
      players.push({ name: playerName });

      // Zapisz zaktualizowaną listę
      return teamRef.update({ players });
    })
    .then(() => {
      addPlayerMessage.style.color = 'green';
      addPlayerMessage.textContent = 'Zawodnik dodany do drużyny!';
      addPlayerForm.reset();
      loadData();  // odśwież dane i listy
    })
    .catch(err => {
      if (err.message !== 'Duplikat zawodnika') {
        addPlayerMessage.style.color = 'red';
        addPlayerMessage.textContent = 'Błąd dodawania zawodnika: ' + err.message;
      }
    });
});
