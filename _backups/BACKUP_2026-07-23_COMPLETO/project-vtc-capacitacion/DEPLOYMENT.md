# DEPLOYMENT.md — VTC Capacitación (Victor IA)

**Proyecto:** VTC Capacitación — Plataforma de entrenamiento de ventas timeshare con Victor IA (ElevenLabs Conversational Agent)
**Versión:** 1.0.0
**Última actualización:** 2026-06-02
**Audiencia:** DevOps / Ingeniería de Release
**Host de producción:** Vercel (static frontend + serverless functions en `api/`)

> Guía operativa, ready-to-follow. Cada sección es ejecutable de arriba hacia abajo. Si solo vas a hacer un deploy rutinario, salta directo a la **Sección 3 (Instalación / Deploy)** después de correr el **Checklist (Sección 1)**.

---

## Arquitectura en 30 segundos

```
                        ┌─────────────────────────────────────────┐
                        │              VERCEL (prod)               │
  Navegador ───────────►│  index.html  (frontend estático)        │
  (asesor VTC)          │  styles-optimized.css / victor-avatar    │
       │                │                                          │
       │  widget JS     │  /api/*  (Serverless Functions, Node 18) │
       └───────────────►│   ├─ history.js   (memoria entre sesiones)│
                        │   ├─ transcript.js / report.js            │
                        │   ├─ audio.js                             │
                        │   ├─ pdf.js + _render.js (Chromium/PDF)   │
                        │   └─ heatmap-png.js                       │
                        └───────────────┬──────────────────────────┘
                                        │  xi-api-key
                                        ▼
                    ┌───────────────────────────────────────┐
                    │  ElevenLabs Conversational AI           │
                    │  Agent: agent_0301ksvvm534ezwtraqfg0jyhwem│
                    │  (Victor IA — prompt + knowledge base)   │
                    └───────────────────────────────────────┘
```

- **Frontend:** `index.html` (HTML/CSS/Vanilla JS, sin framework). Servido como estático.
- **Serverless API:** carpeta `api/` → cada `*.js` (sin prefijo `_`) es un endpoint Vercel `/api/<archivo>`. Los archivos con prefijo `_` (`_render.js`, `_chat.js`, etc.) son helpers internos, NO endpoints.
- **Backend Express opcional:** carpeta `backend/` (Express + Mongoose). NO se usa en el deploy de Vercel actual; es para entorno self-hosted / futuro MongoDB. Documentado en Sección 2.
- **Voz/IA:** ElevenLabs Conversational Agent. El widget se embebe en `index.html` y se comunica con el agente; los endpoints `api/history.js` y `api/report.js` consumen la API REST de ElevenLabs para memoria y reportes.

---

## 1. Checklist Pre-Deployment

Marca TODO antes de promover a producción. Si una casilla falla, NO continúes.

### 1.1 Código y repo
- [ ] Estás en la rama correcta (`master`) y `git status` está limpio.
- [ ] `git pull` hecho; sin conflictos pendientes.
- [ ] El último commit corresponde al cambio que quieres desplegar (`git log --oneline -3`).
- [ ] `index.html` abre sin errores de consola en local (ver Sección 6.1).
- [ ] No hay credenciales hardcodeadas nuevas en el diff (`git diff HEAD~1 | findstr /I "sk_ api-key xi-api-key apikey"` debe salir vacío salvo placeholders).

### 1.2 Configuración
- [ ] `vercel.json` presente y válido (función `api/pdf.js`: `maxDuration: 60`, `memory: 1536`).
- [ ] `package.json` raíz tiene las deps de las funciones (`@sparticuz/chromium`, `puppeteer-core`).
- [ ] Variables de entorno cargadas en Vercel (ver Sección 4): `ELEVENLABS_API_KEY`, `OPENROUTER_API_KEY`.
- [ ] `.gitignore` ignora `.vercel` (confirmado) — no se sube token OIDC ni `.env`.

