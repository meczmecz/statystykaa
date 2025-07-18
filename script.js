// --- ZAKŁADKI ---
function showTab(id) {
  document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'))
  document.getElementById(id).classList.add('active')
}

// --- ANALIZA MECZÓW ---
const matchForm = document.getElementById('matchForm')
const matchList = document.getElementById('matchList')

matchForm.onsubmit = function (e) {
  e.preventDefault()
  const match = {
    date: matchDate.value,
    opponents: opponents.value,
    score: score.value,
    rating: matchRating.value,
    scorers: scorers.value,
    bestPlayer: bestPlayer.value,
    top3Jaguar: top3Jaguar.value,
    top3Opponents: top3Opponents.value,
    description: matchDescription.value
  }
  const matches = JSON.parse(localStorage.getItem('matches') || '[]')
  matches.push(match)
  localStorage.setItem('matches', JSON.stringify(matches))
  renderMatches()
  matchForm.reset()
}

function renderMatches() {
  const matches = JSON.parse(localStorage.getItem('matches') || '[]')
  matchList.innerHTML = ''
  matches.forEach(m => {
    const div = document.createElement('div')
    div.className = 'box'
    div.innerHTML = `
      <strong>${m.date}</strong> – ${m.opponents} (${m.score})<br>
      Ocena: ${m.rating}/5<br>
      Strzelcy: ${m.scorers}<br>
      MVP: ${m.bestPlayer}<br>
      Top 3 Jaguar: ${m.top3Jaguar}<br>
      Top 3 Przeciwnik: ${m.top3Opponents}<br>
      Opis: ${m.description || '-'}
    `
    matchList.appendChild(div)
  })
}

renderMatches()

// --- DRUŻYNY I ZAWODNICY ---
const teamForm = document.getElementById('teamForm')
const teamList = document.getElementById('teamList')
const playerSelect = document.getElementById('playerSelect')

teamForm.onsubmit = function (e) {
  e.preventDefault()
  const name = teamName.value
  const teams = JSON.parse(localStorage.getItem('teams') || '[]')
  teams.push({ name, players: [] })
  localStorage.setItem('teams', JSON.stringify(teams))
  teamForm.reset()
  renderTeams()
}

function renderTeams() {
  const teams = JSON.parse(localStorage.getItem('teams') || '[]')
  teamList.innerHTML = ''
  playerSelect.innerHTML = ''
  teams.forEach((t, i) => {
    const div = document.createElement('div')
    div.className = 'box'
    div.innerHTML = `<strong>${t.name}</strong><br>
      <input type="text" id="p-${i}" placeholder="Dodaj zawodnika" />
      <button onclick="addPlayer(${i})">Dodaj</button>
      <ul id="players-${i}"></ul>
    `
    teamList.appendChild(div)

    const playerList = document.getElementById(`players-${i}`)
    t.players.forEach(p => {
      const li = document.createElement('li')
      li.textContent = p
      playerList.appendChild(li)

      const option = document.createElement('option')
      option.value = p
      option.text = p
      playerSelect.appendChild(option)
    })
  })
}

function addPlayer(teamIndex) {
  const teams = JSON.parse(localStorage.getItem('teams') || '[]')
  const input = document.getElementById(`p-${teamIndex}`)
  const name = input.value
  if (!name) return
  teams[teamIndex].players.push(name)
  localStorage.setItem('teams', JSON.stringify(teams))
  renderTeams()
}

renderTeams()

// --- STATYSTYKI ZAWODNIKA ---
const ratingForm = document.getElementById('ratingForm')
const ratingOutput = document.getElementById('ratingOutput')
const chartCanvas = document.getElementById('chartCanvas')
const ctx = chartCanvas.getContext('2d')

ratingForm.onsubmit = function (e) {
  e.preventDefault()
  const player = playerSelect.value
  const data = {
    date: ratingDate.value,
    type: ratingType.value,
    rating: Number(ratingValue.value),
    minutes: Number(minutesPlayed.value) || 0
  }
  const all = JSON.parse(localStorage.getItem('ratings') || '{}')
  if (!all[player]) all[player] = []
  all[player].push(data)
  localStorage.setItem('ratings', JSON.stringify(all))
  ratingForm.reset()
  showStats(player)
}

function showStats(player) {
  const all = JSON.parse(localStorage.getItem('ratings') || '{}')
  const data = all[player] || []
  let avg = 0
  if (data.length) {
    avg = data.reduce((sum, d) => sum + d.rating, 0) / data.length
  }
  ratingOutput.innerHTML = `Średnia ocen ${player}: ${avg.toFixed(2)}`
}

function drawChart() {
  const player = playerSelect.value
  const all = JSON.parse(localStorage.getItem('ratings') || '{}')
  const data = all[player] || []

  ctx.clearRect(0, 0, chartCanvas.width, chartCanvas.height)
  if (data.length === 0) return

  const maxRating = 5
  const spacing = 600 / (data.length + 1)

  ctx.beginPath()
  ctx.moveTo(0, 300 - (data[0].rating / maxRating * 300))
  data.forEach((d, i) => {
    const x = (i + 1) * spacing
    const y = 300 - (d.rating / maxRating * 300)
    ctx.lineTo(x, y)
    ctx.arc(x, y, 3, 0, Math.PI * 2)
  })
  ctx.stroke()
}
