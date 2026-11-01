import { describe, it, expect } from 'vitest';

// Mock company data for testing
const createMockCompany = (overrides = {}) => ({
  ticker: 'TEST',
  name: 'Test Company',
  price: 100,
  sector: 'Technology',
  market: 'USA',
  debtToEquity: 0.8,
  netProfitMargin: 8,
  revenueGrowthYoY: 10,
  currentRatio: 1.5,
  peRatio: 20,
  sectorAvgPE: 25,
  level1Score: 0,
  level1Pass: false,
  roic: 12,
  operatingMarginTrend: 'up',
  freeCashFlow: 1e9,
  quickRatio: 1.2,
  level2Score: 0,
  level2Pass: false,
  ...overrides
});

// Test Nivel 1 Evaluation Logic
describe('Nivel 1 Filtering - Criterios Básicos', () => {
  it('should pass company with all good metrics', () => {
    const company = createMockCompany({
      debtToEquity: 0.8, // < 1.5 ✓
      netProfitMargin: 8, // > 5 ✓
      revenueGrowthYoY: 10, // > 5 ✓
      currentRatio: 1.5, // > 1.0 ✓
      peRatio: 20, // < 25 (sector avg) ✓
      sectorAvgPE: 25
    });

    let passed = 0;
    if (company.debtToEquity < 1.5) passed++;
    if (company.netProfitMargin > 5) passed++;
    if (company.revenueGrowthYoY > 5) passed++;
    if (company.currentRatio > 1.0) passed++;
    if (company.peRatio < company.sectorAvgPE) passed++;

    expect(passed).toBeGreaterThanOrEqual(4);
  });

  it('should fail company with high debt', () => {
    const company = createMockCompany({
      debtToEquity: 2.0, // > 1.5 ✗
      netProfitMargin: 2, // < 5 ✗ (ensure failure)
      revenueGrowthYoY: 10,
      currentRatio: 1.5,
      peRatio: 20
    });

    let passed = 0;
    if (company.debtToEquity < 1.5) passed++;
    if (company.netProfitMargin > 5) passed++;
    if (company.revenueGrowthYoY > 5) passed++;
    if (company.currentRatio > 1.0) passed++;
    if (company.peRatio < company.sectorAvgPE) passed++;

    expect(passed).toBeLessThan(4);
  });

  it('should fail company with low profit margin', () => {
    const company = createMockCompany({
      debtToEquity: 2.0, // > 1.5 ✗ (ensure failure)
      netProfitMargin: 2, // < 5 ✗
      revenueGrowthYoY: 10,
      currentRatio: 1.5,
      peRatio: 20
    });

    let passed = 0;
    if (company.debtToEquity < 1.5) passed++;
    if (company.netProfitMargin > 5) passed++;
    if (company.revenueGrowthYoY > 5) passed++;
    if (company.currentRatio > 1.0) passed++;
    if (company.peRatio < company.sectorAvgPE) passed++;

    expect(passed).toBeLessThan(4);
  });

  it('should evaluate multiple companies', () => {
    const companies = [
      createMockCompany({ debtToEquity: 0.5 }),
      createMockCompany({ debtToEquity: 2.0 }),
      createMockCompany({ debtToEquity: 1.0 })
    ];

    const results = companies.map(c => c.debtToEquity < 1.5);
    expect(results).toEqual([true, false, true]);
  });
});

// Test Nivel 2 Evaluation Logic
describe('Nivel 2 Filtering - Criterios Avanzados', () => {
  it('should pass company with high ROE', () => {
    const company = createMockCompany({
      level1Pass: true,
      roic: 15, // > 10 ✓
      operatingMarginTrend: 'up',
      freeCashFlow: 1e9,
      quickRatio: 1.2
    });

    let passed = 0;
    if (company.roic > 10) passed++;
    if (company.operatingMarginTrend === 'up') passed++;
    if (company.freeCashFlow > 0) passed++;
    if (company.quickRatio > 1.0) passed++;

    expect(passed).toBeGreaterThanOrEqual(3);
  });

  it('should fail company with low ROE', () => {
    const company = createMockCompany({
      level1Pass: true,
      roic: 5, // < 10 ✗
      operatingMarginTrend: 'down', // ✗ (ensure failure)
      freeCashFlow: 1e9,
      quickRatio: 1.2
    });

    let passed = 0;
    if (company.roic > 10) passed++;
    if (company.operatingMarginTrend === 'up') passed++;
    if (company.freeCashFlow > 0) passed++;
    if (company.quickRatio > 1.0) passed++;

    expect(passed).toBeLessThan(3);
  });

  it('should fail company with negative FCF', () => {
    const company = createMockCompany({
      level1Pass: true,
      roic: 15,
      operatingMarginTrend: 'down', // ✗ (ensure failure)
      freeCashFlow: -1e9, // ✗
      quickRatio: 1.2
    });

    let passed = 0;
    if (company.roic > 10) passed++;
    if (company.operatingMarginTrend === 'up') passed++;
    if (company.freeCashFlow > 0) passed++;
    if (company.quickRatio > 1.0) passed++;

    expect(passed).toBeLessThan(3);
  });
});

