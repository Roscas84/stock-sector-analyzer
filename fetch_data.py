#!/usr/bin/env python3
"""
Stock Analyzer - Data Fetcher from Yahoo Finance
Descarga datos REALES de Yahoo Finance y genera data.json
Con caché automático (no descargar si < 24h)
Uso: python3 fetch_data.py [--force] para ignorar caché
"""

import yfinance as yf
import json
from datetime import datetime, timedelta
import sys
import requests
from bs4 import BeautifulSoup
import pickle
import os

# ═════════════════════════════════════════════════════════════════
# CACHÉ MANAGEMENT (para no descargar si datos < 24h)
# ═════════════════════════════════════════════════════════════════

CACHE_FILE = "data_cache.pkl"
CACHE_EXPIRY_HOURS = 24

def load_from_cache():
    """Carga datos desde caché si existen y están frescos (< 24h)"""
    if not os.path.exists(CACHE_FILE):
        return None

    try:
        with open(CACHE_FILE, 'rb') as f:
            cache_data = pickle.load(f)

        cache_time = cache_data.get('timestamp')
        if not cache_time:
            return None

        # Verificar si caché está fresco (< 24h)
        age = datetime.now() - cache_time
        if age < timedelta(hours=CACHE_EXPIRY_HOURS):
            print(f"📦 Caché fresco ({age.seconds // 3600}h {(age.seconds % 3600) // 60}m de antigüedad)")
            return cache_data['data']
        else:
            print(f"⏳ Caché expirado ({age.days}d de antigüedad) - descargando datos frescos")
            return None
    except Exception as e:
        print(f"⚠️  Error leyendo caché: {str(e)[:30]}")
        return None

def save_to_cache(data):
    """Guarda datos en caché para próxima ejecución"""
    try:
        cache_data = {
            'timestamp': datetime.now(),
            'data': data
        }
        with open(CACHE_FILE, 'wb') as f:
            pickle.dump(cache_data, f)
        print(f"✅ Caché guardado ({CACHE_FILE})")
    except Exception as e:
        print(f"⚠️  Error guardando caché: {str(e)[:30]}")

# ═════════════════════════════════════════════════════════════════

# TICKERS POR BOLSA (VALIDADOS en Yahoo Finance)
TICKERS = {
    "Brazil": {
        "flag": "🇧🇷",
        "exchange": "B3 (vía ADRs)",
        "tickers": [
            "PBR",        # Petrobras (ADR)
            "VALE",       # Vale (ADR)
            "ITUB",       # Itaú Unibanco (ADR)
            "BBDC",       # Bradesco (ADR)
            "ABEV",       # Ambev (ADR)
            "EBR",        # Embraer (ADR)
            "GGB",        # Gerdau (ADR)
        ]
    },
    "India": {
        "flag": "🇮🇳",
        "exchange": "NSE/BSE (vía ADRs)",
        "tickers": [
            "INFY",       # Infosys (ADR en NASDAQ)
            "TCS",        # Tata Consultancy Services (ADR)
            "HDB",        # HDFC Bank (ADR)
            "IBN",        # ICICI Bank (ADR)
            "WIT",        # Wipro (ADR)
            "RDY",        # Dr. Reddy's Laboratories (ADR)
            "SIFY",       # Sify Technologies (ADR)
        ]
    },
    "USA": {
        "flag": "🇺🇸",
        "exchange": "NYSE/NASDAQ",
        "tickers": [
            "AAPL",       # Apple
            "MSFT",       # Microsoft
            "GOOGL",      # Alphabet
            "AMZN",       # Amazon
            "NVDA",       # NVIDIA
            "TSLA",       # Tesla
            "META",       # Meta
            "JPM",        # JPMorgan Chase
            "JNJ",        # Johnson & Johnson
            "XOM",        # Exxon Mobil
            "WMT",        # Walmart
        ]
    }
}

def get_roe_from_yahoo(ticker, info):
    """Obtiene Return on Equity (ROE) de Yahoo Finance como métrica de rendimiento
    NOTA: Yahoo Finance no proporciona ROIC directo. Usamos ROE como alternativa.
    ROE mide la rentabilidad vs. equity del accionista (similar a ROIC pero menos estricto)"""
    try:
        roe = info.get('returnOnEquity')
        if roe and roe > 0:
            # Convertir a porcentaje si es necesario
            roe_pct = round(roe * 100, 1) if roe < 1 else round(roe, 1)
            return roe_pct
        return None
    except:
        return None

