# Criterios de Filtrado - Stock Sector Analyzer

## Principios Fundamentales

### 1️⃣ ZOOM FILTER: Empresas con Datos Incompletos

**TODAS las estrategias rechazan empresas pequeñas sin datos en Yahoo Finance**:
- Lynch: Si `peRatio` o `revenueGrowthYoY` son null/0
- Greenblatt: Si `peRatio` o `roic` son null/0
- Fisher: Si `roic`, `revenueGrowthYoY`, o `debtToEquity` son null/0
- Buffett: Si `moatScore` o `managementScore` son null/0

**Resultado**: `⚪ SIN DATOS (empresa muy pequeña)` → Score 0 → No pasa

**Razón**: Si Yahoo Finance no tiene datos, es una micro-empresa o muy nueva. No es inversión institucional.

---

### 2️⃣ Fundamentals Obligatorios

**TODAS las estrategias rechazan empresas especulativas**:
- `netProfitMargin <= 0` → ❌ NO genera ganancias
- `freeCashFlow <= 0` → ❌ NO genera cash real

**Resultado**: `❌ NO APLICA (sin fundamentals)` → Score 0 → No pasa

Sin estos, una empresa no tiene fundamentals sólidos, sin importar otros indicadores.

---

## 1️⃣ PETER LYNCH (GARP - Growth At Reasonable Price)

**Requisitos**:
- ✅ Margen Neto > 0%
- ✅ Free Cash Flow > 0B
- ✅ Crecimiento de Ingresos > 5%
- ✅ PEG Ratio < 1.5 (ideal < 1.0)
- ✅ Score >= 60

**Scoring**:
| Growth | PEG < 1.0 | PEG 1.0-1.5 | PEG > 1.5 |
|--------|-----------|------------|-----------|
| 5-10% | 60 | 60 | 40 |
| 10-20% | 100 | 85 | 50 |
| > 20% | 95 | 95 | 70 |

**Filosofía**: Empresas que crecen rápido pero no están caras.

**Ejemplo rechazado**: CGEN
- Margen: 0% ❌
- FCF: 0.022B ✓ (marginal pero pasa)
- Growth: 11.86% ✓
- P/E: 5.21, PEG: 0.44 ✓
- **Veredicto**: Rechazada por margen 0 (especulativa)

---

## 2️⃣ JOEL GREENBLATT (Magic Formula)

**Requisitos**:
- ✅ Margen Neto > 0%
- ✅ Free Cash Flow > 0B
- ✅ P/E < 10 (ideal) o < 15 (aceptable) = 50-90 pts
- ✅ ROI (ROIC) >= 20% (ideal) = 90 pts
- ✅ Score >= 60

**Scoring**:
- P/E Score: 90 (< 10) → 75 (10-15) → 60 (15-20) → 40 (20-30) → 20 (> 30)
- ROI Score: 90 (>= 20%) → 80 (15-20%) → 70 (10-15%) → 40 (5-10%) → 10 (< 5%)
- **Final**: (P/E Score × 0.5) + (ROI Score × 0.5)

**Filosofía**: Valor (P/E bajo) + Calidad (ROI alto) = Magic Formula.

**Ejemplo rechazado**: CGEN
- P/E Score: 90 (5.21 < 10) ✓ Excelente
- ROI Score: 90 (50.6% > 20%) ✓ Excelente
- **Pero**: Margen = 0% ❌ → **Rechazada como especulativa**

---

## 3️⃣ WARREN BUFFETT (Moat + Management)

**Requisitos**:
- ✅ Margen Neto > 0%
- ✅ Free Cash Flow > 0B
- ✅ Moat Score >= 40
- ✅ Management Score >= 30
- ✅ Buffett Score >= 50

**Scoring**:
- `Buffett Score = (Moat × 0.40) + (Management × 0.35) + (Cycle × 0.25)`
- Cycle: STABLE=75, GROWTH=85, MATURE=65, DECLINE=30

**Filosofía**: Empresas con ventajas competitivas duraderas (moat) + management de calidad.

**Ejemplo rechazado**: CGEN
- Moat Score: 50
- Management Score: 50
- Cycle: STABLE (75)
- Buffett Score: (50×0.4) + (50×0.35) + (75×0.25) = 57.5 ≈ 58 (pasaría)
- **Pero**: Margen = 0% ❌ → **Rechazada como especulativa**

