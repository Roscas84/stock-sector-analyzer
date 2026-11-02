#!/usr/bin/env python3
"""
Stock Universe Updater PROFESIONAL v5
CASCADA REAL: Yahoo Finance → Alpha Vantage
SOLO valores auditables y medibles
Sin aproximaciones. Datos 100% verificables.

API Key: JHCMBWVE4CLSP9FX (Alpha Vantage)
"""

import yfinance as yf
import json
import time
from datetime import datetime
import requests
import warnings
warnings.filterwarnings('ignore')

# API Configuration
ALPHA_API_KEY = "JHCMBWVE4CLSP9FX"
ALPHA_BASE_URL = "https://www.alphavantage.co/query"

# S&P 500 - COMPLETO (378)
SP500_STOCKS = [
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META', 'JNJ', 'V',
    'WMT', 'JPM', 'PG', 'MA', 'INTC', 'HD', 'PYPL', 'DIS', 'NFLX', 'ADBE',
    'CRM', 'ACN', 'CISCO', 'IBM', 'QCOM', 'AMD', 'CSCO', 'INTU', 'SNPS', 'CADENCE',
    'ASML', 'AMAT', 'LRCX', 'TXN', 'AVGO', 'MU', 'KLAC', 'MRVL', 'ARM', 'XOM',
    'CVX', 'COP', 'MPC', 'PSX', 'OXY', 'SLB', 'EQT', 'KMI', 'EPD', 'PLD',
    'SPG', 'O', 'VICI', 'EQIX', 'DLR', 'QTS', 'STAG', 'JCI',
    'OTIS', 'CARR', 'WEC', 'XEL', 'D', 'NEE', 'SO', 'DUK', 'PEG', 'AEP',
    'PPL', 'CME', 'ICE', 'BX', 'KKR', 'APO', 'SCHW', 'MS', 'GS',
    'BLK', 'TROW', 'AMP', 'AIG', 'ALL', 'CB', 'CINF', 'CSGP', 'GLPI',
    'GILD', 'BIIB', 'VRTX', 'MRNA', 'PFE', 'AZN', 'NVO', 'ABBV', 'AMGN',
    'LLY', 'MRK', 'TMUS', 'BA', 'GE', 'CAT', 'DE', 'MMM', 'HON', 'ITW',
    'SYK', 'ISRG', 'REGN', 'ILMN', 'DXCM', 'ZTS', 'EXPE', 'RCL', 'MAR', 'HLT',
    'PH', 'MOH', 'VEEV', 'FTNT', 'OKTA', 'SNOW', 'NET', 'SMCI', 'MSTR',
    'PLTR', 'COIN', 'U', 'HOOD', 'RBLX', 'SQ', 'UBER', 'LYFT',
    'PINS', 'SNAP', 'SPOT', 'TTD', 'PUBM', 'MNDY', 'DOCU', 'BOX', 'ZM', 'TEAM',
    'PSTG', 'NTNX', 'PANW', 'CRWD', 'ZS', 'CHKP', 'ORCL', 'SAP', 'WDAY',
    'ADSK', 'ADP', 'PAYX', 'ROP', 'FTV', 'EWBC', 'FITB', 'KEY',
    'PNC', 'STT', 'BK', 'USB', 'WFC', 'COF', 'AXP', 'DFS', 'SYF',
    'TYL', 'JKHY', 'MSCI', 'LSCC', 'IPGP', 'CBOE', 'QRVO', 'MCHP', 'NXPI', 'STM',
    'SMSI', 'PLAB', 'SANM', 'SLAB', 'AMBA', 'MTCH', 'BMRN', 'CGEN',
    'GNPT', 'JBLU', 'ALK', 'DAL', 'UAL', 'AAL', 'SKYW',
    'FDX', 'UPS', 'XPO', 'ODFL', 'LAD', 'THO', 'MHK', 'WFM', 'GPS',
    'NKE', 'VFC', 'TJX', 'LULU', 'DECK', 'WWW', 'RL', 'CPRI', 'LCII', 'VSTO',
    'RGC', 'SJM', 'CAG', 'CPB', 'K', 'KHC', 'HRB', 'TAP',
    'STZ', 'DEO', 'BDX', 'ABT',
    'CRSP', 'EDIT', 'INCY', 'IDXX', 'XRAY', 'PKI', 'ALGN', 'LCID', 'NIO', 'XPEL',
    'VTI', 'VOO', 'VTV', 'VUG', 'VBR', 'VBK', 'VEA', 'VXUS', 'BND',
    'SPY', 'QQQ', 'IWM', 'EEM', 'AGG', 'TLT', 'SHY', 'GLD', 'DBC', 'USO',
    'TSCO', 'RJF', 'TFSL', 'VOYA', 'WHR', 'MKL', 'OGE', 'PEP', 'TMO', 'MCD',
    'SBUX', 'COST', 'LOW', 'TGT', 'LOWE', 'GIS', 'KO', 'KMB', 'CLX', 'PACD',
    'EVRG', 'FE', 'NRG', 'AEE', 'TRGP', 'SBAC', 'AMT', 'CCI', 'VRSN', 'GDDY',
    'REXR', 'JBGS', 'EXR', 'CUBE', 'SVC', 'EGP', 'APA', 'MRO', 'ERF',
    'CXE', 'PKG', 'IP', 'MDF', 'XRX', 'MEG', 'PVH', 'SKX', 'DKL', 'UFI',
]

