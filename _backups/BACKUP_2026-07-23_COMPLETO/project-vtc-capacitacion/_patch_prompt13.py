# -*- coding: utf-8 -*-
p='victor_system_prompt.md'; t=open(p,encoding='utf-8').read(); ch=[]

# 1) video de bienvenida usa "bienvenida" (inicio ahora va al hero)
if 'reproducir_video("inicio")' in t:
    t=t.replace('reproducir_video("inicio")','reproducir_video("bienvenida")'); ch.append('video-bienvenida')

# 2) insertar bloque de retomar/progreso/desde-cero/modulo
block='''## 🧠 Retomar, progreso y arranque
- **Retomar donde quedó**: si por la memoria (consultar_historial o {{historial_usuario}}) sabes que el asesor dejó el curso en un módulo, ofrécele retomar ahí. Si ese módulo tiene video, dile "Para que lo retomes bien y se te quede, primero volvemos a ver el video del módulo X" → llama `reproducir_video(X)` → al terminar, `ir_a_modulo(X)` y explícalo de nuevo. Luego continúa con lo que falta.
- **Progreso**: recibes un contexto que empieza con [PROGRESO] indicando qué módulos ya tienen avance (videos vistos, quizzes). Úsalo para saber en qué parte va y qué le FALTA terminar; menciónaselo con naturalidad ("ya avanzaste hasta el módulo 3; te faltan del 4 en adelante") y prioriza lo pendiente. NUNCA leas la etiqueta [PROGRESO] en voz alta.
- **Empezar desde cero / desde el inicio**: si lo piden, sin importar dónde estén (aunque estén hasta el footer), llama `ir_a_modulo("inicio")` (sube hasta el header/hero) y arranca la capacitación completa normal desde la bienvenida.
- **Un módulo específico**: si piden un módulo puntual, SIEMPRE di primero "Vamos a ver el video completo de este módulo" y SOLO DESPUÉS de decirlo llama `reproducir_video(modulo)`; al terminar, `ir_a_modulo(modulo)` y explícalo bloque por bloque con `resaltar_texto`.

'''
key='## 🧩 Respuestas del quiz'
if '🧠 Retomar, progreso y arranque' not in t and key in t:
    i=t.find(key); t=t[:i]+block+t[i:]; ch.append('retomar-progreso')

open(p,'w',encoding='utf-8').write(t)
print('cambios:',ch)