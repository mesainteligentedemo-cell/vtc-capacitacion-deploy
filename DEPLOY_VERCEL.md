# 🚀 DEPLOY A VERCEL — Instrucciones Paso a Paso

Tu plataforma VTC Capacitación está lista para publicar en internet. Aquí están los pasos **exactos**.

---

## ✅ PASO 1: Login en Vercel (UNA SOLA VEZ)

En PowerShell, ejecuta:

```powershell
vercel login
```

Esto abrirá un navegador. Elige:
- **Opción 1:** Crear cuenta con email
- **Opción 2:** Login con GitHub (recomendado)

Confirma el acceso y vuelve a PowerShell (debería decir ✅ Success).

---

## 🚀 PASO 2: Deploy Backend (Node.js API)

```powershell
cd C:\Users\inbou\vtc-capacitacion-deploy\backend
vercel --prod --yes
```

**Resultado esperado:**

```
> Production deployment
> https://vtc-capacitacion-backend.vercel.app [Ready] [2s]
> Environment variables added ✓
```

**GUARDA ESTA URL:** `https://vtc-capacitacion-backend.vercel.app`

---

## 🌐 PASO 3: Deploy Frontend (HTML + CSS + JS)

```powershell
cd C:\Users\inbou\vtc-capacitacion-deploy\frontend
vercel --prod --yes
```

**Resultado esperado:**

```
> Production deployment
> https://vtc-capacitacion-frontend.vercel.app [Ready] [1s]
```

**GUARDA ESTA URL:** `https://vtc-capacitacion-frontend.vercel.app`

---

## ⚙️ PASO 4: Actualizar CORS en Backend

Ahora necesitas decirle al backend dónde está el frontend.

En PowerShell:

```powershell
cd C:\Users\inbou\vtc-capacitacion-deploy\backend
vercel env add CORS_ORIGIN
```

Pega:
```
https://vtc-capacitacion-frontend.vercel.app
```

Presiona Enter. Luego:

```powershell
vercel --prod --yes
```

(Esto redeploya el backend con la nueva URL de CORS)

---

## ✅ PASO 5: Actualizar URL de API en Frontend

En VSCode, abre:

```
C:\Users\inbou\vtc-capacitacion-deploy\frontend\js\app.js
```

Busca esta línea (debería estar cerca del inicio):

```javascript
const API_BASE = 'http://localhost:3000';
```

Reemplaza con:

```javascript
const API_BASE = 'https://vtc-capacitacion-backend.vercel.app';
```

Guarda el archivo (Ctrl+S).

---

## 🔄 PASO 6: Redeploy Frontend (con la URL correcta)

```powershell
cd C:\Users\inbou\vtc-capacitacion-deploy\frontend
vercel --prod --yes
```

---

## 🎉 ¡LISTO!

Tu plataforma está VIVA en internet:

### URLs Finales:

- **Plataforma Web:** https://vtc-capacitacion-frontend.vercel.app
- **API Backend:** https://vtc-capacitacion-backend.vercel.app/api/health

### Para probar:

1. Abre: https://vtc-capacitacion-frontend.vercel.app
2. Login:
   - Nombre: `Pablo Solar`
   - Email: `test@test.com`
   - Rol: `OPC`
3. Clickea "Iniciar Capacitación"
4. Completa Módulo F
5. Responde Quiz

---

## 🔗 Compartir con otros:

Ahora puedes enviar el link:

```
https://vtc-capacitacion-frontend.vercel.app
```

A cualquiera, y funcionará desde cualquier dispositivo/navegador.

---

## 📝 Notas Importantes

- **Los cambios en código local no aparecen automáticamente.** Cada vez que modifiques algo, necesitas redeploy:
  ```powershell
  vercel --prod --yes
  ```

- **Los datos de usuarios se guardan en JSON local** (backend/data/usuarios.json). Para producción, deberías conectar MongoDB Atlas.

- **El audio es placeholder.** Puedes generar audio real con ElevenLabs después.

---

## ✨ Próximos pasos (Opcionales)

1. Generar audio real con ElevenLabs
2. Integrar ElevenLabs Agent Victor
3. Conectar MongoDB Atlas para datos persistentes
4. Crear dominio custom (victor-ia.com/vtc)

---

**¿Necesitas ayuda?** Todos estos pasos son simples. Solo ejecuta los comandos exactos en PowerShell.

Creado: 2026-05-31
