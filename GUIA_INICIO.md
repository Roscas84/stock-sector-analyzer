# 📊 Stock Analyzer - Guía de Inicio (2026-10-28)

## Estado Actual
- ✅ Sistema base funciona con datos REALES de Yahoo Finance
- ✅ 3 bolsas: 🇲🇽 México, 🇧🇷 Brasil, 🇺🇸 USA (23 empresas)
- ✅ 9 criterios de filtrado (Nivel 1 + Nivel 2)
- ✅ PEG Ratio para valuación
- ⏳ PENDIENTE: Alpha Vantage API para ROIC (necesita API key)

---

## 🚀 Cómo Ejecutar Mañana

### Terminal 1: Servidor Local
```bash
cd /Users/angelalcantara/Claude/Proyects/stock-sector-analyzer/public
python3 -m http.server 3000
```

Verás:
```
Serving HTTP on :: port 3000 (http://[::]:3000/) ...
```

### Terminal 2: Actualizar Datos (OPCIONAL)
```bash
cd /Users/angelalcantara/Claude/Proyects/stock-sector-analyzer
python3 fetch_data.py
```

### Navegador
```
http://localhost:3000/analyzer.html
Cmd + Shift + R (hard refresh)
```

---

## 📋 Próximos Pasos

### 1. Implementar Alpha Vantage para ROIC
```bash
# Obtener API key en: https://www.alphavantage.co/
# Editar fetch_data.py línea 99-130
# Agregar fallback a Alpha Vantage si Finviz falla
```

### 2. Agregar más datos
- Actualizar fetch_data.py con API key
- Ejecutar `python3 fetch_data.py`
- Recarga navegador

---

## 📁 Estructura del Proyecto

```
stock-sector-analyzer/
├── public/
│   ├── analyzer.html    ← HTML con UI (actualizado 23:27)
│   ├── index.html       ← Copia de analyzer.html
│   └── data.json        ← Datos REALES (timestamp: 2026-10-28T23:46:00)
├── fetch_data.py        ← Script para descargar datos de Yahoo + fallbacks
├── GUIA_INICIO.md       ← Esta guía
└── SETUP_DATA.md        ← Instrucciones detalladas de instalación
```

---

## 🔑 Información Importante para Mañana

**Alpha Vantage API:**
- Obtener en: https://www.alphavantage.co/
- Insertar en: fetch_data.py (línea ~99)
- Usar para: ROIC cuando Yahoo/Finviz no tengan

**Datos actuales:**
- Yahoo Finance: P/E, Deuda, Margin, Crecimiento, FCF, Dividendos
- Finviz: (bloqueado por 429 - usar Alpha Vantage en su lugar)
- Faltante: ROIC, Short-Term Debt Ratio (pendiente Alpha Vantage)

---

## ✅ Checklist para Mañana

- [ ] Obtener Alpha Vantage API key
- [ ] Actualizar fetch_data.py con la key
- [ ] Ejecutar `python3 fetch_data.py`
- [ ] Verificar que ROIC aparece en datos
- [ ] Recarga navegador y prueba USD → Click empresa

---

## 🆘 Si algo no funciona

1. **Servidor no arranca**
   ```bash
   # Verifica puerto 3000 no esté en uso
   lsof -i :3000
   ```

2. **Datos antiguos en navegador**
   ```
   Abre: http://localhost:3000/analyzer.html
   Presiona: Cmd + Shift + R (3 veces)
   ```

3. **Script fetch_data.py falla**
   ```bash
   # Verifica que pip packages estén instalados
   pip3 install yfinance beautifulsoup4 requests
   ```

---

## 📞 Notas Técnicas

- **Servidor actual**: Python 3.13 http.server en puerto 3000
- **Datos**: En tiempo real de Yahoo Finance (actualizable diariamente)
- **Cache**: El navegador cachea agresivamente - usar Cmd+Shift+R
- **Fallbacks**: Finviz bloqueado (429) → usar Alpha Vantage en su lugar

---

Guardado: 2026-10-28 23:46 UTC
Próxima sesión: Implementar Alpha Vantage API para ROIC
