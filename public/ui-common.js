/**
 * UI-COMMON.JS - Funciones comunes de interfaz
 * Reutilizables en múltiples pantallas
 */

// Variables globales compartidas
let appData = null;
let displayedCompanies = [];
let currentMarket = null;
let filterLevel = 0;

async function loadAppData() {
    if (!appData) {
        const response = await fetch('data.json');
        appData = await response.json();
    }
    return appData;
}

function renderCompanyCard(c) {
    const peg = getPEGRatio(c);
    return `
        <div class="company-card" onclick="showDetails(${JSON.stringify(c).replace(/"/g, '&quot;')})">
            <div class="company-header">
                <span>
                    <span class="semafor">${c.level1Pass ? '🟢' : '🔴'}</span>
                    <span class="ticker">${c.ticker}</span>
                </span>
                <span class="price">$${c.price.toFixed(2)} USD</span>
            </div>
            <div class="company-name">${c.name}</div>
            <div class="stats-grid">
                <div class="stat"><span class="stat-label">Score</span><span class="stat-value">${c.level1Score}%</span></div>
                <div class="stat"><span class="stat-label">ROE</span><span class="stat-value">${c.roic.toFixed(1)}%</span></div>
                <div class="stat"><span class="stat-label">FCF</span><span class="stat-value">${(c.freeCashFlow / 1e9).toFixed(1)}B</span></div>
                <div class="stat"><span class="stat-label">Quick</span><span class="stat-value">${c.quickRatio ? c.quickRatio.toFixed(2) : '—'}</span></div>
                <div class="stat"><span class="stat-label">P/E</span><span class="stat-value">${c.peRatio.toFixed(1)}</span></div>
                <div class="stat"><span class="stat-label">PEG</span><span class="stat-value">${peg.toFixed(2)}</span></div>
            </div>
        </div>
    `;
}

function createHeader(title, subtitle, backButton = null) {
    return `
        <div class="header">
            <div>
                <h1>${title}</h1>
                <p>${subtitle}</p>
            </div>
            ${backButton ? `<button class="back-btn" onclick="${backButton}">← Atrás</button>` : ''}
        </div>
        <div class="divider"></div>
    `;
}

function createActionBar(buttons) {
    return `
        <div class="action-bar">
            ${buttons.map(btn => `<button class="${btn.class}" onclick="${btn.onclick}" style="${btn.style || ''}">${btn.label}</button>`).join('')}
        </div>
    `;
}