### 1.3 ElevenLabs
- [ ] Agent ID correcto: `agent_0301ksvvm534ezwtraqfg0jyhwem` (archivo `_agent_id.txt`).
- [ ] `ELEVENLABS_AGENT_PROMPT.md` es la versión vigente y está aplicado al agente (ver Sección 5).
- [ ] Knowledge base sincronizada (módulos F + 0–12).
- [ ] Restricción de roleplay activa: máximo 3 voces (Victor + 2). Familias prohibidas. (Ver `GUIA_ROLEPLAY_VOCES.md`).

### 1.4 Contenido / Assets
- [ ] Todos los videos en `videos/` cargan y tienen poster.
- [ ] `victor-avatar.png` presente.
- [ ] No hay dos escenas/módulos con el mismo `src` de video.

### 1.5 Aprobación
- [ ] `STAGING_VALIDATION_CHECKLIST.md` firmado.
- [ ] `AUDITORIA_FINAL.md` sin issues bloqueantes abiertos.
- [ ] Ventana de despliegue acordada (evitar horario de capacitación en vivo).

---

## 2. Requisitos de Servidor

### 2.1 Deploy en Vercel (modo recomendado / actual)
No administras servidor: Vercel provee el runtime. Solo necesitas:

| Requisito | Valor |
|---|---|
| Cuenta Vercel | Team `victor-ia` (plan **Pro** — requerido por `memory: 1536` y `maxDuration: 60`) |
| Vercel CLI | `vercel` v37+ (`npm i -g vercel`) |
| Node local | 18.x o 20.x (para CLI y build) |
| Git | 2.30+ |
| Runtime de funciones | Node.js 18 (default de Vercel) |

> El plan **Pro** es obligatorio: `api/pdf.js` reserva 1536 MB y 60 s. En plan Hobby el deploy falla por límites de memoria/duración.

### 2.2 Self-hosted del backend Express (opcional / futuro)
Solo si despliegas `backend/` por separado (no necesario para el flujo Vercel):

| Requisito | Mínimo | Recomendado |
|---|---|---|
| OS | Linux (Ubuntu 22.04) o Windows Server | Ubuntu 22.04 LTS |
| Node.js | 18.x | 20.x LTS |
| RAM | 512 MB | 1 GB |
| CPU | 1 vCPU | 2 vCPU |
| Disco | 2 GB | 5 GB |
| MongoDB | 5.0+ (opcional) | 7.0 |
| Puerto | 3000 (configurable vía `PORT`) | detrás de Nginx/reverse proxy + TLS |
| Process manager | — | PM2 o systemd |

### 2.3 Navegadores soportados (cliente final)
Chrome/Edge 100+, Firefox 100+, Safari 15+. Requiere micrófono habilitado (el widget de voz usa WebRTC/getUserMedia → exige **HTTPS**).

---

## 3. Instalación Paso a Paso

### 3.1 Deploy a producción en Vercel (ruta normal)

```powershell
# 1. Clonar o entrar al proyecto
cd C:\Users\inbou\vtc-capacitacion-deploy

# 2. Asegurar rama y estado limpio
git checkout master
git pull
git status            # debe estar limpio

# 3. Instalar dependencias de las funciones serverless
npm install           # instala @sparticuz/chromium y puppeteer-core

# 4. Login en Vercel (una sola vez)
vercel login

# 5. Vincular el proyecto (una sola vez; usa el proyecto existente, NO crear uno nuevo)
vercel link           # Team: victor-ia  →  Project: vtc-capacitacion / victor-ia-training

# 6. Configurar variables de entorno (ver Sección 4) ANTES del primer deploy

# 7. Deploy de PREVIEW (verificación previa, NO toca prod)
vercel

# 8. Validar la URL de preview (Sección 6)
#    Si todo OK:

# 9. Deploy a PRODUCCIÓN
vercel --prod
```

Vercel imprime la URL final (ej. `https://vtc-capacitacion.vercel.app`). Guárdala para la verificación.

