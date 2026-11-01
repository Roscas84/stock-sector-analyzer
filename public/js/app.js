// ===== DATOS =====
const SECTORS = ['Industrial', 'Technology', 'Healthcare', 'Financiero', 'Consumo', 'Energia'];

const COMPANIES_BY_SECTOR = {
  'Industrial': [
    { ticker: 'CAT', name: 'Caterpillar Inc.', debtToEquity: 1.2, netProfitMargin: 8.5, revenueGrowthYoY: 7.2, currentRatio: 1.3, peRatio: 14.5, sectorAvgPE: 16, roic: 12.3, operatingMarginTrend: 'up', freeCashFlow: 2.1e9, shortTermDebtRatio: 15 },
    { ticker: 'BA', name: 'The Boeing Company', debtToEquity: 1.8, netProfitMargin: 4.2, revenueGrowthYoY: 3.1, currentRatio: 0.9, peRatio: 25, sectorAvgPE: 16, roic: 8.1, operatingMarginTrend: 'flat', freeCashFlow: -1.2e9, shortTermDebtRatio: 35 },
    { ticker: 'MMM', name: '3M Company', debtToEquity: 1.1, netProfitMargin: 6.8, revenueGrowthYoY: 4.5, currentRatio: 1.4, peRatio: 13.2, sectorAvgPE: 16, roic: 10.9, operatingMarginTrend: 'up', freeCashFlow: 1.8e9, shortTermDebtRatio: 12 },
    { ticker: 'GE', name: 'General Electric', debtToEquity: 1.5, netProfitMargin: 5.2, revenueGrowthYoY: 2.1, currentRatio: 1.1, peRatio: 18.5, sectorAvgPE: 16, roic: 9.2, operatingMarginTrend: 'flat', freeCashFlow: 0.9e9, shortTermDebtRatio: 20 },
  ],
  'Technology': [
    { ticker: 'AAPL', name: 'Apple Inc.', debtToEquity: 0.85, netProfitMargin: 25.3, revenueGrowthYoY: 5.1, currentRatio: 1.1, peRatio: 28.5, sectorAvgPE: 35, roic: 89.5, operatingMarginTrend: 'up', freeCashFlow: 110.5e9, shortTermDebtRatio: 8 },
    { ticker: 'MSFT', name: 'Microsoft Corporation', debtToEquity: 0.7, netProfitMargin: 34.2, revenueGrowthYoY: 16.0, currentRatio: 1.5, peRatio: 32.1, sectorAvgPE: 35, roic: 42.3, operatingMarginTrend: 'up', freeCashFlow: 80.2e9, shortTermDebtRatio: 5 },
    { ticker: 'GOOGL', name: 'Alphabet Inc.', debtToEquity: 0.6, netProfitMargin: 21.5, revenueGrowthYoY: 11.3, currentRatio: 2.0, peRatio: 24.3, sectorAvgPE: 35, roic: 35.2, operatingMarginTrend: 'up', freeCashFlow: 60.4e9, shortTermDebtRatio: 3 },
  ],
  'Healthcare': [
    { ticker: 'JNJ', name: 'Johnson & Johnson', debtToEquity: 0.95, netProfitMargin: 16.2, revenueGrowthYoY: 3.4, currentRatio: 1.3, peRatio: 23.5, sectorAvgPE: 25, roic: 28.4, operatingMarginTrend: 'flat', freeCashFlow: 27.5e9, shortTermDebtRatio: 10 },
    { ticker: 'UNH', name: 'UnitedHealth Group', debtToEquity: 1.2, netProfitMargin: 7.1, revenueGrowthYoY: 14.2, currentRatio: 1.2, peRatio: 18.5, sectorAvgPE: 25, roic: 15.3, operatingMarginTrend: 'up', freeCashFlow: 8.2e9, shortTermDebtRatio: 15 },
  ],
  'Financiero': [
    { ticker: 'JPM', name: 'JPMorgan Chase', debtToEquity: 8.2, netProfitMargin: 18.5, revenueGrowthYoY: 8.1, currentRatio: 1.0, peRatio: 10.2, sectorAvgPE: 11, roic: 14.2, operatingMarginTrend: 'up', freeCashFlow: 52.3e9, shortTermDebtRatio: 25 },
  ],
  'Consumo': [
    { ticker: 'WMT', name: 'Walmart Inc.', debtToEquity: 0.65, netProfitMargin: 2.8, revenueGrowthYoY: 5.2, currentRatio: 1.0, peRatio: 28.5, sectorAvgPE: 32, roic: 8.2, operatingMarginTrend: 'up', freeCashFlow: 14.2e9, shortTermDebtRatio: 15 },
  ],
  'Energia': [
    { ticker: 'XOM', name: 'Exxon Mobil', debtToEquity: 1.1, netProfitMargin: 8.5, revenueGrowthYoY: 12.3, currentRatio: 1.2, peRatio: 9.5, sectorAvgPE: 10, roic: 9.8, operatingMarginTrend: 'up', freeCashFlow: 26.1e9, shortTermDebtRatio: 18 },
  ],
};

// ===== CRITERIOS =====
function evaluateLevel1(company) {
  const criteria = [];
  if (company.debtToEquity !== null && company.debtToEquity < 1.5) criteria.push(true); else criteria.push(false);
  if (company.netProfitMargin !== null && company.netProfitMargin > 5) criteria.push(true); else criteria.push(false);
  if (company.revenueGrowthYoY !== null && company.revenueGrowthYoY > 5) criteria.push(true); else criteria.push(false);
  if (company.currentRatio !== null && company.currentRatio > 1.0) criteria.push(true); else criteria.push(false);
  if (company.peRatio !== null && company.sectorAvgPE !== null && company.peRatio < company.sectorAvgPE) criteria.push(true); else criteria.push(false);

  const passed = criteria.filter(c => c).length >= 4;
  const score = Math.round((criteria.filter(c => c).length / criteria.length) * 100);
  return { passed, score };
}

