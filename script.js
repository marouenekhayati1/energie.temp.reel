const USER_ID = "us-east-1:2e44f066-1ee0-4353-9885-97ee102980bc";
const TOKEN = "PUT_YOUR_TOKEN";
const DEVICEKEY = "PUT_YOUR_DEVICE_KEY";

const URL =
`https://325qd9g4o9.execute-api.us-east-2.amazonaws.com/dev/apis.wattnow.io/dashboard/realtime/devices/lastValuesByDeviceType/${USER_ID}/${USER_ID}/tri`;

// order affichage
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

// chart
const ctx = document.getElementById("chart").getContext("2d");

const chart = new Chart(ctx, {
  type: "line",
  data: {
    labels: [],
    datasets: [
      { label: "Conso", data: [], borderColor: "#facc15" },
      { label: "Prod", data: [], borderColor: "#22c55e" }
    ]
  }
});

function toKw(v) {
  return v ? parseFloat(v) / 1000 : 0;
}

async function load() {
  try {
    const res = await fetch(URL, {
      headers: {
        accesstoken: TOKEN,
        devicekey: DEVICEKEY,
        userregion: "us-east-2",
        Accept: "application/json"
      }
    });

    const raw = await res.json();

    console.log("RAW API:", raw);

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

    // devices UI FIXED
    let html = "";

    ORDER.forEach(id => {
      let v = map[id] || 0;

      if (id === "W3pGNRR01012") v = v * 2;

      html += `
        <div class="device">
          <b>${NAME[id]}</b><br/>
          ${v.toFixed(2)} kW
        </div>
      `;
    });

    document.getElementById("devices").innerHTML = html;

    // graph
    chart.data.labels.push(new Date().toLocaleTimeString());
    chart.data.datasets[0].data.push(conso);
    chart.data.datasets[1].data.push(prod);

    if (chart.data.labels.length > 50) {
      chart.data.labels.shift();
      chart.data.datasets[0].data.shift();
      chart.data.datasets[1].data.shift();
    }

    chart.update();

    document.getElementById("status").innerText = "Live ✔";

  } catch (e) {
    console.log(e);
    document.getElementById("status").innerText = "Erreur API";
  }
}

load();
setInterval(load, 5000);
