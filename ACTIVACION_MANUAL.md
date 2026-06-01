# 🚀 MANUAL DE ACTIVACIÓN — VTC Capacitación

**Tiempo total:** 10 minutos (si todo está instalado)

---

## ✅ CHECKLIST PREVIO

- [ ] Node.js v16+ instalado: `node --version`
- [ ] npm v7+ instalado: `npm --version`
- [ ] Python 3.8+ instalado: `python --version`
- [ ] Carpeta `vtc-capacitacion-deploy` existe y está en: `C:\Users\inbou\`

---

## ACTIVACIÓN PASO A PASO

### PASO 1: Instalar Dependencias Backend (2 min)

**Terminal 1 (PowerShell):**

```powershell
cd C:\Users\inbou\vtc-capacitacion-deploy\backend
npm install
```

**Resultado esperado:**
```
npm notice
added 57 packages, and audited 58 packages in 15s
```

---

### PASO 2: Generar Todos los Timelines (1 min)

**Aún en Terminal 1:**

```powershell
python generators/gen-timeline.py
```

**Resultado esperado:**
```
🚀 Generando timelines para VTC Capacitación...

📦 Procesando módulo F...
✓ Timeline generado: ...timeline-f.json
  - Bloques: 3
  - Duración total: 487.5s

... (módulos 0 a 12)

✅ Todos los timelines generados exitosamente!
📁 Archivos guardados en: .../backend/data/modulos
```

**Verificar que existen:**
```powershell
ls backend/data/modulos/
```

Debe mostrar: `timeline-f.json`, `timeline-0.json`, ..., `timeline-12.json` (13 archivos)

---

### PASO 3: Iniciar Backend (1 min)

**Terminal 1:**

```powershell
npm run dev
```

**Resultado esperado:**
```
[nodemon] 2.0.20
[nodemon] to restart at any time, type rs
[nodemon] watching path(s): *.*
[nodemon] watching extensions: js,json
✓ VTC Capacitación server running on port 3000
✓ Environment: development
✓ CORS enabled for: http://localhost:3000,http://localhost:8080,http://localhost:5500
```

**⚠️ NO cierres esta terminal. Déjala corriendo.**

---

### PASO 4: Abrir Frontend (2 min)

**Terminal 2 NUEVA (PowerShell):**

```powershell
cd C:\Users\inbou\vtc-capacitacion-deploy\frontend
npx http-server
```

**Resultado esperado:**
```
Starting up http-server, serving .
Hit CTRL-C to stop the server

   http://127.0.0.1:8080
   http://192.168.1.x:8080

Press CTRL-C to stop the server
```

---

### PASO 5: Abrir en Navegador (1 min)

Abre tu navegador en:

```
http://localhost:8080
```

**Resultado esperado:**
- ✅ Página carga sin errores
- ✅ Ves form de login
- ✅ Página dice "VTC Capacitación"

---

## 🎮 PRUEBA RÁPIDA (3 min)

### 5.1 Crear Usuario

En el formulario de login:
- **Nombre:** `Pablo Solar` (acceso automático)
- **Email:** `test@test.com`
- **Rol:** OPC

Click en "Iniciar Capacitación"

**Resultado esperado:**
- ✅ Login desaparece
- ✅ Ves "Módulo: Fundamentos del Negocio VTC"
- ✅ Botón "▶ Reproducir" visible

### 5.2 Reproducir Módulo

Click en "▶ Reproducir"

**Resultado esperado:**
- ✅ Botón cambia a "⏸ Pausa"
- ✅ Timer muestra: "0:01 / 8:07"
- ✅ Primer bloque ("Por qué este módulo existe") está highlighted

### 5.3 Avanzar en Timeline

Espera 5 segundos (o click en slider para avanzar a 20s)

**Resultado esperado:**
- ✅ Primer bloque se resalta en dorado
- ✅ Siguiente bloque aparece
- ✅ Audio sigue corriendo

### 5.4 Completar Módulo

Click en slider y arrastra hasta el final (cerca de 8:00)

**Resultado esperado:**
- ✅ Quiz section aparece
- ✅ Dos preguntas visibles

### 5.5 Responder Quiz

Selecciona respuestas (cualquiera) y click "Enviar Respuestas"

**Resultado esperado:**
- ✅ Respuestas se marcan como correctas/incorrectas
- ✅ Feedback aparece debajo
- ✅ Botón "Siguiente Módulo →" aparece

---

## ✅ VERIFICACIÓN FINAL

Si llegaste aquí y todo funciona → **¡Tu plataforma está LISTA!**

**Checklist final:**
- [ ] Backend corriendo en Terminal 1 (puerto 3000)
- [ ] Frontend corriendo en Terminal 2 (puerto 8080)
- [ ] Login funciona
- [ ] Módulo F carga
- [ ] Audio reproduce
- [ ] Quiz aparece
- [ ] Botones navegan

---

## 🚨 SI ALGO FALLA

### Backend no inicia

**Error:** `Port 3000 already in use`
```powershell
# En Terminal 1, presiona CTRL+C para detener
# Luego corre:
npm run dev
```

**Error:** `Cannot find module 'express'`
```powershell
npm install
npm run dev
```

### Frontend no carga

**Error:** `Localhost:8080 no responde`
```powershell
# Verifica que Terminal 2 está corriendo
# Si no, corre:
npx http-server
```

### Python script falla

**Error:** `python: command not found`
```powershell
# Instala Python desde: https://www.python.org/downloads/
# Marca "Add Python to PATH"
# Luego reinicia PowerShell y corre:
python generators/gen-timeline.py
```

### Quiz no aparece

```powershell
# En Terminal 1, verifica que existen timelines:
ls backend/data/modulos/
# Debe mostrar 13 archivos (timeline-f.json, etc.)

# Si faltan, corre:
python generators/gen-timeline.py
```

---

## 🎯 PRÓXIMOS PASOS (Después de activación exitosa)

1. **Generar Audio Real** → ElevenLabs con Victor Voice
2. **Integrar ElevenLabs Agent** → Para responder preguntas
3. **Deploy a Producción** → Vercel o Heroku
4. **Conectar MongoDB** → Para persistencia real
5. **Agregar todos los módulos de contenido** → Completar RAG

---

## 📞 SOPORTE

Si algo no funciona:
1. Lee el output completo (no solo el último error)
2. Verifica que las dos Terminales están corriendo
3. Intenta cerrar y abrir de nuevo
4. Restart de PowerShell puede ayudar

---

**Creado:** 2026-05-31  
**Status:** ✅ Listo para activación  
**Tiempo estimado:** 10 minutos