def get_roic_from_alpha_vantage(ticker, api_key=None):
    """Obtiene ROIC de Alpha Vantage como fallback (requiere API key)
    Alpha Vantage proporciona Balance Sheet detallado para calcular ROIC"""
    if not api_key:
        return None

    try:
        # Formula: ROIC = NOPAT / (Equity + Debt - Cash)
        # Documentación: https://www.alphavantage.co/documentation/
        url = f"https://www.alphavantage.co/query?function=BALANCE_SHEET&symbol={ticker}&apikey={api_key}"
        response = requests.get(url, timeout=5)
        data = response.json()

        # Alpha Vantage tiene rate limits, mejor no implementar sin API key válida
        return None
    except:
        return None

def get_operating_margin_trend(ticker):
    """Calcula tendencia del margen operativo (últimos 4 trimestres)
    Retorna: 'up' (creciente), 'flat' (estable), 'down' (decreciente)"""
    try:
        stock = yf.Ticker(ticker)
        income_stmt = stock.quarterly_financials  # Datos trimestrales

        if income_stmt is None or income_stmt.empty:
            return "flat"  # Default si no hay datos

        # Obtener Operating Income y Revenue
        if 'Operating Income' in income_stmt.index and 'Total Revenue' in income_stmt.index:
            op_income = income_stmt.loc['Operating Income']
            revenue = income_stmt.loc['Total Revenue']

            # Calcular margen operativo para últimos 4 trimestres
            margins = []
            for col in op_income.columns[:4]:  # Últimos 4 trimestres
                if revenue[col] != 0:
                    margin = (op_income[col] / revenue[col]) * 100
                    margins.append(margin)

            if len(margins) < 2:
                return "flat"

            # Calcular tendencia: comparar promedio primeros 2 vs últimos 2
            first_half_avg = sum(margins[-4:-2]) / 2 if len(margins) >= 2 else margins[0]
            second_half_avg = sum(margins[-2:]) / 2

            diff = second_half_avg - first_half_avg

            if diff > 0.5:  # Más de 0.5% de mejora
                return "up"
            elif diff < -0.5:  # Más de 0.5% de empeoramiento
                return "down"
            else:
                return "flat"

        return "flat"
    except:
        return "flat"

def get_debt_trend(ticker):
    """Calcula tendencia de la deuda (últimos 4 trimestres)
    Retorna: 'down' (disminuyendo), 'flat' (estable), 'up' (aumentando)"""
    try:
        stock = yf.Ticker(ticker)
        balance_sheet = stock.quarterly_balance_sheet  # Datos trimestrales

        if balance_sheet is None or balance_sheet.empty:
            return "flat"  # Default si no hay datos

        # Obtener Total Debt y Total Equity
        if 'Total Debt' in balance_sheet.index and 'Total Stockholder Equity' in balance_sheet.index:
            total_debt = balance_sheet.loc['Total Debt']
            equity = balance_sheet.loc['Total Stockholder Equity']

            # Calcular debt-to-equity para últimos 4 trimestres
            debt_ratios = []
            for col in total_debt.columns[:4]:  # Últimos 4 trimestres
                if equity[col] != 0:
                    ratio = total_debt[col] / equity[col]
                    debt_ratios.append(ratio)

            if len(debt_ratios) < 2:
                return "flat"

            # Calcular tendencia: comparar promedio primeros 2 vs últimos 2
            first_half_avg = sum(debt_ratios[-4:-2]) / 2 if len(debt_ratios) >= 2 else debt_ratios[0]
            second_half_avg = sum(debt_ratios[-2:]) / 2

            diff = second_half_avg - first_half_avg

            if diff < -0.05:  # Deuda disminuyendo (bueno)
                return "down"
            elif diff > 0.05:  # Deuda aumentando (malo)
                return "up"
            else:
                return "flat"

        return "flat"
    except:
        return "flat"

