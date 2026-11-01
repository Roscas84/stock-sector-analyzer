# Stock Sector Analyzer - CLAUDE.md

## Visión

**Objetivo**: Automatizar el análisis de salud empresarial para decisiones de inversión a largo plazo, filtrando el ruido de 50+ indicadores a 9 criterios clave organizados en 2 niveles de filtrado escalonado.

**Diferencial**: No es "mete tickers manualmente" sino "dame un sector entero y filtra automáticamente". Análisis masivo + historial + comparativas por fecha.

---

## Stack & Arquitectura

**Frontend**: React 18 + TypeScript + Tailwind  
**Base de datos**: IndexedDB (local, sin servidor)  
**APIs de datos**: Yahoo Finance (primaria) + Alpha Vantage/Finviz (fallback automático)  
**Build tool**: Vite  
**Tipo**: PWA (Progressive Web App, funciona offline)

**Flujo de datos**:
```
Usuario selecciona sector
    ↓
Descarga 50-200 empresas (Yahoo Finance)
    ↓
Aplica 5 criterios Nivel 1 (mata el 80% del ruido)
    ↓
Muestra tabla con semaforización 🟢🟡🔴
    ↓
Usuario clica "REFINAR" (solo 🟢)
    ↓
Aplica 4 refinamientos Nivel 2
    ↓
Nueva tabla más pequeña (20-50 empresas)
    ↓
Usuario selecciona 1 empresa → Nivel 3 (indicadores opcionales)
```

---

## Los 9 Criterios

### Nivel 1: Básicos (rápido, mata el 80%)
1. **Salud Financiera**: Debt-to-Equity < 1.5
2. **Rentabilidad**: Net Profit Margin > 5%
3. **Crecimiento**: YoY Revenue Growth > 5%
4. **Liquidez**: Current Ratio > 1.0
5. **Valuación**: P/E < promedio sector

### Nivel 2: Refinamientos (solo para 🟢 Nivel 1)
6. **ROIC**: Return on Invested Capital > 10%
7. **Margen Operativo**: Creciente (tendencia positiva)
8. **Free Cash Flow**: Positivo
9. **Deuda Corto Plazo**: < 20% de deuda total

### Nivel 3: Indicadores opcionales (por ticker individual)
- Análisis técnico (52 semanas, soporte/resistencia)
- Histórico de dividendos
- Noticias recientes
- Proyecciones de analistas
- Y más (usuario selecciona cuáles)

---

## Decisiones Clave

### ✅ 2 niveles solamente (NO 3)
**Por qué**: El propósito es filtrado masivo rápido. 3 niveles sería para cada ticker individual, pero eso ya lo hace Finviz manualmente. Aquí: Nivel 1 + 2 te da los top candidatos en segundos. Nivel 3 (opcional) es solo para los que ya pasaron ambos filtros.

### ✅ Todos los sectores disponibles desde inicio
**Por qué**: El usuario quiere elegir el orden de análisis. Algunos días quiere hacer "todo el sector Industrial", otros "todo Tech". No queremos limitar a 6 sectores, sino tener TODOS disponibles.

### ✅ Análisis MANUAL (usuario trigger, no automático)
**Por qué**: Control total. El usuario decide cuándo analizar un sector (después de reportes trimestrales, cambios macro, etc.). No queremos ejecutar análisis cada hora (costaría datos y recursos).

### ✅ Historial persistente + comparativas por fecha
**Por qué**: La pregunta clave es "¿cambió mi top 10 desde hace un mes?" Guardamos cada análisis con timestamp. La próxima vez que analices el mismo sector, la app te muestra "subió 🔼", "bajó 🔽", "entró nuevo ✨", "salió ❌".

### ✅ Fallback automático si falta dato
**Por qué**: Yahoo puede no tener un dato de una empresa pequeña. En lugar de excluirla (perder información), intentamos Alpha Vantage, luego Finviz. Si tampoco tienen: marcamos ⚠️ pero la empresa sigue en análisis. No pierdes investigación.

### ✅ PWA + IndexedDB (sin servidor)
**Por qué**: El usuario quiere herramienta GRATIS que siga funcionando. Sin servidor = sin costo. IndexedDB es como SQLite pero en el navegador. Todo local. Además, funciona offline después de la primera carga.

---

## Fases de Desarrollo

### Fase 1: MVP (ACTUAL - Semana 1)
- [x] Setup: React + TypeScript + Tailwind + Vite
- [x] Selector de sectores
- [x] Integración Yahoo Finance API (simulada, datos mock)
- [x] Lógica de Nivel 1 (5 criterios)
- [x] Tabla con semaforización básica
- [ ] Testing en navegador

### Fase 2: Refinamiento (Semana 2)
- [ ] Lógica de Nivel 2 (4 refinamientos)
- [ ] Botón "REFINAR" funcional
- [ ] IndexedDB: guardar análisis
- [ ] Historial de análisis
- [ ] Comparativas por fecha

### Fase 3: Completo (Semana 3)
- [ ] Nivel 3: indicadores opcionales por ticker
- [ ] Exportar a CSV/TXT/PDF
- [ ] Favoritas + notas personales
- [ ] Fallback APIs (Alpha Vantage, Finviz)

### Fase 4: Pulir (Semana 4)
- [ ] UI/UX mejorada
- [ ] Testing completo
- [ ] PWA: manifest.json + service-worker
- [ ] Deploy (GitHub Pages o similar)

---

## Instrucciones para correr

```bash
cd ~/Claude/Proyects/stock-sector-analyzer

# Desarrollo
npm run dev
# Abre http://localhost:3000

# Build para producción
npm run build

# Preview del build
npm run preview
```

---

## Notas técnicas

- **Datos simulados**: Actualmente usamos mock data (CAT, BA, AAPL, etc.) para demostración. En producción, conectar API real de Yahoo Finance.
- **IndexedDB**: Hook `useIndexedDB()` maneja todo. Métodos: `saveAnalysis()`, `getAnalysisBySector()`, `addFavorite()`, `saveNote()`, etc.
- **Criterios**: Hook `useCriteria()` tiene lógica pura (no React). Retorna `{passed: boolean, score: number}` para cada criterio.
- **Yahoo Finance**: Hook `useYahooFinance()` abstraer la API. Actualmente retorna datos mock. Cambiar después a llamadas API reales.

---

## Confirmaciones del usuario (2026-10-28)

- ✅ 2 niveles principales + Nivel 3 opcional (indicadores personalizables)
- ✅ 9 criterios totales (5 Nivel 1 + 4 Nivel 2)
- ✅ Yahoo Finance como fuente principal
- ✅ Fallback automático si falta dato (no excluye)
- ✅ TODOS los sectores disponibles desde inicio
- ✅ Historial con comparativas por fecha
- ✅ Exportación TXT/CSV/PDF
- ✅ PWA sin servidor, gratis para siempre

---

## Próximos comandos

```bash
# Terminal 1: Desarrollo
cd ~/Claude/Proyects/stock-sector-analyzer
npm run dev

# Terminal 2: Tipo-check (opcional)
npm run type-check
```

---

## Contacto & preguntas

Archivo de memoria: `project_stock_analyzer.md`  
Este archivo es la fuente de verdad del proyecto.
