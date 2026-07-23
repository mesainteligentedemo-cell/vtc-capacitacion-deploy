# -*- coding: utf-8 -*-
import io, re

p = 'victor_system_prompt.md'
t = io.open(p, encoding='utf-8').read()
ch = []

# 1) Actualizar descripcion de resaltar_texto en el prompt
old1 = 'usa resaltar_texto, nunca reproduzcas el video de nuevo.'
new1 = old1  # no tocar REGLA #0

# 2) Agregar regla clara sobre cómo usar resaltar_texto justo antes del MODO CURSO
anchor = '## \U0001f393 MODO CURSO GUIADO'
rule = '''## \U0001f4dd CÓMO USAR resaltar_texto (LEE ESTO ANTES DEL CURSO)

`resaltar_texto(frase)` hace DOS cosas a la vez:
1. Resalta el bloque en pantalla con marco dorado y arranca el karaoke palabra por palabra (320ms/palabra)
2. Te DEVUELVE el texto exacto: "LEE ESTO EXACTAMENTE: [texto del bloque]"

**TU TRABAJO:** cuando el tool te devuelva "LEE ESTO EXACTAMENTE: ...", lees ESE TEXTO TEXTUALMENTE, sin agregar ni cambiar una sola palabra. La animación en pantalla y tu voz van sincronizadas porque tú lees lo mismo que se está marcando.

**Flujo correcto por bloque:**
→ Llama `resaltar_texto("primeras palabras exactas del bloque")`
→ El tool devuelve "LEE ESTO EXACTAMENTE: [texto completo]"
→ TÚ lees ese texto tal cual, sin parafrasear
→ Cuando terminas de leer → llama `resaltar_texto` con el siguiente bloque
→ Repite hasta cubrir todo el módulo

**Frases para resaltar_texto:** usa 3-6 palabras EXACTAS que aparecen en el bloque. No inventes frases. Usa las del contenido del curso que tienes en tu contexto (sección "CONTENIDO REAL DEL CURSO").

**Si el tool devuelve "NO ENCONTRADO":** la frase no existe textualmente en pantalla. Intenta con palabras más cortas y más exactas del mismo bloque.

'''

if 'CÓMO USAR resaltar_texto' not in t and anchor in t:
    i = t.find(anchor)
    t = t[:i] + rule + t[i:]
    ch.append('regla-resaltar')

# 3) En PASO 3-B del modo guiado, reforzar que lea textualmente
old3 = '**B) LECTURA SINCRONIZADA — al recibir aviso:**\n→ `ir_a_modulo("[modulo]")`\n→ Recorre TODO el contenido de arriba hacia abajo. Por cada bloque: `resaltar_texto("[frase exacta del bloque]")` + explícalo en 1-2 frases. No omitas ningún bloque. No avances hasta explicar el actual.'
new3 = '**B) LECTURA SINCRONIZADA — al recibir aviso:**\n→ `ir_a_modulo("[modulo]")`\n→ Recorre TODO el contenido de arriba hacia abajo. Por cada bloque: llama `resaltar_texto("[3-6 palabras exactas del bloque]")` → el tool te devuelve "LEE ESTO EXACTAMENTE: [texto]" → LEE ESE TEXTO TEXTUALMENTE (el karaoke en pantalla va sincronizado con tu voz). Luego comenta en 1 frase adicional con tu propio ejemplo o contexto. Repite con el siguiente bloque. No omitas ningún bloque.'

if old3 in t:
    t = t.replace(old3, new3, 1)
    ch.append('paso3b-leer-textual')

io.open(p, 'w', encoding='utf-8').write(t)
print('cambios:', ch, '| len:', len(t))