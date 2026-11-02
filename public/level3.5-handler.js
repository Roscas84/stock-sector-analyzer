/**
 * LEVEL 3.5 HANDLER - Buffett Deep Dive Analysis
 *
 * Análisis de inversión tipo Warren Buffett:
 * - Moat Score (ventaja competitiva duradera)
 * - Management Quality (eficiencia operativa)
 * - Business Cycle (fase del negocio)
 * - Buffett Final Score (recomendación de compra)
 */

window.evaluateBuffettScore = function(company) {
  const moat = company.moatScore || 0;
  const management = company.managementScore || 0;
  const cycle = company.businessCycle || "STABLE";
  const margin = company.netProfitMargin || 0;
  const fcf = company.freeCashFlow || 0;

  // ZOOM FILTER: Datos mínimos para Buffett
  const hasValidMoat = company.hasOwnProperty('moatScore') && moat >= 0 && moat <= 100;
  const hasValidMgmt = company.hasOwnProperty('managementScore') && management >= 0 && management <= 100;

  if (!hasValidMoat || !hasValidMgmt) {
    return {
      moatScore: moat,
      managementScore: management,
      businessCycle: cycle,
      buffettScore: 0,
      recommendation: "⚪ DATOS INCOMPLETOS",
      signal: "gray"
    };
  }

  // FILTER: Buffett necesita MOAT + MANAGEMENT
  // Rechaza si ambos son muy bajos (< 30)
  if (moat < 30 && management < 30) {
    return {
      moatScore: moat,
      managementScore: management,
      businessCycle: cycle,
      buffettScore: 0,
      recommendation: "❌ SIN VENTAJA COMPETITIVA",
      signal: "red"
    };
  }

  // Buffett Score = promedio ponderado
  // Moat 40% (lo más importante para Buffett)
  // Management 35%
  // Business Cycle 25% (contexto)
  const buffettScore = Math.round((moat * 0.4) + (management * 0.35) + (getCycleScore(cycle) * 0.25));

  // Generar recomendación
  let recommendation = "ESPERA";
  let signal = "🟡";

  if (buffettScore >= 75) {
    recommendation = "🔥 COMPRA FUERTE";
    signal = "green";
  } else if (buffettScore >= 65) {
    recommendation = "✅ COMPRA";
    signal = "green";
  } else if (buffettScore >= 50) {
    recommendation = "🟡 CONSIDERA";
    signal = "yellow";
  } else if (buffettScore < 30) {
    recommendation = "❌ EVITA";
    signal = "red";
  }

  return {
    moatScore: moat,
    managementScore: management,
    businessCycle: cycle,
    buffettScore: buffettScore,
    recommendation: recommendation,
    signal: signal
  };
};

function getCycleScore(cycle) {
  const cycleScores = {
    "STARTUP": 40,    // Alto riesgo
    "GROWTH": 85,     // Ideal
    "MATURE": 70,     // Sólido
    "STABLE": 65,     // Estable
    "DECLINE": 20     // Evitar
  };
  return cycleScores[cycle] || 50;
}