### 3.2 Deploy automático vía Git (alternativa CI/CD)
Si el repo está conectado a Vercel:
1. `git push origin master` → Vercel dispara build automático de producción.
2. Cada PR / push a otra rama genera un **Preview Deployment** automático.
3. Las env vars se toman del dashboard de Vercel (no del local).

### 3.3 Levantar el backend Express (solo self-hosted opcional)

```powershell
cd C:\Users\inbou\vtc-capacitacion-deploy\backend
npm install
# crear .env (ver 4.3)
npm start                 # producción → node server.js
# o
npm run dev               # desarrollo → nodemon
```
Salud: `GET http://localhost:3000/api/health` debe responder `{"status":"ok",...}`.

### 3.4 Probar el frontend en local (sin deploy)

```powershell
cd C:\Users\inbou\vtc-capacitacion-deploy
# Servidor estático rápido para abrir index.html con un servidor real (no file://)
npx serve .              # o:  python -m http.server 8080
# Abrir http://localhost:8080 (o el puerto que indique)
```
> No abras `index.html` con `file://`: el micrófono y los `fetch` a `/api/*` fallan. Usa siempre un servidor HTTP.

---

## 4. Configuración de Variables de Entorno

### 4.1 Variables usadas por las funciones serverless (`api/`)

| Variable | Requerida | Usada en | Descripción |
|---|---|---|---|
| `ELEVENLABS_API_KEY` | **Sí** | `history.js`, `transcript.js`, `report.js`, `audio.js` | API key de ElevenLabs (header `xi-api-key`). Memoria entre sesiones, reportes, audio. |
| `OPENROUTER_API_KEY` | Sí (si se usa análisis) | `_analyze.js` | API key de OpenRouter para análisis/resúmenes de conversación. |

> Si `ELEVENLABS_API_KEY` falta, `api/history.js` degrada con elegancia y devuelve `{found:false}` (trata al asesor como primera sesión). No tumba el sitio, pero pierdes memoria y reportes — configúrala siempre en prod.

### 4.2 Configurar env vars en Vercel

**Vía CLI (recomendado):**
```powershell
cd C:\Users\inbou\vtc-capacitacion-deploy
vercel env add ELEVENLABS_API_KEY production
# pega el valor cuando lo pida
vercel env add OPENROUTER_API_KEY production
# repetir para 'preview' si quieres que los previews funcionen completos:
vercel env add ELEVENLABS_API_KEY preview
```

**Vía Dashboard:**
Project → **Settings → Environment Variables** → Add → nombre, valor, scope (`Production` / `Preview` / `Development`) → Save → **re-deploy** (las env vars solo aplican en builds nuevos).

> La key de ElevenLabs del entorno está documentada en las instrucciones internas del proyecto (no se incluye literal en este archivo por seguridad). NO la comitees al repo.

### 4.3 `.env` del backend Express (solo self-hosted)

Archivo `backend/.env`:
```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://localhost:27017/vtc-capacitacion
CORS_ORIGIN=https://vtc-capacitacion.vercel.app
```
> En `server.js` el CORS de producción debe incluir el dominio real del frontend. Hoy el origin permitido incluye `https://frontend-victor-ia.vercel.app` y `localhost`. Ajusta la lista a tu dominio de prod antes de exponer el backend.

### 4.4 Higiene de secretos
- `.gitignore` ya excluye `.vercel` y `.env` — verifícalo: `git check-ignore .vercel backend/.env`.
- NUNCA subir `.env.local` con `VERCEL_OIDC_TOKEN`.
- Rota `ELEVENLABS_API_KEY` si aparece en un log o commit. Tras rotar: `vercel env rm` + `vercel env add` + re-deploy.

---

## 5. Configuración del ElevenLabs Agent

**Agent ID:** `agent_0301ksvvm534ezwtraqfg0jyhwem` (fuente de verdad: `_agent_id.txt`)

