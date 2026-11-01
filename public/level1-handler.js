/**
 * LEVEL1-HANDLER.JS - Pantalla Nivel 1
 * Selector de mercado y análisis básico
 */

window.showStart = function() {
    const html = `
        <div class="container start-screen">
            <h1>📊 Stock Analyzer</h1>
            <p style="font-size: 16px; margin-bottom: 10px;">Datos Reales • Yahoo Finance • USD</p>
            <p style="color: #94a3b8;">3 Bolsas • 9 Criterios • Filtrado Automático</p>
            <div class="market-grid">
                <button class="market-btn" onclick="selectMarket('Mexico')">🇲🇽 México (BMV)</button>
                <button class="market-btn" onclick="selectMarket('Brazil')">🇧🇷 Brasil (B3)</button>
                <button class="market-btn" onclick="selectMarket('USA')">🇺🇸 USA (NYSE/NASDAQ)</button>
            </div>
        </div>
    `;
    document.getElementById('app').innerHTML = html;
};

window.selectMarket = function(market) {
    currentMarket = market;
    filterLevel = 1;
    showMarketAnalysis();
};

window.showMarketAnalysis = function() {
    const marketData = appData.markets[currentMarket];
    const allCompanies = marketData.companies;

    const withLevel1 = allCompanies.map(c => {
        const l1 = evaluateLevel1(c);
        return { ...c, level1Pass: l1.passed, level1Score: l1.score };
    });

    const greenOnly = withLevel1.filter(c => c.level1Pass);
    const greenCount = greenOnly.length;
    const sorted = greenOnly.slice().sort((a, b) => b.level1Score - a.level1Score);
    displayedCompanies = sorted;

    let html = `
        <div class="container">
            ${createHeader(`${marketData.flag} ${currentMarket}`, 'Nivel 1: 5 Criterios Básicos', 'showStart()')}

            <div class="summary-box">
                <strong>${greenCount}</strong> empresas 🟢 pasaron Nivel 1
            </div>

            ${createActionBar([
                { class: 'back-btn', onclick: 'showStart()', label: '← Cambiar Mercado', style: 'flex:1' },
                { class: 'filter-btn', onclick: 'refineLevel2()', label: '✨ Siguiente: Nivel 2 (L2) →', style: 'flex:2' }
            ])}

            <div class="results-container">
                ${sorted.map(c => renderLevel1Card(c)).join('')}
            </div>

            <div class="divider"></div>
            ${createActionBar([
                { class: 'back-btn', onclick: 'showStart()', label: '← Cambiar Mercado', style: 'flex:1' },
                { class: 'filter-btn', onclick: 'refineLevel2()', label: '✨ Siguiente: Nivel 2 (L2) →', style: 'flex:2' }
            ])}
        </div>
    `;

    document.getElementById('app').innerHTML = html;
};

function renderLevel1Card(c) {
    const peg = getPEGRatio(c);
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
                <div class="stat"><span class="stat-label">Score</span><span class="stat-value">${c.level1Score}%</span></div>
                <div class="stat"><span class="stat-label">D/E</span><span class="stat-value">${c.debtToEquity.toFixed(2)}</span></div>
                <div class="stat"><span class="stat-label">Margin</span><span class="stat-value">${c.netProfitMargin.toFixed(1)}%</span></div>
                <div class="stat"><span class="stat-label">Growth</span><span class="stat-value">${c.revenueGrowthYoY.toFixed(1)}%</span></div>
                <div class="stat"><span class="stat-label">P/E</span><span class="stat-value">${c.peRatio.toFixed(1)}</span></div>
                <div class="stat"><span class="stat-label">PEG</span><span class="stat-value">${peg.toFixed(2)}</span></div>
            </div>
        </div>
    `;
}
