# Diagnostic Quirúrgico — VTC Capacitación Elite

**Fecha:** 1 de junio 2026  
**Estado:** VALIDATION IN PROGRESS

---

## ✅ VERIFICACIONES COMPLETADAS

### Frontend (index.html)
- [x] `id="inicio"` agregado al hero (línea 316)
- [x] Módulos con IDs correctos: modulo-f, modulo-0 ... modulo-12 ✓
- [x] 72 `.content-block` encontrados en el HTML ✓
- [x] `leer_bloque` implementado en línea 2061 ✓
- [x] `reproducir_video` implementado en línea 1953 ✓
- [x] `ir_a_modulo` implementado ✓
- [x] `ir_al_quiz` implementado ✓
- [x] Listener `ended` correcto (línea 2122) — manda `[VIDEO_TERMINADO]` ✓
- [x] Deploy a Vercel completado ✓

### ElevenLabs
- [x] ELEVENLABS_AGENT_PROMPT.md copiado completamente ✓
- [x] PASO 3 actualizado con flujo `leer_bloque` ✓
- [x] Protocolo de extraño implementado ✓

---

## 🔍 FLUJO PASO A PASO — VALIDACIÓN

### PASO 1: Presentación Inicial (Hero)
**Acción esperada:** Victor navega al inicio y lee el hero

```
USER: "dame el curso completo"
↓
VICTOR: (llama) ir_a_modulo("inicio")
↓
HTML: Scroll al hero (id="inicio")
✓ Espera = "Navegado y resaltado"
↓
VICTOR: "Mira, el curso más completo para las salas de ventas..."
(Lee h1, p, stats del hero)
↓
VICTOR: "¿Estás listo para empezar con los módulos?"
```

**Selectores:**
- Hero: `#inicio` ✓ (ahora existe)
- Contenido: `<h1>`, `<p>`, `.hero-stats` ✓ (visible en pantalla)

---

### PASO 2: Video Bienvenida
**Acción esperada:** Victor reproduce video de bienvenida, espera fin, continúa

```
VICTOR: "Dale play, avísame cuando terminas"
↓
VICTOR: (llama) reproducir_video("bienvenida")
↓
HTML: Scroll a #bienvenida, muestra video
✓ Espera = "ESPERA EN SILENCIO ABSOLUTO..."
↓
USER: (presiona Play)
USER: (ve video completo)
VIDEO: (termina)
↓
HTML EVENT: 'ended' dispara → sendUserMessage('[VIDEO_TERMINADO] El video de bienvenida ya termino...')
↓
VICTOR: (recibe [VIDEO_TERMINADO])
VICTOR: "Perfecto, ya vimos la bienvenida..."
```

**Selectores:**
- Video: `#bienvenida` → `video` ✓
- Evento: `document.addEventListener('ended', ...)` ✓ (línea 2122)

---

### PASO 3: Lectura de Bloques (Fundamentos)
**Acción esperada:** Victor lee módulo F bloque a bloque usando `leer_bloque`

```
VICTOR: "Vamos a ver Fundamentos del Negocio VTC"
VICTOR: "Dale play, avísame cuando termines"
↓
VICTOR: (llama) reproducir_video("modulo-f")
↓
HTML: Scroll a #modulo-f, muestra video
✓ Espera = "ESPERA EN SILENCIO..."
↓
USER: (ve video)
VIDEO: (termina)
↓
EVENT: [VIDEO_TERMINADO]
↓
VICTOR: "Perfecto, ahora vamos a leer el contenido..."
VICTOR: (llama) leer_bloque({"modulo":"modulo-f","indice":0})
↓
HTML: 
  - Encuentra #modulo-f
  - Busca .content-block[0]
  - Marca con .vtc-reading
  - Scroll instant a ese bloque
  - Retorna: {modulo:"modulo-f", indice:0, titulo:"...", contenido:"...", total:6, es_ultimo:false}
✓ Espera = JSON con contenido
↓
VICTOR: "Por qué este módulo existe. El 60% de los vendedores nuevos..." 
(Lee todo el contenido del bloque)
↓
VICTOR: (cuando termina de hablar)
VICTOR: (llama) leer_bloque({"modulo":"modulo-f","indice":1})
↓
HTML: Marca bloque 1, retorna JSON
↓
VICTOR: (lee bloque 1)
↓
... (repite hasta es_ultimo:true)
↓
VICTOR: (en último bloque)
VICTOR: "Excelente, acabas de leer todo Fundamentos..."
(RECAP — 4-6 frases motivadoras)
```

