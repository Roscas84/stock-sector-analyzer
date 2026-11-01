// Lógica de criterios de filtrado (9 criterios)

export function evaluateLevel1(company) {
  const criteria = [
    evaluateDebtToEquity(company.debtToEquity),
    evaluateNetProfitMargin(company.netProfitMargin),
    evaluateRevenueGrowth(company.revenueGrowthYoY),
    evaluateCurrentRatio(company.currentRatio),
    evaluatePERatio(company.peRatio, company.sectorAvgPE),
  ];

  const passedCount = criteria.filter(c => c.passed).length;
  const score = Math.round((passedCount / criteria.length) * 100);
  const passed = passedCount >= 4; // Requiere 4 de 5

  return { passed, score, details: criteria };
}

export function evaluateLevel2(company) {
  if (!company.level1Pass) return { passed: false, score: 0, details: [] };

  const criteria = [
    evaluateROIC(company.roic),
    evaluateOperatingMargin(company.operatingMarginTrend),
    evaluateFreeCashFlow(company.freeCashFlow),
    evaluateShortTermDebt(company.shortTermDebtRatio),
  ];

  const passedCount = criteria.filter(c => c.passed).length;
  const score = Math.round((passedCount / criteria.length) * 100);
  const passed = passedCount >= 3; // Requiere 3 de 4

  return { passed, score, details: criteria };
}

// Criterios Nivel 1
function evaluateDebtToEquity(value) {
  if (value === null) return { passed: false, name: 'D/E', value: 'N/A' };
  const passed = value < 1.5;
  return { passed, name: 'D/E', value: value.toFixed(2), threshold: '< 1.5' };
}

function evaluateNetProfitMargin(value) {
  if (value === null) return { passed: false, name: 'Net Profit', value: 'N/A' };
  const passed = value > 5;
  return { passed, name: 'Net Profit %', value: value.toFixed(1), threshold: '> 5%' };
}

function evaluateRevenueGrowth(value) {
  if (value === null) return { passed: false, name: 'Revenue Growth', value: 'N/A' };
  const passed = value > 5;
  return { passed, name: 'Revenue Growth %', value: value.toFixed(1), threshold: '> 5%' };
}

function evaluateCurrentRatio(value) {
  if (value === null) return { passed: false, name: 'Liquidity', value: 'N/A' };
  const passed = value > 1.0;
  return { passed, name: 'Current Ratio', value: value.toFixed(2), threshold: '> 1.0' };
}

function evaluatePERatio(peRatio, sectorAvgPE) {
  if (peRatio === null || sectorAvgPE === null) {
    return { passed: false, name: 'P/E', value: 'N/A' };
  }
  const passed = peRatio < sectorAvgPE;
  return { passed, name: 'P/E', value: peRatio.toFixed(1), threshold: `< sector ${sectorAvgPE.toFixed(1)}` };
}

// Criterios Nivel 2
function evaluateROIC(value) {
  if (value === null) return { passed: false, name: 'ROIC', value: 'N/A' };
  const passed = value > 10;
  return { passed, name: 'ROIC %', value: value.toFixed(1), threshold: '> 10%' };
}

function evaluateOperatingMargin(value) {
  if (value === null) return { passed: false, name: 'Op. Margin', value: 'N/A' };
  const passed = value === 'up' || value === 'flat';
  return { passed, name: 'Op. Margin Trend', value: value, threshold: 'up or flat' };
}

function evaluateFreeCashFlow(value) {
  if (value === null) return { passed: false, name: 'FCF', value: 'N/A' };
  const passed = value > 0;
  return { passed, name: 'FCF', value: `$${(value / 1e9).toFixed(1)}B`, threshold: '> 0' };
}

function evaluateShortTermDebt(value) {
  if (value === null) return { passed: false, name: 'ST Debt', value: 'N/A' };
  const passed = value < 20;
  return { passed, name: 'ST Debt %', value: value.toFixed(1), threshold: '< 20%' };
}