function evaluateLevel2(company) {
  if (!company.level1Pass) return { passed: false, score: 0 };

  const criteria = [];
  if (company.roic !== null && company.roic > 10) criteria.push(true); else criteria.push(false);
  if (company.operatingMarginTrend === 'up' || company.operatingMarginTrend === 'flat') criteria.push(true); else criteria.push(false);
  if (company.freeCashFlow !== null && company.freeCashFlow > 0) criteria.push(true); else criteria.push(false);
  if (company.shortTermDebtRatio !== null && company.shortTermDebtRatio < 20) criteria.push(true); else criteria.push(false);

  const passed = criteria.filter(c => c).length >= 3;
  const score = Math.round((criteria.filter(c => c).length / criteria.length) * 100);
  return { passed, score };
}

// ===== STATE =====
let currentSector = null;
let currentAnalysis = null;
let analysisLevel = 1;

// ===== INICIALIZACIÓN =====
function initApp() {
  console.log('✅ App inicializada');
  renderSectorSelector();
}

function renderSectorSelector() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="container">
      <h1 style="color: #4ade80; margin-bottom: 30px;">📊 Stock Sector Analyzer</h1>
      <p style="margin-bottom: 30px;">Selecciona un sector para analizar</p>
      <div class="sectors-grid">
        ${SECTORS.map(sector => `
          <button class="sector-btn" onclick="analyzeSector('${sector}')">
            ${sector}
          </button>
        `).join('')}
      </div>
    </div>
  `;
}

window.analyzeSector = function(sector) {
  console.log('Analizando sector:', sector);
  currentSector = sector;
  analysisLevel = 1;

  const companies = (COMPANIES_BY_SECTOR[sector] || []).map(company => {
    const level1 = evaluateLevel1(company);
    return {
      ...company,
      level1Pass: level1.passed,
      level1Score: level1.score,
      semafor: level1.passed ? 'green' : 'yellow',
    };
  });

  currentAnalysis = { sector, level: 1, companies };
  renderAnalysisResults(companies, 1, sector);
};

function renderAnalysisResults(companies, level, sector) {
  const app = document.getElementById('app');

  const greenCount = companies.filter(c => c.semafor === 'green').length;
  const yellowCount = companies.filter(c => c.semafor === 'yellow').length;

  const sorted = [...companies].sort((a, b) => {
    return (b.level1Score || 0) - (a.level1Score || 0);
  });

  let tableHTML = `
    <table class="analysis-table">
      <thead>
        <tr>
          <th>Empresa</th>
          <th>Score</th>
          <th>D/E</th>
          <th>Margin</th>
          <th>Growth</th>
          <th>Liquidity</th>
          <th>P/E</th>
          <th>Estado</th>
        </tr>
      </thead>
      <tbody>
  `;

  sorted.forEach(company => {
    const emoji = company.semafor === 'green' ? '🟢' : '🟡';
    tableHTML += `
      <tr>
        <td><strong>${company.ticker}</strong><div style="font-size: 12px; color: #9ca3af;">${company.name}</div></td>
        <td style="text-align: center; font-weight: bold;">${company.level1Score}</td>
        <td style="text-align: center; font-size: 12px;">${company.debtToEquity?.toFixed(2) || '-'}</td>
        <td style="text-align: center; font-size: 12px;">${company.netProfitMargin?.toFixed(1) || '-'}%</td>
        <td style="text-align: center; font-size: 12px;">${company.revenueGrowthYoY?.toFixed(1) || '-'}%</td>
        <td style="text-align: center; font-size: 12px;">${company.currentRatio?.toFixed(2) || '-'}</td>
        <td style="text-align: center; font-size: 12px;">${company.peRatio?.toFixed(1) || '-'}</td>
        <td style="text-align: center;"><span class="semafor ${company.semafor}">${emoji}</span></td>
      </tr>
    `;
  });

  tableHTML += `</tbody></table>`;

  app.innerHTML = `
    <div class="container">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
        <div>
          <h1 style="color: #4ade80; margin-bottom: 10px;">${sector}</h1>
          <p style="color: #9ca3af;">Nivel ${level} • ${companies.length} empresas</p>
        </div>
        <button class="back-btn" onclick="goBack()">← Volver</button>
      </div>

      <div class="stats-grid">
        <div class="stat-box green">
          <div class="stat-number">${greenCount}</div>
          <div class="stat-label">Verde (Compra)</div>
        </div>
        <div class="stat-box yellow">
          <div class="stat-number">${yellowCount}</div>
          <div class="stat-label">Amarillo (Espera)</div>
        </div>
      </div>

      ${tableHTML}

      <button class="refine-btn" onclick="refineLevel2()">
        ✨ Refinar a Nivel 2 (Solo Verdes)
      </button>
    </div>
  `;
}

window.refineLevel2 = function() {
  if (!currentAnalysis) return;

  const greenCompanies = currentAnalysis.companies.filter(c => c.level1Pass);

  const refined = greenCompanies.map(company => {
    const level2 = evaluateLevel2(company);
    return {
      ...company,
      level2Pass: level2.passed,
      level2Score: level2.score,
      semafor: level2.passed ? 'green' : 'yellow',
    };
  });

  currentAnalysis.companies = refined;
  currentAnalysis.level = 2;
  analysisLevel = 2;

  renderAnalysisResults(refined, 2, currentSector);
};

window.goBack = function() {
  currentSector = null;
  currentAnalysis = null;
  analysisLevel = 1;
  renderSectorSelector();
};

// Iniciar
initApp();