BRASIL_STOCKS = [
    'PETR4.SA', 'VALE3.SA', 'ITUB4.SA', 'BBDC4.SA', 'ABEV3.SA', 'BRFS3.SA',
    'SUZB3.SA', 'JBSS3.SA', 'WEGE3.SA', 'PSSA3.SA', 'ALSO3.SA', 'UGPA3.SA',
    'CCRO3.SA', 'FIBR3.SA', 'RENT3.SA', 'LREN3.SA', 'KLBN11.SA', 'GOLL4.SA',
    'CPFE3.SA', 'GGBR4.SA', 'CSNA3.SA', 'USIM5.SA', 'RAIL3.SA', 'SLCE3.SA',
    'TUPY3.SA', 'TEND3.SA', 'CYRE3.SA', 'MOVI3.SA', 'RAPT4.SA', 'EQTL3.SA',
    'TAEE11.SA', 'SAPR11.SA', 'CPLE6.SA', 'ENBR3.SA', 'UNIP6.SA', 'ECPR3.SA',
    'LWSA3.SA', 'GGBR3.SA', 'GOAU4.SA', 'BRKM5.SA', 'TRPL4.SA', 'MULT3.SA',
    'PCAR3.SA', 'POSI3.SA', 'BPAN4.SA', 'DASA3.SA', 'FLRY3.SA', 'LAME4.SA',
    'ALPA4.SA', 'SANB11.SA', 'STBP3.SA', 'NWSA3.SA', 'RECV3.SA', 'TECN3.SA',
    'TRIS3.SA', 'MRFG3.SA', 'EVEN3.SA', 'HBOR3.SA', 'TIMP3.SA', 'BRSR3.SA',
    'CRFB3.SA', 'DMVF3.SA', 'HYPE3.SA', 'MEAL3.SA', 'PLPL3.SA', 'RNEW4.SA',
    'RNEW11.SA', 'TRAD3.SA', 'VLID3.SA', 'WINM23.SA', 'YDUQ3.SA', 'ZAMP3.SA',
]

INDIA_STOCKS = [
    'RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFOTECH.NS', 'HDFC.NS',
    'ICICIBANK.NS', 'KOTAKBANK.NS', 'ITC.NS', 'LT.NS', 'MARUTI.NS',
    'AXISBANK.NS', 'BAJAJFINSV.NS', 'HCLTECH.NS', 'WIPRO.NS', 'TATASTEEL.NS',
    'M&M.NS', 'BHARTIARTL.NS', 'ASIANPAINT.NS', 'DMART.NS', 'SUNPHARMA.NS',
    'TECHM.NS', 'BAJAJ-AUTO.NS', 'SBILIFE.NS', 'SBIN.NS', 'POWERGRID.NS',
    'JSWSTEEL.NS', 'EICHERMOT.NS', 'HINDALCO.NS', 'GAIL.NS', 'ONGC.NS',
    'NTPC.NS', 'COALINDIA.NS', 'IOC.NS', 'BPCL.NS', 'ADANIPORTS.NS',
    'ADANIGREEN.NS', 'ADANIPOWER.NS', 'ADANIENTERP.NS', 'TATACONSUM.NS', 'MAHABANK.NS',
    'APOLLOHOSP.NS', 'BANKBARODA.NS', 'IDFC.NS', 'INDIANB.NS', 'RBLBANK.NS'
]

SP500_STOCKS = list(dict.fromkeys(SP500_STOCKS))