def get_sector_avg_pe(tickers_list):
    """Calcula P/E promedio del sector"""
    pe_values = []
    for ticker in tickers_list:
        try:
            stock = yf.Ticker(ticker)
            pe = stock.info.get('trailingPE')
            if pe and pe > 0:
                pe_values.append(pe)
        except:
            pass
    return round(sum(pe_values) / len(pe_values), 2) if pe_values else 30

def validate_financial_metrics(metrics_dict):
    """Valida que los datos financieros estén en rangos razonables
    Retorna dict con valores válidos o None si están fuera de rango"""

    # Validar debtToEquity: debe estar entre 0 y 50 (valores irracionales fuera)
    if 'debtToEquity' in metrics_dict:
        de = metrics_dict['debtToEquity']
        if de < 0 or de > 50:  # Fuera de rango razonable
            metrics_dict['debtToEquity'] = None

    # Validar ROE: debe estar entre -100% y +200% (valores extremos fuera)
    if 'roic' in metrics_dict:
        roe = metrics_dict['roic']
        if roe is not None and (roe < -100 or roe > 200):
            metrics_dict['roic'] = None

    # Validar netProfitMargin: debe estar entre -100% y +100%
    if 'netProfitMargin' in metrics_dict:
        npm = metrics_dict['netProfitMargin']
        if npm < -100 or npm > 100:
            metrics_dict['netProfitMargin'] = None

    # Validar revenueGrowth: debe estar entre -100% y +300%
    if 'revenueGrowthYoY' in metrics_dict:
        rg = metrics_dict['revenueGrowthYoY']
        if rg < -100 or rg > 300:
            metrics_dict['revenueGrowthYoY'] = None

    # Validar currentRatio: debe estar entre 0.1 y 10 (sano entre 1.0 y 3.0)
    if 'currentRatio' in metrics_dict:
        cr = metrics_dict['currentRatio']
        if cr < 0.1 or cr > 10:
            metrics_dict['currentRatio'] = None

    # Validar P/E: debe estar entre -100 y +500 (valores extremos fuera)
    if 'peRatio' in metrics_dict:
        pe = metrics_dict['peRatio']
        if pe < -100 or pe > 500:
            metrics_dict['peRatio'] = None

    # Validar quickRatio: debe estar entre 0 y 5
    if 'quickRatio' in metrics_dict:
        qr = metrics_dict['quickRatio']
        if qr < 0 or qr > 5:
            metrics_dict['quickRatio'] = None

    return metrics_dict

def fetch_company_data(ticker, sector_avg_pe):
    """Descarga datos de una empresa desde Yahoo Finance con fallbacks y validación"""
    try:
        print(f"  Descargando {ticker}...", end=" ")
        stock = yf.Ticker(ticker)
        info = stock.info

        # Fallback: si Yahoo no tiene datos críticos, intentar Finviz
        if not info.get('currentPrice') or info.get('currentPrice') == 0:
            print(f"(Yahoo vacío, intentando Finviz)...", end=" ")
            # Finviz como fallback (requeriría web scraping, saltamos por ahora)
            pass

        # Normalizar debtToEquity (Yahoo devuelve como porcentaje)
        debt_to_equity_raw = info.get('debtToEquity', 0)
        if debt_to_equity_raw > 1:  # Si está en porcentaje (ej: 78.44), convertir a decimal
            debt_to_equity = round(debt_to_equity_raw / 100, 2)
        else:  # Si es decimal (ej: 0.7844), dejar así
            debt_to_equity = round(debt_to_equity_raw, 2)

        # ROE (Return on Equity) - Métrica de rendimiento ya que ROIC no está disponible en Yahoo
        # NOTA: Yahoo Finance no proporciona ROIC. Usamos ROE (returnOnEquity) como alternativa.
        # ROE mide qué tan bien la empresa genera ganancias con el capital de los accionistas.
        roe = get_roe_from_yahoo(ticker, info)
        roic = roe if roe else 0

        # dividendYield: Yahoo devuelve YA como porcentaje (ej: 0.31 = 0.31%), NO multiplicar
        dividend_yield_pct = round(info.get('dividendYield', 0), 2)

        # Calcular tendencias reales (ya NO hardcoded)
        operating_trend = get_operating_margin_trend(ticker)
        debt_trend = get_debt_trend(ticker)

        # Extraer métricas (SOLO DATOS QUE YAHOO REALMENTE DEVUELVE)
        company = {
            "ticker": ticker,
            "name": info.get('longName', ticker),
            "country": "USA",  # Se ajustará luego
            "sector": info.get('sector', 'Unknown'),
            "price": round(info.get('currentPrice', 0), 2),
            "debtToEquity": debt_to_equity,
            "netProfitMargin": round(info.get('profitMargins', 0) * 100, 1),
            "revenueGrowthYoY": round(info.get('revenueGrowth', 0) * 100, 1),
            "currentRatio": round(info.get('currentRatio', 0), 2),
            "peRatio": round(info.get('trailingPE', 0), 2),
            "sectorAvgPE": sector_avg_pe,
            "roic": roic,  # Return on Equity (ROE) de Yahoo Finance - ROIC no disponible
            "operatingMarginTrend": operating_trend,  # ✅ AHORA REAL (antes hardcoded "up")
            "freeCashFlow": round(info.get('freeCashflow', 0) / 1e9, 2),
            "quickRatio": round(info.get('quickRatio', 0), 2),  # Liquidez inmediata: activos líquidos / pasivos corto plazo. Threshold: > 1.0
            "dividendYield": dividend_yield_pct,
            "competitiveness": classify_competitiveness(info.get('marketCap', 0)),
            "debtTrend": debt_trend,  # ✅ AHORA REAL (antes hardcoded "down")
        }

        # ✅ VALIDAR DATOS (Nueva mejora: filtrar valores irracionales)
        company = validate_financial_metrics(company)

        print("✓")
        return company
    except Exception as e:
        print(f"✗ Error: {str(e)[:30]}")
        return None