window.showBuffettAnalysis = function(market) {
  if (!window.appData || !window.appData.markets || !window.appData.markets[market]) {
    document.getElementById('app').innerHTML = `
      <div class="container">
        <h1 style="color: #ef4444;">❌ Sin datos</h1>
        <button onclick="showStart()">← Volver</button>
      </div>
    `;
    return;
  }

  window.currentMarket = market;
  const companies = window.appData.markets[market].companies;

  // Evaluar a todos y ordenar por Buffett Score
  const analyzed = companies
    .map(c => ({
      ...c,
      buffett: evaluateBuffettScore(c)
    }))
    .sort((a, b) => b.buffett.buffettScore - a.buffett.buffettScore);

  const topBuys = analyzed.filter(c => c.buffett.recommendation.includes("COMPRA"));
  const maybeOk = analyzed.filter(c => c.buffett.buffettScore >= 50 && c.buffett.buffettScore < 65);

  let html = `
    <div class="container">
      <div class="header">
        <h1>📈 Warren Buffett Analysis - ${market}</h1>
        <button onclick="showStart()" style="background: #6366f1;">← Volver</button>
      </div>

      <div style="background: #1e293b; padding: 20px; border-left: 4px solid #8b5cf6; margin: 20px 0; border-radius: 6px;">
        <h2 style="color: #c084fc; margin: 0 0 10px 0;">🎯 Filosofía Buffett</h2>
        <p style="color: #cbd5e1; margin: 0; font-size: 13px;">
          Invertir en empresas con MOAT (ventaja competitiva), MANAGEMENT excelente, y fase GROWTH o MATURE.
          Esperar el momento correcto, comprar barato, y mantener 20+ años.
        </p>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin: 20px 0;">
        <div style="background: #1e293b; padding: 15px; border-radius: 6px; border-top: 3px solid #4ade80;">
          <p style="color: #cbd5e1; margin: 0 0 5px 0; font-size: 12px;">🔥 COMPRA</p>
          <p style="color: #4ade80; margin: 0; font-size: 24px; font-weight: bold;">${topBuys.length}</p>
        </div>
        <div style="background: #1e293b; padding: 15px; border-radius: 6px; border-top: 3px solid #fbbf24;">
          <p style="color: #cbd5e1; margin: 0 0 5px 0; font-size: 12px;">🟡 CONSIDERA</p>
          <p style="color: #fbbf24; margin: 0; font-size: 24px; font-weight: bold;">${maybeOk.length}</p>
        </div>
        <div style="background: #1e293b; padding: 15px; border-radius: 6px; border-top: 3px solid #ef5350;">
          <p style="color: #cbd5e1; margin: 0 0 5px 0; font-size: 12px;">❌ EVITA</p>
          <p style="color: #ef5350; margin: 0; font-size: 24px; font-weight: bold;">${analyzed.length - topBuys.length - maybeOk.length}</p>
        </div>
      </div>
  `;

  // Mostrar top compras
  if (topBuys.length > 0) {
    html += `
      <div style="margin: 30px 0; padding: 15px; background: #1a1a2e; border-left: 4px solid #4ade80; border-radius: 6px;">
        <h2 style="margin: 0 0 15px 0; color: #4ade80;">🔥 Oportunidades de Compra (Buffett-style)</h2>
      </div>
    `;

    topBuys.forEach((c, idx) => {
      const analysis = c.buffett;
      html += createBuffettCard(c, analysis);
    });
  }

  // Mostrar considera
  if (maybeOk.length > 0) {
    html += `
      <div style="margin: 30px 0; padding: 15px; background: #1a1a2e; border-left: 4px solid #fbbf24; border-radius: 6px;">
        <h2 style="margin: 0 0 15px 0; color: #fbbf24;">🟡 Para Considerar (Condiciones Correctas)</h2>
      </div>
    `;

    maybeOk.forEach(c => {
      const analysis = c.buffett;
      html += createBuffettCard(c, analysis);
    });
  }

  html += `</div>`;
  document.getElementById('app').innerHTML = html;
};

