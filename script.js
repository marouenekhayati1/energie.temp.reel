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

let history = JSON.parse(localStorage.getItem("watt_history") || "[]");

/* CHART */
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
        borderWidth: 2,
        tension: 0,
        pointRadius: 0
      },
      {
        label: "Production",
        data: [],
        borderColor: "#22c55e",
        borderWidth: 2,
        tension: 0,
        pointRadius: 0
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
      legend: { labels: { color: "white" } }
    },
    scales: {
      x: { ticks: { color: "white" } },
      y: { ticks: { color: "white" } }
    }
  }
});

/* restore history */
history.forEach(h => {
  chart.data.labels.push(h.time);
  chart.data.datasets[0].data.push(h.conso);
  chart.data.datasets[1].data.push(h.prod);
});

chart.update();

/* helpers */
function toKw(v) {
  return v ? parseFloat(v) / 1000 : 0;
}

function getTime() {
  return new Date().toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

function saveHistory(time, conso, prod) {
  history.push({ time, conso, prod });
  if (history.length > 50) history.shift();
  localStorage.setItem("watt_history", JSON.stringify(history));
}

/* STEG (inchangé) */
function getStegPeriod() {
  const h = new Date().getHours();
  const m = new Date().getMinutes();
  const t = h + m / 60;

  if (t >= 22 || t < 6.5)
    return { name: "Nuit", type: "offpeak" };

  if (t >= 6.5 && t < 11)
    return { name: "Matin", type: "normal" };

  if (t >= 11 && t < 15)
    return { name: "Pointe matin", type: "peak" };

  if (t >= 15 && t < 19)
    return { name: "Après-midi", type: "normal" };

  return { name: "Pointe soir", type: "peak" };
}

function updateStegUI() {
  const p = getStegPeriod();

  document.getElementById("stegStatus").innerText = p.name;

  const msg = document.getElementById("stegMessage");

  if (p.type === "peak") {
    msg.innerText = "⚠️ Pointe tarifaire – Démarrer les groupes en pleine charge";
    msg.style.color = "#ef4444";
  } else {
    msg.innerText = "✅ Suivre la consommation vs production";
    msg.style.color = "#22c55e";
  }
}

/* MAIN LOOP */
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
      map[id] = toKw(d.all_value || d.value || 0);
    });

    const get = id => map[id] || 0;

    const g1 = get("W3pGNRR01016");
    const g2 = get("W3pGNRR01017");
    const randa = get("W3pGNRR01014");
    const bvm = get("W3pGNRR01015");
    const smt = get("W3pGNRR01013");

    /* ✅ AUX DOUBLE ICI */
    const auxRaw = get("W3pGNRR01012");
    const aux = auxRaw * 2;

    const conso = randa + bvm + smt + aux;
    const prod = g1 + g2;
    const delta = prod - conso;

    document.getElementById("conso").innerText = `${conso.toFixed(2)} kW`;
    document.getElementById("prod").innerText = `${prod.toFixed(2)} kW`;
    document.getElementById("delta").innerText = `${delta.toFixed(2)} kW`;

    let html = "";

    ORDER.forEach(id => {
      let v = map[id] || 0;

      /* 🔥 AFFICHAGE AUX EN DOUBLE */
      if (id === "W3pGNRR01012") {
        v = v * 2;
      }

      html += `
        <div class="device">
          <b>${NAME[id]}</b><br/>
          ${v.toFixed(2)} kW
        </div>
      `;
    });

    document.getElementById("devices").innerHTML = html;

    const time = getTime();

    chart.data.labels.push(time);
    chart.data.datasets[0].data.push(conso);
    chart.data.datasets[1].data.push(prod);

    if (chart.data.labels.length > 40) {
      chart.data.labels.shift();
      chart.data.datasets[0].data.shift();
      chart.data.datasets[1].data.shift();
    }

    chart.update();
    saveHistory(time, conso, prod);
    updateStegUI();

  } catch (e) {
    console.log("API ERROR:", e);
  }
}

load();
setInterval(load, 5000);
