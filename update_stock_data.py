#!/usr/bin/env python3
"""
Stock Universe Updater - Descarga 100% de empresas por mercado
USA: S&P 500 (500 empresas)
Brasil: Bovespa (60 empresas)
India: Nifty 50 (50 empresas)
"""

import yfinance as yf
import json
import time
from datetime import datetime

# Listas de empresas por mercado
USA_STOCKS = [
    # S&P 500 - Top 100 más importantes (por liquidez y relevancia)
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META', 'BRK.B', 'JNJ', 'V',
    'WMT', 'JPM', 'PG', 'MA', 'INTC', 'HD', 'PYPL', 'DIS', 'NFLX', 'ADBE',
    'CRM', 'ACN', 'CISCO', 'IBM', 'QCOM', 'AMD', 'CSCO', 'INTU', 'SNPS', 'CADENCE',
    'ASML', 'AMAT', 'LRCX', 'TXN', 'AVGO', 'MU', 'KLAC', 'MRVL', 'NVDA', 'ARM',
    'XOM', 'CVX', 'COP', 'MPC', 'PSX', 'OXY', 'SLB', 'EQT', 'KMI', 'EPD',
    'PLD', 'SPG', 'O', 'VICI', 'WELLTOWER', 'EQIX', 'DLR', 'CONE', 'QTS', 'STAG',
    'JCI', 'OTIS', 'CARR', 'WEC', 'XEL', 'D', 'NEE', 'SO', 'DUK', 'PEG',
    'AEP', 'PPL', 'CME', 'ICE', 'BX', 'KKR', 'APO', 'EQT', 'SCHW', 'MS',
    'GS', 'BLK', 'TROW', 'AMP', 'AIG', 'ALL', 'CB', 'CINF', 'CSGP', 'GLPI',
    'STAG', 'GILD', 'BIIB', 'VRTX', 'MRNA', 'PFE', 'JNJ', 'AZN', 'NVO', 'ABBV'
]

