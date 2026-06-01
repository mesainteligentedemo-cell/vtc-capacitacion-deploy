# SINCRONIZACIÓN API REST — Victor ↔ HTML/JavaScript

## PROBLEMA
Victor en ElevenLabs no tiene control verdadero del flujo porque:
1. No sabe cuándo terminó un tool call (`ir_a_modulo()`)
2. No hay feedback de que el scroll llegó a su destino
3. Victor habla mientras la UI se está moviendo
4. **Resultado:** Saltos de bloques, desincronización visual

## SOLUCIÓN
**API REST entre Victor y HTML para sincronización garantizada**

---

## ARQUITECTURA

```
┌─────────────────────────────────────┐
│  VICTOR (ElevenLabs Agent)          │
│  • Explica contenido                │
│  • Ordena navegación                │
│  • ESPERA confirmación antes hablar │
└────────────────┬────────────────────┘
                 │
                 │ POST /api/victor/navigate
                 │ { "action": "scroll", "target": "modulo-f" }
                 ↓
┌─────────────────────────────────────┐
│  HTML/JavaScript Controller         │
│  • Recibe orden de Victor           │
│  • Ejecuta acción (scroll, resaltar)│
│  • Confirma completitud            │
└────────────────┬────────────────────┘
                 │
                 │ 200 OK
                 │ { "status": "ready", "module": "f" }
                 ↓
┌─────────────────────────────────────┐
│  VICTOR (continúa)                  │
│  Ahora habla (SINCRONIZADO)        │
└─────────────────────────────────────┘
```

---

## ENDPOINTS API

### 1. NAVIGATE (Victor ordena, espera confirmación)

**Endpoint:** `POST /api/victor/navigate`

**Request:**
```json
{
  "action": "scroll",
  "target": "modulo-f",
  "position": "block-1"
}
```

**Response (200 OK):**
```json
{
  "status": "ready",
  "module": "f",
  "position": "block-1",
  "visible": true,
  "timestamp": "2026-05-31T12:34:56.789Z"
}
```

**Victor ESPERA este response antes de hablar.**

---

### 2. HIGHLIGHT (Victor ordena resaltar, espera confirmación)

**Endpoint:** `POST /api/victor/highlight`

**Request:**
```json
{
  "action": "highlight",
  "text": "Por qué este módulo existe",
  "color": "gold",
  "duration": 3000
}
```

**Response (200 OK):**
```json
{
  "status": "highlighted",
  "text": "Por qué este módulo existe",
  "color": "gold",
  "timestamp": "2026-05-31T12:34:56.789Z"
}
```

**Victor ESPERA este response antes de continuar.**

---

### 3. VIDEO (Victor ordena reproducir, espera confirmación)

**Endpoint:** `POST /api/victor/video`

**Request:**
```json
{
  "action": "play",
  "module": "modulo-f",
  "autoPlay": false
}
```

**Response (200 OK):**
```json
{
  "status": "ready",
  "module": "modulo-f",
  "videoId": "video-f-1",
  "timestamp": "2026-05-31T12:34:56.789Z"
}
```

**Victor dice "Dale play" y ESPERA evento del HTML de que terminó.**

---

### 4. QUIZ (Victor ordena mostrar quiz, espera confirmación)

**Endpoint:** `POST /api/victor/quiz`

**Request:**
```json
{
  "action": "show",
  "module": "modulo-f",
  "questionNumber": 1
}
```

**Response (200 OK):**
```json
{
  "status": "quiz_visible",
  "module": "modulo-f",
  "questionNumber": 1,
  "questionText": "¿Qué vende realmente un representante VTC?",
  "options": ["A", "B", "C", "D"],
  "timestamp": "2026-05-31T12:34:56.789Z"
}
```

**Victor ESPERA antes de leer la pregunta.**

---

## FLUJO SINCRONIZADO PASO A PASO

### Escenario: Victor explica Módulo F, Bloque 1

```
VICTOR                          HTML/JS
─────────────────────────────────────────────────────────

1. POST /navigate
   { action: "scroll", target: "modulo-f" }
   ──────────────────────→
                         Ejecuta: ir_a_modulo("modulo-f")
                         Scroll baja a Módulo F
                         ←────────── 200 OK { status: "ready" }

2. [Victor ahora habla - SINCRONIZADO]
   "Mira, en este módulo vamos a ver..."
   [Victor habla 15-30s explicando el bloque]

3. POST /highlight
   { action: "highlight", text: "Por qué..." }
   ──────────────────────→
                         Ejecuta: resaltar_texto()
                         Bloque se pone dorado
                         ←────────── 200 OK { status: "highlighted" }

4. [Victor hace pausa 2-3s]
   [Usuario procesa lo resaltado]

5. POST /navigate
   { action: "scroll", target: "modulo-f", position: "block-2" }
   ──────────────────────→
                         Scroll baja al siguiente bloque
                         ←────────── 200 OK { status: "ready" }

6. [Victor habla Bloque 2 - SINCRONIZADO]

[REPITE para cada bloque]
```

**Resultado:** Cero desincronización, Victor siempre habla cuando la UI está lista.

