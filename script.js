const USER_ID = "us-east-1:2e44f066-1ee0-4353-9885-97ee102980bc";
const TOKEN = "eyJraWQiOiJ0Z0NRSUg5U3hlZW9jcWdLWjV0aXFpbVZzOFlMV1hLTnJhOWMzcUNZVEU4PSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJhM2U3NzNhZS1hYWE4LTRmMzMtYmRiZS1hOWFhMzA5MzlmYWEiLCJkZXZpY2Vfa2V5IjoidXMtZWFzdC0xX2NkNTkyYWRjLTFiMTQtNGY5ZS1hOTFjLTc2ZGViN2M5ZmUyNCIsImlzcyI6Imh0dHBzOi8vY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb20vdXMtZWFzdC0xX05JcWFJV040cCIsImNsaWVudF9pZCI6IjQ4czNycGltMTg0N2x2bmZkOHBjZTlnbHFoIiwiZXZlbnRfaWQiOiI0ZGY1MTYyMy1lZmIyLTQ0YTMtYjNjNC0yYjNjZWY4YzVmMzgiLCJ0b2tlbl91c2UiOiJhY2Nlc3MiLCJzY29wZSI6ImF3cy5jb2duaXRvLnNpZ25pbi51c2VyLmFkbWluIiwiYXV0aF90aW1lIjoxNzg0NDg3MTM5LCJleHAiOjE3ODQ1NzM1NDIsImlhdCI6MTc4NDQ4NzE0MiwianRpIjoiYjFhN2Y1ODgtYjAxNy00N2E1LWIzNzItOWQzODhmZGFjM2MyIiwidXNlcm5hbWUiOiJyYW5kYV9hZG1pbiJ9.RuMmzICPjMXagtmE_wJXHFpb-Acd2hASJjzgEHzoigvkhdmA9P1q8BfvRe3cydAyaAjJ8kr6OGT4lDuQg5UQEVY0klzchMWB0vkHKy0uOn5HQkjz6S4yCRg0OW2yT4fcMxKh5zS_aCOwm0k_t46QwMsy9C-BbEEirOghwPEFrf04pqCEl5xvLvBqC-I13dodBIlJZeWJEdUy2ehqBWjEYJZkfwOg4qebY7I26RYOK9II7-2doBwdbzysBML9xkf7G0INqG75YlsgKplIgtHiuGbktXWaRc3Ja2SsUkIzZqBwbRpSHBj31iaorkufZTJeNBLlndCk0AXG07vk0dqK-A";
const DEVICEKEY = "us-east-1_cd592adc-1b14-4f9e-a91c-76deb7c9fe24";

const URL = "https://uufyt92ekc.execute-api.us-east-1.amazonaws.com/prod/apis.wattnow.io/dashboard/realtime/devices/lastValuesByDeviceType/us-east-1:2e44f066-1ee0-4353-9885-97ee102980bc/us-east-1:2e44f066-1ee0-4353-9885-97ee102980bc/tri";

// ===== Google Sheet Web App =====
const SHEET_URL = "https://script.google.com/macros/s/AKfycbxJaBXBbJug7i2ijsFYqhdKLp5ZWfQv4PWy-qKNhompWUYwtoJ_R7CZydplCIrC2j7M/exec";

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

