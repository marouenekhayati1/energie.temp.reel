const USER_ID = "us-east-1:2e44f066-1ee0-4353-9885-97ee102980bc";
const TOKEN = "eyJraWQiOiJ0Z0NRSUg5U3hlZW9jcWdLWjV0aXFpbVZzOFlMV1hLTnJhOWMzcUNZVEU4PSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJhM2U3NzNhZS1hYWE4LTRmMzMtYmRiZS1hOWFhMzA5MzlmYWEiLCJkZXZpY2Vfa2V5IjoidXMtZWFzdC0xX2NkNTkyYWRjLTFiMTQtNGY5ZS1hOTFjLTc2ZGViN2M5ZmUyNCIsImlzcyI6Imh0dHBzOi8vY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb20vdXMtZWFzdC0xX05JcWFJV040cCIsImNsaWVudF9pZCI6IjQ4czNycGltMTg0N2x2bmZkOHBjZTlnbHFoIiwiZXZlbnRfaWQiOiI0ZGY1MTYyMy1lZmIyLTQ0YTMtYjNjNC0yYjNjZWY4YzVmMzgiLCJ0b2tlbl91c2UiOiJhY2Nlc3MiLCJzY29wZSI6ImF3cy5jb2duaXRvLnNpZ25pbi51c2VyLmFkbWluIiwiYXV0aF90aW1lIjoxNzg0NDg3MTM5LCJleHAiOjE3ODQ1NzM1NDIsImlhdCI6MTc4NDQ4NzE0MiwianRpIjoiYjFhN2Y1ODgtYjAxNy00N2E1LWIzNzItOWQzODhmZGFjM2MyIiwidXNlcm5hbWUiOiJyYW5kYV9hZG1pbiJ9.RuMmzICPjMXagtmE_wJXHFpb-Acd2hASJjzgEHzoigvkhdmA9P1q8BfvRe3cydAyaAjJ8kr6OGT4lDuQg5UQEVY0klzchMWB0vkHKy0uOn5HQkjz6S4yCRg0OW2yT4fcMxKh5zS_aCOwm0k_t46QwMsy9C-BbEEirOghwPEFrf04pqCEl5xvLvBqC-I13dodBIlJZeWJEdUy2ehqBWjEYJZkfwOg4qebY7I26RYOK9II7-2doBwdbzysBML9xkf7G0INqG75YlsgKplIgtHiuGbktXWaRc3Ja2SsUkIzZqBwbRpSHBj31iaorkufZTJeNBLlndCk0AXG07vk0dqK-A";
const DEVICEKEY = "us-east-1_cd592adc-1b14-4f9e-a91c-76deb7c9fe24";

const URL = `https://uufyt92ekc.execute-api.us-east-1.amazonaws.com/prod/apis.wattnow.io/dashboard/realtime/devices/lastValuesByDeviceType/${USER_ID}/${USER_ID}/tri`;

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
        tension: 0.2,
        pointRadius: 0
      },
      {
        label: "Production",
        data: [],
        borderColor: "#22c55e",
        borderWidth: 2,
        tension: 0.2,
        pointRadius: 0
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
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
          color: "white"
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

history.forEach(h => {
  chart.data.labels.push(h.time);
  chart.data.datasets[0].data.push(h.conso);
  chart.data.datasets[1].data.push(h.prod);
});

chart.update();

function toKw(v) {
  return Number(v || 0) / 1000;
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

  if (history.length > 50) {
    history.shift();
  }

  localStorage.setItem("watt_history", JSON.stringify(history));
}

function getStegPeriod() {
  const now = new Date();
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

  } catch (err) {

    console.error("Erreur API :", err);

    document.getElementById("stegMessage").innerText =
      "❌ Impossible de récupérer les données.";

    document.getElementById("stegMessage").style.color = "#ef4444";
  }
}

load();

setInterval(load, 10000);
