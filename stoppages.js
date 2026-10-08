// ===== Google Sheet Web App =====
const SHEET_URL = "https://script.google.com/macros/s/AKfycbyt8R7nLqvJ5JZ52RNuHcM9WHSWxXRoY82mBwcIuHUdUbep46SHx3CfcAbnRbPSb5RgNw/exec";

// Helper : Convertir "HH:mm:ss" en secondes
function timeToSec(t) {
  const p = String(t).substring(0, 8).split(":");
  return (Number(p[0] || 0) * 3600) + (Number(p[1] || 0) * 60) + Number(p[2] || 0);
}

// Helper : Formater la durée
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

// Initialisation au chargement de la page (Mois en cours)
document.addEventListener("DOMContentLoaded", () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  
  const monthInput = document.getElementById("monthSelect");
  if (monthInput) {
    monthInput.value = `${year}-${month}`;
  }
  
  loadStoppagesData();
});

async function loadStoppagesData() {
  const monthInput = document.getElementById("monthSelect");
  if (!monthInput || !monthInput.value) return;

  const month = monthInput.value;
  
  document.getElementById("g1TableBody").innerHTML = '<tr><td colspan="5" style="text-align:center;">Chargement...</td></tr>';
  document.getElementById("g2TableBody").innerHTML = '<tr><td colspan="5" style="text-align:center;">Chargement...</td></tr>';

  const url = SHEET_URL + "?action=stoppages&month=" + encodeURIComponent(month);

  try {
    const res = await fetch(url);
    const json = await res.json();

    if (!json.ok) throw new Error("Erreur lors de la récupération des arrêts");

    processAndDisplayStoppages(json.data);
  } catch (err) {
    console.error("Erreur chargement arrêts :", err);
    document.getElementById("g1TableBody").innerHTML = '<tr><td colspan="5" style="text-align:center; color:#ef4444;">Erreur de chargement</td></tr>';
    document.getElementById("g2TableBody").innerHTML = '<tr><td colspan="5" style="text-align:center; color:#ef4444;">Erreur de chargement</td></tr>';
  }
}

function processAndDisplayStoppages(monthData) {
  const g1Stoppages = [];
  const g2Stoppages = [];
  
  // ⚡ Seuil d'arrêt : Inférieur à 400 Watts (0.4 kW)
  const POWER_THRESHOLD = 0.4; 

  Object.keys(monthData).sort().forEach(dateStr => {
    const rows = monthData[dateStr];
    if (!rows || rows.length === 0) return;

    let g1Start = null;
    let g2Start = null;

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const curSec = timeToSec(r.time);

      // --- Groupe 1 ---
      if (r.g1 < POWER_THRESHOLD && g1Start === null) {
        g1Start = { time: r.time, sec: curSec };
      } else if (r.g1 >= POWER_THRESHOLD && g1Start !== null) {
        const durationSec = curSec - g1Start.sec;
        evaluateAndPush(g1Stoppages, dateStr, g1Start.time, r.time, durationSec);
        g1Start = null;
      }

      // --- Groupe 2 ---
      if (r.g2 < POWER_THRESHOLD && g2Start === null) {
        g2Start = { time: r.time, sec: curSec };
      } else if (r.g2 >= POWER_THRESHOLD && g2Start !== null) {
        const durationSec = curSec - g2Start.sec;
        evaluateAndPush(g2Stoppages, dateStr, g2Start.time, r.time, durationSec);
        g2Start = null;
      }
    }

    // Arrêt se terminant en fin de journée
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
  const maxCorrectiveMinutes = 90; // 1h30 (en minutes)

  const durationMin = durationSec / 60;

  // Moins de 3 minutes -> ignoré
  if (durationMin < minMinutes) return;

  // Entre 3 min et 1h30 -> Correctif, au-delà -> Préventif
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
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#94a3b8;">Aucun arrêt enregistré ce mois</td></tr>';
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
