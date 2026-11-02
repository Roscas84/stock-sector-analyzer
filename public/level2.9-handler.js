/**
 * LEVEL 2.9 HANDLER - Philip Fisher Quality Growth
 * Management excelente + Crecimiento sostenible
 * "Common Stocks and Uncommon Profits"
 */

window.evaluateFisherQuality = function(company) {
  const roe = company.roic || 0;
  const growth = company.revenueGrowthYoY || 0;
  const margin = company.netProfitMargin || 0;
  const de = company.debtToEquity || 0;
  const fcf = company.freeCashFlow || 0;

  let signal = "❌ NO APLICA";
  let score = 0;

  // ZOOM FILTER: Datos mínimos para Fisher
  const hasROE = company.hasOwnProperty('roic') && roe > 0;
  const hasGrowth = company.hasOwnProperty('revenueGrowthYoY') && growth !== null;
  const hasDE = company.hasOwnProperty('debtToEquity') && de >= 0;

  if (!hasROE || !hasGrowth || !hasDE) {
    return {
      roe: roe,
      growth: growth,
      margin: margin,
      debtToEquity: de,
      freeCashFlow: fcf,
      quality_score: 0,
      growth_score: 0,
      signal: "⚪ DATOS INCOMPLETOS",
      score: 0
    };
  }

  // FILTER: Fisher necesita CALIDAD + CRECIMIENTO
  // Rechaza si ROE muy bajo Y Growth muy bajo
  if ((roe < 5 && growth < 5) || (roe < 0 && growth < 0)) {
    return {
      roe: roe,
      growth: growth,
      margin: margin,
      debtToEquity: de,
      freeCashFlow: fcf,
      quality_score: 0,
      growth_score: 0,
      signal: "❌ SIN CALIDAD NI CRECIMIENTO",
      score: 0
    };
  }

  // Fisher busca: Management de CALIDAD + CRECIMIENTO SOSTENIBLE
  // Componente 1: Calidad (ROE, margen, deuda baja)
  let quality_score = 0;
  if (roe >= 15 && margin >= 10 && de < 1.0 && fcf > 0) quality_score = 90;
  else if (roe >= 12 && margin >= 8 && de < 1.5 && fcf > 0) quality_score = 75;
  else if (roe >= 10 && margin >= 5 && de < 2.0 && fcf > 0) quality_score = 60;
  else if (roe >= 5 && margin >= 3 && de < 2.5) quality_score = 40;
  else quality_score = 20;

  // Componente 2: Crecimiento SOSTENIBLE (no especulativo)
  let growth_score = 0;
  if (growth >= 15 && growth <= 40) growth_score = 90;     // Crecimiento ideal
  else if (growth >= 10 && growth < 15) growth_score = 80; // Crecimiento muy bueno
  else if (growth >= 5 && growth < 10) growth_score = 70;  // Crecimiento bueno
  else if (growth >= 0 && growth < 5) growth_score = 50;   // Crecimiento bajo
  else if (growth < 0) growth_score = 10;                  // Decrecimiento
  else growth_score = 0;

  // Fisher: Calidad + Crecimiento
  score = (quality_score * 0.6) + (growth_score * 0.4);

  // Determinar señal
  if (score >= 80) {
    signal = "🌟 JOYA DE CALIDAD";
  } else if (score >= 70) {
    signal = "✅ CALIDAD BUENA";
  } else if (score >= 60) {
    signal = "🟡 CALIDAD ACEPTABLE";
  } else if (score >= 50) {
    signal = "⚠️ CALIDAD DÉBIL";
  } else {
    signal = "❌ NO APLICA";
  }

  return {
    roe: roe,
    growth: growth,
    margin: margin,
    debtToEquity: de,
    freeCashFlow: fcf,
    quality_score: quality_score,
    growth_score: growth_score,
    signal: signal,
    score: Math.round(score)
  };
};