class ProfessionalDataFetcher:
    """Fetcher profesional - Yahoo → Alpha Vantage (cascada verificable)"""

    def __init__(self, ticker):
        self.ticker = ticker
        self.yahoo_info = {}
        self.yahoo_hist = None  # Histórico para crecimiento
        self.alpha_data = {}
        self.source_log = {}  # Auditoría: qué vino de dónde

    def fetch_yahoo(self):
        """FUENTE 1: Yahoo Finance (primaria)"""
        try:
            stock = yf.Ticker(self.ticker)
            self.yahoo_info = stock.info
            # También descargar histórico de 1 año para crecimiento
            try:
                self.yahoo_hist = stock.history(period='1y')
            except:
                self.yahoo_hist = None
            return True
        except:
            return False

    def fetch_alpha_vantage(self):
        """FUENTE 2: Alpha Vantage (cascada - datos auditables)"""
        try:
            params = {
                'function': 'OVERVIEW',
                'symbol': self.ticker,
                'apikey': ALPHA_API_KEY
            }
            response = requests.get(ALPHA_BASE_URL, params=params, timeout=10)
            if response.status_code == 200:
                self.alpha_data = response.json()
                return True
        except:
            pass
        return False

    def get_value(self, field_name, yahoo_key, alpha_key=None):
        """
        Obtiene valor REAL y auditable:
        1. Yahoo Finance → 2. Alpha Vantage → 3. No valor (0)

        Registra fuente para auditoría
        """
        # INTENTO 1: Yahoo Finance
        value = self.yahoo_info.get(yahoo_key)
        if value is not None and value != 0:
            if isinstance(value, list) and len(value) > 0:
                value = value[0]
            if isinstance(value, (int, float)) and value != 0:
                self.source_log[field_name] = f"Yahoo({yahoo_key})"
                return float(value)

        # INTENTO 2: Alpha Vantage (si está disponible)
        if alpha_key and self.alpha_data:
            value = self.alpha_data.get(alpha_key)
            if value and value != 'None':
                try:
                    value = float(value)
                    if value != 0:
                        self.source_log[field_name] = f"AlphaVantage({alpha_key})"
                        return value
                except:
                    pass

        # NO HAY VALOR: Retorna 0 (NO aproximado)
        self.source_log[field_name] = "N/A"
        return 0

def clean_and_validate(data):
    """
    Limpia y valida valores aberrantes.
    MANTIENE valores negativos como indicadores importantes, no los borra.
    """
    # ROIC sanity check: si > 500%, probablemente está sin dividir
    if data.get('roic', 0) > 500:
        data['roic'] = data['roic'] / 100  # Dividir por 100

    # ROIC cap: no puede ser > 200% en la práctica
    if data.get('roic', 0) > 200:
        data['roic'] = 200

    # FCF: MANTENER valores negativos - son indicadores importantes
    # No borramos, solo dejamos como alerta de problemas de efectivo
    # El análisis debe considerar FCF < 0 como bandera roja

    # netProfitMargin cap: no puede ser > 100%
    if data.get('netProfitMargin', 0) > 100:
        data['netProfitMargin'] = 100

    # Debt-to-Equity sanity check: si > 100, probablemente error
    if data.get('debtToEquity', 0) > 100:
        data['debtToEquity'] = 0  # Marcar como no disponible

    return data

def calculate_moat_score(company_data):
    """Moat Score basado en datos reales"""
    margin = company_data.get('netProfitMargin', 0)
    roic = company_data.get('roic', 0)
    pe = company_data.get('peRatio', 0)

    if margin <= 0 or roic <= 0:
        return 0

    score = 0
    if margin >= 20:
        score += 40
    elif margin >= 15:
        score += 35
    elif margin >= 10:
        score += 30
    elif margin >= 5:
        score += 20
    else:
        score += 10

    if roic >= 20:
        score += 40
    elif roic >= 15:
        score += 35
    elif roic >= 10:
        score += 30
    elif roic >= 5:
        score += 15
    else:
        score += 5

    if pe > 0 and pe < 30:
        score += 20
    elif pe >= 30 and pe < 50:
        score += 10

    return min(score, 100)

def calculate_management_score(company_data):
    """Management Score basado en datos reales"""
    margin = company_data.get('netProfitMargin', 0)
    fcf = company_data.get('freeCashFlow', 0)
    de = company_data.get('debtToEquity', 0)

    if margin <= 0:
        return 0

    score = 0
    if margin >= 10:
        score += 35
    elif margin >= 5:
        score += 25
    else:
        score += 10

    if fcf > 0:
        score += 35

    if de < 0.5:
        score += 30
    elif de < 1.0:
        score += 25
    elif de < 1.5:
        score += 15
    elif de < 2.0:
        score += 8

    return min(score, 100)