### 5.1 Aplicar / actualizar el prompt
1. La versión vigente vive en `ELEVENLABS_AGENT_PROMPT.md`.
2. Aplicarla al agente:
   - **Dashboard:** ElevenLabs → Conversational AI → selecciona el agente → **System Prompt** → pega el contenido de `ELEVENLABS_AGENT_PROMPT.md` → Save.
   - **Programático:** existe `_apply_prompt.py` en el repo para empujar el prompt vía API (`PATCH /v1/convai/agents/{id}`). Requiere `ELEVENLABS_API_KEY` en el entorno.
3. Verifica que quedó guardado (recarga el dashboard y compara el inicio del prompt).

### 5.2 Reglas no negociables del agente (validar tras cada cambio)
- **Voces:** máximo **3 simultáneas** (Victor + 2 clientes). **Familias (4+ voces) PROHIBIDAS.** Solo singles (2 voces) y parejas (3 voces). Ref: `GUIA_ROLEPLAY_VOCES.md`.
- **Aislamiento de audio:** una sola voz por acción; 200–300 ms de silencio entre voces; sin solapamiento.
- **Flujo del curso:** secuencial (Hero → Video → Post-video → Módulos). Victor NO menciona que reproduce el video; pausa mientras el video corre y reanuda en `onEnded`.
- **Scroll:** Victor no hace scroll mientras habla; confirma módulo antes de avanzar.

### 5.3 Knowledge base
- Contenido fuente: `CONTENIDO_MODULOS_RAG.md`, `_course_knowledge.md`, `_course_content.md`.
- Si actualizaste contenido de módulos, re-sube el knowledge al agente y prueba una pregunta por módulo.

### 5.4 Memoria entre sesiones
- La maneja `api/history.js`, que consulta `GET /v1/convai/conversations` filtrando por `employee_number`.
- **Importante:** `api/history.js` tiene su propio agente hardcodeado en la constante `AGENT` (`agent_9501k3vkt6svekjs6y0qe5xzcek1`). Si cambias de agente productivo, **actualiza esa constante** o la memoria buscará en el agente equivocado. (Discrepancia conocida con `_agent_id.txt` — confirmar cuál es el agente de prod antes de release.)
- Webhook post-llamada: ver `_n8n_postcall.json` (flujo n8n que procesa la conversación al terminar).

### 5.5 Data collection (para reportes)
El agente debe poblar estos campos de `data_collection` (los lee `history.js`/`report.js`): `employee_number`, `user_name`, `modulos_practicados`, `fortalezas`, `areas_mejora`, `recomendacion_siguiente`, `escenario_roleplay`, `desempeno_score`. Configúralos en el agente (Analysis → Data Collection).

---

## 6. Verificación Post-Deployment (Smoke Tests)

Ejecutar en la URL de producción inmediatamente tras `vercel --prod`.

### 6.1 Frontend
- [ ] La home carga; **0 errores rojos** en consola (F12 → Console).
- [ ] Todos los módulos (F, 0–12) se renderizan.
- [ ] Videos cargan con poster; reproducen sin error 404.
- [ ] Responsive OK en 1920 / 768 / 375 px.
- [ ] El widget de voz de Victor aparece y pide permiso de micrófono (requiere HTTPS).

### 6.2 Endpoints serverless
```powershell
# Memoria (debe devolver JSON, found:true|false, nunca 500)
curl "https://<TU-DOMINIO>/api/history?emp=12345"

# PDF (genera un PDF real)
curl -X POST "https://<TU-DOMINIO>/api/pdf" -H "Content-Type: application/json" -d "{\"html\":\"<h1>Test VTC</h1>\"}" --output test.pdf
# Verifica que test.pdf abre y pesa > 0 bytes

# Reporte / transcript (según tu flujo)
curl "https://<TU-DOMINIO>/api/report?..."
```
- [ ] `/api/history` responde 200 con JSON.
- [ ] `/api/pdf` devuelve un PDF válido (no JSON de error).
- [ ] Las funciones que usan ElevenLabs NO devuelven "Sin acceso a memoria" (eso indica env var faltante).

