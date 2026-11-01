import { Company } from '../types/index';

interface CriteriaResult {
  passed: boolean;
  score: number;
  reason: string;
}

export function useCriteria() {
  // Nivel 1: Criterios básicos
  const checkLevel1 = (company: Company): { passed: boolean; score: number } => {
    const criteria = [
      checkDebtToEquity(company.debtToEquity),
      checkNetProfitMargin(company.netProfitMargin),
      checkRevenueGrowth(company.revenueGrowthYoY),
      checkCurrentRatio(company.currentRatio),
      checkPERatio(company.peRatio, company.sectorAvgPE),
    ];

    const passedCount = criteria.filter(c => c.passed).length;
    const score = (passedCount / criteria.length) * 100;
    const passed = passedCount >= 4; // Requiere al menos 4 de 5

    return { passed, score: Math.round(score) };
  };

  // Nivel 2: Refinamientos (solo para empresas que pasen Nivel 1)
  const checkLevel2 = (company: Company): { passed: boolean; score: number } => {
    if (!company.level1Pass) {
      return { passed: false, score: 0 };
    }

    const criteria = [
      checkROIC(company.roic),
      checkOperatingMarginTrend(company.operatingMarginTrend),
      checkFreeCashFlow(company.freeCashFlow),
      checkShortTermDebt(company.shortTermDebtRatio),
    ];

    const passedCount = criteria.filter(c => c.passed).length;
    const score = (passedCount / criteria.length) * 100;
    const passed = passedCount >= 3; // Requiere al menos 3 de 4

    return { passed, score: Math.round(score) };
  };

  // Criterios individuales Nivel 1
  const checkDebtToEquity = (value: number | null): CriteriaResult => {
    if (value === null) return { passed: false, score: 0, reason: 'No data' };
    const passed = value < 1.5;
    return {
      passed,
      score: passed ? 100 : Math.max(0, 100 - (value - 1.5) * 20),
      reason: `D/E: ${value.toFixed(2)} ${passed ? '✓' : '✗'}`,
    };
  };

  const checkNetProfitMargin = (value: number | null): CriteriaResult => {
    if (value === null) return { passed: false, score: 0, reason: 'No data' };
    const passed = value > 5;
    return {
      passed,
      score: Math.min(100, (value / 5) * 100),
      reason: `Margin: ${value.toFixed(1)}% ${passed ? '✓' : '✗'}`,
    };
  };

  const checkRevenueGrowth = (value: number | null): CriteriaResult => {
    if (value === null) return { passed: false, score: 0, reason: 'No data' };
    const passed = value > 5;
    return {
      passed,
      score: Math.min(100, (value / 5) * 100),
      reason: `Growth: ${value.toFixed(1)}% ${passed ? '✓' : '✗'}`,
    };
  };

  const checkCurrentRatio = (value: number | null): CriteriaResult => {
    if (value === null) return { passed: false, score: 0, reason: 'No data' };
    const passed = value > 1.0;
    return {
      passed,
      score: Math.min(100, value * 100),
      reason: `Liquidity: ${value.toFixed(2)} ${passed ? '✓' : '✗'}`,
    };
  };

  const checkPERatio = (
    peRatio: number | null,
    sectorAvgPE: number | null
  ): CriteriaResult => {
    if (peRatio === null || sectorAvgPE === null) {
      return { passed: false, score: 0, reason: 'No data' };
    }
    const passed = peRatio < sectorAvgPE;
    const discount = ((sectorAvgPE - peRatio) / sectorAvgPE) * 100;
    return {
      passed,
      score: passed ? Math.min(100, 50 + discount) : Math.max(0, 50 - discount),
      reason: `P/E: ${peRatio.toFixed(1)} vs sector ${sectorAvgPE.toFixed(1)} ${passed ? '✓' : '✗'}`,
    };
  };

  // Criterios individuales Nivel 2
  const checkROIC = (value: number | null): CriteriaResult => {
    if (value === null) return { passed: false, score: 0, reason: 'No data' };
    const passed = value > 10;
    return {
      passed,
      score: Math.min(100, (value / 10) * 100),
      reason: `ROIC: ${value.toFixed(1)}% ${passed ? '✓' : '✗'}`,
    };
  };

  const checkOperatingMarginTrend = (
    value: 'up' | 'down' | 'flat' | null
  ): CriteriaResult => {
    if (value === null) return { passed: false, score: 0, reason: 'No data' };
    const passed = value === 'up' || value === 'flat';
    return {
      passed,
      score: value === 'up' ? 100 : value === 'flat' ? 50 : 0,
      reason: `Op. Margin trend: ${value} ${passed ? '✓' : '✗'}`,
    };
  };

  const checkFreeCashFlow = (value: number | null): CriteriaResult => {
    if (value === null) return { passed: false, score: 0, reason: 'No data' };
    const passed = value > 0;
    return {
      passed,
      score: passed ? 100 : 0,
      reason: `FCF: ${value > 0 ? '+' : ''}${(value / 1e9).toFixed(2)}B ${passed ? '✓' : '✗'}`,
    };
  };

  const checkShortTermDebt = (value: number | null): CriteriaResult => {
    if (value === null) return { passed: false, score: 0, reason: 'No data' };
    const passed = value < 20;
    return {
      passed,
      score: Math.max(0, 100 - (value / 20) * 100),
      reason: `Short-term debt: ${value.toFixed(1)}% ${passed ? '✓' : '✗'}`,
    };
  };

  return {
    checkLevel1,
    checkLevel2,
    checkDebtToEquity,
    checkNetProfitMargin,
    checkRevenueGrowth,
    checkCurrentRatio,
    checkPERatio,
    checkROIC,
    checkOperatingMarginTrend,
    checkFreeCashFlow,
    checkShortTermDebt,
  };
}