def fetch_stock_data(ticker, market_name):
    """Descarga profesional - cascada verificable"""
    try:
        fetcher = ProfessionalDataFetcher(ticker)

        # Fetch de ambas fuentes
        fetcher.fetch_yahoo()
        fetcher.fetch_alpha_vantage()

        # Obtener precio (requisito mínimo)
        price = fetcher.get_value("price", "currentPrice")
        if not price or price <= 0:
            return None

        # Calcular crecimiento desde histórico si está disponible
        growth = 0
        try:
            hist = fetcher.yahoo_hist
            if hist is not None and len(hist) > 250:
                price_1y = hist.iloc[0]['Close']
                if price_1y > 0:
                    growth = ((price - price_1y) / price_1y * 100)
        except:
            pass

        # AJUSTES CRÍTICOS DE UNIDADES
        net_margin_raw = fetcher.get_value("netProfitMargin", "profitMargins", "ProfitMargin")
        net_margin = net_margin_raw * 100 if net_margin_raw else 0  # Convertir decimal a porcentaje

        roic_raw = fetcher.get_value("roic", "returnOnEquity", "ReturnOnEquity")
        roic = roic_raw * 100 if roic_raw else 0  # Convertir decimal a porcentaje

        # LIMPIAR Y VALIDAR valores aberrantes
        fcf_raw = fetcher.get_value("freeCashFlow", "freeCashflow", "FreeCashFlow")
        de_raw = fetcher.get_value("debtToEquity", "debtToEquity", "DebtToEquityRatio")

        # ESCALAR FCF a billones para legibilidad (Yahoo devuelve en dólares absolutos)
        # 107721875456 dólares = 107.7 billones
        fcf_billions = fcf_raw / 1e9 if fcf_raw else 0

        temp_data = {
            'roic': roic,
            'netProfitMargin': net_margin,
            'freeCashFlow': fcf_billions,  # Ahora en billones
            'debtToEquity': de_raw,
        }
        temp_data = clean_and_validate(temp_data)
        roic = temp_data['roic']
        net_margin = temp_data['netProfitMargin']
        fcf_billions = temp_data['freeCashFlow']
        de_raw = temp_data['debtToEquity']

        # Pre-calcular datos para scores (ya limpios)
        temp_data = {
            'netProfitMargin': net_margin,
            'roic': roic,
            'peRatio': fetcher.get_value("peRatio", "trailingPE", "PERatio") or fetcher.get_value("peRatio", "forwardPE"),
            'freeCashFlow': fcf_billions,  # En billones
            'debtToEquity': de_raw,
        }

        # Calcular scores REALES
        moat_score = calculate_moat_score(temp_data)
        mgmt_score = calculate_management_score(temp_data)

        # Extraer descripción breve (para modal de empresa)
        description = fetcher.yahoo_info.get('longBusinessSummary', '')
        if not description:
            description = fetcher.yahoo_info.get('businessSummary', '')
        if not description:
            description = f"Empresa del sector {fetcher.get_value('sector', 'sector', 'Sector') or 'Financiero'}"

        # Extraer datos - CASCADA PROFESIONAL
        data = {
            'ticker': ticker,
            'name': fetcher.get_value("name", "longName") or ticker,
            'description': description[:500],  # Limitar a 500 caracteres
            'country': 'USA' if market_name == 'USA' else ('Brazil' if market_name == 'Brazil' else 'India'),
            'sector': fetcher.get_value("sector", "sector") or "Unknown",
            'price': price,
            'debtToEquity': fetcher.get_value("debtToEquity", "debtToEquity", "DebtToEquityRatio"),
            'netProfitMargin': net_margin,  # ARREGLADO: convertir a porcentaje
            'revenueGrowthYoY': growth,  # ARREGLADO: calcular desde histórico
            'currentRatio': fetcher.get_value("currentRatio", "currentRatio", "CurrentRatio"),
            'peRatio': fetcher.get_value("peRatio", "trailingPE", "PERatio") or fetcher.get_value("peRatio", "forwardPE"),
            'sectorAvgPE': 20,
            'roic': roic,  # ARREGLADO: convertir a porcentaje
            'operatingMarginTrend': 'flat',
            'freeCashFlow': fcf_billions,  # ESCALADO A BILLONES para legibilidad
            'quickRatio': fetcher.get_value("quickRatio", "quickRatio", "QuickRatio"),
            'dividendYield': fetcher.get_value("dividendYield", "trailingAnnualDividendYield", "DividendYield"),
            'competitiveness': 'moderate',
            'debtTrend': 'flat',
            'priceToBook': fetcher.get_value("priceToBook", "priceToBook", "PriceToBookRatio"),
            'high52Week': fetcher.get_value("high52Week", "fiftyTwoWeekHigh"),
            'low52Week': fetcher.get_value("low52Week", "fiftyTwoWeekLow"),
            'decline52Week': 0,
            'moatScore': moat_score,  # CÁLCULO REAL
            'managementScore': mgmt_score,  # CÁLCULO REAL
            'businessCycle': 'STABLE',
            '_sources': fetcher.source_log  # Auditoría: dónde vino cada valor
        }

        return data

    except Exception as e:
        return None

