# -*- coding: utf-8 -*-
import io, sys
if hasattr(sys.stdout,'reconfigure'): sys.stdout.reconfigure(encoding='utf-8')

pp = 'victor_system_prompt.md'
tt = io.open(pp, encoding='utf-8').read()
ch = []

# 1) resaltar_texto: de "leer" a "explicar"
pairs = [
    ('lees ese texto tal cual, sin parafrasear, sin agregar nada',
     'explicas ese bloque en 1-2 frases propias, breve — NO lo leas textualmente'),
    ('El karaoke marca cada palabra en pantalla mientras hablas',
     'El marco dorado en el bloque indica al usuario qué estás explicando'),
    ('ANTES de leer cualquier texto del curso',
     'ANTES de explicar cualquier bloque del curso'),
    ('primero el tool, luego lees',
     'primero el tool (marco dorado), luego explicas brevemente'),
    ('→ Lee el texto que devuelve el tool, palabra por palabra',
     '→ El bloque queda en dorado — explícalo en 1-2 frases propias, breve'),
    ('→ Lee el texto que devuelve el tool',
     '→ Explica ese bloque en 1-2 frases propias'),
    ('→ Lees ese texto, palabra por palabra',
     '→ Lo explicas en 1-2 frases propias, breve'),
    ('→ lee todos los textos del hero en orden',
     '→ explica brevemente: qué es VTC, los números clave (16 módulos, 19 pasos, 12 etapas, 11 principios)'),
    ('2. `leer_modulo_completo("bienvenida")` → lee todos los textos del hero (sin video a\xfan)',
     '2. Explica el hero en 2-3 frases: qué es el curso, para quién es, qué van a dominar'),
    ('Sin comentar entre textos — flujo continuo hasta el \xfaltimo texto',
     'Sin pausas largas entre bloques — flujo continuo hasta el \xfaltimo bloque del m\xf3dulo'),
    ('→ Lee el texto que devuelve el tool, palabra por palabra\n→ Sin comentar entre textos — flujo continuo hasta el \xfaltimo texto del m\xf3dulo',
     '→ Explica ese bloque en 1-2 frases propias, breve\n→ Sin pausas largas entre bloques — flujo continuo'),
]
for old, new in pairs:
    if old in tt:
        tt = tt.replace(old, new)
        ch.append('R:'+old[:30])

# 2) Agregar OVERVIEW justo antes del ARRANQUE
anchor = '**ARRANQUE (sin esperar nada):**'
overview = (
    '**OVERVIEW R\xc1PIDO AL INICIO:**\n'
    'Justo despu\xe9s del video de bienvenida, antes de entrar al m\xf3dulo F, da un overview ultra-r\xe1pido de TODOS los m\xf3dulos: 1 frase por m\xf3dulo, fluido y din\xe1mico, como quien vende el curso. '
    '"El m\xf3dulo F son los fundamentos del negocio VTC. El cero trabaja tu mentalidad. El uno te ense\xf1a a calificar bien desde el inicio..." — todos los m\xf3dulos en 60-90 segundos sin detenerte. '
    'Luego dices "vamos al primer m\xf3dulo" y arrancas.\n\n'
)
if anchor in tt and 'OVERVIEW' not in tt:
    tt = tt.replace(anchor, overview + anchor, 1)
    ch.append('overview')

# 3) Agregar regla explicar vs leer al inicio del modo guiado
anchor2 = '### ⚡ REGLA ABSOLUTA: LEE TODO SIN EXCEPCI\xd3N'
new_rule = (
    '### \U0001f4a1 EXPLICA, NO LEAS\n'
    'Cuando uses `resaltar_texto`, el bloque queda resaltado en **marco dorado**. TÚ lo **explicas** en 1-2 frases con tus propias palabras — como maestro, no como lector. '
    'Di la idea clave, da un ejemplo del piso si aplica, y pasa al siguiente bloque. '
    'Nunca leas el texto p\xe1rrafo por p\xe1rrafo; siempre explica. El usuario lee el texto en pantalla; tú lo haces cobrar vida.\n\n'
)
if anchor2 in tt and 'EXPLICA, NO LEAS' not in tt:
    tt = tt.replace(anchor2, new_rule + anchor2, 1)
    ch.append('regla-explicar')

io.open(pp, 'w', encoding='utf-8').write(tt)
print('cambios:', len(ch), ch)
print('len:', len(tt))
# Quick checks
for kw in ['OVERVIEW', 'EXPLICA, NO LEAS', '1-2 frases propias']:
    print(' ', kw+':', kw in tt)
