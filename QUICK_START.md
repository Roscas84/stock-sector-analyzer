# ⚡ ANALIZADOR DE INVERSIONES - QUICK START

## 🚀 INICIAR LA APP (30 SEGUNDOS)

```bash
cd /Users/angelalcantara/Claude/Proyects/stock-sector-analyzer

# Terminal 1: Iniciar servidor
npm run dev

# Luego abre en navegador:
http://localhost:3000
```

**Verás:**
- Splash screen con "🔄 ACTUALIZAR DATOS AHORA"
- 3 mercados: 🇺🇸 USA (378) | 🇧🇷 Brasil (53) | 🇮🇳 India (41)
- Selecciona uno → Ve 472 empresas con consenso 3/3, 2/3, 1/3

---

## 🔧 CAMBIOS COMUNES

### **Cambiar criterios de filtrado**
```
Archivo: public/FILTERING_CRITERIA.md
Línea: Buscar "Buffett Score mínimo: >= 50"
Cambiar el valor (ej: >= 60)
Validar: python3 validate_complete.py
Reiniciar: npm run dev
```

### **Actualizar datos (precios/empresas)**
```bash
# Descargar nuevos datos de Yahoo Finance
python3 update_stock_data_v2.py

# Validar que no hay errores
python3 validate_complete.py

# Reiniciar servidor
Ctrl+C en terminal
npm run dev
```

### **Ver todos los scores (debug)**
```
Abre en navegador:
http://localhost:3000/debug.html

Muestra:
- Todos los tickers
- Scores de cada inversor
- Si pasan o no los criterios
- Anomalías detectadas
```

---

## 📊 ESTRUCTURA RÁPIDA

```
stock-sector-analyzer/
├── README.md                    ← Documentación completa
├── QUICK_START.md               ← Este archivo
├── FILTERING_CRITERIA.md        ← Criterios (NO CAMBIAR sin validar)
├── validate_complete.py         ← Validación exhaustiva
├── update_stock_data_v2.py      ← Descargar datos
│
├── public/
│   ├── index.html               ← App principal (splash + mercados)
│   ├── debug.html               ← Ver todos los scores
│   ├── data.json                ← 472 empresas (actualizable)
│   ├── level2.3-handler.js      ← Graham (Dividendos)
│   ├── level2.7-handler.js      ← Lynch (GARP)
│   └── level3.5-handler.js      ← Buffett (Moat)
│
└── package.json                 ← Dependencias
```

---

## 🎯 VALIDACIÓN RÁPIDA

```bash
# 1. ¿Hay 472 empresas?
python3 validate_complete.py
# Buscar: "📊 Total: 472 empresas"

# 2. ¿Exxon está en 3/3?
python3 validate_complete.py
# Buscar: "✅ PASS | Exxon encontrado"

# 3. ¿Hay 172+ en consenso 3/3?
python3 validate_complete.py
# Buscar: "Consenso 3/3: 172 empresas"

# Si TODO dice ✅ → Todo está bien
```

---

## 🚨 SI ALGO FALLA

### **Blank page en http://localhost:3000**
```
Solución:
1. Abre consola: F12
2. ¿Dice error en console?
3. Revisa: public/index.html (script imports)
4. Reinicia: Ctrl+C, npm run dev
```

### **Exxon desapareció**
```
Significa: Cambió un criterio sin validar
Solución:
1. Abre: FILTERING_CRITERIA.md
2. Revisa qué criterio cambió
3. Revert a valores originales
4. Corre: python3 validate_complete.py
```

### **Precios en 0 o empresas sin datos**
```
Significa: Yahoo Finance no tiene datos
Solución:
1. Corre: python3 update_stock_data_v2.py
2. Espera ~40 min
3. Corre: python3 validate_complete.py
4. Reinicia: npm run dev
```

---

## 📞 REFERENCIA DE ARCHIVOS

| Archivo | Para qué | Cuándo |
|---------|----------|--------|
| README.md | Entender todo | Lees el proyecto por primera vez |
| QUICK_START.md | Recordar comandos | Retomas después de semanas |
| FILTERING_CRITERIA.md | Cambiar criterios | Quieres ajustar scores |
| validate_complete.py | Validar todo | Después de cambios |
| update_stock_data_v2.py | Descargar datos | Cada mes o cuando falta data |
| public/data.json | Los datos | Nunca edites (auto-generado) |

---

## ⚙️ COMANDOS MÁS USADOS

```bash
# Iniciar desarrollo
npm run dev

# Validar integridad
python3 validate_complete.py

# Descargar datos nuevos
python3 update_stock_data_v2.py

# Ver debug de todos los scores
# (abre en navegador) http://localhost:3000/debug.html
```

---

**Versión**: 1.0.0  
**Fecha**: 2026-11-01  
**Estado**: Listo para producción
