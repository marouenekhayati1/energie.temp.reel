const ctx = document.getElementById("energyChart");

// historique stocké
let history = JSON.parse(localStorage.getItem("energyHistory")) || {
  labels: [],        // HEURE SEULE
  dates: [],         // DATE SÉPARÉE
  consumption: [],
  production: []
};

function addData() {
  const now = new Date();

  const heure = now.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit"
  });

  const date = now.toLocaleDateString("fr-FR");

  history.labels.push(heure);   // ⚠️ PAS DE \n
  history.dates.push(date);     // date stockée à part

  history.consumption.push(Math.floor(Math.random() * 400 + 200));
  history.production.push(Math.floor(Math.random() * 400 + 100));

  if (history.labels.length > 20) {
    history.labels.shift();
    history.dates.shift();
    history.consumption.shift();
    history.production.shift();
  }

  localStorage.setItem("energyHistory", JSON.stringify(history));
}

const chart = new Chart(ctx, {
  type: "line",
  data: {
    labels: history.labels,
    datasets: [
      {
        label: "Consommation",
        data: history.consumption,
        borderColor: "red",
        fill: false,
        tension: 0.2
      },
      {
        label: "Production",
        data: history.production,
        borderColor: "green",
        fill: false,
        tension: 0.2
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          title: (items) => {
            const index = items[0].dataIndex;
            return history.labels[index]; // heure
          },
          afterTitle: (items) => {
            const index = items[0].dataIndex;
            return history.dates[index]; // date EN DESSOUS
          }
        }
      },
      legend: {
        labels: { color: "white" }
      }
    },
    scales: {
      x: {
        ticks: { color: "white" },
        grid: { color: "#1e293b" }
      },
      y: {
        ticks: { color: "white" },
        grid: { color: "#1e293b" }
      }
    }
  }
});

// ajout automatique
setInterval(() => {
  addData();
  chart.data.labels = history.labels;
  chart.data.datasets[0].data = history.consumption;
  chart.data.datasets[1].data = history.production;
  chart.update();
}, 10000);
