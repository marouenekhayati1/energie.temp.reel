const USER_ID = "us-east-1:2e44f066-1ee0-4353-9885-97ee102980bc";
const TOKEN = "PUT_YOUR_TOKEN";
const DEVICEKEY = "PUT_YOUR_DEVICE_KEY";

const URL =
`https://325qd9g4o9.execute-api.us-east-2.amazonaws.com/dev/apis.wattnow.io/dashboard/realtime/devices/lastValuesByDeviceType/${USER_ID}/${USER_ID}/tri`;

const ORDER = [
  "W3pGNRR01016",
  "W3pGNRR01017",
  "W3pGNRR01014",
  "W3pGNRR01015",
  "W3pGNRR01013",
  "W3pGNRR01012"
];

const NAME = {
  W3pGNRR01016: "Groupe 1",
  W3pGNRR01017: "Groupe 2",
  W3pGNRR01014: "Randa",
  W3pGNRR01015: "BVM",
  W3pGNRR01013: "SMT",
  W3pGNRR01012: "Auxiliaire"
};

// 🔥 HISTORIQUE (persistant)
let history = JSON.parse(localStorage.getItem("watt_history") || "[]");

// 📊 CHART
const ctx = document.getElementById("chart").getContext("2d");

const chart = new Chart(ctx, {
  type: "line",
  data: {
    labels: [],
    datasets: [
      {
        label: "Consommation",
        data: [],
        borderColor: "#ef4444",
        tension: 0.4,
        fill: false
      },
      {
        label: "Production",
        data: [],
        borderColor: "#22c55e",
        tension: 0.4,
        fill: false
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false
  }
});

// 🔁 charger historique au start
history.forEach(h => {
  chart.data.labels.push(h.time);
  chart.data.datasets[0].data.push(h.conso);
  chart.data.datasets[1].data.push(h.prod);
});

chart.update();

// ⚡ conversion
function toKw(v) {
  return v ? parseFloat(v) / 1000 : 0;
}

// 💾 save history
function saveHistory(conso, prod, time) {
  history.push({ time, conso, prod });

  if (history.length > 50) history.shift();

  localStorage.setItem("watt_history", JSON.stringify(history));
}

// 🕒 date + heure format
function getTime() {
  const now = new Date();

  return (
    now.getDate().toString().padStart(2, "0") + "/" +
    (now.getMonth() + 1).toString().padStart(2, "0") + " " +
    now.getHours().toString().padStart(2, "0") + ":" +
    now.getMinutes().toString().padStart(2, "0") + ":" +
    now.getSeconds().toString().padStart(2, "0")
  );
}

// 🚀 MAIN LOOP
async function load() {
  try {
    const res = await fetch(URL, {
      headers: {
        accesstoken: TOKEN,
        devicekey: DEVICEKEY,
        userregion: "us-east-2"
      }
    });

    const raw = await res.json();

    const map = {};

    raw.forEach(d => {
      const id = d.deviceId || d.device_id;
      const val = d.all_value || d.value || 0;
      map[id] = to
