/**
 * LEVEL3-HANDLER.JS - Pantalla Nivel 3
 * Oportunidades de compra y detalles empresa
 */

window.showRanking = function() {
    const ranked = displayedCompanies.map(c => {
        const l3Score = evaluateLevel3(c);
        const finalScore = Math.round((c.level1Score * 0.4) + (c.level2Score * 0.4) + (l3Score * 0.2));
        const peg = getPEGRatio(c);
        return { ...c, l3Score, finalScore, peg, valuation: getValuationStatus(peg) };
    });

    const cheapOnes = ranked.filter(c => c.peg < 1.0).sort((a, b) => b.finalScore - a.finalScore);

    let html = `
        <div class="container">
            ${createHeader('🏆 Oportunidades de Compra', 'BARATAS + Saludables (PEG < 1.0)', 'refineLevel2()')}
    `;

    if (cheapOnes.length === 0) {
        html += `
            <div class="summary-box" style="border-left-color:#ca8a04">
                <p style="color:#fbbf24">⏳ Sin Oportunidades Baratas</p>
                <p style="font-size:12px;color:#94a3b8">No hay empresas con PEG < 1.0. Espera a que caigan.</p>
            </div>
        `;
    } else {
        html += `
            <div class="summary-box">
                <strong>${cheapOnes.length}</strong> oportunidades de compra detectadas
            </div>

            <div class="results-container">
                ${cheapOnes.map((c, idx) => renderLevel3Card(c, idx, cheapOnes)).join('')}
            </div>
        `;
    }

    html += `</div>`;
    document.getElementById('app').innerHTML = html;
};

function renderLevel3Card(c, idx, cheapOnes) {
    let position = 1;
    if (idx > 0 && cheapOnes[idx - 1].finalScore !== c.finalScore) {
        position = idx + 1;
    }

    return `
        <div class="company-card" onclick="showDetails(${JSON.stringify(c).replace(/"/g, '&quot;')})">
            <div class="company-header">
                <span>
                    <span style="color:#fbbf24;font-weight:bold;margin-right:8px">#${position}</span>
                    <span class="ticker">${c.ticker}</span>
                </span>
                <span style="color:#4ade80">🟢 BARATA</span>
            </div>
            <div class="company-name">${c.name}</div>
            <div class="stats-grid">
                <div class="stat"><span class="stat-label">Score</span><span class="stat-value">${c.finalScore}%</span></div>
                <div class="stat"><span class="stat-label">L3</span><span class="stat-value">${c.l3Score}%</span></div>
                <div class="stat"><span class="stat-label">PEG</span><span class="stat-value">${c.peg.toFixed(2)}</span></div>
                <div class="stat"><span class="stat-label">P/E</span><span class="stat-value">${c.peRatio.toFixed(1)}</span></div>
                <div class="stat"><span class="stat-label">Price</span><span class="stat-value">$${c.price.toFixed(2)}</span></div>
            </div>
        </div>
    `;
}

