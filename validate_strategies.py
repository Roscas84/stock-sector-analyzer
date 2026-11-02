#!/usr/bin/env python3
"""
Validación de Criterios - 4 Estrategias
Revisa cuántas empresas pasan cada estrategia
"""

import json

def validate_strategies():
    """Valida todas las 4 estrategias contra 353 empresas"""

    with open('public/data.json', 'r') as f:
        data = json.load(f)

    stats = {
        'lynch': {'pass': 0, 'fail': 0},
        'buffett': {'pass': 0, 'fail': 0},
        'greenblatt': {'pass': 0, 'fail': 0},
        'fisher': {'pass': 0, 'fail': 0},
        'consensus': {4: 0, 3: 0, 2: 0, 1: 0, 0: 0}
    }

    # Validar todas las empresas
    for market_name in ['USA', 'Brazil', 'India']:
        companies = data['markets'][market_name]['companies']

        for c in companies:
            passes = []

            # ESTRATEGIA 1: LYNCH (Growth > 5% AND Score >= 60)
            # Aproximar: si tiene revenue growth positivo y PE razonable
            if c.get('peRatio', 0) > 0 and c.get('revenueGrowthYoY', 0) > 5:
                if c.get('peRatio') < 30:  # Aproximación simple
                    stats['lynch']['pass'] += 1
                    passes.append('lynch')
                else:
                    stats['lynch']['fail'] += 1
            else:
                stats['lynch']['fail'] += 1

            # ESTRATEGIA 2: BUFFETT (buffettScore >= 50)
            # Aproximar: Moat + Management scores
            if c.get('moatScore', 0) >= 50 and c.get('managementScore', 0) >= 50:
                stats['buffett']['pass'] += 1
                passes.append('buffett')
            else:
                stats['buffett']['fail'] += 1

            # ESTRATEGIA 3: GREENBLATT (P/E bajo + ROI alto, score >= 60)
            # Aproximar: PE < 20 AND ROIC > 10
            if c.get('peRatio', 0) > 0 and c.get('peRatio') < 20:
                if c.get('roic', 0) > 10:
                    stats['greenblatt']['pass'] += 1
                    passes.append('greenblatt')
                else:
                    stats['greenblatt']['fail'] += 1
            else:
                stats['greenblatt']['fail'] += 1

            # ESTRATEGIA 4: FISHER (Quality + Growth, score >= 60)
            # Aproximar: ROIC > 15 AND Growth > 5 AND MarginNet > 1
            if c.get('roic', 0) > 15 and c.get('revenueGrowthYoY', 0) > 5 and c.get('netProfitMargin', 0) > 1:
                stats['fisher']['pass'] += 1
                passes.append('fisher')
            else:
                stats['fisher']['fail'] += 1

            # Consenso
            consensus_count = len(passes)
            stats['consensus'][consensus_count] += 1

    return stats

def main():
    print("🔍 VALIDACIÓN DE CRITERIOS - 4 ESTRATEGIAS")
    print("==========================================\n")

    stats = validate_strategies()

    print("📊 RESULTADOS POR ESTRATEGIA:")
    print("──────────────────────────────────────────")
    print(f"🚀 LYNCH (Growth > 5% + P/E < 30)")
    print(f"   ✅ Pasan: {stats['lynch']['pass']}")
    print(f"   ❌ Fallan: {stats['lynch']['fail']}")
    print()
    print(f"📈 BUFFETT (Moat >= 50 + Management >= 50)")
    print(f"   ✅ Pasan: {stats['buffett']['pass']}")
    print(f"   ❌ Fallan: {stats['buffett']['fail']}")
    print()
    print(f"💎 GREENBLATT (P/E < 20 + ROI > 10%)")
    print(f"   ✅ Pasan: {stats['greenblatt']['pass']}")
    print(f"   ❌ Fallan: {stats['greenblatt']['fail']}")
    print()
    print(f"🌟 FISHER (ROI > 15% + Growth > 5% + Margin > 1%)")
    print(f"   ✅ Pasan: {stats['fisher']['pass']}")
    print(f"   ❌ Fallan: {stats['fisher']['fail']}")

    print()
    print("📈 CONSENSO (Cuántos inversores están interesados):")
    print("──────────────────────────────────────────")
    total = sum(stats['consensus'].values())
    for consensus, count in sorted(stats['consensus'].items(), reverse=True):
        pct = (count * 100 / total) if total > 0 else 0
        icon = "🟢" if consensus == 4 else "🟡" if consensus == 3 else "🟠" if consensus == 2 else "⚪"
        print(f"{icon} {consensus}/4 inversores: {count} empresas ({pct:.1f}%)")

    print()
    print("═══════════════════════════════════════════")
    print("✅ VALIDACIÓN COMPLETADA")
    print("═══════════════════════════════════════════")

if __name__ == '__main__':
    main()
