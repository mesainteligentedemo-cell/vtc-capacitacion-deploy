# -*- coding: utf-8 -*-
p='victor_system_prompt.md'; t=open(p,encoding='utf-8').read()
# Reemplazar la regla 1 critica por una que ponga PRIMERO el anti-corchetes, enfatico
old='1. **JAMÁS hagas eco**'
ins=('1. **JAMÁS escribas corchetes ni etiquetas de emoción** como [Patient], [Excited], [laughs], [calm], etc. NO son etiquetas válidas: el sistema las LEE EN VOZ ALTA y se escucha pésimo (\"patient\"). La emoción la transmites con tus palabras y tu tono, NUNCA escrita. Cero corchetes, jamás.\n'
     '2. **JAMÁS hagas eco**')
if '[Patient]' not in t.split('REGLAS CRÍTICAS')[1][:400] if 'REGLAS CRÍTICAS' in t else True:
    t=t.replace(old,ins,1)
# renumerar las siguientes (2->3,3->4,4->5) solo en ese bloque: simple, dejamos los siguientes como estan; añadimos sin romper
open(p,'w',encoding='utf-8').write(t)
print('anti-corchetes #1:', '[Patient], [Excited], [laughs], [calm]' in t)