function createBuffettCard(company, analysis) {
  const moatStatus = getMoatStatus(analysis.moatScore);
  const mgmtStatus = getManagementStatus(analysis.managementScore);
  const cycleColor = getCycleColor(analysis.businessCycle);

  return `
    <div style="background: #1e293b; border-left: 4px solid ${cycleColor}; padding: 20px; margin: 15px 0; border-radius: 6px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <div>
          <p style="margin: 0; color: #4ade80; font-size: 16px; font-weight: bold;">${company.ticker}</p>
          <p style="margin: 5px 0 0 0; color: #94a3b8; font-size: 12px;">${company.name}</p>
        </div>
        <div style="text-align: right;">
          <p style="margin: 0; font-size: 32px; font-weight: bold; color: #60a5fa;">${analysis.buffettScore}</p>
          <p style="margin: 0; font-size: 11px; color: #cbd5e1;">Buffett Score</p>
        </div>
      </div>

      <!-- 3 Scores principales -->
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin: 15px 0;">
        <div style="background: #0f172a; padding: 12px; border-radius: 4px; border-left: 3px solid #8b5cf6;">
          <p style="color: #cbd5e1; margin: 0 0 8px 0; font-size: 11px;">🏰 MOAT</p>
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="flex: 1; height: 6px; background: #334155; border-radius: 3px; overflow: hidden;">
              <div style="width: ${analysis.moatScore}%; height: 100%; background: #8b5cf6;"></div>
            </div>
            <p style="color: #c084fc; margin: 0; font-weight: bold;">${analysis.moatScore}</p>
          </div>
          <p style="color: #a78bfa; margin: 5px 0 0 0; font-size: 10px;">${moatStatus}</p>
        </div>

        <div style="background: #0f172a; padding: 12px; border-radius: 4px; border-left: 3px solid #60a5fa;">
          <p style="color: #cbd5e1; margin: 0 0 8px 0; font-size: 11px;">👔 MANAGEMENT</p>
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="flex: 1; height: 6px; background: #334155; border-radius: 3px; overflow: hidden;">
              <div style="width: ${analysis.managementScore}%; height: 100%; background: #60a5fa;"></div>
            </div>
            <p style="color: #60a5fa; margin: 0; font-weight: bold;">${analysis.managementScore}</p>
          </div>
          <p style="color: #93c5fd; margin: 5px 0 0 0; font-size: 10px;">${mgmtStatus}</p>
        </div>

        <div style="background: #0f172a; padding: 12px; border-radius: 4px; border-left: 3px solid ${cycleColor};">
          <p style="color: #cbd5e1; margin: 0 0 8px 0; font-size: 11px;">📊 CICLO</p>
          <p style="color: ${cycleColor}; margin: 0; font-weight: bold; font-size: 13px;">${analysis.businessCycle}</p>
          <p style="color: ${cycleColor}; margin: 5px 0 0 0; font-size: 10px; opacity: 0.8;">${getCycleDescription(analysis.businessCycle)}</p>
        </div>
      </div>

      <!-- Métricas financieras clave -->
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 10px; margin: 15px 0; font-size: 12px;">
        <div>
          <p style="color: #94a3b8; margin: 0; font-size: 10px;">ROE</p>
          <p style="color: ${company.roic > 15 ? '#4ade80' : company.roic > 10 ? '#60a5fa' : '#fbbf24'}; margin: 0; font-weight: bold;">${company.roic.toFixed(1)}%</p>
        </div>
        <div>
          <p style="color: #94a3b8; margin: 0; font-size: 10px;">Margen</p>
          <p style="color: ${company.netProfitMargin > 15 ? '#4ade80' : company.netProfitMargin > 5 ? '#60a5fa' : '#fbbf24'}; margin: 0; font-weight: bold;">${company.netProfitMargin.toFixed(1)}%</p>
        </div>
        <div>
          <p style="color: #94a3b8; margin: 0; font-size: 10px;">Crecimiento</p>
          <p style="color: ${company.revenueGrowthYoY > 10 ? '#4ade80' : company.revenueGrowthYoY > 5 ? '#60a5fa' : '#fbbf24'}; margin: 0; font-weight: bold;">${company.revenueGrowthYoY.toFixed(1)}%</p>
        </div>
        <div>
          <p style="color: #94a3b8; margin: 0; font-size: 10px;">D/E Ratio</p>
          <p style="color: ${company.debtToEquity < 1 ? '#4ade80' : company.debtToEquity < 1.5 ? '#60a5fa' : '#fbbf24'}; margin: 0; font-weight: bold;">${company.debtToEquity.toFixed(2)}</p>
        </div>
      </div>

      <!-- Recomendación -->
      <div style="background: #0f172a; padding: 12px; border-radius: 4px; margin-top: 12px; border-left: 3px solid ${analysis.signal === 'green' ? '#4ade80' : analysis.signal === 'yellow' ? '#fbbf24' : '#ef5350'};">
        <p style="color: #cbd5e1; margin: 0 0 5px 0; font-size: 11px; font-weight: 600;">RECOMENDACIÓN BUFFETT</p>
        <p style="color: ${analysis.signal === 'green' ? '#4ade80' : analysis.signal === 'yellow' ? '#fbbf24' : '#ef5350'}; margin: 0; font-size: 14px; font-weight: bold;">${analysis.recommendation}</p>
      </div>
    </div>
  `;
}

function getMoatStatus(score) {
  if (score >= 80) return "Moat fuerte";
  if (score >= 60) return "Moat moderado";
  if (score >= 40) return "Moat débil";
  return "Sin ventaja";
}

function getManagementStatus(score) {
  if (score >= 80) return "Excelente";
  if (score >= 60) return "Competente";
  if (score >= 40) return "Aceptable";
  return "Cuestionable";
}

function getCycleColor(cycle) {
  const colors = {
    "GROWTH": "#4ade80",
    "MATURE": "#60a5fa",
    "STABLE": "#fbbf24",
    "STARTUP": "#f59e0b",
    "DECLINE": "#ef5350"
  };
  return colors[cycle] || "#cbd5e1";
}

function getCycleDescription(cycle) {
  const desc = {
    "GROWTH": "Crecimiento activo",
    "MATURE": "Estable y rentable",
    "STABLE": "Sin cambios notorios",
    "STARTUP": "Alto riesgo",
    "DECLINE": "En caída"
  };
  return desc[cycle] || cycle;
}
