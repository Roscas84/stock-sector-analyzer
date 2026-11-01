# 🔧 Troubleshooting - Stock Sector Analyzer

## Problema: Pantalla en Blanco en localhost:3000

### ✅ SOLUCIONADO (2026-11-01)

**Problema**: Vite estaba configurado para buscar `index.html` en la raíz del proyecto, pero los archivos estaban en `public/`

**Solución Aplicada**: 
- Actualizar `vite.config.ts` con `root: 'public'`
- Vite ahora sirve desde el directorio correcto

**Verificación**:
```bash
# 1. Asegúrate de estar en el directorio correcto
cd ~/Claude/Proyects/stock-sector-analyzer

# 2. Si el servidor ya está corriendo, detenlo
pkill -f vite

# 3. Inicia el servidor nuevamente
npm run dev

# 4. Abre en navegador
# http://localhost:3000
```

**Resultado esperado**:
- ✅ Pantalla de inicio con 3 botones (🇺🇸 🇧🇷 🇲🇽)
- ✅ Título: "Stock Sector Analyzer"
- ✅ Colores oscuros (tema dark)

---

## Otros Problemas Comunes

### Problema: "Port 3000 is already in use"

**Solución**:
```bash
# Matar proceso que usa el puerto 3000
lsof -ti:3000 | xargs kill -9

# O usar otro puerto
npm run dev -- --port 3001
```

### Problema: Data no carga (blank cards)

**Solución**:
```bash
# Verificar que data.json existe
ls -la public/data.json

# Refrescar manualmente en el navegador
# Ctrl+F5 (o Cmd+Shift+R en Mac)
```

### Problema: Service Worker no registra

**Solución**:
```bash
# Verificar en DevTools:
# 1. F12 → Application → Service Workers
# 2. Si no aparece:
#    - Verificar console por errores
#    - Clear all site data
#    - Refrescar página

# En producción (no en dev):
# Service workers solo funcionan en HTTPS
```

### Problema: Tests no corren

**Solución**:
```bash
# Instalar dependencias nuevamente
npm install

# Ejecutar tests
npm test

# Si sigue fallando:
npm run type-check
```

---

## Verificación Completa

```bash
# 1. Clonar repo (si es nuevo)
cd ~/Claude/Proyects/stock-sector-analyzer

# 2. Instalar dependencias
npm install

# 3. Iniciar servidor
npm run dev
# Debería ver: ✓ vite v5.x.x ready in XXX ms
#            ➜ Local:   http://localhost:3000/

# 4. Verificar en navegador
# http://localhost:3000

# 5. Ejecutar tests
npm test
# Debería ver: ✓ 52 passed

# 6. Build para producción
npm run build
# Debería crear carpeta 'dist'
```

---

## Debug Avanzado

### Revisar logs de Vite
```bash
# En la terminal donde corre npm run dev
# Debería ver logs como:
# [vite] rendering initial html
# ✓ dependencies pre-bundled
```

### Revisar DevTools (F12)
```
1. Network tab:
   - http://localhost:3000 → Status 200
   - data.json → Status 200
   - db-manager.js → Status 200

2. Console tab:
   - No debe haber errores rojos
   - Debe ver: "[App] Service Worker registered"

3. Application tab:
   - Manifest: ✅ Presente
   - Service Worker: ✅ Registered
   - Local Storage / IndexedDB: Datos guardados
```

### Probar endpoint de datos
```bash
curl http://localhost:3000/data.json | head -50
# Debe retornar JSON con empresas
```

---

## Configuración Final (Después de Fix)

`vite.config.ts` debe tener:
```typescript
root: 'public',  // ← IMPORTANTE
server: {
  port: 3000,
  fs: {
    allow: ['..']  // ← Permite acceso a archivos fuera de public/
  }
}
```

---

## Reportar Problemas

Si encontras otro problema:
1. Revisa logs de la terminal
2. Abre DevTools (F12) → Console
3. Copia los mensajes de error
4. Incluye:
   - Output de `npm run dev`
   - Console errors
   - Network tab screenshot

---

**Última actualización**: 2026-11-01  
**Status**: ✅ Pantalla en blanco SOLUCIONADO
