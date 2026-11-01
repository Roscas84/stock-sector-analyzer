/**
 * LEVEL 2.7 HANDLER - Peter Lynch GARP Analysis
 * Growth At Reasonable Price
 */

window.evaluateLynchScore = function(company) {
  const growth = company.revenueGrowthYoY || 0;
  const pe = company.peRatio || 0;
  const peg = growth > 0 ? pe / growth : 999;

  let signal = "❌ EVITA";
  let score = 0;

  if (growth < 5) {
    signal = "🐢 LENTO";
    score = 20;
  } else if (growth >= 5 && growth < 10) {
    if (peg < 1.5) {
      signal = "🟡 VALOR";
      score = 60;
    } else {
      signal = "😴 CARO";
      score = 40;
    }
  } else if (growth >= 10 && growth < 20) {
    if (peg < 1.0) {
      signal = "🚀 GARP IDEAL";
      score = 100;
    } else if (peg < 1.5) {
      signal = "✅ GARP BUENO";
      score = 85;
    } else {
      signal = "⚠️ CARO";
      score = 50;
    }
  } else {
    if (peg < 1.5) {
      signal = "🔥 ALTA CALIDAD";
      score = 95;
    } else {
      signal = "📈 CRECIMIENTO";
      score = 70;
    }
  }

  return {
    growth,
    peRatio: pe,
    pegRatio: peg,
    signal,
    score
  };
};

window.showLynchAnalysis = function(market) {
  if (!appData || !appData.markets || !appData.markets[market]) {
    document.getElementById('app').innerHTML = `<div class="container"><h1>❌ Sin datos</h1></div>`;
    return;
  }

  currentMarket = market;
  const companies = appData.markets[market].companies
    .map(c => ({ ...c, lynch: evaluateLynchScore(c) }))
    .filter(c => c.lynch.growth > 5)
    .sort((a, b) => b.lynch.score - a.lynch.score);

  let html = `
    <div class="container">
      <h1>🚀 Peter Lynch GARP - ${market}</h1>
      <button onclick="showStart()" style="background: #6366f1; margin-bottom: 20px;">← Volver</button>

      <div style="background: #1e293b; padding: 15px; border-left: 4px solid #10b981; margin: 20px 0; border-radius: 6px;">
        <p style="color: #86efac; margin: 0; font-weight: 600;">💡 Growth At Reasonable Price</p>
        <p style="color: #cbd5e1; margin: 5px 0 0 0; font-size: 12px;">Empresas con crecimiento > 10% pero precio justo (PEG < 1.5)</p>
      </div>
  `;

  companies.forEach(c => {
    const lynch = c.lynch;
    const pegColor = lynch.pegRatio < 1.0 ? '#4ade80' : lynch.pegRatio < 1.5 ? '#60a5fa' : '#fbbf24';

    html += `
      <div style="background: #1e293b; border-left: 4px solid ${pegColor}; padding: 15px; margin: 12px 0; border-radius: 6px;">
        <div style="display: flex; justify-content: space-between;">
          <div>
            <p style="margin: 0; color: #4ade80; font-weight: bold;">${c.ticker}</p>
            <p style="margin: 5px 0 0 0; color: #94a3b8; font-size: 12px;">${c.name}</p>
          </div>
          <div style="text-align: right;">
            <p style="color: ${pegColor}; margin: 0; font-size: 18px; font-weight: bold;">PEG: ${lynch.pegRatio.toFixed(2)}</p>
            <p style="color: #cbd5e1; margin: 2px 0 0 0; font-size: 12px;">${lynch.signal}</p>
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-top: 10px; font-size: 12px;">
          <div><p style="color: #94a3b8; margin: 0; font-size: 10px;">Crecimiento</p><p style="color: #4ade80; margin: 3px 0 0 0; font-weight: bold;">${lynch.growth.toFixed(1)}%</p></div>
          <div><p style="color: #94a3b8; margin: 0; font-size: 10px;">P/E</p><p style="color: #60a5fa; margin: 3px 0 0 0; font-weight: bold;">${lynch.peRatio.toFixed(1)}</p></div>
          <div><p style="color: #94a3b8; margin: 0; font-size: 10px;">Score Lynch</p><p style="color: ${lynch.score >= 80 ? '#4ade80' : lynch.score >= 60 ? '#60a5fa' : '#fbbf24'}; margin: 3px 0 0 0; font-weight: bold;">${lynch.score}/100</p></div>
        </div>
      </div>
    `;
  });

  html += `</div>`;
  document.getElementById('app').innerHTML = html;
};