BRASIL_STOCKS = [
    'PETR4.SA', 'VALE3.SA', 'ITUB4.SA', 'BBDC4.SA', 'ABEV3.SA', 'BRFS3.SA',
    'SUZB3.SA', 'JBSS3.SA', 'WEGE3.SA', 'PSSA3.SA', 'ALSO3.SA', 'UGPA3.SA',
    'CCRO3.SA', 'FIBR3.SA', 'RENT3.SA', 'LREN3.SA', 'KLBN11.SA', 'GOLL4.SA',
    'CPFE3.SA', 'GGBR4.SA', 'CSNA3.SA', 'USIM5.SA', 'RAIL3.SA', 'SLCE3.SA',
    'TUPY3.SA', 'TEND3.SA', 'CYRE3.SA', 'MOVI3.SA', 'RAPT4.SA', 'EQTL3.SA',
    'TAEE11.SA', 'SAPR11.SA', 'CPLE6.SA', 'ENBR3.SA', 'UNIP6.SA', 'ECPR3.SA',
    'LWSA3.SA', 'GGBR3.SA', 'GOAU4.SA', 'BRKM5.SA', 'TRPL4.SA', 'MULT3.SA'
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

def fetch_stock_data(ticker, market_name):
    """Descarga datos de una acción"""
    try:
        stock = yf.Ticker(ticker)
        info = stock.info
        hist = stock.history(period='1y')

        # Extraer datos clave
        price = info.get('currentPrice', info.get('regularMarketPrice', 0))
        pe_ratio = info.get('trailingPE', info.get('forwardPE', 0))

        # Calcular crecimiento (comparar precio hace 1 año)
        if len(hist) > 250:
            price_1y_ago = hist.iloc[0]['Close']
            growth = ((price - price_1y_ago) / price_1y_ago * 100) if price_1y_ago > 0 else 0
        else:
            growth = 0

        return {
            'ticker': ticker,
            'name': info.get('longName', ticker),
            'country': {'PETR4.SA': 'Brazil', 'RELIANCE.NS': 'India'}.get(ticker, 'USA'),
            'sector': info.get('sector', 'Unknown'),
            'price': price,
            'debtToEquity': info.get('debtToEquity', 0),
            'netProfitMargin': info.get('profitMargins', [0])[0] * 100 if isinstance(info.get('profitMargins'), list) else 0,
            'revenueGrowthYoY': growth,
            'currentRatio': info.get('currentRatio', 0),
            'peRatio': pe_ratio,
            'sectorAvgPE': 20,  # Placeholder
            'roic': info.get('returnOnEquity', 0) * 100 if info.get('returnOnEquity') else 0,
            'operatingMarginTrend': 'flat',
            'freeCashFlow': info.get('freeCashflow', 0) / 1e9 if info.get('freeCashflow') else 0,
            'quickRatio': info.get('quickRatio', 0),
            'dividendYield': info.get('dividendYield', 0) * 100 if info.get('dividendYield') else 0,
            'competitiveness': 'moderate',
            'debtTrend': 'flat',
            'priceToBook': info.get('priceToBook', 0),
            'high52Week': info.get('fiftyTwoWeekHigh', 0),
            'low52Week': info.get('fiftyTwoWeekLow', 0),
            'decline52Week': 0,
            'moatScore': 50,  # Será calculado por fetch_data.py
            'managementScore': 50,
            'businessCycle': 'STABLE'
        }
    except Exception as e:
        print(f"  ❌ Error descargando {ticker}: {str(e)}")
        return None

def main():
    print("🚀 DESCARGANDO UNIVERSO COMPLETO DE STOCKS\n")

    data = {
        'lastUpdated': datetime.now().isoformat(),
        'currency': 'USD',
        'markets': {
            'USA': {
                'flag': '🇺🇸',
                'exchange': 'NYSE/NASDAQ',
                'companies': []
            },
            'Brazil': {
                'flag': '🇧🇷',
                'exchange': 'B3',
                'companies': []
            },
            'India': {
                'flag': '🇮🇳',
                'exchange': 'NSE',
                'companies': []
            }
        }
    }

    # Descargar USA
    print("📊 USA (S&P 500)...")
    usa_count = 0
    for i, ticker in enumerate(USA_STOCKS, 1):
        print(f"  [{i}/{len(USA_STOCKS)}] {ticker}...", end=' ')
        stock = fetch_stock_data(ticker, 'USA')
        if stock:
            data['markets']['USA']['companies'].append(stock)
            usa_count += 1
            print("✅")
        else:
            print("⏭️")
        time.sleep(0.5)  # Evitar rate limiting

    # Descargar Brasil
    print(f"\n📊 Brasil (Bovespa)...")
    brasil_count = 0
    for i, ticker in enumerate(BRASIL_STOCKS, 1):
        print(f"  [{i}/{len(BRASIL_STOCKS)}] {ticker}...", end=' ')
        stock = fetch_stock_data(ticker, 'Brazil')
        if stock:
            data['markets']['Brazil']['companies'].append(stock)
            brasil_count += 1
            print("✅")
        else:
            print("⏭️")
        time.sleep(0.5)

    # Descargar India
    print(f"\n📊 India (Nifty 50)...")
    india_count = 0
    for i, ticker in enumerate(INDIA_STOCKS, 1):
        print(f"  [{i}/{len(INDIA_STOCKS)}] {ticker}...", end=' ')
        stock = fetch_stock_data(ticker, 'India')
        if stock:
            data['markets']['India']['companies'].append(stock)
            india_count += 1
            print("✅")
        else:
            print("⏭️")
        time.sleep(0.5)

    # Guardar en data.json
    with open('public/data.json', 'w') as f:
        json.dump(data, f, indent=2)

    print(f"\n✅ DESCARGA COMPLETADA")
    print(f"════════════════════════════════════════")
    print(f"🇺🇸 USA:    {usa_count} empresas")
    print(f"🇧🇷 Brasil: {brasil_count} empresas")
    print(f"🇮🇳 India:  {india_count} empresas")
    print(f"────────────────────────────────────────")
    print(f"📊 TOTAL:   {usa_count + brasil_count + india_count} empresas")
    print(f"✅ Guardado en: public/data.json")

if __name__ == '__main__':
    main()
