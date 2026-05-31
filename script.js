const ctx = document.getElementById("energyChart").getContext("2d");

// Charger historique
let history = JSON.parse(localStorage.getItem("energyHistory")) || {
  labels: [],
  consumption: [],
  production: []
};

// Générer date + heure
function getDateTimeLabel() {
  const now = new Date();

  const heure = now.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit"
  });

  const date = now.toLocaleDateString("fr-FR");

  return `${heure}\n${date}`;
}

// Ajouter nouvelles valeurs
function addData() {
  const consommation = Math.floor(Math.random() * 400 + 200);
  const production = Math.floor(Math.random() * 400 + 100);

  history.labels.push(getDateTimeLabel());
  history.consumption.push(consommation);
  history.production.push(production);

  // limiter historique
  if (history.labels.length > 20) {
    history.labels.shift();
    history.consumption.shift();
    history.production.shift();
  }

  localStorage.setItem("energyHistory", JSON.stringify(history));
}

// Créer chart
const chart = new Chart(ctx, {
  type: "line",
  data: {
    labels: history.labels,
    datasets: [
      {
        label: "Consommation",
        data: history.consumption,
        borderColor: "red",
        backgroundColor: "transparent",
        borderWidth: 2,
        tension: 0.2,
        fill: false
      },
      {
        label: "Production",
        data: history.production,
        borderColor: "green",
        backgroundColor: "transparent",
        borderWidth: 2,
        tension: 0.2,
        fill: false
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "white"
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: "white",
          callback: function(value) {
            const label = this.getLabelForValue(value);
            return label.split("\n");
          }
        },
        grid: {
          color: "#1e293b"
        }
      },
      y: {
        ticks: {
          color: "white"
        },
        grid: {
          color: "#1e293b"
        }
      }
    }
  }
});

// Ajouter une nouvelle valeur toutes les 10s
setInterval(() => {
  addData();
  chart.data.labels = history.labels;
  chart.data.datasets[0].data = history.consumption;
  chart.data.datasets[1].data = history.production;
  chart.update();
}, 10000);
