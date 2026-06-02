# VTC Capacitación — Plataforma de Entrenamiento Elite

**Victorious Travelers Club** · Capacitación inteligente para asesores de ventas con coach IA, curso guiado por voz y reportes de sesión automáticos.

[![Status](https://img.shields.io/badge/Status-Production-success.svg)](#)
[![Platform](https://img.shields.io/badge/Deploy-Vercel-black.svg)](https://vercel.com)
[![Node](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)](#licencia)

🔗 **Producción:** https://vtc-capacitacion-deploy.vercel.app

---

## 📋 Tabla de Contenidos

1. [Descripción](#1-descripción)
2. [Features](#2-features-principales)
3. [Requisitos](#3-requisitos)
4. [Instalación Local](#4-instalación-local)
5. [Estructura de Archivos](#5-estructura-de-archivos)
6. [Cómo Agregar un Nuevo Módulo](#6-cómo-agregar-un-nuevo-módulo)
7. [Cómo Configurar ElevenLabs](#7-cómo-configurar-elevenlabs)
8. [Variables de Entorno](#8-variables-de-entorno)
9. [Comandos Útiles](#9-comandos-útiles)
10. [Troubleshooting](#10-troubleshooting)
11. [Recursos](#11-links-de-recursos)

---

## 1. Descripción

**VTC Capacitación** es la plataforma de entrenamiento del **Victorious Travelers Club** para asesores de ventas de membresías de viaje (timeshare). Combina un **curso interactivo** en una single-page de lujo (dark + oro) con un **coach de IA por voz ("Víctor")** que guía cada módulo, practica roleplay de ventas y, al terminar la sesión, genera un **reporte de desempeño en PDF** con análisis de IA.

El proyecto resuelve tres cosas:

- **Aprender** — 18 módulos en video (PNL, técnicas de cierre, manejo de objeciones, proceso de venta) con navegación lateral colapsable.
- **Practicar** — el asesor conversa con Víctor (ElevenLabs Conversational AI): el coach explica, hace quizzes y simula clientes difíciles.
- **Medir** — cada conversación se analiza con IA (OpenRouter / Gemini) y se entrega un reporte de sesión (radar de habilidades, score, transcript, plan de mejora) descargable en PDF y enviable por email.

### Arquitectura (alto nivel)

```
Navegador (index.html, estático)
   │  widget de voz ElevenLabs Convai  ──►  api ElevenLabs (conversación + audio)
   │
   ├─► /api/transcript ─► trae la conversación (server-side key)
   ├─► /api/report     ─► analiza con IA (OpenRouter) y arma el reporte
   ├─► /api/pdf        ─► HTML → PDF con Chromium real (Puppeteer)
   └─► /api/audio · /api/history · /api/heatmap-png
```

Hay además un **backend Express opcional** (`backend/`) para servir timelines de módulos, usuarios y quizzes vía API REST — útil para entornos sin Vercel Functions.

---

## 2. Features Principales

| Feature | Detalle |
|---|---|
| 🎓 **18 módulos en video** | PNL, cierre, objeciones, proceso de venta + bonus. Cada módulo con su `.mp4` y poster `.jpg` |
| 🤖 **Coach IA por voz (Víctor)** | Widget de ElevenLabs Conversational AI embebido. Guía, explica y hace roleplay |
| 🧭 **Navegación lateral colapsable** | Índice de módulos fijo, scroll suave, sticky sidebar con chat |
| 🧠 **Análisis IA de la sesión** | Detecta si fue curso guiado / roleplay / consulta y puntúa el desempeño |
| 📊 **Reporte de sesión completo** | Radar de habilidades, score 0-10, sentimiento, transcript, timeline, plan de mejora |
| 📄 **PDF real (no print)** | Render server-side con Chromium (`@sparticuz/chromium` + `puppeteer-core`) |
| 🔊 **Descarga de audio** | MP3 de la conversación vía `/api/audio` |
| 🧾 **Memoria entre sesiones** | `/api/history?emp=` recupera el resumen de la última sesión del asesor |
| 📧 **Plantillas de email** | Reportes HTML responsivos listos para enviar (`email-templates/`) |
| 🔐 **API keys server-side** | Las llaves nunca se exponen al cliente; viven en variables de entorno |

---

## 3. Requisitos

### Sistema

| Componente | Mínimo | Recomendado |
|---|---|---|
| **Node.js** | 18.x | 20.x LTS |
| **npm** | 9.x | 10.x |
| **Python** | 3.8 (solo para generadores de timeline/scripts) | 3.10+ |
| **Vercel CLI** | — | última (`npm i -g vercel`) para deploy |

### Navegadores soportados (frontend)

| Navegador | Versión mínima |
|---|---|
| Chrome / Edge | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Opera | 76+ |

> El widget de voz requiere permiso de micrófono y un navegador moderno con WebRTC. Internet Explorer **no** está soportado.

### Cuentas externas

- **ElevenLabs** — para el coach de voz y el transcript/audio (Conversational AI).
- **OpenRouter** — para el análisis IA del reporte (modelo `google/gemini-2.5-flash`).
- **Vercel** — hosting estático + serverless functions (plan free es suficiente para empezar).

---

## 4. Instalación Local

### Paso 1 — Clonar / abrir el proyecto

```powershell
cd C:\Users\inbou\vtc-capacitacion-deploy
```

### Paso 2 — Instalar dependencias raíz (Puppeteer / Chromium para PDF)

```powershell
npm install
```

> Instala `puppeteer-core` y `@sparticuz/chromium`, usados por `/api/pdf.js`.

### Paso 3 — Servir el frontend estático

El sitio principal es `index.html` en la raíz. Cualquier servidor estático funciona:

```powershell
npx serve .
# o
npx http-server -p 8080
```

Abre `http://localhost:8080`.

### Paso 4 — (Opcional) Probar las serverless functions localmente

Las funciones de `api/` están escritas para el runtime de Vercel. Para probarlas en local:

```powershell
npm install -g vercel
vercel dev
```

Esto levanta el frontend **y** los endpoints `/api/*` en un solo puerto (por defecto `http://localhost:3000`). Necesitas tener configuradas las variables de entorno (ver §8).

### Paso 5 — (Opcional) Backend Express de timelines/quiz

Solo si vas a usar el módulo de progreso/quiz vía REST clásico:

```powershell
cd C:\Users\inbou\vtc-capacitacion-deploy\backend
npm install
npm run dev          # nodemon server.js (puerto 3000)
```

Health check: `http://localhost:3000/api/health`

---

## 5. Estructura de Archivos

```
vtc-capacitacion-deploy/
├── index.html                 ← 🟢 SITIO PRINCIPAL (curso completo, 18 módulos, widget voz)
├── styles-optimized.css        ← CSS extraído/optimizado del sitio
├── victor-avatar.png           ← avatar del coach Víctor
├── vercel.json                 ← config Vercel (memoria/timeout de api/pdf.js)
├── package.json                ← deps raíz (puppeteer-core, @sparticuz/chromium)
│
├── api/                        ← ⚡ SERVERLESS FUNCTIONS (Vercel)
│   ├── report.js               ← GET /api/report?conv=ID  → reporte de sesión (HTML/PDF)
│   ├── transcript.js           ← GET /api/transcript?conv=ID → conversación (HTML/PDF/rows)
│   ├── audio.js                ← GET /api/audio?conv=ID → MP3 de la sesión
│   ├── history.js              ← GET /api/history?emp=NUM → memoria entre sesiones
│   ├── pdf.js                  ← POST /api/pdf { html } → PDF (Chromium real)
│   ├── heatmap-png.js          ← genera heatmap PNG del reporte
│   ├── _render.js              ← htmlToPdf() — helper Puppeteer/Chromium
│   ├── _analyze.js             ← análisis IA del transcript (OpenRouter / Gemini)
│   ├── _chat.js                ← builders compartidos (chat, radar, barras, timeline)
│   └── _template.js            ← plantilla base del reporte
│
├── backend/                   ← 🟡 EXPRESS OPCIONAL (timelines / usuarios / quiz)
│   ├── server.js               ← app Express (CORS, rutas, /api/health)
│   ├── package.json            ← express, cors, mongoose, dotenv
│   ├── routes/                 ← timeline.js · usuarios.js · quiz.js
│   ├── data/                   ← timelines/datos de módulos
│   └── generators/             ← gen-timeline.py (genera JSON de módulos)
│
├── frontend/                  ← versión modular alterna del cliente
│   ├── index.html
│   ├── css/                    ← theme.css · timeline.css · typography.css
│   └── js/                     ← app.js · timeline-player.js · module-controller.js · user-state.js
│
├── videos/                    ← 🎬 38 archivos: modulo-00.mp4..modulo-NN.mp4 + .jpg posters + bonus
├── voces-muestra/             ← muestras de voz (AnaMaria, Azucena, Emily, Fernanda, Gabriela…)
├── email-templates/           ← reportes HTML/PDF de ejemplo + session-report.html
├── docs/                      ← documentación técnica (vacío por defecto)
│
├── ELEVENLABS_AGENT_PROMPT*.md ← prompts del agente Víctor (varias versiones)
├── ELEVENLABS_AUDIO_CONFIG.md  ← configuración de voz/audio
├── GUIA_ROLEPLAY_VOCES.md      ← guía de voces para roleplay
├── DEPLOY_VERCEL.md            ← guía de deploy
├── ACTIVAR_TODO.ps1            ← script de arranque automático
└── _*.py / _*.js               ← scripts de build/patch (generación de prompts, widget, KB)
```

### Archivos clave

| Archivo | Propósito |
|---|---|
| `index.html` | Sitio del curso completo. Punto de entrada real de producción |
| `api/report.js` | Orquesta: trae conversación → la analiza con IA → arma el reporte |
| `api/_render.js` | Convierte HTML a PDF con Chromium real |
| `api/_analyze.js` | Prompt + llamada a OpenRouter que evalúa al asesor |
| `ELEVENLABS_AGENT_PROMPT_FINAL.md` | System prompt vigente del coach Víctor |
| `vercel.json` | Da 60s y 1536 MB a `api/pdf.js` (render pesado) |

---

## 6. Cómo Agregar un Nuevo Módulo

Los módulos del curso viven directamente como secciones en `index.html` y como un par de archivos de video en `videos/`.

### Paso 1 — Preparar el video

Coloca el video y su poster en `videos/` siguiendo la convención numérica:

```
videos/modulo-19.mp4      ← el video del módulo
videos/modulo-19.jpg      ← poster/thumbnail (frame representativo)
```

> Mantén el nombre con dos dígitos (`modulo-19`, no `modulo-19a`) para que el orden sea consistente.

### Paso 2 — Agregar la tarjeta al índice

En `index.html`, dentro de `.module-grid`, duplica una `.module-card` existente y ajústala:

```html
<a class="module-card" href="#modulo-19">
  <div class="module-num">Módulo 19</div>
  <div class="module-name">Cierre por Escasez</div>
  <div class="module-desc">Cómo usar la urgencia genuina sin presionar.</div>
  <span class="module-tag tecnica">Técnica</span>   <!-- pnl | tecnica | proceso -->
</a>
```

### Paso 3 — Agregar la sección del módulo

Más abajo, duplica un bloque `.module-section` completo (header + video + sidebar) y cambia:

```html
<section class="module-section" id="modulo-19">
  <div class="module-inner">
    <div class="module-header">
      <div class="module-id">Módulo 19 · Técnica</div>
      <h2 class="module-title">Cierre por Escasez</h2>
      <p class="module-subtitle">Descripción del módulo…</p>
      <video controls poster="videos/modulo-19.jpg">
        <source src="videos/modulo-19.mp4" type="video/mp4"/>
      </video>
    </div>
    <!-- sidebar / chat se hereda del layout -->
  </div>
</section>
```

### Paso 4 — (Si usas el coach guiado) actualizar la base de conocimiento

Si quieres que **Víctor** explique el módulo nuevo, añade su contenido al knowledge base del agente en ElevenLabs (ver §7) y actualiza el prompt en `ELEVENLABS_AGENT_PROMPT_FINAL.md`.

### Paso 5 — Verificar

```powershell
npx serve .
```

Comprueba: la tarjeta aparece en el índice, el ancla `#modulo-19` hace scroll a la sección, el video reproduce y el poster carga sin "brinco".

> **Variante modular:** si trabajas con `frontend/`, registra el módulo en `frontend/js/app.js` (array de módulos) y crea el timeline JSON correspondiente con `backend/generators/gen-timeline.py`.

---

## 7. Cómo Configurar ElevenLabs

El coach **Víctor** usa **ElevenLabs Conversational AI**. El widget se embebe en `index.html` y las funciones de `api/` consumen la API de conversaciones (server-side).

### Paso 1 — Crear el agente

1. Entra a https://elevenlabs.io → **Conversational AI → Agents**.
2. Crea un agente nuevo (o usa el existente). Copia su **Agent ID**.
   - Agente en producción actual: `agent_9501k3vkt6svekjs6y0qe5xzcek1`
3. En **Voice**, asigna la voz del coach (Voice ID del proyecto: `iDEmt5MnqUotdwCIVplo`).

### Paso 2 — Cargar el system prompt

1. En el agente → **System prompt**.
2. Pega el contenido de [`ELEVENLABS_AGENT_PROMPT_FINAL.md`](ELEVENLABS_AGENT_PROMPT_FINAL.md).
3. Ajusta el comportamiento de audio según [`ELEVENLABS_AUDIO_CONFIG.md`](ELEVENLABS_AUDIO_CONFIG.md).

### Paso 3 — Cargar la base de conocimiento (RAG)

1. En el agente → **Knowledge Base**.
2. Sube el contenido de los módulos (ver `CONTENIDO_MODULOS_RAG.md` y los scripts `_build_knowledge.py` / `_inject_knowledge.py`).
3. Activa RAG para que Víctor responda con el material del curso.

### Paso 4 — Embeber el widget en el sitio

En `index.html`, el widget ya está incrustado con el Agent ID. Para cambiarlo, ajusta el embed de ElevenLabs:

```html
<elevenlabs-convai agent-id="agent_9501k3vkt6svekjs6y0qe5xzcek1"></elevenlabs-convai>
<script src="https://unpkg.com/@elevenlabs/convai-widget-embed" async></script>
```

> Si cambias el agente, actualiza también la constante `AGENT` en `api/history.js`.

### Paso 5 — Configurar la API key server-side

Las funciones `api/transcript.js`, `api/audio.js`, `api/report.js` y `api/history.js` leen la key desde el entorno (nunca del cliente):

```bash
ELEVENLABS_API_KEY=sk_********************************
```

Configúrala en Vercel (§8) o en tu `.env` local.

### Paso 6 — Probar la conexión

```powershell
curl -X GET https://api.elevenlabs.io/v1/user -H "xi-api-key: $env:ELEVENLABS_API_KEY"
```

Debe devolver tu información de cuenta. Luego, tras una conversación real, prueba el reporte:

```
https://vtc-capacitacion-deploy.vercel.app/api/report?conv=<CONVERSATION_ID>
```

---

## 8. Variables de Entorno

Configúralas en **Vercel → Project → Settings → Environment Variables**, o en un `.env` local si usas `vercel dev`.

| Variable | Requerida | Usada por | Descripción |
|---|---|---|---|
| `ELEVENLABS_API_KEY` | ✅ Sí | `api/transcript.js`, `api/audio.js`, `api/report.js`, `api/history.js` | Key de ElevenLabs. Da acceso a conversaciones, audio y memoria. **Server-side only** |
| `OPENROUTER_API_KEY` | ✅ Sí | `api/_analyze.js` (vía `report.js`) | Key de OpenRouter para el análisis IA (`google/gemini-2.5-flash`) |

Ejemplo de `.env` (no commitear):

```bash
# ElevenLabs — coach de voz, transcript, audio y memoria
ELEVENLABS_API_KEY=sk_********************************

# OpenRouter — análisis IA del reporte de sesión
OPENROUTER_API_KEY=sk-or-v1-********************************
```

> El **backend Express opcional** usa además `NODE_ENV`, `PORT` y conexión Mongo (`mongoose`) si activas persistencia de usuarios/quiz. No son necesarias para el sitio principal.

---

## 9. Comandos Útiles

```powershell
# --- Frontend estático ---
npx serve .                         # servir el sitio (index.html)
npx http-server -p 8080             # alternativa

# --- Serverless functions (Vercel) ---
vercel dev                          # frontend + /api/* en local
vercel --prod                       # deploy a producción

# --- Dependencias ---
npm install                         # deps raíz (puppeteer-core, chromium)

# --- Backend Express opcional ---
cd backend; npm install; npm run dev          # nodemon server.js
cd backend; npm run generate-timelines        # genera timelines (python)

# --- Pruebas de endpoints (producción) ---
curl "https://vtc-capacitacion-deploy.vercel.app/api/report?conv=CONV_ID"
curl "https://vtc-capacitacion-deploy.vercel.app/api/transcript?conv=CONV_ID&pdf=1" -o transcript.pdf
curl "https://vtc-capacitacion-deploy.vercel.app/api/audio?conv=CONV_ID" -o sesion.mp3

# --- Generar PDF desde HTML ---
curl -X POST "https://vtc-capacitacion-deploy.vercel.app/api/pdf" `
  -H "Content-Type: application/json" `
  -d '{\"html\":\"<h1>Hola</h1>\",\"filename\":\"prueba\"}' -o prueba.pdf

# --- Verificar ElevenLabs ---
curl -X GET https://api.elevenlabs.io/v1/user -H "xi-api-key: $env:ELEVENLABS_API_KEY"
```

---

## 10. Troubleshooting

### ❌ El widget de voz no aparece o no escucha

- Verifica permiso de **micrófono** en el navegador.
- Confirma que el `agent-id` del embed coincide con un agente activo en ElevenLabs.
- Revisa la consola: el script `@elevenlabs/convai-widget-embed` debe cargar sin error CORS.

### ❌ `/api/report` o `/api/transcript` devuelve "Sin acceso" o 500

- Falta `ELEVENLABS_API_KEY` en las variables de entorno de Vercel. Agrégala y **redeploy**.
- El `conv` (Conversation ID) no existe o no pertenece a tu cuenta.

### ❌ El reporte sale sin análisis IA

- Falta o es inválida `OPENROUTER_API_KEY`. Verifica saldo en OpenRouter.
- El modelo `google/gemini-2.5-flash` debe estar disponible en tu cuenta.

### ❌ El PDF tarda o falla (`api/pdf.js`)

- Render con Chromium es pesado. `vercel.json` ya da **60s y 1536 MB**; no lo bajes.
- En local sin Vercel, `@sparticuz/chromium` puede no encontrar binario: usa `vercel dev` (entorno correcto) en vez de ejecutar la función suelta.
- Si el HTML es enorme, reduce su tamaño o paginalo.

### ❌ Un video no carga o "brinca" al aparecer

- Confirma que existen **ambos** archivos: `videos/modulo-NN.mp4` y `videos/modulo-NN.jpg`.
- El `poster` del `<video>` debe apuntar al `.jpg` para evitar el salto visual inicial.

### ❌ CORS al pegarle al backend Express

- En `backend/server.js`, agrega tu origen local al array de `cors({ origin: [...] })`.

### ❌ "Port 3000 already in use"

```powershell
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### ✅ Chequeo rápido de salud

```powershell
# Backend Express (si está corriendo)
curl http://localhost:3000/api/health

# ElevenLabs
curl -X GET https://api.elevenlabs.io/v1/user -H "xi-api-key: $env:ELEVENLABS_API_KEY"
```

---

## 11. Links de Recursos

### Documentación oficial

- **ElevenLabs Conversational AI** — https://elevenlabs.io/docs/conversational-ai
- **ElevenLabs API** — https://elevenlabs.io/docs/api-reference
- **OpenRouter** — https://openrouter.ai/docs
- **Vercel Functions** — https://vercel.com/docs/functions
- **Puppeteer** — https://pptr.dev
- **@sparticuz/chromium** — https://github.com/Sparticuz/chromium

### Documentos del proyecto

- [`ELEVENLABS_AGENT_PROMPT_FINAL.md`](ELEVENLABS_AGENT_PROMPT_FINAL.md) — System prompt vigente de Víctor
- [`ELEVENLABS_AUDIO_CONFIG.md`](ELEVENLABS_AUDIO_CONFIG.md) — Configuración de voz/audio
- [`GUIA_ROLEPLAY_VOCES.md`](GUIA_ROLEPLAY_VOCES.md) — Voces para roleplay
- [`CONTENIDO_MODULOS_RAG.md`](CONTENIDO_MODULOS_RAG.md) — Contenido para la base de conocimiento
- [`DEPLOY_VERCEL.md`](DEPLOY_VERCEL.md) — Guía de deploy
- [`ANALISIS_ARQUITECTURA.md`](ANALISIS_ARQUITECTURA.md) — Notas de arquitectura

---

## Licencia

**Proprietary** — Todos los derechos reservados © Victorious Travelers Club / Victor IA.
Prohibida su reproducción, distribución o modificación sin consentimiento explícito.

---

**Última actualización:** 2026-06-02 · **Versión:** 1.0.0 · **Status:** Production
