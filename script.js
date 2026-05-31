const ctx = document.getElementById("chart");

// stockage historique
let history = JSON.parse(localStorage.getItem("history")) || {
  labels: [],   // heure seulement
  dates: [],    // date séparée
  conso: [],
  prod: []
};

function addPoint() {
  const now = new Date();

  const heure = now.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit"
  });

  const date = now.toLocaleDateString("fr-FR");

  history.labels.push(heure);
  history.dates.push(date);

  // données test
  history.conso.push(Math.floor(Math.random() * 500 + 200));
  history.prod.push(Math.floor(Math.random() * 500 + 100));

  if (history.labels.length > 20) {
    history.labels.shift();
    history.dates.shift();
    history.conso.shift();
    history.prod.shift();
  }

  localStorage.setItem("history", JSON.stringify(history));
}

const chart = new Chart(ctx, {
  type: "line",
  data: {
    labels: history.labels,
    datasets: [
      {
        label: "Consommation",
        data: history.conso,
        borderColor: "red",
        fill: false,
        tension: 0,                 // 🔥 IMPORTANT
        stepped: false,
        cubicInterpolationMode: "default"
      },
      {
        label: "Production",
        data: history.prod,
        borderColor: "green",
        fill: false,
        tension: 0,                 // 🔥 IMPORTANT
        stepped: false,
        cubicInterpolationMode: "default"
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
      tooltip: {
        callbacks: {
          title: (items) => {
            const i = items[0].dataIndex;
            return history.labels[i]; // heure
          },
          afterTitle: (items) => {
            const i = items[0].dataIndex;
            return history.dates[i]; // date dessous
          }
        }
      },
      legend: {
        labels: { color: "white" }
      }
    },
    scales: {
      x: { ticks: { color: "white" } },
      y: { ticks: { color: "white" } }
    }
  }
});

// update régulier
setInterval(() => {
  addPoint();
  chart.data.labels = history.labels;
  chart.data.datasets[0].data = history.conso;
  chart.data.datasets[1].data = history.prod;
  chart.update();
}, 5000);
