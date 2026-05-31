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

/* ===============================
   HISTORIQUE (persistant)
================================ */
let history = JSON.parse(localStorage.getItem("watt_history") || "[]");

/* ===============================
   CHART
================================ */
const ctx = document.getElementById("chart").getContext("2d");

const chart = new Chart(ctx, {
  type: "line",
  data: {
    labels: [],
    datasets: [
      {
        label: "Consommation (kW)",
        data: [],
        borderColor: "#ef4444",
        tension: 0.4,
        fill: false
      },
      {
        label: "Production (kW)",
        data: [],
        borderColor: "#22c55e",
        tension: 0.4,
        fill: false
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: {
          color: "white",
          maxRotation: 0,
          autoSkip: true
        }
      },
      y: {
        ticks: { color: "white" }
      }
    },
    plugins: {
      legend: {
        labels: { color: "white" }
      }
    }
  }
});

/* ===============================
   RESTORE HISTORY
================================ */
history.forEach(h => {
  chart.data.labels.push([h.time, h.date]);
  chart.data.datasets[0].data.push(h.conso);
  chart.data.datasets[1].data.push(h.prod);
});

chart.update();

/* ===============================
   HELPERS
================================ */
function toKw(v) {
  return v ? parseFloat(v) / 1000 : 0;
}

function getDateTime() {
  const d = new Date();

  const time =
    d.getHours().toString().padStart(2, "0") + ":" +
    d.getMinutes().toString().padStart(2, "0") + ":" +
    d.getSeconds().toString().padStart(2, "0");

  const date =
    d.getFullYear() + "-" +
    (d.getMonth() + 1).toString().padStart(2, "0") + "-" +
    d.getDate().toString().padStart(2, "0");

  return { time, date };
}

function saveHistory(entry) {
  history.push(entry);
  if (history.length > 50) history.shift();
  localStorage.setItem("watt_history", JSON.stringify(history));
}

/* ===============================
   MAIN LOOP
================================ */
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
      map[id] = toKw(val);
    });

    const g1 = map["W3pGNRR01016"] || 0;
    const g2 = map["W3pGNRR01017"] || 0;
    const randa = map["W3pGNRR01014"] || 0;
    const bvm = map["W3pGNRR01015"] || 0;
    const smt = map["W3pGNRR01013"] || 0;
    const aux = (map["W3pGNRR01012"] || 0) * 2;

    const conso = randa + bvm + smt + aux;
    const prod = g1 + g2;
    const delta = prod - conso;

    document.getElementById("conso").innerText = conso.toFixed(2);
    document.getElementById("prod").innerText = prod.toFixed(2);
    document.getElementById("delta").innerText = delta.toFixed(2);

    // Devices
    let html = "";
    ORDER.forEach(id => {
      let v = map[id] || 0;
      if (id === "W3pGNRR01012") v *= 2;

      html += `
        <div class="device">
          <b>${NAME[id]}</b><br/>
          ${v.toFixed(2)} kW
        </div>
      `;
    });
    document.getElementById("devices").innerHTML = html;

    // GRAPH
    const { time, date } = getDateTime();

    chart.data.labels.push([time, date]);
    chart.data.datasets[0].data.push(conso);
    chart.data.datasets[1].data.push(prod);

    if (chart.data.labels.length > 40) {
      chart.data.labels.shift();
      chart.data.datasets[0].data.shift();
      chart.data.datasets[1].data.shift();
    }

    chart.update();

    saveHistory({ time, date, conso, prod });

  } catch (e) {
    console.log("API ERROR:", e);
  }
}

load();
setInterval(load, 5000);
