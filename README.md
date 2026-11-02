# 📊 Analizador de Inversiones

**Versión**: 1.0.0  
**Fecha de creación**: 2026-11-01  
**Estado**: MVP Completo (Validado)  
**Universo**: 583 empresas reales (460 USA, 78 Brasil, 45 India)

---

## 🎯 **VISIÓN Y PROPÓSITO**

**Objetivo Principal**: Automatizar el análisis de salud empresarial para decisiones de inversión a largo plazo, combinando **tres filosofías de inversión clásicas** (Warren Buffett, Peter Lynch, Benjamin Graham) en una sola plataforma.

**Problema que resuelve**:
- ❌ Antes: Analizar 500+ empresas manualmente = imposible
- ❌ Antes: Confusión entre "precio bajo" y "buen negocio"
- ✅ Ahora: Sistema automático que filtra y prioriza en segundos

**Diferencial**:
- No es "mete tickers manualmente" → Es **análisis masivo automático**
- No es "solo precios" → Es **3 estrategias de inversión**
- No es "datos históricos" → Es **validación de criterios en tiempo real**

---

## 📋 **ALCANCES DEL PROYECTO**

### ✅ **QUÉ SÍ HACE (MVP Actual)**

1. **Descarga automática de datos**
   - 460 empresas USA (S&P 500)
   - 78 empresas Brasil (Bovespa)
   - 45 empresas India (Nifty 50)
   - Desde Yahoo Finance

2. **Análisis de 3 estrategias de inversión**
   - **Warren Buffett**: Moat Score + Management Quality (Deep Value)
   - **Peter Lynch**: GARP (Growth At Reasonable Price) con PEG Ratio
   - **Benjamin Graham**: Dividendos Sostenibles (Income)

3. **Scoring y Filtrado**
   - Calcula scores 0-100 para cada inversor
   - Filtra automáticamente según criterios
   - Consenso: 3/3, 2/3, 1/3, 0/3

4. **UI Educativa**
   - Explicaciones de cada métrica (click en "?")
   - Explicaciones de cada estrategia
   - Visualización clara de scores

5. **Validación Automática**
   - Verifica que Exxon aparece en 3/3
   - Valida 583 empresas en tiempo real
   - Detecta anomalías automáticamente

### ❌ **QUÉ NO HACE (Fuera de Scope v1)**

- ❌ Análisis técnico (gráficos, velas)
- ❌ Análisis de noticias
- ❌ Predicciones futuras
- ❌ Portfolio automático
- ❌ Órdenes de compra/venta

---

## 🧠 **LÓGICA DE INVERSIÓN**

### **1. Warren Buffett - Deep Moat Analysis (Score 0-100)**

**Concepto**: Busca empresas con "foso" (ventaja competitiva duradera)

**Fórmula**:
```
Buffett Score = (Moat × 40%) + (Management × 35%) + (Cycle × 25%)
Umbral de compra: >= 65
```

**Componentes**:
- Moat Score: ROE alto, márgenes altos, deuda controlada
- Management: Eficiencia, ROE consistency, FCF
- Business Cycle: STARTUP, GROWTH, MATURE, STABLE, DECLINE

---

### **2. Peter Lynch - GARP (Growth At Reasonable Price) (Score 0-100)**

**Concepto**: Crecimiento rápido a precio justo

**Fórmula**:
```
Lynch Score = (Growth × 30%) + (P/E × 40%) + (PEG × 30%)
Requisito: Growth > 5% + Score >= 60

PEG Ratio = P/E ÷ Growth Rate
- PEG < 1.0 = 🚀 IDEAL
- PEG 1.0-1.5 = ✅ BUENO
- PEG > 1.5 = ⚠️ CARO
```

---

### **3. Benjamin Graham - Sustainable Dividends (Score 0-100)**

**Concepto**: Ingresos pasivos sostenibles

**Fórmula**:
```
Graham Score = (Dividend × 35%) + (D/E Safety × 35%) + (FCF × 30%)
Requisito: Dividend >= 1.5% + Score >= 60

Criterios:
- Dividend Yield >= 1.5%
- Debt/Equity < 1.5
- Free Cash Flow > 0
```

---

## 🗺️ **MAPA DEL DESARROLLO**

```
SESIÓN 1-3:   Planificación (3 estrategias + scoring)
SESIÓN 4-6:   Backend Python (cálculos + descarga)
SESIÓN 7-9:   Frontend JavaScript (handlers, UI)
SESIÓN 10-12: UI + Educación (modales, consenso)
SESIÓN 13-14: Debugging (Vite HMR, appData, Exxon desaparición)
SESIÓN 15:    Universo completo 583 + Splash screen
```

**Problemas resueltos**:
1. Blank page → Scripts en body
2. appData undefined → window.appData global
3. Exxon desaparición → Validación automática + FILTERING_CRITERIA.md
4. Sin validación → validateCriteria() exhaustiva

---

## 🏗️ **ARQUITECTURA TÉCNICA**

**Stack**:
- Frontend: HTML5 + JavaScript vanilla
- Backend: Python 3 + yfinance
- Data: JSON (public/data.json)
- Build: Vite

**Estructura**:
```
stock-sector-analyzer/
├── public/
│   ├── index.html (splash + app principal)
│   ├── data.json (583 empresas)
│   ├── level2.3-handler.js (Graham)
│   ├── level2.7-handler.js (Lynch)
│   ├── level3.5-handler.js (Buffett)
│   └── debug.html (diagnósticos)
├── update_stock_data_v2.py (descarga)
├── FILTERING_CRITERIA.md (umbrales)
└── README.md (este archivo)
```

---

## ✅ **CRITERIOS DE FILTRADO (CRÍTICO)**

**NO CAMBIAR SIN VALIDAR**

| Estrategia | Criterio | Valor |
|-----------|----------|-------|
| Buffett | Score mínimo | >= 50 |
| Lynch | Crecimiento | > 5% |
| Lynch | Score mínimo | >= 60 |
| Graham | Dividend | >= 1.5% |
| Graham | Score mínimo | >= 60 |

**Referencia**: Exxon (XOM) debe pasar 3/3 siempre

---

## 📊 **ESTADO ACTUAL**

✅ Completado:
- 3 estrategias funcionando
- 583 empresas validadas
- Splash screen con "ACTUALIZAR DATOS"
- Validación automática
- UI educativa

⏳ Próximas (v1.1):
- Actualización automática de precios
- Historial de análisis
- Exportar CSV/PDF
- PWA offline

---

## 🚀 **CÓMO EMPEZAR**

```bash
# Terminal 1: Dev server
npm run dev
# http://localhost:3000

# En navegador:
# 1. Ves splash screen
# 2. Haces clic "ACTUALIZAR DATOS AHORA"
# 3. Esperas ~5 min (carga 583 stocks)
# 4. Ves app con 3 mercados
```

---

## 📞 **REFERENCIA RÁPIDA**

**Cambiar criterios**: FILTERING_CRITERIA.md  
**Cambiar scores**: public/level*-handler.js  
**Ver todos scores**: http://localhost:3000/debug.html  
**Validar**: Abre consola (F12) en app  
**Descargar datos**: python3 update_stock_data_v2.py

---

**Versión**: 1.0.0 (2026-11-01)  
**Estado**: MVP Listo  
**Autor**: Claude Code + Usuario
