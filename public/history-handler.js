/**
 * HISTORY-HANDLER.JS - Historial de análisis y comparativas
 */

window.showHistory = async function(market) {
    const analyses = await getAnalysesByMarket(market);

    if (analyses.length === 0) {
        alert('Sin análisis guardados para este mercado');
        return;
    }

    let html = `
        <div class="container">
            ${createHeader(`📊 Historial - ${market}`, `${analyses.length} análisis guardados`, 'showStart()')}

            <div class="results-container">
    `;

    analyses.forEach((analysis, idx) => {
        const date = new Date(analysis.timestamp);
        const dateStr = date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

        html += `
            <div class="company-card" style="cursor: pointer;" onclick="compareWithLatest('${analysis.id}', '${market}')">
                <div class="company-header">
                    <span>
                        <span class="ticker">${dateStr}</span>
                    </span>
                    <span class="price">${analysis.companies.length} empresas</span>
                </div>
                <div class="company-name">Análisis ${idx === 0 ? '(Más reciente)' : ''}</div>
                <div style="font-size: 11px; color: #94a3b8; margin-top: 8px;">
                    ${idx === 0 ? '📍 Actual - Usa este para comparar' : `Comparar con actual`}
                </div>
            </div>
        `;
    });

    html += `
            </div>
        </div>
    `;

    document.getElementById('app').innerHTML = html;
};

window.compareWithLatest = async function(analysisId, market) {
    const analyses = await getAnalysesByMarket(market);

    if (analyses.length < 2) {
        alert('Se necesitan al menos 2 análisis para comparar');
        return;
    }

    const current = analyses[0];
    const previous = analyses.find(a => a.id === analysisId);

    if (!previous || previous.id === current.id) {
        alert('Selecciona un análisis diferente al actual');
        return;
    }

    const comparison = compareAnalyses(previous, current);

    let html = `
        <div class="container">
            ${createHeader('📈 Comparativa', `${new Date(previous.timestamp).toLocaleDateString('es-ES')} vs ${new Date(current.timestamp).toLocaleDateString('es-ES')}`, `showHistory('${market}')`)}

            <div style="background:#1e293b;padding:15px;border-radius:6px;margin-bottom:20px">
                <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:15px">
                    <div style="text-align:center">
                        <div style="color:#fbbf24;font-size:24px;font-weight:bold">${comparison.netChange > 0 ? '+' : ''}${comparison.netChange}</div>
                        <div style="font-size:11px;color:#94a3b8">Cambio neto</div>
                    </div>
                    <div style="text-align:center">
                        <div style="color:#4ade80;font-size:24px;font-weight:bold">${comparison.newEntries.length}</div>
                        <div style="font-size:11px;color:#94a3b8">Nuevas ✨</div>
                    </div>
                    <div style="text-align:center">
                        <div style="color:#ef4444;font-size:24px;font-weight:bold">${comparison.exitedEntries.length}</div>
                        <div style="font-size:11px;color:#94a3b8">Salidas ❌</div>
                    </div>
                    <div style="text-align:center">
                        <div style="color:#60a5fa;font-size:24px;font-weight:bold">${comparison.improved.length + comparison.declined.length}</div>
                        <div style="font-size:11px;color:#94a3b8">Cambios 📊</div>
                    </div>
                </div>
            </div>

            <div class="results-container">
                ${comparison.newEntries.length > 0 ? `
                    <h3 style="color:#4ade80;font-size:13px;margin:15px 0 10px 0">✨ NUEVAS EMPRESAS (${comparison.newEntries.length})</h3>
                    ${comparison.newEntries.map(c => `
                        <div class="company-card" style="border-left-color:#4ade80">
                            <div class="company-header">
                                <span class="ticker">${c.ticker}</span>
                                <span style="color:#4ade80">NUEVA</span>
                            </div>
                            <div class="company-name">${c.name}</div>
                        </div>
                    `).join('')}
                ` : ''}

                ${comparison.improved.length > 0 ? `
                    <h3 style="color:#60a5fa;font-size:13px;margin:15px 0 10px 0">🔼 MEJORARON (${comparison.improved.length})</h3>
                    ${comparison.improved.map(c => `
                        <div class="company-card" style="border-left-color:#60a5fa">
                            <div class="company-header">
                                <span class="ticker">${c.ticker}</span>
                                <span style="color:#60a5fa">+${c.scoreDiff}%</span>
                            </div>
                            <div class="company-name">${c.name}</div>
                        </div>
                    `).join('')}
                ` : ''}

                ${comparison.declined.length > 0 ? `
                    <h3 style="color:#fbbf24;font-size:13px;margin:15px 0 10px 0">🔽 EMPEORARON (${comparison.declined.length})</h3>
                    ${comparison.declined.map(c => `
                        <div class="company-card" style="border-left-color:#fbbf24">
                            <div class="company-header">
                                <span class="ticker">${c.ticker}</span>
                                <span style="color:#fbbf24">${c.scoreDiff}%</span>
                            </div>
                            <div class="company-name">${c.name}</div>
                        </div>
                    `).join('')}
                ` : ''}

                ${comparison.exitedEntries.length > 0 ? `
                    <h3 style="color:#ef4444;font-size:13px;margin:15px 0 10px 0">❌ SALIERON (${comparison.exitedEntries.length})</h3>
                    ${comparison.exitedEntries.map(c => `
                        <div class="company-card" style="border-left-color:#ef4444">
                            <div class="company-header">
                                <span class="ticker">${c.ticker}</span>
                                <span style="color:#ef4444">SALIÓ</span>
                            </div>
                            <div class="company-name">${c.name}</div>
                        </div>
                    `).join('')}
                ` : ''}
            </div>
        </div>
    `;

    document.getElementById('app').innerHTML = html;
};

// Hook: guardar análisis después de Nivel 2
window.saveAnalysisToHistory = async function() {
    if (displayedCompanies && displayedCompanies.length > 0 && currentMarket) {
        try {
            await saveAnalysis(currentMarket, displayedCompanies);
            console.log('✅ Análisis guardado en historial');
        } catch (error) {
            console.error('Error guardando análisis:', error);
        }
    }
};
