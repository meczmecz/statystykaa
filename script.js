document.addEventListener("DOMContentLoaded", () => {
  // Zakładki
  const tabs = document.querySelectorAll(".tab");
  const contents = document.querySelectorAll(".tab-content");
  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      contents.forEach(c => c.classList.remove("active"));
      tab.classList.add("active");
      contents[i].classList.add("active");
    });
  });

  // Dane
  const teams = [];
  const players = [];
  const matches = [];

  // Formularze
  const teamForm = document.getElementById("teamForm");
  const playerForm = document.getElementById("playerForm");
  const matchForm = document.getElementById("matchForm");

  // Listy wyświetlania
  const teamList = document.getElementById("teamList");
  const playerList = document.getElementById("playerList");
  const matchList = document.getElementById("matchList");

  // Selecty w formularzu meczu
  const matchTeam1 = document.getElementById("matchTeam1");
  const matchTeam2 = document.getElementById("matchTeam2");
  const matchBestPlayer = document.getElementById("matchBestPlayer");
  const matchTop3Player1 = document.getElementById("matchTop3Player1");
  const matchTop3Player2 = document.getElementById("matchTop3Player2");
  const matchTop3Player3 = document.getElementById("matchTop3Player3");

  // Aktualizacja selectów drużyn w formularzu meczu
  function updateTeamSelects() {
    [matchTeam1, matchTeam2].forEach(select => {
      select.innerHTML = '<option value="">-- Wybierz drużynę --</option>';
      teams.forEach(t => {
        const option = document.createElement("option");
        option.value = t.id;
        option.textContent = t.name;
        select.appendChild(option);
      });
    });
  }

  // Aktualizacja selectów zawodników w formularzu meczu (zawodnicy z wybranej drużyny)
  function updatePlayerSelects() {
    // Funkcja pomocnicza, aby podmienić opcje selecta dla zawodników z wybranej drużyny
    function updatePlayerSelect(select, teamId) {
      select.innerHTML = '<option value="">-- Wybierz zawodnika --</option>';
      if (!teamId) return;
      players.filter(p => p.teamId === teamId).forEach(p => {
        const option = document.createElement("option");
        option.value = p.id;
        option.textContent = p.name;
        select.appendChild(option);
      });
    }

    updatePlayerSelect(matchBestPlayer, matchTeam1.value);
    updatePlayerSelect(matchTop3Player1, matchTeam1.value);
    updatePlayerSelect(matchTop3Player2, matchTeam1.value);
    updatePlayerSelect(matchTop3Player3, matchTeam1.value);
  }

  // Po wybraniu drużyny 1 aktualizuj zawodników
  matchTeam1.addEventListener("change", () => {
    updatePlayerSelects();
  });

  // Dodaj drużynę
  teamForm.addEventListener("submit", e => {
    e.preventDefault();
    const name = teamForm.elements["teamName"].value.trim();
    if (!name) return alert("Podaj nazwę drużyny");
    if (teams.find(t => t.name.toLowerCase() === name.toLowerCase())) {
      return alert("Drużyna o takiej nazwie już istnieje");
    }
    const id = `team${Date.now()}`;
    teams.push({ id, name });
    renderTeams();
    updateTeamSelects();
    teamForm.reset();
  });

  function renderTeams() {
    teamList.innerHTML = "";
    teams.forEach(t => {
      const li = document.createElement("li");
      li.textContent = t.name;
      teamList.appendChild(li);
    });
  }

  // Dodaj zawodnika
  playerForm.addEventListener("submit", e => {
    e.preventDefault();
    const name = playerForm.elements["playerName"].value.trim();
    const teamId = playerForm.elements["playerTeam"].value;
    if (!name || !teamId) return alert("Podaj nazwę zawodnika i wybierz drużynę");
    if (players.find(p => p.name.toLowerCase() === name.toLowerCase() && p.teamId === teamId)) {
      return alert("Ten zawodnik już istnieje w tej drużynie");
    }
    const id = `player${Date.now()}`;
    players.push({ id, name, teamId });
    renderPlayers();
    playerForm.reset();
  });

  function renderPlayers() {
    playerList.innerHTML = "";
    players.forEach(p => {
      const teamName = teams.find(t => t.id === p.teamId)?.name || "Brak drużyny";
      const li = document.createElement("li");
      li.textContent = `${p.name} (${teamName})`;
      playerList.appendChild(li);
    });

    // Aktualizacja selecta drużyn w formularzu dodawania zawodnika
    const playerTeamSelect = playerForm.elements["playerTeam"];
    playerTeamSelect.innerHTML = '<option value="">-- Wybierz drużynę --</option>';
    teams.forEach(t => {
      const option = document.createElement("option");
      option.value = t.id;
      option.textContent = t.name;
      playerTeamSelect.appendChild(option);
    });

    // Aktualizacja selectów w formularzu meczu
    updateTeamSelects();
  }

  // Dodaj mecz
  matchForm.addEventListener("submit", e => {
    e.preventDefault();
    const team1 = matchTeam1.value;
    const team2 = matchTeam2.value;
    const bestPlayerId = matchBestPlayer.value;
    const top3Ids = [
      matchTop3Player1.value,
      matchTop3Player2.value,
      matchTop3Player3.value,
    ].filter(v => v !== "");

    if (!team1 || !team2 || team1 === team2) return alert("Wybierz dwie różne drużyny");
    if (!bestPlayerId) return alert("Wybierz najlepszego zawodnika");
    if (top3Ids.length < 3) return alert("Wybierz trzech zawodników do top 3");

    const id = `match${Date.now()}`;
    matches.push({
      id,
      team1,
      team2,
      bestPlayerId,
      top3Ids,
      date: new Date().toISOString(),
    });

    renderMatches();
    matchForm.reset();
  });

  function renderMatches() {
    matchList.innerHTML = "";
    matches.forEach(m => {
      const team1Name = teams.find(t => t.id === m.team1)?.name || "";
      const team2Name = teams.find(t => t.id === m.team2)?.name || "";
      const bestPlayerName = players.find(p => p.id === m.bestPlayerId)?.name || "";
      const top3Names = m.top3Ids
        .map(id => players.find(p => p.id === id)?.name || "")
        .join(", ");

      const li = document.createElement("li");
      li.textContent = `Mecz: ${team1Name} vs ${team2Name} | Najlepszy zawodnik: ${bestPlayerName} | Top 3: ${top3Names}`;
      matchList.appendChild(li);
    });

    updateAnalysis();
  }

  // Analiza zawodników - ile razy najlepszy i w top 3
  const analysisBest = document.getElementById("analysisBest");
  const analysisTop3 = document.getElementById("analysisTop3");
  const ctxBest = document.getElementById("chartBest").getContext("2d");
  const ctxTop3 = document.getElementById("chartTop3").getContext("2d");

  let chartBest, chartTop3;

  function updateAnalysis() {
    const bestCounts = {};
    const top3Counts = {};

    players.forEach(p => {
      bestCounts[p.name] = 0;
      top3Counts[p.name] = 0;
    });

    matches.forEach(m => {
      const bestPlayer = players.find(p => p.id === m.bestPlayerId);
      if (bestPlayer) bestCounts[bestPlayer.name]++;

      m.top3Ids.forEach(id => {
        const p = players.find(pl => pl.id === id);
        if (p) top3Counts[p.name]++;
      });
    });

    // Najlepszy zawodnik (max)
    let maxBest = 0;
    let maxBestPlayer = null;
    for (const [name, count] of Object.entries(bestCounts)) {
      if (count > maxBest) {
        maxBest = count;
        maxBestPlayer = name;
      }
    }

    // Top 3 - zawodnik z max wystąpień
    let maxTop3 = 0;
    let maxTop3Player = null;
    for (const [name, count] of Object.entries(top3Counts)) {
      if (count > maxTop3) {
        maxTop3 = count;
        maxTop3Player = name;
      }
    }

    analysisBest.textContent = maxBestPlayer
      ? `Najlepszy zawodnik (najwięcej razy w meczu najlepszy): ${maxBestPlayer} (${maxBest} razy)`
      : "Brak danych";

    analysisTop3.textContent = maxTop3Player
      ? `Najlepszy zawodnik (najwięcej razy w top 3): ${maxTop3Player} (${maxTop3} razy)`
      : "Brak danych";

    // Wykresy
    const names = Object.keys(bestCounts);
    const bestData = Object.values(bestCounts);
    const top3Data = Object.values(top3Counts);

    if (chartBest) chartBest.destroy();
    if (chartTop3) chartTop3.destroy();

    chartBest = new Chart(ctxBest, {
      type: "bar",
      data: {
        labels: names,
        datasets: [{
          label: "Liczba razy najlepszy",
          data: bestData,
          backgroundColor: "rgba(54, 162, 235, 0.7)"
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true, precision:0 }
        }
      }
    });

    chartTop3 = new Chart(ctxTop3, {
      type: "bar",
      data: {
        labels: names,
        datasets: [{
          label: "Liczba razy w top 3",
          data: top3Data,
          backgroundColor: "rgba(255, 159, 64, 0.7)"
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true, precision:0 }
        }
      }
    });
  }

  // Inicjalizacja
  renderTeams();
  renderPlayers();
  renderMatches();
  updateTeamSelects();

});