window.showDetails = function(company) {
    if (!company) return;

    const l1 = { passed: company.level1Pass, score: company.level1Score };
    const l2 = { passed: company.level2Pass, score: company.level2Score };
    const l3 = company.l3Score || evaluateLevel3(company);
    const peg = company.peg || getPEGRatio(company);
    const valuation = company.valuation || getValuationStatus(peg);

    const valuationColor = peg < 1.0 ? '#4ade80' : peg <= 2.0 ? '#fbbf24' : '#ef4444';
    const valuationEmoji = peg < 1.0 ? '🟢' : peg <= 2.0 ? '🟡' : '🔴';

    const l1Criteria = [
        { name: 'Deuda/Equity', value: company.debtToEquity, threshold: '< 1.5', passed: company.debtToEquity < 1.5 },
        { name: 'Margen Neto', value: `${company.netProfitMargin.toFixed(1)}%`, threshold: '> 5%', passed: company.netProfitMargin > 5 },
        { name: 'Crecimiento', value: `${company.revenueGrowthYoY.toFixed(1)}%`, threshold: '> 5%', passed: company.revenueGrowthYoY > 5 },
        { name: 'Current Ratio', value: company.currentRatio.toFixed(2), threshold: '> 1.0', passed: company.currentRatio > 1.0 },
        { name: 'P/E vs Sector', value: `${company.peRatio.toFixed(1)} vs ${company.sectorAvgPE}`, threshold: '< Sector', passed: company.peRatio < company.sectorAvgPE },
    ];

    const l2Criteria = [
        { name: 'ROE (Return on Equity)', value: company.roic > 0 ? `${company.roic.toFixed(1)}%` : '⚠️ No disponible', threshold: '> 10%', passed: company.roic > 10 },
        { name: 'Margen Operativo', value: company.operatingMarginTrend, threshold: 'up/flat', passed: company.operatingMarginTrend === 'up' || company.operatingMarginTrend === 'flat' },
        { name: 'Free Cash Flow', value: `$${(company.freeCashFlow / 1e9).toFixed(1)}B`, threshold: '> 0', passed: company.freeCashFlow > 0 },
        { name: 'Liquidez Inmediata (Quick Ratio)', value: company.quickRatio ? `${company.quickRatio.toFixed(2)}` : '—', threshold: '> 1.0', passed: company.quickRatio ? company.quickRatio > 1.0 : false },
    ];

    let html = `
        <div class="modal-content">
            <h2 style="margin-bottom:5px">${company.ticker} - ${company.name}</h2>
            <p style="color:#94a3b8;font-size:12px;margin-bottom:15px">Precio: $${company.price.toFixed(2)} USD | ${company.sector}</p>

            <div style="background:${valuationColor}33;border-left:3px solid ${valuationColor};padding:12px;border-radius:4px;margin-bottom:15px">
                <div style="color:${valuationColor};font-weight:bold;font-size:14px;margin-bottom:8px">${valuationEmoji} VALUACIÓN</div>
                <div style="color:#cbd5e1;font-size:13px;line-height:1.6">
                    <strong>PEG Ratio = P/E ÷ Crecimiento</strong><br>
                    ${company.peRatio.toFixed(1)} ÷ ${company.revenueGrowthYoY.toFixed(1)}% = <strong style="color:${valuationColor}">${peg.toFixed(2)}</strong>
                </div>
                <div style="color:#94a3b8;font-size:11px;margin-top:8px">
                    ${peg < 1.0 ? '✓ BARATA: Precio bajo relativo a crecimiento futuro' : peg <= 2.0 ? '≈ JUSTA: Precio razonable' : '✗ CARA: Precio alto relativo a crecimiento'}
                </div>
            </div>

            <h3 style="color:#60a5fa;font-size:13px;margin:15px 0 10px 0">📋 NIVEL 1: Criterios Básicos</h3>
            <div style="background:#0f172a;padding:10px;border-radius:4px;font-size:12px;line-height:2">
                ${l1Criteria.map(c => `
                    <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #334155;padding:6px 0">
                        <span>${c.passed ? '🟢' : '🔴'} ${c.name}</span>
                        <span style="color:#94a3b8">${c.value} <span style="color:#64748b">(${c.threshold})</span></span>
                    </div>
                `).join('')}
                <div style="margin-top:8px;color:#4ade80;font-weight:bold">
                    ${l1.passed ? '✓ PASA NIVEL 1' : '✗ NO PASA'} - ${l1.score}%
                </div>
            </div>

            <h3 style="color:#60a5fa;font-size:13px;margin:15px 0 10px 0">🔍 NIVEL 2: Criterios Avanzados</h3>
            <div style="background:#0f172a;padding:10px;border-radius:4px;font-size:12px;line-height:2">
                ${l2Criteria.map(c => `
                    <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #334155;padding:6px 0">
                        <span>${c.passed ? '🟢' : '🔴'} ${c.name}</span>
                        <span style="color:#94a3b8">${c.value} <span style="color:#64748b">(${c.threshold})</span></span>
                    </div>
                `).join('')}
                <div style="margin-top:8px;color:${l2.passed ? '#4ade80' : '#ef4444'};font-weight:bold">
                    ${l2.passed ? '✓ PASA NIVEL 2' : '✗ NO PASA'} - ${l2.score}%
                </div>
            </div>

            <h3 style="color:#60a5fa;font-size:13px;margin:15px 0 10px 0">⭐ INDICADORES OPCIONALES (Nivel 3)</h3>
            <div style="background:#0f172a;padding:10px;border-radius:4px;font-size:12px;line-height:1.8">
                <div>Dividendo: <strong>${company.dividendYield.toFixed(2)}%</strong></div>
                <div>Posición: <strong>${company.competitiveness}</strong></div>
                <div>Tendencia Deuda: <strong>${company.debtTrend}</strong></div>
                <div style="margin-top:8px;color:#4ade80;font-weight:bold">Score L3: ${l3}%</div>
            </div>

            <div style="background:#1e293b;padding:10px;border-radius:4px;margin-top:15px;border-left:2px solid #8b5cf6">
                <p style="color:#cbd5e1;font-size:11px;line-height:1.6;margin:0">
                    <strong style="color:#8b5cf6">📌 Recomendación:</strong>
                    ${l1.passed && l2.passed && peg < 1.0 ? '🟢 BUENA CANDIDATA - Pasa ambos niveles y está barata. Verifica en Charles Schwab disponibilidad de ADR.' : l1.passed && l2.passed ? '🟡 BUENA PERO CARA - Empresas sanas pero a precio premium. Espera a que caiga.' : '🔴 NO CALIFICA - No pasa todos los criterios.'}
                </p>
            </div>

            <button class="close-modal" onclick="document.getElementById('modal').classList.remove('active')">Cerrar</button>
        </div>
    `;

    document.getElementById('modal').innerHTML = html;
    document.getElementById('modal').classList.add('active');
};
