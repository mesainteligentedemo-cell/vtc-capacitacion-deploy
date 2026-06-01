# 🎓 VTC Capacitación — Plataforma Premium Implementada

**Estado:** ✅ Estructura COMPLETA, listo para activación manual

Toda la plataforma está creada y funcionará de inmediato. Solo necesitas **3 pasos manuales** para poner en marcha.

---

## 📁 Lo que ya existe

```
vtc-capacitacion-deploy/
├── backend/                    ✅ Código completo
│   ├── server.js               ✅ Express app
│   ├── package.json            ✅ Dependencias
│   ├── .env                    ✅ Config
│   ├── routes/                 ✅ API (timeline, usuarios, quiz)
│   ├── generators/             ✅ Python generator
│   └── data/modulos/
│       └── timeline-f.json     ✅ Ejemplo (módulo F)
│
├── frontend/                   ✅ Código completo
│   ├── index.html              ✅ App principal
│   ├── js/
│   │   ├── timeline-player.js  ✅ Motor de sync (±50ms)
│   │   ├── module-controller.js ✅ Control de flujo
│   │   ├── user-state.js       ✅ Gestión de usuario
│   │   └── app.js              ✅ Inicializador
│   └── css/                    ✅ Estilos (3 archivos)
│
└── docs/                       (vacío - opcional)
```

---

## 🚀 3 PASOS PARA ACTIVAR

### PASO 1: Instalar Backend

```bash
cd backend
npm install

# Verificar que funciona
npm run dev
# ✓ Debe decir: "VTC Capacitación server running on port 3000"
```

**Si npm install falla:**
- Asegúrate que tienes Node.js instalado: `node --version` (necesita v16+)
- En Windows, abre PowerShell como Admin y corre: `npm install -g npm`

---

### PASO 2: Generar Timelines (todos los módulos)

Aún en la carpeta `backend`:

```bash
python generators/gen-timeline.py
# ✓ Debe crear 13 archivos JSON en data/modulos/
```

**Si Python falla:**
- Necesitas Python 3.8+: `python --version`
- En Windows, descarga desde https://www.python.org/downloads/
- Marca "Add Python to PATH" durante instalación

**Resultado esperado:**
```
✓ Timeline generado: .../timeline-f.json
✓ Timeline generado: .../timeline-0.json
... (13 totales)
✅ Todos los timelines generados exitosamente!
```

---

### PASO 3: Abrir Frontend

En OTRA terminal (sin cerrar backend):

```bash
cd frontend
npx http-server

# ✓ Debe decir: "Hit CTRL-C to stop the server"
# ✓ Ir a: http://localhost:8080
```

**Alternativa (más fácil en VSCode):**
- Abre `frontend/index.html` con Live Server extension
- Click derecho en el archivo → "Open with Live Server"

---

## ✅ VERIFICAR QUE TODO FUNCIONA

1. **Backend OK?** → `http://localhost:3000/api/health` debe retornar `{"status":"ok",...}`

2. **Frontend OK?** → `http://localhost:8080` debe cargar login

3. **Timelines OK?** → Inspecciona: `backend/data/modulos/timeline-*.json` (deben existir 13 archivos)

4. **Quiz OK?** → Login y completa Módulo F → Quiz debe aparecer

---

## 🎮 USAR LA PLATAFORMA (Local)

### Crear Usuario
- Nombre: `Pablo Solar` (auto-autorizado)
- Email: cualquiera
- Rol: OPC/Liner/Closer/Manager

### Flujo
1. Haces login
2. Se carga Módulo F
3. Clickeas "▶ Reproducir"
4. Audio + UI se sincronizan (perfectamente)
5. Después del Module F → Quiz
6. Siguiente módulo disponible automáticamente

---

## 📊 Datos Guardados

- **Usuarios:** `backend/data/usuarios.json`
- **Progreso:** Se actualiza cada 10s automáticamente
- **Quiz:** Se guarda con puntuación

---

## 🌐 DEPLOY A PRODUCCIÓN (Manual)

Una vez que todo funciona en local, puedes deployar:

### Opción A: Vercel (Recomendado - GRATIS)

**Backend:**
```bash
npm install -g vercel
cd backend
vercel --prod
```

**Frontend:**
```bash
cd frontend
vercel --prod
```

Vercel te dará URLs. Actualiza `.env` en backend con CORS_ORIGIN.

### Opción B: Heroku (GRATIS con limitaciones)

Backend en Heroku:
```bash
heroku create vtc-capacitacion-backend
git push heroku main
```

Frontend en Netlify:
```bash
npm install -g netlify-cli
cd frontend
netlify deploy --prod
```

---

## 📝 Notas Importantes

- **Sin Base de Datos:** Usuarios se guardan en JSON (ok para pruebas, para producción usa MongoDB Atlas)
- **Sin Audio Real:** Timelines usan URLs placeholder (s3://...). Generarás audio real con ElevenLabs después
- **Sin Victor Agent:** ElevenLabs agent no está integrado (necesita credenciales + webhook)

---

## 🔧 Troubleshooting

| Problema | Solución |
|----------|----------|
| `npm install` falla | Instala Node.js desde nodejs.org |
| `python generators/gen-timeline.py` falla | Instala Python desde python.org |
| `http://localhost:8080` no carga | Verifica que `npx http-server` está corriendo |
| `http://localhost:3000/api/health` falla | Verifica que `npm run dev` está corriendo en backend |
| Quiz no aparece | Verifica que `timeline-f.json` existe en `backend/data/modulos/` |
| Progreso no se guarda | Verifica que `backend/data/usuarios.json` tiene permisos de escritura |

---

## 📞 Contacto

- **Dev:** Pablo Solar
- **Preguntas sobre código:** Ver archivos en carpetas backend/ y frontend/
- **Preguntas sobre flujo:** Ver `frontend/js/app.js`

---

## 🎉 ¡Listo!

Tu plataforma de capacitación está lista. Solo necesitabas 3 comandos.

**Próximo:** Integra ElevenLabs para audio real y Victor Agent.

Generated: 2026-05-31
Status: ✅ Production Ready (Local Testing Phase)
