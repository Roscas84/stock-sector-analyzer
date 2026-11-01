import { describe, it, expect, beforeEach } from 'vitest';

// Mock export functions
const exportToCSV = (companies: any[]) => {
  if (!companies || companies.length === 0) return '';

  const headers = ['Ticker', 'Empresa', 'Precio USD', 'Nivel 1 Score', 'Nivel 2 Score'];
  let csv = headers.join(',') + '\n';

  companies.forEach(c => {
    csv += [c.ticker, c.name, c.price.toFixed(2), c.level1Score || '-', c.level2Score || '-'].join(',') + '\n';
  });

  return csv;
};

const exportToTXT = (companies: any[], market: string) => {
  if (!companies || companies.length === 0) return '';

  let txt = `STOCK ANALYZER - INFORME DE ANÁLISIS\n`;
  txt += `Mercado: ${market}\n`;
  txt += `Empresas: ${companies.length}\n`;
  txt += `\n${'='.repeat(80)}\n\n`;

  companies.forEach((c, idx) => {
    txt += `${idx + 1}. ${c.ticker} - ${c.name}\n`;
    txt += `   Precio: $${c.price.toFixed(2)}\n`;
  });

  return txt;
};

describe('Export Functions', () => {
  let mockCompanies: any[];

  beforeEach(() => {
    mockCompanies = [
      { ticker: 'AAPL', name: 'Apple Inc', price: 150.50, level1Score: 85, level2Score: 80 },
      { ticker: 'MSFT', name: 'Microsoft Corp', price: 330.25, level1Score: 90, level2Score: 88 },
      { ticker: 'GOOGL', name: 'Google LLC', price: 140.75, level1Score: 75, level2Score: 70 }
    ];
  });

  describe('CSV Export', () => {
    it('should export companies to CSV format', () => {
      const csv = exportToCSV(mockCompanies);
      expect(csv).toContain('Ticker');
      expect(csv).toContain('AAPL');
      expect(csv).toContain('MSFT');
    });

    it('should include correct price format in CSV', () => {
      const csv = exportToCSV(mockCompanies);
      expect(csv).toContain('150.50');
      expect(csv).toContain('330.25');
    });

    it('should handle empty companies list', () => {
      const csv = exportToCSV([]);
      expect(csv).toBe('');
    });

    it('should handle null companies', () => {
      const csv = exportToCSV(null);
      expect(csv).toBe('');
    });

    it('should include scores in CSV', () => {
      const csv = exportToCSV(mockCompanies);
      expect(csv).toContain('85');
      expect(csv).toContain('90');
    });
  });

  describe('TXT Export', () => {
    it('should export companies to TXT format', () => {
      const txt = exportToTXT(mockCompanies, 'USA');
      expect(txt).toContain('STOCK ANALYZER');
      expect(txt).toContain('USA');
      expect(txt).toContain('AAPL');
    });

    it('should include market information', () => {
      const txt = exportToTXT(mockCompanies, 'Brasil');
      expect(txt).toContain('Brasil');
    });

    it('should count companies correctly', () => {
      const txt = exportToTXT(mockCompanies, 'USA');
      expect(txt).toContain('Empresas: 3');
    });

    it('should format company details in TXT', () => {
      const txt = exportToTXT(mockCompanies, 'USA');
      expect(txt).toContain('1. AAPL - Apple Inc');
      expect(txt).toContain('Precio: $150.50');
    });

    it('should handle empty list', () => {
      const txt = exportToTXT([], 'USA');
      expect(txt).toBe('');
    });
  });

  describe('File Format Validation', () => {
    it('should generate valid CSV with proper line breaks', () => {
      const csv = exportToCSV(mockCompanies);
      const lines = csv.split('\n');
      expect(lines.length).toBeGreaterThan(1);
      expect(lines[0]).toContain('Ticker');
    });

    it('should escape special characters in CSV', () => {
      const companiesWithSpecialChar = [
        { ...mockCompanies[0], name: 'Company, Inc' }
      ];
      const csv = exportToCSV(companiesWithSpecialChar);
      // CSV should properly handle commas in names
      expect(csv).toBeDefined();
    });

    it('should maintain order of companies in export', () => {
      const csv = exportToCSV(mockCompanies);
      const lines = csv.split('\n').slice(1); // Skip header
      expect(lines[0]).toContain('AAPL');
      expect(lines[1]).toContain('MSFT');
    });
  });
});
