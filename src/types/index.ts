// Tipos principales de la aplicación

export interface Company {
  ticker: string;
  name: string;
  sector: string;

  // Nivel 1: Criterios básicos
  debtToEquity: number | null;
  netProfitMargin: number | null;
  revenueGrowthYoY: number | null;
  currentRatio: number | null;
  peRatio: number | null;
  sectorAvgPE: number | null;

  // Nivel 2: Refinamientos
  roic: number | null;
  operatingMarginTrend: 'up' | 'down' | 'flat' | null;
  freeCashFlow: number | null;
  shortTermDebtRatio: number | null;

  // Nivel 3: Datos para indicadores opcionales
  priceHigh52W: number | null;
  priceLow52W: number | null;
  currentPrice: number | null;
  dividendYield: number | null;
  analystTargetPrice: number | null;
  lastNewsDate: string | null;

  // Scores y semaforización
  level1Score: number;
  level1Pass: boolean;
  level2Score: number | null;
  level2Pass: boolean | null;
  semafor: 'green' | 'yellow' | 'red';

  // Metadata
  lastUpdated: string;
  dataSource: 'yahoo' | 'alpha_vantage' | 'finviz' | 'hybrid';
  missingFields: string[];
}

export interface SectorAnalysis {
  id: string;
  sector: string;
  timestamp: string;
  companies: Company[];
  level: 1 | 2 | 3;
  totalAnalyzed: number;
  greenCount: number;
  yellowCount: number;
  redCount: number;
}

export interface UserPreferences {
  level1Thresholds: {
    debtToEquityMax: number;
    netProfitMarginMin: number;
    revenueGrowthMin: number;
    currentRatioMin: number;
    peRatioMax: number;
  };
  level2Thresholds: {
    roicMin: number;
    freeCashFlowMin: number;
    shortTermDebtRatioMax: number;
  };
  excludeNoData: boolean;
  level3Indicators: string[];
}

export interface AnalysisExport {
  sector: string;
  timestamp: string;
  format: 'txt' | 'csv' | 'pdf';
  companies: Company[];
  metadata: {
    totalCompanies: number;
    greenCount: number;
    yellowCount: number;
    redCount: number;
  };
}

export interface ComparisonResult {
  previousAnalysis: SectorAnalysis;
  currentAnalysis: SectorAnalysis;
  movedUp: Company[];
  movedDown: Company[];
  stayedGreen: Company[];
  newEntries: Company[];
  exited: string[];
}
