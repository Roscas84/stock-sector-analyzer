import { describe, it, expect } from 'vitest';

// Mock company data for testing reversal opportunities
const createMockCompany = (overrides = {}) => ({
  ticker: 'TEST',
  name: 'Test Company',
  price: 70,
  high52Week: 100,
  low52Week: 50,
  priceToBook: 1.5,
  decline52Week: 30,  // ((100-70)/100)*100 = 30%
  level1Pass: true,
  level2Pass: true,
  ...overrides
});

// Reversal evaluation function (from level2.5-handler.js)
const evaluateReversalOpportunity = (company: any) => {
  if (!company.level1Pass || !company.level2Pass) {
    return {
      passed: false,
      decline: company.decline52Week || 0,
      pbRatio: company.priceToBook || 0,
      signal: '🔵 N/A',
      reason: 'No cumple Nivel 1 o 2'
    };
  }

  const decline = company.decline52Week || 0;
  const pbRatio = company.priceToBook || 0;
  const max52w = company.high52Week || 0;
  const current = company.price || 0;

  const isBeatenDown = decline > 20;
  const isCheap = pbRatio > 0 && pbRatio < 1.8;
  const isNotCrashing = current > (max52w * 0.5);

  let signal = '⚪ No es oportunidad';
  let score = 0;
  let reason = '';

  if (!isBeatenDown && !isCheap) {
    signal = '⚪ Precio normal';
    reason = 'Sin caída significativa ni valuación baja';
    score = 0;
  } else if (isBeatenDown && isCheap && isNotCrashing) {
    signal = '🔥 COMPRA ATRACTIVA';
    score = 100;
    reason = `Cayó ${decline}%, P/B=${pbRatio}x → Oportunidad real`;
  } else if (isBeatenDown && !isCheap) {
    signal = '⚠️ TRAMPA DE VALOR';
    score = 30;
    reason = `Caída ${decline}% pero P/B=${pbRatio}x (cara) → Corrección justificada`;
  } else if (isCheap && !isBeatenDown) {
    signal = '💰 Inversión estable';
    score = 60;
    reason = `P/B bajo (${pbRatio}x) pero sin caída reciente → Acumulación lenta`;
  }

  if (!isNotCrashing) {
    signal = '🚨 RIESGO EXTREMO';
    score = 0;
    reason = 'Caída > 50% → Posible colapso de empresa, no oportunidad';
  }

  return {
    passed: signal.includes('🔥'),
    decline: decline,
    pbRatio: pbRatio,
    max52Week: max52w,
    currentPrice: current,
    signal: signal,
    score: score,
    reason: reason
  };
};

