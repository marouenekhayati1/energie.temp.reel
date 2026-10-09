const SHEET_URL = "https://script.google.com/macros/s/AKfycbyt8R7nLqvJ5JZ52RNuHcM9WHSWxXRoY82mBwcIuHUdUbep46SHx3CfcAbnRbPSb5RgNw/exec";

const MONTH_NAMES = {
  "01": "Janvier", "02": "Février", "03": "Mars", "04": "Avril",
  "05": "Mai", "06": "Juin", "07": "Juillet", "08": "Août",
  "09": "Septembre", "10": "Octobre", "11": "Novembre", "12": "Décembre"
};

function timeToSec(t) {
  const p = String(t).substring(0, 8).split(":");
  return (Number(p[0] || 0) * 3600) + (Number(p[1] || 0) * 60) + Number(p[2] || 0);
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

function fmtNum(n) {
  return Number(n || 0).toLocaleString("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

document.addEventListener("DOMContentLoaded", () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");

  const yearSelect = document.getElementById("yearSelect");
  if (yearSelect) {
    yearSelect.innerHTML = "";
    for (let y = year; y >= 2024; y--) {
      const opt = document.createElement("option");
      opt.value = y; opt.textContent = y;
      yearSelect.appendChild(opt);
    }
    yearSelect.value = year;
  }

  const monthInput = document.getElementById("monthSelect");
  if (monthInput) monthInput.value = `${year}-${month}`;

  loadYearlyData();
  loadStoppagesData();
});

async function loadYearlyData() {
  const yearSelect = document.getElementById("yearSelect");
  if (!yearSelect || !yearSelect.value) return;

  const year = yearSelect.value;
  const tbody = document.getElementById("yearlyTableBody");
  const tfoot = document.getElementById("yearlyTableFoot");

  tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding: 15px;">Chargement des données en cours...</td></tr>';
  tfoot.innerHTML = '';

  const url = SHEET_URL + "?action=yearly&year=" + encodeURIComponent(year);

  try {
    const res = await fetch(url);
    const json = await res.json();
    if (!json.ok || !json.monthly) throw new Error(json.error || "Données indisponibles");

    const mStats = json.monthly;
    tbody.innerHTML = "";

    let totConso = 0, totProd = 0, totG1 = 0, totG2 = 0;
    let totRanda = 0, totBvm = 0, totSmt = 0, totAux = 0;

    for (let m = 12; m >= 1; m--) {
      const mKey = String(m).padStart(2, "0");
      const d = mStats[mKey] || { conso: 0, prod: 0, g1: 0, g2: 0, randa: 0, bvm: 0, smt: 0, aux: 0 };

      totConso += d.conso || 0;
      totProd  += d.prod || 0;
      totG1    += d.g1 || 0;
      totG2    += d.g2 || 0;
      totRanda += d.randa || 0;
      totBvm   += d.bvm || 0;
      totSmt   += d.smt || 0;
      totAux   += d.aux || 0;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><b>${MONTH_NAMES[mKey]}</b></td>
        <td class="text-conso">${fmtNum(d.conso)}</td>
        <td class="text-prod">${fmtNum(d.prod)}</td>
        <td>${fmtNum(d.g1)}</td>
        <td>${fmtNum(d.g2)}</td>
        <td>${fmtNum(d.randa)}</td>
        <td>${fmtNum(d.bvm)}</td>
        <td>${fmtNum(d.smt)}</td>
        <td>${fmtNum(d.aux)}</td>
      `;
      tbody.appendChild(tr);
    }

    tfoot.innerHTML = `
      <tr>
        <td><b>TOTAL ANNUEL (${year})</b></td>
        <td class="text-conso">${fmtNum(totConso)}</td>
        <td class="text-prod">${fmtNum(totProd)}</td>
        <td>${fmtNum(totG1)}</td>
        <td>${fmtNum(totG2)}</td>
        <td>${fmtNum(totRanda)}</td>
        <td>${fmtNum(totBvm)}</td>
        <td>${fmtNum(totSmt)}</td>
        <td>${fmtNum(totAux)}</td>
      </tr>
    `;

  } catch (err) {
    console.error("Erreur bilan annuel :", err);
    tbody.innerHTML = `<tr><td colspan="9" style="color:#ef4444; text-align:center; padding: 15px;">❌ Erreur : ${err.message}. Assurez-vous de redéployer Google Apps Script.</td></tr>`;
  }
}

async function loadStoppagesData() {
  const monthInput = document.getElementById("monthSelect");
  if (!monthInput || !monthInput.value) return;

  const month = monthInput.value;
  const g1Body = document.getElementById("g1TableBody");
  const g2Body = document.getElementById("g2TableBody");

  if (g1Body) g1Body.innerHTML = '<tr><td colspan="5" style="text-align:center;">Chargement...</td></tr>';
  if (g2Body) g2Body.innerHTML = '<tr><td colspan="5" style="text-align:center;">Chargement...</td></tr>';

  const url = SHEET_URL + "?action=stoppages&month=" + encodeURIComponent(month);

  try {
    const res = await fetch(url);
    const json = await res.json();
    if (!json.ok) throw new Error("Erreur serveur");

    processAndDisplayStoppages(json.data);
  } catch (err) {
    console.error("Erreur arrêts :", err);
    if (g1Body) g1Body.innerHTML = '<tr><td colspan="5" style="color:#ef4444; text-align:center;">Erreur de chargement</td></tr>';
    if (g2Body) g2Body.innerHTML = '<tr><td colspan="5" style="color:#ef4444; text-align:center;">Erreur de chargement</td></tr>';
  }
}

function processAndDisplayStoppages(monthData) {
  const g1Stoppages = [], g2Stoppages = [];
  const POWER_THRESHOLD = 0.4; // Seuil < 400 W

  Object.keys(monthData).sort().forEach(dateStr => {
    const rows = monthData[dateStr];
    if (!rows || rows.length === 0) return;

    let g1Start = null, g2Start = null;

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const curSec = timeToSec(r.time);

      if (r.g1 < POWER_THRESHOLD && g1Start === null) g1Start = { time: r.time, sec: curSec };
      else if (r.g1 >= POWER_THRESHOLD && g1Start !== null) {
        evaluateAndPush(g1Stoppages, dateStr, g1Start.time, r.time, curSec - g1Start.sec);
        g1Start = null;
      }

      if (r.g2 < POWER_THRESHOLD && g2Start === null) g2Start = { time: r.time, sec: curSec };
      else if (r.g2 >= POWER_THRESHOLD && g2Start !== null) {
        evaluateAndPush(g2Stoppages, dateStr, g2Start.time, r.time, curSec - g2Start.sec);
        g2Start = null;
      }
    }

    if (g1Start !== null) {
      const lastRow = rows[rows.length - 1];
      evaluateAndPush(g1Stoppages, dateStr, g1Start.time, lastRow.time, timeToSec(lastRow.time) - g1Start.sec);
    }
    if (g2Start !== null) {
      const lastRow = rows[rows.length - 1];
      evaluateAndPush(g2Stoppages, dateStr, g2Start.time, lastRow.time, timeToSec(lastRow.time) - g2Start.sec);
    }
  });

  renderStoppageTable("g1TableBody", g1Stoppages);
  renderStoppageTable("g2TableBody", g2Stoppages);
  updateStoppageTotals("g1TotCorr", "g1TotPrev", g1Stoppages);
  updateStoppageTotals("g2TotCorr", "g2TotPrev", g2Stoppages);
}

function evaluateAndPush(list, dateStr, startTime, endTime, durationSec) {
  const durationMin = durationSec / 60;
  if (durationMin < 3) return; // < 3 min ignoré
  const type = durationMin <= 90 ? "Correctif" : "Préventif";
  list.push({ date: dateStr, start: startTime, end: endTime, durationSec: durationSec, type: type });
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
