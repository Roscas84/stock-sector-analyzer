#!/usr/bin/env python3
"""
Validación REAL de Criterios - Usando los handlers JavaScript
Simula cómo evaluarían las 4 estrategias
"""

import json
import math

def evaluate_lynch(company):
    """Peter Lynch GARP: Growth > 5% AND Score >= 60"""
    growth = company.get('revenueGrowthYoY', 0)
    pe = company.get('peRatio', 0)
    fcf = company.get('freeCashFlow', 0)

    # ZOOM FILTER
    if pe <= 0 or growth == 0:
        return False

    # PRIMARY FILTER
    if fcf <= 0:
        return False

    # SCORING
    if growth < 5:
        score = 20
    elif 5 <= growth < 10:
        if pe > 0:
            peg = pe / growth
            score = 60 if peg < 1.5 else 40
        else:
            score = 40
    else:  # growth >= 10
        if pe > 0:
            peg = pe / growth
            if peg < 1.0:
                score = 100
            elif peg < 1.5:
                score = 90
            elif peg < 2.0:
                score = 80
            else:
                score = 60
        else:
            score = 85

    return growth > 5 and score >= 60

def evaluate_buffett(company):
    """Warren Buffett: (Moat × 0.4) + (Mgmt × 0.35) + (Cycle × 0.25) >= 50"""
    moat = company.get('moatScore', 0)
    mgmt = company.get('managementScore', 0)

    # ZOOM FILTER
    if moat <= 0 or mgmt <= 0:
        return False

    # PRIMARY FILTER
    if moat < 30 and mgmt < 30:
        return False

    cycle_map = {'STABLE': 75, 'GROWTH': 85, 'MATURE': 65, 'DECLINE': 30}
    cycle = cycle_map.get(company.get('businessCycle', 'STABLE'), 50)

    score = (moat * 0.4) + (mgmt * 0.35) + (cycle * 0.25)
    return score >= 50

def evaluate_greenblatt(company):
    """Joel Greenblatt Magic Formula: (P/E Score × 0.5) + (ROI Score × 0.5) >= 60"""
    pe = company.get('peRatio', 0)
    roic = company.get('roic', 0)
    margin = company.get('netProfitMargin', 0)
    fcf = company.get('freeCashFlow', 0)

    # ZOOM FILTER
    if pe <= 0 or roic <= 0:
        return False

    # PRIMARY FILTER - Ejemplo: CGEN rechazado por margin=0 + FCF~0
    if (pe <= 0 or pe > 500) and (roic <= 0 or roic > 200):
        return False

    # P/E SCORING
    if pe < 10:
        pe_score = 90
    elif pe < 15:
        pe_score = 75
    elif pe < 20:
        pe_score = 60
    elif pe < 30:
        pe_score = 40
    else:
        pe_score = 20

    # ROI SCORING
    if roic >= 20:
        roi_score = 90
    elif roic >= 15:
        roi_score = 80
    elif roic >= 10:
        roi_score = 70
    elif roic >= 5:
        roi_score = 40
    else:
        roi_score = 10

    score = (pe_score * 0.5) + (roi_score * 0.5)
    return score >= 60

def evaluate_fisher(company):
    """Philip Fisher Quality Growth: (Quality × 0.6) + (Growth × 0.4) >= 60"""
    roic = company.get('roic', 0)
    growth = company.get('revenueGrowthYoY', 0)
    margin = company.get('netProfitMargin', 0)
    de = company.get('debtToEquity', 0)
    fcf = company.get('freeCashFlow', 0)

    # ZOOM FILTER
    if roic == 0 or growth == 0 or de == 0:
        return False

    # PRIMARY FILTER
    if (roic < 5 and growth < 5) or (roic < 0 and growth < 0):
        return False

    # QUALITY SCORE
    quality = 0
    if roic >= 15:
        quality += 30
    elif roic >= 10:
        quality += 20
    else:
        quality += 10

    if margin >= 10:
        quality += 30
    elif margin >= 5:
        quality += 20
    else:
        quality += 10

    if de < 1.0:
        quality += 15
    else:
        quality += 5

    if fcf > 0:
        quality += 15
    else:
        quality += 0

    # GROWTH SCORE
    if growth >= 15:
        growth_score = 90
    elif growth >= 10:
        growth_score = 80
    elif growth >= 5:
        growth_score = 70
    elif growth >= 0:
        growth_score = 50
    else:
        growth_score = 10

    score = (quality * 0.6) + (growth_score * 0.4)
    return score >= 60

def main():
    with open('public/data.json', 'r') as f:
        data = json.load(f)

    stats = {
        'lynch': 0,
        'buffett': 0,
        'greenblatt': 0,
        'fisher': 0,
        'consensus': {4: 0, 3: 0, 2: 0, 1: 0, 0: 0}
    }

    print("🔍 VALIDACIÓN CON CRITERIOS REALES")
    print("════════════════════════════════════════════════════════════════\n")

    for market_name in ['USA', 'Brazil', 'India']:
        companies = data['markets'][market_name]['companies']

        for c in companies:
            passes = []

            if evaluate_lynch(c):
                stats['lynch'] += 1
                passes.append('Lynch')

            if evaluate_buffett(c):
                stats['buffett'] += 1
                passes.append('Buffett')

            if evaluate_greenblatt(c):
                stats['greenblatt'] += 1
                passes.append('Greenblatt')

            if evaluate_fisher(c):
                stats['fisher'] += 1
                passes.append('Fisher')

            consensus = len(passes)
            stats['consensus'][consensus] += 1

    print("📊 RESULTADOS FINALES:")
    print("──────────────────────────────────────────────────────────────")
    print(f"🚀 Lynch (Growth > 5% + PEG < 1.5): {stats['lynch']:3d} empresas")
    print(f"📈 Buffett (Moat + Mgmt + Cycle >= 50): {stats['buffett']:3d} empresas")
    print(f"💎 Greenblatt (P/E Score + ROI Score >= 60): {stats['greenblatt']:3d} empresas")
    print(f"🌟 Fisher (Quality + Growth >= 60): {stats['fisher']:3d} empresas")

    print()
    print("📈 CONSENSO:")
    print("──────────────────────────────────────────────────────────────")
    total = sum(stats['consensus'].values())
    for consensus, count in sorted(stats['consensus'].items(), reverse=True):
        pct = (count * 100 / total) if total > 0 else 0
        if consensus == 4:
            emoji = "🟢"
        elif consensus == 3:
            emoji = "🟡"
        elif consensus == 2:
            emoji = "🟠"
        else:
            emoji = "⚪"
        print(f"{emoji} {consensus}/4: {count:3d} empresas ({pct:5.1f}%)")

    print()
    print("════════════════════════════════════════════════════════════════")
    print(f"✅ VALIDACIÓN COMPLETADA - {total} empresas analizadas")

if __name__ == '__main__':
    main()