// ===== Chart =====
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
        backgroundColor: "rgba(239, 68, 68, 0.12)",
        fill: true,
        borderWidth: 2,
        tension: 0.2,
        pointRadius: 0
      },
      {
        label: "Production",
        data: [],
        borderColor: "#22c55e",
        backgroundColor: "rgba(34, 197, 94, 0.12)",
        fill: true,
        borderWidth: 2,
        tension: 0.2,
        pointRadius: 0
      },
      {
        label: "Delta",
        data: [],
        borderColor: "#3b82f6",
        borderWidth: 2,
        borderDash: [5, 5],
        tension: 0.2,
        pointRadius: 0,
        hidden: true
      },
      {
        label: "Groupe 1",
        data: [],
        borderColor: "#f97316",
        borderWidth: 2,
        tension: 0.2,
        pointRadius: 0,
        hidden: true
      },
      {
        label: "Groupe 2",
        data: [],
        borderColor: "#eab308",
        borderWidth: 2,
        tension: 0.2,
        pointRadius: 0,
        hidden: true
      },
      {
        label: "Randa",
        data: [],
        borderColor: "#a855f7",
        borderWidth: 2,
        tension: 0.2,
        pointRadius: 0,
        hidden: true
      },
      {
        label: "BVM",
        data: [],
        borderColor: "#ec4899",
        borderWidth: 2,
        tension: 0.2,
        pointRadius: 0,
        hidden: true
      },
      {
        label: "SMT",
        data: [],
        borderColor: "#14b8a6",
        borderWidth: 2,
        tension: 0.2,
        pointRadius: 0,
        hidden: true
      },
      {
        label: "Auxiliaire",
        data: [],
        borderColor: "#64748b",
        borderWidth: 2,
        tension: 0.2,
        pointRadius: 0,
        hidden: true
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    interaction: {
      mode: "index",
      intersect: false
    },
    plugins: {
      legend: {
        labels: {
          color: "white",
          usePointStyle: true,
          pointStyle: "line"
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: "white",
          maxTicksLimit: 15
        }
      },
      y: {
        ticks: {
          color: "white"
        }
      }
    }
  }
});

// ===== Helpers date / heure =====

// Date du jour au format yyyy-mm-dd
function todayStr() {
  const n = new Date();
  return n.getFullYear() + "-" +
    String(n.getMonth() + 1).padStart(2, "0") + "-" +
    String(n.getDate()).padStart(2, "0");
}

