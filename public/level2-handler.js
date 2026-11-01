/**
 * LEVEL2-HANDLER.JS - Pantalla Nivel 2
 * Filtrado refinado con 4 criterios avanzados
 */

window.refineLevel2 = function() {
    const marketData = appData.markets[currentMarket];
    const greenOnly = displayedCompanies.filter(c => c.level1Pass);

    if (greenOnly.length === 0) {
        alert('Sin empresas verdes en Nivel 1');
        return;
    }

    const withLevel2 = greenOnly.map(c => {
        const l2 = evaluateLevel2(c);
        return { ...c, level2Pass: l2.passed, level2Score: l2.score };
    });

    const refined = withLevel2.filter(c => c.level2Pass);
    const sorted = refined.slice().sort((a, b) => b.level2Score - a.level2Score);
    displayedCompanies = sorted;
    filterLevel = 2;

    // Auto-guardar análisis después de Nivel 2
    saveAnalysisToHistory();

    let html = `
        <div class="container">
            ${createHeader('Nivel 2: Refinamiento', 'Solo verdes (4 criterios avanzados)', 'showMarketAnalysis()')}

            <div class="summary-box">
                <strong>${refined.length}</strong> empresas saludables encontradas
            </div>

            ${createActionBar([
                { class: 'back-btn', onclick: 'showMarketAnalysis()', label: '← Volver a Nivel 1', style: 'flex:1' },
                { class: 'filter-btn', onclick: 'showRanking()', label: '🏆 Siguiente: Oportunidades (L3) →', style: 'flex:2' }
            ])}

            <div class="results-container">
                ${sorted.map(c => renderLevel2Card(c)).join('')}
            </div>

            <div class="divider"></div>
            ${createActionBar([
                { class: 'back-btn', onclick: 'showMarketAnalysis()', label: '← Volver a Nivel 1', style: 'flex:1' },
                { class: 'filter-btn', onclick: 'showRanking()', label: '🏆 Siguiente: Oportunidades (L3) →', style: 'flex:2' }
            ])}
        </div>
    `;

    document.getElementById('app').innerHTML = html;
};

function renderLevel2Card(c) {
    return `
        <div class="company-card" onclick="showDetails(${JSON.stringify(c).replace(/"/g, '&quot;')})">
            <div class="company-header">
                <span>
                    <span class="semafor">🟢</span>
                    <span class="ticker">${c.ticker}</span>
                </span>
                <span class="price">$${c.price.toFixed(2)} USD</span>
            </div>
            <div class="company-name">${c.name}</div>
            <div class="stats-grid">
                <div class="stat"><span class="stat-label">Score</span><span class="stat-value">${c.level2Score}%</span></div>
                <div class="stat"><span class="stat-label">ROE</span><span class="stat-value">${c.roic.toFixed(1)}%</span></div>
                <div class="stat"><span class="stat-label">FCF</span><span class="stat-value">${(c.freeCashFlow / 1e9).toFixed(1)}B</span></div>
                <div class="stat"><span class="stat-label">Quick</span><span class="stat-value">${c.quickRatio ? c.quickRatio.toFixed(2) : '—'}</span></div>
                <div class="stat"><span class="stat-label">Margin</span><span class="stat-value">${c.operatingMarginTrend}</span></div>
            </div>
        </div>
    `;
}
