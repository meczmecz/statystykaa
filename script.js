const form = document.getElementById('matchForm');
const list = document.getElementById('matchList');

form.addEventListener('submit', function (e) {
  e.preventDefault();

  const match = {
    date: document.getElementById('matchDate').value,
    result: document.getElementById('matchResult').value,
    scorers: document.getElementById('goalScorers').value,
    best: document.getElementById('bestPlayer').value,
    top3Jaguar: document.getElementById('top3Jaguar').value,
    top3Opponent: document.getElementById('top3Opponent').value,
    desc: document.getElementById('matchDesc').value,
    timestamp: new Date()
  };

  db.collection("matches").add(match).then(() => {
    showMatches();
    form.reset();
  });
});

function showMatches() {
  db.collection("matches").orderBy("timestamp", "desc").get().then((snapshot) => {
    list.innerHTML = "";
    snapshot.forEach((doc) => {
      const m = doc.data();
      const div = document.createElement('div');
      div.innerHTML = `
        <strong>${m.date}</strong>: ${m.result} <br>
        Strzelcy: ${m.scorers} <br>
        Najlepszy: ${m.best} <br>
        Top 3 Jaguar: ${m.top3Jaguar} <br>
        Top 3 przeciwnik: ${m.top3Opponent} <br>
        Opis: ${m.desc} <br><hr>
      `;
      list.appendChild(div);
    });
  });
}

showMatches();
s