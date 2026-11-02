/**
 * LEVEL 2.3 HANDLER - Benjamin Graham Dividend Income
 * Busca empresas con dividendo sostenible y creciente
 */

window.evaluateGrahamDividend = function(company) {
  const dividend = company.dividendYield || 0;
  const de = company.debtToEquity || 0;
  const fcf = company.freeCashFlow || 0;
  const margin = company.netProfitMargin || 0;

  let signal = "❌ NO APTO";
  let score = 0;

  // Necesita dividendo mínimo
  if (dividend < 1.5) {
    signal = "🔴 SIN DIVIDENDO";
    score = 10;
  } else if (dividend >= 1.5 && dividend < 3) {
    // Dividendo bajo pero presente
    if (de < 1.5 && fcf > 0 && margin > 5) {
      signal = "🟡 MODESTO";
      score = 60;
    } else {
      signal = "⚠️ DÉBIL";
      score = 35;
    }
  } else if (dividend >= 3 && dividend < 5) {
    // Dividendo interesante
    if (de < 1.0 && fcf > 0 && margin > 8) {
      signal = "✅ INGRESO SÓLIDO";
      score = 80;
    } else if (de < 1.5 && fcf > 0) {
      signal = "🟡 INGRESOS";
      score = 65;
    } else {
      signal = "⚠️ RIESGOSO";
      score = 40;
    }
  } else {
    // Dividendo alto (> 5%)
    if (de < 1.0 && fcf > 0) {
      signal = "🔥 EXCELENTE";
      score = 95;
    } else if (de < 1.5) {
      signal = "💰 ATRACTIVO";
      score = 85;
    } else {
      signal = "⚠️ INSOSTENIBLE";
      score = 35;
    }
  }

  return { dividend, debtToEquity: de, freeCashFlow: fcf, margin, signal, score };
};

window.showGrahamAnalysis = function(market) {
  if (!window.appData || !window.appData.markets || !window.appData.markets[market]) {
    document.getElementById('app').innerHTML = `<div class="container"><h1>❌ Sin datos</h1></div>`;
    return;
  }

  window.currentMarket = market;
  const companies = window.appData.markets[market].companies
    .map(c => ({ ...c, graham: evaluateGrahamDividend(c) }))
    .filter(c => c.graham.dividend >= 1.5)
    .sort((a, b) => b.graham.score - a.graham.score);

  let html = `
    <div class="container">
      <h1>💰 Benjamin Graham Income - ${market}</h1>
      <button onclick="showStart()" style="background: #6366f1; margin-bottom: 20px;">← Volver</button>

      <div style="background: #1e293b; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0; border-radius: 6px;">
        <p style="color: #fbbf24; margin: 0; font-weight: 600;">💡 Ingreso por Dividendos</p>
        <p style="color: #cbd5e1; margin: 5px 0 0 0; font-size: 12px;">Empresas con dividendo sostenible (> 3%) y deuda controlada</p>
      </div>
  `;

  if (companies.length === 0) {
    html += `<p style="color: #94a3b8; text-align: center; padding: 40px;">No hay empresas con dividendo significativo en este mercado</p>`;
  } else {
    companies.forEach(c => {
      const graham = c.graham;
      const divColor = graham.dividend >= 5 ? '#4ade80' : graham.dividend >= 3 ? '#60a5fa' : '#fbbf24';

      html += `
        <div style="background: #1e293b; border-left: 4px solid ${divColor}; padding: 15px; margin: 12px 0; border-radius: 6px;">
          <div style="display: flex; justify-content: space-between;">
            <div>
              <p style="margin: 0; color: #4ade80; font-weight: bold;">${c.ticker}</p>
              <p style="margin: 5px 0 0 0; color: #94a3b8; font-size: 12px;">${c.name}</p>
            </div>
            <div style="text-align: right;">
              <p style="color: ${divColor}; margin: 0; font-size: 24px; font-weight: bold;">${graham.dividend.toFixed(2)}%</p>
              <p style="color: #cbd5e1; margin: 2px 0 0 0; font-size: 11px;">Dividend Yield</p>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 8px; margin-top: 12px; font-size: 11px;">
            <div>
              <p style="color: #94a3b8; margin: 0; font-size: 9px;">D/E</p>
              <p style="color: ${graham.debtToEquity < 1 ? '#4ade80' : graham.debtToEquity < 1.5 ? '#60a5fa' : '#fbbf24'}; margin: 3px 0 0 0; font-weight: bold;">${graham.debtToEquity.toFixed(2)}</p>
            </div>
            <div>
              <p style="color: #94a3b8; margin: 0; font-size: 9px;">FCF</p>
              <p style="color: ${graham.freeCashFlow > 0 ? '#4ade80' : '#fbbf24'}; margin: 3px 0 0 0; font-weight: bold;">${graham.freeCashFlow > 0 ? '✅' : '❌'}</p>
            </div>
            <div>
              <p style="color: #94a3b8; margin: 0; font-size: 9px;">Margen</p>
              <p style="color: ${graham.margin > 10 ? '#4ade80' : graham.margin > 5 ? '#60a5fa' : '#fbbf24'}; margin: 3px 0 0 0; font-weight: bold;">${graham.margin.toFixed(1)}%</p>
            </div>
            <div>
              <p style="color: #94a3b8; margin: 0; font-size: 9px;">Score</p>
              <p style="color: ${graham.score >= 80 ? '#4ade80' : graham.score >= 60 ? '#60a5fa' : '#fbbf24'}; margin: 3px 0 0 0; font-weight: bold;">${graham.score}</p>
            </div>
          </div>

          <div style="background: #0f172a; padding: 8px; border-radius: 3px; margin-top: 10px;">
            <p style="color: ${graham.signal.includes('EXCELENTE') ? '#4ade80' : graham.signal.includes('SÓLIDO') ? '#60a5fa' : graham.signal.includes('MODESTO') ? '#fbbf24' : '#fbbf24'}; margin: 0; font-size: 12px; font-weight: bold;">${graham.signal}</p>
          </div>
        </div>
      `;
    });
  }

  html += `</div>`;
  document.getElementById('app').innerHTML = html;
};
