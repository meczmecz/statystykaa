(() => {
  const STORAGE_KEYS = {
    matches: 'matches',
    teams: 'teams',
    players: 'players',
    ratings: 'ratings'
  };

  let matches = JSON.parse(localStorage.getItem(STORAGE_KEYS.matches)) || [];
  let teams = JSON.parse(localStorage.getItem(STORAGE_KEYS.teams)) || [];
  let players = JSON.parse(localStorage.getItem(STORAGE_KEYS.players)) || [];
  let ratings = JSON.parse(localStorage.getItem(STORAGE_KEYS.ratings)) || [];

  // --- TABY ---
  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');

  function activateTab(tabName) {
    tabs.forEach(t => {
      if (t.dataset.tab === tabName) t.classList.add('active');
      else t.classList.remove('active');
    });
    tabContents.forEach(tc => {
      if (tc.id === tabName) tc.classList.add('active');
      else tc.classList.remove('active');
    });
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => activateTab(tab.dataset.tab));
  });

  // --- MECZE ---
  const matchForm = document.getElementById('matchForm');
  const matchDateInput = document.getElementById('matchDate');
  const homeTeamSelect = document.getElementById('homeTeam');
  const awayTeamSelect = document.getElementById('awayTeam');
  const homeScoreInput = document.getElementById('homeScore');
  const awayScoreInput = document.getElementById('awayScore');
  const matchesList = document.getElementById('matchesList');

  function renderMatches() {
    matchesList.innerHTML = '';
    matches.forEach((m, i) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${m.date}</td>
        <td>${m.homeTeam}</td>
        <td>${m.awayTeam}</td>
        <td style="text-align:center;">${m.homeScore}</td>
        <td style="text-align:center;">${m.awayScore}</td>
        <td style="text-align:center;">
          <button class="edit-match btn" data-index="${i}">✏️</button>
          <button class="delete-match btn bg-red-600" data-index="${i}">🗑️</button>
        </td>
      `;
      matchesList.appendChild(tr);
    });

    document.querySelectorAll('.edit-match').forEach(btn => {
      btn.onclick = () => {
        const idx = +btn.dataset.index;
        const m = matches[idx];
        matchDateInput.value = m.date;
        homeTeamSelect.value = m.homeTeam;
        awayTeamSelect.value = m.awayTeam;
        homeScoreInput.value = m.homeScore;
        awayScoreInput.value = m.awayScore;
        matchForm.dataset.editIndex = idx;
        activateTab('matches');
      };
    });

    document.querySelectorAll('.delete-match').forEach(btn => {
      btn.onclick = () => {
        const idx = +btn.dataset.index;
        if (confirm('Na pewno usunąć ten mecz?')) {
          matches.splice(idx, 1);
          saveData();
          renderMatches();
        }
      };
    });
  }

  matchForm.addEventListener('submit', e => {
    e.preventDefault();
    const newMatch = {
      date: matchDateInput.value,
      homeTeam: homeTeamSelect.value,
      awayTeam: awayTeamSelect.value,
      homeScore: +homeScoreInput.value,
      awayScore: +awayScoreInput.value
    };

    if(newMatch.homeTeam === newMatch.awayTeam) {
      return alert('Drużyny muszą być różne');
    }
    if(!newMatch.date) return alert('Data jest wymagana');

    if(matchForm.dataset.editIndex !== undefined) {
      matches[+matchForm.dataset.editIndex] = newMatch;
      delete matchForm.dataset.editIndex;
    } else {
      matches.push(newMatch);
    }
    saveData();
    renderMatches();
    matchForm.reset();
  });

  // --- DRUŻYNY ---
  const teamForm = document.getElementById('teamForm');
  const teamNameInput = document.getElementById('teamName');
  const teamsListDiv = document.getElementById('teamsList');

  function renderTeams() {
    teamsListDiv.innerHTML = '';
    teams.forEach((t, i) => {
      const div = document.createElement('div');
      div.className = 'mb-4 border p-2 rounded';

      const teamHeader = document.createElement('h4');
      teamHeader.textContent = t.name;
      teamHeader.className = 'text-lg font-semibold mb-2';
      div.appendChild(teamHeader);

      const btnEdit = document.createElement('button');
      btnEdit.textContent = '✏️ Edytuj';
      btnEdit.className = 'btn mr-2';
      btnEdit.onclick = () => {
        teamNameInput.value = t.name;
        teamForm.dataset.editIndex = i;
        activateTab('teams');
      };
      div.appendChild(btnEdit);

      const btnDelete = document.createElement('button');
      btnDelete.textContent = '🗑️ Usuń';
      btnDelete.className = 'btn bg-red-600';
      btnDelete.onclick = () => {
        if(confirm('Na pewno usunąć tę drużynę?')) {
          teams.splice(i, 1);
          // Usunięcie powiązanych zawodników
          players = players.filter(p => p.team !== t.name);
          saveData();
          renderTeams();
          renderPlayers();
          populateTeamsDropdown();
          populatePlayersDropdown();
        }
      };
      div.appendChild(btnDelete);

      // Lista zawodników drużyny
      const playersInTeam = players.filter(p => p.team === t.name);
      if(playersInTeam.length > 0) {
        const ul = document.createElement('ul');
        ul.style.cssText = 'margin:0; padding-left:1.25rem;';
        playersInTeam.forEach(p => {
          const li = document.createElement('li');
          li.textContent = p.name;
          ul.appendChild(li);
        });
        div.appendChild(ul);
      }

      teamsListDiv.appendChild(div);
    });
  }

  teamForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = teamNameInput.value.trim();
    if(!name) return alert('Nazwa drużyny jest wymagana');

    const newTeam = { name };

    if(teamForm.dataset.editIndex !== undefined) {
      teams[+teamForm.dataset.editIndex] = newTeam;
      delete teamForm.dataset.editIndex;
    } else {
      if(teams.some(t => t.name.toLowerCase() === name.toLowerCase())) {
        return alert('Drużyna o takiej nazwie już istnieje');
      }
      teams.push(newTeam);
    }
    saveData();
    renderTeams();
    populateTeamsDropdown();
    populateTeamSelectForRating();
    teamForm.reset();
  });

  // --- ZAWODNICY ---
  const playerForm = document.getElementById('playerForm');
  const playerNameInput = document.getElementById('playerName');
  const playerTeamSelect = document.getElementById('playerTeam');
  const playersList = document.getElementById('playersList');

  function renderPlayers() {
    playersList.innerHTML = '';
    players.forEach((p, i) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${p.name}</td>
        <td>${p.team}</td>
        <td style="text-align:center;">
          <button class="edit-player btn" data-index="${i}">✏️</button>
          <button class="delete-player btn bg-red-600" data-index="${i}">🗑️</button>
        </td>
      `;
      playersList.appendChild(tr);
    });

    document.querySelectorAll('.edit-player').forEach(btn => {
      btn.onclick = () => {
        const idx = +btn.dataset.index;
        const p = players[idx];
        playerNameInput.value = p.name;
        playerTeamSelect.value = p.team;
        playerForm.dataset.editIndex = idx;
        activateTab('players');
      };
    });

    document.querySelectorAll('.delete-player').forEach(btn => {
      btn.onclick = () => {
        const idx = +btn.dataset.index;
        if(confirm('Na pewno usunąć tego zawodnika?')) {
          players.splice(idx, 1);
          saveData();
          renderPlayers();
          populatePlayersDropdown(playerTeamSelect.value);
          populatePlayersDropdown(ratingTeamSelect.value);
        }
      };
    });
  }

  playerForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = playerNameInput.value.trim();
    const team = playerTeamSelect.value;
    if(!name) return alert('Imię zawodnika jest wymagane');
    if(!team) return alert('Drużyna jest wymagana');

    const newPlayer = { name, team };

    if(playerForm.dataset.editIndex !== undefined) {
      players[+playerForm.dataset.editIndex] = newPlayer;
      delete playerForm.dataset.editIndex;
    } else {
      players.push(newPlayer);
    }
    saveData();
    renderPlayers();
    populatePlayersDropdown(ratingTeamSelect.value);
    playerForm.reset();
  });

  // --- OCENY ZAWODNIKÓW ---
  const ratingForm = document.getElementById('ratingForm');
  const ratingPlayerSelect = document.getElementById('ratingPlayer');
  const ratingTeamSelect = document.getElementById('ratingTeam');
  const ratingScoreInput = document.getElementById('ratingScore');
  const ratingDateInput = document.getElementById('ratingDate');
  const ratingTypeSelect = document.getElementById('ratingType');
  const ratingNotesInput = document.getElementById('ratingNotes');
  const ratingsList = document.getElementById('ratingsList');

  function populateTeamsDropdown() {
    [playerTeamSelect, ratingTeamSelect].forEach(select => {
      const current = select.value;
      select.innerHTML = '<option value="">-- wybierz drużynę --</option>';
      teams.forEach(t => {
        const option = document.createElement('option');
        option.value = t.name;
        option.textContent = t.name;
        select.appendChild(option);
      });
      if (teams.some(t => t.name === current)) select.value = current;
      else select.value = '';
    });
  }

  function populatePlayersDropdown(teamName = '') {
    ratingPlayerSelect.innerHTML = '<option value="">-- wybierz zawodnika --</option>';
    players
      .filter(p => !teamName || p.team === teamName)
      .forEach(p => {
        const option = document.createElement('option');
        option.value = p.name;
        option.textContent = p.name;
        ratingPlayerSelect.appendChild(option);
      });
  }

  ratingTeamSelect.addEventListener('change', () => {
    populatePlayersDropdown(ratingTeamSelect.value);
  });

  function renderRatings() {
    ratingsList.innerHTML = '';
    ratings.forEach((r, i) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${r.date}</td>
        <td>${r.team}</td>
        <td>${r.player}</td>
        <td>${r.type}</td>
        <td>${r.score}</td>
        <td>${r.notes || ''}</td>
        <td style="text-align:center;">
          <button class="edit-rating btn" data-index="${i}">✏️</button>
          <button class="delete-rating btn bg-red-600" data-index="${i}">🗑️</button>
        </td>
      `;
      ratingsList.appendChild(tr);
    });

    document.querySelectorAll('.edit-rating').forEach(btn => {
      btn.onclick = () => {
        const idx = +btn.dataset.index;
        const r = ratings[idx];
        ratingDateInput.value = r.date;
        ratingTeamSelect.value = r.team;
        populatePlayersDropdown(r.team);
        ratingPlayerSelect.value = r.player;
        ratingTypeSelect.value = r.type;
        ratingScoreInput.value = r.score;
        ratingNotesInput.value = r.notes || '';
        ratingForm.dataset.editIndex = idx;
        activateTab('ratings');
      };
    });

    document.querySelectorAll('.delete-rating').forEach(btn => {
      btn.onclick = () => {
        const idx = +btn.dataset.index;
        if(confirm('Na pewno usunąć tę ocenę?')) {
          ratings.splice(idx, 1);
          saveData();
          renderRatings();
        }
      };
    });
  }

  ratingForm.addEventListener('submit', e => {
    e.preventDefault();
    const newRating = {
      date: ratingDateInput.value,
      team: ratingTeamSelect.value,
      player: ratingPlayerSelect.value,
      type: ratingTypeSelect.value,
      score: +ratingScoreInput.value,
      notes: ratingNotesInput.value.trim()
    };

    if(ratingForm.dataset.editIndex !== undefined) {
      ratings[+ratingForm.dataset.editIndex] = newRating;
      delete ratingForm.dataset.editIndex;
    } else {
      ratings.push(newRating);
    }
    saveData();
    renderRatings();
    ratingForm.reset();
  });

  function saveData() {
    localStorage.setItem(STORAGE_KEYS.matches, JSON.stringify(matches));
    localStorage.setItem(STORAGE_KEYS.teams, JSON.stringify(teams));
    localStorage.setItem(STORAGE_KEYS.players, JSON.stringify(players));
    localStorage.setItem(STORAGE_KEYS.ratings, JSON.stringify(ratings));
  }

  function populateTeamSelectForRating() {
    populateTeamsDropdown();
    populatePlayersDropdown(ratingTeamSelect.value);
  }

  function init() {
    renderMatches();
    renderTeams();
    renderPlayers();
    renderRatings();
    populateTeamsDropdown();
  }

  init();

})();

