const playerStatsDiv = document.getElementById('playerStats');
const avgTrainingSpan = document.getElementById('avgTraining');
const avgMatchSpan = document.getElementById('avgMatch');
const totalPlayTimeSpan = document.getElementById('totalPlayTime');
const totalGoalsSpan = document.getElementById('totalGoals');

selectPlayer.addEventListener('change', () => {
  const playerName = selectPlayer.value;
  const teamId = selectTeam.value;
  if (!playerName || !teamId) {
    playerStatsDiv.style.display = 'none';
    return;
  }

  // Filtruj oceny zawodnika
  const playerRatings = ratings.filter(r => r.teamId === teamId && r.playerName === playerName);
  if (playerRatings.length === 0) {
    playerStatsDiv.style.display = 'block';
    avgTrainingSpan.textContent = '-';
    avgMatchSpan.textContent = '-';
    totalPlayTimeSpan.textContent = '0';
    totalGoalsSpan.textContent = '0';
    return;
  }

  // Oblicz średnie oceny i sumę czasu
  const avgTraining = (playerRatings.reduce((sum, r) => sum + r.trainingRating, 0) / playerRatings.length).toFixed(2);
  const avgMatch = (playerRatings.reduce((sum, r) => sum + r.matchRating, 0) / playerRatings.length).toFixed(2);
  const totalPlayTime = playerRatings.reduce((sum, r) => sum + (r.playTime || 0), 0);

  // Oblicz liczbę bramek z meczy (z `matches` i ich playersDetails)
  let totalGoals = 0;
  matches.forEach(match => {
    if (match.playersDetails && match.playersDetails.length > 0) {
      match.playersDetails.forEach(pd => {
        if (pd.playerName === playerName && pd.matchRating !== null) {
          // Załóżmy, że bramki liczymy jako strzelcy z pola scorersJaguar lub scorersOpponent
          // Sprawdź ile razy zawodnik jest w listach strzelców w tym meczu
          const scoredJaguar = match.scorersJaguar.filter(s => s === playerName).length;
          const scoredOpponent = match.scorersOpponent.filter(s => s === playerName).length;
          totalGoals += scoredJaguar + scoredOpponent;
        }
      });
    }
  });

  playerStatsDiv.style.display = 'block';
  avgTrainingSpan.textContent = avgTraining;
  avgMatchSpan.textContent = avgMatch;
  totalPlayTimeSpan.textContent = totalPlayTime;
  totalGoalsSpan.textContent = totalGoals;
});
