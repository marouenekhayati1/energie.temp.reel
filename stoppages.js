// ===== Google Sheet Web App =====
const SHEET_URL = "https://script.google.com/macros/s/AKfycbwadKV0k5zkGP30BskQdTBeUBdiL579h6LSRbulD4urMGES-IK_EgA8JtI3mePDT0uedg/exec";

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
  if (n === 0) return "0.0";
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
      opt.value = y;
      opt.textContent = y;
      yearSelect.appendChild(opt);
    }
    yearSelect.value = year;
  }

  const monthInput = document.getElementById("monthSelect");
  if (monthInput) {
    monthInput.value = `${year}-${month}`;
  }
  
  loadYearlyData();
  loadStoppagesData();
});

// ===== LOGIQUE BILAN MENSUEL DE L'ANNÉE =====
async function loadYearlyData() {
  const yearSelect = document.getElementById("yearSelect");
  if (!yearSelect || !yearSelect.value) return;

  const year = yearSelect.value;
  const tbody = document.getElementById("yearlyTableBody");
  const tfoot = document.getElementById("yearlyTableFoot");

  tbody.innerHTML = '<tr><td colspan="9">Chargement des données...</td></tr>';
  tfoot.innerHTML = '';

  const url = SHEET_URL + "?action=yearly&year=" + encodeURIComponent(year);

  try {
    const res = await fetch(url);
    const json = await res.json();

    if (!json.ok) throw new Error("Erreur serveur");

    const mStats = json.monthly;
    tbody.innerHTML = "";

    let totConso = 0, totProd = 0, totG1 = 0, totG2 = 0;
    let totRanda = 0, totBvm = 0, totSmt = 0, totAux = 0;

    // Du mois de Décembre à Janvier (ordre décroissant)
    for (let m = 12; m >= 1; m--) {
      const mKey = String(m).padStart(2, "0");
      const d = mStats[mKey] || { conso:0, prod:0, g1:0, g2:0, randa:0, bvm:0, smt:0, aux:0 };

      totConso += d.conso;
      totProd  += d.prod;
      totG1    += d.g1;
      totG2    += d.g2;
      totRanda += d.randa;
      totBvm   += d.bvm;
      totSmt   += d.smt;
      totAux   += d.aux;

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

    // Ligne des totaux annuels
    tfoot.innerHTML = `
      <tr>
        <td>TOTAL ANNUEL (${year})</td>
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
    console.error("Erreur chargement bilan annuel :", err);
    tbody.innerHTML = '<tr><td colspan="9" style="color:#ef4444;">Erreur lors du chargement des données.</td></tr>';
  }
}

// ===== LOGIQUE DES ARRÊTS DU MOIS =====
async function loadStoppagesData() {
  const monthInput = document.getElementById("monthSelect");
  if (!monthInput || !monthInput.value) return;

  const month = monthInput.value;
  
  document.getElementById("g1TableBody").innerHTML = '<tr><td colspan="5">Chargement...</td></tr>';
  document.getElementById("g2TableBody").innerHTML = '<tr><td colspan="5">Chargement...</td></tr>';

  const url = SHEET_URL + "?action=stoppages&month=" + encodeURIComponent(month);

  try {
    const res = await fetch(url);
    const json = await res.json();

    if (!json.ok) throw new Error("Erreur de données");

    processAndDisplayStoppages(json.data);
  } catch (err) {
    console.error("Erreur chargement arrêts :", err);
    document.getElementById("g1TableBody").innerHTML = '<tr><td colspan="5" style="color:#ef4444;">Erreur de chargement</td></tr>';
    document.getElementById("g2TableBody").innerHTML = '<tr><td colspan="5" style="color:#ef4444;">Erreur de chargement</td></tr>';
  }
}

function processAndDisplayStoppages(monthData) {
  const g1Stoppages = [];
  const g2Stoppages = [];
  const POWER_THRESHOLD = 0.4; // Seuil < 400W

  Object.keys(monthData).sort().forEach(dateStr => {
    const rows = monthData[dateStr];
    if (!rows || rows.length === 0) return;

    let g1Start = null;
    let g2Start = null;

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const curSec = timeToSec(r.time);

      if (r.g1 < POWER_THRESHOLD && g1Start === null) {
        g1Start = { time: r.time, sec: curSec };
      } else if (r.g1 >= POWER_THRESHOLD && g1Start !== null) {
        const durationSec = curSec - g1Start.sec;
        evaluateAndPush(g1Stoppages, dateStr, g1Start.time, r.time, durationSec);
        g1Start = null;
      }

      if (r.g2 < POWER_THRESHOLD && g2Start === null) {
        g2Start = { time: r.time, sec: curSec };
      } else if (r.g2 >= POWER_THRESHOLD && g2Start !== null) {
        const durationSec = curSec - g2Start.sec;
        evaluateAndPush(g2Stoppages, dateStr, g2Start.time, r.time, durationSec);
        g2Start = null;
      }
    }

    if (g1Start !== null) {
      const lastRow = rows[rows.length - 1];
      const durationSec = timeToSec(lastRow.time) - g1Start.sec;
      evaluateAndPush(g1Stoppages, dateStr, g1Start.time, lastRow.time, durationSec);
    }
    if (g2Start !== null) {
      const lastRow = rows[rows.length - 1];
      const durationSec = timeToSec(lastRow.time) - g2Start.sec;
      evaluateAndPush(g2Stoppages, dateStr, g2Start.time, lastRow.time, durationSec);
    }
  });

  renderStoppageTable("g1TableBody", g1Stoppages);
  renderStoppageTable("g2TableBody", g2Stoppages);

  updateStoppageTotals("g1TotCorr", "g1TotPrev", g1Stoppages);
  updateStoppageTotals("g2TotCorr", "g2TotPrev", g2Stoppages);
}

function evaluateAndPush(list, dateStr, startTime, endTime, durationSec) {
  const minMinutes = 3;
  const maxCorrectiveMinutes = 90;

  const durationMin = durationSec / 60;
  if (durationMin < minMinutes) return;

  const type = durationMin <= maxCorrectiveMinutes ? "Correctif" : "Préventif";

  list.push({
    date: dateStr,
    start: startTime,
    end: endTime,
    durationSec: durationSec,
    type: type
  });
}

function renderStoppageTable(elementId, stoppages) {
  const tbody = document.getElementById(elementId);
  tbody.innerHTML = "";

  if (stoppages.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="color:#94a3b8;">Aucun arrêt enregistré ce mois</td></tr>';
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
  let countCorr = 0, durCorr = 0;
  let countPrev = 0, durPrev = 0;

  stoppages.forEach(s => {
    if (s.type === "Correctif") {
      countCorr++;
      durCorr += s.durationSec;
    } else {
      countPrev++;
      durPrev += s.durationSec;
    }
  });

  document.getElementById(corrId).innerText = `${countCorr} (${formatDuration(durCorr)})`;
  document.getElementById(prevId).innerText = `${countPrev} (${formatDuration(durPrev)})`;
}
