const addPlayerForm = document.getElementById('addPlayerForm');
const selectTeamForPlayer = document.getElementById('selectTeamForPlayer');
const playerNameInput = document.getElementById('playerName');

// Wypełnij select drużynami (powtarzamy to samo co w selectTeam, można wydzielić do funkcji)
function populateTeamsForPlayer() {
  selectTeamForPlayer.innerHTML = '<option value="">Wybierz drużynę</option>';
  teams.forEach(t => {
    const option = document.createElement('option');
    option.value = t.id || t.name;
    option.textContent = t.name;
    selectTeamForPlayer.appendChild(option);
  });
}
populateTeamsForPlayer();

// Obsługa formularza dodawania zawodnika
addPlayerForm.addEventListener('submit', e => {
  e.preventDefault();

  const teamId = selectTeamForPlayer.value;
  const playerName = playerNameInput.value.trim();

  if (!teamId || !playerName) {
    alert('Proszę wybrać drużynę i wpisać nazwisko zawodnika.');
    return;
  }

  // Pobierz referencję do drużyny w bazie Firebase
  const teamRef = db.ref('teams/' + teamId);

  // Najpierw pobierz aktualną listę zawodników i dopisz nowego
  teamRef.once('value').then(snapshot => {
    const teamData = snapshot.val();
    if (!teamData) {
      alert('Nie znaleziono drużyny.');
      return;
    }
    
    let players = teamData.players || [];
    // Sprawdź czy zawodnik już nie istnieje
    if (players.some(p => p.name.toLowerCase() === playerName.toLowerCase())) {
      alert('Zawodnik o takim nazwisku już istnieje w tej drużynie.');
      return;
    }

    players.push({ name: playerName });

    // Zapisz zaktualizowaną listę zawodników
    return teamRef.update({ players });
  }).then(() => {
    alert('Zawodnik dodany do drużyny!');
    addPlayerForm.reset();
    // Odśwież listę drużyn (opcjonalnie)
    loadTeams(); // jeśli masz taką funkcję do wczytywania drużyn
    populateTeamsForPlayer();
  }).catch(err => {
    alert('Błąd podczas dodawania zawodnika: ' + err.message);
  });
});
