/**
 * LEVEL 2.5 HANDLER - Análisis de Reversión/Oportunidad
 *
 * Estrategia: Busca empresas fundamentalmente sanas (pasan Nivel 1 + 2)
 * que están siendo castigadas por el mercado (caída > 20% desde máximo 52w)
 * pero no sobrevaloradas (P/B < 1.8x)
 *
 * Idea: Comprar barato, esperando recuperación mediano plazo
 * ROI esperado: 20-30% (mejor que renta fija 7%)
 */

window.evaluateReversalOpportunity = function(company) {
    // Solo evaluar si pasó Level 1 Y Level 2
    if (!company.level1Pass || !company.level2Pass) {
        return {
            passed: false,
            decline: company.decline52Week || 0,
            pbRatio: company.priceToBook || 0,
            signal: "🔵 N/A",
            reason: "No cumple Nivel 1 o 2"
        };
    }

    const decline = company.decline52Week || 0;  // % de caída desde 52w high
    const pbRatio = company.priceToBook || 0;     // Price-to-Book
    const max52w = company.high52Week || 0;
    const current = company.price || 0;

    // CRITERIOS DE OPORTUNIDAD
    const isBeatenDown = decline > 20;      // Cayó más del 20% desde máximo
    const isCheap = pbRatio > 0 && pbRatio < 1.8;  // Valuación baja
    const isNotCrashing = current > (max52w * 0.5);  // No cayó más del 50% (evita casos desesperados)

    // DETECTAR TIPO DE OPORTUNIDAD
    let signal = "⚪ No es oportunidad";
    let score = 0;
    let reason = "";

    if (!isBeatenDown && !isCheap) {
        signal = "⚪ Precio normal";
        reason = "Sin caída significativa ni valuación baja";
        score = 0;
    } else if (isBeatenDown && isCheap && isNotCrashing) {
        // OPORTUNIDAD IDEAL: Caída significativa + Valuación baja + Fundamentals sanos
        signal = "🔥 COMPRA ATRACTIVA";
        score = 100;
        reason = `Cayó ${decline}%, P/B=${pbRatio}x → Oportunidad real`;
    } else if (isBeatenDown && !isCheap) {
        // TRAMPA DE VALOR: Cayó pero sigue cara
        signal = "⚠️ TRAMPA DE VALOR";
        score = 30;
        reason = `Caída ${decline}% pero P/B=${pbRatio}x (cara) → Corrección justificada`;
    } else if (isCheap && !isBeatenDown) {
        // BARATA PERO ESTABLE: Valuación baja pero sin presión
        signal = "💰 Inversión estable";
        score = 60;
        reason = `P/B bajo (${pbRatio}x) pero sin caída reciente → Acumulación lenta`;
    }

    // VALIDAR QUE NO SEA CASO EXTREMO (más del 50% caída = posible colapso)
    if (!isNotCrashing) {
        signal = "🚨 RIESGO EXTREMO";
        score = 0;
        reason = "Caída > 50% → Posible colapso de empresa, no oportunidad";
    }

    return {
        passed: signal.includes("🔥"),  // TRUE solo si es oportunidad real
        decline: decline,
        pbRatio: pbRatio,
        max52Week: max52w,
        currentPrice: current,
        signal: signal,
        score: score,
        reason: reason,
        recommendation: {
            action: signal.includes("🔥") ? "CONSIDERAR COMPRA" : "ESPERAR",
            riskLevel: isCheap && isBeatenDown ? "MEDIO" : "ALTO",
            timeframe: "MEDIANO PLAZO (6-12 meses)",
            expectedReturn: signal.includes("🔥") ? `${(decline * 0.6).toFixed(0)}% - ${decline}%` : "N/A"
        }
    };
};

window.filterByReversalOpportunity = function(companies) {
    /**
     * Filtra y ordena empresas por oportunidad de reversión
     * Retorna solo aquellas con señal 🔥 COMPRA ATRACTIVA
     */
    if (!companies || companies.length === 0) return [];

    return companies
        .map(c => ({
            ...c,
            reversalAnalysis: evaluateReversalOpportunity(c)
        }))
        .filter(c => c.reversalAnalysis.passed)  // Solo las 🔥
        .sort((a, b) => b.reversalAnalysis.score - a.reversalAnalysis.score);
};