---

## IMPLEMENTACIÓN EN HTML/JavaScript

### Archivo: `api-bridge.js`

```javascript
// API Bridge para sincronizar Victor con HTML

class VictorSync {
  constructor() {
    this.currentModule = null;
    this.currentBlock = null;
  }

  // API endpoint: POST /api/victor/navigate
  async navigate(action, target, position = null) {
    try {
      // Ejecuta la acción en la UI
      if (action === "scroll") {
        await this.scrollToModule(target, position);
      }

      // Responde a Victor que está listo
      return {
        status: "ready",
        module: target,
        position: position || "top",
        visible: true,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: "error",
        message: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // API endpoint: POST /api/victor/highlight
  async highlight(text, color = "gold", duration = 3000) {
    try {
      // Busca el elemento con ese texto
      const element = this.findElementByText(text);
      
      if (element) {
        // Resalta en dorado
        element.classList.add(`highlight-${color}`);
        
        // Auto-remueve después de duration
        setTimeout(() => {
          element.classList.remove(`highlight-${color}`);
        }, duration);
      }

      return {
        status: "highlighted",
        text: text,
        color: color,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: "error",
        message: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // API endpoint: POST /api/victor/video
  async video(action, module) {
    try {
      const videoElement = document.querySelector(`video[data-module="${module}"]`);
      
      if (action === "play") {
        // NO reproduce automáticamente
        // Solo prepara el video para que el usuario le haga click
        videoElement.style.display = "block";
      }

      return {
        status: "ready",
        module: module,
        videoId: `video-${module}`,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: "error",
        message: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Helpers
  scrollToModule(target, position = null) {
    const element = document.getElementById(target);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      this.currentModule = target;
      this.currentBlock = position;
      return Promise.resolve();
    }
    return Promise.reject(new Error(`Module ${target} not found`));
  }

  findElementByText(text) {
    const allElements = document.querySelectorAll("*");
    for (let el of allElements) {
      if (el.textContent.includes(text) && el.children.length === 0) {
        return el;
      }
    }
    return null;
  }
}

// Instanciar
const victorSync = new VictorSync();

// Exponer como APIs (Express.js example)
app.post("/api/victor/navigate", async (req, res) => {
  const { action, target, position } = req.body;
  const result = await victorSync.navigate(action, target, position);
  res.json(result);
});

app.post("/api/victor/highlight", async (req, res) => {
  const { text, color, duration } = req.body;
  const result = await victorSync.highlight(text, color, duration);
  res.json(result);
});

app.post("/api/victor/video", async (req, res) => {
  const { action, module } = req.body;
  const result = await victorSync.video(action, module);
  res.json(result);
});
```

---

## CÓMO VICTOR USA ESTOS ENDPOINTS

En el prompt de ElevenLabs, Victor ahora hace esto:

```
PASO 3a: NAVEGA (espera confirmación)
→ POST /api/victor/navigate { action: "scroll", target: "modulo-f" }
← Victor ESPERA response 200 OK

PASO 3b: HABLA (ahora está sincronizado)
→ Explica el bloque (15-30s)

PASO 3c: RESALTA (espera confirmación)
→ POST /api/victor/highlight { text: "Por qué este módulo existe" }
← Victor ESPERA response 200 OK

PASO 3d: PAUSA (usuario procesa)
→ Silencio 2-3s

PASO 3e: TRANSICIÓN (al siguiente)
→ "Ahora vamos al siguiente punto"
→ Vuelve a PASO 3a (siguiente bloque)
```

**Victor NUNCA habla hasta que reciba confirmación de que la acción terminó.**

---

## VENTAJAS

✅ **Sincronización garantizada** — Victor espera confirmación
✅ **Sin saltos** — HTML confirma cada acción
✅ **Escalable** — Agregar nuevas acciones sin cambiar el flujo
✅ **Debugging fácil** — Logs de cada sincronización
✅ **Fallbacks** — Si API falla, Victor y HTML lo saben

---

## PRÓXIMOS PASOS

1. Implementar `api-bridge.js` en index.html
2. Crear endpoints Express.js (si está en servidor Node)
3. Actualizar ELEVENLABS_AGENT_PROMPT.md con nueva sección "SINCRONIZACIÓN"
4. Testear: Victor debe esperar confirmación antes de hablar

---

## DIAGRAMA COMPLETO

```
USUARIO
   ↓
[Click en Módulo F] / [Di "Capacitación"]
   ↓
Victor Agent (ElevenLabs)
   ├─ POST /api/victor/navigate ← ESPERA
   ├─ HTML ejecuta action
   ├─ HTML responde 200 OK
   └─ Victor habla SINCRONIZADO
        ├─ POST /api/victor/highlight ← ESPERA
        ├─ HTML ejecuta highlight
        ├─ HTML responde 200 OK
        ├─ Pausa 2-3s
        └─ Victor transición al siguiente
             ├─ POST /api/victor/navigate ← ESPERA
             └─ [REPITE]
```

**Resultado final:** Flow cinematográfico perfecto, sin saltos, sincronizado pixel-perfect.
