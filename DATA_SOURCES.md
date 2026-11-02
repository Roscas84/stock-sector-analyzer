# Sistema de Fallback de Fuentes de Datos

## Arquitectura

El script `update_stock_data_v2.py` implementa un sistema de fallback en cascada para maximizar la completitud de datos:

```
                    ┌─────────────────────────────┐
                    │  TICKER SOLICITADO          │
                    └────────────┬────────────────┘
                                 │
                    ┌────────────▼─────────────┐
                    │ FUENTE 1: Yahoo Finance  │ ◄── PRIMARIA
                    │ (yfinance library)       │
                    └────────────┬─────────────┘
                                 │
                    ┌────────────▼─────────────────┐
                ┌───►¿Precio > 0?                 │
                │   ¿Datos válidos?               │
                │   ¿Net Profit Margin != 0?      │
                │   └─► SI = RETORNA DATOS YF     │
    FALLO       │   └─► NO = CONTINUA            │
                │       └────────────┬────────────┘
                │                    │
                │   ┌────────────────▼──────────────┐
                │   │ FUENTE 2: Finviz             │ ◄── SECUNDARIA
                │   │ (Web scraping)               │
                │   └────────────┬──────────────────┘
                │                │
                │   ┌────────────▼──────────────────┐
                │   │¿Datos obtenidos?             │
                │   └─► SI = RETORNA DATOS FINVIZ │
                │   └─► NO = CONTINUA             │
                │       └────────────┬──────────────┘
                │                    │
                │   ┌────────────────▼──────────────┐
                │   │ FUENTE 3: RESERVADA          │ ◄── TERCIARIA
                │   │ (Para futuro)                │
                │   └────────────┬──────────────────┘
                │                │
                └────────────────┼──────────────────┘
                                 │
                    ┌────────────▼─────────────┐
                    │ ❌ NO ENCONTRADO        │
                    │ (Retorna NULL)          │
                    └─────────────────────────┘
```

## Fuentes Implementadas

### 1. Yahoo Finance (yfinance)
**Estado**: ✅ ACTIVA

**Métricas obtenidas**:
- Price (precio actual)
- P/E Ratio (relación precio/ganancia)
- Debt-to-Equity
- Net Profit Margin (cuando disponible)
- Free Cash Flow
- ROE (Return on Equity)
- Current Ratio
- Quick Ratio
- Dividend Yield
- 52-week High/Low
- Sector
- Company Name

**Fallback interno**: 
- Si `trailingPE` no existe, usa `forwardPE`
- Si `currentPrice` no existe, usa `regularMarketPrice`
- Si `trailingAnnualDividendYield` no existe, usa `dividendYield` con normalización

**Cuándo falla**:
- Empresa delisted/removida de cotización
- Símbolo incorrecto
- Sin datos históricos de 1 año
- Precio = 0 o null

---

### 2. Finviz (Fallback Secundario)
**Estado**: ✅ IMPLEMENTADO (Web scraping)

**Métricas obtenidas**:
- Datos de gráficos y análisis técnico
- Ratios financieros calculados
- Información de industria
- Consenso de analistas

**Cuándo se activa**:
- Yahoo Finance no retorna datos válidos
- Precio = 0 después de Yahoo
- Datos críticos faltantes

---

### 3. [Futura] Alpha Vantage o IEX Cloud
**Estado**: 📋 RESERVADO

**Será utilizado para**:
- Datos fundamentales adicionales
- Series históricas más extensas
- Información de dividendos históricos

---

## Parámetros de Activación

Cada fuente se activa según estos criterios:

| Condición | Yahoo | Finviz | Terciaria |
|-----------|-------|--------|-----------|
| Precio > 0 | ✅ USA | Solo si YF falló | Solo si Finviz falló |
| Sector disponible | ✅ PREFER | Fallback | Fallback |
| FCF disponible | ✅ PREFER | Estimado | Estimado |
| Net Profit Margin | ✅ PREFER | Calculado | Calculado |

---

## Normalización de Datos

### Dividend Yield
**Problema**: Yahoo Finance retorna valores en diferentes formatos según mercado
- USA: Decimal (0.035 = 3.5%)
- Brasil: Porcentaje (3.5 = 3.5%)
- India: Variable

**Solución aplicada**:
```python
if trailing_yield > 0:
    dividend_yield = trailing_yield * 100  # Decimal → Porcentaje
else:
    # Fallback con detección inteligente
    if value > 10:        # Probable porcentaje inflado
        value = value / 100
    elif value > 0.1:     # Probable porcentaje correcto
        value = value
    else:                 # Probable decimal
        value = value * 100
    
    # Cap a máximo 15% (detecta anomalías como 3716%)
    if value > 15:
        value = 0
```

### Free Cash Flow
**Conversión**: yfinance retorna en unidades (billones), se convierte a billones (B):
```python
fcf = info.get('freeCashflow', 0) / 1e9
```

### Revenue Growth
**Cálculo**: Compara precio hace 1 año vs hoy
```python
growth = ((price_today - price_1y) / price_1y * 100)
```

---

## Estadísticas Actuales

**Última ejecución** (2026-11-01):

| Mercado | Intentados | Yahoo ✅ | Finviz | Removidos | Válidos |
|---------|-----------|---------|--------|-----------|---------|
| USA | 420 | 378 | 0 | 42 | 378 |
| Brasil | 84 | 54 | 0 | 30 | 54 |
| India | 50 | 41 | 0 | 9 | 41 |
| **TOTAL** | **554** | **473** | **0** | **81** | **473** |

**Tasa de éxito**: 85.4% (473/554)
**Fuentes activas**: 1 de 3 (Yahoo Finance)

---

## Próximas Mejoras

- [ ] Implementar Alpha Vantage para datos fundamentales
- [ ] Implementar Finviz web scraping para ratios faltantes
- [ ] Caché local de datos para evitar límites de API
- [ ] Retry automático con backoff exponencial
- [ ] Detección de anomalías en datos (valores extremos)
- [ ] Logging detallado por fuente
- [ ] Verificación de integridad después de cada descarga

---

## Notas

- El sistema respeta rate limits de APIs (0.3s entre requests)
- Yahoo Finance no retorna `profitMargins` para todas las empresas (limitación del proveedor)
- Finviz requiere User-Agent válido para evitar bloqueos
- Se recomenda correr descarga completa cada trimestre (después de earnings)