function getTime() {
  return new Date().toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

function toKw(v) {
  return Number(v || 0) / 1000;
}

// ===== Remplir le sélecteur de jour depuis le Sheet =====
async function loadDays() {
  const select = document.getElementById("daySelect");
  const selected = select.value; // garder la sélection actuelle

  try {
    const res = await fetch(SHEET_URL + "?action=days");
    const json = await res.json();

    if (!json.ok) return;

    // Supprimer les anciennes options de dates (garder "today")
    while (select.options.length > 1) {
      select.remove(1);
    }

    // Ajouter les dates trouvées dans le Sheet
    json.days.forEach(d => {
      const opt = document.createElement("option");
      opt.value = d;
      opt.textContent = d;
      select.appendChild(opt);
    });

    // Restaurer la sélection si elle existe encore
    if (selected) {
      select.value = selected;
    }

  } catch (err) {
    console.error("Erreur lecture jours :", err);
  }
}

// ===== Remplir les sélecteurs d'heures =====
function fillHours() {
  const start = document.getElementById("startHour");
  const end = document.getElementById("endHour");

  for (let h = 0; h <= 23; h++) {
    const hh = String(h).padStart(2, "0");

    const o1 = document.createElement("option");
    o1.value = hh;
    o1.textContent = hh + ":00";
    start.appendChild(o1);

    const o2 = document.createElement("option");
    o2.value = hh;
    o2.textContent = hh + ":59";
    end.appendChild(o2);
  }

  start.value = "00";
  end.value = "23";
}

// ===== Charger le graphique selon jour + période (depuis Google Sheet) =====
async function loadChartData() {
  const daySelect = document.getElementById("daySelect").value;

  let day;
  if (daySelect === "today") {
    day = todayStr();
  } else {
    day = daySelect;
  }

  const start = document.getElementById("startHour").value;
  const end = document.getElementById("endHour").value;

  const url = SHEET_URL +
    "?action=read" +
    "&date=" + encodeURIComponent(day) +
    "&start=" + encodeURIComponent(start) +
    "&end=" + encodeURIComponent(end);

  try {
    const res = await fetch(url);
    const json = await res.json();

    if (!json.ok) throw new Error("read failed");

    displayChart(json.data);

  } catch (err) {
    console.error("Erreur lecture Sheet :", err);
  }
}

// ===== Afficher les données + tendance =====
function displayChart(rows) {
  // Vider le graphique
  chart.data.labels = [];
  chart.data.datasets.forEach(ds => ds.data = []);

  // L'axe X affiche l'HEURE SEULEMENT (pas la date)
  rows.forEach(h => {
    chart.data.labels.push(String(h.time).substring(0, 8));
    chart.data.datasets[0].data.push(h.conso);
    chart.data.datasets[1].data.push(h.prod);
    chart.data.datasets[2].data.push(h.delta);  // utilise la colonne delta du Sheet
    chart.data.datasets[3].data.push(h.g1    || 0);
    chart.data.datasets[4].data.push(h.g2    || 0);
    chart.data.datasets[5].data.push(h.randa || 0);
    chart.data.datasets[6].data.push(h.bvm   || 0);
    chart.data.datasets[7].data.push(h.smt   || 0);
    chart.data.datasets[8].data.push(h.aux   || 0);
  });

  chart.update();

  // ===== Tendances =====
    // ===== Tendances =====
  if (rows.length === 0) {
    document.getElementById("tConsoMoy").innerText = "---";
    document.getElementById("tConsoMax").innerText = "---";
    document.getElementById("tProdMoy").innerText = "---";
    document.getElementById("tProdMax").innerText = "---";
    document.getElementById("tEnergie").innerText = "---";
    document.getElementById("tEnergieProd").innerText = "---";
    return;
  }

  const consoVals = rows.map(r => r.conso);
  const prodVals = rows.map(r => r.prod);

  const consoMoy = consoVals.reduce((a, b) => a + b, 0) / consoVals.length;
  const prodMoy = prodVals.reduce((a, b) => a + b, 0) / prodVals.length;
  const consoMax = Math.max(...consoVals);
  const prodMax = Math.max(...prodVals);

  // ===== Énergie précise : écarts d'horaires réels =====

  // Convertit "HH:mm:ss" en secondes depuis minuit
  function timeToSec(t) {
    const p = String(t).substring(0, 8).split(":");
    return (Number(p[0]) * 3600) + (Number(p[1]) * 60) + Number(p[2]);
  }

  // Durée max entre 2 points avant de considérer une coupure
  // (au-delà, on ne compte pas l'énergie — évite de compter les nuits/pannes)
  const MAX_GAP_SEC = 300; // 5 minutes

  let energie = 0;       // kWh consommés
  let energieProd = 0;   // kWh produits

  for (let i = 1; i < rows.length; i++) {
    const dt = timeToSec(rows[i].time) - timeToSec(rows[i - 1].time);

    // Ignorer les trous (dashboard fermé, coupure, changement de période...)
    if (dt <= 0 || dt > MAX_GAP_SEC) continue;

    // durée en heures × puissance moyenne entre les 2 points
    const hours = dt / 3600;
    energie      += hours * (rows[i].conso + rows[i - 1].conso) / 2;
    energieProd  += hours * (rows[i].prod  + rows[i - 1].prod)  / 2;
  }

  document.getElementById("tConsoMoy").innerText = consoMoy.toFixed(2) + " kW";
  document.getElementById("tConsoMax").innerText = consoMax.toFixed(2) + " kW";
  document.getElementById("tProdMoy").innerText = prodMoy.toFixed(2) + " kW";
  document.getElementById("tProdMax").innerText = prodMax.toFixed(2) + " kW";
  document.getElementById("tEnergie").innerText = energie.toFixed(1) + " kWh";
  document.getElementById("tEnergieProd").innerText = energieProd.toFixed(1) + " kWh";


// ===== Sauvegarde vers le Sheet (avec les appareils) =====
function saveHistory(time, conso, prod, delta, devices) {
  fetch(SHEET_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify({
      date: todayStr(),
      time: time,
      conso: conso,
      prod: prod,
      delta: delta,
      g1: devices.g1,
      g2: devices.g2,
      randa: devices.randa,
      bvm: devices.bvm,
      smt: devices.smt,
      aux: devices.aux
    })
  }).catch(err => console.error("Erreur Sheet :", err));
}

// ===== Régime STEG =====
function getStegPeriod() {
  const now = new Date();

  // Dimanche : tarif nuit toute la journée
  if (now.getDay() === 0) {
    return { name: "Nuit (Dimanche)", type: "offpeak" };
  }

  const t = now.getHours() + now.getMinutes() / 60;

  if (t >= 22 || t < 6.5)
    return { name: "Nuit", type: "offpeak" };

  if (t >= 6.5 && t < 8.5)
    return { name: "Jour", type: "normal" };

  if (t >= 8.5 && t < 13.5)
    return { name: "Pointe jour", type: "peak" };

  if (t >= 13.5 && t < 19)
    return { name: "Jour", type: "normal" };

  return { name: "Pointe soir", type: "peak" };
}

function updateStegUI() {
  const p = getStegPeriod();

  document.getElementById("stegStatus").innerText = p.name;

  const msg = document.getElementById("stegMessage");

  if (p.type === "peak") {
    msg.innerText =
      "⚠️ Pointe tarifaire – Démarrer les groupes en pleine charge";
    msg.style.color = "#ef4444";
  } else {
    msg.innerText =
      "✅ Suivre la consommation vs production";
    msg.style.color = "#22c55e";
  }
}

// ===== Temps réel (cartes + sections + sauvegarde Sheet) =====
async function load() {

  try {

    const res = await fetch(URL, {
      method: "GET",
      headers: {
        accesstoken: TOKEN,
        devicekey: DEVICEKEY,
        userregion: "us-east-1",
        "Content-Type": "application/json"
      }
    });

    if (!res.ok) {
      throw new Error("HTTP " + res.status);
    }

    const raw = await res.json();

    const map = {};

    raw.forEach(d => {
      if (!d.deviceId) return;
      map[d.deviceId] = toKw(d.all_value);
    });

    const get = id => map[id] || 0;

    const g1 = get("W3pGNRR01016");
    const g2 = get("W3pGNRR01017");

    const randa = get("W3pGNRR01014");
    const bvm = get("W3pGNRR01015");
    const smt = get("W3pGNRR01013");

    const aux = get("W3pGNRR01012") * 2;

    const conso = randa + bvm + smt + aux;
    const prod = g1 + g2;
    const delta = prod - conso;

    document.getElementById("conso").innerText =
      conso.toFixed(2) + " kW";

    document.getElementById("prod").innerText =
      prod.toFixed(2) + " kW";

    document.getElementById("delta").innerText =
      delta.toFixed(2) + " kW";

    let html = "";

    ORDER.forEach(id => {

      let value = get(id);

      if (id === "W3pGNRR01012")
        value *= 2;

      let display = value.toFixed(2) + " kW";

      if (id === "W3pGNRR01016" ||
          id === "W3pGNRR01017") {

        const percent = (value / 2250) * 100;

        display =
          value.toFixed(2) +
          " kW (" +
          percent.toFixed(1) +
          "%)";
      }

      html += `
        <div class="device">
          <b>${NAME[id]}</b><br>
          ${display}
        </div>
      `;
    });

    document.getElementById("devices").innerHTML = html;

    saveHistory(getTime(), conso, prod, delta, {
      g1: g1,
      g2: g2,
      randa: randa,
      bvm: bvm,
      smt: smt,
      aux: aux
    });

    updateStegUI();

  } catch (err) {

    console.error("Erreur API :", err);

    document.getElementById("stegMessage").innerText =
      "❌ Impossible de récupérer les données.";

    document.getElementById("stegMessage").style.color = "#ef4444";
  }
}

// ===== Initialisation =====
fillHours();
loadDays();
loadChartData();
load();

// Cartes temps réel toutes les 10s
setInterval(load, 10000);

// LIVE : recharger le graphique depuis Google Sheet toutes les 10s
// (uniquement si "Temps réel (Live)" est sélectionné)
setInterval(() => {
  if (document.getElementById("daySelect").value === "today") {
    loadChartData();
  }
}, 10000);

// Recharger la liste des dates toutes les heures
//setInterval(loadDays, 3600000);