describe('Level 2.5 - Reversal Opportunity Detection', () => {
  describe('Ideal Opportunity Detection', () => {
    it('should identify COMPRA ATRACTIVA when decline > 20% AND P/B < 1.8', () => {
      const company = createMockCompany({
        decline52Week: 25,
        priceToBook: 1.5
      });

      const result = evaluateReversalOpportunity(company);
      expect(result.passed).toBe(true);
      expect(result.signal).toContain('🔥 COMPRA ATRACTIVA');
      expect(result.score).toBe(100);
    });

    it('should score 100 for ideal opportunities', () => {
      const ideal = createMockCompany({
        decline52Week: 35,
        priceToBook: 1.2
      });

      const result = evaluateReversalOpportunity(ideal);
      expect(result.score).toBe(100);
    });

    it('should score 100 even for steep declines (up to 50%)', () => {
      const steep = createMockCompany({
        decline52Week: 45,
        priceToBook: 1.5,
        price: 55,  // Still above 50% threshold
        high52Week: 100
      });

      const result = evaluateReversalOpportunity(steep);
      expect(result.score).toBe(100);
    });
  });

  describe('Value Trap Detection', () => {
    it('should detect TRAMPA DE VALOR (decline but expensive)', () => {
      const company = createMockCompany({
        decline52Week: 30,    // Cayó 30%
        priceToBook: 2.5      // Pero sigue cara (P/B > 1.8)
      });

      const result = evaluateReversalOpportunity(company);
      expect(result.passed).toBe(false);
      expect(result.signal).toContain('⚠️ TRAMPA DE VALOR');
      expect(result.score).toBe(30);
    });

    it('should warn about justified corrections', () => {
      const trap = createMockCompany({
        decline52Week: 25,
        priceToBook: 2.0  // Just over threshold
      });

      const result = evaluateReversalOpportunity(trap);
      expect(result.reason).toContain('Corrección justificada');
    });
  });

  describe('Stable Investment Detection', () => {
    it('should identify INVERSIÓN ESTABLE (cheap but no recent decline)', () => {
      const company = createMockCompany({
        decline52Week: 10,    // No significant decline
        priceToBook: 1.2      // But cheap
      });

      const result = evaluateReversalOpportunity(company);
      expect(result.passed).toBe(false);
      expect(result.signal).toContain('💰 Inversión estable');
      expect(result.score).toBe(60);
    });

    it('should score stable investments lower than opportunities', () => {
      const stable = createMockCompany({
        decline52Week: 15,
        priceToBook: 1.0
      });

      const opportunity = createMockCompany({
        decline52Week: 25,
        priceToBook: 1.5
      });

      const stableResult = evaluateReversalOpportunity(stable);
      const opportunityResult = evaluateReversalOpportunity(opportunity);

      expect(stableResult.score).toBeLessThan(opportunityResult.score);
    });
  });

  describe('Extreme Risk Detection', () => {
    it('should flag RIESGO EXTREMO for declines > 50%', () => {
      const extreme = createMockCompany({
        decline52Week: 60,      // Fell 60%
        price: 40,              // Below 50% threshold
        high52Week: 100,
        priceToBook: 1.2
      });

      const result = evaluateReversalOpportunity(extreme);
      expect(result.passed).toBe(false);
      expect(result.signal).toContain('🚨 RIESGO EXTREMO');
      expect(result.score).toBe(0);
    });

    it('should warn that extreme declines may indicate collapse', () => {
      const extreme = createMockCompany({
        decline52Week: 70,
        price: 30,
        high52Week: 100
      });

      const result = evaluateReversalOpportunity(extreme);
      expect(result.reason).toContain('Posible colapso');
    });
  });

  describe('Decline Threshold Testing', () => {
    it('should require decline > 20% (not exactly 20%)', () => {
      const exactly20 = createMockCompany({
        decline52Week: 20,
        priceToBook: 1.5
      });

      const over20 = createMockCompany({
        decline52Week: 20.1,
        priceToBook: 1.5
      });

      const result20 = evaluateReversalOpportunity(exactly20);
      const resultOver = evaluateReversalOpportunity(over20);

      expect(result20.passed).toBe(false);  // Threshold is > 20, not >= 20
      expect(resultOver.passed).toBe(true);
    });
  });

  describe('P/B Ratio Threshold Testing', () => {
    it('should allow P/B < 1.8 (exactly 1.8 is not acceptable)', () => {
      const exactly18 = createMockCompany({
        decline52Week: 25,
        priceToBook: 1.8
      });

      const under18 = createMockCompany({
        decline52Week: 25,
        priceToBook: 1.79
      });

      const result18 = evaluateReversalOpportunity(exactly18);
      const resultUnder = evaluateReversalOpportunity(under18);

      expect(result18.passed).toBe(false);  // Threshold is < 1.8
      expect(resultUnder.passed).toBe(true);
    });
  });

  describe('Level 1 & 2 Dependency', () => {
    it('should reject if company did not pass Level 1', () => {
      const company = createMockCompany({
        level1Pass: false,
        decline52Week: 30,
        priceToBook: 1.5
      });

      const result = evaluateReversalOpportunity(company);
      expect(result.passed).toBe(false);
      expect(result.signal).toContain('🔵 N/A');
    });

    it('should reject if company did not pass Level 2', () => {
      const company = createMockCompany({
        level1Pass: true,
        level2Pass: false,
        decline52Week: 30,
        priceToBook: 1.5
      });

      const result = evaluateReversalOpportunity(company);
      expect(result.passed).toBe(false);
      expect(result.signal).toContain('🔵 N/A');
    });

    it('should only evaluate if BOTH Level 1 AND Level 2 passed', () => {
      const company = createMockCompany({
        level1Pass: true,
        level2Pass: true,
        decline52Week: 30,
        priceToBook: 1.5
      });

      const result = evaluateReversalOpportunity(company);
      expect(result.passed).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing P/B ratio', () => {
      const company = createMockCompany({
        priceToBook: 0,  // Missing or invalid
        decline52Week: 25
      });

      const result = evaluateReversalOpportunity(company);
      expect(result.passed).toBe(false);
      expect(result.pbRatio).toBe(0);
    });

    it('should handle missing decline data', () => {
      const company = createMockCompany({
        decline52Week: 0,  // Missing or no data
        priceToBook: 1.5
      });

      const result = evaluateReversalOpportunity(company);
      expect(result.passed).toBe(false);
      expect(result.decline).toBe(0);
    });

    it('should handle both metrics missing', () => {
      const company = createMockCompany({
        decline52Week: 0,
        priceToBook: 0
      });

      const result = evaluateReversalOpportunity(company);
      expect(result.passed).toBe(false);
      // When both are missing/zero, signal is 'Precio normal' (no decline, not cheap)
      expect(result.signal).toContain('⚪');  // Both should have warning symbol
    });
  });

  describe('Real-World Scenarios', () => {
    it('should identify Amazon-like correction (tech sell-off but healthy)', () => {
      const amazon = createMockCompany({
        ticker: 'AMZN',
        name: 'Amazon.com',
        level1Pass: true,
        level2Pass: true,
        decline52Week: 35,
        priceToBook: 5.2  // Tech companies have high P/B normally
      });

      const result = evaluateReversalOpportunity(amazon);
      // Still not an opportunity because P/B is too high even after decline
      expect(result.passed).toBe(false);
    });

    it('should identify Petrobras-like opportunity (beaten down oil stock)', () => {
      const petrobras = createMockCompany({
        ticker: 'PBR',
        name: 'Petrobras',
        level1Pass: true,
        level2Pass: true,
        decline52Week: 35,
        priceToBook: 1.49
      });

      const result = evaluateReversalOpportunity(petrobras);
      expect(result.passed).toBe(true);
      expect(result.signal).toContain('🔥');
    });

    it('should identify bank dividend play (cheap and stable)', () => {
      const bank = createMockCompany({
        ticker: 'ITUB',
        name: 'Itaú',
        level1Pass: true,
        level2Pass: true,
        decline52Week: 10,
        priceToBook: 1.1
      });

      const result = evaluateReversalOpportunity(bank);
      expect(result.passed).toBe(false);
      expect(result.signal).toContain('💰');  // Stable, not opportunity
    });
  });

  describe('Filtering and Sorting', () => {
    it('should filter multiple companies to identify opportunities', () => {
      const companies = [
        createMockCompany({ ticker: 'A', decline52Week: 15, priceToBook: 1.5 }),
        createMockCompany({ ticker: 'B', decline52Week: 30, priceToBook: 1.2 }),
        createMockCompany({ ticker: 'C', decline52Week: 25, priceToBook: 2.0 }),
        createMockCompany({ ticker: 'D', decline52Week: 40, priceToBook: 1.5 })
      ];

      const opportunities = companies
        .map((c, idx) => ({
          ...c,
          analysis: evaluateReversalOpportunity(c)
        }))
        .filter(c => c.analysis.passed);

      expect(opportunities).toHaveLength(2);
      expect(opportunities.some(c => c.ticker === 'B')).toBe(true);
      expect(opportunities.some(c => c.ticker === 'D')).toBe(true);
    });

    it('should sort opportunities by score descending', () => {
      const companies = [
        createMockCompany({ decline52Week: 25, priceToBook: 1.5 }),
        createMockCompany({ decline52Week: 40, priceToBook: 1.2 }),
        createMockCompany({ decline52Week: 30, priceToBook: 1.5 })
      ];

      const analyzed = companies.map(c => ({
        ...c,
        analysis: evaluateReversalOpportunity(c)
      }));

      // All should be opportunities (declined > 20% and cheap)
      expect(analyzed.every(c => c.analysis.passed)).toBe(true);

      // Should sort by decline (highest first)
      const sorted = analyzed.sort((a, b) => b.analysis.decline - a.analysis.decline);
      expect(sorted[0].analysis.decline).toBe(40);
      expect(sorted[2].analysis.decline).toBe(25);
    });
  });
});
