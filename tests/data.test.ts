import { describe, it, expect } from 'vitest';

// Mock data validation functions
const validateCompanyData = (company: any) => {
  const errors: string[] = [];

  if (!company.ticker) errors.push('Missing ticker');
  if (!company.name) errors.push('Missing name');
  if (typeof company.price !== 'number') errors.push('Invalid price');
  if (company.debtToEquity < 0 || company.debtToEquity > 50) errors.push('Debt-to-Equity out of range');
  if (company.netProfitMargin < -100 || company.netProfitMargin > 100) errors.push('Profit margin out of range');
  if (company.revenueGrowthYoY < -100 || company.revenueGrowthYoY > 300) errors.push('Revenue growth out of range');
  if (company.currentRatio < 0.1 || company.currentRatio > 10) errors.push('Current ratio out of range');
  if (company.peRatio < -100 || company.peRatio > 500) errors.push('P/E ratio out of range');

  return { valid: errors.length === 0, errors };
};

const calculateLevel1Score = (company: any) => {
  let passed = 0;
  const total = 5;

  if (company.debtToEquity < 1.5) passed++;
  if (company.netProfitMargin > 5) passed++;
  if (company.revenueGrowthYoY > 5) passed++;
  if (company.currentRatio > 1.0) passed++;
  if (company.peRatio < company.sectorAvgPE) passed++;

  return Math.round((passed / total) * 100);
};

const calculateLevel2Score = (company: any) => {
  if (!company.level1Pass) return 0;

  let passed = 0;
  const totalCriteria = 4;

  if (company.roic > 10) passed++;
  if (company.operatingMarginTrend === 'up') passed++;
  if (company.freeCashFlow > 0) passed++;
  if (company.quickRatio > 1.0) passed++;

  return Math.round((passed / totalCriteria) * 100);
};

