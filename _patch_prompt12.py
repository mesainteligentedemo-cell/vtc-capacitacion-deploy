# -*- coding: utf-8 -*-
p='victor_system_prompt.md'; t=open(p,encoding='utf-8').read(); ch=[]

b='b. **Explica**: al terminar el video, llama `ir_a_modulo(modulo)` y explica el contenido del módulo con el material real del sitio y tu knowledge base, en piezas cortas, claras y humanas.'
nb='''b. **Explica con highlight sincronizado**: al terminar el video, llama `ir_a_modulo(modulo)`. Explica el módulo BLOQUE POR BLOQUE, de arriba hacia abajo; **a medida que hablas de cada parte, llama `resaltar_texto` con una frase EXACTA de ese bloque** para resaltarlo y bajar suave hacia él. Así el usuario lee justo lo que dices, sin scroll brusco. Nombra y comenta cada sección/título mientras bajas, en orden, con ritmo humano para que alcance a leer.'''
if b in t: t=t.replace(b,nb,1); ch.append('explica-highlight')

c='c. **Quiz**: antes del quiz di "Ahora vamos a hacer un quiz rápido para fijar esto" → llama `ir_al_quiz(modulo)`. ESPERA a que conteste; recibirás "(QUIZ COMPLETO …)" con su puntaje → comenta breve (felicita o corrige los errores) y sigue.'
nc='''c. **Quiz**: antes del quiz di "Ahora vamos a hacer un quiz rápido sobre este módulo" → llama `ir_al_quiz(modulo)` y quédate en silencio mientras contesta. La UI baja sola de una pregunta a la siguiente conforme responde — NO navegues tú durante el quiz. Cuando termine la última, recibirás "(QUIZ COMPLETO …)" con su puntaje → agradécele, comenta breve (felicita o corrige) y sigue.'''
if c in t: t=t.replace(c,nc,1); ch.append('quiz-autoscroll-note')

g='Reglas de oro del modo guiado: habla SIEMPRE antes de moverte; nunca hables encima de un video; lo que dices debe coincidir con lo que se ve; ritmo humano;'
ng='''Reglas de oro del modo guiado: habla SIEMPRE antes de moverte; nunca hables encima de un video; **el scroll es SUAVE y en orden estricto (arriba→abajo, un bloque a la vez), nunca brusco ni saltado**; lo que DICES debe coincidir EXACTAMENTE con el bloque resaltado en pantalla en ese momento (usa resaltar_texto para sincronizar); da tiempo a leer; funciona en cualquier dispositivo, también pantallas chicas; ritmo humano;'''
if g in t: t=t.replace(g,ng,1); ch.append('coord-responsive')

open(p,'w',encoding='utf-8').write(t)
print('cambios:',ch)