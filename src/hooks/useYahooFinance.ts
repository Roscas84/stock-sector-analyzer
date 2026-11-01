import { useState } from 'react';
import { Company } from '../types/index';

interface YahooQuote {
  symbol: string;
  longName: string;
  sector: string;
  debtToEquity?: number;
  netIncomeToCommon?: number;
  totalRevenue?: number;
  priceBook?: number;
  currentRatio?: number;
  trailingPE?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  currentPrice?: number;
  dividendYield?: number;
}

export function useYahooFinance() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener lista de empresas por sector
  const getSectorCompanies = async (sector: string): Promise<string[]> => {
    setLoading(true);
    setError(null);

    try {
      // En producción, usar una API real o un dataset precargado
      // Por ahora, retornamos un array de ejemplo
      const sectorTickers: Record<string, string[]> = {
        industrial: ['CAT', 'BA', 'MMM', 'GE', 'LMT', 'RTX', 'HON', 'ETN'],
        technology: ['AAPL', 'MSFT', 'GOOGL', 'NVDA', 'META', 'TSLA', 'AMD'],
        healthcare: ['JNJ', 'UNH', 'PFE', 'ABBV', 'MRK', 'LLY', 'MCD'],
        financiero: ['JPM', 'BAC', 'WFC', 'GS', 'BLK', 'MMC', 'AXP'],
        consumo: ['WMT', 'HD', 'COS', 'MCD', 'SBUX', 'AZO', 'PM'],
        energia: ['XOM', 'CVX', 'MPC', 'PSX', 'VLO', 'OXY', 'COP'],
      };

      const tickers = sectorTickers[sector.toLowerCase()] || [];
      setLoading(false);
      return tickers;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      setLoading(false);
      return [];
    }
  };

  // Obtener datos financieros de una empresa
  const getCompanyData = async (ticker: string, sector: string): Promise<Company | null> => {
    try {
      // Simulación de datos hasta conectar API real
      // En producción: https://query1.finance.yahoo.com/v10/finance/quoteSummary/{ticker}
      const mockData: Record<string, Partial<Company>> = {
        CAT: {
          ticker: 'CAT',
          name: 'Caterpillar Inc.',
          sector: 'Industrial',
          debtToEquity: 1.2,
          netProfitMargin: 8.5,
          revenueGrowthYoY: 7.2,
          currentRatio: 1.3,
          peRatio: 14.5,
          sectorAvgPE: 16,
          roic: 12.3,
          operatingMarginTrend: 'up',
          freeCashFlow: 2.1e9,
          shortTermDebtRatio: 15,
          priceHigh52W: 280,
          priceLow52W: 210,
          currentPrice: 250,
          dividendYield: 2.1,
        },
        BA: {
          ticker: 'BA',
          name: 'The Boeing Company',
          sector: 'Industrial',
          debtToEquity: 1.8,
          netProfitMargin: 4.2,
          revenueGrowthYoY: 3.1,
          currentRatio: 0.9,
          peRatio: 25,
          sectorAvgPE: 16,
          roic: 8.1,
          operatingMarginTrend: 'flat',
          freeCashFlow: -1.2e9,
          shortTermDebtRatio: 35,
          priceHigh52W: 210,
          priceLow52W: 150,
          currentPrice: 180,
          dividendYield: 0,
        },
      };

      const data = mockData[ticker];
      if (!data) return null;

      const company: Company = {
        ticker,
        name: data.name || ticker,
        sector,
        debtToEquity: data.debtToEquity || null,
        netProfitMargin: data.netProfitMargin || null,
        revenueGrowthYoY: data.revenueGrowthYoY || null,
        currentRatio: data.currentRatio || null,
        peRatio: data.peRatio || null,
        sectorAvgPE: data.sectorAvgPE || null,
        roic: data.roic || null,
        operatingMarginTrend: data.operatingMarginTrend || null,
        freeCashFlow: data.freeCashFlow || null,
        shortTermDebtRatio: data.shortTermDebtRatio || null,
        priceHigh52W: data.priceHigh52W || null,
        priceLow52W: data.priceLow52W || null,
        currentPrice: data.currentPrice || null,
        dividendYield: data.dividendYield || null,
        analystTargetPrice: null,
        lastNewsDate: null,
        level1Score: 0,
        level1Pass: false,
        level2Score: null,
        level2Pass: null,
        semafor: 'red',
        lastUpdated: new Date().toISOString(),
        dataSource: 'yahoo',
        missingFields: [],
      };

      return company;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      return null;
    }
  };

  // Obtener múltiples empresas
  const getCompaniesData = async (
    tickers: string[],
    sector: string
  ): Promise<Company[]> => {
    setLoading(true);
    setError(null);

    try {
      const companies = await Promise.all(
        tickers.map((ticker) => getCompanyData(ticker, sector))
      );

      const validCompanies = companies.filter((c) => c !== null) as Company[];
      setLoading(false);
      return validCompanies;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      setLoading(false);
      return [];
    }
  };

  return {
    loading,
    error,
    getSectorCompanies,
    getCompanyData,
    getCompaniesData,
  };
}