window.showReversalAnalysis = function(market) {
    /**
     * Pantalla de análisis de reversión
     * Muestra solo empresas que son oportunidades de compra
     */
    if (!appData || !appData.markets || !appData.markets[market]) {
        document.getElementById('app').innerHTML = `
            <div class="container">
                <h1 style="color: #ef4444;">❌ Sin datos</h1>
                <p>Selecciona un mercado primero</p>
                <button onclick="showStart()">Volver</button>
            </div>
        `;
        return;
    }

    const companies = appData.markets[market].companies;
    const opportunities = filterByReversalOpportunity(companies);

    let html = `
        <div class="container">
            <div class="header">
                <h1>🔥 Oportunidades de Reversión - ${market}</h1>
                <button onclick="showStart()" style="background: #6366f1;">← Volver</button>
            </div>

            <div style="background: #1e293b; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0; border-radius: 6px;">
                <p style="color: #fbbf24; margin: 0; font-weight: 600;">💡 Estrategia: Empresas fundamentalmente sanas (Nivel 1+2) que cayeron > 20% pero mantienen valuación baja (P/B < 1.8x)</p>
                <p style="color: #cbd5e1; margin: 8px 0 0 0; font-size: 13px;">ROI esperado: 20-30% en mediano plazo. Mejor que renta fija (7%)</p>
            </div>

            <div style="margin: 20px 0; padding: 15px; background: #1a1a2e; border-radius: 6px; border-left: 4px solid #4ade80;">
                <h2 style="margin: 0; color: #4ade80;">📊 Oportunidades Encontradas: ${opportunities.length}</h2>
            </div>
    `;

    if (opportunities.length === 0) {
        html += `
            <div style="padding: 20px; text-align: center; color: #94a3b8;">
                <p>❌ No hay oportunidades de reversión en este mercado</p>
                <p style="font-size: 13px; color: #64748b;">Empresas fundamentalmente sanas pero sin caída significativa</p>
            </div>
        `;
    } else {
        // Mostrar cada oportunidad
        opportunities.forEach((c, idx) => {
            const analysis = c.reversalAnalysis;
            const maxPrice = analysis.max52Week;
            const currentPrice = analysis.currentPrice;
            const decline = analysis.decline;
            const pbRatio = analysis.pbRatio;

            // Color según P/B ratio
            const pbColor = pbRatio < 1.2 ? "#4ade80" : pbRatio < 1.5 ? "#60a5fa" : "#f59e0b";

            html += `
                <div style="background: #1e293b; border-left: 4px solid ${pbColor}; padding: 15px; margin: 15px 0; border-radius: 6px;">
                    <div class="company-header">
                        <div>
                            <span class="ticker">${c.ticker}</span>
                            <span style="color: #94a3b8; font-size: 13px;"> ${c.name}</span>
                        </div>
                        <span style="font-size: 16px;">${analysis.signal}</span>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 10px; margin: 10px 0; font-size: 13px;">
                        <div>
                            <p style="color: #94a3b8; margin: 0;">Precio Actual</p>
                            <p style="color: #4ade80; font-weight: 600; margin: 0;">$${currentPrice.toFixed(2)}</p>
                        </div>
                        <div>
                            <p style="color: #94a3b8; margin: 0;">52w Máximo</p>
                            <p style="color: #60a5fa; font-weight: 600; margin: 0;">$${maxPrice.toFixed(2)}</p>
                        </div>
                        <div>
                            <p style="color: #94a3b8; margin: 0;">Caída desde Máx</p>
                            <p style="color: #f59e0b; font-weight: 600; margin: 0;">-${decline.toFixed(1)}%</p>
                        </div>
                        <div>
                            <p style="color: #94a3b8; margin: 0;">P/B Ratio</p>
                            <p style="color: ${pbColor}; font-weight: 600; margin: 0;">${pbRatio.toFixed(2)}x</p>
                        </div>
                    </div>

                    <div style="margin: 10px 0; padding: 10px; background: #0f172a; border-radius: 4px; font-size: 12px;">
                        <p style="color: #cbd5e1; margin: 0;"><strong>Análisis:</strong> ${analysis.reason}</p>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 10px 0; font-size: 12px;">
                        <div style="padding: 8px; background: #10b981; border-radius: 4px;">
                            <p style="color: #0f172a; margin: 0;"><strong>Acción</strong>: ${analysis.recommendation.action}</p>
                        </div>
                        <div style="padding: 8px; background: #f59e0b; border-radius: 4px;">
                            <p style="color: #0f172a; margin: 0;"><strong>Retorno Esperado</strong>: ${analysis.recommendation.expectedReturn}</p>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; font-size: 11px; color: #64748b; margin-top: 8px;">
                        <div>Plazo: ${analysis.recommendation.timeframe}</div>
                        <div>Riesgo: ${analysis.recommendation.riskLevel}</div>
                        <div>Score: ${analysis.score}/100</div>
                    </div>

                    ${analysis.score < 100 ? `
                        <div style="margin: 10px 0; padding: 8px; background: #831843; border-radius: 4px; border-left: 3px solid #ec4899;">
                            <p style="color: #fecdd3; margin: 0; font-size: 11px;">⚠️ ${analysis.reason}</p>
                        </div>
                    ` : ''}
                </div>
            `;
        });
    }

    // Mostrar también oportunidades "débiles" (no ideales pero interesantes)
    const allAnalyzed = companies.map(c => ({
        ...c,
        reversalAnalysis: evaluateReversalOpportunity(c)
    }));

    const trapOpportunities = allAnalyzed
        .filter(c => c.reversalAnalysis.signal.includes("⚠️"))
        .sort((a, b) => b.reversalAnalysis.score - a.reversalAnalysis.score)
        .slice(0, 3);

    if (trapOpportunities.length > 0) {
        html += `
            <div style="margin: 30px 0; padding: 15px; background: #1a1a2e; border-left: 4px solid #f59e0b; border-radius: 6px;">
                <h2 style="margin: 0 0 15px 0; color: #f59e0b;">⚠️ Trampas de Valor (No Recomendadas)</h2>
                <p style="color: #cbd5e1; font-size: 12px; margin: 0;">Empresas que cayeron pero siguen caras. Posibles correcciones justificadas:</p>
            </div>
        `;

        trapOpportunities.forEach(c => {
            const analysis = c.reversalAnalysis;
            html += `
                <div style="background: #1e293b; border-left: 4px solid #f59e0b; padding: 12px; margin: 10px 0; border-radius: 6px; opacity: 0.7;">
                    <div style="display: flex; justify-content: space-between;">
                        <span><strong>${c.ticker}</strong> - ${c.name}</span>
                        <span>⚠️ P/B=${analysis.pbRatio.toFixed(1)}x | Caída=${analysis.decline.toFixed(0)}%</span>
                    </div>
                </div>
            `;
        });
    }

    html += `</div>`;
    document.getElementById('app').innerHTML = html;
};

// Exportar botón para acceder desde UI
window.getReversalButton = function() {
    return `
        <button onclick="showReversalAnalysis('${currentMarket}')" style="background: linear-gradient(135deg, #f59e0b, #d97706); margin-right: 10px;">
            🔥 Oportunidades de Reversión
        </button>
    `;
};
