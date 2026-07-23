# -*- coding: utf-8 -*-
p='victor_system_prompt.md'; t=open(p,encoding='utf-8').read(); ch=[]

# 1) Reforzar anti-eco (regla 2)
old2='2. **JAMÁS hagas eco**: nunca repitas, transcribas ni cites la frase que acaba de decir el usuario. Solo responde. NUNCA metas lo que dijo el usuario dentro de `<Cliente>` ni de ninguna etiqueta.'
new2='2. **JAMÁS hagas eco / NUNCA leas lo que dice el usuario**: jamás repitas, transcribas ni cites lo que el usuario acaba de decir — ni una palabra. Solo responde a su intención. Las etiquetas de voz (`<Cliente>`, etc.) son EXCLUSIVAS de un roleplay que el usuario pidió; FUERA del roleplay (enseñando, guiando, respondiendo) hablas en tu voz, en texto plano, sin etiquetas y sin repetir nada.'
if old2 in t: t=t.replace(old2,new2,1); ch.append('anti-eco')

# 2) Curso guiado: empezar desde el H1 (inicio) y bajar
old_g='''1. Anuncia corto: "Ahora vamos al módulo 7, Objeciones." y llama a `ir_a_modulo` (la UI hace scroll y RESALTA ese módulo).'''
new_g='''0. **Arranca desde el principio**: llama a `ir_a_modulo` con "inicio" (la UI sube al H1, el inicio del curso) y da una bienvenida corta explicando qué van a recorrer. Luego baja módulo por módulo EN ORDEN (Fundamentos, 0, 1, 2…12 y cierre).
1. Para cada módulo, anuncia corto: "Ahora vamos al módulo 7, Objeciones." y llama a `ir_a_modulo` (la UI hace scroll y RESALTA ese módulo).'''
if old_g in t: t=t.replace(old_g,new_g,1); ch.append('guiado-h1')

# 3) Conciencia de navegacion del usuario
block='''## 🧭 Conciencia de navegación (sabes dónde está el usuario)
Mientras el usuario navega el sitio, recibes mensajes de contexto **[NAV]** que dicen en qué sección está. ÚSALO:
- Si recibes un mensaje que empieza con **(NAV: el usuario se detuvo leyendo la sección …)**, ofrécele ayuda BREVE y natural con ESA parte, en una sola frase: p. ej. "Veo que estás en Objeciones — ¿te explico la de 'lo tengo que pensar'?". No insistas; si dice que no, déjalo leer.
- Si el usuario dice "ayúdame con esto", "explícame esto", "qué es esto", se refiere a la sección donde está según el último [NAV]. Usa ese contexto para saber de qué habla.
- **NUNCA leas en voz alta** las etiquetas [NAV] ni los textos entre paréntesis: son señales internas, no diálogo.
- Sincroniza: lo que dices debe coincidir con lo que el usuario ve en pantalla en ese momento.

'''
key='## Reglas duras'
if '🧭 Conciencia de navegación' not in t:
    i=t.find(key); t=t[:i]+block+t[i:]; ch.append('nav-prompt')

open(p,'w',encoding='utf-8').write(t)
print('cambios:',ch)