### 6.3 ElevenLabs end-to-end
- [ ] Iniciar conversación con Victor desde la web.
- [ ] Pedir "iniciar el curso de capacitación" → Victor lee Hero → invita al video → pausa → reanuda post-video.
- [ ] Roleplay de pareja (3 voces) funciona; intentar familia (4 voces) → Victor lo rechaza.
- [ ] Al cerrar la sesión, una segunda llamada con el mismo `employee_number` recupera el resumen previo (memoria).

### 6.4 Sign-off
- [ ] Las 4 sub-secciones anteriores en verde → marcar release como **LIVE**.
- [ ] Anotar URL, commit hash y hora en `punto-de-parada.md`.

---

## 7. Monitoreo y Logs

### 7.1 Logs en Vercel
```powershell
# Stream de logs en vivo (runtime de funciones)
vercel logs <deployment-url> --follow

# Logs de un deployment específico
vercel logs <deployment-url>
```
- **Dashboard:** Project → **Deployments** → seleccionar deploy → **Functions** / **Runtime Logs**. Filtra por `/api/pdf`, `/api/history`, etc.
- **Build logs:** mismo deploy → pestaña **Building** (errores de `npm install`, deps de Chromium).

### 7.2 Qué vigilar
| Señal | Dónde | Umbral / acción |
|---|---|---|
| Errores 500 en `/api/*` | Runtime Logs | Cualquier 500 recurrente → investigar (Sección 8) |
| Duración de `/api/pdf` | Function metrics | Cerca de 60 s → optimizar HTML o subir timeout |
| Memoria de `/api/pdf` | Function metrics | Cerca de 1536 MB → reducir tamaño del render |
| "Sin acceso a memoria" en respuestas | App / logs | Falta `ELEVENLABS_API_KEY` → reconfigurar env |
| Conversaciones ElevenLabs | Dashboard ElevenLabs → Conversations | Revisar transcripts, latencia, success rate |
| Errores de cliente (consola) | Reportes de usuarios / Sentry (si se añade) | Picos tras un deploy → considerar rollback |

### 7.3 Health checks
- **Frontend:** ping a la home (200 OK).
- **API:** `GET /api/history?emp=ping` debe devolver 200 con JSON.
- **Backend Express (si aplica):** `GET /api/health` → `{"status":"ok"}`.
- Configurar un monitor externo (UptimeRobot / Better Stack) cada 5 min sobre la home y `/api/history`.

### 7.4 ElevenLabs
- Dashboard → Conversational AI → **Conversations**: transcripts, duración, `data_collection_results`, tasa de éxito.
- Vigilar consumo de créditos/caracteres para no agotar el plan a mitad de capacitación.

---

## 8. Troubleshooting

| Síntoma | Causa probable | Solución |
|---|---|---|
| Deploy falla: "exceeded memory/duration limit" | Cuenta no es plan Pro | Subir a Vercel **Pro** (la función PDF exige 1536 MB / 60 s). |
| `/api/pdf` responde 500 | Chromium no se inicializó / deps faltantes | `npm install` localmente, confirmar `@sparticuz/chromium` y `puppeteer-core` en `package.json` raíz; re-deploy. Revisar Runtime Logs. |
| `/api/history` siempre `found:false` | `ELEVENLABS_API_KEY` no configurada en ese scope | `vercel env add ELEVENLABS_API_KEY production` + re-deploy. |
| Memoria busca al asesor y no lo encuentra nunca | `AGENT` hardcodeado en `history.js` ≠ agente de prod | Editar la constante `AGENT` en `api/history.js` para que coincida con el agente productivo. |
| Widget de voz no pide micrófono | Sitio servido por `http://` o `file://` | Servir por **HTTPS** (Vercel ya es HTTPS; en local usa un server HTTP, no `file://`). |
| CORS bloqueado (backend Express) | Dominio del front no está en la lista de `cors()` | Editar `backend/server.js` y agregar el dominio prod a `origin`. |
| Victor habla y reproduce el video al mismo tiempo | Prompt desactualizado | Re-aplicar `ELEVENLABS_AGENT_PROMPT.md` (regla: no menciona video, pausa en reproducción). |
| Roleplay permite familias (4+ voces) | Prompt viejo sin la restricción | Re-aplicar prompt vigente; validar `GUIA_ROLEPLAY_VOCES.md`. |
| Env vars cambiadas pero no surten efecto | No hubo re-deploy | Las env vars solo aplican en builds nuevos → `vercel --prod`. |
| Videos 404 en prod | Assets no incluidos en el deploy | Confirmar que `videos/` se sube (no está en `.gitignore`) y los `src` son rutas relativas correctas. |
| Build OK pero página en blanco | Ruta de assets / rewrite | Revisar `vercel.json` rewrites y rutas de `styles-optimized.css` / scripts. |

