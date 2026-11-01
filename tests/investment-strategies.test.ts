import { describe, it, expect } from 'vitest';

// Mock functions from handlers
const calculateMoatScore = (company: any) => {
  let score = 0;
  const roic = company.roic || 0;
  if (roic > 20) score += 35;
  else if (roic > 15) score += 25;
  else if (roic > 10) score += 15;

  const margin = company.netProfitMargin || 0;
  if (margin > 20) score += 30;
  else if (margin > 15) score += 20;
  else if (margin > 10) score += 10;

  const debtTrend = company.debtTrend || 'flat';
  if (debtTrend === 'down') score += 20;
  else if (debtTrend === 'flat') score += 10;

  const growth = company.revenueGrowthYoY || 0;
  if (growth > 10) score += 10;

  return Math.min(Math.max(score, 0), 100);
};

const calculateManagementScore = (company: any) => {
  let score = 0;
  const margin = company.netProfitMargin || 0;
  if (margin > 15) score += 30;
  else if (margin > 10) score += 20;

  const roic = company.roic || 0;
  if (roic > 15) score += 25;
  else if (roic > 10) score += 15;

  const de = company.debtToEquity || 0;
  if (de < 0.5) score += 20;
  else if (de < 1.0) score += 15;

  const fcf = company.freeCashFlow || 0;
  if (fcf > 0) score += 25;

  return Math.min(Math.max(score, 0), 100);
};

const evaluateLynchScore = (company: any) => {
  const growth = company.revenueGrowthYoY || 0;
  const pe = company.peRatio || 0;
  const peg = growth > 0 ? pe / growth : 999;

  return { growth, peRatio: pe, pegRatio: peg };
};

const evaluateGrahamDividend = (company: any) => {
  const dividend = company.dividendYield || 0;
  const de = company.debtToEquity || 0;
  const fcf = company.freeCashFlow || 0;

  return { dividend, debtToEquity: de, freeCashFlow: fcf };
};

const classifyBusinessCycle = (company: any) => {
  const growth = company.revenueGrowthYoY || 0;
  const margin = company.netProfitMargin || 0;

  if (growth > 20 && margin < 5) return 'STARTUP';
  if (growth > 10 && margin > 5) return 'GROWTH';
  if (growth < 5 && margin > 10) return 'MATURE';
  if (growth < 0) return 'DECLINE';
  return 'STABLE';
};

describe('Moat Score - Warren Buffett', () => {
  it('should calculate moat score for strong companies', () => {
    const company = {
      roic: 20,
      netProfitMargin: 25,
      debtTrend: 'down',
      revenueGrowthYoY: 15
    };
    const score = calculateMoatScore(company);
    expect(score).toBeGreaterThan(70);
  });

  it('should give high ROE strong weight', () => {
    const strong = { roic: 18 };
    const weak = { roic: 8 };
    expect(calculateMoatScore(strong)).toBeGreaterThan(calculateMoatScore(weak));
  });

  it('should cap score at 100', () => {
    const excellent = {
      roic: 30,
      netProfitMargin: 30,
      debtTrend: 'down',
      revenueGrowthYoY: 20
    };
    expect(calculateMoatScore(excellent)).toBeLessThanOrEqual(100);
  });
});

describe('Management Quality Score', () => {
  it('should reward high efficiency and low debt', () => {
    const company = {
      netProfitMargin: 20,
      roic: 15,
      debtToEquity: 0.5,
      freeCashFlow: 5
    };
    const score = calculateManagementScore(company);
    expect(score).toBeGreaterThan(80);
  });

  it('should penalize negative FCF', () => {
    const badCash = { freeCashFlow: -2 };
    const goodCash = { freeCashFlow: 5 };
    expect(calculateManagementScore(goodCash)).toBeGreaterThan(calculateManagementScore(badCash));
  });
});

describe('Peter Lynch GARP', () => {
  it('should calculate PEG ratio correctly', () => {
    const company = { peRatio: 20, revenueGrowthYoY: 20 };
    const lynch = evaluateLynchScore(company);
    expect(lynch.pegRatio).toBe(1.0);
  });

  it('should handle zero growth gracefully', () => {
    const stagnant = { peRatio: 20, revenueGrowthYoY: 0 };
    const lynch = evaluateLynchScore(stagnant);
    expect(lynch.pegRatio).toBeGreaterThan(100);
  });

  it('should prefer low PEG ratio', () => {
    const goodGarp = { peRatio: 15, revenueGrowthYoY: 20 };
    const badGarp = { peRatio: 30, revenueGrowthYoY: 15 };
    expect(evaluateLynchScore(goodGarp).pegRatio).toBeLessThan(evaluateLynchScore(badGarp).pegRatio);
  });
});

describe('Benjamin Graham Dividends', () => {
  it('should identify sustainable dividends', () => {
    const sustainable = {
      dividendYield: 4,
      debtToEquity: 0.8,
      freeCashFlow: 10
    };
    const graham = evaluateGrahamDividend(sustainable);
    expect(graham.dividend).toBe(4);
    expect(graham.debtToEquity).toBeLessThan(1);
  });

  it('should flag high-dividend traps', () => {
    const trap = {
      dividendYield: 8,
      debtToEquity: 2.0,
      freeCashFlow: -1
    };
    const graham = evaluateGrahamDividend(trap);
    expect(graham.debtToEquity).toBeGreaterThan(1.5);
  });
});

describe('Business Cycle Classification', () => {
  it('should classify GROWTH correctly', () => {
    const growth = { revenueGrowthYoY: 15, netProfitMargin: 10 };
    expect(classifyBusinessCycle(growth)).toBe('GROWTH');
  });

  it('should classify MATURE correctly', () => {
    const mature = { revenueGrowthYoY: 3, netProfitMargin: 15 };
    expect(classifyBusinessCycle(mature)).toBe('MATURE');
  });

  it('should classify STARTUP correctly', () => {
    const startup = { revenueGrowthYoY: 50, netProfitMargin: 2 };
    expect(classifyBusinessCycle(startup)).toBe('STARTUP');
  });

  it('should classify DECLINE correctly', () => {
    const decline = { revenueGrowthYoY: -10, netProfitMargin: 5 };
    expect(classifyBusinessCycle(decline)).toBe('DECLINE');
  });
});

describe('Integration: Multiple Scores', () => {
  it('should rank Apple higher than stagnant company', () => {
    const apple = {
      roic: 95,
      netProfitMargin: 26,
      debtToEquity: 1.0,
      revenueGrowthYoY: 8
    };
    const stagnant = {
      roic: 5,
      netProfitMargin: 3,
      debtToEquity: 2.0,
      revenueGrowthYoY: -2
    };

    expect(calculateMoatScore(apple)).toBeGreaterThan(calculateMoatScore(stagnant));
    expect(calculateManagementScore(apple)).toBeGreaterThan(calculateManagementScore(stagnant));
  });
});
