# ANÁLISIS ARQUITECTÓNICO — Victor Agent

## ✅ QUÉ ESTÁ BIEN

### 1. **Flujo de Capacitación es Sólido**
- Orden claro: F → 0 → 1 → 2 ... → 12 → Proceso VTC → VTC 19
- Cada módulo tiene estructura: Video → Bloques explicados → RECAP → QUIZ → BREAKDOWN
- Progresión lógica de complejidad

### 2. **Bloqueos Inmóviles son Fuertes**
- BLOQUEO 1-5 previenen saltos y distracción
- Protegen la integridad del flujo
- Claros y no negociables

### 3. **Ciclo de Explicación es Preciso**
- SCROLL → HABLA → RESALTA → PAUSA → TRANSICIÓN
- Sincronización visual y auditiva
- Timing definido (15-30s por bloque)

### 4. **Regla #0 está Blindada**
- No repetir es no negociable
- Ejemplos concretos de bueno vs malo
- Claro qué evitar

---

## ❌ QUÉ ESTÁ MAL / INCOMPLETO

### 1. **DUPLICACIÓN EXTREMA entre archivos**
**Problema**: 
- `victor_system_prompt.md` = 500+ líneas (manual extenso)
- `ELEVENLABS_AGENT_PROMPT.md` = 106 líneas (resumen conciso)
- Hay REGLA #0 en ambos, personalidad en ambos, flujo en ambos

**Impacto**: 
- Confusión sobre cuál es la fuente de verdad
- Si cambias una, olvidas actualizar la otra
- El agent en ElevenLabs no sabrá que tiene 500 líneas de manual detrás

**Solución**: 
- `victor_system_prompt.md` = Manual INTERNO (documentación, reference)
- `ELEVENLABS_AGENT_PROMPT.md` = ÚNICO SOURCE OF TRUTH que va en ElevenLabs
- Eliminar duplicación, mantener solo lo que ElevenLabs necesita

### 2. **Falta: Cómo Maneja Interrupciones / Preguntas Fuera de Tema**
**Problema**: 
- Dice "respóndelo en 1 frase y retoma" pero no es claro CÓMO
- ¿Qué si el usuario pregunta "¿cuánto cuesta VTC?" durante el módulo?
- ¿Qué si pregunta "¿puedo hacer un roleplay?"

**Solución**: Agregar sección "INTERRUPCIONES Y PREGUNTAS FUERA DE TEMA"

### 3. **Falta: Cómo Detecta y Maneja Respuestas del Usuario**
**Problema**:
- "Auto-detecta respuesta → siguiente pregunta" es vago
- ¿Qué si el usuario dice "la segunda" vs "B" vs el texto completo?
- ¿Qué si dice algo ambiguo o incorrecto?

**Solución**: Agregar lógica explícita de quiz

### 4. **Falta: Memory / Continuidad**
**Problema**:
- Menciona "Usuario registrado: Hola [nombre]..." pero no dice CÓMO obtiene eso
- ¿De una base de datos? ¿De variables?
- ¿Qué información persiste entre sesiones?

**Solución**: Agregar sección "CONTEXTO Y MEMORIA"

### 5. **Falta: Cómo Maneja Módulos "Específicos"**
**Problema**:
- "¿Quieres el curso completo O un módulo específico?"
- Pero solo está documentado el flujo "COMPLETO"
- ¿Cómo entra a Módulo 7 directamente?

**Solución**: Agregar PASO ALTERNATIVO: "SI PIDE MÓDULO ESPECÍFICO"

### 6. **Falta: Manejo de Errores / Edge Cases**
**Problema**:
- ¿Qué si el video no carga?
- ¿Qué si el usuario desconecta durante el quiz?
- ¿Qué si dice cosas incomprendibles?

**Solución**: Agregar sección "ERRORES Y FALLBACKS"

### 7. **Herramientas Incompletas**
**Problema**:
- `ir_a_modulo("[id]")` — ¿qué IDs exactos existen?
- `resaltar_texto("[texto exacto]")` — ¿y si el texto no existe?
- "Auto-detecta respuestas" — ¿realmente funciona así en ElevenLabs?

**Solución**: Documentar herramientas con IDs válidos y comportamiento real

### 8. **Rol del Agent No Está Claro en ElevenLabs**
**Problema**:
- "Master coach", "20 años experiencia" pero ¿realmente Victor es un ENTRENADOR o un NAVEGADOR?
- ¿Es su trabajo ENSEÑAR o GUIAR?
- Parece mezclar ambos (enseña en Módulos, navega en UI)

**Solución**: Ser explícito: Victor es un GUÍA CINEMATOGRÁFICO que:
- Explica el contenido (ENSEÑA)
- Controla el scroll y navegación (GUÍA)
- Hace q responder preguntas y evalúa (EVALÚA)

### 9. **Falta: Feedback y Evaluación**
**Problema**:
- BREAKDOWN es "correcto/incorrecto" pero muy simple
- ¿Qué feedback útil da al vendedor?
- ¿Cómo conecta el quiz con el aprendizaje real?

**Solución**: Feedback debe ser:
- Específico ("acertaste porque entiendes VPG")
- Educativo ("aquí está por qué los otros fallan")
- Motivacional ("dominas esto, el siguiente módulo depende de esto")

### 10. **Sincronización Real No Está Garantizada**
**Problema**:
- "Ciclo: SCROLL → HABLA → RESALTA" pero en ElevenLabs:
  - ¿El SCROLL se ejecuta ANTES de que Victor hable?
  - ¿O mientras habla?
  - ¿O después?