**Diagnóstico rápido (orden recomendado):**
1. Consola del navegador (errores JS / 404 / CORS).
2. `vercel logs <url> --follow` mientras reproduces el error.
3. Probar el endpoint aislado con `curl` (Sección 6.2).
4. Confirmar env vars: `vercel env ls`.
5. Revisar `AUDITORIA_FINAL.md` y `DIAGNOSTIC_QUIRURGICO.md` por issues conocidos.

---

## 9. Cómo Hacer Rollback

Vercel guarda todos los deployments previos: el rollback es instantáneo y sin rebuild.

### 9.1 Rollback por Dashboard (más rápido — recomendado en incidente)
1. Vercel → Project → **Deployments**.
2. Localiza el último deployment **bueno** (estado Ready, anterior al incidente).
3. Menú `···` → **Promote to Production** (o **Rollback**).
4. La promoción es inmediata (solo re-apunta el alias de prod). Verifica con Sección 6.

### 9.2 Rollback por CLI
```powershell
# Listar deployments recientes y su URL
vercel ls

# Promover un deployment previo conocido-bueno a producción
vercel promote <deployment-url-buena>
```

### 9.3 Rollback por Git (revertir el código)
```powershell
cd C:\Users\inbou\vtc-capacitacion-deploy
git revert HEAD           # crea un commit que deshace el último cambio
git push origin master    # dispara nuevo deploy con el estado anterior
```
> Prefiere `git revert` sobre `git reset --hard` para conservar historial. Solo usa reset duro si el commit malo no se ha compartido.

### 9.4 Rollback del Agente ElevenLabs
El prompt del agente NO se versiona en Vercel. Para revertirlo:
1. Recupera la versión previa del prompt desde Git (`git show <commit>:ELEVENLABS_AGENT_PROMPT.md`) o desde `ELEVENLABS_AGENT_PROMPT_FINAL.md`.
2. Re-aplícala en el dashboard de ElevenLabs (Sección 5.1).
3. Mantén copias fechadas del prompt en el repo para poder volver atrás.

### 9.5 Checklist post-rollback
- [ ] Smoke tests (Sección 6) en verde sobre la versión restaurada.
- [ ] Incidente documentado (qué falló, commit problemático, hora).
- [ ] Causa raíz identificada antes de re-intentar el deploy.

---

## 10. Performance Expectations

### 10.1 Frontend (objetivos)
| Métrica | Objetivo | Notas |
|---|---|---|
| First Contentful Paint | < 1.5 s | HTML estático servido por CDN de Vercel |
| Largest Contentful Paint | < 2.5 s | Depende de poster de video / avatar |
| Time to Interactive | < 3 s | Vanilla JS, sin framework |
| Peso de `index.html` | ~230 KB | Objetivo de optimización: < 150 KB (CSS/JS minificado) |
| Lighthouse Performance | ≥ 85 | Medir en preview antes de prod |

