const USER_ID = "us-east-1:2e44f066-1ee0-4353-9885-97ee102980bc";
const TOKEN = "PUT_YOUR_TOKEN";
const DEVICEKEY = "PUT_YOUR_DEVICE_KEY";

const URL =
`https://325qd9g4o9.execute-api.us-east-2.amazonaws.com/dev/apis.wattnow.io/dashboard/realtime/devices/lastValuesByDeviceType/${USER_ID}/${USER_ID}/tri`;

// 📦 local history
let history = JSON.parse(localStorage.getItem("history") || "[]");

// 📊 chart
const ctx = document.getElementById("chart").getContext("2d");

const chart = new Chart(ctx, {
  type: "line",
  data: {
    labels: [],
    datasets: [
      {
        label: "Conso",
        data: [],
        borderColor: "#facc15"
      },
      {
        label: "Prod",
        data: [],
        borderColor: "#22c55e"
      }
    ]
  }
});

// load old history
history.forEach(h => {
  chart.data.labels.push(h.time);
  chart.data.datasets[0].data.push(h.conso);
  chart.data.datasets[1].data.push(h.prod);
});
chart.update();

function save(conso, prod) {
  history.push({
    time: new Date().toLocaleTimeString(),
    conso,
    prod
  });

  if (history.length > 50) history.shift();

  localStorage.setItem("history", JSON.stringify(history));
}

async function load() {
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
    map[d.deviceId] = parseFloat(d.all_value || 0) / 1000;
  });

  const conso =
    (map["W3pGNRR01014"] || 0) +
    (map["W3pGNRR01015"] || 0) +
    (map["W3pGNRR01013"] || 0) +
    ((map["W3pGNRR01012"] || 0) * 2);

  const prod =
    (map["W3pGNRR01016"] || 0) +
    (map["W3pGNRR01017"] || 0);

  const delta = prod - conso;

  document.getElementById("conso").innerText = conso.toFixed(2);
  document.getElementById("prod").innerText = prod.toFixed(2);
  document.getElementById("delta").innerText = delta.toFixed(2);

  save(conso, prod);

  chart.data.labels.push(new Date().toLocaleTimeString());
  chart.data.datasets[0].data.push(conso);
  chart.data.datasets[1].data.push(prod);

  if (chart.data.labels.length > 50) {
    chart.data.labels.shift();
    chart.data.datasets[0].data.shift();
    chart.data.datasets[1].data.shift();
  }

  chart.update();
}

load();
setInterval(load, 5000);