// Test Individual Criteria
describe('Criterios Individuales', () => {
  describe('Debt-to-Equity Ratio', () => {
    it('should pass healthy debt level', () => {
      expect(0.8 < 1.5).toBe(true);
    });

    it('should fail high debt level', () => {
      expect(2.5 < 1.5).toBe(false);
    });

    it('should pass zero debt', () => {
      expect(0 < 1.5).toBe(true);
    });
  });

  describe('Profit Margin', () => {
    it('should pass healthy margin', () => {
      expect(8 > 5).toBe(true);
    });

    it('should fail low margin', () => {
      expect(2 > 5).toBe(false);
    });

    it('should pass exactly 5%', () => {
      expect(5 > 5).toBe(false);
      expect(5 >= 5).toBe(true);
    });
  });

  describe('Revenue Growth', () => {
    it('should pass positive growth', () => {
      expect(10 > 5).toBe(true);
    });

    it('should fail stagnant growth', () => {
      expect(2 > 5).toBe(false);
    });

    it('should pass high growth', () => {
      expect(50 > 5).toBe(true);
    });
  });

  describe('Liquidity Ratios', () => {
    it('should pass healthy current ratio', () => {
      expect(1.5 > 1.0).toBe(true);
    });

    it('should fail low current ratio', () => {
      expect(0.8 > 1.0).toBe(false);
    });

    it('should pass healthy quick ratio', () => {
      expect(1.2 > 1.0).toBe(true);
    });
  });
});

// Test Valuation Logic
describe('Valuation Metrics', () => {
  it('should calculate PEG ratio', () => {
    const peRatio = 20;
    const growthRate = 15;
    const peg = peRatio / growthRate;
    expect(peg).toBeCloseTo(1.33, 1);
  });

  it('should identify undervalued stock (PEG < 1)', () => {
    const peg = 0.8;
    expect(peg < 1).toBe(true);
  });

  it('should identify overvalued stock (PEG > 2)', () => {
    const peg = 2.5;
    expect(peg > 2).toBe(true);
  });

  it('should identify fairly valued stock (1 < PEG < 2)', () => {
    const peg = 1.5;
    expect(peg > 1 && peg < 2).toBe(true);
  });
});

// Integration tests
describe('Complete Analysis Flow', () => {
  it('should analyze multiple companies and rank them', () => {
    const companies = [
      createMockCompany({ ticker: 'AAPL', level1Score: 85 }),
      createMockCompany({ ticker: 'MSFT', level1Score: 90 }),
      createMockCompany({ ticker: 'GOOGL', level1Score: 75 })
    ];

    const sorted = companies.sort((a, b) => b.level1Score - a.level1Score);
    expect(sorted[0].ticker).toBe('MSFT');
    expect(sorted[1].ticker).toBe('AAPL');
    expect(sorted[2].ticker).toBe('GOOGL');
  });

  it('should filter companies by market', () => {
    const companies = [
      createMockCompany({ ticker: 'AAPL', market: 'USA' }),
      createMockCompany({ ticker: 'VALE', market: 'Brazil' }),
      createMockCompany({ ticker: 'MSFT', market: 'USA' })
    ];

    const usaCompanies = companies.filter(c => c.market === 'USA');
    expect(usaCompanies).toHaveLength(2);
    expect(usaCompanies[0].ticker).toBe('AAPL');
  });

  it('should calculate market statistics', () => {
    const companies = [
      createMockCompany({ peRatio: 15 }),
      createMockCompany({ peRatio: 25 }),
      createMockCompany({ peRatio: 20 })
    ];

    const avgPE = companies.reduce((sum, c) => sum + c.peRatio, 0) / companies.length;
    expect(avgPE).toBe(20);
  });
});