### 10.2 Serverless / API
| Endpoint | Latencia típica | Límite | Notas |
|---|---|---|---|
| `/api/history` | 0.5–4 s | — | Itera hasta 12 conversaciones de ElevenLabs; latencia dominada por la API externa. |
| `/api/pdf` | 3–15 s (cold start incluido) | 60 s / 1536 MB | Arranca Chromium real; el primer hit tras inactividad es más lento (cold start). |
| `/api/report`, `/api/transcript` | 1–5 s | — | Dependen de ElevenLabs. |
| Cold start de funciones | +1–3 s | — | Tras inactividad. Tráfico constante lo minimiza. |

### 10.3 ElevenLabs (conversación de voz)
| Métrica | Esperado |
|---|---|
| Latencia de respuesta de Victor | ~1–2 s al primer audio |
| Cambio entre voces (roleplay) | < 0.5 s + 200–300 ms de silencio entre voces |
| Voces simultáneas máximas | 3 (Victor + 2) |

### 10.4 Capacidad / concurrencia
- **Frontend estático:** prácticamente ilimitado (CDN de Vercel).
- **Funciones serverless:** escalan automáticamente; el cuello de botella real son los **rate limits y créditos de ElevenLabs/OpenRouter**, no Vercel.
- **Recomendación de carga:** para una cohorte de capacitación (10–100 asesores concurrentes), validar primero el plan/cuota de ElevenLabs. La plataforma web aguanta 100 usuarios concurrentes sin problema; el límite es el proveedor de voz.
- **`/api/pdf`:** evitar ráfagas masivas simultáneas (cada una reserva 1536 MB). Para reportes en lote, encolar o espaciar las llamadas.

---

## Apéndice A — Referencia Rápida de Comandos

```powershell
# Deploy
vercel                      # preview
vercel --prod               # producción
vercel logs <url> --follow  # logs en vivo
vercel env ls               # listar env vars
vercel env add KEY scope    # añadir env var
vercel ls                   # listar deployments
vercel promote <url>        # rollback a un deploy previo

# Local
npx serve .                 # servir frontend en local (HTTP)
cd backend; npm start       # backend Express (opcional)

# Git
git log --oneline -5
git revert HEAD; git push   # rollback por código
```

## Apéndice B — Archivos Clave

| Archivo | Rol |
|---|---|
| `index.html` | Frontend completo (UI + widget de voz) |
| `styles-optimized.css` | Estilos optimizados |
| `vercel.json` | Config de funciones (`api/pdf.js`: 60 s / 1536 MB) |
| `package.json` | Deps serverless (`@sparticuz/chromium`, `puppeteer-core`) |
| `api/history.js` | Memoria entre sesiones (ElevenLabs) |
| `api/pdf.js` + `api/_render.js` | Generación de PDF (Chromium) |
| `api/report.js` / `api/transcript.js` / `api/audio.js` | Reportes, transcripts, audio |
| `_agent_id.txt` | Agent ID de Victor (`agent_0301ksvvm534ezwtraqfg0jyhwem`) |
| `ELEVENLABS_AGENT_PROMPT.md` | Prompt vigente del agente |
| `GUIA_ROLEPLAY_VOCES.md` | Reglas de voces (máx 3, sin familias) |
| `STAGING_VALIDATION_CHECKLIST.md` | Checklist de validación pre-prod |
| `AUDITORIA_FINAL.md` / `DIAGNOSTIC_QUIRURGICO.md` | Issues conocidos |
| `backend/server.js` | Backend Express opcional (self-hosted) |

---

**Notas de seguridad finales**
- Nunca comitear `ELEVENLABS_API_KEY`, `OPENROUTER_API_KEY`, `.env`, `.env.local` ni `VERCEL_OIDC_TOKEN`.
- Confirmar el agente productivo (`_agent_id.txt` vs constante `AGENT` en `history.js`) antes de cada release que toque memoria.
- Tras cualquier rollback, dejar registro en `punto-de-parada.md`.
