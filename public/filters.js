/**
 * FILTERS.JS - Funciones de evaluación de criterios
 * Contiene la lógica pura de filtrado sin UI
 */

function evaluateLevel1(c) {
    let passed = 0;
    if (c.debtToEquity < 1.5) passed++;
    if (c.netProfitMargin > 5) passed++;
    if (c.revenueGrowthYoY > 5) passed++;
    if (c.currentRatio > 1.0) passed++;
    if (c.peRatio < c.sectorAvgPE) passed++;
    return { passed: passed >= 4, score: Math.round((passed / 5) * 100) };
}

function evaluateLevel2(c) {
    if (!c.level1Pass) return { passed: false, score: 0 };
    let passed = 0;
    let totalCriteria = 0;

    // ROE (Return on Equity): solo contar si está disponible (> 0)
    if (c.roic > 0) {
        if (c.roic > 10) passed++;
        totalCriteria++;
    }

    // Op Margin: siempre contar
    if (c.operatingMarginTrend === 'up' || c.operatingMarginTrend === 'flat') passed++;
    totalCriteria++;

    // FCF: siempre contar
    if (c.freeCashFlow > 0) passed++;
    totalCriteria++;

    // Quick Ratio: liquidez inmediata (> 1.0 = puede pagar deudas corto plazo)
    if (c.quickRatio > 0) {
        if (c.quickRatio > 1.0) passed++;
        totalCriteria++;
    }

    // Requiere al menos 2/3 si faltan datos
    const requiredPassing = totalCriteria >= 4 ? 3 : 2;
    return { passed: passed >= requiredPassing, score: Math.round((passed / Math.max(totalCriteria, 3)) * 100) };
}

function evaluateLevel3(c) {
    let passed = 0;
    if (c.roic > 10) passed++;
    if (c.freeCashFlow > 0) passed++;
    if (c.dividendYield > 1) passed++;
    if (c.operatingMarginTrend === 'up') passed++;
    if (c.debtTrend === 'down') passed++;
    if (c.competitiveness === 'dominant' || c.competitiveness === 'strong') passed++;
    return Math.round((passed / 6) * 100);
}

function getPEGRatio(c) {
    return c.revenueGrowthYoY > 0 ? c.peRatio / c.revenueGrowthYoY : c.peRatio;
}

function getValuationStatus(peg) {
    if (peg < 1.0) return '🟢 BARATA';
    if (peg <= 2.0) return '🟡 JUSTA';
    return '🔴 CARA';
}
