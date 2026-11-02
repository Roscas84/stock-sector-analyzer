#!/usr/bin/env python3
"""
Validador de Integridad de Datos - Stock Analyzer v2
Verifica completitud y calidad de data.json después de descarga
"""

import json
import sys
from collections import defaultdict

def analyze_data_quality():
    """Analiza integridad de data.json"""

    try:
        with open('public/data.json', 'r') as f:
            data = json.load(f)
    except FileNotFoundError:
        print("❌ data.json no encontrado. Ejecuta update_stock_data_v2.py primero")
        return

    print("🔍 ANÁLISIS DE INTEGRIDAD DE DATOS\n")
    print("=" * 70)

    # Campos críticos que DEBEN tener valor > 0
    CRITICAL_FIELDS = ['ticker', 'price', 'peRatio']

    # Campos deseables
    OPTIONAL_FIELDS = ['netProfitMargin', 'roic', 'freeCashFlow', 'dividendYield']

    total_companies = 0
    results_by_market = {}

    for market_name in ['USA', 'Brazil', 'India']:
        companies = data['markets'][market_name]['companies']
        total_companies += len(companies)

        market_stats = {
            'total': len(companies),
            'with_critical_data': 0,
            'with_fcf': 0,
            'with_margin': 0,
            'with_roic': 0,
            'with_dividend': 0,
            'with_pe': 0,
            'anomalies': []
        }

        for company in companies:
            # Verificar datos críticos
            if company.get('ticker') and company.get('price', 0) > 0:
                market_stats['with_critical_data'] += 1

            # Verificar datos opcionales
            if company.get('freeCashFlow', 0) > 0:
                market_stats['with_fcf'] += 1

            if company.get('netProfitMargin', 0) > 0:
                market_stats['with_margin'] += 1

            if company.get('roic', 0) > 0:
                market_stats['with_roic'] += 1

            if company.get('dividendYield', 0) > 0:
                market_stats['with_dividend'] += 1

            if company.get('peRatio', 0) > 0:
                market_stats['with_pe'] += 1

            # Detectar anomalías
            pe = company.get('peRatio', 0)
            div = company.get('dividendYield', 0)
            fcf = company.get('freeCashFlow', 0)

            if pe > 500:
                market_stats['anomalies'].append(
                    f"  ⚠️  {company['ticker']}: P/E extremo = {pe}"
                )
            if div > 50:
                market_stats['anomalies'].append(
                    f"  ⚠️  {company['ticker']}: Dividend Yield extremo = {div}%"
                )
            if fcf < -100:
                market_stats['anomalies'].append(
                    f"  ⚠️  {company['ticker']}: FCF negativo extremo = ${fcf}B"
                )

        results_by_market[market_name] = market_stats

        # Mostrar resultados
        flag = data['markets'][market_name]['flag']
        print(f"\n{flag} {market_name.upper()}")
        print("-" * 70)
        print(f"  Total empresas:          {market_stats['total']}")
        print(f"  Con datos críticos:      {market_stats['with_critical_data']:3d} ({100*market_stats['with_critical_data']/market_stats['total']:.1f}%)")
        print(f"  Con Free Cash Flow:      {market_stats['with_fcf']:3d} ({100*market_stats['with_fcf']/market_stats['total']:.1f}%)")
        print(f"  Con Net Profit Margin:   {market_stats['with_margin']:3d} ({100*market_stats['with_margin']/market_stats['total']:.1f}%)")
        print(f"  Con ROI/ROIC:            {market_stats['with_roic']:3d} ({100*market_stats['with_roic']/market_stats['total']:.1f}%)")
        print(f"  Con Dividend Yield:      {market_stats['with_dividend']:3d} ({100*market_stats['with_dividend']/market_stats['total']:.1f}%)")
        print(f"  Con P/E Ratio:           {market_stats['with_pe']:3d} ({100*market_stats['with_pe']/market_stats['total']:.1f}%)")

        if market_stats['anomalies']:
            print(f"\n  🚨 ANOMALÍAS DETECTADAS ({len(market_stats['anomalies'])}):")
            for anomaly in market_stats['anomalies'][:5]:  # Mostrar máximo 5
                print(anomaly)
            if len(market_stats['anomalies']) > 5:
                print(f"  ... y {len(market_stats['anomalies'])-5} más")

    # Resumen global
    print("\n" + "=" * 70)
    print(f"\n📊 RESUMEN GLOBAL")
    print(f"  Total empresas: {total_companies}")

    avg_critical = sum(r['with_critical_data'] for r in results_by_market.values()) / 3
    avg_fcf = sum(r['with_fcf'] for r in results_by_market.values()) / 3
    avg_margin = sum(r['with_margin'] for r in results_by_market.values()) / 3

    print(f"  Promedio datos críticos: {avg_critical:.0f} empresas")
    print(f"  Promedio con FCF: {avg_fcf:.0f} empresas ({100*avg_fcf/avg_critical:.1f}%)")
    print(f"  Promedio con Net Margin: {avg_margin:.0f} empresas ({100*avg_margin/avg_critical:.1f}%)")

    # Recomendaciones
    print(f"\n💡 RECOMENDACIONES:")
    if avg_margin < 10:
        print(f"  ⚠️  Bajo % de empresas con Net Profit Margin")
        print(f"      → Activar fallback a Finviz para obtener márgenes")

    if avg_fcf < 100:
        print(f"  ⚠️  Muchas empresas sin FCF válido")
        print(f"      → Revisar si falta campo freeCashflow en Yahoo API")

    print("\n✅ Análisis completado")

if __name__ == '__main__':
    analyze_data_quality()