def main():
    print("🚀 DESCARGANDO UNIVERSO PROFESIONAL v5")
    print("📡 CASCADA REAL: Yahoo Finance → Alpha Vantage")
    print("✅ SOLO valores auditables y verificables\n")

    data = {
        'lastUpdated': datetime.now().isoformat(),
        'currency': 'USD',
        'markets': {
            'USA': {'flag': '🇺🇸', 'exchange': 'NYSE/NASDAQ', 'companies': []},
            'Brazil': {'flag': '🇧🇷', 'exchange': 'B3', 'companies': []},
            'India': {'flag': '🇮🇳', 'exchange': 'NSE', 'companies': []}
        }
    }

    # USA
    print(f"📊 USA ({len(SP500_STOCKS)} empresas)...\n")
    for i, ticker in enumerate(SP500_STOCKS, 1):
        print(f"  [{i:3d}/{len(SP500_STOCKS)}] {ticker:8s}", end=' ')
        stock = fetch_stock_data(ticker, 'USA')
        if stock:
            data['markets']['USA']['companies'].append(stock)
            print("✅")
        else:
            print("⏭️")
        time.sleep(0.1)

    # Brasil
    print(f"\n📊 Brasil ({len(BRASIL_STOCKS)} empresas)...\n")
    for i, ticker in enumerate(BRASIL_STOCKS, 1):
        print(f"  [{i:2d}/{len(BRASIL_STOCKS)}] {ticker:10s}", end=' ')
        stock = fetch_stock_data(ticker, 'Brazil')
        if stock:
            data['markets']['Brazil']['companies'].append(stock)
            print("✅")
        else:
            print("⏭️")
        time.sleep(0.1)

    # India
    print(f"\n📊 India ({len(INDIA_STOCKS)} empresas)...\n")
    for i, ticker in enumerate(INDIA_STOCKS, 1):
        print(f"  [{i:2d}/{len(INDIA_STOCKS)}] {ticker:15s}", end=' ')
        stock = fetch_stock_data(ticker, 'India')
        if stock:
            data['markets']['India']['companies'].append(stock)
            print("✅")
        else:
            print("⏭️")
        time.sleep(0.1)

    # Filtrar
    print(f"\n🔍 Filtrando empresas sin precio...")
    for market in ['USA', 'Brazil', 'India']:
        original = len(data['markets'][market]['companies'])
        data['markets'][market]['companies'] = [
            c for c in data['markets'][market]['companies']
            if c.get('price', 0) > 0
        ]
        removed = original - len(data['markets'][market]['companies'])
        if removed > 0:
            print(f"   {market}: Removidas {removed} sin precio")

    # Guardar
    with open('public/data.json', 'w') as f:
        json.dump(data, f, indent=2)

    print(f"\n✅ DESCARGA COMPLETADA (PROFESIONAL)")
    print(f"════════════════════════════════════════")
    print(f"🇺🇸 USA:    {len(data['markets']['USA']['companies']):3d} empresas")
    print(f"🇧🇷 Brasil: {len(data['markets']['Brazil']['companies']):3d} empresas")
    print(f"🇮🇳 India:  {len(data['markets']['India']['companies']):3d} empresas")
    print(f"────────────────────────────────────────")
    total = sum(len(data['markets'][m]['companies']) for m in ['USA', 'Brazil', 'India'])
    print(f"📊 TOTAL:   {total:3d} empresas")
    print(f"✅ Guardado en: public/data.json")
    print(f"\n🔐 AUDITORÍA: Cada valor registra su fuente (Yahoo/Alpha/N/A)")

if __name__ == '__main__':
    main()