describe('Data Validation', () => {
  it('should validate correct company data', () => {
    const company = {
      ticker: 'AAPL',
      name: 'Apple',
      price: 150,
      debtToEquity: 0.8,
      netProfitMargin: 25,
      revenueGrowthYoY: 10,
      currentRatio: 1.5,
      peRatio: 20
    };

    const validation = validateCompanyData(company);
    expect(validation.valid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  it('should reject missing ticker', () => {
    const company = {
      name: 'Apple',
      price: 150,
      debtToEquity: 0.8,
      netProfitMargin: 25,
      revenueGrowthYoY: 10,
      currentRatio: 1.5,
      peRatio: 20
    };

    const validation = validateCompanyData(company);
    expect(validation.valid).toBe(false);
    expect(validation.errors).toContain('Missing ticker');
  });

  it('should reject invalid price', () => {
    const company = {
      ticker: 'AAPL',
      name: 'Apple',
      price: 'invalid',
      debtToEquity: 0.8,
      netProfitMargin: 25,
      revenueGrowthYoY: 10,
      currentRatio: 1.5,
      peRatio: 20
    };

    const validation = validateCompanyData(company);
    expect(validation.valid).toBe(false);
    expect(validation.errors).toContain('Invalid price');
  });

  it('should reject out-of-range debt ratio', () => {
    const company = {
      ticker: 'AAPL',
      name: 'Apple',
      price: 150,
      debtToEquity: 100,
      netProfitMargin: 25,
      revenueGrowthYoY: 10,
      currentRatio: 1.5,
      peRatio: 20
    };

    const validation = validateCompanyData(company);
    expect(validation.valid).toBe(false);
    expect(validation.errors).toContain('Debt-to-Equity out of range');
  });

  it('should validate multiple companies batch', () => {
    const companies = [
      {
        ticker: 'AAPL',
        name: 'Apple',
        price: 150,
        debtToEquity: 0.8,
        netProfitMargin: 25,
        revenueGrowthYoY: 10,
        currentRatio: 1.5,
        peRatio: 20
      },
      {
        ticker: 'MSFT',
        name: 'Microsoft',
        price: 330,
        debtToEquity: 0.6,
        netProfitMargin: 35,
        revenueGrowthYoY: 15,
        currentRatio: 1.8,
        peRatio: 30
      }
    ];

    const validations = companies.map(validateCompanyData);
    expect(validations.every(v => v.valid)).toBe(true);
  });
});

describe('Score Calculation', () => {
  it('should calculate level 1 score', () => {
    const company = {
      debtToEquity: 0.8,
      netProfitMargin: 10,
      revenueGrowthYoY: 10,
      currentRatio: 1.5,
      peRatio: 20,
      sectorAvgPE: 25
    };

    const score = calculateLevel1Score(company);
    expect(score).toBe(100);
  });

  it('should calculate level 1 score with partial passing', () => {
    const company = {
      debtToEquity: 2.0, // Fails
      netProfitMargin: 10,
      revenueGrowthYoY: 10,
      currentRatio: 1.5,
      peRatio: 20,
      sectorAvgPE: 25
    };

    const score = calculateLevel1Score(company);
    expect(score).toBe(80);
  });

  it('should calculate level 2 score', () => {
    const company = {
      level1Pass: true,
      roic: 15,
      operatingMarginTrend: 'up',
      freeCashFlow: 1e9,
      quickRatio: 1.2
    };

    const score = calculateLevel2Score(company);
    expect(score).toBe(100);
  });

  it('should return 0 score for level 2 if not passing level 1', () => {
    const company = {
      level1Pass: false,
      roic: 15,
      operatingMarginTrend: 'up',
      freeCashFlow: 1e9,
      quickRatio: 1.2
    };

    const score = calculateLevel2Score(company);
    expect(score).toBe(0);
  });
});

describe('Data Ranges and Constraints', () => {
  it('should accept healthy debt levels', () => {
    for (const debtLevel of [0, 0.5, 1.0, 1.5]) {
      const company = {
        ticker: 'TEST',
        name: 'Test',
        price: 100,
        debtToEquity: debtLevel,
        netProfitMargin: 10,
        revenueGrowthYoY: 10,
        currentRatio: 1.5,
        peRatio: 20
      };
      const validation = validateCompanyData(company);
      expect(validation.valid).toBe(true);
    }
  });

  it('should accept reasonable P/E ratios', () => {
    const peRatios = [5, 10, 20, 50, 100];
    for (const pe of peRatios) {
      const company = {
        ticker: 'TEST',
        name: 'Test',
        price: 100,
        debtToEquity: 0.8,
        netProfitMargin: 10,
        revenueGrowthYoY: 10,
        currentRatio: 1.5,
        peRatio: pe
      };
      const validation = validateCompanyData(company);
      expect(validation.valid).toBe(true);
    }
  });

  it('should reject unreasonable profit margins', () => {
    const company = {
      ticker: 'TEST',
      name: 'Test',
      price: 100,
      debtToEquity: 0.8,
      netProfitMargin: 200, // Out of range
      revenueGrowthYoY: 10,
      currentRatio: 1.5,
      peRatio: 20
    };
    const validation = validateCompanyData(company);
    expect(validation.valid).toBe(false);
  });
});

describe('Data Consistency', () => {
  it('should maintain data integrity after calculations', () => {
    const originalCompany = {
      ticker: 'AAPL',
      name: 'Apple',
      price: 150,
      debtToEquity: 0.8,
      netProfitMargin: 25,
      revenueGrowthYoY: 10,
      currentRatio: 1.5,
      peRatio: 20,
      sectorAvgPE: 25,
      level1Pass: true,
      roic: 15,
      operatingMarginTrend: 'up',
      freeCashFlow: 1e9,
      quickRatio: 1.2
    };

    const level1Score = calculateLevel1Score(originalCompany);
    const level2Score = calculateLevel2Score(originalCompany);

    // Original data should not change
    expect(originalCompany.ticker).toBe('AAPL');
    expect(originalCompany.price).toBe(150);
    expect(level1Score).toBeGreaterThan(0);
    expect(level2Score).toBeGreaterThan(0);
  });
});
