/**
 * LEVEL 2.8 HANDLER - Joel Greenblatt Magic Formula
 * P/E bajo + ROI alto = Valor + Calidad
 * "The Little Book That Beats the Market"
 */

window.evaluateGreenblatMagic = function(company) {
  const pe = company.peRatio || 0;
  const roe = company.roic || 0;  // ROI proxy
  const fcf = company.freeCashFlow || 0;
  const margin = company.netProfitMargin || 0;

  let signal = "⚠️ NO APLICA";
  let score = 0;

  // ZOOM FILTER: Datos mínimos requeridos
  const hasValidPE = company.hasOwnProperty('peRatio') && pe > 0 && pe < 500;
  const hasValidROI = company.hasOwnProperty('roic') && roe !== null;

  if (!hasValidPE || !hasValidROI) {
    return {
      peRatio: pe,
      roe: roe,
      freeCashFlow: fcf,
      margin: margin,
      pe_score: 0,
      roi_score: 0,
      signal: "⚪ SIN DATOS SUFICIENTES",
      score: 0
    };
  }

  // FILTER: Greenblatt necesita VALOR + CALIDAD
  // Rechaza solo si AMBOS P/E Y ROI son inválidos
  if ((pe <= 0 || pe > 500) && (roe <= 0 || roe > 200)) {
    return {
      peRatio: pe,
      roe: roe,
      freeCashFlow: fcf,
      margin: margin,
      pe_score: 0,
      roi_score: 0,
      signal: "❌ SIN VALOR NI CALIDAD",
      score: 0
    };
  }

  // Magic Formula: P/E bajo + ROI alto
  // Componente 1: P/E bajo (valor)
  let pe_score = 0;
  if (pe > 0 && pe < 10) pe_score = 90;           // Muy barato
  else if (pe >= 10 && pe < 15) pe_score = 75;    // Barato
  else if (pe >= 15 && pe < 20) pe_score = 60;    // Normal
  else if (pe >= 20 && pe < 30) pe_score = 40;    // Caro
  else if (pe >= 30) pe_score = 20;               // Muy caro
  else pe_score = 0;

  // Componente 2: ROI alto (calidad)
  let roi_score = 0;
  if (roe >= 20) roi_score = 90;      // Excelente
  else if (roe >= 15) roi_score = 80; // Muy bueno
  else if (roe >= 10) roi_score = 70; // Bueno
  else if (roe >= 5) roi_score = 40;  // Aceptable
  else roi_score = 10;                // Débil

  // Combinar: Magic Formula
  score = (pe_score * 0.5) + (roi_score * 0.5);

  // Determinar señal
  if (score >= 80) {
    signal = "🚀 MAGIC FORMULA IDEAL";
  } else if (score >= 70) {
    signal = "✅ FÓRMULA MÁGICA BUENA";
  } else if (score >= 60) {
    signal = "🟡 FÓRMULA ACEPTABLE";
  } else if (score >= 50) {
    signal = "⚠️ FÓRMULA DÉBIL";
  } else {
    signal = "❌ NO APLICA";
  }

  return {
    peRatio: pe,
    roe: roe,
    freeCashFlow: fcf,
    margin: margin,
    pe_score: pe_score,
    roi_score: roi_score,
    signal: signal,
    score: Math.round(score)
  };
};

window.showGreenblatAnalysis = function(market) {
  if (!window.appData || !window.appData.markets || !window.appData.markets[market]) {
    document.getElementById('app').innerHTML = `<div class="container"><h1>❌ Sin datos</h1></div>`;
    return;
  }

  window.currentMarket = market;
  const companies = window.appData.markets[market].companies
    .map(c => ({ ...c, greenblatt: evaluateGreenblatMagic(c) }))
    .filter(c => c.greenblatt.score >= 50)
    .sort((a, b) => b.greenblatt.score - a.greenblatt.score);

  let html = `
    <div class="container">
      <h1>🚀 Greenblatt Magic Formula - ${market}</h1>
      <button onclick="showStart()" style="background: #6366f1; margin-bottom: 20px;">← Volver</button>

      <div style="background: #1e293b; padding: 15px; border-left: 4px solid #10b981; margin: 20px 0; border-radius: 6px;">
        <p style="color: #6ee7b7; margin: 0; font-weight: 600;">💡 Magic Formula: P/E bajo + ROI alto</p>
        <p style="color: #cbd5e1; margin: 5px 0 0 0; font-size: 12px;">Empresas con valor (P/E bajo) y calidad (ROI alto)</p>
      </div>

      <p style="color: #cbd5e1; font-size: 12px; margin: 15px 0;">
        <strong>Estrategia:</strong> Busca empresas baratas que generan alto retorno sobre inversión.
        Requiere: P/E bajo (< 15) + ROI alto (> 15%)
      </p>
  `;

  if (companies.length === 0) {
    html += `
      <div style="background: #7c2d12; padding: 20px; border-radius: 8px; text-align: center;">
        <p style="color: #fdba74;">No hay empresas que cumplan criterios Magic Formula en ${market}</p>
      </div>
    `;
  } else {
    html += `<p style="color: #4ade80; font-weight: 600; margin: 20px 0;">✅ ${companies.length} empresas encontradas</p>`;

    companies.forEach((item, idx) => {
      const c = item;
      const g = item.greenblatt;
      const badgeColor = g.score >= 80 ? '#10b981' : g.score >= 70 ? '#f59e0b' : '#6366f1';

      html += `
        <div class="company-card">
          <div style="background: ${badgeColor}; color: white; display: inline-block; padding: 8px 12px; border-radius: 6px; margin-bottom: 12px; font-weight: 600; font-size: 12px;">
            ${g.signal} (${g.score}/100)
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
              <div class="metric-label">P/E Ratio <span class="info-icon" onclick="openModal('metrics', 'pe')">?</span></div>
              <div class="metric-value">${g.peRatio.toFixed(1)}</div>
            </div>
            <div class="metric">
              <div class="metric-label">ROI (ROE) <span class="info-icon">?</span></div>
              <div class="metric-value">${g.roe.toFixed(1)}%</div>
            </div>
            <div class="metric">
              <div class="metric-label">P/E Score</div>
              <div class="metric-value">${g.pe_score}/100</div>
            </div>
            <div class="metric">
              <div class="metric-label">ROI Score</div>
              <div class="metric-value">${g.roi_score}/100</div>
            </div>
            <div class="metric">
              <div class="metric-label">Margen Neto <span class="info-icon">?</span></div>
              <div class="metric-value">${g.margin.toFixed(1)}%</div>
            </div>
            <div class="metric">
              <div class="metric-label">FCF (B) <span class="info-icon">?</span></div>
              <div class="metric-value">${g.freeCashFlow.toFixed(1)}</div>
            </div>
          </div>

          <div class="divider"></div>

          <div style="background: #0f172a; padding: 12px; border-radius: 6px; margin: 12px 0;">
            <p style="color: #cbd5e1; font-size: 12px; margin: 0;">
              <strong>Magic Formula:</strong> ${g.signal === '🚀 MAGIC FORMULA IDEAL' ? 'Excelente oportunidad de valor + calidad' : 'Cumple criterios de valor y calidad'}
            </p>
          </div>
        </div>
      `;
    });
  }

  html += `</div>`;
  document.getElementById('app').innerHTML = html;
};
