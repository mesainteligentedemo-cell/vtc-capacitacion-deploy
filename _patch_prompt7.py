# -*- coding: utf-8 -*-
p='victor_system_prompt.md'; t=open(p,encoding='utf-8').read()
ch=[]

# 1) Reforzar regla critica #1: nada de nombrar emocion en NINGUNA forma
r1='La emoción la transmites con tus palabras y tu tono, NUNCA escrita. Cero corchetes, jamás.'
r1b='La emoción la transmites SOLO con tus palabras y tu tono, NUNCA escrita. Cero corchetes. **Tampoco escribas acotaciones que nombren la emoción o el modo** (—molesto—, —con tono escéptico—, —voz grave—, "con voz firme", "interrumpiendo"): TODO eso el sistema lo LEE EN VOZ ALTA. Nunca nombres ni describas cómo lo dices; solo di la frase.'
if r1 in t: t=t.replace(r1,r1b,1); ch.append('regla#1')

# 2) Reemplazar el bloque de acotaciones con rayas por etiquetas puras
old_an='''- **Anuncia quién habla** antes de cada línea para que se entienda en audio:
  - *—el esposo, recargado en la silla, voz grave y lenta—* "A ver, explícame otra vez por qué..."
  - *—la esposa, interrumpiendo, rápido y agudo—* "Pero amor, ¿y si no lo usamos?"
  - *—el hijo adolescente, arrastrado, sin ver—* "Eso ya lo vi en TikTok, es una estafa."'''
new_an='''- **Para distinguir quién habla NO escribas acotaciones habladas** (se leen en voz alta). Usa SOLO las etiquetas de voz, que ya cambian el timbre del personaje. El enojo, la duda o la prisa van en CÓMO lo dices y en las palabras, jamás descritos:
  - `<Cliente>A ver, explícame otra vez por qué cuesta tanto.</Cliente>`
  - `<Esposa>Pero amor, ¿y si ni lo usamos?</Esposa>`
  - `<Hijo>Eso ya lo vi en TikTok, es una estafa.</Hijo>`'''
if old_an in t: t=t.replace(old_an,new_an,1); ch.append('bloque-anuncia')

# 3) Quitar la instruccion de usar rayas para acotaciones
old_ray='Para una acotación corta usa rayas: —la esposa, molesta—.'
if old_ray in t: t=t.replace(old_ray,'No escribas acotaciones ni describas el modo/emoción: deja que salga en la voz.',1); ch.append('rayas1')
old_ray2='Para una acotación de roleplay usa rayas naturales: —el esposo, molesto— "…".'
if old_ray2 in t: t=t.replace(old_ray2,'No describas el modo ni la emoción; solo di la línea del personaje en su etiqueta.',1); ch.append('rayas2')

open(p,'w',encoding='utf-8').write(t)
print('cambios:',ch)
print('quedan ejemplos de acotacion con tono?:', '—con tono' in t or 'voz grave y lenta' in t or 'la esposa, molesta' in t)