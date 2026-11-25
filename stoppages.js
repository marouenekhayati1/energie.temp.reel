const SHEET_URL = "https://script.google.com/macros/s/AKfycbzlRCv9mpWRrQ_XT0R5bmlCJAKrl9xjFmxCuPVdeMXk8OUk5fgkRpaD6bGLAZXfrVtFqQ/exec";

function toTimestampMs(dateStr, timeStr) {
  const cleanTime = String(timeStr || "00:00:00").substring(0, 8).padStart(8, "0");
  return new Date(`${dateStr}T${cleanTime}`).getTime();
}

function formatDuration(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  let res = "";
  if (h > 0) res += h + "h ";
  if (m > 0 || h > 0) res += m + "m ";
  res += s + "s";
  return res;
}

function initStoppagesPage() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");

  const monthInput = document.getElementById("monthSelect");
  if (monthInput) {
    monthInput.value = `${year}-${month}`;
  }

  loadStoppagesData();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initStoppagesPage);
} else {
  initStoppagesPage();
}

async function loadStoppagesData() {
  const monthInput = document.getElementById("monthSelect");
  if (!monthInput || !monthInput.value) return;

  const month = monthInput.value;
  const g1Body = document.getElementById("g1TableBody");
  const g2Body = document.getElementById("g2TableBody");

  if (g1Body) g1Body.innerHTML = '<tr><td colspan="5" style="text-align:center;">Chargement...</td></tr>';
  if (g2Body) g2Body.innerHTML = '<tr><td colspan="5" style="text-align:center;">Chargement...</td></tr>';

  const url = `${SHEET_URL}?action=stoppages&month=${encodeURIComponent(month)}&_t=${Date.now()}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.ok || !json.data) throw new Error(json.error || "Données d'arrêts indisponibles");

    processAndDisplayStoppages(json.data);
  } catch (err) {
    console.error("Erreur arrêts :", err);
    if (g1Body) g1Body.innerHTML = `<tr><td colspan="5" style="color:#ef4444; text-align:center;">❌ ${err.message}</td></tr>`;
    if (g2Body) g2Body.innerHTML = `<tr><td colspan="5" style="color:#ef4444; text-align:center;">❌ ${err.message}</td></tr>`;
  }
}

function processAndDisplayStoppages(monthData) {
  const g1Stoppages = [], g2Stoppages = [];
  const POWER_THRESHOLD = 0.4;

  let g1Start = null;
  let g2Start = null;
  let lastPoint = null;

  const sortedDates = Object.keys(monthData).sort();

  sortedDates.forEach(dateStr => {
    const rows = monthData[dateStr];
    if (!rows || rows.length === 0) return;

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const curMs = toTimestampMs(dateStr, r.time);
      if (Number.isNaN(curMs)) continue;

      lastPoint = { date: dateStr, time: r.time, ms: curMs };

      if (r.g1 < POWER_THRESHOLD && g1Start === null) {
        g1Start = { date: dateStr, time: r.time, ms: curMs };
      } else if (r.g1 >= POWER_THRESHOLD && g1Start !== null) {
        evaluateAndPush(g1Stoppages, g1Start, { date: dateStr, time: r.time, ms: curMs });
        g1Start = null;
      }

      if (r.g2 < POWER_THRESHOLD && g2Start === null) {
        g2Start = { date: dateStr, time: r.time, ms: curMs };
      } else if (r.g2 >= POWER_THRESHOLD && g2Start !== null) {
        evaluateAndPush(g2Stoppages, g2Start, { date: dateStr, time: r.time, ms: curMs });
        g2Start = null;
      }
    }
  });

  if (g1Start !== null && lastPoint !== null) {
    evaluateAndPush(g1Stoppages, g1Start, lastPoint);
  }
  if (g2Start !== null && lastPoint !== null) {
    evaluateAndPush(g2Stoppages, g2Start, lastPoint);
  }

  renderStoppageTable("g1TableBody", g1Stoppages);
  renderStoppageTable("g2TableBody", g2Stoppages);
  updateStoppageTotals("g1TotCorr", "g1TotPrev", g1Stoppages);
  updateStoppageTotals("g2TotCorr", "g2TotPrev", g2Stoppages);
}

function evaluateAndPush(list, startObj, endObj) {
  const durationSec = Math.max(0, (endObj.ms - startObj.ms) / 1000);
  const durationMin = durationSec / 60;
  if (durationMin < 3) return;

  const type = durationMin <= 90 ? "Correctif" : "Préventif";
  const displayDate = startObj.date === endObj.date
    ? startObj.date
    : `${startObj.date} → ${endObj.date}`;

  list.push({
    date: displayDate,
    start: startObj.time,
    end: endObj.time,
    durationSec: durationSec,
    type: type
  });
}

function renderStoppageTable(elementId, stoppages) {
  const tbody = document.getElementById(elementId);
  if (!tbody) return;
  tbody.innerHTML = "";

  if (stoppages.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="color:#94a3b8; text-align:center;">Aucun arrêt enregistré ce mois</td></tr>';
    return;
  }

  stoppages.forEach(s => {
    const tr = document.createElement("tr");
    const badgeClass = s.type === "Correctif" ? "badge-corrective" : "badge-preventive";
    tr.innerHTML = `
      <td>${s.date}</td>
      <td>${s.start}</td>
      <td>${s.end}</td>
      <td>${formatDuration(s.durationSec)}</td>
      <td><span class="badge ${badgeClass}">${s.type}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

function updateStoppageTotals(corrId, prevId, stoppages) {
  let countCorr = 0, durCorr = 0, countPrev = 0, durPrev = 0;
  stoppages.forEach(s => {
    if (s.type === "Correctif") { countCorr++; durCorr += s.durationSec; }
    else { countPrev++; durPrev += s.durationSec; }
  });

  const cEl = document.getElementById(corrId);
  const pEl = document.getElementById(prevId);
  if (cEl) cEl.innerText = `${countCorr} (${formatDuration(durCorr)})`;
  if (pEl) pEl.innerText = `${countPrev} (${formatDuration(durPrev)})`;
}
