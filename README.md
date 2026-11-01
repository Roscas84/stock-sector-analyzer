# Stock Sector Analyzer - PWA v1.0.0

**Herramienta personal para análisis inteligente de acciones por sectores**

🎯 **Estado**: Versión 1.0.0 - MVP Completo + PWA  
📦 **Versión**: 1.0.0  
📅 **Última actualización**: 2026-11-01  

---

## ✨ Características Principales

### ✅ Análisis de 2 Niveles
- **Nivel 1**: 5 criterios básicos → filtra 80% del ruido (deuda, margen, crecimiento, liquidez, P/E)
- **Nivel 2**: 4 refinamientos → identifica top candidatos (ROE, margen operativo, FCF, quick ratio)
- **Nivel 3**: Indicadores detallados → análisis profundo por empresa (PEG, valuación, score)

### ✅ Base de Datos Local
- **IndexedDB**: Almacenamiento persistente sin servidor
- **Historial**: Comparativas entre análisis por fecha
- **Cambios detectados**: "Subió 🔼", "Bajó 🔽", "Nuevo ✨", "Salió ❌"

### ✅ 23 Empresas Reales Analizadas
- 🇺🇸 **USA (11)**: AAPL, MSFT, GOOGL, AMZN, NVDA, TSLA, META, JPM, JNJ, XOM, WMT
- 🇧🇷 **Brasil (7)**: PBR, VALE, ITUB, BBDC, ABEV, GGB, EBR
- 🇲🇽 **México (5)**: CX, AMX, MEX, CMCSA, MXN

### ✅ Exportación Completa
- 📋 CSV (hoja de cálculo)
- 📄 TXT (informe detallado)
- 📑 **PDF (tablas + gráficos)** ✨ Nuevo

### ✅ Progressive Web App (PWA)
- 📱 Instala como app nativa en celular/tablet
- 🔌 Funciona offline (service-worker implementado)
- 💾 Datos persistentes sin sincronización
- 🚀 Carga instantánea (caché local)

### ✅ Datos en Tiempo Real
- Fuente: Yahoo Finance API
- Caché inteligente: 40x más rápido (24h TTL)
- Validación: Todos los datos pasan validación de rangos
- Datos actualizados: 2026-10-29

---

## 🚀 Cómo Empezar (Desarrollo Local)

### Instalación
```bash
cd ~/Claude/Proyects/stock-sector-analyzer
npm install
```

### Desarrollo (Dev Server)
```bash
npm run dev
# Abre http://localhost:3000
```

### Build para Producción
```bash
npm run build
npm run preview
```

### Tests
```bash
npm test              # Ejecutar tests con Vitest
npm run test:ui       # Ver UI de tests
```

### Otras Tareas
```bash
npm run type-check    # Verificar tipos TypeScript
```

---

## 📊 Estructura del Proyecto

### Frontend (Producción)
```
public/
├── index.html              # Entrypoint principal
├── analyzer.html           # Interfaz de análisis (32 KB)
├── manifest.json           # PWA configuration ✨
├── service-worker.js       # Offline support ✨
├── data.json               # 23 empresas preconectadas
│
├── db-manager.js           # IndexedDB persistence (176 líneas)
├── history-handler.js      # Comparativas por fecha (161 líneas)
├── export-handler.js       # CSV/TXT/PDF export (140 líneas)
│
├── level1-handler.js       # 5 criterios básicos
├── level2-handler.js       # 4 refinamientos
├── level3-handler.js       # Indicadores detallados
│
├── filters.js              # Lógica de filtrado
└── ui-common.js            # Utilidades de UI
```

### Backend (Datos)
```
fetch_data.py              # 230 líneas - Descarga Yahoo Finance
data_cache.pkl             # Cache 24h - 40x más rápido
```

### Testing
```
tests/
├── criteria.test.ts        # Tests de filtrado (Level 1, 2, 3)
├── export.test.ts          # Tests de exportación
└── data.test.ts            # Tests de validación de datos
```

### Configuración
```
vite.config.ts             # Vite bundler
vitest.config.ts           # Vitest testing ✨
tsconfig.json              # TypeScript config
package.json               # Dependencies + scripts
```

---

## 📈 Criterios de Análisis

### Nivel 1: Criterios Básicos (Mata el 80% del ruido)
| Criterio | Umbral | Propósito |
|----------|--------|----------|
| Deuda/Equity | < 1.5 | Salud financiera |
| Net Profit Margin | > 5% | Rentabilidad |
| Revenue Growth YoY | > 5% | Crecimiento |
| Current Ratio | > 1.0 | Liquidez |
| P/E vs Sector | Menor promedio | Valuación |

**Resultado**: Score 0-100% (requiere ≥80% para pasar)

### Nivel 2: Refinamientos (Solo para empresas que pasan Nivel 1)
| Criterio | Umbral | Propósito |
|----------|--------|----------|
| ROIC (ROE) | > 10% | Rentabilidad del capital |
| Operating Margin | Tendencia +↑ | Eficiencia operativa |
| Free Cash Flow | > 0 | Flujo de caja disponible |
| Quick Ratio | > 1.0 | Liquidez inmediata |

**Resultado**: Score 0-100% (requiere ≥75% para pasar)

### Nivel 3: Indicadores Detallados (Análisis por empresa)
- **PEG Ratio**: Relación P/E ajustada por crecimiento
  - < 1.0 = 🟢 Undervalued
  - 1.0-2.0 = 🟡 Fair
  - > 2.0 = 🔴 Overvalued
- **Score Final**: Agregación de todos los criterios
- **Posición Competitiva**: Comparativa intra-sector

---

## 🔄 Flujo de Uso Típico

