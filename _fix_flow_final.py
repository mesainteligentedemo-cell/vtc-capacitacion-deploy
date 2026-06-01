# -*- coding: utf-8 -*-
"""
Fix definitivo del flujo:
1. Victor HABLA primero, luego llama resaltar_texto (no al reves)
   - Esto evita que batchee 6 tool calls sin hablar
2. Eliminar leer_modulo_completo del flujo de explicacion per-bloque
3. Victor sabe los bloques de cada modulo desde el CONTENIDO REAL del prompt
4. Fix: nunca usar etiquetas de voz fuera del roleplay
5. Video: confiar en el auto-detect, no preguntar
"""
import io

# ─── Prompt ───
p = 'victor_system_prompt.md'
t = io.open(p, encoding='utf-8').read()
ch = []

# 1) Invertir el orden explicar→resaltar en las reglas
old1 = ('Flujo por bloque:\n'
        '1. `resaltar_texto("[palabras clave del bloque]")` — el bloque aparece resaltado en pantalla\n'
        '2. Explica ese bloque en 1-2 frases propias, breve y directo\n'
        '3. Llama el siguiente `resaltar_texto` de inmediato')
new1 = ('Flujo por bloque (ORDEN OBLIGATORIO):\n'
        '1. HABLA primero: explica el bloque en 1-2 frases propias\n'
        '2. LUEGO llama `resaltar_texto("[palabras clave del bloque]")` — el bloque queda en dorado\n'
        '3. Siguiente bloque: vuelve al paso 1\n'
        'NUNCA llames resaltar_texto sin haber hablado antes. NUNCA hagas 2 resaltar_texto seguidos sin hablar entre ellos.')
if old1 in t: t=t.replace(old1,new1,1); ch.append('orden-invertido')

# 2) Fix en PASO 3 del flujo del modulo
old2 = ('Para cada bloque:\n'
        '1. `resaltar_texto("[título o primeras palabras exactas del bloque]")` → el bloque queda en marco dorado\n'
        '2. Explícalo en voz con TUS PROPIAS palabras (no lo leas literal) — 2-3 frases, como maestro\n'
        '3. Siguiente bloque de inmediato sin pausas')
new2 = ('Para cada bloque (SIEMPRE en este orden):\n'
        '1. HABLA: explica el bloque en 2-3 frases propias como maestro (NO lo leas literal)\n'
        '2. LUEGO llama `resaltar_texto("[título o primeras palabras exactas]")` — el bloque queda en dorado mientras terminas de hablar\n'
        '3. Siguiente bloque: repite desde el paso 1\n'
        'Regla dura: NUNCA hagas 2 llamadas a resaltar_texto sin hablar entre ellas.')
if old2 in t: t=t.replace(old2,new2,1); ch.append('paso3-orden')

# 3) Fix video: no preguntar si terminó, confiar en el auto-detect
old3 = '⏸ ESPERA SU AVISO (el sistema detecta cuando termina)'
new3 = '⏸ ESPERA EN SILENCIO — el sistema detecta automáticamente cuando el video termina y te avisa. NO preguntes si el usuario ya terminó. Simplemente espera callado hasta que llegue el aviso.'
t=t.replace(old3,new3); ch.append('video-silencio')

old3b = '⏸ ESPERA AVISO del video'
new3b = '⏸ ESPERA EN SILENCIO (el sistema te avisa solo cuando el video termina — no preguntes)'
t=t.replace(old3b,new3b); ch.append('video-silencio2')

# 4) Agregar al inicio de las REGLAS CRITICAS: nunca etiqueta fuera del roleplay
old4 = '1. **JAMÁS escribas corchetes ni etiquetas de emoción**'
new4 = ('0. **JAMÁS uses etiquetas de voz fuera del roleplay** — `<Cliente>`, `<Esposa>`, etc. son EXCLUSIVAS del roleplay activo. '
        'Cuando TÚ (Víctor) hablas como entrenador, coach o guía del curso: SIN etiquetas, texto plano. '
        'Si usas una etiqueta fuera del roleplay, suenas como si el USUARIO estuviera hablando — es un error grave.\n'
        '1. **JAMÁS escribas corchetes ni etiquetas de emoción**')
if old4 in t: t=t.replace(old4,new4,1); ch.append('etiqueta-regla')

# 5) Fecha: hacer la regla aun mas explicita
old5 = 'MAL: escribir "31/05/2026" → el TTS diría "treinta y uno slash cero cinco slash..."'
new5 = 'MAL: escribir "31/05/2026" o "31/5/2026" → el TTS diría "treinta y uno slash cinco slash..." PÉSIMO\nMAL: escribir "31 de mayo de 2026" → el TTS diría el año PROHIBIDO'
t=t.replace(old5,new5,1); ch.append('fecha-rule')

io.open(p,'w',encoding='utf-8').write(t)
print('cambios:',ch,'| len:',len(t))