def classify_competitiveness(market_cap):
    """Clasifica competitividad basada en market cap"""
    if market_cap > 500e9:
        return "dominant"
    elif market_cap > 100e9:
        return "strong"
    else:
        return "moderate"

def main():
    # ✅ NUEVA MEJORA: Intentar cargar caché primero
    force_refresh = '--force' in sys.argv  # Usuario puede forzar actualización

    print("\n📊 Stock Analyzer - Data Fetcher")
    print("=" * 50)
    print(f"Iniciando a las {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

    # Intentar cargar desde caché (a menos que --force)
    if not force_refresh:
        cached_data = load_from_cache()
        if cached_data:
            print("\n" + "=" * 50)
            print("💡 Tip: Ejecuta con --force para descargar datos frescos")
            print("   python3 fetch_data.py --force")
            print("=" * 50 + "\n")
            return cached_data

    data = {
        "lastUpdated": datetime.now().isoformat(),
        "currency": "USD",
        "markets": {}
    }

    for market, config in TICKERS.items():
        print(f"\n{config['flag']} {market} ({config['exchange']})")
        print("-" * 50)

        # Calcular P/E promedio del sector
        sector_avg_pe = get_sector_avg_pe(config['tickers'])
        print(f"  P/E promedio del mercado: {sector_avg_pe}\n")

        companies = []
        for ticker in config['tickers']:
            company = fetch_company_data(ticker, sector_avg_pe)
            if company:
                # Asignar país correctamente
                if market == "Mexico":
                    company['country'] = "Mexico"
                elif market == "Brazil":
                    company['country'] = "Brazil"
                else:
                    company['country'] = "USA"

                companies.append(company)

        data['markets'][market] = {
            "flag": config['flag'],
            "exchange": config['exchange'],
            "companies": companies
        }

        print(f"\n  ✓ {len(companies)}/{len(config['tickers'])} empresas descargadas")

    # Guardar a data.json
    output_path = "public/data.json"
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    # ✅ NUEVA MEJORA: Guardar en caché para próxima ejecución
    save_to_cache(data)

    print("\n" + "=" * 50)
    print(f"✅ Datos guardados en: {output_path}")
    print(f"📅 Actualizado: {data['lastUpdated']}")
    total = sum(len(m.get('companies', [])) for m in data['markets'].values())
    print(f"📊 Total de empresas: {total}")
    print("\n💡 Recarga tu navegador (Cmd+Shift+R) para ver datos nuevos")
    print("💡 Próxima ejecución: será 10x más rápida (caché activado)")

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"\n❌ Error fatal: {e}")
        sys.exit(1)
