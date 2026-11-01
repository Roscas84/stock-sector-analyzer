# 📊 Setup: Descargando Datos en Vivo de Yahoo Finance

## Instalación (primera vez)

### 1. Instalar Python 3.8+
```bash
# Verificar si tienes Python
python3 --version

# Si no, instalar desde https://www.python.org/downloads/
```

### 2. Instalar yfinance (biblioteca para Yahoo Finance)
```bash
pip3 install yfinance
```

## Ejecutar el Fetcher

### Opción A: Manual (cada vez que quieras actualizar)
```bash
cd /Users/angelalcantara/Claude/Proyects/stock-sector-analyzer
python3 fetch_data.py
```

**Esperado (5-10 minutos):**
```
📊 Stock Analyzer - Data Fetcher
==================================================
Iniciando a las 2026-10-28 14:35:22

🇲🇽 Mexico (BMV)
--------------------------------------------------
  P/E promedio del mercado: 18.5

  Descargando FEMSA... ✓
  Descargando CEMEX... ✓
  [...]

==================================================
✅ Datos guardados en: public/data.json
📅 Actualizado: 2026-10-28T14:45:30.123456
📊 Total de empresas: 24

💡 Recarga tu navegador (Cmd+Shift+R) para ver datos nuevos
```

### Opción B: Automatizado (cada día a las 9 AM)

#### En Mac/Linux (usando cron):
```bash
# Abrir editor de cron
crontab -e

# Agregar esta línea:
0 9 * * * cd /Users/angelalcantara/Claude/Proyects/stock-sector-analyzer && python3 fetch_data.py >> fetch_log.txt 2>&1

# Guardar y salir (Ctrl+X, Y, Enter en nano)
```

#### En Windows:
1. Abre **Task Scheduler**
2. Crea nueva tarea
3. Acción: `python3 C:\ruta\al\fetch_data.py`
4. Horario: Diario a las 9 AM

---

## Qué hace el script

✅ Descarga datos REALES de Yahoo Finance para:
- 🇲🇽 6 empresas de México
- 🇧🇷 7 empresas de Brasil (via ADRs)
- 🇺🇸 11 empresas de USA

✅ Para cada empresa obtiene:
- Precio actual
- P/E Ratio
- Debt-to-Equity
- Margen de ganancia neta
- Crecimiento YoY
- Current Ratio
- ROIC
- Free Cash Flow
- Y más...

✅ Genera `public/data.json` con todos los datos

✅ Valida que los datos sean sensatos

---

## Qué pasa si hay errores

**"ModuleNotFoundError: No module named 'yfinance'"**
→ Instala: `pip3 install yfinance`

**"No data for ticker XYZ"**
→ Yahoo Finance no tiene datos para ese ticker (es normal para algunos ADRs)
→ El script lo salta automáticamente

**"Cannot connect to Yahoo Finance"**
→ Revisa tu conexión a internet
→ Yahoo tiene rate limits (~2000 requests/hora)
→ Espera 5 minutos e intenta de nuevo

---

## Cómo integrar con tu flujo

1. **Cada lunes** (después de que cierre el mercado):
   ```bash
   python3 fetch_data.py
   ```

2. **Abre el analizador:**
   ```bash
   http://localhost:3000
   ```

3. **Los datos son 100% actuales** de Yahoo Finance

4. **Repite cada semana** (o diariamente si quieres)

---

## Validación de datos

⚠️ **IMPORTANTE:** Aunque el script descarga datos REALES:

1. **Verifica siempre manualmente** en Yahoo Finance / Investing.com
2. **Discrepancias son normales** (diferentes fuentes, fechas de corte)
3. **Para inversión real**, revisa además:
   - Reportes trimestrales (10-Q, 6-K)
   - Estados financieros auditorados
   - Noticias recientes
   - Análisis de expertos

**Este analizador es una herramienta de screening**, no recomendación de inversión.

---

## Script de ejemplo (para ejecutar ahora)

Haz esto AHORA para verificar que funciona:

```bash
cd /Users/angelalcantara/Claude/Proyects/stock-sector-analyzer
python3 fetch_data.py
```

Luego recarga tu navegador: `http://localhost:3000` (Cmd+Shift+R)

¡Los datos serán REALES de Yahoo Finance! 🎯
