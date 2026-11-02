# 🎯 CRITERIOS DE FILTRADO - STOCK ANALYZER

**ÚLTIMA ACTUALIZACIÓN:** 2026-11-01  
**RESPONSABLE:** Sistema de Validación Automática

---

## ⚠️ ADVERTENCIA CRÍTICA

Estos criterios determinan QUÉ EMPRESAS APARECEN en el análisis.
**CAMBIOS AQUÍ AFECTAN DIRECTAMENTE LOS RESULTADOS DE INVERSIÓN.**

---

## 📋 CRITERIOS DE FILTRADO OFICIALES

### 1️⃣ PETER LYNCH - GARP Analysis

| Criterio | Valor | Razón |
|----------|-------|-------|
| **Crecimiento mínimo** | `> 5%` | Solo empresas que crecen |
| **Lynch Score mínimo** | `>= 60` | Permite PEG "aceptable" a "ideal" |
| **PEG Ratio límite** | Informativo (no filtra) | Se usa en presentación visual |

✅ **PASA SI:** `growth > 5 AND score >= 60`

---

### 2️⃣ BENJAMIN GRAHAM - Dividend Income

| Criterio | Valor | Razón |
|----------|-------|-------|
| **Dividendo mínimo** | `>= 1.5%` | Generador básico de ingresos |
| **Graham Score mínimo** | `>= 60` | Empresa relativamente segura |
| **Sostenibilidad** | D/E < 1.5 + FCF > 0 | Verificado en score |

✅ **PASA SI:** `dividend >= 1.5 AND score >= 60`

---

### 3️⃣ WARREN BUFFETT - Deep Analysis

| Criterio | Valor | Razón |
|----------|-------|-------|
| **Buffett Score mínimo** | `>= 50` | Umbral de "interés" |
| **Componentes** | Moat (40%) + Management (35%) + Cycle (25%) | Evaluación holística |

✅ **PASA SI:** `buffettScore >= 50`

---

## 🚨 HISTORIAL DE ERRORES

### Error #1 (2026-11-01)
- **Problema:** Cambio accidental a `score >= 80` eliminó empresas válidas
- **Impacto:** Exxon (232/300) desapareció de resultados
- **Causa:** No se validó contra datos históricos
- **Solución:** Revert a valores originales + este documento

---

## ✅ VALIDACIÓN AUTOMÁTICA

### Empresas que DEBEN aparecer SIEMPRE:

```json
{
  "exxon": {
    "market": "USA",
    "ticker": "XOM",
    "expected_consensus": 3,
    "expected_score_min": 220,
    "expected_score_max": 240,
    "reason": "Referencia de validación: 3/3 inversores, Score ~232"
  }
}
```

### Cómo validar:

1. Abrir: `http://localhost:3000/debug.html`
2. Seleccionar mercado: USA
3. Buscar: XOM (Exxon)
4. Verificar:
   - [ ] Exxon aparece
   - [ ] Consenso = 3/3
   - [ ] Score total = 220-240
   - [ ] Lynch pasa (growth > 5, score >= 60)
   - [ ] Graham pasa (dividend >= 1.5, score >= 60)
   - [ ] Buffett pasa (score >= 50)

---

## 🔒 REGLAS DE ORO

1. **NUNCA cambiar criterios sin validar contra empresas conocidas**
2. **SIEMPRE correr debug.html después de cambios**
3. **SIEMPRE verificar que Exxon aparece en CONSENSO 3/3**
4. **Documentar TODO cambio en HISTORIAL DE ERRORES arriba**

---

## 📞 SI ALGUIEN CAMBIA ESTO

Por favor contactar y ejecutar validación automática INMEDIATAMENTE.
