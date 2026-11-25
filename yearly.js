const SHEET_URL = "https://script.google.com/macros/s/AKfycbzlRCv9mpWRrQ_XT0R5bmlCJAKrl9xjFmxCuPVdeMXk8OUk5fgkRpaD6bGLAZXfrVtFqQ/exec";

const MONTH_NAMES = {
  "01": "Janvier", "02": "Février", "03": "Mars", "04": "Avril",
  "05": "Mai", "06": "Juin", "07": "Juillet", "08": "Août",
  "09": "Septembre", "10": "Octobre", "11": "Novembre", "12": "Décembre"
};

function fmtNum(n) {
  return Number(n || 0).toLocaleString("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

function initYearlyPage() {
  const now = new Date();
  const year = now.getFullYear();

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

  loadYearlyData();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initYearlyPage);
} else {
  initYearlyPage();
}

async function loadYearlyData() {
  const yearSelect = document.getElementById("yearSelect");
  if (!yearSelect || !yearSelect.value) return;

  const year = yearSelect.value;
  const tbody = document.getElementById("yearlyTableBody");
  const tfoot = document.getElementById("yearlyTableFoot");

  if (tbody) {
    tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding: 15px;">Chargement des données en cours...</td></tr>';
  }
  if (tfoot) tfoot.innerHTML = "";

  const url = `${SHEET_URL}?action=yearly&year=${encodeURIComponent(year)}&_t=${Date.now()}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.ok || !json.monthly) throw new Error(json.error || "Données annuelles indisponibles");

    const mStats = json.monthly;
    tbody.innerHTML = "";

    let totConso = 0, totProd = 0, totG1 = 0, totG2 = 0;
    let totRanda = 0, totBvm = 0, totSmt = 0, totAux = 0;

    for (let m = 12; m >= 1; m--) {
      const mKey = String(m).padStart(2, "0");
      const d = mStats[mKey] || { conso: 0, prod: 0, g1: 0, g2: 0, randa: 0, bvm: 0, smt: 0, aux: 0 };

      totConso += Number(d.conso) || 0;
      totProd  += Number(d.prod)  || 0;
      totG1    += Number(d.g1)    || 0;
      totG2    += Number(d.g2)    || 0;
      totRanda += Number(d.randa) || 0;
      totBvm   += Number(d.bvm)   || 0;
      totSmt   += Number(d.smt)   || 0;
      totAux   += Number(d.aux)   || 0;

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

    if (tfoot) {
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
    }
  } catch (err) {
    console.error("Erreur bilan annuel :", err);
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="9" style="color:#ef4444; text-align:center; padding: 15px;">❌ ${err.message}</td></tr>`;
    }
  }
}
