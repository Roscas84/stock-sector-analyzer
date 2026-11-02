#!/usr/bin/env python3
"""
Calculador de Moat Score (Warren Buffett)
Basado en indicadores reales:
- Net Profit Margin (rentabilidad)
- ROIC (retorno de capital invertido)
- P/E Ratio (valuación del mercado)
"""

def calculate_moat_score(company):
    """
    Moat Score 0-100 basado en:
    1. Margen Neto (10-30% = excelente moat)
    2. ROIC (15%+ = moat fuerte)
    3. P/E Bajo (valuation atractiva)
    """

    margin = company.get('netProfitMargin', 0)
    roic = company.get('roic', 0)
    pe = company.get('peRatio', 0)

    # ZOOM FILTER: Datos incompletos = no hay moat demostrable
    if margin <= 0 or roic <= 0:
        return 0

    score = 0

    # Margen Neto (máx 40 puntos)
    if margin >= 20:
        score += 40
    elif margin >= 15:
        score += 35
    elif margin >= 10:
        score += 30
    elif margin >= 5:
        score += 20
    elif margin > 0:
        score += 10

    # ROIC (máx 40 puntos)
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

    # P/E Valuation (máx 20 puntos)
    if pe > 0 and pe < 30:
        score += 20
    elif pe >= 30 and pe < 50:
        score += 10
    elif pe >= 50:
        score += 0

    return min(score, 100)


def calculate_management_score(company):
    """
    Management Quality Score 0-100 basado en:
    1. Consistencia de margen (no fluctúa erraticamente)
    2. FCF positivo (genera efectivo real)
    3. Ratio deuda (disciplina financiera)
    """

    margin = company.get('netProfitMargin', 0)
    fcf = company.get('freeCashFlow', 0)
    de = company.get('debtToEquity', 0)

    # ZOOM FILTER
    if margin <= 0:
        return 0

    score = 0

    # Margen estable/consistente (máx 35 puntos)
    if margin >= 10:
        score += 35  # Margen high = management disciplinado
    elif margin >= 5:
        score += 25
    else:
        score += 10

    # Free Cash Flow (máx 35 puntos)
    if fcf > 0:
        score += 35  # Genera efectivo real
    else:
        score += 0  # Sin FCF = gestión cuestionable

    # Deuda-to-Equity (máx 30 puntos)
    if de < 0.5:
        score += 30  # Muy disciplinado
    elif de < 1.0:
        score += 25  # Saludable
    elif de < 1.5:
        score += 15  # Aceptable
    elif de < 2.0:
        score += 8
    else:
        score += 0  # Muy apalancado

    return min(score, 100)


if __name__ == '__main__':
    # Test example
    test_company = {
        'ticker': 'AAPL',
        'netProfitMargin': 25.5,  # 25.5%
        'roic': 75.0,  # 75% ROI
        'peRatio': 28,
        'freeCashFlow': 1.0e10,  # $10 billones
        'debtToEquity': 0.65
    }

    moat = calculate_moat_score(test_company)
    mgmt = calculate_management_score(test_company)

    print(f"🏰 Moat Score: {moat}/100")
    print(f"👨‍💼 Management Score: {mgmt}/100")