window.showFisherAnalysis = function(market) {
  if (!window.appData || !window.appData.markets || !window.appData.markets[market]) {
    document.getElementById('app').innerHTML = `<div class="container"><h1>❌ Sin datos</h1></div>`;
    return;
  }

  window.currentMarket = market;
  const companies = window.appData.markets[market].companies
    .map(c => ({ ...c, fisher: evaluateFisherQuality(c) }))
    .filter(c => c.fisher.score >= 50)
    .sort((a, b) => b.fisher.score - a.fisher.score);

  let html = `
    <div class="container">
      <h1>🌟 Philip Fisher Quality Growth - ${market}</h1>
      <button onclick="showStart()" style="background: #6366f1; margin-bottom: 20px;">← Volver</button>

      <div style="background: #1e293b; padding: 15px; border-left: 4px solid #fbbf24; margin: 20px 0; border-radius: 6px;">
        <p style="color: #fbbf24; margin: 0; font-weight: 600;">💡 Calidad de Management + Crecimiento Sostenible</p>
        <p style="color: #cbd5e1; margin: 5px 0 0 0; font-size: 12px;">Empresas con excelente management que crecen a largo plazo</p>
      </div>

      <p style="color: #cbd5e1; font-size: 12px; margin: 15px 0;">
        <strong>Estrategia:</strong> Busca empresas de ALTA CALIDAD con crecimiento SOSTENIBLE.
        Requiere: ROE > 15% + Growth 10-40% + Margen > 10% + Deuda baja
      </p>
  `;

  if (companies.length === 0) {
    html += `
      <div style="background: #7c2d12; padding: 20px; border-radius: 8px; text-align: center;">
        <p style="color: #fdba74;">No hay empresas de alta calidad en ${market}</p>
      </div>
    `;
  } else {
    html += `<p style="color: #4ade80; font-weight: 600; margin: 20px 0;">✅ ${companies.length} empresas de calidad encontradas</p>`;

    companies.forEach((item, idx) => {
      const c = item;
      const f = item.fisher;
      const badgeColor = f.score >= 80 ? '#10b981' : f.score >= 70 ? '#f59e0b' : '#6366f1';

      html += `
        <div class="company-card">
          <div style="background: ${badgeColor}; color: white; display: inline-block; padding: 8px 12px; border-radius: 6px; margin-bottom: 12px; font-weight: 600; font-size: 12px;">
            ${f.signal} (${f.score}/100)
          </div>

          <div class="company-header">
            <div class="company-name">
              <h3>${c.ticker}</h3>
              <p>${c.name}</p>
            </div>
            <div class="company-ticker">${c.sector}</div>
          </div>

          <div class="divider"></div>

          <div class="metrics-grid">
            <div class="metric">
              <div class="metric-label">ROE <span class="info-icon" onclick="openModal('metrics', 'roe')">?</span></div>
              <div class="metric-value">${f.roe.toFixed(1)}%</div>
            </div>
            <div class="metric">
              <div class="metric-label">Crecimiento <span class="info-icon" onclick="openModal('metrics', 'crecimiento')">?</span></div>
              <div class="metric-value">${f.growth.toFixed(1)}%</div>
            </div>
            <div class="metric">
              <div class="metric-label">Margen Neto <span class="info-icon" onclick="openModal('metrics', 'margen')">?</span></div>
              <div class="metric-value">${f.margin.toFixed(1)}%</div>
            </div>
            <div class="metric">
              <div class="metric-label">D/E <span class="info-icon" onclick="openModal('metrics', 'de')">?</span></div>
              <div class="metric-value">${f.debtToEquity.toFixed(2)}</div>
            </div>
            <div class="metric">
              <div class="metric-label">FCF (B) <span class="info-icon" onclick="openModal('metrics', 'fcf')">?</span></div>
              <div class="metric-value">${f.freeCashFlow.toFixed(1)}</div>
            </div>
            <div class="metric">
              <div class="metric-label">Calidad Score</div>
              <div class="metric-value">${f.quality_score}/100</div>
            </div>
          </div>

          <div class="divider"></div>

          <div style="background: #0f172a; padding: 12px; border-radius: 6px; margin: 12px 0;">
            <p style="color: #cbd5e1; font-size: 12px; margin: 0;">
              <strong>Filosofía Fisher:</strong> ${f.score >= 80 ? '✨ Excelente empresa con excelente management y crecimiento sostenible' : 'Empresa de calidad con crecimiento potencial'}
            </p>
          </div>
        </div>
      `;
    });
  }

  html += `</div>`;
  document.getElementById('app').innerHTML = html;
};