- ElevenLabs agents NO tienen control de timing preciso sobre tool calls

**Impacto CRÍTICO**: Victor seguirá saltándose bloques porque NO HAY SINCRONIZACIÓN REAL

**Solución**: Necesitamos cambiar el modelo:
- NO depender de tool calls para control de UI
- Usar HTML/JavaScript que controle el flujo
- El agent solo HABLA, la UI se mueve por sí sola

---

## 🔴 PROBLEMA CRÍTICO IDENTIFICADO

**Victor NO TIENE CONTROL REAL DEL FLUJO en ElevenLabs**

Porque:
1. El agent hace `ir_a_modulo()` pero no sabe si se ejecutó
2. No hay feedback de que el scroll terminó
3. El agent puede hablar antes de que la UI esté lista
4. Los tool calls son ASÍNCRONOS pero el agent habla SÍNCRONAMENTE

**Esto es por qué sigue saltándose bloques** — no hay sincronización real.

---

## 💡 CÓMO DEJARLO PERFECTO

### OPCIÓN A: Dejar ElevenLabs SOLO para VOZ + CONVERSACIÓN
```
Victor en ElevenLabs:
- Habla (explica, quiz, feedback)
- Toma input del usuario
- NO intenta controlar la UI

HTML/JavaScript:
- Controla TODO el flujo (scroll, resaltar, videos)
- Responde a eventos del usuario
- Victor solo habla
```

### OPCIÓN B: Usar API REST para Sincronización (Más Robusto)
```
ElevenLabs Agent → Envía evento JSON
HTML/JavaScript ← Recibe evento, ejecuta acción, espera confirmación
ElevenLabs Agent ← Recibe confirmación "scroll completado"
Victor → Ahora habla sabiendo que la UI está lista
```

### OPCIÓN C: Pre-Generar el Flujo (Más Simple pero Menos Flexible)
```
Victor tiene un "guion" pre-definido:
"Bloque 1: [explicación fija] → Resalta → Pausa → Bloque 2..."
No hace tool calls dinámicos, solo habla en secuencia
HTML controla scroll based on time cues en el audio
```

---

## 📋 RECOMENDACIÓN FINAL

**Mi opinión:**

El **PROBLEMA RAÍZ** no es el prompt de Victor. Es que **ElevenLabs Agent no tiene control verdadero del flujo de la UI**.

**Antes de invertir más en Victor, necesitas:**

1. **Decidir**: ¿Quién controla el flujo?
   - ¿El agent (Victor habla y ordena)?
   - ¿La UI (JavaScript responde a eventos del usuario)?

2. **Si es Agent-controlled**: Implementar sincronización real
   - API REST entre Victor y HTML
   - Victor espera confirmación antes de continuar
   - HTML ejecuta acciones y confirma

3. **Si es UI-controlled**: Simplificar el prompt
   - Victor es SOLO VOZ + CONVERSACIÓN
   - HTML maneja todo el flujo
   - Victor está ahí para explicar, no para navegar

**Mi recomendación**: **OPCIÓN B** (API REST)
- Victor mantiene control (didácticamente correcto)
- Sincronización garantizada (Victor espera confirmación)
- Escalable (puedes agregar complejidad después)

---

## 🎯 ARQUITECTURA IDEAL (PROPUESTA)

```
┌─────────────────────────────────────────────────────────────┐
│                    VICTOR (ElevenLabs Agent)                 │
│  ✓ Explica bloques                                           │
│  ✓ Maneja quiz                                               │
│  ✓ Ordena navegación (pero ESPERA confirmación)              │
│  ✓ Personalidad + coaching                                   │
└────────────────────────┬────────────────────────────────────┘
                         │ (API REST / WebSocket)
                         │ Mensajes JSON sincronizados
                         │
┌────────────────────────▼────────────────────────────────────┐
│              HTML + JavaScript (UI Controller)               │
│  ✓ Recibe orden de Victor: "scroll a módulo-f"              │
│  ✓ Ejecuta acción: `ir_a_modulo("modulo-f")`                │
│  ✓ Confirma a Victor: "{ status: 'ready', module: 'f' }"    │
│  ✓ Victor AHORA habla del módulo F (sincronizado)           │
│  ✓ Maneja interacción del usuario (click, scroll, etc.)     │
└─────────────────────────────────────────────────────────────┘
```

Así:
- ✅ Victor tiene control (didácticamente)
- ✅ Sincronización garantizada (técnicamente)
- ✅ No hay saltos (porque Victor espera confirmación)
- ✅ Escalable (agregar complejidad después)

---

## 🔧 PRÓXIMOS PASOS

1. **Limpiar archivos**
   - ELEVENLABS_AGENT_PROMPT.md es la fuente de verdad
   - victor_system_prompt.md es solo documentación interna
   - Eliminar duplicación

2. **Agregar a ELEVENLABS_AGENT_PROMPT.md:**
   - Sección: "MANEJO DE INTERRUPCIONES"
   - Sección: "CONTEXTO Y MEMORIA"
   - Sección: "MÓDULO ESPECÍFICO (entrada alternativa)"
   - Sección: "HERRAMIENTAS (IDs exactos, comportamiento)"
   - Sección: "FEEDBACK Y EVALUACIÓN"

3. **Investigar sincronización**
   - ¿Cómo implementar API REST entre Victor y HTML?
   - ¿ElevenLabs soporta WebSocket?
   - ¿O necesitamos una solución diferente?

4. **Testear**
   - Victor debe ESPERAR confirmación antes de continuar
   - No debe hablar hasta que la UI esté lista
   - No debe saltar bloques