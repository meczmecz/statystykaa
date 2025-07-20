document.addEventListener("DOMContentLoaded", () => {
  // TABY
  const tabs = document.querySelectorAll("nav button");
  const sections = document.querySelectorAll("section");
  tabs.forEach((tab) =>
    tab.addEventListener("click", () => {
      const target = tab.dataset.tab;
      sections.forEach((sec) => (sec.style.display = sec.id === target ? "block" : "none"));
    })
  );
  tabs[0].click();

  // MODELE DANYCH
  let teams = [];
  let players = [];
  let matches = [];

  // ELEMENTY DRUŻYN
  const teamForm = document.getElementById("teamForm");
  const teamNameInput = document.getElementById("teamName");
  const teamList = document.getElementById("teamList");

  // ELEMENTY ZAWODNIKÓW
  const playerForm = document.getElementById("playerForm");
  const teamSelect = document.getElementById("teamSelect");
  const playerNameInput = document.getElementById("playerName");
  const playerList = document.getElementById("playerList");

  // ELEMENTY MECZÓW
  const matchForm = document.getElementById("matchForm");
  const matchTeamASelect = document.getElementById("matchTeamA");
  const matchTeamBInput = document.getElementById("matchTeamB");
  const matchDateInput = document.getElementById("matchDate");
  const matchScoreInput = document.getElementById("matchScore");
  const bestPlayerInput = document.getElementById("bestPlayer");
  const topPlayersAInput = document.getElementById("topPlayersA");
  const topPlayersBInput = document.getElementById("topPlayersB");
  const matchList = document.getElementById("matchList");

  // ANALIZA
  const analysisTeamSelect = document.getElementById("analysisTeamSelect");
  const analysisPlayerList = document.getElementById("analysisPlayerList");
  const trainingChart = document.getElementById("trainingChart").getContext("2d");
  const matchChart = document.getElementById("matchChart").getContext("2d");
  let trainingChartInstance = null;
  let matchChartInstance = null;

  // FUNKCJE POMOCNICZE
  function updateTeamSelects() {
    // Opróżnij wszystkie selecty drużyn
    [teamSelect, matchTeamASelect, analysisTeamSelect].forEach((select) => {
      select.innerHTML = "";
      teams.forEach((team) => {
        const opt = document.createElement("option");
        opt.value = team;
        opt.textContent = team;
        select.appendChild(opt);
      });
    });
  }

  function renderTeams() {
    teamList.innerHTML = "";
    teams.forEach((team) => {
      const li = document.createElement("li");
      li.textContent = team;
      teamList.appendChild(li);
    });
  }

  function renderPlayers() {
    playerList.innerHTML = "";
    players.forEach(({name, team}) => {
      const li = document.createElement("li");
      li.textContent = `${name} (${team})`;
      playerList.appendChild(li);
    });
  }

  function renderMatches() {
    matchList.innerHTML = "";
    matches.forEach(({teamA, teamB, date, score, bestPlayer, topPlayersA, topPlayersB}, i) => {
      const li = document.createElement("li");
      li.innerHTML = `<strong>${teamA}</strong> vs <strong>${teamB}</strong> - ${date} - wynik: ${score}<br>Najlepszy: ${bestPlayer || "-"}<br>Top 3 ${teamA}: ${topPlayersA || "-"}<br>Top 3 ${teamB}: ${topPlayersB || "-"}`;
      matchList.appendChild(li);
    });
  }

  // DODAJ DRUŻYNĘ
  teamForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const newTeam = teamNameInput.value.trim();
    if (newTeam && !teams.includes(newTeam)) {
      teams.push(newTeam);
      updateTeamSelects();
      renderTeams();
      teamNameInput.value = "";
    }
  });

  // DODAJ ZAWODNIKA
  playerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const team = teamSelect.value;
    const name = playerNameInput.value.trim();
    if (team && name) {
      players.push({ team, name });
      renderPlayers();
      playerNameInput.value = "";
    }
  });

  // DODAJ MECZ
  matchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const teamA = matchTeamASelect.value;
    const teamB = matchTeamBInput.value.trim();
    const date = matchDateInput.value;
    const score = matchScoreInput.value.trim();
    const bestPlayer = bestPlayerInput.value.trim();
    const topPlayersA = topPlayersAInput.value.trim();
    const topPlayersB = topPlayersBInput.value.trim();

    if (teamA && teamB && date && score) {
      matches.push({ teamA, teamB, date, score, bestPlayer, topPlayersA, topPlayersB });
      renderMatches();

      // Resetuj formularz
      matchTeamBInput.value = "";
      matchDateInput.value = "";
      matchScoreInput.value = "";
      bestPlayerInput.value = "";
      topPlayersAInput.value = "";
      topPlayersBInput.value = "";
    }
  });

  // ANALIZA ZAWODNIKÓW (prosta średnia wystąpień w meczach i top3)
  function analyzePlayers(team) {
    const teamPlayers = players.filter((p) => p.team === team);
    // Liczymy wystąpienia każdego zawodnika jako najlepszy, lub w top 3
    const stats = {};
    teamPlayers.forEach(({ name }) => {
      stats[name] = { bestPlayerCount: 0, topAppearances: 0 };
    });

    matches.forEach(({ bestPlayer, topPlayersA, topPlayersB, teamA }) => {
      // bestPlayer
      if (bestPlayer && stats[bestPlayer]) {
        stats[bestPlayer].bestPlayerCount++;
      }
      // topPlayersA i topPlayersB (lista rozdzielona przecinkami)
      if (teamA === team && topPlayersA) {
        topPlayersA.split(",").map(s => s.trim()).forEach(p => {
          if (stats[p]) stats[p].topAppearances++;
        });
      }
      if (teamA !== team && topPlayersB) {
        topPlayersB.split(",").map(s => s.trim()).forEach(p => {
          if (stats[p]) stats[p].topAppearances++;
        });
      }
    });

    return stats;
  }

  function renderAnalysis() {
    const team = analysisTeamSelect.value;
    if (!team) {
      analysisPlayerList.innerHTML = "";
      if (trainingChartInstance) trainingChartInstance.clear();
      if (matchChartInstance) matchChartInstance.clear();
      return;
    }

    const stats = analyzePlayers(team);
    analysisPlayerList.innerHTML = "";
    Object.entries(stats).forEach(([name, { bestPlayerCount, topAppearances }]) => {
      const li = document.createElement("li");
      li.textContent = `${name} - Najlepszy zawodnik: ${bestPlayerCount}, Top wystąpienia: ${topAppearances}`;
      analysisPlayerList.appendChild(li);
    });

    // Wykresy
    const names = Object.keys(stats);
    const bestCounts = names.map((n) => stats[n].bestPlayerCount);
    const topCounts = names.map((n) => stats[n].topAppearances);

    // Usuwamy stare wykresy
    if (trainingChartInstance) trainingChartInstance.destroy();
    if (matchChartInstance) matchChartInstance.destroy();

    trainingChartInstance = new Chart(trainingChart, {
      type: "bar",
      data: {
        labels: names,
        datasets: [{
          label: "Najlepszy zawodnik",
          data: bestCounts,
          backgroundColor: "rgba(75, 192, 192, 0.6)"
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });

    matchChartInstance = new Chart(matchChart, {
      type: "bar",
      data: {
        labels: names,
        datasets: [{
          label: "Top 3 wystąpienia",
          data: topCounts,
          backgroundColor: "rgba(153, 102, 255, 0.6)"
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }

  analysisTeamSelect.addEventListener("change", renderAnalysis);

  // Inicjalizacja
  updateTeamSelects();
  renderTeams();
  renderPlayers();
  renderMatches();
});