---

## 4️⃣ PHILIP FISHER (Quality Growth)

**Requisitos**:
- ✅ Margen Neto > 0%
- ✅ Free Cash Flow > 0B
- ✅ ROE >= 15% (ideal) o >= 10% (aceptable)
- ✅ Margen >= 10% (ideal) o >= 5% (aceptable)
- ✅ D/E < 1.0 (ideal) o < 1.5 (aceptable)
- ✅ Crecimiento 5-40% (ideal) o >= 5% (aceptable)
- ✅ Score >= 60

**Scoring**:
- Quality Score: 90 (ROE≥15% + Margen≥10% + D/E<1.0 + FCF>0) → escala descendente
- Growth Score: 90 (15-40%) → 80 (10-15%) → 70 (5-10%) → 50 (0-5%) → 10 (negativo)
- **Final**: (Quality Score × 0.60) + (Growth Score × 0.40)

**Filosofía**: Management excelente + Crecimiento sostenible = Negocios de calidad.

**Ejemplo rechazado**: CGEN
- Quality: ROE 50.6% ✓ + Margen 0% ❌ = Rechazado
- Growth: 11.86% ✓ 
- **Veredicto**: Rechazada por margen 0 (especulativa)

---

## 📊 Consenso (4 Estrategias)

Cada empresa que PASA un evaluador se suma a su consenso:

| Consenso | Interpretación |
|----------|---|
| **4/4** | ✨ Los 4 inversores están interesados - **EXCELENTE** |
| **3/4** | 🟢 3 inversores la ven bien - Muy bueno |
| **2/4** | 🟡 2 inversores la ven bien - Considerar |
| **1/4** | 🟠 1 inversor la ve bien - Investigar más |
| **0/4** | ❌ Ningún inversor la ven bien - EVITAR |

---

## ⚠️ Casos de Validación

### CGEN (Compugen Ltd.)
```
Margen Neto:     0% ❌ (especulativa)
FCF:             0.022B (marginal)
P/E:             5.21 (muy barato)
ROI:             50.6% (muy alto)
Growth:          11.86% (bueno)
Debt/Equity:     3.407 (alto)
```

**Resultado**: **Rechazada por todas las estrategias** (especulativa)
- Lynch: ❌ Margen 0%
- Greenblatt: ❌ Margen 0%
- Buffett: ❌ Margen 0%
- Fisher: ❌ Margen 0%

**Por qué**: Aunque tiene P/E bajo y ROI alto (características de valor), NO está generando ganancias (margen 0%) ni cash real (FCF casi 0%). Esto la marca como **especulativa** = NO es inversión fundamental.

---

## 🟢 Ejemplo de Empresa que SÍ Pasa (Exxon XOM)

```
Margen Neto:     5.2% ✅
FCF:             35.2B ✅
P/E:             12 ✅
ROI:             22% ✅
Growth:          8% ✅
Debt/Equity:     0.52 ✅
```

**Resultado**: **4/4 Consenso** (pasa todas las estrategias)
- Lynch: ✅ (Growth 8%, PEG 1.5)
- Greenblatt: ✅ (P/E 12, ROI 22%)
- Buffett: ✅ (Moat alto, Management bueno)
- Fisher: ✅ (ROE 22%, Margen 5.2%, D/E 0.52)

---

## 🔄 Actualización 2026-11-01

**Cambios principales**:
- ✅ Sistema de fallback a Finviz (Yahoo Finance → Finviz → reservado)
- ✅ Zoom Filter: Detecta datos inválidos o faltantes
- ✅ Filtros mejorados: Rechaza solo si AMBOS indicadores son bajos
- ✅ Validación de ranges: P/E < 500, ROI < 200, Dividend < 15%
- ✅ Script de validación: `validate_data_quality.py`

**Razón**: 
- CGEN demostró que P/E bajo + ROI alto SIN margen = trampa
- Yahoo Finance no proporciona `netProfitMargin` para todas las empresas
- Fallback a Finviz obtiene datos faltantes

**Datos esperados tras actualización**:
- 🇺🇸 USA: ~380 empresas
- 🇧🇷 Brasil: ~50 empresas  
- 🇮🇳 India: ~40 empresas
- 📊 TOTAL: ~470 empresas