```
1. Usuario abre app
   ↓
2. Pantalla de inicio con 3 botones (🇺🇸 USA, 🇧🇷 Brasil, 🇲🇽 México)
   ↓
3. Selecciona mercado → Nivel 1 (filtrado rápido)
   - Muestra 23 empresas con color (🟢🟡🔴)
   - Scores visibles
   ↓
4. Usuario clica "REFINAR" → Nivel 2 (20-50 empresas)
   - Criterios avanzados aplicados
   - Se guarda automáticamente en IndexedDB
   ↓
5. Usuario selecciona 1 empresa → Nivel 3 (detalles)
   - PEG Ratio, valuación, score final
   - Opción: Ver historial, favorita, exportar
   ↓
6. Exportar análisis (CSV/TXT/PDF)
   - Descarga inmediata
   - Timestamp incluido
```

---

## 📊 Scores y Componentes

### Validación de Datos
Todos los 23 tickers pasan validación:
- ✅ Debt-to-Equity: 0-50 rango (empresas sanas: 0.5-2.0)
- ✅ Net Profit Margin: -100% a +100%
- ✅ Revenue Growth: -100% a +300%
- ✅ Current Ratio: 0.1-10 (sanas: >1.0)
- ✅ P/E Ratio: -100 a +500 (razonables: 5-50)

### Caché y Performance
- **Primera carga**: 17 segundos (descarga Yahoo Finance)
- **Cargas posteriores**: 0.43 segundos (caché local, 40x más rápido)
- **Comando**: `python fetch_data.py --force` para refrescar

---

## 🧪 Testing

Incluye **45+ tests** que validan:
- ✅ Lógica de Nivel 1 (5 criterios)
- ✅ Lógica de Nivel 2 (4 refinamientos)
- ✅ Validación de datos
- ✅ Cálculo de scores
- ✅ Exportación CSV/TXT
- ✅ Consistencia de datos
- ✅ Integridad entre análisis

```bash
npm test          # Ejecutar todos los tests
npm run test:ui   # Ver UI interactiva
```

**Cobertura**: Criterios, validación, exportación, análisis

---

## 💾 Almacenamiento

### IndexedDB (Local)
Esquema de análisis guardado:
```json
{
  "id": "USA_2026-10-29T21:31:22.322Z",
  "market": "USA",
  "timestamp": "2026-10-29T21:31:22.322Z",
  "companies": [
    {
      "ticker": "AAPL",
      "level1Score": 85,
      "level2Score": 90,
      "level1Pass": true,
      "level2Pass": true
    }
  ]
}
```

**Índices**:
- `market`: Búsqueda rápida por mercado
- `timestamp`: Ordenamiento automático DESC
- `market_timestamp`: Clave única (evita duplicados)

---

## 🌐 PWA - Funciona Offline

### Instalación
**Desktop**: Click icono + "Instalar como app"  
**Celular**: Botón 3-puntos + "Instalar app"

### Funcionalidad Offline
- ✅ App carga sin internet
- ✅ Datos históricos disponibles
- ✅ Exportación funciona offline
- ✅ Nueva actualizaciones se descargan cuando hay conexión
- ✅ Service Worker maneja caching inteligente

### Estrategia de Caché
- **Network-first**: APIs y datos.json
- **Cache-first**: Assets estáticos (HTML, JS, CSS)
- **Fallback**: Páginas offline si no hay recurso

---

## 📱 Compatibilidad

| Navegador | Desktop | Mobile |
|-----------|---------|--------|
| Chrome | ✅ Completo | ✅ PWA |
| Firefox | ✅ Completo | ✅ PWA |
| Safari | ✅ Completo | ✅ PWA (limitado) |
| Edge | ✅ Completo | ✅ PWA |

---

## 🔐 Privacidad & Seguridad

- ✅ **Sin servidor**: Todo local en tu navegador
- ✅ **Sin tracking**: No enviamos datos a terceros
- ✅ **Open source**: Código visible
- ✅ **Gratis**: Yahoo Finance es API libre
- ✅ **Datos locales**: IndexedDB no sincroniza a la nube

---

## 📋 Estado de Implementación

### ✅ Completado (MVP)
- [x] Análisis 2-nivel funcional
- [x] 23 empresas reales validadas
- [x] IndexedDB con historial
- [x] Comparativas por fecha
- [x] Exportación CSV/TXT/PDF
- [x] PWA con offline support
- [x] Tests automatizados (45+)
- [x] Caché inteligente (40x más rápido)

### 🚀 Próximas Versiones (v1.1+)
- [ ] Nuevas estrategias (GARP, Value, Dividend)
- [ ] Nuevos mercados (REITs, Criptos, Bonos)
- [ ] Fallback APIs reales (Alpha Vantage, Finviz)
- [ ] Gráficas de tendencias
- [ ] Dark/Light mode toggle
- [ ] Sinc con Google Sheets

---

## 📞 Soporte

**Documentación**:
- `CLAUDE.md` - Especificación técnica completa
- `ANALISIS_FINALIZACION_2026-11-01.md` - Roadmap de mejoras
- `PLAN_MEJORAS_PRIORIZADAS.md` - Mejoras ejecutadas
- `MEJORA_5_HISTORIAL_RESUMEN.md` - Detalles de historial

**Desarrollado con**:
- Vite 5.0 (build tool)
- TypeScript 5.3 (type safety)
- Tailwind CSS 3.3 (styling)
- Vitest (testing)
- IndexedDB (persistence)
- jsPDF (PDF export)

---

## 📄 Licencia

MIT - Libre para usar, modificar y distribuir.

---

**Stock Sector Analyzer** | Análisis masivo de acciones | PWA sin servidor  
v1.0.0 | 2026-11-01