**Selectores:**
- Módulo: `#modulo-f` ✓
- Bloques: `#modulo-f .content-block` (6 bloques) ✓
- Content: `.block-title`, `.block-text`, `.script-text`, etc. ✓
- Marcado: `.vtc-reading` (CSS clase existe) ✓

---

### PASO 4: Quiz
**Acción esperada:** Victor hace quiz del módulo

```
VICTOR: "Okay, ahora sí vamos a hacer un pequeño Quiz..."
VICTOR: (llama) ir_al_quiz("modulo-f")
↓
HTML: Scroll a #modulo-f .quiz
✓ Espera = "navegado"
↓
VICTOR: "Pregunta número 1..."
(Lee pregunta exactamente)
↓
VICTOR: "A) Opción 1"
"B) Opción 2"
"C) Opción 3"
"D) Opción 4"
↓
USER: (responde) "C"
↓
HTML: Auto-detecta respuesta, marca como "answered"
↓
VICTOR: "✓ Correcto, porque..." (si es correcta)
o "✗ Incorrecta. La respuesta es C porque..." (si es incorrecta)
↓
VICTOR: (siguiente pregunta) ... (repite)
↓
QUIZ TERMINADO
↓
VICTOR: "BREAKDOWN: Lo que dominaste bien: [concepto]. Lo que necesitas reforzar: [concepto]"
```

**Selectores:**
- Quiz: `#modulo-f .quiz` ✓
- Preguntas: `.q` (múltiples) ✓
- Opciones: `.q-opt` ✓
- Auto-detect: jQuery listeners (línea 2144) ✓

---

## 🚨 PUNTOS CRÍTICOS A PROBAR

| Punto | Status | Validación |
|---|---|---|
| `id="inicio"` existe | ✓ Agregado | Verificar en browser |
| `leer_bloque` retorna JSON válido | ? | Test `leer_bloque({"modulo":"modulo-f","indice":0})` |
| `[VIDEO_TERMINADO]` se manda | ? | Reproducir video, esperar evento ended |
| Selectores `.content-block` correctos | ✓ | 72 encontrados |
| `reproducir_video("modulo-f")` funciona | ? | Test video reproducción |
| `ir_al_quiz` navega correctamente | ? | Test quiz scroll |
| Quiz auto-detect funciona | ? | Test respuestas quiz |
| Listener ended NO dispara doble | ? | Flag `__vtcEnded` previene duplicados ✓ |

---

## 📋 CHECKLIST FINAL — ANTES DE PRODUCCIÓN

- [ ] Login como Pablo Solar
- [ ] Decir: "dame el curso completo"
- [ ] Victor lee hero sin errores
- [ ] Victor reproduce video bienvenida
- [ ] Video termina → `[VIDEO_TERMINADO]` enviado
- [ ] Victor llama `leer_bloque` correctamente
- [ ] Scroll ocurre AL INICIO de cada bloque (no a mitad)
- [ ] Victor lee TODO el contenido de cada bloque
- [ ] Quiz funciona sin errores
- [ ] Respuestas se detectan automáticamente
- [ ] Flujo completo: PASO 1 → PASO 7 SIN ERRORES
- [ ] No hay errores de consola (F12)
- [ ] Deploy en Vercel ✓

---

## SIGUIENTE PASO

Test end-to-end en navegador:
1. Abrir https://vtc-capacitacion-deploy.vercel.app
2. Login: Pablo Solar / emp
3. Decir: "dame el curso completo"
4. Observar consola (F12) sin errores
5. Completar hasta PASO 4

---

**Creado:** 2026-06-01  
**Actualizado:** Ahora  
**Responsable:** Victor IA
