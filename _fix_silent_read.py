# -*- coding: utf-8 -*-
"""
resaltar_texto: devuelve el texto sin prefijo "LEE ESTO EXACTAMENTE"
El agente simplemente lee el texto que recibe — sin anunciar qué va a hacer.
leer_modulo_completo: igual, sin prefijos verbosos.
Prompt: quitar instruccion "LEE ESTO EXACTAMENTE" y reemplazar por instruccion limpia.
"""
import io, re

# ── index.html ──
p = 'index.html'
t = io.open(p, encoding='utf-8').read()

# resaltar_texto: cambiar el return final
OLD_RET = "return 'LEE ESTO EXACTAMENTE (palabra por palabra, sin agregar ni cambiar nada): '+rawText;"
NEW_RET = "return rawText;"  # devuelve solo el texto — el agente lo lee directo

if OLD_RET in t:
    t = t.replace(OLD_RET, NEW_RET, 1)
    print('resaltar_texto return limpio OK')
else:
    print('WARN: return no encontrado')

# leer_modulo_completo: quitar prefijos verbosos del return
OLD_LMC1 = "return 'LEE ESTOS TEXTOS EN ORDEN (uno a uno con resaltar_texto, sin comentar entre ellos — solo explica al final del modulo): '+texts.map(function(tx,i){return (i+1)+') '+tx;}).join(' ||| ');"
NEW_LMC1 = "return texts.map(function(tx,i){return (i+1)+') '+tx;}).join(' ||| ');"

OLD_LMC2 = "return 'ANTES_VIDEO: '+fmt(before)+' ### DESPUES_VIDEO: '+fmt(after);"
NEW_LMC2 = "return 'ANTES_VIDEO: '+fmt(before)+' ### DESPUES_VIDEO: '+fmt(after);"  # este se queda igual — es estructura

OLD_LMC_SV = "return 'SIN_VIDEO. TEXTOS: '+fmt(before.length?before:after);"
NEW_LMC_SV = "return 'SIN_VIDEO: '+fmt(before.length?before:after);"

# ir_al_quiz: quitar la instruccion verbose del return
OLD_QUIZ_R = "return 'QUIZ LISTO ('+total+' preguntas). INSTRUCCIONES: Lee P1 completa con todas sus opciones en voz. Espera que el usuario responda. Cuando recibas [QUIZ] con CORRECTO/INCORRECTO para P1, da feedback breve y lee P2. Y asi hasta el final. Al recibir QUIZ COMPLETO: felicita, lista cada pregunta con si acerto o no. || '+pregs.join(' || ');"
NEW_QUIZ_R = "return 'QUIZ:'+total+'P || '+pregs.join(' || ');"

for old, new in [(OLD_LMC1, NEW_LMC1), (OLD_LMC_SV, NEW_LMC_SV), (OLD_QUIZ_R, NEW_QUIZ_R)]:
    if old in t:
        t = t.replace(old, new, 1)
        print('replaced:', old[:60])
    else:
        print('not found:', old[:60])

io.open(p, 'w', encoding='utf-8').write(t)

# ── Validar JS ──
import subprocess, os
subprocess.run(['node','-e','const fs=require("fs");const h=fs.readFileSync("index.html","utf8");const m=h.match(/<script type="module">([\\s\\S]*?)<\\/script>/);fs.writeFileSync("_w.mjs",m[1]);'],capture_output=True)
r2=subprocess.run(['node','--check','_w.mjs'],capture_output=True,text=True)
print('JS:', 'OK' if r2.returncode==0 else 'ERROR: '+r2.stderr[:300])
try: os.remove('_w.mjs')
except: pass

# ── Prompt: quitar "LEE ESTO EXACTAMENTE" ──
pp = 'victor_system_prompt.md'
tt = io.open(pp, encoding='utf-8').read()

# Reemplazar instrucciones que mencionan el prefijo
replacements = [
    ('→ El tool devuelve: `"LEE ESTO EXACTAMENTE: [texto]"` — lees ese texto tal cual.',
     '→ El tool devuelve el texto exacto del bloque — léelo tal cual, palabra por palabra.'),
    ('El tool devuelve: `"LEE ESTO EXACTAMENTE: [texto del bloque]"`\n→ Lees ESE TEXTO TEXTUALMENTE, palabra por palabra, sin agregar ni cambiar nada.',
     'El tool devuelve el texto exacto del bloque — léelo tal cual, sin agregar ni cambiar nada.'),
    ('"LEE ESTO EXACTAMENTE: [texto]"',
     'el texto exacto del bloque'),
    ('→ Lee el texto exacto que devuelve el tool, palabra por palabra',
     '→ Lee el texto que devuelve el tool, palabra por palabra'),
    ('→ Lee el texto exacto que devuelve el tool',
     '→ Lee el texto que devuelve el tool'),
    ('→ Lees ese texto textualmente, palabra por palabra',
     '→ Lees ese texto, palabra por palabra'),
    ('lees ESE TEXTO TEXTUALMENTE, sin agregar ni cambiar nada.\n→ La animación en pantalla marca cada palabra al mismo ritmo que tu voz (320ms/palabra).',
     'lees ese texto, sin agregar ni cambiar nada.\n→ La animación en pantalla marca cada palabra al mismo ritmo que tu voz.'),
]

changed = 0
for old, new in replacements:
    if old in tt:
        tt = tt.replace(old, new)
        changed += 1

io.open(pp, 'w', encoding='utf-8').write(tt)
print(f'prompt: {changed} reemplazos | len: {len(tt)}')
